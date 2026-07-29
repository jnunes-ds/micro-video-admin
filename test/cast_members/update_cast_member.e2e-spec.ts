import request from 'supertest';
import {instanceToPlain} from 'class-transformer';
import {HttpStatus} from '@nestjs/common';
import {startApp} from '@/nest-modules/shared/testing/helpers/start_app.helper';
import {CastMembersController} from '@/nest-modules/cast_members/cast_members.controller';
import {CAST_MEMBER_PROVIDERS} from '@/nest-modules/cast_members/cast_members.providers';
import {UpdateCastMemberFixture} from '@/nest-modules/cast_members/testing/cast_member_fixture';
import {ICastMemberRepository} from '@core/cast_member/domain/cast_member.repository';
import {CastMember, CastMemberId} from '@core/cast_member/domain/cast_member.aggregate';
import {CastMemberOutputMapper} from '@core/cast_member/application/usecases/common/cast_member_output';

describe('CastMembersController (e2e)', () => {
	const uuid = '9366b7dc-2d71-4799-b91c-c64adb205104';

	describe('/cast-members/:id (PATCH)', () => {
		describe('should a response error when id is invalid or not found', () => {
			const nestApp = startApp();
			const faker = CastMember.fake().anActor();

			const arrange = [
				{
					id: '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
					send_data: {name: faker.name},
					expected: {
						statusCode: HttpStatus.NOT_FOUND,
						error: 'Not Found',
						message: 'CastMember Not found using ID 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
					},
				},
				{
					id: 'fake id',
					send_data: {name: faker.name},
					expected: {
						statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
						error: 'Unprocessable Entity',
						message: 'Validation failed (uuid is expected)',
					},
				},
				{
					id: '123',
					send_data: {name: faker.name},
					expected: {
						statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
						error: 'Unprocessable Entity',
						message: 'Validation failed (uuid is expected)',
					},
				},
			];

			// Nota: o 404 acima chega pelo `CastMemberSequelizeRepository.findById`, que
			// lança `NotFoundError` em vez de retornar `null` (§3.1 do plano). O
			// `if (!castMember) throw new NotFoundError(...)` do usecase é código morto
			// no caminho Sequelize. A mensagem HTTP coincide, então o teste passa mesmo assim.
			test.each(arrange)('when id is $id', async ({id, send_data, expected}) => {
				return request(nestApp.app.getHttpServer())
					.patch(`/cast-members/${id}`)
					.send(send_data)
					.expect(expected.statusCode)
					.expect(expected);
			});
		});

		describe('should a response error with 422 when request body is invalid', () => {
			const app = startApp();
			const invalidRequest = UpdateCastMemberFixture.arrangeInvalidRequest();
			const arrange = Object.keys(invalidRequest).map((key) => ({
				label: key,
				value: invalidRequest[key],
			}));

			test.each(arrange)('when body is $label', ({value}) => {
				return request(app.app.getHttpServer())
					.patch(`/cast-members/${uuid}`)
					.send(value.send_data)
					.expect(HttpStatus.UNPROCESSABLE_ENTITY)
					.expect(value.expected);
			});
		});

		describe('should a response error with 422 when throw EntityValidationError', () => {
			const app = startApp();
			const validationError = UpdateCastMemberFixture.arrangeForEntityValidationError();
			const arrange = Object.keys(validationError).map((key) => ({
				label: key,
				value: validationError[key],
			}));
			let castMemberRepo: ICastMemberRepository;

			beforeEach(() => {
				castMemberRepo = app.app.get<ICastMemberRepository>(
					CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
				);
			});

			test.each(arrange)('when body is $label', async ({value}) => {
				const castMember = CastMember.fake().anActor().build();
				await castMemberRepo.insert(castMember);
				return request(app.app.getHttpServer())
					.patch(`/cast-members/${castMember.cast_member_id.id}`)
					.send(value.send_data)
					.expect(HttpStatus.UNPROCESSABLE_ENTITY)
					.expect(value.expected);
			});
		});

		describe('should update a cast member', () => {
			const appHelper = startApp();
			const arrange = UpdateCastMemberFixture.arrangeForUpdate();
			let castMemberRepo: ICastMemberRepository;

			beforeEach(async () => {
				castMemberRepo = appHelper.app.get<ICastMemberRepository>(
					CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
				);
			});

			test.each(arrange)('when body is $send_data', async ({send_data, expected}) => {
				const created = CastMember.fake().anActor().build();
				await castMemberRepo.insert(created);

				const res = await request(appHelper.app.getHttpServer())
					.patch(`/cast-members/${created.cast_member_id.id}`)
					.send(send_data)
					.expect(HttpStatus.OK);

				expect(Object.keys(res.body)).toStrictEqual(['data']);
				expect(Object.keys(res.body.data)).toStrictEqual(
					UpdateCastMemberFixture.keysInResponse,
				);

				const updated = await castMemberRepo.findById(
					new CastMemberId(res.body.data.cast_member_id),
				);

				const presenter = CastMembersController.serialize(
					CastMemberOutputMapper.toOutput(updated!),
				);
				const serialized = instanceToPlain(presenter);

				expect(res.body.data).toStrictEqual(serialized);
				expect(res.body.data).toStrictEqual({
					cast_member_id: serialized.cast_member_id,
					created_at: serialized.created_at,
					name: 'name' in expected ? expected.name : updated!.name,
					type: 'type' in expected ? expected.type : updated!.type.type,
				});
				expect(res.body.data.created_at).toBe(created.created_at.toISOString());
			});
		});

		describe('no-op and edge cases', () => {
			const appHelper = startApp();
			let castMemberRepo: ICastMemberRepository;

			beforeEach(() => {
				castMemberRepo = appHelper.app.get<ICastMemberRepository>(
					CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
				);
			});

			// Bug não previsto no plano original: `name: ''`, `name: null`,
			// `type: null` e `type: 0` são todos falsy, então o usecase nunca chama
			// `changeName`/`changeType` — a entidade permanece idêntica à que já
			// está no banco. `CastMemberSequelizeRepository.update` então executa
			// um UPDATE com os mesmos valores e verifica `affectedRows !== 1`. O
			// driver mysql2 reporta *linhas alteradas*, não *linhas casadas pelo
			// WHERE*; um UPDATE que não muda nada retorna `affectedRows === 0`, o
			// que dispara um `NotFoundError` (404) espúrio em vez do 200 no-op
			// esperado.
			describe('no-op updates currently return 404 instead of a no-op 200 (see bug ref above)', () => {
				const arrange = [
					{
						label: 'empty name',
						base: () => CastMember.fake().anActor().withName('Original').build(),
						send_data: {name: ''},
					},
					{
						label: 'null name',
						base: () => CastMember.fake().anActor().withName('Original').build(),
						send_data: {name: null},
					},
					{
						label: 'null type',
						base: () => CastMember.fake().aDirector().build(),
						send_data: {type: null},
					},
					{
						label: 'type: 0 (falsy, never reaches changeType)',
						base: () => CastMember.fake().aDirector().build(),
						send_data: {type: 0},
					},
				];

				test.each(arrange)('when body is $label', async ({base, send_data}) => {
					const created = base();
					await castMemberRepo.insert(created);

					await request(appHelper.app.getHttpServer())
						.patch(`/cast-members/${created.cast_member_id.id}`)
						.send(send_data)
						.expect(HttpStatus.NOT_FOUND);
				});
			});

			it.skip('should treat a body that changes nothing as a 200 no-op (desired behavior - see bug ref above)', async () => {
				const created = CastMember.fake().anActor().withName('Original').build();
				await castMemberRepo.insert(created);

				const res = await request(appHelper.app.getHttpServer())
					.patch(`/cast-members/${created.cast_member_id.id}`)
					.send({name: ''})
					.expect(HttpStatus.OK);

				expect(res.body.data.name).toBe('Original');
			});

			// Documenta um bug conhecido (§3.2 do plano): `changeType` chama o
			// construtor de `CastMemberType` diretamente, que lança
			// `InvalidCastMemberTypeError` sem passar por uma notification. Não há
			// filtro registrado para esse erro, então a resposta hoje é 500, não
			// 422. Marcado como `skip` porque documenta o comportamento desejado,
			// não o atual — ver o teste seguinte para o comportamento atual.
			it.skip('should return 422 when type is invalid (desired behavior, currently 500 - see bug ref)', async () => {
				const created = CastMember.fake().anActor().build();
				await castMemberRepo.insert(created);

				return request(appHelper.app.getHttpServer())
					.patch(`/cast-members/${created.cast_member_id.id}`)
					.send({type: 3})
					.expect(HttpStatus.UNPROCESSABLE_ENTITY)
					.expect({
						statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
						error: 'Unprocessable Entity',
						message: ['Invalid cast member type: 3'],
					});
			});

			it('should return 500 when type is invalid (current behavior - see bug ref in plan §3.2)', async () => {
				const created = CastMember.fake().anActor().build();
				await castMemberRepo.insert(created);

				await request(appHelper.app.getHttpServer())
					.patch(`/cast-members/${created.cast_member_id.id}`)
					.send({type: 3})
					.expect(HttpStatus.INTERNAL_SERVER_ERROR);
			});

			// Confirma o bug descrito no plano (Passo 5.6): sem `whitelist` no
			// `ValidationPipe`, um `cast_member_id` extra no corpo sobrevive no DTO
			// transformado, e o spread `{cast_member_id: id, ...dto}` do controller
			// o coloca DEPOIS — sobrescrevendo o id da rota. O registro da URL não é
			// tocado; quem é atualizado é o registro cujo id foi enviado no corpo.
			it('lets a cast_member_id in the body override the route id (known bug)', async () => {
				const routeTarget = CastMember.fake().anActor().withName('Original').build();
				const bodyTarget = CastMember.fake().anActor().withName('Other').build();
				await castMemberRepo.bulkInsert([routeTarget, bodyTarget]);

				await request(appHelper.app.getHttpServer())
					.patch(`/cast-members/${routeTarget.cast_member_id.id}`)
					.send({cast_member_id: bodyTarget.cast_member_id.id, name: 'x'})
					.expect(HttpStatus.OK);

				const routeTargetAfter = await castMemberRepo.findById(routeTarget.cast_member_id);
				const bodyTargetAfter = await castMemberRepo.findById(bodyTarget.cast_member_id);

				expect(routeTargetAfter!.name).toBe('Original');
				expect(bodyTargetAfter!.name).toBe('x');
			});
		});
	});
});
