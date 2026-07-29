import {IsInt, IsNotEmpty, IsOptional, IsString, validateSync} from "class-validator";
import {CastMemberTypes} from "@core/cast_member/domain/cast-member-type.vo";

export type UpdateCastMemberInputConstructorProps = {
	cast_member_id: string;
	name?: string;
	type?: CastMemberTypes;
}

export class UpdateCastMemberInput {
	@IsString()
	@IsNotEmpty()
	cast_member_id: string;

	@IsString()
	@IsOptional()
	name: string;

	@IsInt()
	@IsOptional()
	type?: CastMemberTypes;

	constructor(props: UpdateCastMemberInputConstructorProps) {
		if (!props) return;
		this.cast_member_id = props.cast_member_id;
		if (props.name !== null && props.name !== undefined && props.name !== '') {
			this.name = props.name;
		}
		if (props.type !== null && props.type !== undefined) {
			this.type = props.type;
		}
	}
}

export class ValidateUpdateCategoryInput {
	static validate(input: UpdateCastMemberInput) {
		return validateSync(input);
	}
}