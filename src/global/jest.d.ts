import {ValueObject} from "@core/@shared/domain/value_object";

declare global {
	namespace jest {
		interface Matchers<R> {
			// containsErrorMessages(expected: FieldsErrors): R;
			notificationContainsErrorMessages(
				expect: Array<string | { [key: string]: string[] }>
			): R;
			toBeValueObject(
				expect: ValueObject,
			): R;
		}
	}
}