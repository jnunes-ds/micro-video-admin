import request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { startApp } from '@/nest-modules/shared/testing/helpers/start_app.helper';
import { GenresController } from '@/nest-modules/genres/genres.controller';
import { GENRE_PROVIDERS } from '@/nest-modules/genres/genres.providers';
import { CATEGORY_PROVIDERS } from '@/nest-modules/categories/categories.providers';
import { ListGenresFixture } from '@/nest-modules/genres/testing/genre_fixture';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { Category } from '@core/category/domain/category.aggregate';
import { GenreOutputMapper } from '@core/genre/application/usecases/common/genre_output';

describe('GenresController (e2e)', () => {
  const appHelper = startApp();
  let genreRepo: IGenreRepository;
  let categoryRepo: ICategoryRepository;

  const flattenQuery = (query: any) => {
    if (!query || !query.filter) return query;
    const { filter, ...rest } = query;
    const flatFilter: any = {};
    Object.keys(filter).forEach((key) => {
      if (Array.isArray(filter[key])) {
        filter[key].forEach((val: any, idx: number) => {
          flatFilter[`filter[${key}][${idx}]`] = val;
        });
      } else {
        flatFilter[`filter[${key}]`] = filter[key];
      }
    });
    return { ...rest, ...flatFilter };
  };

  beforeEach(async () => {
    genreRepo = await appHelper.app.resolve<IGenreRepository>(
      GENRE_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
    );
    categoryRepo = await appHelper.app.resolve<ICategoryRepository>(
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    );
    const expressApp = appHelper.app.getHttpAdapter().getInstance();
    expressApp.set('query parser', 'extended');
  });

  describe('/genres (GET)', () => {
    describe('should return genres sorted by created_at when request query is empty', () => {
      const { arrange, entitiesMap, category } =
        ListGenresFixture.arrangeIncrementedWithCreatedAt();

      beforeEach(async () => {
        await categoryRepo.insert(category);
        await genreRepo.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when query is $send_data',
        async ({ send_data, expected }) => {
          const res = await request(appHelper.app.getHttpServer())
            .get('/genres')
            .query(flattenQuery(send_data))
            .expect(HttpStatus.OK);

          expect(res.body.meta).toStrictEqual(expected.meta);

          const expectedData = expected.entities.map((e) => {
            const presenter = GenresController.serialize(
              GenreOutputMapper.toOutput(e, [category]),
            );
            return instanceToPlain(presenter);
          });
          expect(res.body.data).toStrictEqual(expectedData);
        },
      );
    });

    describe('should apply defaults for invalid pagination params', () => {
      const { arrange, entitiesMap, category } =
        ListGenresFixture.arrangeIncrementedWithCreatedAt();
      
      const invalidQuery = { page: 'a', per_page: -1 };

      beforeEach(async () => {
        await categoryRepo.insert(category);
        await genreRepo.bulkInsert(Object.values(entitiesMap));
      });

      it('when query is invalid', async () => {
        const expected = arrange[0].expected; // default values
        
        const res = await request(appHelper.app.getHttpServer())
          .get('/genres')
          .query(invalidQuery)
          .expect(HttpStatus.OK);

        expect(res.body.meta).toStrictEqual(expected.meta);

        const expectedData = expected.entities.map((e) => {
          const presenter = GenresController.serialize(
            GenreOutputMapper.toOutput(e, [category]),
          );
          return instanceToPlain(presenter);
        });
        expect(res.body.data).toStrictEqual(expectedData);
      });
    });

    describe('should return genres using paginate, filter and sort', () => {
      const { arrange, entitiesMap, category } =
        ListGenresFixture.arrangeUnsorted();

      beforeEach(async () => {
        await categoryRepo.insert(category);
        await genreRepo.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when query is $send_data',
        async ({ send_data, expected }) => {
          const res = await request(appHelper.app.getHttpServer())
            .get('/genres')
            .query(flattenQuery(send_data))
            .expect(HttpStatus.OK);

          expect(res.body.meta).toStrictEqual(expected.meta);

          const expectedData = expected.entities.map((e) => {
            const presenter = GenresController.serialize(
              GenreOutputMapper.toOutput(e, [category]),
            );
            return instanceToPlain(presenter);
          });
          expect(res.body.data).toStrictEqual(expectedData);
        },
      );
    });

    describe('should filter by categories_id', () => {
      const category1 = Category.fake().aCategory().build();
      const category2 = Category.fake().aCategory().build();
      
      const genre1 = Genre.fake().aGenre().addCategoryId(category1.category_id).build();
      const genre2 = Genre.fake().aGenre().addCategoryId(category2.category_id).build();

      beforeEach(async () => {
        await categoryRepo.bulkInsert([category1, category2]);
        await genreRepo.bulkInsert([genre1, genre2]);
      });

      it('should filter by categories_id', async () => {
        const res = await request(appHelper.app.getHttpServer())
          .get('/genres')
          .query(flattenQuery({ filter: { categories_id: [category1.category_id.id] } }))
          .expect(HttpStatus.OK);

        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].id).toBe(genre1.genre_id.id);
      });
    });

    describe('should ignore non-sortable sort fields', () => {
      const { arrange, entitiesMap, category } =
        ListGenresFixture.arrangeIncrementedWithCreatedAt();

      beforeEach(async () => {
        await categoryRepo.insert(category);
        await genreRepo.bulkInsert(Object.values(entitiesMap));
      });

      it('should sort by created_at DESC when sort is invalid', async () => {
        const expected = arrange[0].expected; // default sort

        const res = await request(appHelper.app.getHttpServer())
          .get('/genres')
          .query({ sort: 'invalid_field' })
          .expect(HttpStatus.OK);

        expect(res.body.meta).toStrictEqual(expected.meta);

        const expectedData = expected.entities.map((e) => {
          const presenter = GenresController.serialize(
            GenreOutputMapper.toOutput(e, [category]),
          );
          return instanceToPlain(presenter);
        });
        expect(res.body.data).toStrictEqual(expectedData);
      });
    });

    describe('edge cases', () => {
      it('should return empty data when database is empty', async () => {
        const res = await request(appHelper.app.getHttpServer())
          .get('/genres')
          .expect(HttpStatus.OK);

        expect(res.body.data).toStrictEqual([]);
        expect(res.body.meta).toStrictEqual({
          current_page: 1,
          per_page: 15,
          last_page: 0,
          total: 0,
        });
      });

      it('should return empty data when filter has no results', async () => {
        const { entitiesMap, category } =
          ListGenresFixture.arrangeUnsorted();

        await categoryRepo.insert(category);
        await genreRepo.bulkInsert(Object.values(entitiesMap));

        const res = await request(appHelper.app.getHttpServer())
          .get('/genres')
          .query(flattenQuery({ filter: { name: 'NOT_FOUND_NAME' } }))
          .expect(HttpStatus.OK);

        expect(res.body.data).toStrictEqual([]);
      });

      it('should return all data when filter is empty', async () => {
        const { entitiesMap, category } =
          ListGenresFixture.arrangeIncrementedWithCreatedAt();

        await categoryRepo.insert(category);
        await genreRepo.bulkInsert(Object.values(entitiesMap));

        const res = await request(appHelper.app.getHttpServer())
          .get('/genres')
          .query(flattenQuery({ filter: {} }))
          .expect(HttpStatus.OK);

        expect(res.body.data.length).toBe(4);
      });
    });
  });
});
