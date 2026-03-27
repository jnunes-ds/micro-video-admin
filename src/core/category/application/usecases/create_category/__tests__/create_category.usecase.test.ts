import {CreatecategoryUsecase} from "@core/category/application/usecases/create_category/create_category.usecase";
import {CategorySequelizeRepository} from "@core/category/infra/db/sequelize/category-sequelize.repository";
import {setupSequelize} from "@core/@shared/infra/testing/helpers";
import {CategoryModel} from "@core/category/infra/db/sequelize/category.model";
import {CreateCategoryInput} from "@core/category/application/usecases/create_category/create_category.input";
import {Uuid} from "@core/@shared/domain/value_objects/uuid.vo";


describe('CreateCategoryUsecase Integration Tests', () => {
	let usecase: CreatecategoryUsecase;
	let repository: CategorySequelizeRepository;

	setupSequelize({models: [CategoryModel]});

	beforeEach(() => {
		repository = new CategorySequelizeRepository(CategoryModel);
		usecase = new CreatecategoryUsecase(repository);
	});

	it('should create a category', async () => {
		let input: CreateCategoryInput = {name: 'test'};
		let output = await usecase.execute(input);
		let entity = await repository.findById(new Uuid(output.id));

		expect(output).toStrictEqual({
			id: entity.category_id.id,
			name: 'test',
			description: null,
			is_active: true,
			created_at: entity.created_at,
		});

		input = {name: 'test2', description: 'some description'}
		output = await usecase.execute(input);
		entity = await repository.findById(new Uuid(output.id));
		expect(output).toStrictEqual({
			id: entity.category_id.id,
			name: 'test2',
			description: 'some description',
			is_active: true,
			created_at: entity.created_at,
		})
	});
});