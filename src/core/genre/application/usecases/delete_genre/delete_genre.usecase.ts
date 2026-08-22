import {IUseCase} from "@core/@shared/application/usecase.interface";
import {IUnitOfWork} from "@core/@shared/domain/repository/unit_of_work.interface";
import {IGenreRepository} from "@core/genre/domain/genre.repository";
import {GenreId} from "@core/genre/domain/genre.aggregate";

export class DeleteGenreUsecase implements IUseCase<DeleteGenreInput, DeleteGenreOutput> {
	constructor(
		private uow: IUnitOfWork,
		private genreRepo: IGenreRepository
	) {}

	async execute(input: DeleteGenreInput): Promise<DeleteGenreOutput> {
		const genreId = new GenreId(input.id);
		return this.uow.do(async () => {
			return this.genreRepo.delete(genreId);
		});
	}
}

export type DeleteGenreInput = {id: string};
export type DeleteGenreOutput = void;