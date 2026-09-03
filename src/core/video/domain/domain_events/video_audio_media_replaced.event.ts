import {IDomainEvent} from "@core/@shared/domain/events/domain_event.interface";
import {VideoId} from "@core/video/domain/video.aggregate";
import {Trailer} from "@core/video/domain/trailer.vo";
import {VideoMedia} from "@core/video/domain/video_media.vo";

type MediaTypeProps = {
	media: Trailer;
	media_type: 'trailer';
} | {
	media: VideoMedia;
	media_type: 'video';
}

type VideoAudioMediaReplacedProps = {aggregate_id: VideoId} & MediaTypeProps;

export class VideoAudioMediaReplacedEvent implements IDomainEvent {
	aggregate_id: VideoId;
	occurred_on: Date;
	event_version: number;

	readonly media: Trailer | VideoMedia;
	readonly media_type:  'trailer' | 'video';

	constructor(props: VideoAudioMediaReplacedProps) {
		this.aggregate_id = props.aggregate_id;
		this.occurred_on = new Date();
		this.event_version = 1;
		this.media = props.media;
		this.media_type = props.media_type;
	}
}