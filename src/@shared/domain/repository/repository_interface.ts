import {Entity} from "@/@shared/domain/entity";
import {ValueObject} from "@/@shared/domain/value_object";
import {SearchParams} from "@/@shared/domain/repository/search_params";
import {SearchResult} from "@/@shared/domain/repository/search_result";

export interface IRepository<
	E extends Entity,
	Id extends ValueObject
> {
	insert(entity: E): Promise<void>;
	bulkInsert(entities: E[]): Promise<void>;
	update(entity: E): Promise<void>;
	delete(entity_id: Id): Promise<void>;

	findById(entity_id: Id): Promise<E | null>;
	findAll(): Promise<E[]>;

	getEntity(): new (...args: any[]) => E;
}

export interface ISearchableRepository<
	E extends Entity,
	Id extends ValueObject,
	Filter = string,
	SearchInput = SearchParams<Filter>,
	SearchOutput = SearchResult,
> extends IRepository<E, Id> {
	sortableFields: string[];
	search(props: SearchInput): Promise<SearchOutput>;
}