import {CastMemberType} from "@core/cast_member/domain/cast-member-type.vo";
import {
	SearchParams,
	SearchParams as DefaultSearchParams,
	SearchParamsConstructorProps
} from "@core/@shared/domain/repository/search_params";
import {SearchResult} from "@core/@shared/domain/repository/search_result";
import {ISearchableRepository} from "@core/@shared/domain/repository/repository_interface";
import {CastMember, CastMemberId} from "@core/cast_member/domain/cast_member.aggregate";

export type CastMemberFilter = {
	name?: string;
	type?: CastMemberType;
}

export class CastMemberRepository extends DefaultSearchParams<CastMemberFilter> {
	private constructor(
		props: SearchParamsConstructorProps<CastMemberFilter> = {}
	) {
		super(props);
	}

	static create(
		props: SearchParamsConstructorProps<CastMemberFilter>
	) {
		return new CastMemberRepository(props);
	}

}

export class CastMemberSearchParams extends SearchParams<CastMemberFilter> {}

export class CastMemberSearchResult extends SearchResult<CastMember> {}

export interface ICastMemberRepository
	extends ISearchableRepository<
		CastMember,
		CastMemberId,
		CastMemberFilter,
		CastMemberSearchParams,
		CastMemberSearchResult
	> {}