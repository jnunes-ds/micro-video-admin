import {IRepository, ISearchableRepository} from "@/@shared/domain/repository/repository_interface";
import {Entity} from "@/@shared/domain/entity";
import {ValueObject} from "@/@shared/domain/value_object";
import {NotFoundError} from "@/@shared/domain/errors/not_found.error";
import {SearchResult} from "@/@shared/domain/repository/search_result";
import {SearchParams, SortDirection} from "@/@shared/domain/repository/search_params";

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
			throw new NotFoundError(entity.entity_id, this.getEntity());
		}
		this.items[indexFound] = entity;
	}

	async delete(entity_id: Id): Promise<void> {
		const indexFound = this.items.findIndex(item => item.entity_id.equals(entity_id));
		if (indexFound === -1) {
			throw new NotFoundError(entity_id, this.getEntity());
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

export abstract class InMemorySearchableRepository<
	E extends Entity,
	Id extends ValueObject,
	Filter = string
> extends InMemoryRepository<E, Id>
	implements ISearchableRepository<E, Id, Filter>
{
	sortableFields: string[] = [];
	async search(props: SearchParams<Filter>): Promise<SearchResult<E>> {
		const filteredItems = await this.applyFilter(this.items, props.filter);
		const sortedItems = this.applySort(
			filteredItems,
			props.sort,
			props.sort_dir
		);
		const paginaterItems = this.applyPaginate(
			sortedItems,
			props.page,
			props.per_page
		);
		return new SearchResult({
			items: paginaterItems,
			total: filteredItems.length,
			current_page: props.page,
			per_page: props.per_page
		});
	};

	protected abstract applyFilter(items: E[], filter: Filter | null): Promise<E[]>;

	protected  applyPaginate(items: E[], page: SearchParams['page'], per_page: SearchParams['per_page']): E[] {
		const start = (page - 1) * per_page;
		const limit = start + per_page;
		return items.slice(start, limit);
	}

	protected applySort(
		items: E[],
		sort: string | null,
		sort_dir: SortDirection | null,
		custom_getter?: (sort: string, item: E) => any
	): E[] {
		if (!sort || this.sortableFields.includes(sort)) {
			return items;
		}

		// @ts-ignore
		return [...items].sort((a, b) => {
		// @ts-ignore
			const aValue = custom_getter ? custom_getter(sort, a) : a[sort];
		// @ts-ignore
			const bValue = custom_getter ? custom_getter(sort, b) : b[sort];
			if (aValue < bValue) {
				return sort_dir === 'asc' ? -1 : 1;
			}
			if (aValue > bValue) {
				return sort_dir === 'asc' ? 1 : -1;
			}

			return 0;
		});
	}
}