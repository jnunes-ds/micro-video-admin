import {IUseCase} from "@core/@shared/application/usecase.interface";
import {UpdateVideoInput} from "@core/video/application/update_video/update_video.input";
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
import {Video, VideoId} from "@core/video/domain/video.aggregate";
import {NotFoundError} from "@core/@shared/domain/errors/not_found.error";
import {Rating} from "@core/video/domain/rating.vo";
import {EntityValidationError} from "@core/@shared/domain/validators/validation.error";

export class UpdateVideoUsecase
	implements IUseCase<UpdateVideoInput, UpdateVideoOutput>
{
	constructor(
		private uow: IUnitOfWork,
		private videoRepo: IVideoRepository,
		private categoriesIdValidator: CategoriesIdExistsInDatabaseValidator,
		private genresIdValidator: GenresIdExistsInDatabaseValidator,
		private castMembersIdValidator: CastMembersIdExistsInDatabaseValidator
	) {}

	async execute(input: UpdateVideoInput): Promise<UpdateVideoOutput> {
		const videoId = new VideoId(input.id);
		const video = await this.videoRepo.findById(videoId);

		if (!video) throw new NotFoundError(input.id, Video);

		input.title && video.changeTitle(input.title);
		input.description && video.changeDescription(input.description);
		input.year_launched && video.changeYearLaunched(input.year_launched);
		input.duration && video.changeDuration(input.duration);
		if (input.rating) {
			const [type, errorRating] = Rating.create(input.rating).asArray();

			video.changeRating(type);

			errorRating && video.notification.setError(errorRating.message, 'type');
		}

		if (input.is_opened) video.markAsOpened();
		if (input.is_opened === false) video.markAsNotOpened();

		const notification = video.notification;

		if (input.categories_id) {
			const [categoriesId, errorsCategoriesId] = (
				await this.categoriesIdValidator.validate(input.categories_id)
			).asArray();

			categoriesId && video.syncCategoriesId(categoriesId);

			errorsCategoriesId &&
				notification.setError(
					errorsCategoriesId.map(e => e.message),
					'categories_id'
				);

		}

		if (input.genres_id) {
			const [genresId, errorsGenresId] = (
				await this.genresIdValidator.validate(input.genres_id)
			).asArray();

			genresId && video.syncCategoriesId(genresId);

			errorsGenresId &&
			notification.setError(
				errorsGenresId.map(e => e.message),
				'genres_id'
			);
		}

		if (input.cast_members_id) {
			const [castMembersId, errorsCastMembersId] = (
				await this.castMembersIdValidator.validate(input.cast_members_id)
			).asArray();

			castMembersId && video.syncCategoriesId(castMembersId);

			errorsCastMembersId &&
			notification.setError(
				errorsCastMembersId.map(e => e.message),
				'cast_members_id'
			);
		}

		if (video.notification.hasErrors()) throw new EntityValidationError(video.notification.toJSON());

		await this.uow.do(async () => {
			return this.videoRepo.update(video);
		});

		return { id: video.video_id.id };
	}
}

export type UpdateVideoOutput = { id: string };