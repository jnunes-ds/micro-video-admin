import request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { startApp } from '@/nest-modules/shared/testing/helpers/start_app.helper';
import { GENRE_PROVIDERS } from '@/nest-modules/genres/genres.providers';
import { CATEGORY_PROVIDERS } from '@/nest-modules/categories/categories.providers';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { Category } from '@core/category/domain/category.aggregate';

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

  describe('/genres/:id (DELETE)', () => {
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
          .delete(`/genres/${id}`)
          .expect(expected.statusCode)
          .expect(expected);
      });
    });

    it('should delete a genre and respond with status 204', async () => {
      const category = Category.fake().aCategory().build();
      await categoryRepo.insert(category);

      const genre = Genre.fake()
        .aGenre()
        .addCategoryId(category.category_id)
        .build();
      await genreRepo.insert(genre);

      await request(appHelper.app.getHttpServer())
        .delete(`/genres/${genre.genre_id.id}`)
        .expect(HttpStatus.NO_CONTENT);

      await expect(genreRepo.findById(genre.genre_id)).resolves.toBeNull();
    });

    it('should respond with an empty body', async () => {
      const category = Category.fake().aCategory().build();
      await categoryRepo.insert(category);

      const genre = Genre.fake()
        .aGenre()
        .addCategoryId(category.category_id)
        .build();
      await genreRepo.insert(genre);

      const res = await request(appHelper.app.getHttpServer())
        .delete(`/genres/${genre.genre_id.id}`)
        .expect(HttpStatus.NO_CONTENT);

      expect(res.body).toStrictEqual({});
      expect(res.text).toBe('');
    });

    it('should delete only the target genre', async () => {
      const category = Category.fake().aCategory().build();
      await categoryRepo.insert(category);

      const genres = Genre.fake()
        .theGenres(3)
        .addCategoryId(category.category_id)
        .build();
      await genreRepo.bulkInsert(genres);

      await request(appHelper.app.getHttpServer())
        .delete(`/genres/${genres[0].genre_id.id}`)
        .expect(HttpStatus.NO_CONTENT);

      await expect(genreRepo.findById(genres[0].genre_id)).resolves.toBeNull();
      await expect(genreRepo.findById(genres[1].genre_id)).resolves.not.toBeNull();
      await expect(genreRepo.findById(genres[2].genre_id)).resolves.not.toBeNull();
    });

    it('should return 404 when deleting the same id twice', async () => {
      const category = Category.fake().aCategory().build();
      await categoryRepo.insert(category);

      const genre = Genre.fake()
        .aGenre()
        .addCategoryId(category.category_id)
        .build();
      await genreRepo.insert(genre);

      await request(appHelper.app.getHttpServer())
        .delete(`/genres/${genre.genre_id.id}`)
        .expect(HttpStatus.NO_CONTENT);

      await request(appHelper.app.getHttpServer())
        .delete(`/genres/${genre.genre_id.id}`)
        .expect(HttpStatus.NOT_FOUND)
        .expect({
          statusCode: HttpStatus.NOT_FOUND,
          error: 'Not Found',
          message: `Genre Not found using ID ${genre.genre_id.id}`,
        });
    });

    it('should not appear in the listing after deletion', async () => {
      const category = Category.fake().aCategory().build();
      await categoryRepo.insert(category);

      const genre = Genre.fake()
        .aGenre()
        .addCategoryId(category.category_id)
        .build();
      await genreRepo.insert(genre);

      await request(appHelper.app.getHttpServer())
        .delete(`/genres/${genre.genre_id.id}`)
        .expect(HttpStatus.NO_CONTENT);

      const res = await request(appHelper.app.getHttpServer())
        .get('/genres')
        .expect(HttpStatus.OK);

      expect(res.body.data).toHaveLength(0);
    });
  });
});
