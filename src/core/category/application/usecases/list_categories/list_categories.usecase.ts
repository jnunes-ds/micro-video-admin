import {IUseCase} from "@core/@shared/application/usecase.interface";
import {
	CategoryFilter,
	CategorySearchParams,
	CategorySearchResult,
	ICategoryRepository
} from "@core/category/domain/category.repository";
import {CategoryOutput, CategoryOutputMapper} from "@core/category/application/usecases/common/category_output";
import {PaginationOutput, PaginationOutputMapper} from "@core/@shared/application/pagination_output";
import {SearchParamsConstructorProps} from "@core/@shared/domain/repository/search_params";


export class ListCategoriesUseCase
	implements IUseCase<ListCategoriesInput, ListCategoriesOutput> {
	constructor(private readonly repository: ICategoryRepository) {}

	async execute(input: ListCategoriesInput): Promise<ListCategoriesOutput> {
		const params = new CategorySearchParams(input);
		const searchResult = await this.repository.search(params);
		return this.toOutput(searchResult);
	}

	private toOutput(searchResult: CategorySearchResult): ListCategoriesOutput {
		const {items: _items} = searchResult;
		const items = _items.map(item => CategoryOutputMapper.toOutput(item));
		return PaginationOutputMapper.toOutput(items, searchResult);
	}
}

export type ListCategoriesInput = SearchParamsConstructorProps<CategoryFilter>;

export type ListCategoriesOutput = PaginationOutput<CategoryOutput>;