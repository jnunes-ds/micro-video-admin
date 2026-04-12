import {CategoriesController} from "@/nest-modules/categories/categories.controller";
import {ICategoryRepository} from "@core/category/domain/category.repository";
import {Test, TestingModule} from "@nestjs/testing";
import {ConfigModule} from "@/nest-modules/config/config.module";
import {DatabaseModule} from "@/nest-modules/database/database.module";
import {CategoriesModule} from "@/nest-modules/categories/categories.module";
import {CATEGORY_PROVIDERS} from "@/nest-modules/categories/categories.providers";
import {CreatecategoryUsecase} from "@core/category/application/usecases/create_category/create_category.usecase";
import {UpdateCategoryUsecase} from "@core/category/application/usecases/update_category/update_category.usecase";
import {DeleteCategoryUsecase} from "@core/category/application/usecases/delete_category/delete_category.usecase";
import {GetCategoryUsecase} from "@core/category/application/usecases/get_category/get_category.usecase";
import {ListCategoriesUsecase} from "@core/category/application/usecases/list_categories/list_categories.usecase";
import {CreateCategoryFixture, UpdateCategoryFixture} from "@/nest-modules/categories/testing/category_fixture";
import {CategoryPresenter} from "@/nest-modules/categories/categories.presenter";
import {CategoryOutputMapper} from "@core/category/application/usecases/common/category_output";
import {Uuid} from "@core/@shared/domain/value_objects/uuid.vo";
import {Category} from "@core/category/domain/category.entity";

describe('CategoriesController Integration Tests', () => {
  let controller: CategoriesController;
	let repository: ICategoryRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [ConfigModule.forRoot(), DatabaseModule, CategoriesModule]
		}).compile();
		controller = module.get<CategoriesController>(CategoriesController);
		repository = module.get<ICategoryRepository>(
			CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide
		);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
		expect(controller['createUsecase']).toBeInstanceOf(CreatecategoryUsecase);
		expect(controller['updateUsecase']).toBeInstanceOf(UpdateCategoryUsecase);
		expect(controller['getUsecase']).toBeInstanceOf(GetCategoryUsecase);
		expect(controller['listUsecase']).toBeInstanceOf(ListCategoriesUsecase);
		expect(controller['deleteUsecase']).toBeInstanceOf(DeleteCategoryUsecase);
	});

	describe('create categories', () => {
		const arrange = CreateCategoryFixture.arrangeForCreate();
		test.each(arrange)('when body is $send_data', async ({ send_data, expected }) => {
			const presenter = await controller.create(send_data);
			const entity = await repository.findById(new Uuid(presenter.id));
			expect(entity.toJSON()).toStrictEqual({
				category_id: presenter.id,
				created_at: presenter.created_at,
				...expected
			});
			const output = CategoryOutputMapper.toOutput(entity);
			expect(presenter).toEqual(new CategoryPresenter(output));
		})
	});

	describe('update categories', () => {
		const arrange = UpdateCategoryFixture.arrangeForUpdate();

		const category = Category.fake().aCategory().build();
		beforeEach(async () => {
			await repository.insert(category)
		});

		test.each(arrange)(
			'when body is $send_data',
			async ({ send_data, expected }) => {
			const presenter = await controller.update(category.category_id.id, send_data);
			const entity = await repository.findById(new Uuid(presenter.id));
			expect(entity.toJSON()).toStrictEqual({
				category_id: presenter.id,
				created_at: presenter.created_at,
				name: expected.name ?? category.name,
				description:
					'description' in expected
						? expected.description
						: category.description,
				is_active:
					'is_active' in expected
						? expected.is_active
						: category.is_active
			});
			const output = CategoryOutputMapper.toOutput(entity);
			expect(presenter).toEqual(new CategoryPresenter(output));
		})
	});
});