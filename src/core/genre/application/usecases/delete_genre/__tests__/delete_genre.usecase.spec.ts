import {DeleteGenreUsecase} from "@core/genre/application/usecases/delete_genre/delete_genre.usecase";
import {GenreInMemoryRepository} from "@core/genre/infra/in_memory/genre_in_memory.repository";
import {UnitOfWorkFakeInMemory} from "@core/@shared/infra/db/in_memory/fake_unit_of_work_in_memory";
import {Genre, GenreId} from "@core/genre/domain/genre.aggregate";
import {NotFoundError} from "@core/@shared/domain/errors/not_found.error";

describe("DeleteGenreUsecase Unit Tests", () => {
	let usecase: DeleteGenreUsecase;
	let repository: GenreInMemoryRepository;
	let uow: UnitOfWorkFakeInMemory;

	beforeEach(() => {
		uow = new UnitOfWorkFakeInMemory();
		repository = new GenreInMemoryRepository();
		usecase = new DeleteGenreUsecase(uow, repository);
	});

	it('should thorws error when entity not found', async () => {
		const genreId = new GenreId();

		await expect(() => usecase.execute({id: genreId.id})).rejects.toThrow(
			new NotFoundError(genreId.id, Genre)
		);
	});

	it('should delete a genre', async () => {
		const items = [Genre.fake().aGenre().build()];
		repository.items = items;

		const spyOnDo = jest.spyOn(uow, 'do');

		await usecase.execute({
			id: items[0].genre_id.id
		});

		expect(spyOnDo).toHaveBeenCalledTimes(1);
		expect(repository.items).toHaveLength(0);
	});
});