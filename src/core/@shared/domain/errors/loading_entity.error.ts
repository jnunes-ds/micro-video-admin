import {FieldsErrors} from "@core/@shared/domain/validators/validator_fields.interface";
import {BaseValidationError} from "@core/@shared/domain/validators/validation.error";


export class LoadingEntityError extends BaseValidationError {
	constructor(public error: FieldsErrors[]) {
		super(error, 'Loading Entity Error');
		this.name = 'LoadingEntityError';
	}
}
