import {setupSequelize} from "@core/@shared/infra/testing/helpers";
import {CategoryModel} from "@core/category/infra/db/sequelize/category.model";
import {CategorySequelizeRepository} from "@core/category/infra/db/sequelize/category-sequelize.repository";
import {Category, CategoryId} from "@core/category/domain/category.aggregate";
import {GenreCategoryModel, GenreModel} from "@core/genre/infra/sequelize/genre.model";
import {GenreSequelizeRepository} from "@core/genre/infra/sequelize/genre_sequelize.repository";
import {GenreModelMapper} from "@core/genre/infra/sequelize/genre.model.mapper";
import {Genre, GenreId} from "@core/genre/domain/genre.aggregate";
import {GenreSearchParams} from "@core/genre/domain/genre.repository";
import {SearchResult} from "@core/@shared/domain/repository/search_result";
import {NotFoundError} from "@core/@shared/domain/errors/not_found.error";

describe('GenreSequelizeRepository Integration Test', () => {
	setupSequelize({
		models: [GenreModel, GenreCategoryModel, CategoryModel],
	});

	let repository: GenreSequelizeRepository;
	let categoryRepository: CategorySequelizeRepository;

	beforeEach(async () => {
		repository = new GenreSequelizeRepository(GenreModel);
		categoryRepository = new CategorySequelizeRepository(CategoryModel);
	});

	it('should have Genre as the entity', () => {
		expect(repository.getEntity()).toBe(Genre);
	});

	it('should insert a new genre', async () => {
		const category = Category.fake().aCategory().build();
		await categoryRepository.insert(category);

		const genre = Genre.fake()
			.aGenre()
			.addCategoryId(category.category_id)
			.build();
		await repository.insert(genre);

		const foundedGenre = await repository.findById(genre.gende_id);
		expect(foundedGenre!.toJSON()).toStrictEqual(genre.toJSON());
	});

	it('should insert a new genre with many categories', async () => {
		const categories = Category.fake().theCategories(3).build();
		await categoryRepository.bulkInsert(categories);

		const genre = Genre.fake()
			.aGenre()
			.withCategoriesId(...categories.map(c => c.category_id))
			.build();
		await repository.insert(genre);

		const foundedGenre = await repository.findById(genre.gende_id);
		expect(foundedGenre!.toJSON()).toStrictEqual({
			...genre.toJSON(),
			categories_id: expect.arrayContaining(genre.toJSON().categories_id)
		});
		expect(foundedGenre!.categories_id.size).toBe(3);
	});

	it('should bulk insert genres', async () => {
		const categories = Category.fake().theCategories(2).build();
		await categoryRepository.bulkInsert(categories);

		const genres = Genre.fake()
			.theGenres(3)
			.withCategoriesId(...categories.map(c => c.category_id))
			.build();
		await repository.bulkInsert(genres);

		const foundedGenres = await repository.findAll();
		expect(foundedGenres).toHaveLength(3);
		expect(
			foundedGenres.map(g => g.gende_id.id).sort()
		).toStrictEqual(genres.map(g => g.gende_id.id).sort());
	});

	it('should return null when the genre is not found by id', async () => {
		const foundedGenre = await repository.findById(new GenreId());
		expect(foundedGenre).toBeNull();
	});

	it('should find a genre by id', async () => {
		const category = Category.fake().aCategory().build();
		await categoryRepository.insert(category);

		const genre = Genre.fake()
			.aGenre()
			.addCategoryId(category.category_id)
			.build();
		await repository.insert(genre);

		const foundedGenre = await repository.findById(genre.gende_id);
		expect(foundedGenre!.toJSON()).toStrictEqual(genre.toJSON());
	});

	it('should return all genres', async () => {
		const category = Category.fake().aCategory().build();
		await categoryRepository.insert(category);

		const genres = Genre.fake()
			.theGenres(3)
			.addCategoryId(category.category_id)
			.build();
		await repository.bulkInsert(genres);

		const foundedGenres = await repository.findAll();
		expect(foundedGenres).toHaveLength(3);
		foundedGenres.forEach(genre => expect(genre).toBeInstanceOf(Genre));
	});

	it('should return genres by ids', async () => {
		const category = Category.fake().aCategory().build();
		await categoryRepository.insert(category);

		const genres = Genre.fake()
			.theGenres(3)
			.addCategoryId(category.category_id)
			.build();
		await repository.bulkInsert(genres);

		const foundedGenres = await repository.findByIds([
			genres[0].gende_id,
			genres[1].gende_id,
			new GenreId()
		]);

		expect(foundedGenres).toHaveLength(2);
		expect(
			foundedGenres.map(g => g.gende_id.id).sort()
		).toStrictEqual([genres[0].gende_id.id, genres[1].gende_id.id].sort());
	});

	describe('existsById method tests', () => {
		it('should throw an error when ids is an empty array', async () => {
			await expect(repository.existsById([])).rejects.toThrow(
				new Error('ids must be an array with at least one element')
			);
		});

		it('should return the ids that exist and the ones that do not', async () => {
			const category = Category.fake().aCategory().build();
			await categoryRepository.insert(category);

			const genre = Genre.fake()
				.aGenre()
				.addCategoryId(category.category_id)
				.build();
			await repository.insert(genre);

			const notExistentId = new GenreId();
			const {exists, not_exists} = await repository.existsById([
				genre.gende_id,
				notExistentId
			]);

			expect(exists.map(id => id.id)).toStrictEqual([genre.gende_id.id]);
			expect(not_exists.map(id => id.id)).toStrictEqual([notExistentId.id]);
		});
	});

	it('should throw an error on update when the genre is not found', async () => {
		const genre = Genre.fake().aGenre().build();
		await expect(repository.update(genre)).rejects.toThrow(
			new NotFoundError(genre.gende_id.id, Genre)
		);
	});

	it('should update a genre', async () => {
		const categories = Category.fake().theCategories(3).build();
		await categoryRepository.bulkInsert(categories);

		const genre = Genre.fake()
			.aGenre()
			.withName('Movie')
			.addCategoryId(categories[0].category_id)
			.build();
		await repository.insert(genre);

		genre.changeName('Movie updated');
		genre.syncCategoriesId([
			categories[1].category_id,
			categories[2].category_id
		]);
		await repository.update(genre);

		const foundedGenre = await repository.findById(genre.gende_id);
		expect(foundedGenre!.toJSON()).toStrictEqual({
			...genre.toJSON(),
			categories_id: expect.arrayContaining(genre.toJSON().categories_id)
		});
		expect(foundedGenre!.name).toBe('Movie updated');
		expect(foundedGenre!.categories_id.size).toBe(2);
	});

	it('should throw an error on delete when the genre is not found', async () => {
		const genreId = new GenreId();
		await expect(repository.delete(genreId)).rejects.toThrow(
			new NotFoundError(genreId.id, Genre)
		);
	});

	it('should delete a genre and its categories relations', async () => {
		const category = Category.fake().aCategory().build();
		await categoryRepository.insert(category);

		const genre = Genre.fake()
			.aGenre()
			.addCategoryId(category.category_id)
			.build();
		await repository.insert(genre);

		await repository.delete(genre.gende_id);

		await expect(repository.findById(genre.gende_id)).resolves.toBeNull();
		await expect(
			GenreCategoryModel.count({where: {genre_id: genre.gende_id.id}})
		).resolves.toBe(0);
	});

	describe('search method tests', () => {
		it('should only apply paginate when other params are null', async () => {
			const category = Category.fake().aCategory().build();
			await categoryRepository.insert(category);

			const created_at = new Date();
			const genres = Genre.fake()
				.theGenres(16)
				.withName('Movie')
				.addCategoryId(category.category_id)
				.withCreatedAt(created_at)
				.build();
			await repository.bulkInsert(genres);
			const spyToEntity = jest.spyOn(GenreModelMapper, 'toEntity');

			const searchOutput = await repository.search(GenreSearchParams.create({}));
			expect(searchOutput).toBeInstanceOf(SearchResult);
			expect(spyToEntity).toHaveBeenCalledTimes(15);
			expect(searchOutput.toJSON()).toMatchObject({
				total: 16,
				current_page: 1,
				last_page: 2,
				per_page: 15
			});
			searchOutput.items.forEach(item => {
				expect(item).toBeInstanceOf(Genre);
				expect(item.gende_id).toBeInstanceOf(GenreId);
				expect(item.name).toBe('Movie');
				expect(item.is_active).toBeTruthy();
				expect(item.created_at).toEqual(created_at);
				expect(item.categories_id.size).toBe(1);
			});
		});

		it('should order by created_at DESC when search params are null', async () => {
			const category = Category.fake().aCategory().build();
			await categoryRepository.insert(category);

			const created_at = new Date();
			const genres = Genre.fake()
				.theGenres(16)
				.withName('Movie')
				.addCategoryId(category.category_id)
				.withCreatedAt(index => new Date(created_at.getTime() + index * 100))
				.build();
			await repository.bulkInsert(genres);

			const searchOutput = await repository.search(GenreSearchParams.create({}));
			const items = searchOutput.items;
			[...items].reverse().forEach((item, index) => {
				expect(`${item.created_at}`).toBe(`${genres[index + 1].created_at}`);
			});
		});

		it('should apply paginate and filter by name', async () => {
			const category = Category.fake().aCategory().build();
			await categoryRepository.insert(category);

			const genres = [
				Genre.fake()
					.aGenre()
					.withName('test')
					.addCategoryId(category.category_id)
					.withCreatedAt(new Date(new Date().getTime() + 5000))
					.build(),
				Genre.fake()
					.aGenre()
					.withName('a')
					.addCategoryId(category.category_id)
					.withCreatedAt(new Date(new Date().getTime() + 4000))
					.build(),
				Genre.fake()
					.aGenre()
					.withName('TEST')
					.addCategoryId(category.category_id)
					.withCreatedAt(new Date(new Date().getTime() + 3000))
					.build(),
				Genre.fake()
					.aGenre()
					.withName('TeSt')
					.addCategoryId(category.category_id)
					.withCreatedAt(new Date(new Date().getTime() + 1000))
					.build()
			];
			await repository.bulkInsert(genres);

			let searchOutput = await repository.search(
				GenreSearchParams.create({
					page: 1,
					per_page: 2,
					filter: {name: 'TEST'}
				})
			);
			expect(searchOutput.toJSON(true)).toMatchObject(
				new SearchResult({
					items: [genres[0], genres[2]],
					total: 3,
					current_page: 1,
					per_page: 2
				}).toJSON(true)
			);

			searchOutput = await repository.search(
				GenreSearchParams.create({
					page: 2,
					per_page: 2,
					filter: {name: 'TEST'}
				})
			);
			expect(searchOutput.toJSON(true)).toMatchObject(
				new SearchResult({
					items: [genres[3]],
					total: 3,
					current_page: 2,
					per_page: 2
				}).toJSON(true)
			);
		});

		it('should apply paginate and filter by categories_id', async () => {
			const categories = Category.fake().theCategories(4).build();
			await categoryRepository.bulkInsert(categories);

			const genres = [
				Genre.fake()
					.aGenre()
					.addCategoryId(categories[0].category_id)
					.withCreatedAt(new Date(new Date().getTime() + 4000))
					.build(),
				Genre.fake()
					.aGenre()
					.addCategoryId(categories[0].category_id)
					.addCategoryId(categories[1].category_id)
					.withCreatedAt(new Date(new Date().getTime() + 3000))
					.build(),
				Genre.fake()
					.aGenre()
					.addCategoryId(categories[1].category_id)
					.addCategoryId(categories[2].category_id)
					.withCreatedAt(new Date(new Date().getTime() + 2000))
					.build(),
				Genre.fake()
					.aGenre()
					.addCategoryId(categories[3].category_id)
					.withCreatedAt(new Date(new Date().getTime() + 1000))
					.build()
			];
			await repository.bulkInsert(genres);

			const arrange = [
				{
					params: GenreSearchParams.create({
						page: 1,
						per_page: 2,
						filter: {categories_id: [categories[0].category_id]}
					}),
					expected: {ids: [genres[0].gende_id.id, genres[1].gende_id.id], total: 2}
				},
				{
					params: GenreSearchParams.create({
						page: 1,
						per_page: 2,
						filter: {
							categories_id: [
								categories[0].category_id,
								categories[1].category_id
							]
						}
					}),
					expected: {ids: [genres[0].gende_id.id, genres[1].gende_id.id], total: 3}
				},
				{
					params: GenreSearchParams.create({
						page: 2,
						per_page: 2,
						filter: {
							categories_id: [
								categories[0].category_id,
								categories[1].category_id
							]
						}
					}),
					expected: {ids: [genres[2].gende_id.id], total: 3}
				}
			];

			for (const item of arrange) {
				const searchOutput = await repository.search(item.params);
				expect(searchOutput.total).toBe(item.expected.total);
				expect(searchOutput.items.map(g => g.gende_id.id)).toStrictEqual(
					item.expected.ids
				);
			}
		});

		it('should return an empty result when no genre matches the categories_id filter', async () => {
			const category = Category.fake().aCategory().build();
			await categoryRepository.insert(category);

			const genre = Genre.fake()
				.aGenre()
				.addCategoryId(category.category_id)
				.build();
			await repository.insert(genre);

			const searchOutput = await repository.search(
				GenreSearchParams.create({
					filter: {categories_id: [new CategoryId()]}
				})
			);

			expect(searchOutput.toJSON()).toStrictEqual({
				items: [],
				total: 0,
				current_page: 1,
				per_page: 15,
				last_page: 0
			});
		});

		it('should apply paginate and sort', async () => {
			expect(repository.sortableFields).toStrictEqual(['name', 'created_at']);

			const category = Category.fake().aCategory().build();
			await categoryRepository.insert(category);

			const genres = [
				Genre.fake().aGenre().withName('b').addCategoryId(category.category_id).build(),
				Genre.fake().aGenre().withName('a').addCategoryId(category.category_id).build(),
				Genre.fake().aGenre().withName('d').addCategoryId(category.category_id).build(),
				Genre.fake().aGenre().withName('e').addCategoryId(category.category_id).build(),
				Genre.fake().aGenre().withName('c').addCategoryId(category.category_id).build()
			];
			await repository.bulkInsert(genres);

			const arrange = [
				{
					params: GenreSearchParams.create({page: 1, per_page: 2, sort: 'name'}),
					expected: [genres[1], genres[0]]
				},
				{
					params: GenreSearchParams.create({page: 2, per_page: 2, sort: 'name'}),
					expected: [genres[4], genres[2]]
				},
				{
					params: GenreSearchParams.create({
						page: 1,
						per_page: 2,
						sort: 'name',
						sort_dir: 'desc'
					}),
					expected: [genres[3], genres[2]]
				},
				{
					params: GenreSearchParams.create({
						page: 2,
						per_page: 2,
						sort: 'name',
						sort_dir: 'desc'
					}),
					expected: [genres[4], genres[0]]
				}
			];

			for (const item of arrange) {
				const searchOutput = await repository.search(item.params);
				expect(searchOutput.items.map(g => g.name)).toStrictEqual(
					item.expected.map(g => g.name)
				);
				expect(searchOutput.total).toBe(5);
			}
		});

		describe('should search using filter by name, sort and paginate', () => {
			const category = Category.fake().aCategory().build();
			const genres = [
				Genre.fake().aGenre().withName('test').addCategoryId(category.category_id).build(),
				Genre.fake().aGenre().withName('a').addCategoryId(category.category_id).build(),
				Genre.fake().aGenre().withName('TEST').addCategoryId(category.category_id).build(),
				Genre.fake().aGenre().withName('e').addCategoryId(category.category_id).build(),
				Genre.fake().aGenre().withName('TeSt').addCategoryId(category.category_id).build()
			];

			const arrange = [
				{
					label: 'filter TEST, page 1',
					params: GenreSearchParams.create({
						page: 1,
						per_page: 2,
						sort: 'name',
						filter: {name: 'TEST'}
					}),
					result: {names: ['TEST', 'TeSt'], total: 3, current_page: 1}
				},
				{
					label: 'filter TEST, page 2',
					params: GenreSearchParams.create({
						page: 2,
						per_page: 2,
						sort: 'name',
						filter: {name: 'TEST'}
					}),
					result: {names: ['test'], total: 3, current_page: 2}
				}
			];

			beforeEach(async () => {
				await categoryRepository.insert(category);
				await repository.bulkInsert(genres);
			});

			test.each(arrange)(
				'when value is $label',
				async ({params, result}) => {
					const searchOutput = await repository.search(params);
					expect(searchOutput.items.map(g => g.name)).toStrictEqual(result.names);
					expect(searchOutput.total).toBe(result.total);
					expect(searchOutput.current_page).toBe(result.current_page);
				}
			);
		});
	});
});
