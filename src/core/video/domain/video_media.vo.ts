import {AudioVideoMedia, AudioVideoMediaStatus} from "@core/@shared/domain/value_objects/audio_video_media.vo";
import {MediaFileValidator} from "@core/@shared/domain/validators/media_file.validator";
import {Either} from "@core/@shared/domain/either";
import {VideoId} from "@core/video/domain/video.aggregate";

export type CreateVideoMediaProps = {
	name: string;
	raw_location: string;
};

export type CreateFromFileProps = {
	raw_name: string;
	mime_type: string;
	size: number;
	video_id: VideoId;
};

export class VideoMedia extends AudioVideoMedia {
	declare readonly __brand: 'video_media';
	static max_size = 1024 * 1024 * 1024 * 50; // 50GB
	static mime_types = ['image/jpeg', 'image/png', 'image/gif'];

	static createFromFile({raw_name, mime_type, size, video_id}: CreateFromFileProps) {
		const mediaFileValidator = new MediaFileValidator(
			VideoMedia.max_size,
			VideoMedia.mime_types
		);

		return Either.safe(() => {
			const {name: newName} = mediaFileValidator.validate({
				raw_name,
				mime_type,
				size
			});

			return VideoMedia.create({
				name: `${video_id.id}-${newName}`,
				raw_location: `videos/${video_id.id}/videos`
			});
		});

	}

	static create({name, raw_location}: CreateVideoMediaProps) {
		return new VideoMedia({
			name,
			raw_location,
			status: AudioVideoMediaStatus.PENDING,
		});
	}

	proccess() {
		return new VideoMedia({
			name: this.name,
			raw_location: this.raw_location,
			encoded_location: this.encoded_location ?? undefined,
			status: AudioVideoMediaStatus.PROCESSING
		});
	}

	complete(encoded_location: string) {
		return new VideoMedia({
			name: this.name,
			raw_location: this.raw_location,
			encoded_location,
			status: AudioVideoMediaStatus.COMPLETED
		});
	}

	fail() {
		return new VideoMedia({
			name: this.name,
			raw_location: this.raw_location,
			encoded_location: this.encoded_location ?? undefined,
			status:AudioVideoMediaStatus.FAILED
		});
	}
}