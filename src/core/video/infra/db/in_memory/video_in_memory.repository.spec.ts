import { VideoInMemoryRepository } from './video_in_memory.repository';
import { Video } from '@core/video/domain/video.aggregate';
import { VideoFakeBuilder } from '@core/video/domain/video_fake.builder';
import { CategoryId } from '@core/category/domain/category.aggregate';
import { GenreId } from '@core/genre/domain/genre.aggregate';
import { CastMemberId } from '@core/cast_member/domain/cast_member.aggregate';

describe('VideoInMemoryRepository', () => {
	let repository: VideoInMemoryRepository;

	beforeEach(() => {
		repository = new VideoInMemoryRepository();
	});

	it('should return Video class for getEntity()', () => {
		expect(repository.getEntity()).toBe(Video);
	});

	it('should verify sortable fields', () => {
		expect(repository.sortableFields).toStrictEqual(['title', 'created_at']);
	});

	describe('applyFilter method', () => {
		it('should return all items when no filter is provided', async () => {
			const items = [VideoFakeBuilder.aVideoWithoutMedias().build()];
			const spyFilterMethod = jest.spyOn(items, 'filter');
			
			const itemsFiltered = await repository['applyFilter'](items, null);
			expect(itemsFiltered).toStrictEqual(items);
			expect(spyFilterMethod).not.toHaveBeenCalled();
		});

		it('should filter by title', async () => {
			const items = [
				VideoFakeBuilder.aVideoWithoutMedias().withTitle('test').build(),
				VideoFakeBuilder.aVideoWithoutMedias().withTitle('TEST').build(),
				VideoFakeBuilder.aVideoWithoutMedias().withTitle('fake').build(),
			];

			let itemsFiltered = await repository['applyFilter'](items, { title: 'TEST' } as any);
			expect(itemsFiltered).toStrictEqual([items[0], items[1]]);

			itemsFiltered = await repository['applyFilter'](items, { title: 'no-filter' } as any);
			expect(itemsFiltered).toHaveLength(0);
		});

		it('should filter by categories_id', async () => {
			const categoryId1 = new CategoryId();
			const categoryId2 = new CategoryId();
			const categoryId3 = new CategoryId();

			const items = [
				VideoFakeBuilder.aVideoWithoutMedias().addCategoryId(categoryId1).build(),
				VideoFakeBuilder.aVideoWithoutMedias().addCategoryId(categoryId2).build(),
				VideoFakeBuilder.aVideoWithoutMedias().addCategoryId(categoryId1).addCategoryId(categoryId2).build(),
			];

			let itemsFiltered = await repository['applyFilter'](items, { categories_id: [categoryId1] } as any);
			expect(itemsFiltered).toStrictEqual([items[0], items[2]]);

			itemsFiltered = await repository['applyFilter'](items, { categories_id: [categoryId2] } as any);
			expect(itemsFiltered).toStrictEqual([items[1], items[2]]);

			itemsFiltered = await repository['applyFilter'](items, { categories_id: [categoryId1, categoryId2] } as any);
			expect(itemsFiltered).toStrictEqual([items[0], items[1], items[2]]);

			itemsFiltered = await repository['applyFilter'](items, { categories_id: [categoryId3] } as any);
			expect(itemsFiltered).toHaveLength(0);
		});

		it('should filter by genres_id', async () => {
			const genreId1 = new GenreId();
			const genreId2 = new GenreId();
			const genreId3 = new GenreId();

			const items = [
				VideoFakeBuilder.aVideoWithoutMedias().addGenreId(genreId1).build(),
				VideoFakeBuilder.aVideoWithoutMedias().addGenreId(genreId2).build(),
				VideoFakeBuilder.aVideoWithoutMedias().addGenreId(genreId1).addGenreId(genreId2).build(),
			];

			let itemsFiltered = await repository['applyFilter'](items, { genres_id: [genreId1] } as any);
			expect(itemsFiltered).toStrictEqual([items[0], items[2]]);

			itemsFiltered = await repository['applyFilter'](items, { genres_id: [genreId2] } as any);
			expect(itemsFiltered).toStrictEqual([items[1], items[2]]);

			itemsFiltered = await repository['applyFilter'](items, { genres_id: [genreId1, genreId2] } as any);
			expect(itemsFiltered).toStrictEqual([items[0], items[1], items[2]]);

			itemsFiltered = await repository['applyFilter'](items, { genres_id: [genreId3] } as any);
			expect(itemsFiltered).toHaveLength(0);
		});

		it('should filter by cast_members_id', async () => {
			const castMemberId1 = new CastMemberId();
			const castMemberId2 = new CastMemberId();
			const castMemberId3 = new CastMemberId();

			const items = [
				VideoFakeBuilder.aVideoWithoutMedias().addCastMemberId(castMemberId1).build(),
				VideoFakeBuilder.aVideoWithoutMedias().addCastMemberId(castMemberId2).build(),
				VideoFakeBuilder.aVideoWithoutMedias().addCastMemberId(castMemberId1).addCastMemberId(castMemberId2).build(),
			];

			let itemsFiltered = await repository['applyFilter'](items, { cast_members_id: [castMemberId1] } as any);
			expect(itemsFiltered).toStrictEqual([items[0], items[2]]);

			itemsFiltered = await repository['applyFilter'](items, { cast_members_id: [castMemberId2] } as any);
			expect(itemsFiltered).toStrictEqual([items[1], items[2]]);

			itemsFiltered = await repository['applyFilter'](items, { cast_members_id: [castMemberId1, castMemberId2] } as any);
			expect(itemsFiltered).toStrictEqual([items[0], items[1], items[2]]);

			itemsFiltered = await repository['applyFilter'](items, { cast_members_id: [castMemberId3] } as any);
			expect(itemsFiltered).toHaveLength(0);
		});

		it('should filter by title, categories_id, genres_id, and cast_members_id together', async () => {
			const categoryId = new CategoryId();
			const genreId = new GenreId();
			const castMemberId = new CastMemberId();

			const items = [
				VideoFakeBuilder.aVideoWithoutMedias()
					.withTitle('test')
					.addCategoryId(categoryId)
					.addGenreId(genreId)
					.addCastMemberId(castMemberId)
					.build(),
				VideoFakeBuilder.aVideoWithoutMedias()
					.withTitle('test')
					.addCategoryId(categoryId)
					.build(),
				VideoFakeBuilder.aVideoWithoutMedias()
					.withTitle('test')
					.addGenreId(genreId)
					.build(),
				VideoFakeBuilder.aVideoWithoutMedias()
					.withTitle('fake')
					.addCategoryId(categoryId)
					.addGenreId(genreId)
					.addCastMemberId(castMemberId)
					.build(),
			];

			let itemsFiltered = await repository['applyFilter'](items, {
				title: 'test',
				categories_id: [categoryId],
				genres_id: [genreId],
				cast_members_id: [castMemberId]
			} as any);
			expect(itemsFiltered).toStrictEqual([items[0]]);

			itemsFiltered = await repository['applyFilter'](items, {
				title: 'test',
				categories_id: [categoryId]
			} as any);
			expect(itemsFiltered).toStrictEqual([items[0], items[1]]);
		});
	});
});
