import Chance from "chance";
import {Video, VideoId} from "@core/video/domain/video.aggregate";
import {Rating} from "@core/video/domain/rating.vo";
import {Banner} from "@core/video/domain/banner.vo";
import {Thumbnail} from "@core/video/domain/thumbnail.vo";
import {ThumbnailHalf} from "@core/video/domain/thumbnail_half.vo";
import {VideoMedia} from "@core/video/domain/video_media.vo";
import {CategoryId} from "@core/category/domain/category.aggregate";
import {Trailer} from "@core/video/domain/trailer.vo";
import {GenreId} from "@core/genre/domain/genre.aggregate";
import {CastMemberId} from "@core/cast_member/domain/cast_member.aggregate";

type PropOrFactory<T> = T | ((index: number) => T);

export class VideoFakeBuilder<TBuild = any> {
	private _video_id?: PropOrFactory<VideoId> = undefined;
	private _title: PropOrFactory<string> = (_index) => this.chance.word();
	private _description: PropOrFactory<string> = (_index) => this.chance.word();
	private _year_launched: PropOrFactory<number> = (_index) => +this.chance.year();
	private _duration: PropOrFactory<number> = (_index) => this.chance.integer({
		min: 1,
		max: 100
	});
	private _rating: PropOrFactory<Rating> = (_index) => Rating.createRL();
	private _opened: PropOrFactory<boolean> = (_index) => true;
	private _banner?: PropOrFactory<Banner | null> = new Banner({
		name: 'test-name-banner.png',
		location: 'test-path-banner'
	});
	private _thumbnail?: PropOrFactory<Thumbnail | null> = new Thumbnail({
		name: 'test-name-thumbneil.png',
		location: 'test-path-thumbnail'
	});
	private _thumbnail_half?: PropOrFactory<ThumbnailHalf | null> = new ThumbnailHalf({
		name: 'test-name-thumbnail half.png',
		location: 'test-path-thumbnail-half'
	});
	private _trailer?: PropOrFactory<Trailer | null> = Trailer.create({
		name: 'test-name-trailer.mp4',
		raw_location: 'test-path-trailer'
	});
	private _video?: PropOrFactory<VideoMedia | null> = VideoMedia.create({
		name: 'test-name-video.mp4',
		raw_location: 'test-path-video'
	});
	private _categories_id: PropOrFactory<CategoryId>[] = [];
	private _genres_id: PropOrFactory<GenreId>[] = [];
	private _cast_members_id: PropOrFactory<CastMemberId>[] = [];
	private _created_at?: PropOrFactory<Date> = undefined;
	private countObjs;

	static aVideoWithoutMedias() {
		return new VideoFakeBuilder<Video>()
			.withoutBanner()
			.withoutThumbnail()
			.withoutThumbnailHalf()
			.withoutTrailer()
			.withoutVideo()
	}

	static aVideoWithMedias() {
		return new VideoFakeBuilder<Video>();
	}

	static theVideosWithoutMedias(countObjs: number) {
		return new VideoFakeBuilder<Video[]>(countObjs)
			.withoutBanner()
			.withoutThumbnail()
			.withoutThumbnailHalf()
			.withoutTrailer()
			.withoutVideo();
	}

	static theVideosWithAllMedias(countObjs: number) {
		return new VideoFakeBuilder<Video[]>(countObjs);
	}

	private chance: Chance.Chance;

	private constructor(countObj: number = 1) {
		this.countObjs = countObj;
		this.chance = Chance();
	}

	withVideoId(valueOrFactory: PropOrFactory<VideoId>) {
		this._video_id = valueOrFactory;
		return this;
	}

	withTitle(valueOrFactory: PropOrFactory<string>) {
		this._title = valueOrFactory;
		return this;
	}

	withDescription(valueOrFactory: PropOrFactory<string>) {
		this._description = valueOrFactory;
		return this;
	}

	withYearLaunched(valueOrFactory: PropOrFactory<number>) {
		this._year_launched = valueOrFactory;
		return this;
	}

	withDuration(valueOrFactory: PropOrFactory<number>) {
		this._duration = valueOrFactory;
		return this;
	}

	withRating(valueOrFactory: PropOrFactory<Rating>) {
		this._rating = valueOrFactory;
		return this;
	}

	withOpened(valueOrFactory: PropOrFactory<boolean>) {
		this._opened = valueOrFactory;
		return this;
	}

	withBanner(valueOrFactory: PropOrFactory<Banner | null>) {
		this._banner = valueOrFactory;
		return this;
	}

	withoutBanner() {
		this._banner = null;
		return this;
	}

	withThumbnail(valueOrFactory: PropOrFactory<Thumbnail | null>) {
		this._thumbnail = valueOrFactory;
		return this;
	}

	withoutThumbnail() {
		this._thumbnail = null;
		return this;
	}

	withThumbnailHalf(valueOrFactory: PropOrFactory<ThumbnailHalf | null>) {
		this._thumbnail_half = valueOrFactory;
		return this;
	}

	withoutThumbnailHalf() {
		this._thumbnail_half = null;
		return this;
	}

	withTrailer(valueOrFactory: PropOrFactory<Trailer | null>) {
		this._trailer = valueOrFactory;
		return this;
	}

	withoutTrailer() {
		this._trailer = null;
		return this;
	}

	withVideo(valueOrFactory: PropOrFactory<VideoMedia | null>) {
		this._video = valueOrFactory;
		return this;
	}

	withoutVideo() {
		this._video = null;
		return this;
	}

	addCategoryId(valueOrFactory: PropOrFactory<CategoryId>) {
		this._categories_id.push(valueOrFactory);
		return this;
	}

	addGenreId(valueOrFactory: PropOrFactory<GenreId>) {
		this._genres_id.push(valueOrFactory);
		return this;
	}

	addCastMemberId(valueOrFactory: PropOrFactory<CastMemberId>) {
		this._cast_members_id.push(valueOrFactory);
		return this;
	}

	withCreatedAt(valueOrFactory: PropOrFactory<Date>) {
		this._created_at = valueOrFactory;
		return this;
	}

	get video_id() {
		return this.getValue('video_id');
	}

	get title() {
		return this.getValue('title');
	}

	get description() {
		return this.getValue('description');
	}

	get year_launched() {
		return this.getValue('year_launched');
	}

	get duration() {
		return this.getValue('duration');
	}

	get rating() {
		const rating = this.getValue('rating');
		return (
			rating ??
				Rating.createRL()
		);
	}

	get opened() {
		return this.getValue('opened');
	}

	get banner() {
		const banner = this.getValue('banner');
		return (
			banner ??
				new Banner({
					name: 'test-name-banner.mp4',
					location: 'test-path-banner'
				})
		);
	}

	get thumbnail() {
		const thumbnail = this.getValue('thumbnail');
		return (
			thumbnail ??
			new Thumbnail({
				name: 'test-name-thumbnail.mp4',
				location: 'test-path-thumbnail'
			})
		);
	}

	get thumbnail_half() {
		const thumbnail_half = this.getValue('thumbnail_half');
		return (
			thumbnail_half ??
				new ThumbnailHalf({
					name: 'test-name-thumbnail-half.mp4',
					location: 'test-path-thumbnail-half'
				})
		);
	}

	get trailer() {
		const trailer =  this.getValue('trailer');
		return (
			trailer ??
				Trailer.create({
					name: 'test-name-trailer.mp4',
					raw_location: 'test-path-trailer'
				})
		);
	}

	get video() {
		const video = this.getValue('video');
		return (
			video ??
				VideoMedia.create({
					name: 'test-name-video.mp4',
					raw_location: 'test-path-video'
				})
		);
	}

	get categories_id(): CategoryId[] {
		let categories_id = this.getValue('categories_id');
		if (!categories_id.length) {
			categories_id = [new CategoryId()];
		}
		return categories_id;
	}

	get genres_id(): GenreId[] {
		let genres_id = this.getValue('genres_id');
		if (!genres_id.length) {
			genres_id = [new GenreId()];
		}
		return genres_id;
	}

	get cast_members_id(): CastMemberId[] {
		let cast_members_id = this.getValue('cast_members_id');
		if (!cast_members_id.length) {
			cast_members_id = [new CastMemberId()];
		}
		return cast_members_id;
	}

	get created_at() {
		return this.getValue('created_at');
	}

	build(): TBuild {
		const videos = new Array(this.countObjs)
			.fill(undefined)
			.map((_, index) => {
				const categoriesId = this._categories_id.length
					? this.callFactory(this._categories_id, index)
					: [new CategoryId()];
				const genresId = this._genres_id.length
					? this.callFactory(this._genres_id, index)
					: [new GenreId()];
				const castMembersId = this._cast_members_id.length
					? this.callFactory(this._cast_members_id, index)
					: [new CastMemberId()];

				return new Video({
					video_id: !this._video_id ? undefined : this.callFactory(this._video_id, index),
					title: this.callFactory(this._title, index),
					description: this.callFactory(this._description, index),
					year_launched: this.callFactory(this._year_launched, index),
					duration: this.callFactory(this._duration, index),
					rating: this.callFactory(this._rating, index),
					is_opened: this.callFactory(this._opened, index),
					is_published: false,
					banner: this.callFactory(this._banner, index),
					thumbnail: this.callFactory(this._thumbnail, index),
					thumbnail_half: this.callFactory(this._thumbnail_half, index),
					trailer: this.callFactory(this._trailer, index),
					video: this.callFactory(this._video, index),
					categories_id: new Map(categoriesId.map((id: CategoryId) => [id.id, id])),
					genres_id: new Map(genresId.map((id: GenreId) => [id.id, id])),
					cast_members_id: new Map(castMembersId.map((id: CastMemberId) => [id.id, id])),
					...(this._created_at && {
						created_at: this.callFactory(this._created_at, index),
					}),
				});
			});
		
		return this.countObjs === 1 ? (videos[0] as any) : (videos as any);
	}

	private getValue(prop: any) {
		const optional = ['video_id', 'created_at'];
		const privateProp = `_${prop}` as keyof this;
		if (!this[privateProp] && optional.includes(prop)) {
			throw new Error(`Property ${prop} not have a factory, use 'with' methods`);
		}
		return this.callFactory(this[privateProp], 0);
	}

	private callFactory(factoryOrValue: PropOrFactory<any>, index: number): any {
		if (Array.isArray(factoryOrValue)) {
			return factoryOrValue.map((factory) => this.callFactory(factory, index));
		}

		return typeof factoryOrValue === 'function'
			? factoryOrValue(index)
			: factoryOrValue;
	}
}