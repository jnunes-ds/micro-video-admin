import {setupSequelizeForVideo} from "@core/video/infra/db/sequelize/testing/helpers";
import {
	VideoCastMemberModel,
	VideoCategoryModel,
	VideoGenreModel,
	VideoModel
} from "@core/video/infra/db/sequelize/video.models";
import {VideoSequelizeRepository} from "@core/video/infra/db/sequelize/video_sequelize.repository";
import {VideoModelMapper} from "@core/video/infra/db/sequelize/video_model.mapper";
import {VideoFakeBuilder} from "@core/video/domain/video_fake.builder";
import {Video, VideoId} from "@core/video/domain/video.aggregate";
import {VideoSearchParams, VideoSearchResult} from "@core/video/domain/video.repository";
import {CategoryModel} from "@core/category/infra/db/sequelize/category.model";
import {CategorySequelizeRepository} from "@core/category/infra/db/sequelize/category-sequelize.repository";
import {Category} from "@core/category/domain/category.aggregate";
import {GenreModel} from "@core/genre/infra/sequelize/genre.model";
import {GenreSequelizeRepository} from "@core/genre/infra/sequelize/genre_sequelize.repository";
import {Genre} from "@core/genre/domain/genre.aggregate";
import {CastMemberModel} from "@core/cast_member/infra/db/sequelize/cast_member.model";
import {CastMemberSequelizeRepository} from "@core/cast_member/infra/db/sequelize/cast_member-sequelize.repository";
import {CastMember} from "@core/cast_member/domain/cast_member.aggregate";
import {NotFoundError} from "@core/@shared/domain/errors/not_found.error";
import {UnitOfWorkSequelize} from "@core/@shared/infra/db/sequelize/unit_of_work_sequelize";

describe('VideoSequelizeRepository Integration Test', () => {
	const sequelizeHelper = setupSequelizeForVideo();

	let uow: UnitOfWorkSequelize;
	let repository: VideoSequelizeRepository;
	let categoryRepository: CategorySequelizeRepository;
	let genreRepository: GenreSequelizeRepository;
	let castMemberRepository: CastMemberSequelizeRepository;

	beforeEach(async () => {
		uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
		repository = new VideoSequelizeRepository(VideoModel, uow);
		categoryRepository = new CategorySequelizeRepository(CategoryModel);
		genreRepository = new GenreSequelizeRepository(GenreModel, uow);
		castMemberRepository = new CastMemberSequelizeRepository(CastMemberModel);
	});

	it('should have Video as the entity', () => {
		expect(repository.getEntity()).toBe(Video);
	});

	it('should insert a new video', async () => {
		const category = Category.fake().aCategory().build();
		await categoryRepository.insert(category);

		const genre = Genre.fake().aGenre().addCategoryId(category.category_id).build();
		await uow.start();
		await genreRepository.insert(genre);
		await uow.commit();

		const castMember = CastMember.fake().anActor().build();
		await castMemberRepository.insert(castMember);

		const video = VideoFakeBuilder.aVideoWithoutMedias()
			.addCategoryId(category.category_id)
			.addGenreId(genre.genre_id)
			.addCastMemberId(castMember.cast_member_id)
			.build();

		await uow.start();
		await repository.insert(video);
		await uow.commit();

		const foundedVideo = await repository.findById(video.video_id);
		expect(foundedVideo!.video_id).toBeValueObject(video.video_id);
		expect(foundedVideo!.toJSON()).toStrictEqual(video.toJSON());
	});

	it('should insert a new video with medias', async () => {
		const category = Category.fake().aCategory().build();
		await categoryRepository.insert(category);

		const genre = Genre.fake().aGenre().addCategoryId(category.category_id).build();
		await uow.start();
		await genreRepository.insert(genre);
		await uow.commit();

		const castMember = CastMember.fake().anActor().build();
		await castMemberRepository.insert(castMember);

		const video = VideoFakeBuilder.aVideoWithMedias()
			.addCategoryId(category.category_id)
			.addGenreId(genre.genre_id)
			.addCastMemberId(castMember.cast_member_id)
			.build();

		await uow.start();
		await repository.insert(video);
		await uow.commit();

		const foundedVideo = await repository.findById(video.video_id);
		expect(foundedVideo!.video_id).toBeValueObject(video.video_id);
		expect(foundedVideo!.toJSON()).toStrictEqual(video.toJSON());
	});

	it('should bulk insert videos', async () => {
		const category = Category.fake().aCategory().build();
		await categoryRepository.insert(category);

		const genre = Genre.fake().aGenre().addCategoryId(category.category_id).build();
		await uow.start();
		await genreRepository.insert(genre);
		await uow.commit();

		const castMember = CastMember.fake().anActor().build();
		await castMemberRepository.insert(castMember);

		const videos = VideoFakeBuilder.theVideosWithoutMedias(3)
			.addCategoryId(category.category_id)
			.addGenreId(genre.genre_id)
			.addCastMemberId(castMember.cast_member_id)
			.build();

		await uow.start();
		await repository.bulkInsert(videos);
		await uow.commit();

		const foundedVideos = await repository.findAll();
		expect(foundedVideos).toHaveLength(3);
		videos.forEach(video => {
			const foundedVideo = foundedVideos.find(v => v.video_id.equals(video.video_id));
			expect(foundedVideo!.video_id).toBeValueObject(video.video_id);
		});
	});

	it('should keep the same video id across insert, findById, findAll, findByIds, existsById and search', async () => {
		const category = Category.fake().aCategory().build();
		await categoryRepository.insert(category);

		const genre = Genre.fake().aGenre().addCategoryId(category.category_id).build();
		await uow.start();
		await genreRepository.insert(genre);
		await uow.commit();

		const castMember = CastMember.fake().anActor().build();
		await castMemberRepository.insert(castMember);

		const video = VideoFakeBuilder.aVideoWithoutMedias()
			.addCategoryId(category.category_id)
			.addGenreId(genre.genre_id)
			.addCastMemberId(castMember.cast_member_id)
			.build();

		await uow.start();
		await repository.insert(video);
		await uow.commit();

		const byId = await repository.findById(video.video_id);
		expect(byId!.video_id).toBeValueObject(video.video_id);

		const [fromFindAll] = await repository.findAll();
		expect(fromFindAll.video_id).toBeValueObject(video.video_id);

		const [fromFindByIds] = await repository.findByIds([video.video_id]);
		expect(fromFindByIds.video_id).toBeValueObject(video.video_id);

		const {exists} = await repository.existsById([video.video_id]);
		expect(exists[0]).toBeValueObject(video.video_id);

		const searchOutput = await repository.search(VideoSearchParams.create({}));
		expect(searchOutput.items[0].video_id).toBeValueObject(video.video_id);
	});

	it('should return null when the video is not found by id', async () => {
		const foundedVideo = await repository.findById(new VideoId());
		expect(foundedVideo).toBeNull();
	});

	it('should return all videos', async () => {
		const category = Category.fake().aCategory().build();
		await categoryRepository.insert(category);

		const genre = Genre.fake().aGenre().addCategoryId(category.category_id).build();
		await uow.start();
		await genreRepository.insert(genre);
		await uow.commit();

		const castMember = CastMember.fake().anActor().build();
		await castMemberRepository.insert(castMember);

		const videos = VideoFakeBuilder.theVideosWithoutMedias(3)
			.addCategoryId(category.category_id)
			.addGenreId(genre.genre_id)
			.addCastMemberId(castMember.cast_member_id)
			.build();

		await uow.start();
		await repository.bulkInsert(videos);
		await uow.commit();

		const foundedVideos = await repository.findAll();
		expect(foundedVideos).toHaveLength(3);
		foundedVideos.forEach(video => expect(video).toBeInstanceOf(Video));
	});

	it('should return videos by ids', async () => {
		const category = Category.fake().aCategory().build();
		await categoryRepository.insert(category);

		const genre = Genre.fake().aGenre().addCategoryId(category.category_id).build();
		await uow.start();
		await genreRepository.insert(genre);
		await uow.commit();

		const castMember = CastMember.fake().anActor().build();
		await castMemberRepository.insert(castMember);

		const videos = VideoFakeBuilder.theVideosWithoutMedias(3)
			.addCategoryId(category.category_id)
			.addGenreId(genre.genre_id)
			.addCastMemberId(castMember.cast_member_id)
			.build();

		await uow.start();
		await repository.bulkInsert(videos);
		await uow.commit();

		const foundedVideos = await repository.findByIds([
			videos[0].video_id,
			videos[1].video_id,
			new VideoId()
		]);

		expect(foundedVideos).toHaveLength(2);
		[videos[0], videos[1]].forEach(video => {
			const foundedVideo = foundedVideos.find(v => v.video_id.equals(video.video_id));
			expect(foundedVideo!.video_id).toBeValueObject(video.video_id);
		});
	});

	describe('existsById method tests', () => {
		it('should throw an error when ids is an empty array', async () => {
			await expect(repository.existsById([])).rejects.toThrow(
				new Error('ids must be an array with at least one element')
			);
		});

		it('should return the ids that exist and the ones that do not', async () => {
			const category = Category.fake().aCategory().build();
			await categoryRepository.insert(category);

			const genre = Genre.fake().aGenre().addCategoryId(category.category_id).build();
			await uow.start();
			await genreRepository.insert(genre);
			await uow.commit();

			const castMember = CastMember.fake().anActor().build();
			await castMemberRepository.insert(castMember);

			const video = VideoFakeBuilder.aVideoWithoutMedias()
				.addCategoryId(category.category_id)
				.addGenreId(genre.genre_id)
				.addCastMemberId(castMember.cast_member_id)
				.build();

			await uow.start();
			await repository.insert(video);
			await uow.commit();

			const notExistentId = new VideoId();
			const {exists, not_exists} = await repository.existsById([
				video.video_id,
				notExistentId
			]);

			expect(exists).toHaveLength(1);
			expect(exists[0]).toBeValueObject(video.video_id);
			expect(not_exists).toHaveLength(1);
			expect(not_exists[0]).toBeValueObject(notExistentId);
		});
	});

	it('should throw an error on update when the video is not found', async () => {
		const video = VideoFakeBuilder.aVideoWithoutMedias().build();

		await uow.start();
		await expect(repository.update(video)).rejects.toThrow(
			new NotFoundError(video.video_id.id, Video)
		);
		await uow.rollback();
	});

	it('should update a video', async () => {
		const categories = Category.fake().theCategories(3).build();
		await categoryRepository.bulkInsert(categories);

		const genres = Genre.fake().theGenres(3).addCategoryId(categories[0].category_id).build();
		await uow.start();
		await genreRepository.bulkInsert(genres);
		await uow.commit();

		const castMembers = CastMember.fake().theCastMembers(3).build();
		await castMemberRepository.bulkInsert(castMembers);

		const video = VideoFakeBuilder.aVideoWithoutMedias()
			.withTitle('Movie')
			.addCategoryId(categories[0].category_id)
			.addGenreId(genres[0].genre_id)
			.addCastMemberId(castMembers[0].cast_member_id)
			.build();

		await uow.start();
		await repository.insert(video);
		await uow.commit();

		video.changeTitle('Movie updated');
		video.syncCategoriesId([categories[1].category_id, categories[2].category_id]);
		video.syncGentesId([genres[1].genre_id, genres[2].genre_id]);
		video.syncCastMembersId([castMembers[1].cast_member_id, castMembers[2].cast_member_id]);

		await uow.start();
		await repository.update(video);
		await uow.commit();

		const foundedVideo = await repository.findById(video.video_id);
		expect(foundedVideo!.video_id).toBeValueObject(video.video_id);
		expect(foundedVideo!.title).toBe('Movie updated');
		expect(foundedVideo!.toJSON()).toStrictEqual({
			...video.toJSON(),
			categories_id: expect.arrayContaining(video.toJSON().categories_id),
			genres_id: expect.arrayContaining(video.toJSON().genres_id),
			cast_members_id: expect.arrayContaining(video.toJSON().cast_members_id)
		});
		expect(foundedVideo!.categories_id.size).toBe(2);
		expect(foundedVideo!.genres_id.size).toBe(2);
		expect(foundedVideo!.cast_members_id.size).toBe(2);
	});

	it('should throw an error on delete when the video is not found', async () => {
		const videoId = new VideoId();

		await uow.start();
		await expect(repository.delete(videoId)).rejects.toThrow(
			new NotFoundError(videoId.id, Video)
		);
		await uow.rollback();
	});

	it('should delete a video and its relations', async () => {
		const category = Category.fake().aCategory().build();
		await categoryRepository.insert(category);

		const genre = Genre.fake().aGenre().addCategoryId(category.category_id).build();
		await uow.start();
		await genreRepository.insert(genre);
		await uow.commit();

		const castMember = CastMember.fake().anActor().build();
		await castMemberRepository.insert(castMember);

		const video = VideoFakeBuilder.aVideoWithMedias()
			.addCategoryId(category.category_id)
			.addGenreId(genre.genre_id)
			.addCastMemberId(castMember.cast_member_id)
			.build();

		await uow.start();
		await repository.insert(video);
		await uow.commit();

		await uow.start();
		await repository.delete(video.video_id);
		await uow.commit();

		await expect(repository.findById(video.video_id)).resolves.toBeNull();
		await expect(
			VideoCategoryModel.count({where: {video_id: video.video_id.id}})
		).resolves.toBe(0);
		await expect(
			VideoGenreModel.count({where: {video_id: video.video_id.id}})
		).resolves.toBe(0);
		await expect(
			VideoCastMemberModel.count({where: {video_id: video.video_id.id}})
		).resolves.toBe(0);
	});

	describe('transaction tests', () => {
		it('should not persist an inserted video when the transaction is rolled back', async () => {
			const category = Category.fake().aCategory().build();
			await categoryRepository.insert(category);

			const genre = Genre.fake().aGenre().addCategoryId(category.category_id).build();
			await uow.start();
			await genreRepository.insert(genre);
			await uow.commit();

			const castMember = CastMember.fake().anActor().build();
			await castMemberRepository.insert(castMember);

			const video = VideoFakeBuilder.aVideoWithoutMedias()
				.addCategoryId(category.category_id)
				.addGenreId(genre.genre_id)
				.addCastMemberId(castMember.cast_member_id)
				.build();

			await uow.start();
			await repository.insert(video);
			await uow.rollback();

			await expect(repository.findById(video.video_id)).resolves.toBeNull();
			await expect(
				VideoCategoryModel.count({where: {video_id: video.video_id.id}})
			).resolves.toBe(0);
		});

		it('should not persist bulk inserted videos when the transaction is rolled back', async () => {
			const category = Category.fake().aCategory().build();
			await categoryRepository.insert(category);

			const genre = Genre.fake().aGenre().addCategoryId(category.category_id).build();
			await uow.start();
			await genreRepository.insert(genre);
			await uow.commit();

			const castMember = CastMember.fake().anActor().build();
			await castMemberRepository.insert(castMember);

			const videos = VideoFakeBuilder.theVideosWithoutMedias(3)
				.addCategoryId(category.category_id)
				.addGenreId(genre.genre_id)
				.addCastMemberId(castMember.cast_member_id)
				.build();

			await uow.start();
			await repository.bulkInsert(videos);
			await uow.rollback();

			await expect(repository.findAll()).resolves.toHaveLength(0);
		});

		it('should keep the previous video state when the update transaction is rolled back', async () => {
			const categories = Category.fake().theCategories(2).build();
			await categoryRepository.bulkInsert(categories);

			const genre = Genre.fake().aGenre().addCategoryId(categories[0].category_id).build();
			await uow.start();
			await genreRepository.insert(genre);
			await uow.commit();

			const castMember = CastMember.fake().anActor().build();
			await castMemberRepository.insert(castMember);

			const video = VideoFakeBuilder.aVideoWithoutMedias()
				.withTitle('Movie')
				.addCategoryId(categories[0].category_id)
				.addGenreId(genre.genre_id)
				.addCastMemberId(castMember.cast_member_id)
				.build();

			await uow.start();
			await repository.insert(video);
			await uow.commit();

			video.changeTitle('Movie updated');
			video.syncCategoriesId([categories[1].category_id]);

			await uow.start();
			await repository.update(video);
			await uow.rollback();

			const foundedVideo = await repository.findById(video.video_id);
			expect(foundedVideo!.title).toBe('Movie');
			expect(foundedVideo!.categories_id.size).toBe(1);
			expect(
				foundedVideo!.categories_id.get(categories[0].category_id.id)
			).toBeValueObject(categories[0].category_id);
		});

		it('should rollback the deletion', async () => {
			const category = Category.fake().aCategory().build();
			await categoryRepository.insert(category);

			const genre = Genre.fake().aGenre().addCategoryId(category.category_id).build();
			await uow.start();
			await genreRepository.insert(genre);
			await uow.commit();

			const castMember = CastMember.fake().anActor().build();
			await castMemberRepository.insert(castMember);

			const video = VideoFakeBuilder.aVideoWithoutMedias()
				.addCategoryId(category.category_id)
				.addGenreId(genre.genre_id)
				.addCastMemberId(castMember.cast_member_id)
				.build();

			await uow.start();
			await repository.insert(video);
			await uow.commit();

			await uow.start();
			await repository.delete(video.video_id);
			await uow.rollback();

			const foundedVideo = await repository.findById(video.video_id);
			expect(foundedVideo!.video_id).toBeValueObject(video.video_id);
			expect(foundedVideo!.toJSON()).toStrictEqual(video.toJSON());
		});

		it('should commit the work done inside uow.do', async () => {
			const category = Category.fake().aCategory().build();
			await categoryRepository.insert(category);

			const genre = Genre.fake().aGenre().addCategoryId(category.category_id).build();
			await uow.start();
			await genreRepository.insert(genre);
			await uow.commit();

			const castMember = CastMember.fake().anActor().build();
			await castMemberRepository.insert(castMember);

			const video = VideoFakeBuilder.aVideoWithoutMedias()
				.addCategoryId(category.category_id)
				.addGenreId(genre.genre_id)
				.addCastMemberId(castMember.cast_member_id)
				.build();

			await uow.do(async () => {
				await repository.insert(video);
			});

			const foundedVideo = await repository.findById(video.video_id);
			expect(foundedVideo!.video_id).toBeValueObject(video.video_id);
		});

		it('should roll back the work done inside uow.do when it throws', async () => {
			const category = Category.fake().aCategory().build();
			await categoryRepository.insert(category);

			const genre = Genre.fake().aGenre().addCategoryId(category.category_id).build();
			await uow.start();
			await genreRepository.insert(genre);
			await uow.commit();

			const castMember = CastMember.fake().anActor().build();
			await castMemberRepository.insert(castMember);

			const video = VideoFakeBuilder.aVideoWithoutMedias()
				.addCategoryId(category.category_id)
				.addGenreId(genre.genre_id)
				.addCastMemberId(castMember.cast_member_id)
				.build();

			await expect(
				uow.do(async () => {
					await repository.insert(video);
					throw new Error('workFn error');
				})
			).rejects.toThrow('workFn error');

			await expect(repository.findById(video.video_id)).resolves.toBeNull();
		});

		it('should throw an error on commit and rollback when no transaction was started', async () => {
			await expect(uow.commit()).rejects.toThrow('Transaction not started');
			await expect(uow.rollback()).rejects.toThrow('Transaction not started');
		});
	});

	describe('search method tests', () => {
		it('should only apply paginate when other params are null', async () => {
			const category = Category.fake().aCategory().build();
			await categoryRepository.insert(category);

			const genre = Genre.fake().aGenre().addCategoryId(category.category_id).build();
			await uow.start();
			await genreRepository.insert(genre);
			await uow.commit();

			const castMember = CastMember.fake().anActor().build();
			await castMemberRepository.insert(castMember);

			const created_at = new Date();
			const videos = VideoFakeBuilder.theVideosWithoutMedias(16)
				.withTitle('Movie')
				.addCategoryId(category.category_id)
				.addGenreId(genre.genre_id)
				.addCastMemberId(castMember.cast_member_id)
				.withCreatedAt(created_at)
				.build();

			await uow.start();
			await repository.bulkInsert(videos);
			await uow.commit();

			const spyToEntity = jest.spyOn(VideoModelMapper, 'toEntity');

			const searchOutput = await repository.search(VideoSearchParams.create({}));
			expect(searchOutput).toBeInstanceOf(VideoSearchResult);
			expect(spyToEntity).toHaveBeenCalledTimes(15);
			expect(searchOutput.toJSON()).toMatchObject({
				total: 16,
				current_page: 1,
				last_page: 2,
				per_page: 15
			});
			searchOutput.items.forEach(item => {
				expect(item).toBeInstanceOf(Video);
				expect(item.video_id).toBeInstanceOf(VideoId);
				expect(item.title).toBe('Movie');
				expect(item.created_at).toEqual(created_at);
			});
		});

		it('should order by created_at DESC when search params are null', async () => {
			const category = Category.fake().aCategory().build();
			await categoryRepository.insert(category);

			const genre = Genre.fake().aGenre().addCategoryId(category.category_id).build();
			await uow.start();
			await genreRepository.insert(genre);
			await uow.commit();

			const castMember = CastMember.fake().anActor().build();
			await castMemberRepository.insert(castMember);

			const created_at = new Date();
			const videos = VideoFakeBuilder.theVideosWithoutMedias(16)
				.withTitle('Movie')
				.addCategoryId(category.category_id)
				.addGenreId(genre.genre_id)
				.addCastMemberId(castMember.cast_member_id)
				.withCreatedAt(index => new Date(created_at.getTime() + index * 100))
				.build();

			await uow.start();
			await repository.bulkInsert(videos);
			await uow.commit();

			const searchOutput = await repository.search(VideoSearchParams.create({}));
			const items = searchOutput.items;
			[...items].reverse().forEach((item, index) => {
				expect(`${item.created_at}`).toBe(`${videos[index + 1].created_at}`);
			});
		});

		it('should apply paginate and filter by title', async () => {
			const category = Category.fake().aCategory().build();
			await categoryRepository.insert(category);

			const genre = Genre.fake().aGenre().addCategoryId(category.category_id).build();
			await uow.start();
			await genreRepository.insert(genre);
			await uow.commit();

			const castMember = CastMember.fake().anActor().build();
			await castMemberRepository.insert(castMember);

			const videos = [
				VideoFakeBuilder.aVideoWithoutMedias()
					.withTitle('test')
					.addCategoryId(category.category_id)
					.addGenreId(genre.genre_id)
					.addCastMemberId(castMember.cast_member_id)
					.withCreatedAt(new Date(new Date().getTime() + 5000))
					.build(),
				VideoFakeBuilder.aVideoWithoutMedias()
					.withTitle('a')
					.addCategoryId(category.category_id)
					.addGenreId(genre.genre_id)
					.addCastMemberId(castMember.cast_member_id)
					.withCreatedAt(new Date(new Date().getTime() + 4000))
					.build(),
				VideoFakeBuilder.aVideoWithoutMedias()
					.withTitle('TEST')
					.addCategoryId(category.category_id)
					.addGenreId(genre.genre_id)
					.addCastMemberId(castMember.cast_member_id)
					.withCreatedAt(new Date(new Date().getTime() + 3000))
					.build(),
				VideoFakeBuilder.aVideoWithoutMedias()
					.withTitle('TeSt')
					.addCategoryId(category.category_id)
					.addGenreId(genre.genre_id)
					.addCastMemberId(castMember.cast_member_id)
					.withCreatedAt(new Date(new Date().getTime() + 1000))
					.build()
			];

			await uow.start();
			await repository.bulkInsert(videos);
			await uow.commit();

			let searchOutput = await repository.search(
				VideoSearchParams.create({
					page: 1,
					per_page: 2,
					filter: {title: 'TEST'}
				})
			);
			expect(searchOutput.toJSON(true)).toMatchObject(
				new VideoSearchResult({
					items: [videos[0], videos[2]],
					total: 3,
					current_page: 1,
					per_page: 2
				}).toJSON(true)
			);

			searchOutput = await repository.search(
				VideoSearchParams.create({
					page: 2,
					per_page: 2,
					filter: {title: 'TEST'}
				})
			);
			expect(searchOutput.toJSON(true)).toMatchObject(
				new VideoSearchResult({
					items: [videos[3]],
					total: 3,
					current_page: 2,
					per_page: 2
				}).toJSON(true)
			);
		});

		it('should return an empty result when no video matches the title filter', async () => {
			const category = Category.fake().aCategory().build();
			await categoryRepository.insert(category);

			const genre = Genre.fake().aGenre().addCategoryId(category.category_id).build();
			await uow.start();
			await genreRepository.insert(genre);
			await uow.commit();

			const castMember = CastMember.fake().anActor().build();
			await castMemberRepository.insert(castMember);

			const video = VideoFakeBuilder.aVideoWithoutMedias()
				.addCategoryId(category.category_id)
				.addGenreId(genre.genre_id)
				.addCastMemberId(castMember.cast_member_id)
				.build();

			await uow.start();
			await repository.insert(video);
			await uow.commit();

			const searchOutput = await repository.search(
				VideoSearchParams.create({
					filter: {title: 'non-existent title'}
				})
			);

			expect(searchOutput.toJSON()).toStrictEqual({
				items: [],
				total: 0,
				current_page: 1,
				per_page: 15,
				last_page: 0
			});
		});
	});
});
