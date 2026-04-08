import {CategorySequelizeRepository} from "@core/category/infra/db/sequelize/category-sequelize.repository";
import {CategoryInMemoryRepository} from "@core/category/infra/db/in_memory/category_in_memory.repository";
import {Provider} from "@nestjs/common/interfaces/modules/provider.interface";
import {CategoryModel} from "@core/category/infra/db/sequelize/category.model";
import {getModelToken} from "@nestjs/sequelize";

enum RepositoriesKeysEnum {
	CATEGORY_REPOSITORY = 'CATEGORY_REPOSITORY',
	CATEGORY_IN_MEMORY_REPOSITORY = 'CATEGORY_IN_MEMORY_REPOSITORY',
	CATEGORY_SEQUELIZE_REPOSITORY = 'CATEGORY_SEQUELIZE_REPOSITORY'
}

type Repositories = {
	[key in RepositoriesKeysEnum]: Provider;
};

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