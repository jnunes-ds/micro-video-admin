import {IsIn, IsNotEmpty, IsString, IsUUID, ValidateNested, validateSync} from "class-validator";
import {FileMediaInput} from "@core/video/application/common/file_media.input";

const FIELDS = ['trailer', 'video'] as const;
export type Fields = typeof FIELDS[number];

export type UploadAudioVideoMediaInputConstructorProps = {
	video_id: string;
	field: Fields;
	file: FileMediaInput;
};

export class UploadAudioVideoMediaInput {
	@IsUUID('4')
	@IsString()
	@IsNotEmpty()
	video_id: string;

	@IsIn(FIELDS)
	@IsNotEmpty()
	field: Fields;

	@ValidateNested()
	file: FileMediaInput;

	constructor(props: UploadAudioVideoMediaInputConstructorProps) {
		if (!props) return;

		this.video_id = props.video_id;
		this.field = props.field;
		this.file = props.file;
	}
}

export class ValidateUploadAudioVideoMediaInput {
	static validate(input: UploadAudioVideoMediaInput) {
		return validateSync(input);
	}
}