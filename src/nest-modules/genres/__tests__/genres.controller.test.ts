import { Test, TestingModule } from '@nestjs/testing';
import { GenresController } from '../genres.controller';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { ConfigModule } from '@/nest-modules/config/config.module';
import { DatabaseModule } from '@/nest-modules/database/database.module';
import { GenresModule } from '@/nest-modules/genres/genres.module';
import { Sequelize } from 'sequelize-typescript';
import { UnitOfWorkSequelize } from '@core/@shared/infra/db/sequelize/unit_of_work_sequelize';
import { getConnectionToken } from '@nestjs/sequelize';
import { GENRE_PROVIDERS } from '@/nest-modules/genres/genres.providers';
import { CATEGORY_PROVIDERS } from '@/nest-modules/categories/categories.providers';
import { CreateGenreUsecase } from '@core/genre/application/usecases/create_genre/create_genre.usecase';
import { UpdateGenreUsecase } from '@core/genre/application/usecases/update_genre/update_genre.usecase';
import { DeleteGenreUsecase } from '@core/genre/application/usecases/delete_genre/delete_genre.usecase';
import { GetGenreUsecase } from '@core/genre/application/usecases/get_genre/get_genre.usecase';
import { ListGenresUsecase } from '@core/genre/application/usecases/list_genres/list_genres.usecase';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { Uuid } from '@core/@shared/domain/value_objects/uuid.vo';
import { Category } from '@core/category/domain/category.aggregate';
import { CategoriesModule } from '@/nest-modules/categories/categories.module';
import { GenreOutputMapper } from '@core/genre/application/usecases/common/genre_output';
import { GenrePresenter } from '../genres.presenter';

describe('GenresController Integration tests', () => {
  let controller: GenresController;
  let genreRepo: IGenreRepository;
  let categoryRepo: ICategoryRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        DatabaseModule,
        GenresModule,
        CategoriesModule,
      ],
    })
      .overrideProvider('UnitOfWork')
      .useFactory({
        factory: (sequelize: Sequelize) => {
          return new UnitOfWorkSequelize(sequelize);
        },
        inject: [getConnectionToken()],
      })
      .compile();
    controller = module.get(GenresController);
    genreRepo = module.get(
      GENRE_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
    );
    categoryRepo = module.get(
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    );
  });

  test('should be defined', () => {
    expect(controller).toBeDefined();
    expect(controller['createUsecase']).toBeInstanceOf(CreateGenreUsecase);
    expect(controller['updateUsecase']).toBeInstanceOf(UpdateGenreUsecase);
    expect(controller['getUsecase']).toBeInstanceOf(GetGenreUsecase);
    expect(controller['listUsecase']).toBeInstanceOf(ListGenresUsecase);
    expect(controller['deleteUsecase']).toBeInstanceOf(DeleteGenreUsecase);
  });

  describe('create genres', () => {
    test('create a genre', async () => {
      const category = Category.fake().aCategory().build();
      await categoryRepo.insert(category);

      const send_data = {
        name: 'Action',
        categories_id: [category.category_id.id],
      };

      const presenter = await controller.create(send_data);
      const entity = await genreRepo.findById(new Uuid(presenter.id));

      expect(entity).toBeDefined();
      if (entity) {
        expect(entity.name).toBe('Action');
        expect(entity.categories_id.has(category.category_id.id)).toBe(true);
        expect(entity.is_active).toBe(true);

        const output = GenreOutputMapper.toOutput(entity, [category]);
        expect(presenter).toEqual(new GenrePresenter(output));
      }
    });
  });

  describe('update genres', () => {
    test('update a genre', async () => {
      const category1 = Category.fake().aCategory().build();
      const category2 = Category.fake().aCategory().build();
      await categoryRepo.bulkInsert([category1, category2]);

      const genre = Genre.fake()
        .aGenre()
        .addCategoryId(category1.category_id)
        .build();
      await genreRepo.insert(genre);

      const send_data = {
        name: 'Action updated',
        categories_id: [category2.category_id.id],
        is_active: false,
      };

      const presenter = await controller.update(genre.genre_id.id, send_data);
      const entity = await genreRepo.findById(new Uuid(presenter.id));

      expect(entity).toBeDefined();
      if (entity) {
        expect(entity.name).toBe('Action updated');
        expect(entity.categories_id.has(category2.category_id.id)).toBe(true);
        expect(entity.categories_id.has(category1.category_id.id)).toBe(false);
        expect(entity.is_active).toBe(false);

        const output = GenreOutputMapper.toOutput(entity, [category2]);
        expect(presenter).toEqual(new GenrePresenter(output));
      }
    });
  });

  test('genre deletion', async () => {
    const category = Category.fake().aCategory().build();
    await categoryRepo.insert(category);
    const genre = Genre.fake().aGenre().addCategoryId(category.category_id).build();
    await genreRepo.insert(genre);
    const response = await controller.remove(genre.genre_id.id);
    expect(response).not.toBeDefined();
    await expect(genreRepo.findById(genre.genre_id)).resolves.toBeNull();
  });

  test('if we can get a genre', async () => {
    const category = Category.fake().aCategory().build();
    await categoryRepo.insert(category);

    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(category.category_id)
      .build();
    await genreRepo.insert(genre);

    const presenter = await controller.findOne(genre.genre_id.id);

    expect(presenter.id).toBe(genre.genre_id.id);
    expect(presenter.name).toBe(genre.name);
    expect(presenter.is_active).toBe(genre.is_active);
    expect(presenter.created_at).toStrictEqual(genre.created_at);
    expect(presenter.categories_id).toEqual([category.category_id.id]);
  });

  describe('search method', () => {
    test('if return genres using pagination, sort and filter', async () => {
      const category = Category.fake().aCategory().build();
      await categoryRepo.insert(category);

      const genres = [
        Genre.fake()
          .aGenre()
          .withName('Test')
          .addCategoryId(category.category_id)
          .build(),
        Genre.fake()
          .aGenre()
          .withName('a')
          .addCategoryId(category.category_id)
          .build(),
        Genre.fake()
          .aGenre()
          .withName('TEST')
          .addCategoryId(category.category_id)
          .build(),
        Genre.fake()
          .aGenre()
          .withName('e')
          .addCategoryId(category.category_id)
          .build(),
        Genre.fake()
          .aGenre()
          .withName('TeSt')
          .addCategoryId(category.category_id)
          .build(),
      ];

      await genreRepo.bulkInsert(genres);

      const send_data = {
        page: 1,
        per_page: 2,
        sort: 'name',
        sort_dir: 'asc' as const,
        filter: { name: 'TEST' },
      };

      const presenter = await controller.search(send_data);

      expect(presenter.data.length).toBe(2);
      expect(presenter.meta.total).toBe(3);
      expect(presenter.meta.current_page).toBe(1);
      expect(presenter.meta.last_page).toBe(2);
      expect(presenter.data[0].name).toBe('TEST');
      expect(presenter.data[1].name).toBe('TeSt');
    });
  });
});
