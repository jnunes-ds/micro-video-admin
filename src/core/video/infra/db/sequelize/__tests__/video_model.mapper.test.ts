import {ICategoryRepository} from "@core/category/domain/category.repository";
import {IGenreRepository} from "@core/genre/domain/genre.repository";
import {setupSequelizeForVideo} from "@core/video/infra/db/sequelize/testing/helpers";
import {CategorySequelizeRepository} from "@core/category/infra/db/sequelize/category-sequelize.repository";
import {CategoryModel} from "@core/category/infra/db/sequelize/category.model";
import {CastMemberSequelizeRepository} from "@core/cast_member/infra/db/sequelize/cast_member-sequelize.repository";
import {CastMemberModel} from "@core/cast_member/infra/db/sequelize/cast_member.model";
import {ICastMemberRepository} from "@core/cast_member/domain/cast_member.repository";
import {GenreSequelizeRepository} from "@core/genre/infra/sequelize/genre_sequelize.repository";
import {GenreModel} from "@core/genre/infra/sequelize/genre.model";
import {UnitOfWorkFakeInMemory} from "@core/@shared/infra/db/in_memory/fake_unit_of_work_in_memory";
import {Category} from "@core/category/domain/category.aggregate";
import {Genre} from "@core/genre/domain/genre.aggregate";
import {CastMember} from "@core/cast_member/domain/cast_member.aggregate";
import {Video, VideoConstructorProps, VideoId} from "@core/video/domain/video.aggregate";
import {Rating, RatingValues} from "@core/video/domain/rating.vo";
import {
	VideoCastMemberModel,
	VideoCategoryModel,
	VideoGenreModel,
	VideoModel,
	VideoModelsProps
} from "@core/video/infra/db/sequelize/video.models";
import {VideoModelMapper} from "@core/video/infra/db/sequelize/video_model.mapper";
import {ImageMediaModel, ImageMediaRelatedField} from "@core/video/infra/db/sequelize/image_media.model";
import {
	AudioVideoMediaModel,
	AudioVideoMediaRelatedField
} from "@core/video/infra/db/sequelize/audio_video_media.model";
import {AudioVideoMediaStatus} from "@core/@shared/domain/value_objects/audio_video_media.vo";
import {Banner} from "@core/video/domain/banner.vo";
import {Thumbnail} from "@core/video/domain/thumbnail.vo";
import {ThumbnailHalf} from "@core/video/domain/thumbnail_half.vo";
import {Trailer} from "@core/video/domain/trailer.vo";
import {VideoMedia} from "@core/video/domain/video_media.vo";
import {EntityId} from "@core/@shared/domain/entity";
import {LoadingEntityError} from "@core/@shared/domain/errors/loading_entity.error";

describe("VideoModelMapper Integration Tests", () => {
	let categoryRepo: ICategoryRepository;
	let genreRepo: IGenreRepository;
	let castMemberRepo: ICastMemberRepository;

	setupSequelizeForVideo();

	beforeEach(() => {
		let uow = new UnitOfWorkFakeInMemory() as any;
		categoryRepo = new CategorySequelizeRepository(CategoryModel);
		castMemberRepo = new CastMemberSequelizeRepository(CastMemberModel);
		genreRepo = new GenreSequelizeRepository(GenreModel, uow);
	});

	it('should throw errors when video is invalid', () => {
		const arrange = [
			{
				makeVideoModel: () =>
					VideoModel.build(
						{
							video_id: new VideoId().id,
							title: 'a'.repeat(256),
							description: 'description',
							year_launched: 2020,
							duration: 90,
							rating: RatingValues.R10,
							is_opened: false,
							is_published: false,
							created_at: new Date(),
							categories_id: [],
							genres_id: [],
							cast_members_id: [],
						} as any,
						{include: ['categories_id', 'genres_id', 'cast_members_id']}
					),
				expected: [
					{categories_id: ['categories_id should not be empty']},
					{genre_id: ['genres_id should not be empty']},
					{cast_members_id: ['cast_members_id should not be empty']},
					{title: ['title must be shorter than or equal to 255 characters']},
				],
			},
			{
				makeVideoModel: () =>
					VideoModel.build(
						{
							video_id: new VideoId().id,
							title: 'title',
							description: 'description',
							year_launched: 2020,
							duration: 90,
							rating: RatingValues.R10,
							is_opened: false,
							is_published: false,
							created_at: new Date(),
							categories_id: [],
							genres_id: [],
							cast_members_id: [],
						} as any,
						{include: ['categories_id', 'genres_id', 'cast_members_id']}
					),
				expected: [
					{categories_id: ['categories_id should not be empty']},
					{genre_id: ['genres_id should not be empty']},
					{cast_members_id: ['cast_members_id should not be empty']},
				],
			},
		];

		for (const item of arrange) {
			const model = item.makeVideoModel();

			try {
				VideoModelMapper.toEntity(model);
				fail('The video is valid, but it needs throws a LoadingEntityError');
			} catch (e) {
				expect(e).toBeInstanceOf(LoadingEntityError);
				expect((e as LoadingEntityError).error).toMatchObject(item.expected);
			}
		}
	});

	it('should convert a video model to a video entity', async () => {
		const category1 = Category.fake().aCategory().build();
		await categoryRepo.bulkInsert([category1]);
		const genre1 = Genre.fake()
			.aGenre()
			.addCategoryId(category1.category_id)
			.build();
		await genreRepo.bulkInsert([genre1]);
		const castMember1 = CastMember.fake().anActor().build();
		await castMemberRepo.bulkInsert([castMember1]);

		const videoProps = {
			video_id: new VideoId().id,
			title: 'title',
			description: 'description',
			year_launched: 2020,
			duration: 90,
			rating: RatingValues.R10,
			is_opened: false,
			is_published: false,
			created_at: new Date(),
		} satisfies Partial<VideoModelsProps>;

		let model = await VideoModel.create(
			{
				...videoProps,
				categories_id: [
					VideoCategoryModel.build({
						video_id: videoProps.video_id,
						category_id: category1.category_id.id,
					}),
				],
				genres_id: [
					VideoGenreModel.build({
						video_id: videoProps.video_id,
						genre_id: genre1.genre_id.id
					})
				],
				cast_members_id: [
					VideoCastMemberModel.build({
						video_id: videoProps.video_id,
						cast_member_id: castMember1.cast_member_id.id
					})
				]
			} as any,
			{include: ['categories_id', 'genres_id', 'cast_members_id']}
		);
		let entity = VideoModelMapper.toEntity(model);
		expect(entity.toJSON()).toEqual(
			new Video({
				video_id: new VideoId(model.video_id),
				title: videoProps.title,
				description: videoProps.description,
				year_launched: videoProps.year_launched,
				duration: videoProps.duration,
				rating: Rating.create10(),
				is_opened: videoProps.is_opened,
				is_published: videoProps.is_published,
				created_at: videoProps.created_at,
				categories_id: turnIdsIntoMap(category1.category_id),
				genres_id: turnIdsIntoMap(genre1.genre_id),
				cast_members_id: turnIdsIntoMap(castMember1.cast_member_id)
			}).toJSON()
		);

		videoProps.video_id = new VideoId().id;
		model = await VideoModel.create(
			{
			...videoProps,
			image_medias: [
				ImageMediaModel.build({
					video_id: videoProps.video_id,
					location: 'location banner',
					name: 'name banner',
					video_related_field: ImageMediaRelatedField.BANNER
				} as any),
				ImageMediaModel.build({
					video_id: videoProps.video_id,
					location: 'location thumbnail',
					name: 'name thumbnail',
					video_related_field: ImageMediaRelatedField.THUMBNAIL
				} as any),
				ImageMediaModel.build({
					video_id: videoProps.video_id,
					location: 'location thumbnail_half',
					name: 'name thumbnail_half',
					video_related_field: ImageMediaRelatedField.THUMBNAIL_HALF
				} as any),
			],
			audio_video_medias: [
				AudioVideoMediaModel.build({
					video_id: videoProps.video_id,
					name: 'name trailer',
					raw_location: 'raw_location trailer',
					encoded_location: 'encoded_location trailer',
					status: AudioVideoMediaStatus.COMPLETED,
					video_related_field: AudioVideoMediaRelatedField.TRAILER
				} as any),
				AudioVideoMediaModel.build({
					video_id: videoProps.video_id,
					name: 'name video',
					raw_location: 'raw_location video',
					encoded_location: 'encoded_location video',
					status: AudioVideoMediaStatus.COMPLETED,
					video_related_field: AudioVideoMediaRelatedField.VIDEO
				} as any),
			],
			categories_id: [
				VideoCategoryModel.build({
					video_id: videoProps.video_id,
					category_id: category1.category_id.id
				})
			],
			genres_id: [
				VideoGenreModel.build({
					video_id: videoProps.video_id,
					genre_id: genre1.genre_id.id
				})
			],
			cast_members_id: [
				VideoCastMemberModel.build({
					video_id: videoProps.video_id,
					cast_member_id: castMember1.cast_member_id.id
				})
			]
		} as any,
			{
				include: [
					'categories_id',
					'genres_id',
					'cast_members_id',
					'image_medias',
					'audio_video_medias'
				]
			}
		);

		entity = VideoModelMapper.toEntity(model);
		expect(entity.toJSON()).toEqual(
			new Video({
				video_id: new VideoId(model.video_id),
				title: videoProps.title,
				description: videoProps.description,
				year_launched: videoProps.year_launched,
				duration: videoProps.duration,
				rating: Rating.create10(),
				is_opened: videoProps.is_opened,
				is_published: videoProps.is_published,
				created_at: videoProps.created_at,
				banner: new Banner({
					name: 'name banner',
					location: 'location banner',
				}),
				thumbnail: new Thumbnail({
					name: 'name thumbnail',
					location: 'location thumbnail'
				}),
				thumbnail_half: new ThumbnailHalf({
					name: 'name thumbnail_half',
					location: 'location thumbnail_half'
				}),
				trailer: new Trailer({
					name: 'name trailer',
					raw_location: 'raw_location trailer',
					encoded_location: 'encoded_location trailer',
					status: AudioVideoMediaStatus.COMPLETED
				}),
				video: new VideoMedia({
					name: 'name video',
					raw_location: 'raw_location video',
					encoded_location: 'encoded_location video',
					status: AudioVideoMediaStatus.COMPLETED
				}),
				categories_id: turnIdsIntoMap(category1.category_id),
				genres_id: turnIdsIntoMap(genre1.genre_id),
				cast_members_id: turnIdsIntoMap(castMember1.cast_member_id)
			}).toJSON()
		);
	});

	it('should convert a video entity to a video model', async () => {
		const category1 = Category.fake().aCategory().build();
		await categoryRepo.bulkInsert([category1]);
		const genre1 = Genre.fake()
			.aGenre()
			.addCategoryId(category1.category_id)
			.build();
		await genreRepo.bulkInsert([genre1]);
		const castMember1 = CastMember.fake().anActor().build();
		await castMemberRepo.bulkInsert([castMember1]);

		const videoProps = {
			video_id: new VideoId(),
			title: 'title',
			description: 'description',
			year_launched: 2020,
			duration: 90,
			rating: Rating.create10(),
			is_opened: false,
			is_published: false,
			created_at: new Date(),
		} satisfies Partial<VideoConstructorProps>;

		let entity = new Video({
			...videoProps,
			categories_id: turnIdsIntoMap(category1.category_id),
			genres_id: turnIdsIntoMap(genre1.genre_id),
			cast_members_id: turnIdsIntoMap(castMember1.cast_member_id),
		});

		const model = VideoModelMapper.toModelProps(entity);
		expect(model).toEqual({
			video_id: videoProps.video_id.id,
			title: videoProps.title,
			description: videoProps.description,
			year_launched: videoProps.year_launched,
			duration: videoProps.duration,
			rating: videoProps.rating.value,
			is_opened: videoProps.is_opened,
			is_published: videoProps.is_published,
			created_at: videoProps.created_at,
			audio_video_medias: [],
			image_medias: [],
			categories_id: [
				VideoCategoryModel.build({
					video_id: videoProps.video_id.id,
					category_id: category1.category_id.id
				})
			],
			genres_id: [
				VideoGenreModel.build({
					video_id: videoProps.video_id.id,
					genre_id: genre1.genre_id.id
				})
			],
			cast_members_id: [
				VideoCastMemberModel.build({
					video_id: videoProps.video_id.id,
					cast_member_id: castMember1.cast_member_id.id
				})
			]
		});

		entity = new Video({
			...videoProps,
			banner: new Banner({
				location: 'location banner',
				name: 'name banner'
			}),
			thumbnail: new Thumbnail({
				location: 'location thumbnail',
				name: 'name thumbnail'
			}),
			thumbnail_half: new ThumbnailHalf({
				location: 'location thumbnail_half',
				name: 'name thumbnail_half'
			}),
			trailer: new Trailer({
				name: 'name trailer',
				raw_location: 'raw_location trailer',
				encoded_location: 'encoded_location trailer',
				status: AudioVideoMediaStatus.COMPLETED
			}),
			video: new VideoMedia({
				name: 'name video',
				raw_location: 'raw_location video',
				encoded_location: 'encoded_location video',
				status: AudioVideoMediaStatus.COMPLETED,
			}),
			categories_id: turnIdsIntoMap(category1.category_id),
			genres_id: turnIdsIntoMap(genre1.genre_id),
			cast_members_id: turnIdsIntoMap(castMember1.cast_member_id)
		});

		const model2 = VideoModelMapper.toModelProps(entity);
		expect(model2).toMatchObject({
			video_id: videoProps.video_id.id,
			title: videoProps.title,
			description: videoProps.description,
			year_launched: videoProps.year_launched,
			duration: videoProps.duration,
			rating: videoProps.rating.value,
			is_opened: videoProps.is_opened,
			is_published: videoProps.is_published,
			created_at: videoProps.created_at,
			image_medias: [
				{
					video_id: videoProps.video_id.id,
					name: 'name banner',
					location: 'location banner',
					video_related_field: ImageMediaRelatedField.BANNER
				},
				{
					video_id: videoProps.video_id.id,
					name: 'name thumbnail',
					location: 'location thumbnail',
					video_related_field: ImageMediaRelatedField.THUMBNAIL
				},
				{
					video_id: videoProps.video_id.id,
					name: 'name thumbnail_half',
					location: 'location thumbnail_half',
					video_related_field: ImageMediaRelatedField.THUMBNAIL_HALF
				},
			],
			audio_video_medias: [
				{
					video_id: videoProps.video_id.id,
					name: 'name trailer',
					raw_location: 'raw_location trailer',
					encoded_location: 'encoded_location trailer',
					status: AudioVideoMediaStatus.COMPLETED,
					video_related_field: AudioVideoMediaRelatedField.TRAILER
				},
				{
					video_id: videoProps.video_id.id,
					name: 'name video',
					raw_location: 'raw_location video',
					encoded_location: 'encoded_location video',
					status: AudioVideoMediaStatus.COMPLETED,
					video_related_field: AudioVideoMediaRelatedField.VIDEO
				},
			],
			categories_id: [
				VideoCategoryModel.build({
					video_id: videoProps.video_id.id,
					category_id: category1.category_id.id
				})
			],
			genres_id: [
				VideoGenreModel.build({
					video_id: videoProps.video_id.id,
					genre_id: genre1.genre_id.id
				})
			],
			cast_members_id: [
				VideoCastMemberModel.build({
					video_id: videoProps.video_id.id,
					cast_member_id: castMember1.cast_member_id.id
				})
			]
		});
	});

});


function turnIdsIntoMap<T extends EntityId>(id: T): Map<string, T> {
	return new Map([[id.id, id]]);
}