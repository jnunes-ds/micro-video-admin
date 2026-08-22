import {ListGenresUsecase} from "@core/genre/application/usecases/list_genres/list_genres.usecase";
import {GenreInMemoryRepository} from "@core/genre/infra/in_memory/genre_in_memory.repository";
import {CategoryInMemoryRepository} from "@core/category/infra/db/in_memory/category_in_memory.repository";
import {SearchResult} from "@core/@shared/domain/repository/search_result";
import {Genre} from "@core/genre/domain/genre.aggregate";
import {Category} from "@core/category/domain/category.aggregate";
import {GenreOutputMapper} from "@core/genre/application/usecases/common/genre_output";

describe('ListGenresUsecase Unit Tests', () => {
	let usecase: ListGenresUsecase;
	let genreRepo: GenreInMemoryRepository;
	let categoryRepo: CategoryInMemoryRepository;

	beforeEach(() => {
		genreRepo = new GenreInMemoryRepository();
		categoryRepo = new CategoryInMemoryRepository();
		usecase = new ListGenresUsecase(genreRepo, categoryRepo);
	});

	test('toOutput method', async () => {
		let result = new SearchResult<Genre>({
			items: [],
			total: 1,
			current_page: 1,
			per_page: 2,
		});
		let output = await usecase['toOutput'](result);
		expect(output).toStrictEqual({
			items: [],
			total: 1,
			current_page: 1,
			per_page: 2,
			last_page: 1
		});

		const category = Category.fake().aCategory().withName('test category').build();
		await categoryRepo.insert(category);

		const entity = Genre.fake()
			.aGenre()
			.withName('test genre')
			.addCategoryId(category.category_id)
			.build();

		result = new SearchResult({
			items: [entity],
			total: 1,
			current_page: 1,
			per_page: 2,
		});

		output = await usecase['toOutput'](result);
		expect(output).toStrictEqual({
			items: [
				{
					id: entity.genre_id.id,
					name: entity.name,
					categories: [{
						id: category.category_id.id,
						name: category.name,
						created_at: category.created_at
					}],
					categories_id: [category.category_id.id],
					is_active: entity.is_active,
					created_at: entity.created_at,
				}
			],
			total: 1,
			current_page: 1,
			per_page: 2,
			last_page: 1
		})
	});

	it('should return output sorted by created_at when input param is empty', async () => {
		const category = Category.fake().aCategory().withName('test category').build();
		await categoryRepo.insert(category);

		const items = Genre.fake()
			.theGenres(2)
			.withName(index => `name ${index + 1}`)
			.withCreatedAt(index => new Date(new Date().getTime() + (index + 1) * 1000))
			.addCategoryId(category.category_id)
			.build();

		genreRepo.items = items;

		const output = await usecase.execute({per_page: 2});

		expect(output).toStrictEqual({
			items: [...items].reverse().map(item => GenreOutputMapper.toOutput(item, [category])),
			total: 2,
			current_page: 1,
			per_page: 2,
			last_page: 1
		});
	});

	it('should return output using pagination, sort and filter', async () => {
		const category = Category.fake().aCategory().withName('test category').build();
		await categoryRepo.insert(category);

		const items = [
			Genre.fake().aGenre().withName('a').addCategoryId(category.category_id).build(),
			Genre.fake().aGenre().withName('AAA').addCategoryId(category.category_id).build(),
			Genre.fake().aGenre().withName('AaA').addCategoryId(category.category_id).build(),
			Genre.fake().aGenre().withName('b').addCategoryId(category.category_id).build(),
			Genre.fake().aGenre().withName('c').addCategoryId(category.category_id).build(),
		];

		genreRepo.items = items;

		const output = await usecase.execute({
			page: 1,
			per_page: 2,
			sort: 'name',
			sort_dir: 'asc',
			filter: { name: 'a' }
		});

		expect(output).toStrictEqual({
			items: [items[1], items[2]].map(item => GenreOutputMapper.toOutput(item, [category])),
			total: 3,
			current_page: 1,
			per_page: 2,
			last_page: 2
		});
	});
});
