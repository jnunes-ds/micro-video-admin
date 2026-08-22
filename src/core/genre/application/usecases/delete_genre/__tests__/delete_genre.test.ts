import {UnitOfWorkSequelize} from "@core/@shared/infra/db/sequelize/unit_of_work_sequelize";
import {DeleteGenreUsecase} from "@core/genre/application/usecases/delete_genre/delete_genre.usecase";
import {GenreSequelizeRepository} from "@core/genre/infra/sequelize/genre_sequelize.repository";
import {CategorySequelizeRepository} from "@core/category/infra/db/sequelize/category-sequelize.repository";
import {setupSequelize} from "@core/@shared/infra/testing/helpers";
import {GenreCategoryModel, GenreModel} from "@core/genre/infra/sequelize/genre.model";
import {CategoryModel} from "@core/category/infra/db/sequelize/category.model";
import {Genre, GenreId} from "@core/genre/domain/genre.aggregate";
import {NotFoundError} from "@core/@shared/domain/errors/not_found.error";
import {Category} from "@core/category/domain/category.aggregate";

describe("DeleteGenreUseacase Integration Tests", () => {
	let uow: UnitOfWorkSequelize;
	let usecase: DeleteGenreUsecase;
	let genreRepo: GenreSequelizeRepository;
	let categoryRepo: CategorySequelizeRepository;

	let sequelizeHelper = setupSequelize({
		models: [GenreModel, GenreCategoryModel, CategoryModel]
	});

	beforeEach(() => {
		uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
		categoryRepo = new CategorySequelizeRepository(CategoryModel);
		genreRepo = new GenreSequelizeRepository(GenreModel, uow);
		usecase = new DeleteGenreUsecase(uow, genreRepo)
	});

	test("if throws error when entity not found", async () => {
		const genreId = new GenreId();
		await expect(() => usecase.execute({id: genreId.id})).rejects.toThrow(
			new NotFoundError(genreId.id, Genre)
		);
	});

	test("delete genre", async () => {
		const categories = Category.fake().theCategories(2).build();
		await categoryRepo.bulkInsert(categories);
		const genre = Genre.fake()
			.aGenre()
			.addCategoryId(categories[0].category_id)
			.addCategoryId(categories[1].category_id)
			.build();
		await expect(genreRepo.findById(genre.genre_id)).resolves.toBeNull();
	});

	test("rollback transaction", async () => {
		const categories = Category.fake().theCategories(2).build();
		await categoryRepo.bulkInsert(categories);
		const genre = Genre.fake()
			.aGenre()
			.addCategoryId(categories[0].category_id)
			.addCategoryId(categories[1].category_id)
			.build();
		await genreRepo.insert(genre);

		GenreModel.afterBulkDestroy('hook-test', () => {
			return Promise.reject(new Error('Generic Error'));
		});

		await expect(
			usecase.execute({
				id: genre.genre_id.id
			})
		).rejects.toThrow('Generic Error');

		GenreModel.removeHook('afterBulkDestroy', 'hook-test');

		const genres = await genreRepo.findAll();
		expect(genres.length).toEqual(1);
	});

});