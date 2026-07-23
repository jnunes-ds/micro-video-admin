import {IsBoolean, IsNotEmpty, IsOptional, IsString, validateSync} from "class-validator";
import {CastMemberType, CastMemberTypes} from "@core/cast_member/domain/cast-member-type.vo";

export type CreateCastMemberInputConstructorProps = {
	name: string;
	type: CastMemberType;
}
export class CreateCastMemberInput {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsNotEmpty()
	type: CastMemberTypes;

	constructor(props: CreateCastMemberInput) {
		if (!props) return;
		this.name = props.name;
		this.type = props.type;
	}
}

export class ValidateCreateCastMemberInput {
static validate(input: CreateCastMemberInput) {
	return validateSync(input)
	}
}