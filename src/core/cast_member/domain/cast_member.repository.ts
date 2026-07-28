import {
	CastMemberType,
	CastMemberTypes,
	InvalidCastMemberTypeError
} from "@core/cast_member/domain/cast-member-type.vo";
import {
	SearchParams,
	SearchParams as DefaultSearchParams,
	SearchParamsConstructorProps
} from "@core/@shared/domain/repository/search_params";
import {SearchResult} from "@core/@shared/domain/repository/search_result";
import {ISearchableRepository} from "@core/@shared/domain/repository/repository_interface";
import {CastMember, CastMemberId} from "@core/cast_member/domain/cast_member.aggregate";
import {Either} from "@core/@shared/domain/either";
import {SearchValidationError} from "@core/@shared/domain/validators/validation.error";

export type CastMemberFilter = {
	name?: string | null;
	type?: CastMemberType | null;
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

export class CastMemberSearchParams extends SearchParams<CastMemberFilter> {
	private constructor(
		props: SearchParamsConstructorProps<CastMemberFilter> = {}
	) {
		super(props);
	}

	public static create(
		props: Omit<SearchParamsConstructorProps<CastMemberFilter>, 'filter'> & {
			filter?: {
				name?: string | null;
				type?: CastMemberTypes | null;
			}
		} = {}
	) {
		const [type, errorCastMemberType] = Either.of(props.filter?.type)
			.map((type) => type || null)
			.chain<CastMemberType | null, InvalidCastMemberTypeError>((type) =>
				type ? CastMemberType.create(type) : Either.of(null)
			)
			.asArray();

		if (errorCastMemberType) {
			const error = new SearchValidationError([
				{ type: [errorCastMemberType.message] }
			]);
			throw error;
		}

		return new CastMemberSearchParams({
			...props,
			filter: {
				name: props.filter?.name ?? undefined,
				type: type ?? undefined
			}
		});
	}

	get filter(): CastMemberFilter | null {
		return this._filter;
	}

	protected set filter(value: CastMemberFilter | null) {
		const _value =
			!value || (value as unknown) === '' || typeof value !== 'object'
				? null
				: value;

		const filter = {
			...(_value?.name && { name: `${_value.name}` }),
			...(_value?.type && { type: _value.type })
		};

		this._filter = Object.keys(filter).length === 0 ? null : filter;
	}
}

export class CastMemberSearchResult extends SearchResult<CastMember> {}

export interface ICastMemberRepository
	extends ISearchableRepository<
		CastMember,
		CastMemberId,
		CastMemberFilter,
		CastMemberSearchParams,
		CastMemberSearchResult
	> {}