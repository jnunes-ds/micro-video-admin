import {OmitType} from "@nestjs/mapped-types";
import {UpdateCategoryInput} from "@core/category/application/usecases/update_category/update_category.input";
import {
	UpdateCastMemberInput
} from "@core/cast_member/application/usecases/update_cast_member/update_cast_member.input";

export class UpdateCastMemberInputWithoutId extends OmitType(UpdateCastMemberInput, ['cast_member_id']) {}

export class UpdateCastmemberDto extends UpdateCastMemberInputWithoutId {}