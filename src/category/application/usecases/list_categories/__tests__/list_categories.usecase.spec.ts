import {CategoryInMemoryRepository} from "@/category/infra/db/in_memory/category_in_memory.repository";
import {ListCategoriesUseCase} from "@/category/application/usecases/list_categories/list_categories.usecase";
import {CategorySearchResult} from "@/category/domain/category.repository";
import {Category} from "@/category/domain/category.entity";
import {CategoryOutputMapper} from "@/category/application/usecases/common/category_output";

describe('ListCategoriesUsecase Unit Tests', () => {
	let usecase: ListCategoriesUseCase;
	let repository: CategoryInMemoryRepository;

	beforeEach(() => {
		repository = new CategoryInMemoryRepository();
		usecase = new ListCategoriesUseCase(repository);
	});

	test('toOutput method', () => {
		let result = new CategorySearchResult({
			items: [],
			total: 1,
			current_page: 1,
			per_page: 2,
		});
		let output = usecase['toOutput'](result);
		expect(output).toStrictEqual({
			items: [],
			total: 1,
			current_page: 1,
			per_page: 2,
			last_page: 1
		});

		const entity = Category.fake()
			.aCategory()
			.withName('Movie')
			.build();

		result = new CategorySearchResult({
			items: [entity],
			total: 1,
			current_page: 1,
			per_page: 2
		});

		output = usecase['toOutput'](result);
		expect(output).toStrictEqual({
			items: [
				{
					id: entity.category_id.id,
					name: entity.name,
					description: entity.description,
					is_active: entity.is_active,
					created_at: entity.created_at,
				}
			],
			total: 1,
			current_page: 1,
			per_page:2,
			last_page: 1
		})
	});

	it('should return output sorted by created_at when input param is empty', async () => {
		const items = Category.fake()
			.theCategories(2)
			.withName(index => `name ${index + 1}`)
			.build();

		repository.items = items;

		const output = await usecase.execute({per_page: 2});

		expect(output).toStrictEqual({
			items: [...items].reverse().map(CategoryOutputMapper.toOutput),
			total: 2,
			current_page: 1,
			per_page: 2,
			last_page: 1
		});
	});
});