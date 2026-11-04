import {InMemorySearchableRepository} from "@core/@shared/infra/db/in_memory/in_memory.repository";
import {Uuid} from "@core/@shared/domain/value_objects/uuid.vo";
import {SortDirection} from "@core/@shared/domain/repository/search_params";
import {Genre} from "@core/genre/domain/genre.aggregate";
import {GenreFilter, IGenreRepository} from "@core/genre/domain/genre.repository";
import {EntityId} from "@core/@shared/domain/entity";


export class GenreInMemoryRepository
	extends InMemorySearchableRepository<Genre, Uuid, GenreFilter>
	implements IGenreRepository {
	sortableFields: string[] = ['name', 'created_at'];

	protected async applyFilter(
		items: Genre[],
		filter: GenreFilter | null
	): Promise<Genre[]> {
		if (!filter) {
			return items;
		}

		return items.filter((genre) => {
			const containsName =
				filter.name && genre.name.toLowerCase().includes(filter.name.toLowerCase());
			const containsCategoriesId =
				filter.categories_id &&
				filter.categories_id.some(c => genre.categories_id.has(c.id));

			return filter.name && filter.categories_id
				? containsName && containsCategoriesId
				: filter.name
					? containsName
					: containsCategoriesId;
		});
	}

	getEntity(): { new (...args: any[]): Genre } {
		return Genre;
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

	async findByIds(ids: EntityId[]): Promise<Genre[]> {
		return this.items.filter(item => {
			return ids.some(id => item.entity_id.equals(id));
		});
	}

	protected override applySort(
		items: Genre[],
		sort: string | null,
		sort_dir: SortDirection | null,
	): Genre[] {
		return sort
			? super.applySort(items, sort, sort_dir)
			: super.applySort(items, 'created_at', 'desc');
	}
}