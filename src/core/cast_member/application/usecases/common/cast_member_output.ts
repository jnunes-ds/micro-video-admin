import {CastMember} from "@core/cast_member/domain/cast_member.aggregate";
import {CastMemberType} from "@core/cast_member/domain/cast-member-type.vo";


export type CastMemberOutput = {
	id: string;
	name: string;
	type: CastMemberType;
	created_at: Date;
}

CastMember

export class CastMemberOutputMapper {
	static toOutput(entity: CastMember): CastMemberOutput {
		const {cast_member_id, ...otherProps} = entity.toJSON();
		return {
			id: entity.cast_member_id.id,
			...otherProps
		}
	}
}