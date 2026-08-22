import {
	CategoryFilter,
	CategorySearchParams,
	CategorySearchResult,
	ICategoryRepository
} from "@core/category/domain/category.repository";
import {InMemorySearchableRepository} from "@core/@shared/infra/db/in_memory/in_memory.repository";
import {Category} from "@core/category/domain/category.aggregate";
import {Uuid} from "@core/@shared/domain/value_objects/uuid.vo";
import {SortDirection} from "@core/@shared/domain/repository/search_params";
import {EntityId} from "@core/@shared/domain/entity";


export class CategoryInMemoryRepository
	extends InMemorySearchableRepository<Category, EntityId>
	implements ICategoryRepository
{
	sortableFields: string[] = ['name', 'created_at'];

	protected async applyFilter(
		items: Category[],
		filter: CategoryFilter | null
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

	async existsById(ids: EntityId[]): Promise<{ exists: EntityId[]; not_exists: EntityId[] }> {
		if (!ids.length) {
			return {
				exists: [],
				not_exists: []
			};
		}
		const existsId = new Set<string>();
		const notExistsId = new Set<string>();

		ids.forEach(id => {
			const item = this.items.find(entity => entity.entity_id.equals(id));
			if (item) {
				existsId.add(id.id);
			} else {
				notExistsId.add(id.id);
			}
		});

		return {
			exists: Array.from(existsId).map(id => new EntityId(id)),
			not_exists: Array.from(notExistsId).map(id => new EntityId(id))
		};
	}

	async findByIds(ids: EntityId[]): Promise<Category[]> {
		return this.items.filter(item => {
			return ids.some(id => item.entity_id.equals(id));
		});
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