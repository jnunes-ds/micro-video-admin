import {InMemoryRepository} from "@/@shared/infra/db/in_memory/in_memory.repository";
import {Category} from "@/category/domain/category.entity";
import {Uuid} from "@/@shared/domain/value_objects/uuid.vo";

export class CategoryInMemoryRepository extends InMemoryRepository<
	Category,
	Uuid
> {
	getEntity(): { new(...args: any[]): Category } {
		return Category;
	}
}