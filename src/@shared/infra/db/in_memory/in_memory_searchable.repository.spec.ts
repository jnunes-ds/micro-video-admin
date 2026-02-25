import {Uuid} from "@/@shared/domain/value_objects/uuid.vo";
import {Entity} from "@/@shared/domain/entity";
import {InMemorySearchableRepository} from "@/@shared/infra/db/in_memory/in_memory.repository";
import {SearchParams} from "@/@shared/domain/repository/search_params";
import {SearchResult} from "@/@shared/domain/repository/search_result";

type StubEntityConstructorProps = {
	entity_id?: Uuid;
	name: string;
	price: number;
};

class StubEntity extends Entity {
	entity_id: Uuid;
	name: string;
	price: number;
	constructor(props: StubEntityConstructorProps) {
		super();
		this.entity_id = props.entity_id ?? new Uuid();
		this.name = props.name;
		this.price = +props.price;
	}

	toJSON(): {id: string} & StubEntityConstructorProps {
		return {
			id: this.entity_id.id,
			name: this.name,
			price: this.price
		}
	}
}

class StubInMemorySearchableRepository extends InMemorySearchableRepository<StubEntity, Uuid> {
	sortableFields: string[] = ['name'];

	getEntity(): new (...args: any[]) => StubEntity {
		return StubEntity;
	}

	protected async applyFilter(
		items: StubEntity[],
		filter: string | null
	): Promise<StubEntity[]> {
		if (!filter) {
			return items;
		}

		return items.filter((i) => {
			return (
				i.name.toLowerCase().includes(filter.toLowerCase()) ||
				i.price.toString() === filter
			);
		});
	}
}

describe('InMemorySearchableRepository Unit Tests', () => {
	let repository: StubInMemorySearchableRepository;

	beforeEach(() => (repository = new StubInMemorySearchableRepository()));

	describe('applyFilter method', () => {
		it('should no filter items when filter params is null', async () => {
			const items = [new StubEntity({name: 'name value', price: 5})];
			const spyFilterMethod = jest.spyOn(items, 'filter');
			const itemsFiltered = await repository['applyFilter'](items, null);
			expect(itemsFiltered).toStrictEqual(items);
			expect(spyFilterMethod).not.toHaveBeenCalled();
		});

		it('should filter using a filter param', async () => {
			const items = [
				new StubEntity({name: 'test', price: 5}),
				new StubEntity({name: 'TEST', price: 5}),
				new StubEntity({name: 'fake', price: 0}),
			];

			const spyFilterMethod = jest.spyOn(items, 'filter');
			let itemsFiltered = await repository['applyFilter'](items, 'TEST');

			expect(itemsFiltered).toHaveLength(2);
			expect(spyFilterMethod).toHaveBeenCalledTimes(1);

			itemsFiltered = await repository['applyFilter'](items, '5');
			expect(itemsFiltered).toStrictEqual([items[0], items[1]]);
			expect(spyFilterMethod).toHaveBeenCalledTimes(2);

			itemsFiltered = await repository['applyFilter'](items, 'no-filter');
			expect(itemsFiltered).toHaveLength(0);
			expect(spyFilterMethod).toHaveBeenCalledTimes(3);
		});
	});

	describe('applySort method', () => {
		it('should no sort items', async () => {
			const items = [
				new StubEntity({name: 'b', price: 5}),
				new StubEntity({name: 'a', price: 5}),
			];

			let itemsSorted = repository['applySort'](items, null, null);
			expect(itemsSorted).toStrictEqual(items);

			itemsSorted = repository['applySort'](items, 'price', 'asc');
			expect(itemsSorted).toStrictEqual(items);
		});

		it('should sort items', async () => {
			const items = [
				new StubEntity({name: 'b', price: 5}),
				new StubEntity({name: 'a', price: 5}),
				new StubEntity({name: 'c', price: 5}),
			];

			let itemsSorted = repository['applySort'](items, 'name', 'asc');
			expect(itemsSorted).toStrictEqual([items[1], items[0], items[2]]);

			itemsSorted = repository['applySort'](items, 'name', 'desc');
			expect(itemsSorted).toStrictEqual([items[2], items[0], items[1]]);
		});
	});

	describe('applyPaginate method', () => {
		it('should paginate items', async () => {
			const items = [
				new StubEntity({name: 'b', price: 5}),
				new StubEntity({name: 'a', price: 5}),
				new StubEntity({name: 'c', price: 5}),
				new StubEntity({name: 'd', price: 5}),
				new StubEntity({name: 'e', price: 5}),
			];

			let itemsPaginated = repository['applyPaginate'](items, 1, 2);
			expect(itemsPaginated).toStrictEqual([items[0], items[1]]);

			itemsPaginated = repository['applyPaginate'](items, 2, 2);
			expect(itemsPaginated).toStrictEqual([items[2], items[3]]);

			itemsPaginated = repository['applyPaginate'](items, 3, 2);
			expect(itemsPaginated).toStrictEqual([items[4]]);

			itemsPaginated = repository['applyPaginate'](items, 4, 2);
			expect(itemsPaginated).toStrictEqual([]);
		});
	});

	describe('search method', () => {
		it('should apply only paginate when other params are null', async () => {
			const entity = new StubEntity({name: 'a', price: 5});
			const items = Array(16).fill(entity);
			repository.items = items;

			const result = await repository.search(new SearchParams());
			expect(result).toStrictEqual(new SearchResult({
				items: Array(15).fill(entity),
				total: 16,
				current_page: 1,
				per_page: 15,
			}));
		});

		it('should apply paginate and filter', async () => {
			const items = [
				new StubEntity({name: 'test', price: 5}),
				new StubEntity({name: 'a', price: 5}),
				new StubEntity({name: 'TEST', price: 5}),
				new StubEntity({name: 'teSt', price: 5}),
			];
			repository.items = items;

			let result = await repository.search(
				new SearchParams({page: 1, per_page: 2, filter: 'TEST'})
			);

			expect(result).toStrictEqual(new SearchResult({
				items: [items[0], items[2]],
				total: 3,
				current_page: 1,
				per_page: 2,
			}));
		});

		describe('should apply paginate and sort', () => {
			const items = [
				new StubEntity({name: 'b', price: 5}),
				new StubEntity({name: 'a', price: 5}),
				new StubEntity({name: 'd', price: 5}),
				new StubEntity({name: 'c', price: 5}),
				new StubEntity({name: 'e', price: 5}),
			];

			const arrange = [
				{
					search_params: new SearchParams({
						page: 1,
						per_page: 2,
						sort: 'name',
					}),
					search_result: new SearchResult({
						items: [items[1], items[0]],
						total: 5,
						current_page: 1,
						per_page: 2,
					}),
				},
				{
					search_params: new SearchParams({
						page: 2,
						per_page: 2,
						sort: 'name',
					}),
					search_result: new SearchResult({
						items: [items[3], items[2]],
						total: 5,
						current_page: 2,
						per_page: 2,
					}),
				},
				{
					search_params: new SearchParams({
						page: 1,
						per_page: 2,
						sort: 'name',
						sort_dir: 'desc',
					}),
					search_result: new SearchResult({
						items: [items[4], items[2]],
						total: 5,
						current_page: 1,
						per_page: 2,
					}),
				},
			];

			beforeEach(() => {
				repository.items = items;
			});

			test.each(arrange)(
				'when value is %j',
				async ({search_params, search_result}) => {
					const result = await repository.search(search_params);
					expect(result).toStrictEqual(search_result);
				}
			);

		});
	});
});