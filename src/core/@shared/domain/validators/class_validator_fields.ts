import {validateSync} from "class-validator";
import {IValidatorFields} from "@core/@shared/domain/validators/validator_fields.interface";
import {Notification} from "@core/@shared/domain/validators/notification";

export abstract class ClassValidatorFields implements IValidatorFields {
	validate(notification: Notification, data: any, fields: string[]): boolean {
		const errors = validateSync(data, {
			groups: fields
		});
		if (errors.length) {
			for (const error of errors) {
				const field = error.property;
				Object.values(error.constraints).forEach((message) => {
					notification.addError(message, field)
				});
			}
		}
		return !errors.length;
	}
}