import {IUseCase} from "@core/@shared/application/usecase.interface";
import {PaginationOutput, PaginationOutputMapper} from "@core/@shared/application/pagination_output";
import {SearchParamsConstructorProps} from "@core/@shared/domain/repository/search_params";
import {
	CastMemberFilter,
	CastMemberSearchParams,
	CastMemberSearchResult,
	ICastMemberRepository
} from "@core/cast_member/domain/cast_member.repository";
import {
	CastMemberOutput,
	CastMemberOutputMapper
} from "@core/cast_member/application/usecases/common/cast_member_output";
import {CastMemberTypes} from "@core/cast_member/domain/cast-member-type.vo";


export class ListCastMembersUsecase
	implements IUseCase<ListCategoriesInput, ListCategoriesOutput> {
	constructor(private readonly repository: ICastMemberRepository) {}

	async execute({filter, ...rest}: ListCategoriesInput): Promise<ListCategoriesOutput> {
		const params = CastMemberSearchParams.create({
			...rest,
			...(filter && { filter: {
					...('name' in filter && {name: filter.name}),
					...('type' in filter && {type: filter.type})
				} }),
		});
		const searchResult = await this.repository.search(params);
		return this.toOutput(searchResult);
	}

	private toOutput(searchResult: CastMemberSearchResult): ListCategoriesOutput {
		const {items: _items} = searchResult;
		const items = _items.map(item => CastMemberOutputMapper.toOutput(item));
		return PaginationOutputMapper.toOutput(items, searchResult);
	}
}

export type ListCategoriesInput = Omit<SearchParamsConstructorProps<CastMemberFilter>, 'filter'> & {
	filter?: {
		name?: string;
		type?: CastMemberTypes;
	};
};

export type ListCategoriesOutput = PaginationOutput<CastMemberOutput>;