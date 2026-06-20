import request from 'supertest';
import { instanceToPlain } from 'class-transformer';
import { ICategoryRepository } from '@/core/category/domain/category.repository';
import {startApp} from "@/nest-modules/shared/testing/helpers/start_app.helper";
import {ListCategoriesFixture} from "@/nest-modules/categories/testing/category_fixture";
import {CATEGORY_PROVIDERS} from "@/nest-modules/categories/categories.providers";
import {CategoriesController} from "@/nest-modules/categories/categories.controller";
import {CategoryOutputMapper} from "@core/category/application/usecases/common/category_output";
import {HttpStatus} from "@nestjs/common";

describe('CategoriesController (e2e)', () => {
	describe('/categories (GET)', () => {
		describe('should return categories sorted by created_at when request query is empty', () => {
			let categoryRepo: ICategoryRepository;
			const nestApp = startApp();
			const { entitiesMap, arrange } =
				ListCategoriesFixture.arrangeIncrementedWithCreatedAt();

			beforeEach(async () => {
				categoryRepo = nestApp.app.get<ICategoryRepository>(
					CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
				);
				await categoryRepo.bulkInsert(Object.values(entitiesMap));
			});

			test.each(arrange)(
				'when query params is $send_data',
				async ({ send_data, expected }) => {
					const queryParams = new URLSearchParams(send_data as any).toString();
					return request(nestApp.app.getHttpServer())
						.get(`/categories/?${queryParams}`)
						.expect(HttpStatus.OK)
						.expect({
							data: expected.entities.map((e) =>
								instanceToPlain(
									CategoriesController.serialize(
										CategoryOutputMapper.toOutput(e),
									),
								),
							),
							meta: expected.meta,
						});
				},
			);
		});

		describe('should return categories using paginate, filter and sort', () => {
			let categoryRepo: ICategoryRepository;
			const nestApp = startApp();
			const { entitiesMap, arrange } = ListCategoriesFixture.arrangeUnsorted();

			beforeEach(async () => {
				categoryRepo = nestApp.app.get<ICategoryRepository>(
					CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
				);
				await categoryRepo.bulkInsert(Object.values(entitiesMap));
			});

			test.each([arrange])(
				'when query params is $send_data',
				async ({ send_data, expected }) => {
					const queryParams = new URLSearchParams(send_data as any).toString();
					return request(nestApp.app.getHttpServer())
						.get(`/categories/?${queryParams}`)
						.expect(HttpStatus.OK)
						.expect({
							data: expected.entities.map((e) =>
								instanceToPlain(
									CategoriesController.serialize(
										CategoryOutputMapper.toOutput(e),
									),
								),
							),
							meta: expected.meta,
						});
				},
			);
		});
	});
});
