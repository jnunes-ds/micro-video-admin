import {CategoryOutput} from "@core/category/application/usecases/common/category_output";
import {Transform} from "class-transformer";
import {
	ListCategoriesOutput
} from "@core/category/application/usecases/list_categories/list_categories.usecase";
import {CollectionPresenter} from "@/shared/collection.presenter";

type CategoryCollectionPresenterParams = Omit<ListCategoriesOutput, 'last_page' | 'total'>;

export class CategoryPresenter {
	id: string;
	name: string;
	description: string | null;
	is_active: boolean;
	@Transform(({value}: {value: Date}) => value.toISOString())
	created_at: Date;

	constructor(output: CategoryOutput) {
		this.id = output.id;
		this.name = output.name;
		this.description = output.description;
		this.is_active = output.is_active;
		this.created_at = output.created_at;
	}
}

export class CategoryCollectionPresenter extends CollectionPresenter {
	data: CategoryPresenter[];

	constructor(output: CategoryCollectionPresenterParams) {
		const {items, ...paginationProps} = output;
		super({
			...paginationProps,
			last_page: Math.ceil(items.length / paginationProps.per_page),
			total: items.length,
		});
		this.data = items.map(item => new CategoryPresenter(item));
	}
}