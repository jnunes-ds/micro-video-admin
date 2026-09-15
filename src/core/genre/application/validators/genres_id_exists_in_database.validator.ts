import {Either} from "@core/@shared/domain/either";
import {NotFoundError} from "@core/@shared/domain/errors/not_found.error";
import {IGenreRepository} from "@core/genre/domain/genre.repository";
import {Genre, GenreId} from "@core/genre/domain/genre.aggregate";

export class GenresIdExistsInDatabaseValidator {
	constructor(private genreRepo: IGenreRepository) {}

	async validate(genres_id: string[]): Promise<Either<GenreId[], NotFoundError[]>> {
		const genresId = genres_id.map(id => new GenreId(id));

		const existsResult = await this.genreRepo.existsById(genresId);

		return existsResult.not_exists.length > 0
			? Either.fail(existsResult.not_exists.map(g => new NotFoundError(g.id, Genre)))
			: Either.ok(genresId);
	}
}