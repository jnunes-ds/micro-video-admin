import { Video, VideoId, VideoConstructorProps } from '../video.aggregate';
import { CategoryId } from '@core/category/domain/category.aggregate';
import { GenreId } from '@core/genre/domain/genre.aggregate';
import { CastMemberId } from '@core/cast_member/domain/cast_member.aggregate';
import { Rating } from '../rating.vo';
import { Banner } from '../banner.vo';
import { Thumbnail } from '../thumbnail.vo';
import { ThumbnailHalf } from '../thumbnail_half.vo';

describe('Video Aggregate Unit Tests', () => {
    let video: Video;
    let categoryId: CategoryId;
    let genreId: GenreId;
    let castMemberId: CastMemberId;
    let rating: Rating;

    beforeEach(() => {
        categoryId = new CategoryId();
        genreId = new GenreId();
        castMemberId = new CastMemberId();
        rating = Rating.createRL();
    });

    describe('constructor', () => {
        it('should create a video with default values', () => {
            const props: VideoConstructorProps = {
                title: 'title',
                description: 'description',
                year_launched: 2020,
                duration: 90,
                rating,
                is_opened: true,
                is_published: false,
                categories_id: new Map([[categoryId.id, categoryId]]),
                genres_id: new Map([[genreId.id, genreId]]),
                cast_members_id: new Map([[castMemberId.id, castMemberId]]),
            };

            const video = new Video(props);

            expect(video.video_id).toBeInstanceOf(VideoId);
            expect(video.title).toBe(props.title);
            expect(video.description).toBe(props.description);
            expect(video.year_launched).toBe(props.year_launched);
            expect(video.duration).toBe(props.duration);
            expect(video.rating).toBe(props.rating);
            expect(video.is_opened).toBe(props.is_opened);
            expect(video.is_published).toBe(props.is_published);
            expect(video.categories_id).toBe(props.categories_id);
            expect(video.genres_id).toBe(props.genres_id);
            expect(video.cast_members_id).toBe(props.cast_members_id);
            expect(video.banner).toBeNull();
            expect(video.thumbnail).toBeNull();
            expect(video.thumbnail_half).toBeNull();
            expect(video.created_at).toBeInstanceOf(Date);
        });

        it('should create a video with provided values', () => {
            const videoId = new VideoId();
            const created_at = new Date();
            const banner = new Banner({ name: 'banner', location: 'loc' });
            const thumbnail = new Thumbnail({ name: 'thumb', location: 'loc' });
            const thumbnail_half = new ThumbnailHalf({ name: 'thumb_half', location: 'loc' });

            const props: VideoConstructorProps = {
                video_id: videoId,
                title: 'title',
                description: 'description',
                year_launched: 2020,
                duration: 90,
                rating,
                is_opened: true,
                is_published: false,
                banner,
                thumbnail,
                thumbnail_half,
                categories_id: new Map([[categoryId.id, categoryId]]),
                genres_id: new Map([[genreId.id, genreId]]),
                cast_members_id: new Map([[castMemberId.id, castMemberId]]),
                created_at,
            };

            const video = new Video(props);

            expect(video.video_id).toBe(videoId);
            expect(video.banner).toBe(banner);
            expect(video.thumbnail).toBe(thumbnail);
            expect(video.thumbnail_half).toBe(thumbnail_half);
            expect(video.created_at).toBe(created_at);
        });
    });

    describe('create static method', () => {
        it('should create a video', () => {
            const video = Video.create({
                title: 'title',
                description: 'description',
                year_launched: 2020,
                duration: 90,
                rating,
                is_opened: true,
                categories_id: [categoryId],
                genres_id: [genreId],
                cast_members_id: [castMemberId],
            });

            expect(video.video_id).toBeInstanceOf(VideoId);
            expect(video.title).toBe('title');
            expect(video.description).toBe('description');
            expect(video.year_launched).toBe(2020);
            expect(video.duration).toBe(90);
            expect(video.rating).toBe(rating);
            expect(video.is_opened).toBe(true);
            expect(video.is_published).toBe(false);
            expect(video.categories_id.get(categoryId.id)).toBe(categoryId);
            expect(video.genres_id.get(genreId.id)).toBe(genreId);
            expect(video.cast_members_id.get(castMemberId.id)).toBe(castMemberId);
        });
    });

    describe('change methods', () => {
        beforeEach(() => {
            video = Video.create({
                title: 'title',
                description: 'description',
                year_launched: 2020,
                duration: 90,
                rating,
                is_opened: true,
                categories_id: [categoryId],
                genres_id: [genreId],
                cast_members_id: [castMemberId],
            });
        });

        it('should change title', () => {
            video.changeTitle('new title');
            expect(video.title).toBe('new title');
        });

        it('should change description', () => {
            video.changeDescription('new description');
            expect(video.description).toBe('new description');
        });

        it('should change year launched', () => {
            video.changeYearLaunched(2022);
            expect(video.year_launched).toBe(2022);
        });

        it('should change duration', () => {
            video.changeDuration(120);
            expect(video.duration).toBe(120);
        });

        it('should change rating', () => {
            const newRating = Rating.create18();
            video.changeRating(newRating);
            expect(video.rating).toBe(newRating);
        });

        it('should mark as opened', () => {
            video.markAsNotOpened();
            video.markAsOpened();
            expect(video.is_opened).toBe(true);
        });

        it('should mark as not opened', () => {
            video.markAsNotOpened();
            expect(video.is_opened).toBe(false);
        });
    });

    describe('categories management', () => {
        beforeEach(() => {
            video = Video.create({
                title: 'title',
                description: 'description',
                year_launched: 2020,
                duration: 90,
                rating,
                is_opened: true,
                categories_id: [categoryId],
                genres_id: [genreId],
                cast_members_id: [castMemberId],
            });
        });

        it('should add category id', () => {
            const newCategoryId = new CategoryId();
            video.addCategoryId(newCategoryId);
            expect(video.categories_id.size).toBe(2);
            expect(video.categories_id.get(newCategoryId.id)).toBe(newCategoryId);
        });

        it('should remove category id', () => {
            video.removeCategoryId(categoryId);
            expect(video.categories_id.size).toBe(0);
        });

        it('should sync categories id', () => {
            const newCategoryId1 = new CategoryId();
            const newCategoryId2 = new CategoryId();
            video.syncCategoriesId([newCategoryId1, newCategoryId2]);
            expect(video.categories_id.size).toBe(2);
            expect(video.categories_id.get(newCategoryId1.id)).toBe(newCategoryId1);
            expect(video.categories_id.get(newCategoryId2.id)).toBe(newCategoryId2);
        });

        it('should throw error when syncing empty categories id', () => {
            expect(() => video.syncCategoriesId([])).toThrow('Categories id is empty');
        });
    });

    describe('genres management', () => {
        beforeEach(() => {
            video = Video.create({
                title: 'title',
                description: 'description',
                year_launched: 2020,
                duration: 90,
                rating,
                is_opened: true,
                categories_id: [categoryId],
                genres_id: [genreId],
                cast_members_id: [castMemberId],
            });
        });

        it('should add genre id', () => {
            const newGenreId = new GenreId();
            video.addGenreId(newGenreId);
            expect(video.genres_id.size).toBe(2);
            expect(video.genres_id.get(newGenreId.id)).toBe(newGenreId);
        });

        it('should remove genre id', () => {
            video.removeGenreId(genreId);
            expect(video.genres_id.size).toBe(0);
        });

        it('should sync genres id', () => {
            const newGenreId1 = new GenreId();
            const newGenreId2 = new GenreId();
            video.syncGentesId([newGenreId1, newGenreId2]);
            expect(video.genres_id.size).toBe(2);
            expect(video.genres_id.get(newGenreId1.id)).toBe(newGenreId1);
            expect(video.genres_id.get(newGenreId2.id)).toBe(newGenreId2);
        });

        it('should throw error when syncing empty genres id', () => {
            expect(() => video.syncGentesId([])).toThrow('Genres Id is empty');
        });
    });

    describe('cast members management', () => {
        beforeEach(() => {
            video = Video.create({
                title: 'title',
                description: 'description',
                year_launched: 2020,
                duration: 90,
                rating,
                is_opened: true,
                categories_id: [categoryId],
                genres_id: [genreId],
                cast_members_id: [castMemberId],
            });
        });

        it('should add cast member id', () => {
            const newCastMemberId = new CastMemberId();
            video.addCastMemberId(newCastMemberId);
            expect(video.cast_members_id.size).toBe(2);
            expect(video.cast_members_id.get(newCastMemberId.id)).toBe(newCastMemberId);
        });

        it('should remove cast member id', () => {
            video.removeCastMemberId(castMemberId);
            expect(video.cast_members_id.size).toBe(0);
        });

        it('should sync cast members id', () => {
            const newCastMemberId1 = new CastMemberId();
            const newCastMemberId2 = new CastMemberId();
            video.syncCastMembersId([newCastMemberId1, newCastMemberId2]);
            expect(video.cast_members_id.size).toBe(2);
            expect(video.cast_members_id.get(newCastMemberId1.id)).toBe(newCastMemberId1);
            expect(video.cast_members_id.get(newCastMemberId2.id)).toBe(newCastMemberId2);
        });

        it('should throw error when syncing empty cast members id', () => {
            expect(() => video.syncCastMembersId([])).toThrow('Cast Members Id is empty');
        });
    });

    describe('entity_id', () => {
        it('should return the video_id', () => {
            const videoId = new VideoId();
            video = new Video({
                video_id: videoId,
                title: 'title',
                description: 'description',
                year_launched: 2020,
                duration: 90,
                rating,
                is_opened: true,
                is_published: false,
                categories_id: new Map(),
                genres_id: new Map(),
                cast_members_id: new Map(),
            });

            expect(video.entity_id).toBe(videoId);
        });
    });

    describe('toJSON', () => {
        it('should convert video to JSON format', () => {
            const videoId = new VideoId();
            const created_at = new Date();
            const banner = new Banner({ name: 'banner', location: 'loc' });
            
            video = new Video({
                video_id: videoId,
                title: 'title',
                description: 'description',
                year_launched: 2020,
                duration: 90,
                rating,
                is_opened: true,
                is_published: false,
                banner,
                categories_id: new Map([[categoryId.id, categoryId]]),
                genres_id: new Map([[genreId.id, genreId]]),
                cast_members_id: new Map([[castMemberId.id, castMemberId]]),
                created_at,
            });

            const json = video.toJSON();

            expect(json).toEqual({
                video_id: videoId.id,
                title: 'title',
                description: 'description',
                year_launched: 2020,
                duration: 90,
                rating: rating.value,
                is_opened: true,
                is_published: false,
                banner: banner.toJSON(),
                thumbnail: null,
                thumbnail_half: null,
                categories_id: [categoryId.id],
                genres_id: [genreId.id],
                cast_members_id: [castMemberId.id],
                created_at,
            });
        });
    });
});
