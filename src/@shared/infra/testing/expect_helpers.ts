import {FieldsErrors} from "@/@shared/domain/validators/validator_fields.interface";
import {ClassValidatorFields} from "@/@shared/domain/validators/class_validator_fields";
import {EntityValidationError} from "@/@shared/domain/validators/validation.error";
import {Notification} from "@/@shared/domain/validators/notification";

// type Expected = {
// 	validator: ClassValidatorFields<any>;
// 	data: any;
// } | (() => any);

expect.extend({
	notificationContainsErrorMessages(
		expected: Notification,
		received: Array<string | { [key: string]: string[] }>,
	) {
		const every = received.every((error) => {
			if (typeof error === 'string') {
				return expected.errors.has(error);
			} else {
				return Object.entries(error).every(([field, messages]) => {
					const fieldMessages = expected.errors.get(field) as string[];

					return (
						fieldMessages &&
						fieldMessages.length &&
						fieldMessages.every((message) => messages.includes(message))
					);
				});
			}
		});
		return every
			? { pass: true, message: () => '' }
			: {
				pass: false,
				message: () =>
					`The validation errors not contains ${JSON.stringify(
						received,
					)}. Current: ${JSON.stringify(expected.toJSON())}`,
			};
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