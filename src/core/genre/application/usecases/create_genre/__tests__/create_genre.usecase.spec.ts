import {CreateGenreUsecase} from "@core/genre/application/usecases/create_genre/create_genre.usecase";
import {GenreInMemoryRepository} from "@core/genre/infra/in_memory/genre_in_memory.repository";
import {CategoryInMemoryRepository} from "@core/category/infra/db/in_memory/category_in_memory.repository";
import {
	CategoriesIdsExistsInDatabaseValidator
} from "@core/category/application/validations/categories_ids_exists_in_database.validator";
import {UnitOfWorkFakeInMemory} from "@core/@shared/infra/db/in_memory/fake_unit_of_work_in_memory";
import {EntityValidationError} from "@core/@shared/domain/validators/validation.error";
import {Category} from "@core/category/domain/category.aggregate";

describe('CreateGenreUsecase Unit Tests', () => {
	let usecase: CreateGenreUsecase;
	let genreRepo: GenreInMemoryRepository;
	let categoryRepo: CategoryInMemoryRepository;
	let categoriesIdsExistsInStorageValidator: CategoriesIdsExistsInDatabaseValidator;
	let uow: UnitOfWorkFakeInMemory;

	beforeEach(() => {
		uow = new UnitOfWorkFakeInMemory();
		genreRepo = new GenreInMemoryRepository();
		categoryRepo = new CategoryInMemoryRepository();
		categoriesIdsExistsInStorageValidator =
			new CategoriesIdsExistsInDatabaseValidator(categoryRepo);
		usecase = new CreateGenreUsecase(
			uow,
			genreRepo,
			categoryRepo,
			categoriesIdsExistsInStorageValidator,
		);
	});

		describe('execute method', () => {
			it('should throw an entity validation error when categories id not exists', async () => {
				expect.assertions(3);
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

			it('should create a genre', async () => {
				const category1 = Category.fake().aCategory().build();
				const category2 = Category.fake().aCategory().build();
				await categoryRepo.bulkInsert([category1, category2]);

				const spyValidateCategoriesId = jest.spyOn(
					categoriesIdsExistsInStorageValidator,
					'validate'
				);
				const spyInsert = jest.spyOn(genreRepo, 'insert');

				const input = {
					name: 'Genre 1',
					categories_id: [category1.category_id.id, category2.category_id.id],
					is_active: true,
				};
				const output = await usecase.execute(input);

				expect(spyValidateCategoriesId).toHaveBeenCalledWith(input.categories_id);
				expect(spyInsert).toHaveBeenCalledTimes(1);
				expect(output).toBeDefined();
				expect(output.id).toBeDefined();
				expect(output.name).toBe(input.name);
				expect(output.is_active).toBe(input.is_active);
				expect(output.created_at).toBeInstanceOf(Date);
				expect(output.categories_id).toEqual(expect.arrayContaining(input.categories_id));
				expect(output.categories).toHaveLength(2);
				expect(output.categories[0].id).toBe(category1.category_id.id);
			});
		});
});