import {AudioVideoMedia, AudioVideoMediaStatus} from "@core/@shared/domain/value_objects/audio_video_media.vo";
import {MediaFileValidator} from "@core/@shared/domain/validators/media_file.validator";
import {Either} from "@core/@shared/domain/either";
import {VideoId} from "@core/video/domain/video.aggregate";

export type CreateTrailerProps = {
	name: string;
	raw_location: string;
};

export type CreateFromFileProps = {
	raw_name: string;
	mime_type: string;
	size: number;
	video_id: VideoId;
};

export class Trailer extends AudioVideoMedia {
	declare readonly __brand: 'trailer';
	static max_size = 1024 * 1024 * 500; // 500MB
	static mime_types = ['image/jpeg', 'image/png', 'image/gif'];

	static createFromFile({raw_name, mime_type, size, video_id}: CreateFromFileProps) {
		const mediaFileValidator = new MediaFileValidator(
			Trailer.max_size,
			Trailer.mime_types
		);

		return Either.safe(() => {
			const {name: newName} = mediaFileValidator.validate({
				raw_name,
				mime_type,
				size
			});

			return Trailer.create({
				name: `${video_id.id}-${newName}`,
				raw_location: `videos/${video_id.id}/videos`
			});
		});

	}

	static create({name, raw_location}: CreateTrailerProps) {
		return new Trailer({
			name,
			raw_location,
			status: AudioVideoMediaStatus.PENDING,
		});
	}

	proccess() {
		return new Trailer({
			name: this.name,
			raw_location: this.raw_location,
			encoded_location: this.encoded_location ?? undefined,
			status: AudioVideoMediaStatus.PROCESSING
		});
	}

	complete(encoded_location: string) {
		return new Trailer({
			name: this.name,
			raw_location: this.raw_location,
			encoded_location,
			status: AudioVideoMediaStatus.COMPLETED
		});
	}

	fail() {
		return new Trailer({
			name: this.name,
			raw_location: this.raw_location,
			encoded_location: this.encoded_location ?? undefined,
			status:AudioVideoMediaStatus.FAILED
		});
	}
}