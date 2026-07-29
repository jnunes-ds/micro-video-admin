import {FieldsErrors} from "@core/@shared/domain/validators/validator_fields.interface";


export class BaseValidationError extends Error {
	constructor(public error: FieldsErrors[], message = "Validation Error") {
		super(message);
	}

	count() {
		return Object.keys(this.error).length;
	}
}

export class EntityValidationError extends BaseValidationError {
	constructor(public error: FieldsErrors[]) {
		super(error, 'Entity Validation Error');
		this.name = 'EntityValidationError';
	}
}

export class LoadEntityError extends BaseValidationError {
	constructor(public error: FieldsErrors[]) {
		super(error, 'Load Entity Error');
		this.name = 'LoadEntityError';
	}
}

export class SearchValidationError extends BaseValidationError {
	constructor(public error: FieldsErrors[]) {
		super(error, 'Search Validation Error');
		this.name = 'SearchValidationError';
	}
}

// crie o InvalidArgumentError
export class InvalidArgumentError extends Error {
	constructor(message = 'Invalid Argument Error') {
		super(message);
		this.name = 'InvalidArgumentError';
	}
}
