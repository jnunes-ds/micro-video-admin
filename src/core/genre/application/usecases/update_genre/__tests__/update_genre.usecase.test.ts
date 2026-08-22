import {UnitOfWorkSequelize} from "@core/@shared/infra/db/sequelize/unit_of_work_sequelize";
import {UpdateGenreUsecase} from "@core/genre/application/usecases/update_genre/update_genre.usecase";
import {GenreSequelizeRepository} from "@core/genre/infra/sequelize/genre_sequelize.repository";
import {CategorySequelizeRepository} from "@core/category/infra/db/sequelize/category-sequelize.repository";
import {
	CategoriesIdsExistsInStorageValidator
} from "@core/category/application/validations/categories_ids_exists_in_storage.validator";
import {setupSequelize} from "@core/@shared/infra/testing/helpers";
import {GenreCategoryModel, GenreModel} from "@core/genre/infra/sequelize/genre.model";
import {CategoryModel} from "@core/category/infra/db/sequelize/category.model";
import {NotFoundError} from "@core/@shared/domain/errors/not_found.error";
import {Genre} from "@core/genre/domain/genre.aggregate";
import {EntityValidationError} from "@core/@shared/domain/validators/validation.error";
import {Category} from "@core/category/domain/category.aggregate";

describe('UpdateGenreUsecase integration tests', () => {
	let uow: UnitOfWorkSequelize;
	let usecase: UpdateGenreUsecase;
	let genreRepo: GenreSequelizeRepository;
	let categoryRepo: CategorySequelizeRepository;
	let categoriesIdsExistsInStorageValidator: CategoriesIdsExistsInStorageValidator;

	const sequelizerHelper = setupSequelize({
		models: [GenreModel, GenreCategoryModel, CategoryModel]
	});

	beforeEach(() => {
		uow = new UnitOfWorkSequelize(sequelizerHelper.sequelize);
		genreRepo = new GenreSequelizeRepository(GenreModel, uow);
		categoryRepo = new CategorySequelizeRepository(CategoryModel);
		categoriesIdsExistsInStorageValidator = new CategoriesIdsExistsInStorageValidator(categoryRepo);
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
			const category = Category.create({ name: 'c1' });
			await categoryRepo.insert(category);

			const genre = Genre.fake().aGenre().addCategoryId(category.category_id).build();
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

			let output = await usecase.execute({
				id: genre.genre_id.id,
				name: 'test update',
				categories_id: [category2.category_id.id]
			});

			expect(spyValidateCategoriesId).toHaveBeenCalledWith([category2.category_id.id]);

			let updatedGenre = await genreRepo.findById(genre.genre_id);
			expect(updatedGenre).toBeDefined();
			expect(updatedGenre!.name).toBe('test update');
			expect(updatedGenre!.categories_id.size).toBe(1);
			expect(updatedGenre!.categories_id.has(category2.category_id.id)).toBeTruthy();

			expect(output).toStrictEqual({
				id: genre.genre_id.id,
				name: 'test update',
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
			updatedGenre = await genreRepo.findById(genre.genre_id);
			expect(updatedGenre!.is_active).toBe(false);
			expect(output.is_active).toBe(false);

			output = await usecase.execute({
				id: genre.genre_id.id,
				is_active: true
			});
			updatedGenre = await genreRepo.findById(genre.genre_id);
			expect(updatedGenre!.is_active).toBe(true);
			expect(output.is_active).toBe(true);
		});

		it('should rollback transaction on error', async () => {
			const category1 = Category.fake().aCategory().build();
			const category2 = Category.fake().aCategory().build();
			await categoryRepo.bulkInsert([category1, category2]);

			const genre = Genre.fake()
				.aGenre()
				.addCategoryId(category1.category_id)
				.withName('original name')
				.build();
			await genreRepo.insert(genre);

			const spyUpdate = jest.spyOn(genreRepo, 'update').mockImplementation(() => {
				throw new Error('Simulated error during update');
			});

			const input = {
				id: genre.genre_id.id,
				name: 'updated name',
				categories_id: [category2.category_id.id],
			};

			await expect(usecase.execute(input)).rejects.toThrow('Simulated error during update');

			expect(spyUpdate).toHaveBeenCalledTimes(1);

			// Should be unchanged
			const genres = await genreRepo.findAll();
			expect(genres).toHaveLength(1);
			const unchangedGenre = genres[0];
			expect(unchangedGenre.name).toBe('original name');
			expect(unchangedGenre.categories_id.size).toBe(1);
			expect(unchangedGenre.categories_id.has(category1.category_id.id)).toBeTruthy();

			const categories = await categoryRepo.findAll();
			expect(categories).toHaveLength(2);
		});
	});
});