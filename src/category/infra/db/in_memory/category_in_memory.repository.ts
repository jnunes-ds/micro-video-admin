import {InMemorySearchableRepository} from "@/@shared/infra/db/in_memory/in_memory.repository";
import {Category} from "@/category/domain/category.entity";
import {Uuid} from "@/@shared/domain/value_objects/uuid.vo";
import {SortDirection} from "@/@shared/domain/repository/search_params";

export class CategoryInMemoryRepository extends InMemorySearchableRepository<
	Category,
	Uuid
> {
	sortableFields: string[] = ['name', 'created_at'];

	protected async applyFilter(items: Category[], filter: string | null): Promise<Category[]> {
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

}