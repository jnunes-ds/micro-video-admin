import {IUseCase} from "@core/@shared/application/usecase.interface";
import {GenreOutput, GenreOutputMapper} from "@core/genre/application/usecases/common/genre_output";
import {Genre, GenreId} from "@core/genre/domain/genre.aggregate";
import {IGenreRepository} from "@core/genre/domain/genre.repository";
import {ICategoryRepository} from "@core/category/domain/category.repository";
import {NotFoundError} from "@core/@shared/domain/errors/not_found.error";

export class GetGenreUsecase implements IUseCase<GetGenreInput, GenreOutput> {
	constructor(
		private genreRepo: IGenreRepository,
		private categoryRepo: ICategoryRepository
	) {}

	async execute(input: GetGenreInput): Promise<GetGenreOutput> {
		const genreId = new GenreId(input.id);
		const genre = await this.genreRepo.findById(genreId);
		if (!genre) {
			throw new NotFoundError(input.id, Genre);
		}
		const categories = await this.categoryRepo.findByIds([
			...genre.categories_id.values()
		]);

		return GenreOutputMapper.toOutput(genre, categories);
	}
}

export type GetGenreInput = {id: string};
export type GetGenreOutput = GenreOutput;