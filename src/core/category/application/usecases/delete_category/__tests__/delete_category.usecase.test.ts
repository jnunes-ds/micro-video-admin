import {DeleteCategoryUsecase} from "@core/category/application/usecases/delete_category/delete_category.usecase";
import {CategorySequelizeRepository} from "@core/category/infra/db/sequelize/category-sequelize.repository";
import {setupSequelize} from "@core/@shared/infra/testing/helpers";
import {CategoryModel} from "@core/category/infra/db/sequelize/category.model";
import {Uuid} from "@core/@shared/domain/value_objects/uuid.vo";
import {NotFoundError} from "@core/@shared/domain/errors/not_found.error";
import {Category} from "@core/category/domain/category.entity";


describe('DeleteCategoryUsecase Integration Tests', () => {
	let usecase: DeleteCategoryUsecase;
	let repository: CategorySequelizeRepository;

	setupSequelize({ models: [CategoryModel] })

	beforeEach(() => {
		repository = new CategorySequelizeRepository(CategoryModel);
		usecase = new DeleteCategoryUsecase(repository);
	});

	it('should throws an error when entity is not found', async () => {
		const uuid = new Uuid();

		await expect(
			() => usecase.execute({id: uuid.id })
		).rejects.toThrow(new NotFoundError(uuid, Category));
	});

	it('should delete a category', async () => {
		const category = Category.fake().aCategory().build();
		await repository.insert(category);
		await usecase.execute({ id: category.category_id.id });

		const noHasModel = await CategoryModel.findByPk(category.category_id.id);
		expect(noHasModel).toBeNull();
	});
});