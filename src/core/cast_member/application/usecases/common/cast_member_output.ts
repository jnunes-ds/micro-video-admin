import {CastMember} from "@core/cast_member/domain/cast_member.aggregate";
import {CastMemberType, CastMemberTypes} from "@core/cast_member/domain/cast-member-type.vo";


export type CastMemberOutput = {
	cast_member_id: string;
	name: string;
	type: CastMemberTypes;
	created_at: Date;
}

CastMember

export class CastMemberOutputMapper {
	static toOutput(entity: CastMember): CastMemberOutput {
		const {cast_member_id, ...otherProps} = entity.toJSON();
		return {
			cast_member_id: entity.cast_member_id.id,
			name: otherProps.name,
			type: otherProps.type,
			created_at: otherProps.created_at
		}
	}
}