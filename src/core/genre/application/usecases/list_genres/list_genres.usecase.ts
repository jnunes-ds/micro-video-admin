import {IUseCase} from "@core/@shared/application/usecase.interface";
import {ListGenresInput} from "@core/genre/application/usecases/list_genres/list_genres.input";
import {PaginationOutput, PaginationOutputMapper} from "@core/@shared/application/pagination_output";
import {GenreOutput, GenreOutputMapper} from "@core/genre/application/usecases/common/genre_output";
import {GenreSearchParams, IGenreRepository} from "@core/genre/domain/genre.repository";
import {ICategoryRepository} from "@core/category/domain/category.repository";
import {SearchResult} from "@core/@shared/domain/repository/search_result";
import {Genre} from "@core/genre/domain/genre.aggregate";
import {CategoryId} from "@core/category/domain/category.aggregate";

export class ListGenresUsecase implements IUseCase<ListGenresInput, ListGenresOutput> {
	constructor(
		private genreRepo: IGenreRepository,
		private categoryRepo: ICategoryRepository
	) {}

	async execute(input: ListGenresInput): Promise<ListGenresOutput> {
		const params = GenreSearchParams.create(input);
		const searchResult = await this.genreRepo.search(params);
		return this.toOutput(searchResult);
	}

	private async toOutput(searchResult: GenreSearchResult): Promise<ListGenresOutput> {
		const { items: _items } = searchResult;

		const categoriesIdRelated = searchResult.items.reduce<CategoryId[]>(
			(acc, item) => {
				return acc.concat([...item.categories_id.values()])
			}, []
		);

		const categoriesRelated = await this.categoryRepo.findByIds(categoriesIdRelated);

		const items = _items.map(i => {
			const categoriesOfGenre = categoriesRelated.filter(
				c => i.categories_id.has(c.category_id.id)
			);
			return GenreOutputMapper.toOutput(i, categoriesOfGenre)
		});
		return PaginationOutputMapper.toOutput(items, searchResult);
	}
}

export type ListGenresOutput = PaginationOutput<GenreOutput>;
export type GenreSearchResult = SearchResult<Genre>;