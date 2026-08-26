import {UpdateGenreUsecase} from "@core/genre/application/usecases/update_genre/update_genre.usecase";
import {GenreInMemoryRepository} from "@core/genre/infra/in_memory/genre_in_memory.repository";
import {CategoryInMemoryRepository} from "@core/category/infra/db/in_memory/category_in_memory.repository";
import {UnitOfWorkFakeInMemory} from "@core/@shared/infra/db/in_memory/fake_unit_of_work_in_memory";
import {
	CategoriesIdsExistsInDatabaseValidator
} from "@core/category/application/validations/categories_ids_exists_in_database.validator";
import {Genre} from "@core/genre/domain/genre.aggregate";
import {NotFoundError} from "@core/@shared/domain/errors/not_found.error";
import {EntityValidationError} from "@core/@shared/domain/validators/validation.error";
import {Category} from "@core/category/domain/category.aggregate";

describe('UpdateGenreUsecase Unit Tests', () => {
	let usecase: UpdateGenreUsecase;
	let genreRepo: GenreInMemoryRepository;
	let categoryRepo: CategoryInMemoryRepository;
	let categoriesIdsExistsInStorageValidator: CategoriesIdsExistsInDatabaseValidator;
	let uow: UnitOfWorkFakeInMemory;

	beforeEach(() => {
		uow = new UnitOfWorkFakeInMemory();
		genreRepo = new GenreInMemoryRepository();
		categoryRepo = new CategoryInMemoryRepository();
		categoriesIdsExistsInStorageValidator = new CategoriesIdsExistsInDatabaseValidator(categoryRepo);
		usecase = new UpdateGenreUsecase(
			uow,
			genreRepo,
			categoryRepo,
			categoriesIdsExistsInStorageValidator
		);
	});

	describe('execute method', () => {
		it('should throw an error when genre not found', async () => {
			await expect(
				usecase.execute({ id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', name: 'test' })
			).rejects.toThrow(new NotFoundError('f47ac10b-58cc-4372-a567-0e02b2c3d479', Genre));
		});

		it('should throw an entity validation error when categories id not exists', async () => {
			expect.assertions(3);
			const genre = Genre.fake().aGenre().build();
			await genreRepo.insert(genre);

			const spyValidateCategoriesId = jest.spyOn(
				categoriesIdsExistsInStorageValidator,
				'validate'
			);
			const categoriesId = [
				'f47ac10b-58cc-4372-a567-0e02b2c3d479',
				'98b526f7-a92f-4e89-ad4b-37c52a7e4b6c'
			];
			try {
				await usecase.execute({
					id: genre.genre_id.id,
					name: 'test',
					categories_id: categoriesId
				});
			} catch (e) {
				expect(spyValidateCategoriesId).toHaveBeenCalledWith(categoriesId);
				expect(e).toBeInstanceOf(EntityValidationError);
				expect(e.error).toStrictEqual([
					{
						categories_id: [
							'Category Not found using ID f47ac10b-58cc-4372-a567-0e02b2c3d479',
							'Category Not found using ID 98b526f7-a92f-4e89-ad4b-37c52a7e4b6c',
						]
					}
				]);
			}
		});

		it('should update a genre', async () => {
			const category1 = Category.fake().aCategory().build();
			const category2 = Category.fake().aCategory().build();
			await categoryRepo.bulkInsert([category1, category2]);

			const genre = Genre.fake()
				.aGenre()
				.addCategoryId(category1.category_id)
				.build();
			await genreRepo.insert(genre);

			const spyValidateCategoriesId = jest.spyOn(
				categoriesIdsExistsInStorageValidator,
				'validate'
			);
			const spyUpdate = jest.spyOn(genreRepo, 'update');

			let output = await usecase.execute({
				id: genre.genre_id.id,
				name: 'test',
				categories_id: [category2.category_id.id]
			});

			expect(spyValidateCategoriesId).toHaveBeenCalledWith([category2.category_id.id]);
			expect(spyUpdate).toHaveBeenCalledTimes(1);
			expect(output).toStrictEqual({
				id: genre.genre_id.id,
				name: 'test',
				categories_id: [category2.category_id.id],
				is_active: true,
				created_at: genre.created_at,
				categories: [{
					id: category2.category_id.id,
					name: category2.name,
					created_at: category2.created_at,
				}]
			});

			output = await usecase.execute({
				id: genre.genre_id.id,
				is_active: false
			});
			expect(spyUpdate).toHaveBeenCalledTimes(2);
			expect(output.is_active).toBe(false);

			output = await usecase.execute({
				id: genre.genre_id.id,
				is_active: true
			});
			expect(spyUpdate).toHaveBeenCalledTimes(3);
			expect(output.is_active).toBe(true);
		});
	});
});