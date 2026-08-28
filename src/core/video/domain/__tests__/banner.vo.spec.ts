import {VideoId} from "@core/video/domain/video.aggregate";
import {Banner} from "@core/video/domain/banner.vo";
import {
	InvalidMediaFileMimeTypeError,
	InvalidMediaFileSizeError
} from "@core/@shared/domain/validators/media_file.validator";

describe('Banner Unit Tests', () => {
	it('should create a Banner object from a valid file', () => {
		const data = Buffer.alloc(1024);
		const videoId = new VideoId();
		const [banner, error] = Banner.createFromFile({
			raw_name: 'test.png',
			mime_type: 'image/png',
			size: data.length,
			video_id: videoId,
		}).asArray();

		expect(error).toBe(null);
		expect(banner).toBeInstanceOf(Banner);
		expect(banner.name).toMatch(/\.png$/);
		expect(banner.location).toBe(`videos/${videoId}/images`);
	});

	it('should throw an error when the file size is too large', () => {
		const data = Buffer.alloc(Banner.max_size + 1);
		const videoId = new VideoId();
		const [banner, error] = Banner.createFromFile({
			raw_name: 'test.png',
			mime_type: 'image/png',
			size: data.length,
			video_id: videoId
		});

		expect(banner).toBeNull();
		expect(error).toBeInstanceOf(InvalidMediaFileSizeError);
	});

	it('should throw an error when the mime type is not valid', () => {
		const data = Buffer.alloc(1024);
		const videoId = new VideoId();
		const [banner, error] = Banner.createFromFile({
			raw_name: 'test.png',
			mime_type: 'batatinha',
			size: data.length,
			video_id: videoId
		});

		expect(banner).toBeNull();
		expect(error).toBeInstanceOf(InvalidMediaFileMimeTypeError);
	});
});