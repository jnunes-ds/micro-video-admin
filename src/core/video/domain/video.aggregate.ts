import {EntityId} from "@core/@shared/domain/entity";
import {CategoryId} from "@core/category/domain/category.aggregate";
import {GenreId} from "@core/genre/domain/genre.aggregate";
import {CastMemberId} from "@core/cast_member/domain/cast_member.aggregate";
import {AggregateRoot} from "@core/@shared/domain/aggregate_root";
import {ValueObject} from "@core/@shared/domain/value_object";
import {Rating} from "@core/video/domain/rating.vo";
import {Banner} from "@core/video/domain/banner.vo";
import {Thumbnail} from "@core/video/domain/thumbnail.vo";
import {ThumbnailHalf} from "@core/video/domain/thumbnail_half.vo";
import {Trailer} from "@core/video/domain/trailer.vo";
import {VideoMedia} from "@core/video/domain/video_media.vo"
import VideoValidatorFactory from "@core/video/domain/video.validator";
import {AudioVideoMediaStatus} from "@core/@shared/domain/value_objects/audio_video_media.vo";
import {VideoCreatedEvent} from "@core/video/domain/domain_events/video_created.event";
import {VideoAudioMediaReplacedEvent} from "@core/video/domain/domain_events/video_audio_media_replaced.event";

export type VideoConstructorProps = {
	video_id?: VideoId;
	title: string;
	description: string;
	year_launched: number;
	duration: number;
	rating: Rating;
	is_opened: boolean;
	is_published: boolean;

	banner?: Banner;
	thumbnail?: Thumbnail;
	thumbnail_half?: ThumbnailHalf;
	trailer?: Trailer;
	video?: VideoMedia;

	categories_id: Map<string, CategoryId>;
	genres_id: Map<string, GenreId>;
	cast_members_id: Map<string, CastMemberId>;
	created_at?: Date;
};

export type VideoCreateCommand = {
	title: string;
	description: string;
	year_launched: number;
	duration: number;
	rating: Rating;
	is_opened: boolean;

	banner?: Banner;
	thumbnail?: Thumbnail;
	thumbnail_half?: ThumbnailHalf;
	trailer?: Trailer;
	video?: VideoMedia;

	categories_id: CategoryId[];
	genres_id: GenreId[];
	cast_members_id: CastMemberId[];
};

export class VideoId extends EntityId {}

export class Video extends AggregateRoot {
	video_id: VideoId;
	title: string;
	description: string;
	year_launched: number;
	duration: number;
	rating: Rating;
	is_opened: boolean;
	is_published: boolean;

	banner: Banner | null;
	thumbnail: Thumbnail | null;
	thumbnail_half: ThumbnailHalf | null;
	trailer: Trailer | null;
	video: VideoMedia | null;

	categories_id: Map<string, CategoryId>;
	genres_id: Map<string, GenreId>;
	cast_members_id: Map<string, CastMemberId>;
	created_at: Date;

	constructor(props: VideoConstructorProps) {
		super();
		this.video_id = props.video_id ?? new VideoId();
		this.title = props.title;
		this.description = props.description;
		this.year_launched = props.year_launched;
		this.duration = props.duration;
		this.rating = props.rating;
		this.is_opened = props.is_opened;
		this.is_published = props.is_published;

		this.banner = props.banner ?? null;
		this.thumbnail = props.thumbnail ?? null;
		this.thumbnail_half = props.thumbnail_half ?? null;
		this.trailer = props.trailer || null;
		this.video = props.video || null;

		this.categories_id = props.categories_id;
		this.genres_id = props.genres_id;
		this.cast_members_id = props.cast_members_id;
		this.created_at = props.created_at ?? new Date();

		this.registerHandler(VideoCreatedEvent.name, this.onVideoCreated.bind(this));
		this.registerHandler(VideoAudioMediaReplacedEvent.name, this.onAudioVideoMediaReplaced.bind(this));
	}

	static create(props: VideoCreateCommand) {
		const video = new Video({
			...props,
			categories_id: Video.createMapOfIdsFromIdsArray(props.categories_id),
			genres_id: Video.createMapOfIdsFromIdsArray(props.genres_id),
			cast_members_id: Video.createMapOfIdsFromIdsArray(props.cast_members_id),
			is_published: false,
		});
		video.validate(['title']);
		video.tryMarkAsPublished();
		video.applyEvent(
			new VideoCreatedEvent({
				video_id: video.video_id,
				title: props.title,
				description: props.description,
				year_launched: props.year_launched,
				duration: props.duration,
				rating: props.rating,
				is_opened: props.is_opened,
				is_published: video.is_published,

				banner: props.banner,
				thumbnail: props.thumbnail,
				thumbnail_half: props.thumbnail_half,
				trailer: props.trailer,
				video: props.video,

				categories_id: props.categories_id,
				genres_id: props.genres_id,
				cast_members_id: props.cast_members_id,
				created_at: video.created_at ?? new Date(),
			})
		);

		return video;
	}

	changeTitle(title: string): void {
		this.title = title;
		this.validate(['title']);
	}

	changeDescription(description: string): void {
		this.description = description;
	}

	changeYearLaunched(yearLaunched: number): void {
		this.year_launched = yearLaunched;
	}

	changeDuration(duration: number): void {
		this.duration = duration;
	}

	changeRating(rating: Rating): void {
		this.rating = rating;
	}

	markAsOpened(): void {
		this.is_opened = true;
	}

	markAsNotOpened(): void {
		this.is_opened = false;
	}

	addCategoryId(categoryId: CategoryId): void {
		this.categories_id.set(categoryId.id, categoryId);
	}

	removeCategoryId(categoryId: CategoryId): void {
		this.categories_id.delete(categoryId.id);
	}

	syncCategoriesId(categoriesId: CategoryId[]): void {
		if (!categoriesId.length) {
			throw new Error('Categories id is empty');
		}
		this.categories_id = Video.createMapOfIdsFromIdsArray(categoriesId);
	}

	addGenreId(genreId: GenreId): void {
		this.genres_id.set(genreId.id, genreId);
	}

	removeGenreId(genreId: GenreId): void {
		this.genres_id.delete(genreId.id);
	}

	syncGentesId(genresId: GenreId[]): void {
		if (!genresId.length) {
			throw new Error('Genres Id is empty');
		}
		this.genres_id = Video.createMapOfIdsFromIdsArray(genresId);
	}

	addCastMemberId(castMemberId: CastMemberId): void {
		this.cast_members_id.set(castMemberId.id, castMemberId);
	}

	removeCastMemberId(castMemberId: CastMemberId): void {
		this.cast_members_id.delete(castMemberId.id);
	}

	syncCastMembersId(castMembersId: CastMemberId[]): void {
		if (!castMembersId.length) {
			throw new Error('Cast Members Id is empty');
		}
		this.cast_members_id = Video.createMapOfIdsFromIdsArray(castMembersId);
	}

	get entity_id(): ValueObject {
		return this.video_id;
	}

	replaceBanner(banner: Banner): void {
		this.banner = banner;
	}

	replaceThumbnail(thumbnail: Thumbnail): void {
		this.thumbnail = thumbnail
	}

	replaceThumbnailHalf(thumbnailHalf: ThumbnailHalf): void {
		this.thumbnail_half = thumbnailHalf;
	}

	replaceTrailer(trailer: Trailer): void {
		this.trailer = trailer;
		this.applyEvent(
			new VideoAudioMediaReplacedEvent({
				aggregate_id: this.video_id,
				media: trailer,
				media_type: 'trailer'
			})
		);
	}

	replaceVideo(video: VideoMedia): void {
		this.video = video;
		this.applyEvent(
			new VideoAudioMediaReplacedEvent({
				aggregate_id: this.video_id,
				media: video,
				media_type: 'video'
			})
		);
	}

	toJSON() {
		return {
			video_id: this.video_id.id,
			title: this.title,
			description: this.description,
			year_launched: this.year_launched,
			duration: this.duration,
			rating: this.rating.value,
			is_opened: this.is_opened,
			is_published: this.is_published,
			banner: this.banner ? this.banner.toJSON() : null,
			thumbnail: this.thumbnail ? this.thumbnail.toJSON() : null,
			thumbnail_half: this.thumbnail_half ? this.thumbnail_half.toJSON() : null,
			trailer: this.trailer ? this.trailer.toJSON() : null,
			video: this.video ? this.video.toJSON() : null,
			categories_id: Video.createArrayOfStringedIdsFromIdsMap(this.categories_id),
			genres_id: Video.createArrayOfStringedIdsFromIdsMap(this.genres_id),
			cast_members_id: Video.createArrayOfStringedIdsFromIdsMap(this.cast_members_id),
			created_at: this.created_at ?? new Date(),
		}
	}

	onVideoCreated(_event: VideoCreatedEvent) {
		if (this.is_published) return;

		this.tryMarkAsPublished();
	}

	onAudioVideoMediaReplaced(_event: VideoAudioMediaReplacedEvent) {
		if (this.is_published) return;

		this.tryMarkAsPublished();
	}

	private tryMarkAsPublished(): void {
		if (
			this.trailer &&
			this.video &&
			this.trailer.status === AudioVideoMediaStatus.COMPLETED &&
			this.video.status === AudioVideoMediaStatus.COMPLETED
		) {
			this.is_published = true;
		}
	}

	validate(fields?: string[]) {
		const validator = VideoValidatorFactory.create();
		return validator.validate(this.notification, this, fields);
	}

	private static createMapOfIdsFromIdsArray(ids: EntityId[]): Map<string, EntityId> {
		return new Map(ids.map(id => [id.id, id]))
	}

	private static createArrayOfStringedIdsFromIdsMap(idsMap: Map<string, EntityId>): string[] {
		return  Array.from(idsMap.values()).map(id => id.id)
	}
}