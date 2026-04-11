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

describe('CategoriesController Unit Tests', () => {
  let controller: CategoriesController;
	let repository: ICategoryRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [ConfigModule.forRoot(), DatabaseModule, CategoriesModule]
		}).compile();
		controller = module.get<CategoriesController>(CategoriesController);
		repository = module.get<ICategoryRepository>(
			CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_IN_MEMORY_REPOSITORY.provide
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

});