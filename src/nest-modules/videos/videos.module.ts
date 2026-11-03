import {Module} from '@nestjs/common';
import {SequelizeModule} from "@nestjs/sequelize";
import {VideoCategoryModel, VideoGenreModel, VideoModel} from "@core/video/infra/db/sequelize/video.models";
import {ImageMediaModel} from "@core/video/infra/db/sequelize/image_media.model";
import {AudioVideoMediaModel} from "@core/video/infra/db/sequelize/audio_video_media.model";
import {CategoriesModule} from "@/nest-modules/categories/categories.module";
import {GenresModule} from "@/nest-modules/genres/genres.module";
import {CastMembersModule} from "@/nest-modules/cast_members/cast_members.module";
import {VideosController} from "@/nest-modules/videos/videos.controller";
import {VIDEOS_PROVIDERS} from "@/nest-modules/videos/videos.providers";


@Module({
	imports: [
		SequelizeModule.forFeature([
			VideoModel,
			VideoCategoryModel,
			VideoGenreModel,
			VideoCategoryModel,
			ImageMediaModel,
			AudioVideoMediaModel,
		]),
		CategoriesModule,
		GenresModule,
		CastMembersModule
	],
	controllers: [VideosController],
	providers: [
		...Object.values(VIDEOS_PROVIDERS.REPOSITORIES),
		...Object.values(VIDEOS_PROVIDERS.USE_CASES),
	],
	exports: [VIDEOS_PROVIDERS.REPOSITORIES.VIDEO_REPOSITORY.provide]
})
export class VideosModule {}