import {GenreInMemoryRepository} from "@core/genre/infra/in_memory/genre_in_memory.repository";
import {Genre} from "@core/genre/domain/genre.aggregate";
import {CategoryId} from "@core/category/domain/category.aggregate";


describe('GenreInMemoryRepository Unit Tests', () => {
	let repository: GenreInMemoryRepository;

	beforeEach(() => (repository = new GenreInMemoryRepository()));

	it('should have Genre as the entity', () => {
		expect(repository.getEntity()).toBe(Genre);
	});

	describe('applyFilter method', () => {
		it('should not filter items when filter object is null', async () => {
			const items = [Genre.fake().aGenre().build()];
			const filterSpy = jest.spyOn(items, 'filter');

			const itemsFiltered = await repository['applyFilter'](items, null);
			expect(filterSpy).not.toHaveBeenCalled();
			expect(itemsFiltered).toStrictEqual(items);
		});

		it('should filter items by name', async () => {
			const items = [
				Genre.fake().aGenre().withName('test').build(),
				Genre.fake().aGenre().withName('TEST').build(),
				Genre.fake().aGenre().withName('fake').build(),
			];
			const filterSpy = jest.spyOn(items, 'filter');

			const itemsFiltered = await repository['applyFilter'](items, {name: 'TEST'});
			expect(filterSpy).toHaveBeenCalledTimes(1);
			expect(itemsFiltered).toStrictEqual([items[0], items[1]]);
		});

		it('should filter items by categories_id', async () => {
			const category_id1 = new CategoryId();
			const category_id2 = new CategoryId();
			const category_id3 = new CategoryId();

			const items = [
				Genre.fake().aGenre().addCategoryId(category_id1).build(),
				Genre.fake().aGenre().addCategoryId(category_id2).build(),
				Genre.fake().aGenre().addCategoryId(category_id3).build(),
			];
			const filterSpy = jest.spyOn(items, 'filter');

			let itemsFiltered = await repository['applyFilter'](items, {
				categories_id: [category_id1]
			});
			expect(filterSpy).toHaveBeenCalledTimes(1);
			expect(itemsFiltered).toStrictEqual([items[0]]);

			itemsFiltered = await repository['applyFilter'](items, {
				categories_id: [category_id1, category_id2]
			});
			expect(filterSpy).toHaveBeenCalledTimes(2);
			expect(itemsFiltered).toStrictEqual([items[0], items[1]]);
		});

		it('should filter items by name and categories_id', async () => {
			const category_id1 = new CategoryId();
			const category_id2 = new CategoryId();

			const items = [
				Genre.fake().aGenre().withName('test').addCategoryId(category_id1).build(),
				Genre.fake().aGenre().withName('fake').addCategoryId(category_id1).build(),
				Genre.fake().aGenre().withName('test').addCategoryId(category_id2).build(),
			];

			const itemsFiltered = await repository['applyFilter'](items, {
				name: 'test',
				categories_id: [category_id1]
			});
			expect(itemsFiltered).toStrictEqual([items[0]]);
		});
	});

	describe('applySort method', () => {
		it('should sort by created_at when sort param is null', async () => {
			const created_at = new Date();
			const items = [
				Genre.fake().aGenre().withName('test').withCreatedAt(created_at).build(),
				Genre.fake().aGenre()
					.withName('TEST')
					.withCreatedAt(new Date(created_at.getTime() + 100))
					.build(),
				Genre.fake().aGenre()
					.withName('fake')
					.withCreatedAt(new Date(created_at.getTime() + 200))
					.build(),
			];

			const itemsSorted = repository['applySort'](items, null, null);
			expect(itemsSorted).toStrictEqual([items[2], items[1], items[0]]);
		});

		it('should sort by name', async () => {
			const items = [
				Genre.fake().aGenre().withName('c').build(),
				Genre.fake().aGenre().withName('a').build(),
				Genre.fake().aGenre().withName('b').build(),
			];

			let itemsSorted = repository['applySort'](items, 'name', 'asc');
			expect(itemsSorted).toStrictEqual([items[1], items[2], items[0]]);

			itemsSorted = repository['applySort'](items, 'name', 'desc');
			expect(itemsSorted).toStrictEqual([items[0], items[2], items[1]]);
		});
	});
});
