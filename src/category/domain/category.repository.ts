import {ISearchableRepository} from "@/@shared/domain/repository/repository_interface";
import {Category} from "@/category/domain/category.entity";
import {Uuid} from "@/@shared/domain/value_objects/uuid.vo";
import {SearchParams} from "@/@shared/domain/repository/search_params";
import {SearchResult} from "@/@shared/domain/repository/search_result";

export type CategoryFilter = string;

export class CategorySearchParams extends SearchParams<CategoryFilter> {}

export class CategorySearchResult extends SearchResult<Category> {}

export interface ICategoryRepository
	extends ISearchableRepository<
		Category,
		Uuid,
		CategorySearchParams,
		CategorySearchResult
	> {}