import {IsInt, ValidateNested, validateSync} from "class-validator";
import {CastMemberTypes} from "@core/cast_member/domain/cast-member-type.vo";
import {SortDirection} from "@core/@shared/domain/repository/search_params";
import {SearchInput} from "@core/@shared/application/search_input";

export class ListCastMembersFilter {
	name?: string | null;
	@IsInt()
	type?: CastMemberTypes | null;
}

export class ListCastMembersInput
	implements SearchInput<ListCastMembersFilter>
{
	page?: number;
	per_page?: number;
	sort?: string;
	sort_dir?: SortDirection;
	@ValidateNested()
	filter?: ListCastMembersFilter;
}

export class ValidateListCastMemberInput {
 static validate(input: ListCastMembersInput) {
	 return validateSync(input);
 }
}