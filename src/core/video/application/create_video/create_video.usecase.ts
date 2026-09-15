import {IUseCase} from "@core/@shared/application/usecase.interface";
import {IUnitOfWork} from "@core/@shared/domain/repository/unit_of_work.interface";
import {IVideoRepository} from "@core/video/domain/video.repository";
import {
	CategoriesIdExistsInDatabaseValidator
} from "@core/category/application/validators/categories_ids_exists_in_database.validator";
import {
	GenresIdExistsInDatabaseValidator
} from "@core/genre/application/validators/genres_id_exists_in_database.validator";
import {
	CastMembersIdExistsInDatabaseValidator
} from "@core/cast_member/application/validators/cast_members_id_exists_in_database.validator";
import {CreateVideoInput} from "@core/video/application/create_video/create_video.input";
import {Rating} from "@core/video/domain/rating.vo";
import {Video} from "@core/video/domain/video.aggregate";
import {EntityValidationError} from "@core/@shared/domain/validators/validation.error";

export class CreateVideoUsecase
	implements IUseCase<CreateVideoInput, CreateVideoOutput>
{
		constructor(
			private uow: IUnitOfWork,
			private videoRepo: IVideoRepository,
			private categoriesIdValidator: CategoriesIdExistsInDatabaseValidator,
			private genresIdValidator: GenresIdExistsInDatabaseValidator,
			private castMembersIdValidator: CastMembersIdExistsInDatabaseValidator
		) {}

		async execute(input: CreateVideoInput): Promise<CreateVideoOutput> {
			const [rating, errorRating] = Rating.create(input.rating).asArray();

			const [eitherCategoriesId, eitherGenresId, eitherCastMembersId] = await Promise.all([
				await this.categoriesIdValidator.validate(input.categories_id),
				await this.genresIdValidator.validate(input.genres_id),
				await this.castMembersIdValidator.validate(input.cast_members_id)
			]);

			const [categoriesId, errorsCategoriesId] = eitherCategoriesId.asArray();
			const [genresId, errorsGenresId] = eitherGenresId.asArray();
			const [castMembersId, errorsCastMembersId] = eitherCastMembersId.asArray();

			const video = Video.create({
				...input,
				rating,
				categories_id: errorsCategoriesId ? [] : categoriesId,
				genres_id: errorsGenresId ? [] : genresId,
				cast_members_id: eitherCastMembersId ? [] : castMembersId
			});

			const notification = video.notification;

			if (errorsCategoriesId) {
				notification.setError(
					errorsCategoriesId.map(e => e.message),
					'categories_id'
				);
			}

			if (errorsGenresId) {
				notification.setError(
					errorsGenresId.map(e => e.message),
					'genres_id'
				);
			}

			if (errorsCastMembersId) {
				notification.setError(
					errorsCastMembersId.map(e => e.message),
					'cast_members_id'
				);
			}

			if (errorRating) {
				notification.setError(errorRating.message, 'rating');
			}

			if (notification.hasErrors()) {
				throw new EntityValidationError(notification.toJSON());
			}

			await this.uow.do(async () => {
				return this.videoRepo.insert(video)
			});

			return { id: video.video_id.id };
		}
}

export type CreateVideoOutput = { id: string; };