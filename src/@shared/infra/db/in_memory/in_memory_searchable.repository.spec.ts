import {Uuid} from "@/@shared/domain/value_objects/uuid.vo";
import {Entity} from "@/@shared/domain/entity";
import {InMemorySearchableRepository} from "@/@shared/infra/db/in_memory/in_memory.repository";

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
		it('[IT] should no filter items when filter params is null', async () => {
			const items = [new StubEntity({name: 'name value', price: 5})];
			const spyFilterMethod = jest.spyOn(items, 'filter');
			const itemsFiltered = await repository['applyFilter'](items, null);
			expect(itemsFiltered).toStrictEqual(items);
			expect(spyFilterMethod).not.toHaveBeenCalled();
		});

		it('[IT] should filter using a filter param', async () => {
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

	describe('applySort method', () => {});

	describe('applyPaginate method', () => {});

	describe('search method', () => {});
});