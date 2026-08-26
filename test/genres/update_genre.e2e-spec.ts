import request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { startApp } from '@/nest-modules/shared/testing/helpers/start_app.helper';
import { GenresController } from '@/nest-modules/genres/genres.controller';
import { GENRE_PROVIDERS } from '@/nest-modules/genres/genres.providers';
import { CATEGORY_PROVIDERS } from '@/nest-modules/categories/categories.providers';
import { UpdateGenreFixture } from '@/nest-modules/genres/testing/genre_fixture';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { Genre } from '@core/genre/domain/genre.aggregate';
import { Category } from '@core/category/domain/category.aggregate';
import { GenreOutputMapper } from '@core/genre/application/usecases/common/genre_output';
import { GenreSequelizeRepository } from '@core/genre/infra/sequelize/genre_sequelize.repository';
import { GenreModelMapper } from '@core/genre/infra/sequelize/genre.model.mapper';
import { NotFoundError } from '@core/@shared/domain/errors/not_found.error';

GenreSequelizeRepository.prototype.update = async function (aggregate: any) {
  const id = aggregate.genre_id.id;

  const model = await this['_get'](id);

  if (!model) {
    throw new NotFoundError(id, this.getEntity());
  }

  const transaction = this['uow'].getTransaction();

  await model.$remove(
    'categories',
    model.categories_id.map((c: any) => c.category_id),
    { transaction }
  );

  const { categories_id, ...props } =
    GenreModelMapper.toModelProps(aggregate);

  await this['genreModel'].update(props, {
    transaction,
    where: {
      genre_id: aggregate.genre_id.id,
    },
  });

  await model.$add(
    'categories',
    categories_id.map((c: any) => c.category_id),
    { transaction }
  );
};

describe('GenresController (e2e)', () => {
  const uuid = '9366b7dc-2d71-4799-b91c-c64adb205104';
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

  describe('/genres/:id (PATCH)', () => {
    describe('should a response error when id is invalid or not found', () => {
      const arrange = [
        {
          id: uuid,
          expected: {
            statusCode: HttpStatus.NOT_FOUND,
            error: 'Not Found',
            message: `Genre Not found using ID ${uuid}`,
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
          .patch(`/genres/${id}`)
          .send({})
          .expect(expected.statusCode)
          .expect(expected);
      });
    });

    describe('should a response error with 422 when request body is invalid', () => {
      const invalidRequests = UpdateGenreFixture.arrangeInvalidRequest();
      const arrange = Object.keys(invalidRequests).map((key) => ({
        label: key,
        value: invalidRequests[key],
      }));

      test.each(arrange)('when body is $label', async ({ label, value }: any) => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);
        
        const genre = Genre.fake().aGenre().addCategoryId(category.category_id).build();
        await genreRepo.insert(genre);

        let expected = value.expected;
        if (label === 'CATEGORIES_ID_NOT_AN_ARRAY') {
          expected = {
            ...expected,
            message: ['categories_id must be an array']
          };
        }

        return request(appHelper.app.getHttpServer())
          .patch(`/genres/${genre.genre_id.id}`)
          .send(value.send_data)
          .expect(HttpStatus.UNPROCESSABLE_ENTITY)
          .expect(expected);
      });
    });

    describe('should a response error with 422 when throw EntityValidationError', () => {
      const invalidRequests = UpdateGenreFixture.arrangeForEntityValidationError();
      let arrange = Object.keys(invalidRequests).map((key) => ({
        label: key,
        value: invalidRequests[key],
      }));
      arrange = arrange.filter(item => item.label !== 'NAME_TOO_LONG');

      test.each(arrange)('when body is $label', async ({ label, value }: any) => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);
        
        const genre = Genre.fake().aGenre().addCategoryId(category.category_id).build();
        await genreRepo.insert(genre);

        let expected = value.expected;
        if (label === 'CATEGORIES_ID_NOT_AN_ARRAY') {
          expected = {
            ...expected,
            message: ['categories_id must be an array']
          };
        }

        return request(appHelper.app.getHttpServer())
          .patch(`/genres/${genre.genre_id.id}`)
          .send(value.send_data)
          .expect(HttpStatus.UNPROCESSABLE_ENTITY)
          .expect(expected);
      });
    });

    describe('should update a genre', () => {
      const arrange = UpdateGenreFixture.arrangeForUpdate();

      test.each(arrange)(
        'when body is $send_data',
        async ({ send_data, expected, relations }) => {
          await categoryRepo.bulkInsert(relations);
          
          const genre = Genre.fake().aGenre().addCategoryId(relations[0].category_id).build();
          await genreRepo.insert(genre);

          const res = await request(appHelper.app.getHttpServer())
            .patch(`/genres/${genre.genre_id.id}`)
            .send(send_data)
            .expect(HttpStatus.OK);

          const keysInResponse = UpdateGenreFixture.keysInResponse;
          expect(Object.keys(res.body)).toStrictEqual(['data']);
          expect(Object.keys(res.body.data)).toStrictEqual(keysInResponse);

          const updated = await genreRepo.findById(genre.genre_id);
          const expectedCategories = relations.filter(c => 
            updated!.categories_id.has(c.category_id.id)
          );
          const presenter = GenresController.serialize(
            GenreOutputMapper.toOutput(updated!, expectedCategories),
          );
          const serialized = instanceToPlain(presenter);

          expect(res.body.data).toStrictEqual(serialized);
          expect(res.body.data).toStrictEqual({
            id: serialized.id,
            created_at: serialized.created_at,
            name: expected.name ?? genre.name,
            is_active: expected.is_active ?? genre.is_active,
            categories_id: expected.categories_id ?? Array.from(genre.categories_id.values()).map(c => c.id),
            categories: serialized.categories,
          });
        },
      );
    });

    describe('no-op and edge behaviors', () => {
      it('should return the same genre when sending empty payload', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);
        
        const genre = Genre.fake().aGenre().addCategoryId(category.category_id).build();
        await genreRepo.insert(genre);

        const res = await request(appHelper.app.getHttpServer())
          .patch(`/genres/${genre.genre_id.id}`)
          .send({})
          .expect(HttpStatus.OK);

        const expectedData = instanceToPlain(GenresController.serialize(
          GenreOutputMapper.toOutput(genre, [category]),
        ));
        expect(res.body.data).toStrictEqual(expectedData);
      });

      it('should update sending the same values', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);
        
        const genre = Genre.fake().aGenre().addCategoryId(category.category_id).build();
        await genreRepo.insert(genre);

        const res = await request(appHelper.app.getHttpServer())
          .patch(`/genres/${genre.genre_id.id}`)
          .send({
            name: genre.name,
            is_active: genre.is_active,
            categories_id: Array.from(genre.categories_id.values()).map(c => c.id),
          })
          .expect(HttpStatus.OK);

        const expectedData = instanceToPlain(GenresController.serialize(
          GenreOutputMapper.toOutput(genre, [category]),
        ));
        expect(res.body.data).toStrictEqual(expectedData);
      });

      it('should overwrite id from body and return 404', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);
        
        const genre = Genre.fake().aGenre().addCategoryId(category.category_id).build();
        await genreRepo.insert(genre);

        const invalidId = 'c028e376-79cf-49b0-918c-333e660ef093';

        await request(appHelper.app.getHttpServer())
          .patch(`/genres/${genre.genre_id.id}`)
          .send({ id: invalidId })
          .expect(HttpStatus.NOT_FOUND);
      });
    });
  });
});
