import {InMemoryRepository} from "@/@shared/infra/db/in_memory/in_memory.repository";
import {Entity} from "@/@shared/domain/entity";
import {Uuid} from "@/@shared/domain/value_objects/uuid.vo";
import {NotFoundError} from "@/@shared/domain/errors/not_found.error";

type StubEntityConstructorProps = {
	entity_id?: Uuid;
	name: string;
	price: number;
}

class StubEntity extends Entity {
	entity_id: Uuid;
	name: string;
	price: number;

	constructor({entity_id, name, price}: StubEntityConstructorProps) {
		super();
		this.entity_id = entity_id || new Uuid();
		this.name = name;
		this.price = price;
	}

	toJSON() {
		return {
			entity_id: this.entity_id,
			name: this.name,
			price: this.price
		}
	}
}

class StubInMemoryRepository extends InMemoryRepository<StubEntity, Uuid> {
	getEntity(): { new(...args: any[]): StubEntity } {
		return StubEntity;
	}
}

describe('InMemoryRepository Unit Tests', () => {
  let repository: StubInMemoryRepository;

	beforeEach(() => {
		repository = new StubInMemoryRepository();
	});

	it('[IT] should insert a new entity', async () => {
		const entity = new StubEntity({
			entity_id: new Uuid(),
			name: 'Test',
			price: 100
		});

		await repository.insert(entity);
		expect(repository?.items.length).toBe(1);
		expect(repository?.items[0]).toEqual(entity);
	});

	it('[IT] should bulk insert entities', async () => {
		const entities: StubEntity[] = [
			new StubEntity({
				entity_id: new Uuid(),
				name: 'Test 1',
				price: 100
			}),
			new StubEntity({
				entity_id: new Uuid(),
				name: 'Test 2',
				price: 200
			})
		];

		await repository.bulkInsert(entities);
		expect(repository?.items.length).toBe(2);
		expect(repository?.items).toEqual(entities);
	});

	it('[IT] should retorns all entities', async () => {
		const entity1 = new StubEntity({
			entity_id: new Uuid(),
			name: 'Test 1',
			price: 100
		});
		const entity2 = new StubEntity({
			entity_id: new Uuid(),
			name: 'Test 2',
			price: 100
		});
		await repository.insert(entity1);
		await repository.insert(entity2);

		const entities = await repository.findAll();
		expect(entities).toStrictEqual([entity1, entity2]);
	});

	it('[IT] should throws error on update when entity is not found', () => {
		const entity = new StubEntity({
			entity_id: new Uuid(),
			name: 'Test',
			price: 100
		});
		expect(repository.update(entity)).rejects.toThrowError(
			new NotFoundError(entity.entity_id, StubEntity)
		);
	});

	it('[IT] should updates an entity', async () => {
		const entity = new StubEntity({
			entity_id: new Uuid(),
			name: 'Test',
			price: 100
		});
		await repository.insert(entity);

		const entityUpdated = new StubEntity({
			entity_id: entity.entity_id,
			name: 'Test Updated',
			price: 200
		});
		await repository.update(entityUpdated);
		expect(repository.items[0].toJSON()).toStrictEqual(entityUpdated.toJSON());

	});

	it('[IT] should throws error on delete when aggregate is not found', async () => {
		const uuid = new Uuid();

		await expect(repository.delete(uuid)).rejects.toThrowError(
			new NotFoundError(uuid, StubEntity)
		);

		await expect(
			repository.delete(new Uuid('32f36f8e-f572-464d-ab5b-7d13ca652eb5'))
		).rejects.toThrowError(
			new NotFoundError('32f36f8e-f572-464d-ab5b-7d13ca652eb5', StubEntity)
		)
	});

	it('[IT] should delete an entity', async () => {
		const entity = new StubEntity({
			entity_id: new Uuid(),
			name: 'Test',
			price: 100
		});

		await repository.insert(entity);
		expect(repository?.items.length).toBe(1);
		expect(repository?.items[0]).toEqual(entity);

		await repository.delete(entity.entity_id);
		expect(repository?.items.length).toBe(0);
	});

	it('[IT] should find an entity by id', async () => {
		const entity1 = new StubEntity({
			entity_id: new Uuid(),
			name: 'Test',
			price: 100
		});
		const entities: StubEntity[] = [
			new StubEntity({
				entity_id: new Uuid(),
				name: 'Test 2',
				price: 100
			}),
			new StubEntity({
				entity_id: new Uuid(),
				name: 'Test 3',
				price: 200
			})
		];

		await repository.bulkInsert([entity1, ...entities]);

		const entityFound = await repository.findById(entity1.entity_id);
		expect(entityFound).toStrictEqual(entity1);
	});

	it('[IT] should find all entities', async () => {
		const entities: StubEntity[] = [
			new StubEntity({
				entity_id: new Uuid(),
				name: 'Test 1',
				price: 100
			}),
			new StubEntity({
				entity_id: new Uuid(),
				name: 'Test 2',
				price: 100
			}),
			new StubEntity({
				entity_id: new Uuid(),
				name: 'Test 3',
				price: 200
			})
		];

		await repository.bulkInsert(entities);
		const allEntities = await repository.findAll();
		expect(allEntities).toStrictEqual(entities);
	});
});