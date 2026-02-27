import {CategoryInMemoryRepository} from "@/category/infra/db/category_in_memory.repository";
import {Category} from "@/category/domain/category.entity";

describe('CategoryInMemoryRepository Unit Test', () => {
	let repository: CategoryInMemoryRepository;

	beforeEach(() => (repository = new CategoryInMemoryRepository()));

	it('should no filter items when filter object is null', async () => {
		const items = [Category.create({name: 'test'})];
		const filterSpy = jest.spyOn(items, "filter");

		const itemsFiltered = await repository['applyFilter'](items, null);
		expect(filterSpy).not.toHaveBeenCalled();
		expect(itemsFiltered).toStrictEqual(items);
	});

	it('should filter items using filter parameter',  async () => {
		const items = [
			new Category({name: 'test'}),
			new Category({name: 'TEST'}),
			new Category({name: 'fake'}),
		];

		const filterSpy = jest.spyOn(items, 'filter');

		const itemsFiltered = await repository['applyFilter'](items, 'TEST');
		expect(filterSpy).toHaveBeenCalledTimes(1);
		expect(itemsFiltered).toStrictEqual([items[0], items[1]]);
	});

	it('should sort created_at when sort param is null', async () => {
		const created_at = new Date();
		const items = [
			new Category({name: 'test', created_at}),
			new Category({name: 'TEST', created_at: new Date(created_at.getTime() + 100)}),
			new Category({name: 'fake', created_at: new Date(created_at.getTime() + 200)}),
		];

		const itemsSorted = await repository['applySort'](items, null, null);
		expect(itemsSorted).toStrictEqual(
			[items[2], items[1], items[0]]
		);
	});

	it('should sort by name', async () => {
		const items = [
			Category.create({name: 'c'}),
			Category.create({name: 'a'}),
			Category.create({name: 'b'}),
		];

		let itemsSorted = await repository['applySort'](items, 'name', 'asc');
		expect(itemsSorted).toStrictEqual([items[1], items[2], items[0]]);

		itemsSorted = await repository['applySort'](items, 'name', 'desc');
		expect(itemsSorted).toStrictEqual([items[0], items[2], items[1]]);

	});
});

