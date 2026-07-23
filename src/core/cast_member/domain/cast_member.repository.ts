import {CastMemberType} from "@core/cast_member/domain/cast-member-type.vo";
import {
	SearchParams as DefaultSearchParams,
	SearchParamsConstructorProps
} from "@core/@shared/domain/repository/search_params";

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