import request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { startApp } from '@/nest-modules/shared/testing/helpers/start_app.helper';
import { GenresController } from '@/nest-modules/genres/genres.controller';
import { GENRE_PROVIDERS } from '@/nest-modules/genres/genres.providers';
import { CATEGORY_PROVIDERS } from '@/nest-modules/categories/categories.providers';
import { CreateGenreFixture } from '@/nest-modules/genres/testing/genre_fixture';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { GenreId } from '@core/genre/domain/genre.aggregate';
import { GenreOutputMapper } from '@core/genre/application/usecases/common/genre_output';

describe('GenresController (e2e)', () => {
  const appHelper = startApp();
  let genreRepo: IGenreRepository;
  let categoryRepo: ICategoryRepository;

  beforeEach(async () => {
    genreRepo = await appHelper.app.resolve<IGenreRepository>(
      GENRE_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
    );
    categoryRepo = await appHelper.app.resolve<ICategoryRepository>(
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    );
  });

  describe('/genres (POST)', () => {
    describe('should return a response error with status code 422 when request body is invalid', () => {
      const invalidRequests = CreateGenreFixture.arrangeInvalidRequest();

      const arrange = Object.keys(invalidRequests).map((key) => ({
        label: key,
        value: invalidRequests[key],
      }));

      test.each(arrange)('when body is $label', ({ label, value }: any) => {
        let expected = value.expected;
        if (label === 'EMPTY') {
          expected = {
            ...expected,
            message: [
              'name should not be empty',
              'name must be a string',
              'categories_id should not be empty',
              'categories_id must be an array',
              'each value in categories_id must be a UUID'
            ]
          };
        }
        if (label === 'CATEGORIES_ID_NOT_AN_ARRAY') {
          expected = {
            ...expected,
            message: ['categories_id must be an array']
          };
        }
        return request(appHelper.app.getHttpServer())
          .post('/genres')
          .send(value.send_data)
          .expect(HttpStatus.UNPROCESSABLE_ENTITY)
          .expect(expected);
      });
    });

    describe('should return a response error with status code 422 when throw EntityValidationError', () => {
      const invalidRequests =
        CreateGenreFixture.arrangeForEntityValidationError();

      const arrange = Object.keys(invalidRequests).map((key) => ({
        label: key,
        value: invalidRequests[key],
      }));

      test.each(arrange)('when body is $label', ({ label, value }: any) => {
        let expected = value.expected;
        if (label === 'NAME_TOO_LONG') {
          expected = {
            ...expected,
            message: [
              'name must be shorter than or equal to 255 characters',
              'Category Not found using ID f47ac10b-58cc-4372-a567-0e02b2c3d479'
            ]
          };
        }
        return request(appHelper.app.getHttpServer())
          .post('/genres')
          .send(value.send_data)
          .expect(HttpStatus.UNPROCESSABLE_ENTITY)
          .expect(expected);
      });
    });

    describe('should create a genre', () => {
      const arrange = CreateGenreFixture.arrangeForCreate();

      test.each(arrange)(
        'when body is $send_data',
        async ({ send_data, expected, relations }) => {
          await categoryRepo.bulkInsert(relations);

          const res = await request(appHelper.app.getHttpServer())
            .post('/genres')
            .send(send_data)
            .expect(HttpStatus.CREATED);

          const keysInResponse = CreateGenreFixture.keysInResponse;
          expect(Object.keys(res.body)).toStrictEqual(['data']);
          expect(Object.keys(res.body.data)).toStrictEqual(keysInResponse);

          const created = await genreRepo.findById(
            new GenreId(res.body.data.id),
          );

          const presenter = GenresController.serialize(
            GenreOutputMapper.toOutput(created!, relations),
          );
          const serialized = instanceToPlain(presenter);

          expect(res.body.data).toStrictEqual(serialized);
          expect(res.body.data).toStrictEqual({
            id: serialized.id,
            created_at: serialized.created_at,
            ...expected,
            categories: serialized.categories,
          });
        },
      );
    });

    describe('response contract assertions', () => {
      it('should return created_at as an ISO-8601 string', async () => {
        const arrange = CreateGenreFixture.arrangeForCreate()[0];
        await categoryRepo.bulkInsert(arrange.relations);

        const res = await request(appHelper.app.getHttpServer())
          .post('/genres')
          .send(arrange.send_data)
          .expect(HttpStatus.CREATED);

        expect(res.body.data.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
        expect(new Date(res.body.data.created_at).toString()).not.toBe(
          'Invalid Date',
        );
      });

      it('should return a valid id', async () => {
        const arrange = CreateGenreFixture.arrangeForCreate()[0];
        await categoryRepo.bulkInsert(arrange.relations);

        const res = await request(appHelper.app.getHttpServer())
          .post('/genres')
          .send(arrange.send_data)
          .expect(HttpStatus.CREATED);

        expect(() => new GenreId(res.body.data.id)).not.toThrow();
      });

      it('should create two genres with the same name and different ids', async () => {
        const arrange = CreateGenreFixture.arrangeForCreate()[0];
        await categoryRepo.bulkInsert(arrange.relations);

        const res1 = await request(appHelper.app.getHttpServer())
          .post('/genres')
          .send(arrange.send_data)
          .expect(HttpStatus.CREATED);

        const res2 = await request(appHelper.app.getHttpServer())
          .post('/genres')
          .send(arrange.send_data)
          .expect(HttpStatus.CREATED);

        expect(res1.body.data.id).not.toBe(res2.body.data.id);
      });
    });
  });
});
