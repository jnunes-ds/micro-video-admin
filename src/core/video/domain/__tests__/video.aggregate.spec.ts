import { Video, VideoId } from '../video.aggregate';
import { CategoryId } from '@core/category/domain/category.aggregate';
import { GenreId } from '@core/genre/domain/genre.aggregate';
import { CastMemberId } from '@core/cast_member/domain/cast_member.aggregate';
import { Rating } from '../rating.vo';
import { Banner } from '../banner.vo';
import { Thumbnail } from '../thumbnail.vo';
import { ThumbnailHalf } from '../thumbnail_half.vo';
import { Trailer } from '../trailer.vo';
import { VideoMedia } from '../video_media.vo';
import { VideoFakeBuilder } from '../video_fake.builder';
import {EntityId} from "@core/@shared/domain/entity";

class StubVideo {
    static createMapOfIdsFromIdsArray(ids: EntityId[]): Map<string, EntityId> {
        return new Map(ids.map(id => [id.id, id]));
    }
}

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
        Video.prototype.validate = jest.fn().mockImplementation(Video.prototype.validate);
    });

    describe('constructor', () => {
        it('should create a video with default values', () => {
            const builder = VideoFakeBuilder.aVideoWithoutMedias();
            const video = builder.build();

            expect(video.video_id).toBeInstanceOf(VideoId);
            expect(typeof video.title).toBe('string');
            expect(typeof video.description).toBe('string');
            expect(typeof video.year_launched).toBe('number');
            expect(typeof video.duration).toBe('number');
            expect(video.rating).toBeInstanceOf(Rating);
            expect(typeof video.is_opened).toBe('boolean');
            expect(video.is_published).toBe(false);
            expect(video.categories_id.size).toBe(1);
            expect(video.genres_id.size).toBe(1);
            expect(video.cast_members_id.size).toBe(1);
            expect(video.banner).toBeNull();
            expect(video.thumbnail).toBeNull();
            expect(video.thumbnail_half).toBeNull();
            expect(video.trailer).toBeNull();
            expect(video.video).toBeNull();
            expect(video.created_at).toBeInstanceOf(Date);
        });

        it('should create a video with provided values', () => {
            const videoId = new VideoId();
            const created_at = new Date();
            const banner = new Banner({ name: 'banner', location: 'loc' });
            const thumbnail = new Thumbnail({ name: 'thumb', location: 'loc' });
            const thumbnail_half = new ThumbnailHalf({ name: 'thumb_half', location: 'loc' });
            const trailer = Trailer.create({ name: 'trailer', raw_location: 'loc' });
            const videoMedia = VideoMedia.create({ name: 'video', raw_location: 'loc' });

            const builder = VideoFakeBuilder.aVideoWithMedias()
                .withVideoId(videoId)
                .withTitle('title')
                .withDescription('description')
                .withYearLaunched(2020)
                .withDuration(90)
                .withRating(rating)
                .withOpened(true)
                .withBanner(banner)
                .withThumbnail(thumbnail)
                .withThumbnailHalf(thumbnail_half)
                .withTrailer(trailer)
                .withVideo(videoMedia)
                .withCreatedAt(created_at)
                .addCategoryId(categoryId)
                .addGenreId(genreId)
                .addCastMemberId(castMemberId);

            const video = builder.build();

            expect(video.video_id).toBe(videoId);
            expect(video.title).toBe('title');
            expect(video.description).toBe('description');
            expect(video.year_launched).toBe(2020);
            expect(video.duration).toBe(90);
            expect(video.rating).toBe(rating);
            expect(video.is_opened).toBe(true);
            expect(video.is_published).toBe(false);
            expect(video.banner).toBe(banner);
            expect(video.thumbnail).toBe(thumbnail);
            expect(video.thumbnail_half).toBe(thumbnail_half);
            expect(video.trailer).toBe(trailer);
            expect(video.video).toBe(videoMedia);
            expect(video.categories_id.get(categoryId.id)).toBe(categoryId);
            expect(video.genres_id.get(genreId.id)).toBe(genreId);
            expect(video.cast_members_id.get(castMemberId.id)).toBe(castMemberId);
            expect(video.created_at).toBe(created_at);
        });
    });

    describe('create static method', () => {
        it('should create a video', () => {
            const builder = VideoFakeBuilder.aVideoWithoutMedias()
                .withTitle('title')
                .withDescription('description')
                .withYearLaunched(2020)
                .withDuration(90)
                .withRating(rating)
                .withOpened(true)
                .addCategoryId(categoryId)
                .addGenreId(genreId)
                .addCastMemberId(castMemberId);

            const video = Video.create({
                title: builder.title,
                description: builder.description,
                year_launched: builder.year_launched,
                duration: builder.duration,
                rating: builder.rating,
                is_opened: builder.opened,
                categories_id: builder.categories_id,
                genres_id: builder.genres_id,
                cast_members_id: builder.cast_members_id,
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
            video = VideoFakeBuilder.aVideoWithoutMedias()
                .withTitle('title')
                .withDescription('description')
                .withYearLaunched(2020)
                .withDuration(90)
                .withRating(rating)
                .withOpened(true)
                .addCategoryId(categoryId)
                .addGenreId(genreId)
                .addCastMemberId(castMemberId)
                .build();
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

        it('should replace banner', () => {
            const banner = new Banner({ name: 'banner', location: 'loc' });
            video.replaceBanner(banner);
            expect(video.banner).toBe(banner);
        });

        it('should replace thumbnail', () => {
            const thumbnail = new Thumbnail({ name: 'thumb', location: 'loc' });
            video.replaceThumbnail(thumbnail);
            expect(video.thumbnail).toBe(thumbnail);
        });

        it('should replace thumbnail half', () => {
            const thumbnailHalf = new ThumbnailHalf({ name: 'thumb_half', location: 'loc' });
            video.replaceThumbnailHalf(thumbnailHalf);
            expect(video.thumbnail_half).toBe(thumbnailHalf);
        });

        it('should replace trailer and mark as published if completed', () => {
            let trailer = Trailer.create({ name: 'trailer', raw_location: 'loc' });
            video.replaceTrailer(trailer);
            expect(video.trailer).toBe(trailer);
            expect(video.is_published).toBe(false);

            const videoMedia = VideoMedia.create({ name: 'video', raw_location: 'loc' }).complete('loc_encoded');
            trailer = trailer.complete('loc_encoded');
            
            video.replaceVideo(videoMedia);
            video.replaceTrailer(trailer);
            expect(video.trailer).toBe(trailer);
            expect(video.is_published).toBe(true);
        });

        it('should replace video and mark as published if completed', () => {
            let videoMedia = VideoMedia.create({ name: 'video', raw_location: 'loc' });
            video.replaceVideo(videoMedia);
            expect(video.video).toBe(videoMedia);
            expect(video.is_published).toBe(false);

            const trailer = Trailer.create({ name: 'trailer', raw_location: 'loc' }).complete('loc_encoded');
            videoMedia = videoMedia.complete('loc_encoded');
            
            video.replaceTrailer(trailer);
            video.replaceVideo(videoMedia);
            expect(video.video).toBe(videoMedia);
            expect(video.is_published).toBe(true);
        });
    });

    describe('categories management', () => {
        beforeEach(() => {
            video = VideoFakeBuilder.aVideoWithoutMedias()
                .withTitle('title')
                .withDescription('description')
                .withYearLaunched(2020)
                .withDuration(90)
                .withRating(rating)
                .withOpened(true)
                .addCategoryId(categoryId)
                .addGenreId(genreId)
                .addCastMemberId(castMemberId)
                .build();
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
            video = VideoFakeBuilder.aVideoWithoutMedias()
                .withTitle('title')
                .withDescription('description')
                .withYearLaunched(2020)
                .withDuration(90)
                .withRating(rating)
                .withOpened(true)
                .addCategoryId(categoryId)
                .addGenreId(genreId)
                .addCastMemberId(castMemberId)
                .build();
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
            video = VideoFakeBuilder.aVideoWithoutMedias()
                .withTitle('title')
                .withDescription('description')
                .withYearLaunched(2020)
                .withDuration(90)
                .withRating(rating)
                .withOpened(true)
                .addCategoryId(categoryId)
                .addGenreId(genreId)
                .addCastMemberId(castMemberId)
                .build();
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
            video = VideoFakeBuilder.aVideoWithoutMedias()
                .withVideoId(videoId)
                .build();

            expect(video.entity_id).toBe(videoId);
        });
    });

    describe('toJSON', () => {
        it('should convert video to JSON format', () => {
            const videoId = new VideoId();
            const created_at = new Date();
            const banner = new Banner({ name: 'banner', location: 'loc' });
            
            const trailer = Trailer.create({ name: 'trailer', raw_location: 'loc' });
            const videoMedia = VideoMedia.create({ name: 'video', raw_location: 'loc' });
            
            video = VideoFakeBuilder.aVideoWithoutMedias()
                .withVideoId(videoId)
                .withTitle('title')
                .withDescription('description')
                .withYearLaunched(2020)
                .withDuration(90)
                .withRating(rating)
                .withOpened(true)
                .withBanner(banner)
                .withTrailer(trailer)
                .withVideo(videoMedia)
                .addCategoryId(categoryId)
                .addGenreId(genreId)
                .addCastMemberId(castMemberId)
                .withCreatedAt(created_at)
                .build();

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
                trailer: trailer.toJSON(),
                video: videoMedia.toJSON(),
                categories_id: [categoryId.id],
                genres_id: [genreId.id],
                cast_members_id: [castMemberId.id],
                created_at,
            });
        });
    });

    describe('create command', () => {
        it('should create a video and no publish video media', () => {
            const categories_id = [new CategoryId()];
            const genres_id = [new GenreId()];
            const cast_members_id = [new CastMemberId()];

            const spyOnVideoCreated = jest.spyOn(Video.prototype, 'onVideoCreated');
            const tryMarkAsPublished = jest.spyOn(
              Video.prototype as any,
              'tryMarkAsPublished'
            );
            const video = Video.create({
                title: 'test title',
                description: 'test description',
                year_launched: 2020,
                duration: 90,
                rating: Rating.createRL(),
                is_opened: true,
                categories_id,
                genres_id,
                cast_members_id
            });

            expect(video.video_id).toBeInstanceOf(VideoId);
            expect(video.title).toBe('test title');
            expect(video.description).toBe('test description');
            expect(video.year_launched).toBe(2020);
            expect(video.duration).toBe(90);
            expect(video.rating).toBeInstanceOf(Rating);
            expect(video.is_opened).toBe(true);
            expect(video.is_published).toBe(false);
            expect(video.banner).toBeNull();
            expect(video.thumbnail).toBeNull();
            expect(video.thumbnail_half).toBeNull();
            expect(video.trailer).toBeNull();
            expect(video.video).toBeNull();
            expect(video.categories_id).toEqual(StubVideo.createMapOfIdsFromIdsArray(categories_id));
            expect(video.genres_id).toEqual(StubVideo.createMapOfIdsFromIdsArray(genres_id));
            expect(video.cast_members_id).toEqual(StubVideo.createMapOfIdsFromIdsArray(cast_members_id));
            expect(spyOnVideoCreated).toHaveBeenCalledTimes(1);
            expect(tryMarkAsPublished).toHaveBeenCalledTimes(1);
        });

        it('should create a video and publish video media', () => {
            const categories_id = [new CategoryId()];
            const genres_id = [new GenreId()];
            const cast_members_id = [new CastMemberId()];

            const spyOnVideoCreated = jest.spyOn(Video.prototype, 'onVideoCreated');
            const tryMarkAsPublished = jest.spyOn(
              Video.prototype as any,
              'tryMarkAsPublished'
            );

            const trailer = Trailer.create({
                name: 'test name trailer',
                raw_location: 'test raw_location trailer'
            }).complete('test encoded_location trailer');

            const videoMedia = VideoMedia.create({
                name: 'test name video',
                raw_location: 'test raw_location video'
            }).complete('test encoded_location video');


            const video = Video.create({
                title: 'test title',
                description: 'test description',
                year_launched: 2020,
                duration: 90,
                rating: Rating.createRL(),
                is_opened: true,
                categories_id,
                genres_id,
                cast_members_id,
                trailer,
                video: videoMedia
            });

            expect(video.video_id).toBeInstanceOf(VideoId);
            expect(video.title).toBe('test title');
            expect(video.description).toBe('test description');
            expect(video.year_launched).toBe(2020);
            expect(video.duration).toBe(90);
            expect(video.rating).toBeInstanceOf(Rating);
            expect(video.is_opened).toBe(true);
            expect(video.is_published).toBe(true);
            expect(video.banner).toBeNull();
            expect(video.thumbnail).toBeNull();
            expect(video.thumbnail_half).toBeNull();
            expect(video.trailer).toEqual(trailer);
            expect(video.video).toEqual(videoMedia);
            expect(video.categories_id).toEqual(StubVideo.createMapOfIdsFromIdsArray(categories_id));
            expect(video.genres_id).toEqual(StubVideo.createMapOfIdsFromIdsArray(genres_id));
            expect(video.cast_members_id).toEqual(StubVideo.createMapOfIdsFromIdsArray(cast_members_id));
            expect(spyOnVideoCreated).toHaveBeenCalledTimes(1);
            expect(tryMarkAsPublished).toHaveBeenCalledTimes(1);
        });
    });
});
