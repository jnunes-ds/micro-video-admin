import {SearchParams} from "@core/@shared/domain/repository/search_params";
import {SearchResult} from "@core/@shared/domain/repository/search_result";
import {Category, CastMemberId} from "@core/category/domain/category.aggregate";
import {ISearchableRepository} from "@core/@shared/domain/repository/repository_interface";


export type CategoryFilter = string;

export class CategorySearchParams extends SearchParams<CategoryFilter> {}

export class CategorySearchResult extends SearchResult<Category> {}

export interface ICategoryRepository
	extends ISearchableRepository<
		Category,
		CastMemberId,
		CategoryFilter,
		CategorySearchParams,
		CategorySearchResult
	> {}