import {FieldsErrors} from "@/@shared/domain/validators/validator_fields.interface";


declare global {
	namespace jest {
		interface Matchers<R> {
			// containsErrorMessages(expected: FieldsErrors): R;
			notificationContainsErrorMessages(
				expect: Array<string | { [key: string]: string[] }>
			): R;
		}
	}
}