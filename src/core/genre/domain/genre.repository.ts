import {CategoryId} from "@core/category/domain/category.aggregate";
import {SearchParams, SearchParamsConstructorProps} from "@core/@shared/domain/repository/search_params";


export type GenreFilter = {
	name?: string;
	categories_id?: CategoryId[];
}

export class GenreSearchParams extends SearchParams<GenreFilter> {
	private constructor(props: SearchParamsConstructorProps<GenreFilter>) {
		super(props);
	}

	public static create(
		props: Overwrite<SearchParamsConstructorProps<GenreFilter>, {
			filter?: {
				name?: string;
				categories_id?: CategoryId[] | string[];
			}
		}>
	) {
		const categories_id = props.filter?.categories_id
			?.map(c => c instanceof CategoryId ? c : new CategoryId(c));

		return new GenreSearchParams({
			...props,
			filter: {
				name: props.filter?.name,
				categories_id
			}
		});
	}

	get filter(): GenreFilter | null {
		return this._filter;
	}

	protected set filter(value: GenreFilter | null) {
		const _value =
			!value || (value as unknown) === '' || typeof value !== 'object'
				? null
				: value;

		const filter = {
		...(_value?.name && { name: `${value?.name}` }),
			...(_value?.categories_id &&
				_value.categories_id.length && {
				categories_id: _value.categories_id
			})
		}

		this._filter = Object.keys(filter).length === 0 ? null : filter;
	}
}