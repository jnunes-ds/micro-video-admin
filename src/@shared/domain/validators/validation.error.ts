import {FieldsErrors} from "@/@shared/domain/validators/validator_fields.interface";

export class EntityValidationError extends Error {
	constructor(public error: FieldsErrors, message = "Validation Error") {
		super();
	}

	count() {
		return Object.keys(this.error).length;
	}
}