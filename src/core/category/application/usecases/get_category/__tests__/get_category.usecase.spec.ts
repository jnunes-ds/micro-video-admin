import {GetCategoryUsecase} from "@core/category/application/usecases/get_category/get_category.usecase";
import {CategoryInMemoryRepository} from "@core/category/infra/db/in_memory/category_in_memory.repository";
import {InvalidUuidError, Uuid} from "@core/@shared/domain/value_objects/uuid.vo";
import {NotFoundError} from "@core/@shared/domain/errors/not_found.error";
import {Category} from "@core/category/domain/category.entity";


describe('GetCategoryUsecase Unit Tests', () => {
	let usecase: GetCategoryUsecase;
	let repository: CategoryInMemoryRepository;

	beforeEach(() => {
		repository = new CategoryInMemoryRepository();
		usecase = new GetCategoryUsecase(repository);
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

	it('should get a category by id', async () => {
		const items = Category.fake()
			.theCategories(11)
			.withName(index => `name-${index + 1}`)
			.build();
		repository.items = items;

		const spy = jest.spyOn(repository, 'findById');
		const seventhItemId = items[6].category_id.id;
		const output = await usecase.execute({id: seventhItemId});

		expect(spy).toHaveBeenCalledTimes(1);
		expect(output.name).toBe('name-7');
	});
});