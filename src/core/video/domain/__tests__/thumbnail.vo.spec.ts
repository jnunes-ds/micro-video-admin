import {Thumbnail} from "@core/video/domain/thumbnail.vo";
import {VideoId} from "@core/video/domain/video.aggregate";
import {
	InvalidMediaFileMimeTypeError,
	InvalidMediaFileSizeError
} from "@core/@shared/domain/validators/media_file.validator";


describe('Thumbnail Unit Tests', () => {
	it('should create a Thumbnail object from a valid file', () => {
		const data = Buffer.alloc(1024);
		const videoId = new VideoId();
		const [thumbnail, error] = Thumbnail.createFromFile({
			raw_name: 'test.png',
			mime_type: 'image/png',
			size: data.length,
			video_id: videoId,
		}).asArray();

		expect(error).toBe(null);
		expect(thumbnail).toBeInstanceOf(Thumbnail);
		expect(thumbnail.name).toMatch(/\.png$/);
		expect(thumbnail.location).toBe(`videos/${videoId}/images`);
	});

	it('should throw an error when the file size is too large', () => {
		const data = Buffer.alloc(Thumbnail.max_size + 1);
		const videoId = new VideoId();
		const [thumbnail, error] = Thumbnail.createFromFile({
			raw_name: 'test.png',
			mime_type: 'image/png',
			size: data.length,
			video_id: videoId
		});

		expect(thumbnail).toBeNull();
		expect(error).toBeInstanceOf(InvalidMediaFileSizeError);
	});

	it('should throw an error when the mime type is not valid', () => {
		const data = Buffer.alloc(1024);
		const videoId = new VideoId();
		const [thumbnail, error] = Thumbnail.createFromFile({
			raw_name: 'test.png',
			mime_type: 'batatinha',
			size: data.length,
			video_id: videoId
		});

		expect(thumbnail).toBeNull();
		expect(error).toBeInstanceOf(InvalidMediaFileMimeTypeError);
	});
});