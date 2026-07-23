import { validateSync } from "class-validator";
import {Notification} from "@core/@shared/domain/validators/notification";
import {IValidatorFields} from "@core/@shared/domain/validators/validator_fields.interface";

export abstract class ClassValidatorFields<PropsValidated>
	implements IValidatorFields
{
	validate(notification: Notification, data: any, fields: string[]): boolean {
		const errors = validateSync(data, {
			groups: fields
		});
		if (errors.length) {
			for (const error of errors) {
				const field = error.property;
				Object.values(error.constraints).forEach((message) => {
					notification.addError(message, field);
				});
			}
		}
		return !errors.length;
	}
}

export default ClassValidatorFields;