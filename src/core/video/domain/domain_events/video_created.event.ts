import {EntityId} from "@core/@shared/domain/entity";
import {CategoryId} from "@core/category/domain/category.aggregate";
import {GenreId} from "@core/genre/domain/genre.aggregate";
import {CastMemberId} from "@core/cast_member/domain/cast_member.aggregate";
import {Rating} from "@core/video/domain/rating.vo";
import {Banner} from "@core/video/domain/banner.vo";
import {Thumbnail} from "@core/video/domain/thumbnail.vo";
import {ThumbnailHalf} from "@core/video/domain/thumbnail_half.vo";
import {Trailer} from "@core/video/domain/trailer.vo";
import {VideoMedia} from "@core/video/domain/video_media.vo";
import {IDomainEvent} from "@core/@shared/domain/events/domain_event.interface";
import {Uuid} from "@core/@shared/domain/value_objects/uuid.vo";

export type VideoConstructorProps = {
	video_id: VideoId;
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

	categories_id: CategoryId[];
	genres_id: GenreId[];
	cast_members_id: CastMemberId[];
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

export class VideoCreatedEvent implements IDomainEvent {
	readonly aggregate_id: Uuid;
	readonly occurred_on: Date;
	readonly event_version: number;

	readonly video_id: VideoId;
	readonly title: string;
	readonly description: string;
	readonly year_launched: number;
	readonly duration: number;
	readonly rating: Rating;
	readonly is_opened: boolean;
	readonly is_published: boolean;

	readonly banner: Banner | null;
	readonly thumbnail: Thumbnail | null;
	readonly thumbnail_half: ThumbnailHalf | null;
	readonly trailer: Trailer | null;
	readonly video: VideoMedia | null;

	readonly categories_id: CategoryId[];
	readonly genres_id: GenreId[];
	readonly cast_members_id: CastMemberId[];
	readonly created_at: Date;

	constructor(props: VideoConstructorProps) {
		this.aggregate_id = this.video_id;
		this.occurred_on = new Date();
		this.event_version = 1;

		this.video_id = props.video_id;
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
	}
}