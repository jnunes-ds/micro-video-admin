import request from 'supertest';
import {instanceToPlain} from 'class-transformer';
import {ICategoryRepository} from '@/core/category/domain/category.repository';
import {CategoryOutputMapper} from '@/core/category/application/usecases/common/category_output';
import {startApp} from "@/nest-modules/shared/testing/helpers/start_app.helper";
import {Category} from "@core/category/domain/category.entity";
import {GetCategoryFixture} from "@/nest-modules/categories/testing/category_fixture";
import {CategoriesController} from "@/nest-modules/categories/categories.controller";
import {CATEGORY_PROVIDERS} from "@/nest-modules/categories/categories.providers";
import {HttpStatus} from "@nestjs/common";

describe('CategoriesController (e2e)', () => {
	const nestApp = startApp();
	describe('/categories/:id (GET)', () => {
		describe('should a response error when id is invalid or not found', () => {
			const arrange = [
				{
					id: '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
					expected: {
						message:
							'Category Not found using ID 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
						statusCode: HttpStatus.NOT_FOUND,
						error: 'Not Found',
					},
				},
				{
					id: 'fake id',
					expected: {
						statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
						message: 'Validation failed (uuid is expected)',
						error: 'Unprocessable Entity',
					},
				},
			];

			test.each(arrange)('when id is $id', async ({ id, expected }) => {
				return request(nestApp.app.getHttpServer())
					.get(`/categories/${id}`)
					.expect(expected.statusCode)
					.expect(expected);
			});
		});

		it('should return a category ', async () => {
			const categoryRepo = nestApp.app.get<ICategoryRepository>(
				CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
			);
			const category = Category.fake().aCategory().build();
			await categoryRepo.insert(category);

			const res = await request(nestApp.app.getHttpServer())
				.get(`/categories/${category.category_id.id}`)
				.expect(HttpStatus.OK);
			const keyInResponse = GetCategoryFixture.keysInResponse;
			expect(Object.keys(res.body)).toStrictEqual(['data']);
			expect(Object.keys(res.body.data)).toStrictEqual(keyInResponse);

			const presenter = CategoriesController.serialize(
				CategoryOutputMapper.toOutput(category),
			);
			const serialized = instanceToPlain(presenter);
			expect(res.body.data).toStrictEqual(serialized);
		});
	});
});
