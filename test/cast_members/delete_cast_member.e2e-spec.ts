import request from 'supertest';
import {HttpStatus} from '@nestjs/common';
import {startApp} from '@/nest-modules/shared/testing/helpers/start_app.helper';
import {CAST_MEMBER_PROVIDERS} from '@/nest-modules/cast_members/cast_members.providers';
import {ICastMemberRepository} from '@core/cast_member/domain/cast_member.repository';
import {CastMember} from '@core/cast_member/domain/cast_member.aggregate';

describe('CastMembersController (e2e)', () => {
	describe('/cast-members/:id (DELETE)', () => {
		const appHelper = startApp();
		let castMemberRepo: ICastMemberRepository;

		beforeEach(() => {
			castMemberRepo = appHelper.app.get<ICastMemberRepository>(
				CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
			);
		});

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
			];

			test.each(arrange)('when id is $id', async ({id, expected}) => {
				return request(appHelper.app.getHttpServer())
					.delete(`/cast-members/${id}`)
					.expect(expected.statusCode)
					.expect(expected);
			});
		});

		it('should delete a cast member and respond with status 204', async () => {
			const castMember = CastMember.fake().anActor().build();
			await castMemberRepo.insert(castMember);

			await request(appHelper.app.getHttpServer())
				.delete(`/cast-members/${castMember.cast_member_id.id}`)
				.expect(HttpStatus.NO_CONTENT);

			await request(appHelper.app.getHttpServer())
				.get(`/cast-members/${castMember.cast_member_id.id}`)
				.expect(HttpStatus.NOT_FOUND);

			expect(await castMemberRepo.findAll()).toHaveLength(0);
		});

		it('should respond with an empty body', async () => {
			const castMember = CastMember.fake().anActor().build();
			await castMemberRepo.insert(castMember);

			const res = await request(appHelper.app.getHttpServer())
				.delete(`/cast-members/${castMember.cast_member_id.id}`)
				.expect(HttpStatus.NO_CONTENT);

			expect(res.body).toEqual({});
			expect(res.text).toBe('');
		});

		it('should delete only the target cast member', async () => {
			const castMembers = CastMember.fake().theCastMembers(3).build();
			await castMemberRepo.bulkInsert(castMembers);
			const [first, second, third] = castMembers;

			await request(appHelper.app.getHttpServer())
				.delete(`/cast-members/${second.cast_member_id.id}`)
				.expect(HttpStatus.NO_CONTENT);

			const remaining = await castMemberRepo.findAll();
			expect(remaining).toHaveLength(2);
			expect(remaining.map((c) => c.cast_member_id.id).sort()).toStrictEqual(
				[first.cast_member_id.id, third.cast_member_id.id].sort(),
			);
		});

		it('should return 404 when deleting the same id twice', async () => {
			const castMember = CastMember.fake().anActor().build();
			await castMemberRepo.insert(castMember);

			await request(appHelper.app.getHttpServer())
				.delete(`/cast-members/${castMember.cast_member_id.id}`)
				.expect(HttpStatus.NO_CONTENT);

			await request(appHelper.app.getHttpServer())
				.delete(`/cast-members/${castMember.cast_member_id.id}`)
				.expect(HttpStatus.NOT_FOUND)
				.expect({
					statusCode: HttpStatus.NOT_FOUND,
					error: 'Not Found',
					message: `CastMember Not found using ID ${castMember.cast_member_id.id}`,
				});
		});

		it('should not appear in the listing after deletion', async () => {
			const castMembers = CastMember.fake().theCastMembers(2).build();
			await castMemberRepo.bulkInsert(castMembers);
			const [first, second] = castMembers;

			await request(appHelper.app.getHttpServer())
				.delete(`/cast-members/${first.cast_member_id.id}`)
				.expect(HttpStatus.NO_CONTENT);

			const res = await request(appHelper.app.getHttpServer())
				.get('/cast-members')
				.expect(HttpStatus.OK);

			expect(res.body.meta.total).toBe(1);
			expect(res.body.data).toHaveLength(1);
			expect(res.body.data[0].cast_member_id).toBe(second.cast_member_id.id);
		});

		describe('should delete regardless of cast member type', () => {
			const arrange = [
				{label: 'actor', builder: () => CastMember.fake().anActor().build()},
				{label: 'director', builder: () => CastMember.fake().aDirector().build()},
			];

			test.each(arrange)('when cast member is $label', async ({builder}) => {
				const castMember = builder();
				await castMemberRepo.insert(castMember);

				await request(appHelper.app.getHttpServer())
					.delete(`/cast-members/${castMember.cast_member_id.id}`)
					.expect(HttpStatus.NO_CONTENT);

				expect(await castMemberRepo.findAll()).toHaveLength(0);
			});
		});
	});
});
