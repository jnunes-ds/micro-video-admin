import request from 'supertest';
import {CreateCategoryFixture} from "@/nest-modules/categories/testing/category_fixture";
import {ICategoryRepository} from "@core/category/domain/category.repository";
import {CATEGORY_PROVIDERS} from "@/nest-modules/categories/categories.providers";
import {startApp} from "@/nest-modules/shared/testing/helpers/start_app.helper";
import {Uuid} from "@core/@shared/domain/value_objects/uuid.vo";
import {CategoriesController} from "@/nest-modules/categories/categories.controller";
import {CategoryOutputMapper} from "@core/category/application/usecases/common/category_output";
import {instanceToPlain} from "class-transformer";
import {HttpStatus} from "@nestjs/common";

describe('CategoriesController (e2e)', () => {
	const appHelper = startApp();
	let categoryRepo: ICategoryRepository;

	beforeEach(async () => {
		categoryRepo = appHelper.app.get<ICategoryRepository>(
			CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide
		);
	});

	describe('/categories (POST)', () => {

		describe('should return a response error with status code 422 when throw EntityValidationError', () => {
			const invalidRequests = CreateCategoryFixture.arrangeForEntityValidationError();

			const arrange = Object.keys(invalidRequests).map(
				key => ({
					label: key,
					value: invalidRequests[key]
				})
			)

			test.each(arrange)('when body is $label', ({ value }) => {
				return request(appHelper.app.getHttpServer())
					.post('/categories')
					.send(value.send_data)
					.expect(HttpStatus.UNPROCESSABLE_ENTITY)
					.expect(value.expected);
			});

		});

		describe('should return a response error with status code 422 when request body is invalid', () => {
			const invalidRequests = CreateCategoryFixture.arrangeForInvalidRequests();

			const arrange = Object.keys(invalidRequests).map(
				key => ({
					label: key,
					value: invalidRequests[key]
				})
			)

			test.each(arrange)('when body is $label', ({ value }) => {
				return request(appHelper.app.getHttpServer())
					.post('/categories')
					.send(value.send_data)
					.expect(HttpStatus.UNPROCESSABLE_ENTITY)
					.expect(value.expected);
			});

		});

		describe('should create a category', () => {
			const arrange = CreateCategoryFixture.arrangeForCreate();

			test.each(arrange)('when body is $send_data', async ({ send_data, expected }) => {
				const res = await request(appHelper.app.getHttpServer())
					.post('/categories')
					.send(send_data)
					.expect(HttpStatus.CREATED);

				const keysInReponse = CreateCategoryFixture.keysInResponse;
				expect(Object.keys(res.body)).toStrictEqual(['data']);
				expect(Object.keys(res.body.data)).toStrictEqual(keysInReponse);
				const id = res.body.data.id;
				const createdCategory = await categoryRepo.findById(new Uuid(id));

				const presenter = CategoriesController.serialize(
					CategoryOutputMapper.toOutput(createdCategory)
				);
				const serialized = instanceToPlain(presenter);

				expect(res.body.data).toStrictEqual({
					id: serialized.id,
					created_at: serialized.created_at,
					...expected
				});
			})
		});

	});
});
