import {setupSequelizeForVideo} from "@core/video/infra/db/sequelize/testing/helpers";
import {
	VideoCastMemberModel,
	VideoCategoryModel,
	VideoGenreModel,
	VideoModel,
} from "@core/video/infra/db/sequelize/video.models";
import {DataType} from "sequelize-typescript";
import {RatingValues} from "@core/video/domain/rating.vo";
import {CategoryModel} from "@core/category/infra/db/sequelize/category.model";
import {GenreModel} from "@core/genre/infra/sequelize/genre.model";
import {CastMemberModel} from "@core/cast_member/infra/db/sequelize/cast_member.model";
import {ImageMediaModel, ImageMediaRelatedField} from "@core/video/infra/db/sequelize/image_media.model";
import {
	AudioVideoMediaModel,
	AudioVideoMediaRelatedField
} from "@core/video/infra/db/sequelize/audio_video_media.model";
import {AudioVideoMediaStatus} from "@core/@shared/domain/value_objects/audio_video_media.vo";
import {Uuid} from "@core/@shared/domain/value_objects/uuid.vo";
import {CategorySequelizeRepository} from "@core/category/infra/db/sequelize/category-sequelize.repository";
import {Category} from "@core/category/domain/category.aggregate";
import {GenreSequelizeRepository} from "@core/genre/infra/sequelize/genre_sequelize.repository";
import {UnitOfWorkFakeInMemory} from "@core/@shared/infra/db/in_memory/fake_unit_of_work_in_memory";
import {Genre} from "@core/genre/domain/genre.aggregate";
import {CastMemberSequelizeRepository} from "@core/cast_member/infra/db/sequelize/cast_member-sequelize.repository";
import {CastMember} from "@core/cast_member/domain/cast_member.aggregate";
import {VideoId} from "@core/video/domain/video.aggregate";

describe("VideoCategoryModel Unit Tests", () => {
	setupSequelizeForVideo();

	test('table name', () => {
		expect(VideoCategoryModel.tableName).toBe('category_video');
	});

	test('mapping props', () => {
		const attributesMap = VideoCategoryModel.getAttributes();
		const attributes = Object.keys(VideoCategoryModel.getAttributes());

		expect(attributes).toStrictEqual(['video_id', 'category_id']);

		const videoIdAttr = attributesMap.video_id;
		expect(videoIdAttr).toMatchObject({
			field: 'video_id',
			fieldName: 'video_id',
			primaryKey: true,
			type: DataType.UUID(),
			references: {
				key: 'video_id',
				model: 'videos',
			},
			unique: 'category_video_video_id_category_id_unique'
		});

		const categoryIdAttr = attributesMap.category_id;
		expect(categoryIdAttr).toMatchObject({
			field: 'category_id',
			fieldName: 'category_id',
			primaryKey: true,
			type: DataType.UUID(),
			references: {
				key: 'category_id',
				model: 'categories',
			},
			unique: 'category_video_video_id_category_id_unique'
		});
	});

});

describe("VideoGenreModel Unit Tests", () => {
	setupSequelizeForVideo();

	test('table name', () => {
		expect(VideoGenreModel.tableName).toBe('genre_video');
	});

	test('mapping props', () => {
		const attributesMap = VideoGenreModel.getAttributes();
		const attribudes = Object.keys(VideoGenreModel.getAttributes());

		expect(attribudes).toStrictEqual(['video_id', 'genre_id']);

		const videoIdAttr = attributesMap.video_id;
		expect(videoIdAttr).toMatchObject({
			field: 'video_id',
			fieldName: 'video_id',
			primaryKey: true,
			type: DataType.UUID(),
			references: {
				model: 'videos',
				key: 'video_id',
			},
			unique: 'genre_video_video_id_genre_id_unique',
		});

		const genreIdAttr = attributesMap.genre_id;
		expect(genreIdAttr).toMatchObject({
			field: 'genre_id',
			fieldName: 'genre_id',
			primaryKey: true,
			type: DataType.UUID(),
			references: {
				model: 'genres',
				key: 'genre_id',
			},
			unique: 'genre_video_video_id_genre_id_unique',
		});
	});
});

describe("VideoCastMemberModel Unit Tests", () => {
	setupSequelizeForVideo();

	test('table name', () => {
		expect(VideoCastMemberModel.tableName).toBe('cast_member_video');
	});

	test('mapping props', () => {
		const attributesMap = VideoCastMemberModel.getAttributes();
		const attribudes = Object.keys(VideoCastMemberModel.getAttributes());

		expect(attribudes).toStrictEqual(['video_id', 'cast_member_id']);

		const videoIdAttr = attributesMap.video_id;
		expect(videoIdAttr).toMatchObject({
			field: 'video_id',
			fieldName: 'video_id',
			primaryKey: true,
			type: DataType.UUID(),
			references: {
				model: 'videos',
				key: 'video_id',
			},
			unique: 'cast_member_video_video_id_cast_member_id_unique',
		});

		const castMemberIdAttr = attributesMap.cast_member_id;
		expect(castMemberIdAttr).toMatchObject({
			field: 'cast_member_id',
			fieldName: 'cast_member_id',
			primaryKey: true,
			type: DataType.UUID(),
			references: {
				model: 'cast_members',
				key: 'cast_member_id',
			},
			unique: 'cast_member_video_video_id_cast_member_id_unique',
		});
	});
});

describe("VideoModel Unit Tests", () => {
	setupSequelizeForVideo();

	test('table name', () => {
		expect(VideoModel.tableName).toBe('videos');
	});

	test('mapping props', () => {
		const attributesMap = VideoModel.getAttributes();
		const attribudes = Object.keys(VideoModel.getAttributes());

		expect(attribudes).toStrictEqual([
			'video_id',
			'title',
			'description',
			'year_launched',
			'duration',
			'rating',
			'is_open',
			'is_published',
			'created_at',
		]);

		const videoIdAttr = attributesMap.video_id;
		expect(videoIdAttr).toMatchObject({
			field: 'video_id',
			fieldName: 'video_id',
			primaryKey: true,
			type: DataType.UUID(),
		});

		const titleAttr = attributesMap.title;
		expect(titleAttr).toMatchObject({
			field: 'title',
			fieldName: 'title',
			allowNull: false,
			type: DataType.STRING(255),
		});

		const descriptionAttr = attributesMap.description;
		expect(descriptionAttr).toMatchObject({
			field: 'description',
			fieldName: 'description',
			allowNull: false,
			type: DataType.TEXT(),
		});

		const yearLaunchedAttr = attributesMap.year_launched;
		expect(yearLaunchedAttr).toMatchObject({
			field: 'year_launched',
			fieldName: 'year_launched',
			allowNull: false,
			type: DataType.SMALLINT(),
		});

		const durationAttr = attributesMap.duration;
		expect(durationAttr).toMatchObject({
			field: 'duration',
			fieldName: 'duration',
			allowNull: false,
			type: DataType.SMALLINT(),
		});

		const ratingAttr = attributesMap.rating;
		expect(ratingAttr).toMatchObject({
			field: 'rating',
			fieldName: 'rating',
			allowNull: false,
			type: DataType.ENUM(
				RatingValues.RL,
				RatingValues.R10,
				RatingValues.R12,
				RatingValues.R14,
				RatingValues.R16,
				RatingValues.R18
			),
		});

		const isOpenAttr = attributesMap.is_open;
		expect(isOpenAttr).toMatchObject({
			field: 'is_open',
			fieldName: 'is_open',
			allowNull: false,
			type: DataType.BOOLEAN(),
		});

		const isPublishedAttr = attributesMap.is_published;
		expect(isPublishedAttr).toMatchObject({
			field: 'is_published',
			fieldName: 'is_published',
			allowNull: false,
			type: DataType.BOOLEAN(),
		});

		const createdAtAttr = attributesMap.created_at;
		expect(createdAtAttr).toMatchObject({
			field: 'created_at',
			fieldName: 'created_at',
			allowNull: false,
			type: DataType.DATE(6),
		});

	});

	test('mapping associations', () => {
		const associationsMap = VideoModel.associations;
		const associations = Object.keys(VideoModel.associations);

		expect(associations).toStrictEqual([
			'image_medias',
			'audio_video_medias',
			'categories_id',
			'categories',
			'genres_id',
			'genres',
			'cast_members_id',
			'cast_members',
		]);

		const imageMediasAttr = associationsMap.image_medias;
		expect(imageMediasAttr).toMatchObject({
			foreignKey: 'video_id',
			source: VideoModel,
			target: ImageMediaModel,
			associationType: 'HasMany',
			options: {
				foreignKey: {
					name: 'video_id'
				}
			}
		});

		const audioVideoMediasAttr = associationsMap.audio_video_medias;
		expect(audioVideoMediasAttr).toMatchObject({
			foreignKey: 'video_id',
			source: VideoModel,
			target: AudioVideoMediaModel,
			associationType: 'HasMany',
			options: {
				foreignKey: {
					name: 'video_id'
				}
			}
		});

		const categoriesIdAttr = associationsMap.categories_id;
		expect(categoriesIdAttr).toMatchObject({
			foreignKey: 'video_id',
			source: VideoModel,
			target: VideoCategoryModel,
			associationType: 'HasMany',
			options: {
				foreignKey: {
					name: 'video_id'
				}
			}
		});

		const categoriesAttr = associationsMap.categories;
		expect(categoriesAttr).toMatchObject({
			foreignKey: 'video_id',
			source: VideoModel,
			target: CategoryModel,
			associationType: 'BelongsToMany',
			options: {
				foreignKey: {
					name: 'video_id'
				}
			}
		});

		const genresIdAttr = associationsMap.genres_id;
		expect(genresIdAttr).toMatchObject({
			foreignKey: 'video_id',
			source: VideoModel,
			target: VideoGenreModel,
			associationType: 'HasMany',
			options: {
				foreignKey: {
					name: 'video_id'
				}
			}
		});

		const genresAttr = associationsMap.genres;
		expect(genresAttr).toMatchObject({
			foreignKey: 'video_id',
			source: VideoModel,
			target: GenreModel,
			associationType: 'BelongsToMany',
			options: {
				foreignKey: {
					name: 'video_id'
				}
			}
		});

		const castMembersIdAttr = associationsMap.cast_members_id;
		expect(castMembersIdAttr).toMatchObject({
			foreignKey: 'video_id',
			source: VideoModel,
			target: VideoCastMemberModel,
			associationType: 'HasMany',
			options: {
				foreignKey: {
					name: 'video_id'
				}
			}
		});

		const castMembersAttr = associationsMap.cast_members;
		expect(castMembersAttr).toMatchObject({
			foreignKey: 'video_id',
			source: VideoModel,
			target: CastMemberModel,
			associationType: 'BelongsToMany',
			options: {
				foreignKey: {
					name: 'video_id'
				}
			}
		});

	});
});

describe("VideoModel Integration Tests", () => {
	setupSequelizeForVideo();

	test("create and associate relations separately", async () => {
		const categoryRepo = new CategorySequelizeRepository(CategoryModel);
		const category = Category.fake().aCategory().build();

		await categoryRepo.insert(category);

		const genreRepo = new GenreSequelizeRepository(
			GenreModel,
			new UnitOfWorkFakeInMemory() as any
		);
		const genre = Genre.fake()
			.aGenre()
			.addCategoryId(category.category_id)
			.build();
		await genreRepo.insert(genre);

		const castMemberRepo = new CastMemberSequelizeRepository(CastMemberModel);
		const castMember = CastMember.fake().anActor().build();
		await castMemberRepo.insert(castMember);

		const videoProps = {
			video_id: new VideoId().id,
			title: 'title',
			description: 'description',
			year_launched: 2020,
			duration: 90,
			rating: RatingValues.R10,
			is_open: false,
			is_published: false,
			created_at: new Date(),
		};

		const video = await VideoModel.create(videoProps as any);

		await video.$add('categories', [category.category_id.id]);
		const videoWithCategories = await VideoModel.findByPk(video.video_id, {
			include: ['categories_id'],
		});

		expect(videoWithCategories).toMatchObject(videoProps);
		expect(videoWithCategories!.categories_id).toHaveLength(1);
		expect(videoWithCategories!.categories_id[0]).toBeInstanceOf(VideoCategoryModel);
		expect(videoWithCategories!.categories_id[0].category_id).toBe(category.category_id.id);

		await video.$add('genres', [genre.genre_id.id]);
		const videoWithGenres = await VideoModel.findByPk(video.video_id, {
			include: ['genres_id'],
		});

		expect(videoWithGenres).toMatchObject(videoProps);
		expect(videoWithGenres!.genres_id).toHaveLength(1);
		expect(videoWithGenres!.genres_id[0]).toBeInstanceOf(VideoGenreModel);
		expect(videoWithGenres!.genres_id[0].genre_id).toBe(genre.genre_id.id);

		await video.$add('cast_members', [castMember.cast_member_id.id]);
		const videoWithCastMembers = await VideoModel.findByPk(video.video_id, {
			include: ['cast_members_id'],
		});

		expect(videoWithCastMembers).toMatchObject(videoProps);
		expect(videoWithCastMembers!.cast_members_id).toHaveLength(1);
		expect(videoWithCastMembers!.cast_members_id[0]).toBeInstanceOf(VideoCastMemberModel);
		expect(videoWithCastMembers!.cast_members_id[0].cast_member_id).toBe(
			castMember.cast_member_id.id
		);

		await ImageMediaModel.create({
			image_media_id: new Uuid().id,
			location: 'location',
			name: 'name',
			video_id: video.video_id,
			video_related_field: ImageMediaRelatedField.BANNER,
		});
		const videoWithImageMedias = await VideoModel.findByPk(video.video_id, {
			include: ['image_medias'],
		});

		expect(videoWithImageMedias).toMatchObject(videoProps);
		expect(videoWithImageMedias!.image_medias).toHaveLength(1);
		expect(videoWithImageMedias!.image_medias[0]).toBeInstanceOf(ImageMediaModel);
		expect(videoWithImageMedias!.image_medias[0].toJSON()).toMatchObject({
			location: 'location',
			name: 'name',
			video_id: video.video_id,
			video_related_field: ImageMediaRelatedField.BANNER,
		});

		await AudioVideoMediaModel.create({
			audio_video_media_id: new Uuid().id,
			name: 'name',
			raw_location: 'raw_location',
			encoded_location: 'encoded_location',
			status: AudioVideoMediaStatus.COMPLETED,
			video_id: video.video_id,
			video_related_field: AudioVideoMediaRelatedField.VIDEO,
		});
		const videoWithAudioVideoMedias = await VideoModel.findByPk(video.video_id, {
			include: ['audio_video_medias'],
		});

		expect(videoWithAudioVideoMedias).toMatchObject(videoProps);
		expect(videoWithAudioVideoMedias!.audio_video_medias).toHaveLength(1);
		expect(videoWithAudioVideoMedias!.audio_video_medias[0]).toBeInstanceOf(
			AudioVideoMediaModel
		);
		expect(videoWithAudioVideoMedias!.audio_video_medias[0].toJSON()).toMatchObject({
			name: 'name',
			raw_location: 'raw_location',
			encoded_location: 'encoded_location',
			status: AudioVideoMediaStatus.COMPLETED,
			video_id: video.video_id,
			video_related_field: AudioVideoMediaRelatedField.VIDEO,
		});
	});
});