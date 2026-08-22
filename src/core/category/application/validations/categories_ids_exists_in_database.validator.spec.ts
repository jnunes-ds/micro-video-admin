import {ICategoryRepository} from "@core/category/domain/category.repository";
import {
	CategoriesIdsExistsInDatabaseValidator
} from "@core/category/application/validations/categories_ids_exists_in_database.validator";
import {CategoryInMemoryRepository} from "@core/category/infra/db/in_memory/category_in_memory.repository";
import {Category, CategoryId} from "@core/category/domain/category.aggregate";
import {NotFoundError} from "@core/@shared/domain/errors/not_found.error";

describe('CategoriesIdsExistsInDatabaseValidator Unit Tests', () => {
	let categoryRepo: ICategoryRepository;
	let validator: CategoriesIdsExistsInDatabaseValidator;
	beforeEach(() => {
		categoryRepo = new CategoryInMemoryRepository();
		validator = new CategoriesIdsExistsInDatabaseValidator(categoryRepo);
	});

	it('should return many not found errors when categories ids does not exists in repository',
		async () => {
		const categoryId1 = new CategoryId();
		const categoryId2 = new CategoryId();
		const spyExistsById =
			jest.spyOn(categoryRepo, 'existsById');
		let [categoriesId, errorsCategoriesIds] = await validator.validate([
			categoryId1.id,
			categoryId2.id
		]);
		expect(categoriesId).toStrictEqual(null);
		expect(errorsCategoriesIds).toStrictEqual([
			new NotFoundError(categoryId1.id, Category),
			new NotFoundError(categoryId2.id, Category)
		]);

		expect(spyExistsById).toHaveBeenCalledTimes(1);

		const category1 = Category.fake().aCategory().build();
		await categoryRepo.insert(category1);

		[categoriesId, errorsCategoriesIds] = await validator.validate([
			category1.category_id.id,
			categoryId2.id
		]);
			console.log('id 1: ', categoryId1.id);
			console.log('id 2: ', categoryId2.id);
		expect(categoriesId).toStrictEqual(null);
		expect(errorsCategoriesIds).toStrictEqual([
			new NotFoundError(categoryId2.id, Category)
		]);
		expect(spyExistsById).toHaveBeenCalledTimes(2);
	});

	it('should return a list of categories id', async () => {
		const category1 = Category.fake().aCategory().build();
		const category2 = Category.fake().aCategory().build();
		await categoryRepo.bulkInsert([category1, category2]);
		const [categoriesId, errorsCategoriesId] = await validator.validate([
			category1.category_id.id,
			category2.category_id.id
		]);
		expect(categoriesId).toHaveLength(2);
		expect(errorsCategoriesId).toStrictEqual(null);
		expect(categoriesId![0]).toBeValueObject(category1.category_id);
		expect(categoriesId![1]).toBeValueObject(category2.category_id);
	});
});