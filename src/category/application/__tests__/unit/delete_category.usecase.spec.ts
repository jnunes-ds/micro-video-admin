import {CategoryInMemoryRepository} from "@/category/infra/db/in_memory/category_in_memory.repository";
import {InvalidUuidError, Uuid} from "@/@shared/domain/value_objects/uuid.vo";
import {NotFoundError} from "@/@shared/domain/errors/not_found.error";
import {Category} from "@/category/domain/category.entity";
import {DeleteCategoryUsecase} from "@/category/application/delete_category.usecase";

describe('DeleteCategoryUsecase Unit Tests', () => {
	let usecase: DeleteCategoryUsecase;
	let repository: CategoryInMemoryRepository;

	beforeEach(() => {
		repository = new CategoryInMemoryRepository();
		usecase = new DeleteCategoryUsecase(repository);
	});

	it('should throws an error when entity is not found', async () => {
		await expect(
			() => usecase.execute({id: 'fake id'})
		).rejects.toThrow(new InvalidUuidError());

		const uuid = new Uuid();

		await expect(
			() => usecase.execute({id: uuid.id })
		).rejects.toThrow(new NotFoundError(uuid, Category));
	});

	it('should delete a category', async () => {
		const items = [
			Category.fake()
			.aCategory()
			.withName('test 1')
			.build()
		];

		repository.items = items;

		await usecase.execute({id: items[0].category_id.id});
		expect(repository.items).toHaveLength(0);
	});
});