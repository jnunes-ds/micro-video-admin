import {DataType} from "sequelize-typescript";
import {setupSequelize} from "@core/@shared/infra/testing/helpers";
import {CategoryModel} from "@core/category/infra/db/sequelize/category.model";

describe('CategoryModel Integration Test', () => {
	setupSequelize({
		models: [CategoryModel]
	});

	test('mapping props', () => {
		const attributesMap = CategoryModel.getAttributes();
		const attributes = Object.keys(CategoryModel.getAttributes());
		expect(attributes).toStrictEqual([
			"category_id",
			"name",
			"description",
			"is_active",
			"created_at"
		]);

		const categoryIdAttr = attributesMap.category_id;
		expect(categoryIdAttr).toMatchObject({
			field: 'category_id',
			fieldName: 'category_id',
			primaryKey: true,
			type: DataType.UUID()
		});

		const nameAttr = attributesMap.name;
		expect(nameAttr).toMatchObject({
			field: 'name',
			fieldName: 'name',
			type: DataType.STRING(255),
			allowNull: false
		});

		const descriptionAttr = attributesMap.description;
		expect(descriptionAttr).toMatchObject({
			field: 'description',
			fieldName: 'description',
			type: DataType.TEXT(),
			allowNull: true
		});

		const isActiveAttr = attributesMap.is_active;
		expect(isActiveAttr).toMatchObject({
			field: 'is_active',
			fieldName: 'is_active',
			type: DataType.BOOLEAN(),
			allowNull: false
		});

		const createdAtAttr = attributesMap.created_at;
		expect(createdAtAttr).toMatchObject({
			field: 'created_at',
			fieldName: 'created_at',
			type: DataType.DATE(3),
			allowNull: false
		});
	});

	test('creation', async () => {
		//arrange
		const arrange = {
			category_id: '850704d1-806c-4a35-81c2-e535f36a07ae',
			name: 'test',
			is_active: true,
			created_at: new Date(),
		};

		//act
		const category = await CategoryModel.create(arrange);

		//assert
		expect(category.toJSON()).toStrictEqual(arrange);
	});
});