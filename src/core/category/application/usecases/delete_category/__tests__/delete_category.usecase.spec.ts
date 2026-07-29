import {DeleteCategoryUsecase} from "@core/category/application/usecases/delete_category/delete_category.usecase";
import {CategoryInMemoryRepository} from "@core/category/infra/db/in_memory/category_in_memory.repository";
import {InvalidUuidError} from "@core/@shared/domain/value_objects/uuid.vo";
import {NotFoundError} from "@core/@shared/domain/errors/not_found.error";
import {Category, CastMemberId} from "@core/category/domain/category.aggregate";


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

		const categoryId = new CastMemberId();

		await expect(
			() => usecase.execute({id: categoryId.id })
		).rejects.toThrow(new NotFoundError(categoryId, Category));
	});

	it('should delete a category', async () => {
		const items = [
			Category.fake().aCategory().build()
		];
		repository.items = items;

		const spy = jest.spyOn(repository, 'delete');
		await usecase.execute({id: items[0].category_id.id});

		expect(spy).toHaveBeenCalledTimes(1);
		expect(repository.items).toHaveLength(0);
	});
});