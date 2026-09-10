import {
	VideoCastMemberModel,
	VideoCategoryModel,
	VideoGenreModel,
	VideoModel
} from "@core/video/infra/db/sequelize/video.models";
import {CategoryId} from "@core/category/domain/category.aggregate";
import {GenreId} from "@core/genre/domain/genre.aggregate";
import {CastMemberId} from "@core/cast_member/domain/cast_member.aggregate";
import {Notification} from "@core/@shared/domain/validators/notification";
import {Banner} from "@core/video/domain/banner.vo";
import {Thumbnail} from "@core/video/domain/thumbnail.vo";
import {ThumbnailHalf} from "@core/video/domain/thumbnail_half.vo";
import {Trailer} from "@core/video/domain/trailer.vo";
import {VideoMedia} from "@core/video/domain/video_media.vo";
import {Rating} from "@core/video/domain/rating.vo";
import {Video, VideoId} from "@core/video/domain/video.aggregate";
import {LoadingEntityError} from "@core/@shared/domain/errors/loading_entity.error";
import {ImageMediaModel, ImageMediaRelatedField} from "@core/video/infra/db/sequelize/image_media.model";
import {
	AudioVideoMediaModel,
	AudioVideoMediaRelatedField
} from "@core/video/infra/db/sequelize/audio_video_media.model";

export class VideoModelMapper {
	static toEntity(model: VideoModel) {
		const {
			video_id: id,
			categories_id = [],
			genres_id = [],
			cast_members_id = [],
			image_medias = [],
			audio_video_medias = [],
			...otherData
		} = model.toJSON();

		const categoriesId = new Map(categories_id.map(c => [c.category_id, new CategoryId(c.category_id)]));
		const genresId = new Map(genres_id.map(g => [g.genre_id, new GenreId(g.genre_id)]));
		const castMembersId = new Map(cast_members_id.map(c => [c.cast_member_id, new CastMemberId(c.cast_member_id)]));

		const notification = new Notification();

		if (!categoriesId.size) {
			notification.addError(
				'categories_id should not be empty',
				'categories_id'
			);
		}

		if (!genresId.size) {
			notification.addError(
				'genres_id should not be empty',
				'genre_id'
			);
		}

		if (!castMembersId.size) {
			notification.addError(
				'cast_members_id should not be empty',
				'cast_members_id'
			);
		}

		const bannerModel = image_medias.find(
			i => i.video_related_field === 'banner'
		);

		const banner = bannerModel
			? new Banner({
					name: bannerModel.name,
					location: bannerModel.location
				})
			: undefined;

		const thumbnailModel = image_medias.find(
			i => i.video_related_field === 'thumbnail'
		);

		const thumbnail = thumbnailModel
			? new Thumbnail({
					name: thumbnailModel.name,
					location: thumbnailModel.location
				})
			: undefined;

		const thumbnaiHalflModel = image_medias.find(
			i => i.video_related_field === 'thumbnail_half'
		);

		const thumbnailHalf = thumbnaiHalflModel
			? new ThumbnailHalf({
				name: thumbnaiHalflModel.name,
				location:  thumbnaiHalflModel.location
			})
			: undefined;

		const trailerModel = audio_video_medias.find(
			i => i.video_related_field === 'trailer'
		);

		const trailer = trailerModel
			? new Trailer({
					name: trailerModel.name,
					raw_location: trailerModel.raw_location,
					encoded_location: trailerModel.encoded_location ?? undefined,
					status: trailerModel.status
				})
			: undefined;

		const videoModel = audio_video_medias.find(
			i => i.video_related_field === 'video'
		);

		const videoMedia = videoModel
			? new VideoMedia({
					name: videoModel.name,
					raw_location: videoModel.raw_location,
					encoded_location: videoModel.encoded_location ?? undefined,
					status: videoModel.status
				})
			: undefined;

		const [rating] = Rating.create(otherData.rating).asArray();

		const videoEntity = new Video({
			...otherData,
			video_id: new VideoId(id),
			banner,
			thumbnail,
			thumbnail_half: thumbnailHalf,
			trailer,
			video: videoMedia,
			categories_id: categoriesId,
			genres_id: genresId,
			cast_members_id: castMembersId,
			rating,
		});

		videoEntity.validate();

		notification.copyErrors(videoEntity.notification);

		if (notification.hasErrors()) {
			throw new LoadingEntityError(notification.toJSON());
		}

		return videoEntity;
	}

	static toModelProps(entity: Video) {
		const {
			banner,
			thumbnail,
			thumbnail_half,
			trailer,
			video,
			categories_id,
			genres_id,
			cast_members_id,
			...otherData
		} = entity.toJSON();

		return {
			...otherData,
			image_medias: [
				{
					media: banner,
					video_related_field: ImageMediaRelatedField.BANNER
				},
				{
					media: thumbnail,
					video_related_field: ImageMediaRelatedField.THUMBNAIL
				},
				{
					media: thumbnail_half,
					video_related_field: ImageMediaRelatedField.THUMBNAIL_HALF
				}
			].map(item => {
				return item.media
					? ImageMediaModel.build({
							video_id: entity.video_id.id,
							name: item.media.name,
							location: item.media.location,
							video_related_field: item.video_related_field,
						} as any)
					: null;
			}).filter(Boolean),
			audio_video_medias: [trailer, video]
				.map((audio_video_media, index) => {
					return audio_video_media
						? AudioVideoMediaModel.build({
								video_id: entity.video_id.id,
								name: audio_video_media.name,
								raw_location: audio_video_media.raw_location,
								encoded_location: audio_video_media.encoded_location,
								status: audio_video_media.status,
								video_related_field: index === 0
										? AudioVideoMediaRelatedField.TRAILER
										: AudioVideoMediaRelatedField.VIDEO
							} as any)
						: null
				}).filter(Boolean),
			categories_id: categories_id.map(category_id =>
				VideoCategoryModel.build({
					video_id: entity.video_id.id,
					category_id
				})
			),
			genres_id: genres_id.map(genre_id =>
				VideoGenreModel.build({
					video_id: entity.video_id.id,
					genre_id
				})
			),
			cast_members_id: cast_members_id.map(cast_member_id =>
				VideoCastMemberModel.build({
					video_id: entity.video_id.id,
					cast_member_id
				})
			)
		};
	}

}