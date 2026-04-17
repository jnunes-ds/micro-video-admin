import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import {INestApplication} from "@nestjs/common";
import {AppModule} from "@/app.module";
import {CreateCategoryFixture} from "@/nest-modules/categories/testing/category_fixture";
import {ICategoryRepository} from "@core/category/domain/category.repository";
import {CATEGORY_PROVIDERS} from "@/nest-modules/categories/categories.providers";
import {applyGlobalConfig} from "@/nest-modules/global_config";

describe('CategoriesController (e2e)', () => {
	let app: INestApplication;
	let categoryRepo: ICategoryRepository;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		applyGlobalConfig(app);
		await app.init();

		categoryRepo = app.get<ICategoryRepository>(
			CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide
		);
	});

	describe('/categories (POST)', () => {
		const arrange = CreateCategoryFixture.arrangeForCreate();

		test.each(arrange)('when body is $send_data', async ({ send_data }) => {
			const res = await request(app.getHttpServer())
				.post('/categories')
				.send(send_data)
				.expect(201);

			const keysInReponse = CreateCategoryFixture.keysInResponse;
			expect(Object.keys(res.body)).toStrictEqual(['data']);
			expect(Object.keys(res.body.data)).toStrictEqual(keysInReponse);

			// const presenter = await controller.create(send_data);
			// const entity = await categoryRepo.findById(new Uuid(presenter.id));
			// expect(entity.toJSON()).toStrictEqual({
			// 	category_id: presenter.id,
			// 	created_at: presenter.created_at,
			// 	...expected
			// });
			// const output = CategoryOutputMapper.toOutput(entity);
			// expect(presenter).toEqual(new CategoryPresenter(output));
		})
	});


	// beforeEach(async () => {
	// 	const moduleFixture: TestingModule = await Test.createTestingModule({
	// 		imports: [AppModule],
	// 	}).compile();
	//
	// 	app = moduleFixture.createNestApplication();
	// 	await app.init();
	// });
	//
	// it('/ (GET)', () => {
	// 	return request(app.getHttpServer())
	// 		.get('/')
	// 		.expect(200)
	// 		.expect('Hello World!');
	// });
});
