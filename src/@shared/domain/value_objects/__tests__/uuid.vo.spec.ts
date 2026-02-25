import {validate as uuidValidate} from 'uuid';
import {InvalidUuidError, Uuid} from "../uuid.vo";
import {jest} from "@jest/globals";

describe('UUID Unit Tests', () => {
	// @ts-expect-errors validate-is-a-private-method
	const validateSpy = jest.spyOn(Uuid.prototype, 'validate');

	it('should throw an errors when uuid is invalid', () => {
		expect(() => {
			new Uuid('invalid-uuid');
		}).toThrowError(new InvalidUuidError());
		expect(validateSpy).toHaveBeenCalledTimes(1);
	});

	it('should create a valid uuid', () => {
		const uuid = new Uuid();
		expect(uuid.id).toBeDefined();
		expect(uuidValidate(uuid.id)).toBeTruthy();
		expect(validateSpy).toHaveBeenCalledTimes(1);
	});

	it('should accept a valid uuid', () => {
		const uuid = new Uuid('37e67ec7-295d-4eb4-a9c5-8a2b7af53cf4');
		expect(uuid.id).toBeDefined();
		expect(validateSpy).toHaveBeenCalledTimes(1);
	});
});