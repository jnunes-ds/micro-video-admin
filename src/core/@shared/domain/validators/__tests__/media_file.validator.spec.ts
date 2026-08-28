import {
	InvalidMediaFileMimeTypeError,
	InvalidMediaFileSizeError,
	MediaFileValidator
} from "@core/@shared/domain/validators/media_file.validator";

describe('MediaFileValidator Unit Tests', () => {
	const validator = new MediaFileValidator(1024 * 1024, [
		'image/png',
		'image/jpeg'
	]);

	it('should throw an error if the file size is too large', () => {
		const data = Buffer.alloc(1024 * 1024 + 1);
		expect(() =>
			validator.validate({
				raw_name: 'test.png',
				mime_type: 'image/png',
				size: data.length
			})
		).toThrow(
			new InvalidMediaFileSizeError(data.length, validator['max_size'])
		);
	});

	it('should throw an error if the file mime type is not valid', () => {
		const data = Buffer.alloc(1024);
		expect(() =>
			validator.validate({
				raw_name: 'teste.batata',
				mime_type: 'image/batata',
				size: data.length
			})
		).toThrow(
			new InvalidMediaFileMimeTypeError('image/batata', validator['valid_mime_types'])
		);
	});

	it('should return a valid file name', () => {
		const data = Buffer.alloc(1024);
		const {name} = validator.validate({
			raw_name: 'test.png',
			mime_type: 'image/png',
			size: data.length
		});

		expect(name).toMatch(/\.png$/);
		expect(name).toHaveLength(68);
		// sha256 gera 64 characteres + .png = 68
	});
});