import {ImageMedia} from "@core/@shared/domain/value_objects/image_media.vo";
import {VideoId} from "@core/video/domain/video.aggregate";
import {Either} from "@core/@shared/domain/either";
import {
	InvalidMediaFileMimeTypeError,
	InvalidMediaFileSizeError, MediaFileValidator
} from "@core/@shared/domain/validators/media_file.validator";

type CreateFormFileProps = {
	raw_name: string;
	mime_type: string;
	size: number;
	video_id: VideoId;
};

export class ThumbnailHalf extends ImageMedia {
	static max_size = 1024 * 1024 * 2; // 2MB
	static mime_types = ['image/jpeg', 'image/png'];

	static createFromFile({
		raw_name,
		mime_type,
		size,
		video_id
	}: CreateFormFileProps): Either<
		ThumbnailHalf,
		InvalidMediaFileSizeError | InvalidMediaFileMimeTypeError
	> {
		const mediaFileValidator = new MediaFileValidator(
			ThumbnailHalf.max_size,
			ThumbnailHalf.mime_types
		);
		return Either.safe(() => {
			const {name} = mediaFileValidator.validate({
				raw_name,
				size,
				mime_type
			});

			return new ThumbnailHalf({
				name: `${video_id.id}-${name}`,
				location: `videos/${video_id.id}/images`
			});
		});
	}
}