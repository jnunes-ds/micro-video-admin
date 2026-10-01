import {IsEnum, IsIn, IsNotEmpty, IsString, IsUUID, validateSync} from "class-validator";
import {AudioVideoMediaStatus} from "@core/@shared/domain/value_objects/audio_video_media.vo";

const FIELDS = ['trailer', 'video'] as const;
export type Fields = typeof FIELDS[number];

export type ProcessAudioVideoMediaInputConstructorProps = {
	video_id: string;
	encoded_location: string;
	field: Fields;
	status: AudioVideoMediaStatus;
};

export class ProcessAudioVideoMediaInput {
	@IsUUID('4')
	@IsString()
	@IsNotEmpty()
	video_id: string;

	@IsString()
	@IsNotEmpty()
	encoded_location: string;

	@IsIn(FIELDS)
	@IsNotEmpty()
	field: Fields;

	@IsEnum(AudioVideoMediaStatus)
	@IsNotEmpty()
	status: AudioVideoMediaStatus;


	constructor(props: ProcessAudioVideoMediaInputConstructorProps) {
		if (!props) return;

		this.video_id = props.video_id;
		this.encoded_location = props.encoded_location;
		this.field = props.field;
		this.status = props.status;
	}
}

export class ValidateProccessAudioVideoMediaInput {
	static validate(input: ProcessAudioVideoMediaInput) {
		return validateSync(input);
	}
}