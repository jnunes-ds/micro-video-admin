import {ImageMedia} from "@core/@shared/domain/value_objects/image_media.vo";
import {MediaFileValidator} from "@core/@shared/domain/validators/media_file.validator";
import {Either} from "@core/@shared/domain/either";
import {VideoId} from "@core/video/domain/video.aggregate";

export type CreateFromFileProps = {
	raw_name: string;
	mime_type: string;
	size: number;
	video_id: VideoId;
};

export class Banner extends ImageMedia {
	static max_size = 1024 * 1024 * 2; // 2MB
	static mime_types = ['image/jpeg', "image/png", 'image/gif'];

	static createFromFile({raw_name, mime_type, size, video_id}: CreateFromFileProps) {
		const mediaFileValidator = new MediaFileValidator(
			Banner.max_size,
			Banner.mime_types
		);

		return Either.safe(() => {
			const {name: newName} = mediaFileValidator.validate({
				raw_name,
				mime_type,
				size
			});

			return new Banner({
				name: newName,
				location: `videos/${video_id.id}/images`
			});
		});

	}
}