import {ValueObject} from "@core/@shared/domain/value_object";

export type ImageMediaConstructorProps = {
	name: string;
	raw_location: string; // mp4
	encoded_location?: string; //mpeg-dash
	status: AudioVideoMediaStatus;
};

export enum AudioVideoMediaStatus {
	PENDING = 'pending',
	PROCESSING = 'processing',
	COMPLETED = 'completed',
	FAILED = 'failed'
}

export abstract class AudioVideoMedia extends ValueObject {
	readonly name: string;
	readonly raw_location: string; // mp4
	readonly encoded_location: string | null; //mpeg-dash
	readonly status: AudioVideoMediaStatus;

	constructor(props: ImageMediaConstructorProps) {
		super();
		this.name = props.name;
		this.raw_location = props.raw_location;
		this.encoded_location = props.encoded_location ?? null;
		this.status = props.status;
	}

	get raw_url(): string {
		return `${this.raw_location}/${this.name}`;
	}

	toJSON() {
		return {
			name: this.name,
			raw_location: this.raw_location,
			encoded_location: this.encoded_location,
			status: this.status,
		};
	}
}