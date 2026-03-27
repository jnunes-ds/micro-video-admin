import {MaxLength} from "class-validator";
import {Category} from "@core/category/domain/category.entity";
import {ClassValidatorFields} from "@core/@shared/domain/validators/class_validator_fields";
import {Notification} from "@core/@shared/domain/validators/notification";

export class CategoryRules {
	@MaxLength(255, { groups: ['name'] })
	name: string;

	constructor(entity: Category) {
		Object.assign(this, entity)
	}
}

class CategoryValidator extends ClassValidatorFields{
	validate(notification: Notification, data: Category, fields?: string[]): boolean {
		const newFields = fields.length ? fields : ['name'];
		return super.validate(notification, new CategoryRules(data), newFields);
	}
}

export class CategoryValidatorFactory {
	static create() {
		return new CategoryValidator()
	}
}
