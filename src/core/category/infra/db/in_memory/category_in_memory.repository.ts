import {
	CategoryFilter,
	CategorySearchParams,
	CategorySearchResult,
	ICategoryRepository
} from "@core/category/domain/category.repository";
import {InMemorySearchableRepository} from "@core/@shared/infra/db/in_memory/in_memory.repository";
import {Category} from "@core/category/domain/category.entity";
import {Uuid} from "@core/@shared/domain/value_objects/uuid.vo";
import {SortDirection} from "@core/@shared/domain/repository/search_params";


export class CategoryInMemoryRepository
	extends InMemorySearchableRepository<Category, Uuid>
	implements ICategoryRepository
{
	sortableFields: string[] = ['name', 'created_at'];

	protected async applyFilter(
		items: Category[],
		filter: CategoryFilter
	): Promise<Category[]> {
		if (!filter) {
			return items;
		}

		return items.filter((i) => {
			return (
				i.name.toLowerCase().includes(filter.toLowerCase()) ||
				i.toString() === filter
			);
		});
	}

	getEntity(): { new(...args: any[]): Category } {
		return Category;
	}

	protected override applySort(
		items:Category[],
		sort:string | null,
		sort_dir: SortDirection | null,
	): Category[] {
		return sort
			? super.applySort(items, sort, sort_dir)
			: super.applySort(items, 'created_at', 'desc');
	}

	async search(props: CategorySearchParams): Promise<CategorySearchResult> {
		const result = await super.search(props);
		return new CategorySearchResult({
			items: result.items,
			total: result.total,
			current_page: props.page,
			per_page: props.per_page,
		});
	}
}