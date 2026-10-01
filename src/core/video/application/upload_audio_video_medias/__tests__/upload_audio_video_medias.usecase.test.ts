import {IVideoRepository} from "@core/video/domain/video.repository";
import {ICategoryRepository} from "@core/category/domain/category.repository";
import {IGenreRepository} from "@core/genre/domain/genre.repository";
import {ICastMemberRepository} from "@core/cast_member/domain/cast_member.repository";
import {UnitOfWorkSequelize} from "@core/@shared/infra/db/sequelize/unit_of_work_sequelize";
import {setupSequelizeForVideo} from "@core/video/infra/db/sequelize/testing/helpers";
import {CategorySequelizeRepository} from "@core/category/infra/db/sequelize/category-sequelize.repository";
import {CategoryModel} from "@core/category/infra/db/sequelize/category.model";
import {GenreSequelizeRepository} from "@core/genre/infra/sequelize/genre_sequelize.repository";
import {GenreModel} from "@core/genre/infra/sequelize/genre.model";
import {CastMemberSequelizeRepository} from "@core/cast_member/infra/db/sequelize/cast_member-sequelize.repository";
import {CastMemberModel} from "@core/cast_member/infra/db/sequelize/cast_member.model";
import {VideoSequelizeRepository} from "@core/video/infra/db/sequelize/video_sequelize.repository";
import {VideoModel} from "@core/video/infra/db/sequelize/video.models";
import {NotFoundError} from "@core/@shared/domain/errors/not_found.error";
import {Video} from "@core/video/domain/video.aggregate";
import {Category} from "@core/category/domain/category.aggregate";
import {Genre} from "@core/genre/domain/genre.aggregate";
import {CastMember} from "@core/cast_member/domain/cast_member.aggregate";
import {EntityValidationError} from "@core/@shared/domain/validators/validation.error";
import {Storage as GoogleCloudStorageSdk} from '@google-cloud/storage';
import {Config} from "@core/@shared/infra/config";
import {GoogleCloudStorage} from "@core/@shared/infra/storage/google_cloud.storage";
import {
	UploadAudioVideoMediasUsecase
} from "@core/video/application/upload_audio_video_medias/upload_audio_video_medias.usecase";

describe('UploadAudioVideoMediasUsecase Integration Tests', () => {
	let uploadAudioVideoMediasUsecase: UploadAudioVideoMediasUsecase;
	let videoRepo: IVideoRepository;
	let categoryRepo: ICategoryRepository;
	let genreRepo: IGenreRepository;
	let castMemberRepo: ICastMemberRepository;
	let uow: UnitOfWorkSequelize;
	let googleCloudStorage: GoogleCloudStorage;

	const sequelizeHelper = setupSequelizeForVideo();

	beforeEach(() => {
		uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
		categoryRepo = new CategorySequelizeRepository(CategoryModel);
		genreRepo = new GenreSequelizeRepository(GenreModel, uow);
		castMemberRepo = new CastMemberSequelizeRepository(CastMemberModel);
		videoRepo = new VideoSequelizeRepository(VideoModel, uow);
		// storageService = new InMemoryStorage();
		const storageSdk = new GoogleCloudStorageSdk({
			credentials: Config.googleCredentials()
		});
		const bucketName = Config.bucketName();
		googleCloudStorage = new GoogleCloudStorage(storageSdk, bucketName);

		uploadAudioVideoMediasUsecase = new UploadAudioVideoMediasUsecase(uow, videoRepo, googleCloudStorage);
	});

	test("if throw's error when video is not found", async () => {
		await expect(
			uploadAudioVideoMediasUsecase.execute({
				video_id: '6ebe30f5-1260-4904-b2ed-765b7b2a78e3',
				field: 'video',
				file: {
					raw_name: 'banner.jpg',
					data: Buffer.from(''),
					mime_type: 'image/jpg',
					size: 100
				}
			})
		).rejects.toThrow(
			new NotFoundError('6ebe30f5-1260-4904-b2ed-765b7b2a78e3', Video)
		)
	}, 10000);

	test("if throw's error when image is invalid", async () => {
		expect.assertions(2);
		const category = Category.fake().aCategory().build();
		await categoryRepo.insert(category);

		const genre = Genre.fake()
			.aGenre()
			.addCategoryId(category.category_id)
			.build();
		await genreRepo.insert(genre);

		const castMember = CastMember.fake().anActor().build();
		await castMemberRepo.insert(castMember);

		const video = Video.fake()
			.aVideoWithoutMedias()
			.addCategoryId(category.category_id)
			.addGenreId(genre.genre_id)
			.addCastMemberId(castMember.cast_member_id)
			.build();
		await videoRepo.insert(video);

		try {
			await uploadAudioVideoMediasUsecase.execute({
				video_id: video.video_id.id,
				field: 'video',
				file: {
					raw_name: 'video.jpg',
					data: Buffer.from(''),
					mime_type: 'image/jpg',
					size: 100
				}
			});
		} catch (error) {
			expect(error).toBeInstanceOf(EntityValidationError);
			if (error instanceof  EntityValidationError) {
				expect(error.error).toEqual([
					{
						video: [
							'Invalid media file mime type: image/jpg not in image/jpeg, image/png, image/gif'
						]
					}
				]);
			}
		}
	}, 10000);

	test('upload banner image', async () => {
		const category = Category.fake().aCategory().build();
		await categoryRepo.insert(category);

		const genre = Genre.fake()
			.aGenre()
			.addCategoryId(category.category_id)
			.build();
		await genreRepo.insert(genre);

		const castMember = CastMember.fake().anActor().build();
		await castMemberRepo.insert(castMember);

		const video = Video.fake()
			.aVideoWithoutMedias()
			.addCategoryId(category.category_id)
			.addGenreId(genre.genre_id)
			.addCastMemberId(castMember.cast_member_id)
			.build();
		await videoRepo.insert(video);

		await uploadAudioVideoMediasUsecase.execute({
			video_id: video.video_id.id,
			field: 'video',
			file: {
				raw_name: 'video.jpg',
				data: Buffer.from('test data'),
				mime_type: 'image/jpeg',
				size: 100
			}
		});

		const videoUpdated = await videoRepo.findById(video.video_id);
		expect(videoUpdated!.video).toBeDefined();
		expect(videoUpdated!.video!.name.includes('.jpg')).toBeTruthy();
	}, 10000);
});