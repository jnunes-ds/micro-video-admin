import {Entity} from "@/@shared/domain/entity";
import {ValueObject} from "@/@shared/domain/value_object";

type SearchResultConstructorProps<A extends Entity> = {
	items: A[];
	total: number;
	current_page: number;
	per_page: number;
}

export class SearchResult<A extends Entity = Entity> extends ValueObject{
	readonly items: A[];
	readonly total: number;
	readonly current_page: number;
	readonly per_page: number;
	readonly last_page: number;

	constructor(props: SearchResultConstructorProps<A>) {
		super();
		this.items = props.items;
		this.total = props.total;
		this.current_page = props.current_page;
		this.per_page = props.per_page;
		this.last_page = Math.ceil(this.total / this.per_page);
	}

	toJSON(forceEntity: boolean = false) {
		return {
			items: forceEntity
				? this.items.map(item => item.toJSON())
				: this.items,
			total: this.total,
			current_page: this.current_page,
			per_page: this.per_page,
			last_page: this.last_page
		}
	}
}