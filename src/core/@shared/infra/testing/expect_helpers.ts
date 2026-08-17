import {Notification} from "@core/@shared/domain/validators/notification";
import {FieldsErrors} from "@core/@shared/domain/validators/validator_fields.interface";
import {ValueObject} from "@core/@shared/domain/value_object";

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
	toBeValueObject(
		expect: ValueObject,
		received: ValueObject,
	) {
		return expect.equals(received)
			? { pass: true, message: () => '' }
			: {
				pass: false,
				message: () =>
					`The values object are not equal. Expected: ${JSON.stringify(
						expect,
					)} | Received: ${JSON.stringify(received)}`
			}
	}
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