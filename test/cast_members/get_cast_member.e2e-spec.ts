import request from 'supertest';
import {instanceToPlain} from 'class-transformer';
import {HttpStatus} from '@nestjs/common';
import {startApp} from '@/nest-modules/shared/testing/helpers/start_app.helper';
import {CastMembersController} from '@/nest-modules/cast_members/cast_members.controller';
import {CAST_MEMBER_PROVIDERS} from '@/nest-modules/cast_members/cast_members.providers';
import {GetCastMemberFixture} from '@/nest-modules/cast_members/testing/cast_member_fixture';
import {ICastMemberRepository} from '@core/cast_member/domain/cast_member.repository';
import {CastMember} from '@core/cast_member/domain/cast_member.aggregate';
import {CastMemberOutputMapper} from '@core/cast_member/application/usecases/common/cast_member_output';
import {CastMemberTypes} from '@core/cast_member/domain/cast-member-type.vo';

describe('CastMembersController (e2e)', () => {
	const nestApp = startApp();

	describe('/cast-members/:id (GET)', () => {
		describe('should a response error when id is invalid or not found', () => {
			const arrange = [
				{
					id: '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
					expected: {
						statusCode: HttpStatus.NOT_FOUND,
						error: 'Not Found',
						message: 'CastMember Not found using ID 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
					},
				},
				{
					id: 'fake id',
					expected: {
						statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
						error: 'Unprocessable Entity',
						message: 'Validation failed (uuid is expected)',
					},
				},
				{
					id: '123',
					expected: {
						statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
						error: 'Unprocessable Entity',
						message: 'Validation failed (uuid is expected)',
					},
				},
				{
					id: '9366b7dc-2d71-4799-b91c-c64adb20510',
					expected: {
						statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
						error: 'Unprocessable Entity',
						message: 'Validation failed (uuid is expected)',
					},
				},
			];

			test.each(arrange)('when id is $id', async ({id, expected}) => {
				return request(nestApp.app.getHttpServer())
					.get(`/cast-members/${id}`)
					.expect(expected.statusCode)
					.expect(expected);
			});
		});

		it('should return a cast member', async () => {
			const castMemberRepo = nestApp.app.get<ICastMemberRepository>(
				CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
			);
			const castMember = CastMember.fake().anActor().build();
			await castMemberRepo.insert(castMember);

			const res = await request(nestApp.app.getHttpServer())
				.get(`/cast-members/${castMember.cast_member_id.id}`)
				.expect(HttpStatus.OK);

			expect(Object.keys(res.body)).toStrictEqual(['data']);
			expect(Object.keys(res.body.data)).toStrictEqual(
				GetCastMemberFixture.keysInResponse,
			);

			const serialized = instanceToPlain(
				CastMembersController.serialize(CastMemberOutputMapper.toOutput(castMember)),
			);
			expect(res.body.data).toStrictEqual(serialized);
		});

		describe('should return the right type for each cast member', () => {
			const arrange = [
				{
					builder: () => CastMember.fake().anActor().build(),
					expectedType: CastMemberTypes.ACTOR,
				},
				{
					builder: () => CastMember.fake().aDirector().build(),
					expectedType: CastMemberTypes.DIRECTOR,
				},
			];

			test.each(arrange)('when cast member type is $expectedType', async ({builder, expectedType}) => {
				const castMemberRepo = nestApp.app.get<ICastMemberRepository>(
					CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
				);
				const castMember = builder();
				await castMemberRepo.insert(castMember);

				const res = await request(nestApp.app.getHttpServer())
					.get(`/cast-members/${castMember.cast_member_id.id}`)
					.expect(HttpStatus.OK);

				expect(res.body.data.type).toBe(expectedType);
			});
		});

		describe('response contract assertions', () => {
			let castMemberRepo: ICastMemberRepository;
			let castMember: CastMember;

			beforeEach(async () => {
				castMemberRepo = nestApp.app.get<ICastMemberRepository>(
					CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
				);
				castMember = CastMember.fake().anActor().build();
				await castMemberRepo.insert(castMember);
			});

			it('should return created_at as an ISO-8601 string', async () => {
				const res = await request(nestApp.app.getHttpServer())
					.get(`/cast-members/${castMember.cast_member_id.id}`)
					.expect(HttpStatus.OK);

				expect(res.body.data.created_at).toBe(castMember.created_at.toISOString());
			});

			it('should return type as a number', async () => {
				const res = await request(nestApp.app.getHttpServer())
					.get(`/cast-members/${castMember.cast_member_id.id}`)
					.expect(HttpStatus.OK);

				expect(typeof res.body.data.type).toBe('number');
			});

			it('should not expose an id property', async () => {
				const res = await request(nestApp.app.getHttpServer())
					.get(`/cast-members/${castMember.cast_member_id.id}`)
					.expect(HttpStatus.OK);

				expect(res.body.data).not.toHaveProperty('id');
			});

			it('should not change the record on GET', async () => {
				await request(nestApp.app.getHttpServer())
					.get(`/cast-members/${castMember.cast_member_id.id}`)
					.expect(HttpStatus.OK);

				const reloaded = await castMemberRepo.findById(castMember.cast_member_id);
				expect(reloaded!.toJSON()).toStrictEqual(castMember.toJSON());
			});
		});

		it('should return the right cast member when several exist', async () => {
			const castMemberRepo = nestApp.app.get<ICastMemberRepository>(
				CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
			);
			const castMembers = CastMember.fake().theCastMembers(3).build();
			await castMemberRepo.bulkInsert(castMembers);

			const target = castMembers[1];
			const res = await request(nestApp.app.getHttpServer())
				.get(`/cast-members/${target.cast_member_id.id}`)
				.expect(HttpStatus.OK);

			expect(res.body.data.name).toBe(target.name);
			expect(res.body.data.type).toBe(target.type.type);
		});
	});
});
