import {VideoId} from "@core/video/domain/video.aggregate";
import {
	InvalidMediaFileMimeTypeError,
	InvalidMediaFileSizeError
} from "@core/@shared/domain/validators/media_file.validator";
import {ThumbnailHalf} from "@core/video/domain/thumbnail_half.vo";


describe('Thumbnail Half Unit Tests', () => {
	it('should create a Thumbnail Half object from a valid file', () => {
		const data = Buffer.alloc(1024);
		const videoId = new VideoId();
		const [thumbnail_half, error] = ThumbnailHalf.createFromFile({
			raw_name: 'test.png',
			mime_type: 'image/png',
			size: data.length,
			video_id: videoId,
		}).asArray();

		expect(error).toBe(null);
		expect(thumbnail_half).toBeInstanceOf(ThumbnailHalf);
		expect(thumbnail_half.name).toMatch(/\.png$/);
		expect(thumbnail_half.location).toBe(`videos/${videoId}/images`);
	});

	it('should throw an error when the file size is too large', () => {
		const data = Buffer.alloc(ThumbnailHalf.max_size + 1);
		const videoId = new VideoId();
		const [thumbnail_half, error] = ThumbnailHalf.createFromFile({
			raw_name: 'test.png',
			mime_type: 'image/png',
			size: data.length,
			video_id: videoId
		});

		expect(thumbnail_half).toBeNull();
		expect(error).toBeInstanceOf(InvalidMediaFileSizeError);
	});

	it('should throw an error when the mime type is not valid', () => {
		const data = Buffer.alloc(1024);
		const videoId = new VideoId();
		const [thumbnail_half, error] = ThumbnailHalf.createFromFile({
			raw_name: 'test.png',
			mime_type: 'batatinha',
			size: data.length,
			video_id: videoId
		});

		expect(thumbnail_half).toBeNull();
		expect(error).toBeInstanceOf(InvalidMediaFileMimeTypeError);
	});
});