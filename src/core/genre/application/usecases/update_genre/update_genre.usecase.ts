import {IUseCase} from "@core/@shared/application/usecase.interface";
import {UpdateGenreInput} from "@core/genre/application/usecases/update_genre/update_genre.input";
import {GenreOutput, GenreOutputMapper} from "@core/genre/application/usecases/common/genre_output";
import {IUnitOfWork} from "@core/@shared/domain/repository/unit_of_work.interface";
import {IGenreRepository} from "@core/genre/domain/genre.repository";
import {ICategoryRepository} from "@core/category/domain/category.repository";
import {
	CategoriesIdsExistsInDatabaseValidator
} from "@core/category/application/validations/categories_ids_exists_in_database.validator";
import {Genre, GenreId} from "@core/genre/domain/genre.aggregate";
import {NotFoundError} from "@core/@shared/domain/errors/not_found.error";
import {EntityValidationError} from "@core/@shared/domain/validators/validation.error";

export class UpdateGenreUsecase
	implements IUseCase<UpdateGenreInput, UpdateGenreOutput>
{
	constructor(
		private uow: IUnitOfWork,
		private genreRepo: IGenreRepository,
		private categoryRepo: ICategoryRepository,
		private categoriesIdsExistsInStorageValidator: CategoriesIdsExistsInDatabaseValidator
	) {}

	async execute(input: UpdateGenreInput): Promise<UpdateGenreOutput> {
		const genreId = new GenreId(input.id);
		const genre = await this.genreRepo.findById(genreId);

		if (!genre) {
			throw new NotFoundError(input.id, Genre);
		}

		if (input.name) genre.changeName(input.name);

		if (input.is_active) genre.activate();

		if (input.is_active === false) genre.deactivate();

		const notification = genre.notification;

		if (input.categories_id) {
			const [categoriesId, errorsCategoriesId] = (
				await this.categoriesIdsExistsInStorageValidator.validate(input.categories_id)
			).asArray();

			categoriesId && genre.syncCategoriesId(categoriesId);

			errorsCategoriesId &&
				notification.setError(
					errorsCategoriesId.map(e => e.message),
					'categories_id'
				);
		}

		if (genre.notification.hasErrors()) {
			throw new EntityValidationError(genre.notification.toJSON());
		}

		await this.uow.do(() => {
			return this.genreRepo.update(genre);
		});

		const categories = await this.categoryRepo.findByIds(
			Array.from(genre.categories_id.values())
		);

		return GenreOutputMapper.toOutput(genre, categories);
	}
}

export type UpdateGenreOutput = GenreOutput;