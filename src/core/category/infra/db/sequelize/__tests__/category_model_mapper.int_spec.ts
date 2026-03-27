import {setupSequelize} from "@core/@shared/infra/testing/helpers";
import {CategoryModel} from "@core/category/infra/db/sequelize/category.model";
import {CategoryModelMapper} from "@core/category/infra/db/sequelize/category_model_mapper";
import {EntityValidationError} from "@core/@shared/domain/validators/validation.error";
import {Category} from "@core/category/domain/category.entity";
import {Uuid} from "@core/@shared/domain/value_objects/uuid.vo";


describe('CategoryModelMapper Integration Test', () => {
	setupSequelize({
		models: [CategoryModel]
	});

	it('should throws an error when category is not found', () => {
		expect.assertions(2)
		const model = CategoryModel.build({
			category_id: '850704d1-806c-4a35-81c2-e535f36a07ae',
			name: 'a'.repeat(256)
		});
		try {
			CategoryModelMapper.toEntity(model);
			fail('The catefory is valid, but it needs throws a EntityValidationError');
		} catch (e) {
			expect(e).toBeInstanceOf(EntityValidationError);
			expect((e as EntityValidationError).error).toMatchObject([{
				name: [
					"name must be shorter than or equal to 255 characters",
				],
			}])
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