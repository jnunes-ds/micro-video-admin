import {VideoSequelizeRepository} from "@core/video/infra/db/sequelize/video_sequelize.repository";
import {VideoInMemoryRepository} from "@core/video/infra/db/in_memory/video_in_memory.repository";
import {VideoModel} from "@core/video/infra/db/sequelize/video.models";
import {UnitOfWorkSequelize} from "@core/@shared/infra/db/sequelize/unit_of_work_sequelize";
import {getModelToken} from "@nestjs/sequelize";
import {CreateVideoUsecase} from "@core/video/application/create_video/create_video.usecase";
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
import {CATEGORY_PROVIDERS} from "@/nest-modules/categories/categories.providers";
import {GENRE_PROVIDERS} from "@/nest-modules/genres/genres.providers";
import {CAST_MEMBER_PROVIDERS} from "@/nest-modules/cast_members/cast_members.providers";
import {UpdateVideoUsecase} from "@core/video/application/update_video/update_video.usecase";
import {
	UploadAudioVideoMediasUsecase
} from "@core/video/application/upload_audio_video_medias/upload_audio_video_medias.usecase";
import {ApplicationService} from "@core/@shared/application/application.service";
import {IStorage} from "@core/@shared/application/storage.interface";
import {GetVideoUsecase} from "@core/video/application/get_video/get_video.usecase";
import {ICategoryRepository} from "@core/category/domain/category.repository";
import {IGenreRepository} from "@core/genre/domain/genre.repository";
import {ICastMemberRepository} from "@core/cast_member/domain/cast_member.repository";
import {
	ProcessAudioVideoMediasUsecase
} from "@core/video/application/proccess_audio_video_medias/proccess_audio_video_medias.usecase";

const REPOSITORIES = {
	VIDEO_REPOSITORY: {
		provide: 'VideoRepository',
		useExisting: VideoSequelizeRepository,
	},
	VIDEO_IN_MEMORY_REPOSITORY: {
		provide: VideoInMemoryRepository,
		useClass: VideoInMemoryRepository,
	},
	VIDEO_SEQUELIZE_REPOSITORY: {
		provide: VideoSequelizeRepository,
		useFactory: (videoModel: typeof VideoModel, uow: UnitOfWorkSequelize) => {
			return new VideoSequelizeRepository(videoModel, uow);
		},
		inject: [getModelToken(VideoModel), 'UnitOfWork']
	}
};

const USE_CASES = {
	CREATE_VIDEO_USE_CASE: {
		provide: CreateVideoUsecase,
		useFactory: (
			uow: IUnitOfWork,
			videoRepo: IVideoRepository,
			categoriesIdValidator: CategoriesIdExistsInDatabaseValidator,
			genresIdValidator: GenresIdExistsInDatabaseValidator,
			castMembersIdValidator: CastMembersIdExistsInDatabaseValidator
		) => new CreateVideoUsecase(
			uow,
			videoRepo,
			categoriesIdValidator,
			genresIdValidator,
			castMembersIdValidator
		),
		inject: [
			'UnitOfWork',
			REPOSITORIES.VIDEO_REPOSITORY.provide,
			CATEGORY_PROVIDERS.VALIDATORS.CATEGORIES_IDS_EXISTS_IN_DATABASE_VALIDATOR.provide,
			GENRE_PROVIDERS.VALIDATIONS.GENRES_IDS_EXISTS_IN_DATABASE_VALIDATOR.provide,
			CAST_MEMBER_PROVIDERS.VALIDATIONS.CAST_MEMBERS_IDS_EXISTS_IN_DATABASE_VALIDATOR.provide
		]
	},
	UPDATE_VIDEO_USE_CASE: {
		provide: UpdateVideoUsecase,
		useFactory: (
			uow: IUnitOfWork,
			videoRepo: IVideoRepository,
			categoriesIdValidator: CategoriesIdExistsInDatabaseValidator,
			genresIdValidator: GenresIdExistsInDatabaseValidator,
			castMembersIdValidator: CastMembersIdExistsInDatabaseValidator
		) => new UpdateVideoUsecase(
			uow,
			videoRepo,
			categoriesIdValidator,
			genresIdValidator,
			castMembersIdValidator
		),
		inject: [
			'UnitOfWork',
			REPOSITORIES.VIDEO_REPOSITORY.provide,
			CATEGORY_PROVIDERS.VALIDATORS.CATEGORIES_IDS_EXISTS_IN_DATABASE_VALIDATOR.provide,
			GENRE_PROVIDERS.VALIDATIONS.GENRES_IDS_EXISTS_IN_DATABASE_VALIDATOR.provide,
			CAST_MEMBER_PROVIDERS.VALIDATIONS.CAST_MEMBERS_IDS_EXISTS_IN_DATABASE_VALIDATOR.provide
		]
	},
	UPLOAD_AUDIO_VIDEO_MEDIA_USE_CASE: {
		provide: UploadAudioVideoMediasUsecase,
		useFactory: (
			appService: ApplicationService,
			videoRepo: IVideoRepository,
			storage: IStorage
		) => new UploadAudioVideoMediasUsecase(appService, videoRepo, storage),
		inject: [
			'UnitOfWork',
			REPOSITORIES.VIDEO_REPOSITORY.provide,
			CATEGORY_PROVIDERS.VALIDATORS.CATEGORIES_IDS_EXISTS_IN_DATABASE_VALIDATOR.provide,
			GENRE_PROVIDERS.VALIDATIONS.GENRES_IDS_EXISTS_IN_DATABASE_VALIDATOR.provide,
			CAST_MEMBER_PROVIDERS.VALIDATIONS.CAST_MEMBERS_IDS_EXISTS_IN_DATABASE_VALIDATOR.provide
		]
	},
	GET_VIDEO_USE_CASE: {
		provide: GetVideoUsecase,
		useFactory: (
			videoRepo: IVideoRepository,
			categoryRepo: ICategoryRepository,
			genreRepo: IGenreRepository,
			castMemberRepo: ICastMemberRepository
		) => new GetVideoUsecase(
			videoRepo,
			categoryRepo,
			genreRepo,
			castMemberRepo
		),
		inject: [
			'UnitOfWork',
			REPOSITORIES.VIDEO_REPOSITORY.provide,
			CATEGORY_PROVIDERS.VALIDATORS.CATEGORIES_IDS_EXISTS_IN_DATABASE_VALIDATOR.provide,
			GENRE_PROVIDERS.VALIDATIONS.GENRES_IDS_EXISTS_IN_DATABASE_VALIDATOR.provide,
			CAST_MEMBER_PROVIDERS.VALIDATIONS.CAST_MEMBERS_IDS_EXISTS_IN_DATABASE_VALIDATOR.provide
		]
	},
	COMPLETE_PROCESS_AUDIO_VIDEO_MEDIA_USE_CASE: {
		provide: ProcessAudioVideoMediasUsecase,
		useFactory: (
			uow: IUnitOfWork,
			videoRepo: IVideoRepository,
		) => new ProcessAudioVideoMediasUsecase(uow, videoRepo),
		inject: ['UnitOfWork', REPOSITORIES.VIDEO_REPOSITORY.provide]
	}
};

export const VIDEOS_PROVIDERS = {
	REPOSITORIES,
	USE_CASES
}

