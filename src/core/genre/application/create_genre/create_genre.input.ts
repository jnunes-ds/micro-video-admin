import {IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID, validateSync} from "class-validator";

export type CreateGenreInputContructorProps = {
	name: string;
	categories_id: string[];
	is_active?: boolean;
};

export class CreateGenreInput {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsUUID('4', { each: true })
	@IsArray()
	@IsNotEmpty()
	categories_id: string[];

	@IsBoolean()
	@IsOptional()
	is_active?: boolean = true;

	constructor(props: CreateGenreInputContructorProps) {
		if (!props) return;
		this.name = props.name;
		this.categories_id = props.categories_id;
		this.is_active = props.is_active;
	}
}

export class ValidateCreateGenreInput {
	static validate(input: CreateGenreInput) {
		return validateSync(input);
	}
}