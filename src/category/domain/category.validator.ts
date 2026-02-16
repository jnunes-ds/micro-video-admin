import {IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength} from "class-validator";
import {Category} from "@/category/domain/category.entity";
import {ClassValidatorFields} from "@/@shared/domain/validators/class_validator_fields";

export class CategoryRules {
	@MaxLength(255)
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString()
	@IsOptional()
	description: string | null;

	@IsBoolean()
	@IsOptional()
	is_active: boolean;

	constructor({name, description, is_active}: Category) {
		Object.assign(this, {name, description, is_active})
	}
}

class CategoryValidator extends ClassValidatorFields<CategoryRules>{
	validate(entity: Category) {
		return super.validate(new CategoryRules(entity));
	}
}

export class CategoryValidatorFactory {
	static create() {
		return new CategoryValidator()
	}
}