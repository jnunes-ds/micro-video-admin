import {ValueObject} from "@core/@shared/domain/value_object";

export type ImageMediaConstructorProps = {
	name: string;
	location: string;
};

export abstract class ImageMedia extends ValueObject {
	readonly name: string;
	readonly location: string;

	constructor({name, location}: ImageMediaConstructorProps) {
		super();
		this.name = name;
		this.location = location;
	}

	get url(): string {
		return `${this.location}/${this.name}`;
	}

	toJSON() {
		return {
			name: this.name,
			location: this.location,
		};
	}
}