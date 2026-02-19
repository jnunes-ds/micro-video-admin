import {IRepository} from "@/@shared/domain/repository/repository_interface";
import {Entity} from "@/@shared/domain/entity";
import {ValueObject} from "@/@shared/domain/value_object";

export abstract class InMemoryRepository<
	E extends Entity,
	Id extends ValueObject
> implements IRepository<E, Id> {
	items: E[] = [];

	async insert(entity: E): Promise<void> {
		this.items.push(entity);
	}

	async bulkInsert(entities: E[]): Promise<void> {
		this.items.push(...entities);
	}

	async update(entity: E): Promise<void> {
		const indexFound = this.items.findIndex(
			item => item.entity_id.equals(entity.entity_id)
		);
		if (indexFound === -1) {
			throw new Error("Entity not found");
		}
		this.items[indexFound] = entity;
	}

	async delete(entity_id: Id): Promise<void> {
		const indexFound = this.items.findIndex(item => item.entity_id.equals(entity_id));
		if (indexFound === -1) {
			throw new Error("Entity not found");
		}
		this.items.splice(indexFound, 1);
	}

	async findById(entity_id: Id): Promise<E> {
		const item = this.items.find(item => item.entity_id.equals(entity_id));
		return typeof item === "undefined" ? null : item;
	}

	async findAll(): Promise<E[]> {
		return this.items;
	}

	abstract getEntity(): new (...args: any[]) => E;
}