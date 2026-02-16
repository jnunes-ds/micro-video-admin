import {FieldsErrors, IValidatorFields} from "@/@shared/domain/validators/validator_fields.interface";
import {validateSync} from "class-validator";

export abstract class ClassValidatorFields<PropsValidated>
	implements IValidatorFields<PropsValidated>
{
	errors: FieldsErrors | null = null;
	validateData: PropsValidated | null = null;

	validate(data: any): boolean {
		const errors = validateSync(data);
		if (errors.length) {
			this.errors = {};
			for (const error of errors) {
				const field = error.property;
				this.errors[field] = Object.values(error.constraints);
			}
		} else {
			this.validateData = data;
		}
		return !errors.length;
	}
}