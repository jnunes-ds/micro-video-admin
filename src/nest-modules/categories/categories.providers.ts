import {CategorySequelizeRepository} from "@core/category/infra/db/sequelize/category-sequelize.repository";
import {CategoryInMemoryRepository} from "@core/category/infra/db/in_memory/category_in_memory.repository";
import {Provider} from "@nestjs/common/interfaces/modules/provider.interface";
import {CategoryModel} from "@core/category/infra/db/sequelize/category.model";
import {getModelToken} from "@nestjs/sequelize";
import {CreatecategoryUsecase} from "@core/category/application/usecases/create_category/create_category.usecase";
import {ICategoryRepository} from "@core/category/domain/category.repository";
import {UpdateCategoryUseCase} from "@core/category/application/usecases/update_category/update_category.usecase";
import {ListCategoriesUseCase} from "@core/category/application/usecases/list_categories/list_categories.usecase";
import {GetCategoryUsecase} from "@core/category/application/usecases/get_category/get_category.usecase";
import {DeleteCategoryUsecase} from "@core/category/application/usecases/delete_category/delete_category.usecase";

type Providers<T extends string> = {
	[key in T]: Provider;
};

enum RepositoriesKeysEnum {
	CATEGORY_REPOSITORY = 'CATEGORY_REPOSITORY',
	CATEGORY_IN_MEMORY_REPOSITORY = 'CATEGORY_IN_MEMORY_REPOSITORY',
	CATEGORY_SEQUELIZE_REPOSITORY = 'CATEGORY_SEQUELIZE_REPOSITORY'
}

type Repositories = Providers<RepositoriesKeysEnum>

export const REPOSITORIES: Repositories = {
	CATEGORY_REPOSITORY: {
		provide: 'CategoryRepository',
		useExisting: CategorySequelizeRepository,
	},
	CATEGORY_IN_MEMORY_REPOSITORY: {
		provide: CategoryInMemoryRepository,
		useClass: CategorySequelizeRepository
	},
	CATEGORY_SEQUELIZE_REPOSITORY: {
		provide: CategorySequelizeRepository,
		useFactory: (categoryModel: typeof CategoryModel) => new CategorySequelizeRepository(categoryModel),
		inject: [getModelToken(CategoryModel)]
	}
}

enum UseCasesKeysEnum  {
	CREATE_CATEGORY_USE_CASE = 'CREATE_CATEGORY_USE_CASE',
	UPDATE_CATEGORY_USE_CASE = 'UPDATE_CATEGORY_USE_CASE',
	LIST_CATEGORIES_USE_CASE = 'LIST_CATEGORIES_USE_CASE',
	GET_CATEGORY_USE_CASE = 'GET_CATEGORY_USE_CASE',
	DELETE_CATEGORY_USE_CASE = 'DELETE_CATEGORY_USE_CASE'
}

type Usecases = Providers<UseCasesKeysEnum>;

export const USE_CASES: Usecases = {
	CREATE_CATEGORY_USE_CASE: {
		provide: CreatecategoryUsecase,
		useFactory: (categoryRepo: ICategoryRepository) => new CreatecategoryUsecase(categoryRepo),
		inject: [REPOSITORIES.CATEGORY_REPOSITORY['provide']]
	},
	UPDATE_CATEGORY_USE_CASE: {
		provide: UpdateCategoryUseCase,
		useFactory: (categoryRepo: ICategoryRepository) => new UpdateCategoryUseCase(categoryRepo),
		inject: [REPOSITORIES.CATEGORY_REPOSITORY['provide']]
	},
	LIST_CATEGORIES_USE_CASE: {
		provide: ListCategoriesUseCase,
		useFactory: (categoryRepo: ICategoryRepository) => new ListCategoriesUseCase(categoryRepo),
		inject: [REPOSITORIES.CATEGORY_REPOSITORY['provide']]
	},
	GET_CATEGORY_USE_CASE: {
		provide: GetCategoryUsecase,
		useFactory: (categoryRepo: ICategoryRepository) => new GetCategoryUsecase(categoryRepo),
		inject: [REPOSITORIES.CATEGORY_REPOSITORY['provide']]
	},
	DELETE_CATEGORY_USE_CASE: {
		provide: DeleteCategoryUsecase,
		useFactory: (categoryRepo: ICategoryRepository) => new DeleteCategoryUsecase(categoryRepo),
		inject: [REPOSITORIES.CATEGORY_REPOSITORY['provide']]
	}
}

export const CATEGORY_PROVIDERS = {
	REPOSITORIES,
	USE_CASES,
}