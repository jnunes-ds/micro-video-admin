import {ICategoryRepository} from "@core/category/domain/category.repository";
import {Category, CategoryId} from "@core/category/domain/category.aggregate";
import {Either} from "@core/@shared/domain/either";
import {NotFoundError} from "@core/@shared/domain/errors/not_found.error";

export class CategoriesIdsExistsInDatabaseValidator {
	constructor(private categoryRepo: ICategoryRepository) {}

	async validate(categories_id: string[]): Promise<Either<CategoryId[], NotFoundError[]>> {
		const categoriesId = categories_id.map(id => new CategoryId(id));

		const existsResult = await this.categoryRepo.existsById(categoriesId);

		return existsResult.not_exists.length > 0
			? Either.fail(existsResult.not_exists.map(c => new NotFoundError(c.id, Category)))
			: Either.ok(categoriesId);
	}
}