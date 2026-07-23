import {ValueObject} from "@core/@shared/domain/value_object";

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

	static create(value: CastMemberTypes) {
		return new CastMemberType(value);
	}

	static createAnActor() {
		return CastMemberType.create(CastMemberTypes.ACTOR);
	}

	static createADirector() {
		return CastMemberType.create(CastMemberTypes.DIRECTOR);
	}


	asArray(): [CastMemberType, Error?] {
		try {
			return [this];
		} catch (e) {
			return [null as any, e as Error];
		}

	}

}

export class InvalidCastMemberTypeError extends Error {
	constructor(invalidType: any) {
		super(`Invalid cast member type: ${invalidType}`);
		this.name = 'InvalidCastMemberTypeError';
	}
}