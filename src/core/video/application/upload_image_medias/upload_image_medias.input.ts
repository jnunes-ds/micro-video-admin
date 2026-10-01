import {IsIn, IsNotEmpty, IsString, IsUUID, ValidateNested, validateSync} from "class-validator";
import {FileMediaInput} from "@core/video/application/common/file_media.input";

const FIELDS = ['banner', 'thumbnail', 'thumbnail_half'] as const;
export type Fields = typeof FIELDS[number];

export type UploadImageMediasInputConstructorPrps = {
	video_id: string;
	field: Fields;
	file: FileMediaInput;
};

export class UploadImageMediasInput {
	@IsUUID('4')
	@IsString()
	@IsNotEmpty()
	video_id: string;

	@IsIn(FIELDS)
	@IsNotEmpty()
	field: Fields;

	@ValidateNested()
	file: FileMediaInput;

	constructor(props: UploadImageMediasInputConstructorPrps) {
		if (!props) return;

		this.video_id = props.video_id;
		this.field = props.field;
		this.file = props.file;
	}
}

export class ValidateUploadImageMediasInput {
	static validate(input: UploadImageMediasInput) {
		return validateSync(input);
	}
}