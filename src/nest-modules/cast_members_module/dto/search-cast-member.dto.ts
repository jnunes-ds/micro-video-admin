import {ListCastMembersInput} from "@core/cast_member/application/usecases/list_cast_members/list_cast_members.input";
import {CastMemberTypes} from "@core/cast_member/domain/cast-member-type.vo";

export class SearchCastMembersDto implements ListCastMembersInput {
	page?: number;
	per_page?: number;
	sort?: string;
	sort_dir?: 'asc' | 'desc';
	filter?: {
		name?: string;
		type?: CastMemberTypes;
	};
}