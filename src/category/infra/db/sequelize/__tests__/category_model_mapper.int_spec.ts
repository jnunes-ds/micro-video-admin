import {Sequelize} from "sequelize-typescript";
import {CategoryModel} from "@/category/infra/db/sequelize/category.model";
import {CategoryModelMapper} from "@/category/infra/db/sequelize/category_model_mapper";
import {EntityValidationError} from "@/@shared/domain/validators/validation.error";
import {Category} from "@/category/domain/category.entity";
import {Uuid} from "@/@shared/domain/value_objects/uuid.vo";

describe('CategoryModelMapper Integration Test', () => {
	let sequelize: Sequelize;
	const force: boolean = true;

	beforeEach(async () => {
		sequelize = new Sequelize({
			dialect: 'sqlite',
			storage: ':memory:',
			logging: false,
			models: [CategoryModel]
		});

		await sequelize.sync({force});
	});

	it('should throws an error when category is not found', () => {
		const model = CategoryModel.build({
			category_id: '850704d1-806c-4a35-81c2-e535f36a07ae',
		});
		try {
			CategoryModelMapper.toEntity(model);
			fail('The catefory is valid, but it needs throws a EntityValidationError');
		} catch (e) {
			expect(e).toBeInstanceOf(EntityValidationError);
			expect((e as EntityValidationError).error).toMatchObject({
				name: [
					"name should not be empty",
					"name must be a string",
					"name must be shorter than or equal to 255 characters",
				],
			})
		}
	});

	it('should convert a category model into a category entity', () => {
		const category_id = '850704d1-806c-4a35-81c2-e535f36a07ae';
		const name = 'Movie';
		const description = 'some description';
		const is_active = true;
		const created_at = new Date();

		const model = CategoryModel.build({
			category_id,
			name,
			description,
			is_active,
			created_at,
		});

		const entity = CategoryModelMapper.toEntity(model);

		expect(entity.toJSON()).toStrictEqual(
			new Category({
				category_id: new Uuid(category_id),
				name,
				description,
				is_active,
				created_at
			}).toJSON()
		)
	});

	it('should convert a category entity into a category model', () => {
		const category_id = '850704d1-806c-4a35-81c2-e535f36a07ae';
		const name = 'Movie';
		const description = 'some description';
		const is_active = true;
		const created_at = new Date();

		const entity = new Category({
			category_id: new Uuid(category_id),
			name,
			description,
			is_active,
			created_at,
		});

		const model = CategoryModelMapper.toModel(entity);

		expect(model.toJSON()).toStrictEqual(entity.toJSON())
	});
});