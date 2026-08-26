import request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { startApp } from '@/nest-modules/shared/testing/helpers/start_app.helper';
import { GenresController } from '@/nest-modules/genres/genres.controller';
import { GENRE_PROVIDERS } from '@/nest-modules/genres/genres.providers';
import { CATEGORY_PROVIDERS } from '@/nest-modules/categories/categories.providers';
import { GetGenreFixture } from '@/nest-modules/genres/testing/genre_fixture';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { Category } from '@core/category/domain/category.aggregate';
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

  describe('/genres/:id (GET)', () => {
    describe('should a response error when id is invalid or not found', () => {
      const arrange = [
        {
          id: '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
          expected: {
            statusCode: HttpStatus.NOT_FOUND,
            error: 'Not Found',
            message: 'Genre Not found using ID 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
          },
        },
        {
          id: 'fake id',
          expected: {
            statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            error: 'Unprocessable Entity',
            message: 'Validation failed (uuid is expected)',
          },
        },
      ];

      test.each(arrange)('when id is $id', async ({ id, expected }) => {
        return request(appHelper.app.getHttpServer())
          .get(`/genres/${id}`)
          .expect(expected.statusCode)
          .expect(expected);
      });
    });

    it('should return a genre', async () => {
      const category = Category.fake().aCategory().build();
      await categoryRepo.insert(category);

      const genre = Genre.fake()
        .aGenre()
        .addCategoryId(category.category_id)
        .build();
      await genreRepo.insert(genre);

      const res = await request(appHelper.app.getHttpServer())
        .get(`/genres/${genre.genre_id.id}`)
        .expect(HttpStatus.OK);

      const keysInResponse = GetGenreFixture.keysInResponse;
      expect(Object.keys(res.body)).toStrictEqual(['data']);
      expect(Object.keys(res.body.data)).toStrictEqual(keysInResponse);

      const presenter = GenresController.serialize(
        GenreOutputMapper.toOutput(genre, [category]),
      );
      const serialized = instanceToPlain(presenter);
      expect(res.body.data).toStrictEqual(serialized);
    });

    describe('response contract assertions', () => {
      it('should return created_at as an ISO-8601 string', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);

        const genre = Genre.fake()
          .aGenre()
          .addCategoryId(category.category_id)
          .build();
        await genreRepo.insert(genre);

        const res = await request(appHelper.app.getHttpServer())
          .get(`/genres/${genre.genre_id.id}`)
          .expect(HttpStatus.OK);

        expect(res.body.data.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
        expect(new Date(res.body.data.created_at).toString()).not.toBe('Invalid Date');
      });

      it('should return is_active as boolean', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);

        const genre = Genre.fake()
          .aGenre()
          .addCategoryId(category.category_id)
          .build();
        await genreRepo.insert(genre);

        const res = await request(appHelper.app.getHttpServer())
          .get(`/genres/${genre.genre_id.id}`)
          .expect(HttpStatus.OK);

        expect(typeof res.body.data.is_active).toBe('boolean');
      });

      it('should not return genre_id', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);

        const genre = Genre.fake()
          .aGenre()
          .addCategoryId(category.category_id)
          .build();
        await genreRepo.insert(genre);

        const res = await request(appHelper.app.getHttpServer())
          .get(`/genres/${genre.genre_id.id}`)
          .expect(HttpStatus.OK);

        expect(res.body.data).not.toHaveProperty('genre_id');
      });

      it('should not change the registry on GET', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);

        const genre = Genre.fake()
          .aGenre()
          .addCategoryId(category.category_id)
          .build();
        await genreRepo.insert(genre);

        await request(appHelper.app.getHttpServer())
          .get(`/genres/${genre.genre_id.id}`)
          .expect(HttpStatus.OK);

        const fetchedGenre = await genreRepo.findById(genre.genre_id);
        expect(fetchedGenre!.toJSON()).toStrictEqual(genre.toJSON());
      });
    });

    it('should return the right genre when several exist', async () => {
      const category = Category.fake().aCategory().build();
      await categoryRepo.insert(category);

      const genres = Genre.fake()
        .theGenres(3)
        .addCategoryId(category.category_id)
        .build();
      await genreRepo.bulkInsert(genres);

      const res = await request(appHelper.app.getHttpServer())
        .get(`/genres/${genres[1].genre_id.id}`)
        .expect(HttpStatus.OK);

      const presenter = GenresController.serialize(
        GenreOutputMapper.toOutput(genres[1], [category]),
      );
      const serialized = instanceToPlain(presenter);
      expect(res.body.data).toStrictEqual(serialized);
    });
  });
});
