import {IsBoolean, IsNotEmpty, IsOptional, IsString, validateSync} from "class-validator";

export type UpdateCategoryInputConstructorProps = {
	id: string;
	name?: string;
	description?: string;
	is_active?: boolean;
}

export class UpdateCategoryInput {
	@IsString()
	@IsNotEmpty()
	id: string;

	@IsString()
	@IsOptional()
	name?: string;

	@IsString()
	@IsOptional()
	description?: string;

	@IsBoolean()
	@IsOptional()
	is_active?: boolean;

	constructor(props: UpdateCategoryInputConstructorProps) {
		if (!props) return;
		this.id = props.id;
		this.name = props.name;
		this.description = props.description;
		if (props.is_active !== null && props.is_active !== undefined) {
			this.is_active = props.is_active;
		}
	}
}

export class ValidateUpdateCategoryInput {
	static validate(input: UpdateCategoryInput) {
		return validateSync(input);
	}
}