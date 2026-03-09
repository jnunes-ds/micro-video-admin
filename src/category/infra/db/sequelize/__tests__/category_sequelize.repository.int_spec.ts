import {Sequelize} from "sequelize-typescript";
import {CategoryModel} from "../category.model";
import {CategorySequelizeRepository} from "@/category/infra/db/sequelize/category-sequelize.repository";
import {Category} from "@/category/domain/category.entity";
import {Uuid} from "@/@shared/domain/value_objects/uuid.vo";
import {NotFoundError} from "@/@shared/domain/errors/not_found.error";

describe('CategorySequelizeRepository Integration Test', () => {
	let sequelize: Sequelize;
	let repository: CategorySequelizeRepository;
	const force: boolean = true;

	beforeEach(async () => {
		sequelize = new Sequelize({
			dialect: 'sqlite',
			storage: ':memory:',
			logging: false,
			models: [CategoryModel]
		});

		await sequelize.sync({force});
		repository = new CategorySequelizeRepository(CategoryModel);
	});

	it('should insert a new category', async () => {
		const category = Category.fake().aCategory().build();
		await repository.insert(category);

		const model = await CategoryModel.findByPk(category.category_id.id);
		expect(model.toJSON()).toMatchObject(category.toJSON());
	});

	it('should find a category by id', async () => {
		let foundedCategory = await repository.findById(new Uuid());
		expect(foundedCategory).toBeNull();

		const category = Category.fake().aCategory().build();
		await repository.insert(category);
		foundedCategory = await repository.findById(category.category_id);
		expect(foundedCategory.toJSON()).toMatchObject(category.toJSON());
	});

	it('should return all categories', async () => {
		const categories = Category.fake().theCategories(3).build();
		await repository.bulkInsert(categories);
		const categoriesList = await repository.findAll();

		expect(categoriesList).toHaveLength(3);
		expect(JSON.stringify(categories)).toBe(JSON.stringify(categoriesList));
	});

	it('should throw an error on update when the category is not found', async () => {
		const category = Category.fake().aCategory().build();
		await expect(repository.update(category)).rejects.toThrow(
			new NotFoundError(category.category_id.id, Category)
		);
	});

	it('should update a category', async () => {
		const category = Category.fake().aCategory().withName('Movie').build();
		await repository.insert(category);

		category.changeName('Movie updated');
		await repository.update(category);

		const foundedCategory = await repository.findById(category.category_id);
		expect(category.toJSON()).toStrictEqual(foundedCategory.toJSON());
	});

	it('should throw an error on delete when the category is not found', async () => {
		const category = Category.fake().aCategory().build();
		await expect(repository.delete(category.category_id)).rejects.toThrow(
			new NotFoundError(category.category_id.id, Category)
		);
	});

	it('should delete a category', async () => {
		const category = Category.fake().aCategory().build();
		await repository.insert(category);

		await repository.delete(category.category_id);
		await expect(repository.findById(category.category_id)).resolves.toBeNull();
	});
});