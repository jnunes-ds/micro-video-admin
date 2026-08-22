import {GetGenreUsecase} from "@core/genre/application/usecases/get_genre/get_genre.usecase";
import {GenreInMemoryRepository} from "@core/genre/infra/in_memory/genre_in_memory.repository";
import {CategoryInMemoryRepository} from "@core/category/infra/db/in_memory/category_in_memory.repository";
import {InvalidUuidError} from "@core/@shared/domain/value_objects/uuid.vo";
import {NotFoundError} from "@core/@shared/domain/errors/not_found.error";
import {Genre, GenreId} from "@core/genre/domain/genre.aggregate";
import {Category} from "@core/category/domain/category.aggregate";

describe('GetGenreUsecase Unit Tests', () => {
	let usecase: GetGenreUsecase;
	let genreRepo: GenreInMemoryRepository;
	let categoryRepo: CategoryInMemoryRepository;

	beforeEach(() => {
		genreRepo = new GenreInMemoryRepository();
		categoryRepo = new CategoryInMemoryRepository();
		usecase = new GetGenreUsecase(genreRepo, categoryRepo);
	});

	it('should throws an error when entity is not found', async () => {
		await expect(
			() => usecase.execute({id: 'fake id'})
		).rejects.toThrow(new InvalidUuidError());

		const genreId = new GenreId();

		await expect(
			() => usecase.execute({id: genreId.id })
		).rejects.toThrow(new NotFoundError(genreId.id, Genre));
	});

	it('should get a genre by id', async () => {
		const categories = Category.fake().theCategories(2).build();
		await categoryRepo.bulkInsert(categories);
		
		const genre = Genre.fake()
			.aGenre()
			.addCategoryId(categories[0].category_id)
			.addCategoryId(categories[1].category_id)
			.build();
		await genreRepo.insert(genre);

		const spyGenre = jest.spyOn(genreRepo, 'findById');
		const spyCategory = jest.spyOn(categoryRepo, 'findByIds');
		const output = await usecase.execute({id: genre.genre_id.id});

		expect(spyGenre).toHaveBeenCalledTimes(1);
		expect(spyCategory).toHaveBeenCalledTimes(1);
		expect(output).toStrictEqual({
			id: genre.genre_id.id,
			name: genre.name,
			categories_id: [categories[0].category_id.id, categories[1].category_id.id],
			categories: [
				{
					id: categories[0].category_id.id,
					name: categories[0].name,
					created_at: categories[0].created_at
				},
				{
					id: categories[1].category_id.id,
					name: categories[1].name,
					created_at: categories[1].created_at
				}
			],
			is_active: genre.is_active,
			created_at: genre.created_at
		});
	});
});