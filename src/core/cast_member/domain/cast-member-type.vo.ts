import {ValueObject} from "@core/@shared/domain/value_object";
import {Either} from "@core/@shared/domain/either";

export enum CastMemberTypes {
	DIRECTOR = 1,
	ACTOR	= 2
}

export class CastMemberType extends ValueObject {
	constructor(readonly type: CastMemberTypes) {
		super();
		this.validate();
	}

	private validate() {
		const isValid =
			this.type == CastMemberTypes.DIRECTOR ||
			this.type == CastMemberTypes.ACTOR;
		if (!isValid) {
			throw new InvalidCastMemberTypeError(this.type);
		}
	}

	static create(
		value: CastMemberTypes
	): Either<CastMemberType, InvalidCastMemberTypeError> {
		return Either.safe(() => new CastMemberType(value));
	}

	static createAnActor() {
		return new CastMemberType(CastMemberTypes.ACTOR);
	}

	static createADirector() {
		return new CastMemberType(CastMemberTypes.DIRECTOR);
	}

}

export class InvalidCastMemberTypeError extends Error {
	constructor(invalidType: any) {
		super(`Invalid cast member type: ${invalidType}`);
		this.name = 'InvalidCastMemberTypeError';
	}
}