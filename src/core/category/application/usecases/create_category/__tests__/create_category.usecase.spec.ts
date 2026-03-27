import {CreatecategoryUsecase} from "@core/category/application/usecases/create_category/create_category.usecase";
import {CategoryInMemoryRepository} from "@core/category/infra/db/in_memory/category_in_memory.repository";


describe('CreateCategoryUsecase Unit Tests', () => {
	let usecase: CreatecategoryUsecase;
	let repository: CategoryInMemoryRepository;

	beforeEach(() => {
		repository = new CategoryInMemoryRepository();
		usecase = new CreatecategoryUsecase(repository);
	});

	it('should create a category', async () => {
		const spyInsert = jest.spyOn(repository, 'insert');
		let output = await usecase.execute({name: 'test'});
		expect(spyInsert).toHaveBeenCalledTimes(1);
		expect(output).toStrictEqual({
			id: repository.items[0].category_id.id,
			name: 'test',
			description: null,
			is_active: true,
			created_at: repository.items[0].created_at,
		});

		output = await usecase.execute({
			name: 'test',
			description: 'some description',
			is_active: false
		});

		expect(spyInsert).toHaveBeenCalledTimes(2);
		expect(output).toStrictEqual({
			id: repository.items[1].category_id.id,
			name: 'test',
			description: 'some description',
			is_active: false,
			created_at: repository.items[1].created_at,
		});
	});
});