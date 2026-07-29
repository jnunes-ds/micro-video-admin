import request from 'supertest';
import {HttpStatus} from '@nestjs/common';
import {instanceToPlain} from 'class-transformer';
import {startApp} from '@/nest-modules/shared/testing/helpers/start_app.helper';
import {CastMembersController} from '@/nest-modules/cast_members/cast_members.controller';
import {CAST_MEMBER_PROVIDERS} from '@/nest-modules/cast_members/cast_members.providers';
import {CreateCastMemberFixture} from '@/nest-modules/cast_members/testing/cast_member_fixture';
import {ICastMemberRepository} from '@core/cast_member/domain/cast_member.repository';
import {CastMemberId} from '@core/cast_member/domain/cast_member.aggregate';
import {CastMemberOutputMapper} from '@core/cast_member/application/usecases/common/cast_member_output';

describe('CastMembersController (e2e)', () => {
	const appHelper = startApp();
	let castMemberRepo: ICastMemberRepository;

	beforeEach(async () => {
		castMemberRepo = appHelper.app.get<ICastMemberRepository>(
			CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
		);
	});

	describe('/cast-members (POST)', () => {
		describe('should return a response error with status code 422 when request body is invalid', () => {
			const invalidRequests = CreateCastMemberFixture.arrangeInvalidRequest();

			const arrange = Object.keys(invalidRequests).map((key) => ({
				label: key,
				value: invalidRequests[key],
			}));

			test.each(arrange)('when body is $label', ({value}) => {
				return request(appHelper.app.getHttpServer())
					.post('/cast-members')
					.send(value.send_data)
					.expect(HttpStatus.UNPROCESSABLE_ENTITY)
					.expect(value.expected);
			});
		});

		describe('should return a response error with status code 422 when throw EntityValidationError', () => {
			const invalidRequests = CreateCastMemberFixture.arrangeForEntityValidationError();

			const arrange = Object.keys(invalidRequests).map((key) => ({
				label: key,
				value: invalidRequests[key],
			}));

			test.each(arrange)('when body is $label', ({value}) => {
				return request(appHelper.app.getHttpServer())
					.post('/cast-members')
					.send(value.send_data)
					.expect(HttpStatus.UNPROCESSABLE_ENTITY)
					.expect(value.expected);
			});
		});

		describe('should create a cast member', () => {
			const arrange = CreateCastMemberFixture.arrangeForCreate();

			test.each(arrange)('when body is $send_data', async ({send_data, expected}) => {
				const res = await request(appHelper.app.getHttpServer())
					.post('/cast-members')
					.send(send_data)
					.expect(HttpStatus.CREATED);

				const keysInResponse = CreateCastMemberFixture.keysInResponse;
				expect(Object.keys(res.body)).toStrictEqual(['data']);
				expect(Object.keys(res.body.data)).toStrictEqual(keysInResponse);

				const created = await castMemberRepo.findById(
					new CastMemberId(res.body.data.cast_member_id),
				);

				const presenter = CastMembersController.serialize(
					CastMemberOutputMapper.toOutput(created!),
				);
				const serialized = instanceToPlain(presenter);

				expect(res.body.data).toStrictEqual(serialized);
				expect(res.body.data).toStrictEqual({
					cast_member_id: serialized.cast_member_id,
					created_at: serialized.created_at,
					...expected,
				});
			});
		});

		describe('response contract assertions', () => {
			it('should return created_at as an ISO-8601 string', async () => {
				const res = await request(appHelper.app.getHttpServer())
					.post('/cast-members')
					.send({name: 'John Doe', type: 2})
					.expect(HttpStatus.CREATED);

				expect(res.body.data.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
				expect(new Date(res.body.data.created_at).toString()).not.toBe(
					'Invalid Date',
				);
			});

			it('should return a valid cast_member_id', async () => {
				const res = await request(appHelper.app.getHttpServer())
					.post('/cast-members')
					.send({name: 'John Doe', type: 2})
					.expect(HttpStatus.CREATED);

				expect(() => new CastMemberId(res.body.data.cast_member_id)).not.toThrow();
			});

			it('should ignore extra fields that are not part of the domain', async () => {
				const res = await request(appHelper.app.getHttpServer())
					.post('/cast-members')
					.send({name: 'x', type: 2, unknown_field: 'whatever'})
					.expect(HttpStatus.CREATED);

				expect(Object.keys(res.body.data)).toStrictEqual(
					CreateCastMemberFixture.keysInResponse,
				);
			});

			// Documenta um bug conhecido: o `ValidationPipe` global não usa
			// `whitelist`/`forbidNonWhitelisted`, então campos com o mesmo nome de
			// propriedades do domínio (`cast_member_id`, `created_at`) sobrevivem no
			// DTO e são espalhados para `CastMember.create({...input, type})`.
			// `cast_member_id` chega como string crua (não `CastMemberId`), e o
			// `insert` tenta persistir um registro com PK inválida — a request
			// quebra com 500 em vez de simplesmente ignorar os campos.
			it('should crash with 500 when the body includes domain-shaped fields like cast_member_id/created_at', async () => {
				await request(appHelper.app.getHttpServer())
					.post('/cast-members')
					.send({
						name: 'x',
						type: 2,
						cast_member_id: '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
						created_at: '2020-01-01',
					})
					.expect(HttpStatus.INTERNAL_SERVER_ERROR);
			});

			it('should create two cast members with the same name and different ids', async () => {
				const send_data = {name: 'John Doe', type: 2};

				const res1 = await request(appHelper.app.getHttpServer())
					.post('/cast-members')
					.send(send_data)
					.expect(HttpStatus.CREATED);

				const res2 = await request(appHelper.app.getHttpServer())
					.post('/cast-members')
					.send(send_data)
					.expect(HttpStatus.CREATED);

				expect(res1.body.data.cast_member_id).not.toBe(res2.body.data.cast_member_id);
			});
		});
	});
});
