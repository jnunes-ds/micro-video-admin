import {FieldsErrors} from "@/@shared/domain/validators/validator_fields.interface";
import {ClassValidatorFields} from "@/@shared/domain/validators/class_validator_fields";
import {EntityValidationError} from "@/@shared/domain/validators/validation.error";

type Expected = {
	validator: ClassValidatorFields<any>;
	data: any;
} | (() => any);

expect.extend({
	containsErrorMessages(expected: Expected, received: FieldsErrors) {
		if (typeof expected === 'function') {
			try {
				expected();
				return isValid();
			} catch (e) {
				const error = e as EntityValidationError;
				return assertContainsErrorsMessages(error.error, received);
			}
		} else {
			const {validator, data} = expected;
			const validated = validator.validate(data);

			if (validated) {
				return isValid();
			}

			return assertContainsErrorsMessages(validator.errors, received);
		}
	},
});

function isValid() {
	return { pass: true, message: () => "" };
}

function assertContainsErrorsMessages(
	expected: FieldsErrors,
	received: FieldsErrors
) {
	const isMatch = expect.objectContaining(received).asymmetricMatch(expected);

	return isMatch
		? { pass: true, message: () => "" }
		: {
			pass: false,
			message: () =>
				`The validation errors not contains ${JSON.stringify(
					received
				)}. Current: ${JSON.stringify(expected)}`
		}
}