import {IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID, validateSync} from "class-validator";

type UpdateGenreInputConstructorProps = {
	id: string;
	name?: string;
	categories_id?: string[];
	is_active?: boolean;
};

export class UpdateGenreInput {
	@IsString()
	@IsNotEmpty()
	id: string;

	@IsString()
	@IsOptional()
	name?: string;

	@IsUUID('4', { each: true })
	@IsArray()
	@IsOptional()
	categories_id?: string[];

	@IsBoolean()
	@IsOptional()
	is_active?: boolean;

	constructor(props: UpdateGenreInputConstructorProps) {
		if (!props) return;
		this.id = props.id;
		props.name && (this.name = props.name);
		props.categories_id &&
			props.categories_id.length &&
			(this.categories_id = props.categories_id);
		props.is_active !== null &&
			props.is_active !== undefined &&
			(this.is_active = props.is_active);
	}
}

export class ValidateUpdateGenreInput {
	static validate(input: UpdateGenreInput) {
		return validateSync(input);
	}
}
