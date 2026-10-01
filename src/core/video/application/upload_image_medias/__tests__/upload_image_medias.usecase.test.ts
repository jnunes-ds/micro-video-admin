import {UploadImageMediasUsecase} from "@core/video/application/upload_image_medias/upload_image_medias.usecase";
import {IVideoRepository} from "@core/video/domain/video.repository";
import {ICategoryRepository} from "@core/category/domain/category.repository";
import {IGenreRepository} from "@core/genre/domain/genre.repository";
import {ICastMemberRepository} from "@core/cast_member/domain/cast_member.repository";
import {UnitOfWorkSequelize} from "@core/@shared/infra/db/sequelize/unit_of_work_sequelize";
import {IStorage} from "@core/@shared/application/storage.interface";
import {setupSequelizeForVideo} from "@core/video/infra/db/sequelize/testing/helpers";
import {CategorySequelizeRepository} from "@core/category/infra/db/sequelize/category-sequelize.repository";
import {CategoryModel} from "@core/category/infra/db/sequelize/category.model";
import {GenreSequelizeRepository} from "@core/genre/infra/sequelize/genre_sequelize.repository";
import {GenreModel} from "@core/genre/infra/sequelize/genre.model";
import {CastMemberSequelizeRepository} from "@core/cast_member/infra/db/sequelize/cast_member-sequelize.repository";
import {CastMemberModel} from "@core/cast_member/infra/db/sequelize/cast_member.model";
import {VideoSequelizeRepository} from "@core/video/infra/db/sequelize/video_sequelize.repository";
import {VideoModel} from "@core/video/infra/db/sequelize/video.models";
import {InMemoryStorage} from "@core/@shared/infra/storage/in_memory.storage";
import {NotFoundError} from "@core/@shared/domain/errors/not_found.error";
import {Video} from "@core/video/domain/video.aggregate";
import {Category} from "@core/category/domain/category.aggregate";
import {Genre} from "@core/genre/domain/genre.aggregate";
import {CastMember} from "@core/cast_member/domain/cast_member.aggregate";
import {EntityValidationError} from "@core/@shared/domain/validators/validation.error";

describe('UploadImageMediasUseCase Integration Tests', () => {
	let uploadImageMediasUsecase: UploadImageMediasUsecase;
	let videoRepo: IVideoRepository;
	let categoryRepo: ICategoryRepository;
	let genreRepo: IGenreRepository;
	let castMemberRepo: ICastMemberRepository;
	let uow: UnitOfWorkSequelize;
	let storageService: IStorage;

	const sequelizeHelper = setupSequelizeForVideo();

	beforeEach(() => {
		uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
		categoryRepo = new CategorySequelizeRepository(CategoryModel);
		genreRepo = new GenreSequelizeRepository(GenreModel, uow);
		castMemberRepo = new CastMemberSequelizeRepository(CastMemberModel);
		videoRepo = new VideoSequelizeRepository(VideoModel, uow);
		storageService = new InMemoryStorage();

		uploadImageMediasUsecase = new UploadImageMediasUsecase(uow, videoRepo, storageService);
	});

	test("if throw's error when video is not found", async () => {
		await expect(
			uploadImageMediasUsecase.execute({
				video_id: '6ebe30f5-1260-4904-b2ed-765b7b2a78e3',
				field: 'banner',
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
	});

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
			await uploadImageMediasUsecase.execute({
				video_id: video.video_id.id,
				field: 'banner',
				file: {
					raw_name: 'banner.jpg',
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
						banner: [
							'Invalid media file mime type: image/jpg not in image/jpeg, image/png, image/gif'
						]
					}
				]);
			}
		}
	});

	test('upload banner image', async () => {
		const storeSpy = jest.spyOn(storageService, 'store');

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

		await uploadImageMediasUsecase.execute({
			video_id: video.video_id.id,
			field: 'banner',
			file: {
				raw_name: 'banner.jpg',
				data: Buffer.from('test data'),
				mime_type: 'image/jpeg',
				size: 100
			}
		});

		const videoUpdated = await videoRepo.findById(video.video_id);
		expect(videoUpdated!.banner).toBeDefined();
		expect(videoUpdated!.banner!.name.includes('.jpg')).toBeTruthy();
		expect(videoUpdated!.banner!.location).toBe(`videos/${videoUpdated!.video_id.id}/images`);
		expect(storeSpy).toHaveBeenCalledWith({
			data: Buffer.from('test data'),
			id: videoUpdated!.banner!.url,
			mime_type: 'image/jpeg'
		});
	});
});