import {Entity, EntityId} from "@core/@shared/domain/entity";
import {ValueObject} from "@core/@shared/domain/value_object";
import {SearchParams} from "@core/@shared/domain/repository/search_params";
import {SearchResult} from "@core/@shared/domain/repository/search_result";
import {Genre, GenreId} from "@core/genre/domain/genre.aggregate";
import {Op} from "sequelize";
import {GenreModelMapper} from "@core/genre/infra/sequelize/genre.model.mapper";


export interface IRepository<
	E extends Entity,
	Id extends ValueObject
> {
	insert(entity: E): Promise<void>;
	bulkInsert(entities: E[]): Promise<void>;
	update(entity: E): Promise<void>;
	delete(entity_id: Id): Promise<void>;

	findById(entity_id: Id): Promise<E | null>;
	findByIds(ids: EntityId[]): Promise<E[]>;
	existsById(ids: EntityId[]): Promise<{
		exists: EntityId[];
		not_exists: EntityId[];
	}>;
	findAll(): Promise<E[]>;

	getEntity(): new (...args: any[]) => E;
}

export interface ISearchableRepository<
	E extends Entity,
	Id extends ValueObject,
	Filter = string,
	SearchInput = SearchParams<Filter>,
	SearchOutput = SearchResult<E>,
> extends IRepository<E, Id> {
	sortableFields: string[];
	search(props: SearchInput): Promise<SearchOutput>;
}