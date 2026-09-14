import {setupSequelize} from "@core/@shared/infra/testing/helpers";
import {ImageMediaModel} from "@core/video/infra/db/sequelize/image_media.model";
import {
	VideoCastMemberModel,
	VideoCategoryModel,
	VideoGenreModel,
	VideoModel
} from "@core/video/infra/db/sequelize/video.models";
import {AudioVideoMediaModel} from "@core/video/infra/db/sequelize/audio_video_media.model";
import {CategoryModel} from "@core/category/infra/db/sequelize/category.model";
import {GenreCategoryModel, GenreModel} from "@core/genre/infra/sequelize/genre.model";
import {CastMemberModel} from "@core/cast_member/infra/db/sequelize/cast_member.model";
import {SequelizeOptions} from "sequelize-typescript";

export function setupSequelizeForVideo(options: SequelizeOptions = {}) {
	return setupSequelize({
		models: [
			ImageMediaModel,
			VideoModel,
			AudioVideoMediaModel,
			VideoCategoryModel,
			CategoryModel,
			VideoGenreModel,
			GenreModel,
			GenreCategoryModel,
			VideoCastMemberModel,
			CastMemberModel,
		],
		...options
	});
}