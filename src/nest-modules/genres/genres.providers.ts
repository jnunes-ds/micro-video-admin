import { Provider } from '@nestjs/common';
import { GenreModel } from '@core/genre/infra/sequelize/genre.model';
import { getModelToken } from '@nestjs/sequelize';
import { GenreSequelizeRepository } from '@core/genre/infra/sequelize/genre_sequelize.repository';
import { GenreInMemoryRepository } from '@core/genre/infra/in_memory/genre_in_memory.repository';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { CreateGenreUsecase } from '@core/genre/application/usecases/create_genre/create_genre.usecase';
import { UpdateGenreUsecase } from '@core/genre/application/usecases/update_genre/update_genre.usecase';
import { ListGenresUsecase } from '@core/genre/application/usecases/list_genres/list_genres.usecase';
import { GetGenreUsecase } from '@core/genre/application/usecases/get_genre/get_genre.usecase';
import { DeleteGenreUsecase } from '@core/genre/application/usecases/delete_genre/delete_genre.usecase';
import { IUnitOfWork } from '@core/@shared/domain/repository/unit_of_work.interface';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { CategoriesIdsExistsInStorageValidator } from '@core/category/application/validations/categories_ids_exists_in_storage.validator';
import { CATEGORY_PROVIDERS } from '@/nest-modules/categories/categories.providers';
import { UnitOfWorkSequelize } from '@core/@shared/infra/db/sequelize/unit_of_work_sequelize';

export type ObjectProvider = Exclude<Provider, Function | string | symbol>;

type Providers<T extends string> = {
  [key in T]: ObjectProvider;
};

enum RepositoriesKeysEnum {
  GENRE_REPOSITORY = 'GENRE_REPOSITORY',
  GENRE_IN_MEMORY_REPOSITORY = 'GENRE_IN_MEMORY_REPOSITORY',
  GENRE_SEQUELIZE_REPOSITORY = 'GENRE_SEQUELIZE_REPOSITORY',
}

type Repositories = Providers<RepositoriesKeysEnum>;

export const REPOSITORIES: Repositories = {
  GENRE_REPOSITORY: {
    provide: 'GenreRepository',
    useExisting: GenreSequelizeRepository,
  },
  GENRE_IN_MEMORY_REPOSITORY: {
    provide: GenreInMemoryRepository,
    useClass: GenreInMemoryRepository,
  },
  GENRE_SEQUELIZE_REPOSITORY: {
    provide: GenreSequelizeRepository,
    useFactory: (genreModel: typeof GenreModel, uow: UnitOfWorkSequelize) =>
      new GenreSequelizeRepository(genreModel, uow),
    inject: [getModelToken(GenreModel), 'UnitOfWork'],
  },
};

enum UseCasesKeysEnum {
  CREATE_GENRE_USE_CASE = 'CREATE_GENRE_USE_CASE',
  UPDATE_GENRE_USE_CASE = 'UPDATE_GENRE_USE_CASE',
  LIST_GENRES_USE_CASE = 'LIST_GENRES_USE_CASE',
  GET_GENRE_USE_CASE = 'GET_GENRE_USE_CASE',
  DELETE_GENRE_USE_CASE = 'DELETE_GENRE_USE_CASE',
}

type Usecases = Providers<UseCasesKeysEnum>;

export const USE_CASES: Usecases = {
  CREATE_GENRE_USE_CASE: {
    provide: CreateGenreUsecase,
    useFactory: (
      uow: IUnitOfWork,
      genreRepo: IGenreRepository,
      categoryRepo: ICategoryRepository,
      categoriesIdsExistsInStorage: CategoriesIdsExistsInStorageValidator,
    ) =>
      new CreateGenreUsecase(
        uow,
        genreRepo,
        categoryRepo,
        categoriesIdsExistsInStorage,
      ),
    inject: [
      'UnitOfWork',
      REPOSITORIES.GENRE_REPOSITORY.provide,
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      CATEGORY_PROVIDERS.VALIDATORS.CATEGORIES_IDS_EXISTS_IN_STORAGE_VALIDATOR
        .provide,
    ],
  },
  UPDATE_GENRE_USE_CASE: {
    provide: UpdateGenreUsecase,
    useFactory: (
      uow: IUnitOfWork,
      genreRepo: IGenreRepository,
      categoryRepo: ICategoryRepository,
      categoriesIdsExistsInStorage: CategoriesIdsExistsInStorageValidator,
    ) =>
      new UpdateGenreUsecase(
        uow,
        genreRepo,
        categoryRepo,
        categoriesIdsExistsInStorage,
      ),
    inject: [
      'UnitOfWork',
      REPOSITORIES.GENRE_REPOSITORY.provide,
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      CATEGORY_PROVIDERS.VALIDATORS.CATEGORIES_IDS_EXISTS_IN_STORAGE_VALIDATOR
        .provide,
    ],
  },
  LIST_GENRES_USE_CASE: {
    provide: ListGenresUsecase,
    useFactory: (
      genreRepo: IGenreRepository,
      categoryRepo: ICategoryRepository,
    ) => new ListGenresUsecase(genreRepo, categoryRepo),
    inject: [
      REPOSITORIES.GENRE_REPOSITORY.provide,
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    ],
  },
  GET_GENRE_USE_CASE: {
    provide: GetGenreUsecase,
    useFactory: (
      genreRepo: IGenreRepository,
      categoryRepo: ICategoryRepository,
    ) => new GetGenreUsecase(genreRepo, categoryRepo),
    inject: [
      REPOSITORIES.GENRE_REPOSITORY.provide,
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    ],
  },
  DELETE_GENRE_USE_CASE: {
    provide: DeleteGenreUsecase,
    useFactory: (uow: IUnitOfWork, genreRepo: IGenreRepository) =>
      new DeleteGenreUsecase(uow, genreRepo),
    inject: ['UnitOfWork', REPOSITORIES.GENRE_REPOSITORY.provide],
  },
};

export const GENRE_PROVIDERS = {
  REPOSITORIES,
  USE_CASES,
};
