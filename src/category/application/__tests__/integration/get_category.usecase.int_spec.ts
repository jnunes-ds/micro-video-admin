import {GetCategoryUsecase} from "@/category/application/get_category.usecase";
import {Uuid} from "@/@shared/domain/value_objects/uuid.vo";
import {NotFoundError} from "@/@shared/domain/errors/not_found.error";
import {Category} from "@/category/domain/category.entity";
import {CategorySequelizeRepository} from "@/category/infra/db/sequelize/category-sequelize.repository";
import {CategoryModel} from "@/category/infra/db/sequelize/category.model";
import {setupSequelize} from "@/@shared/infra/testing/helpers";

describe('GetCategoryUsecase Integration Tests', () => {
	let usecase: GetCategoryUsecase;
	let repository: CategorySequelizeRepository;

	setupSequelize({ models: [CategoryModel] });

	beforeEach(() => {
		repository = new CategorySequelizeRepository(CategoryModel);
		usecase = new GetCategoryUsecase(repository);
	});

	it('should throws an error when entity is not found', async () => {
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
		repository.bulkInsert(items);

		const spy = jest.spyOn(repository, 'findById');
		const seventhItemId = items[6].category_id.id;
		const output = await usecase.execute({id: seventhItemId});

		expect(spy).toHaveBeenCalledTimes(1);
		expect(output.name).toBe('name-7');
	});
});