import {DataType, Sequelize} from "sequelize-typescript";
import {CategoryModel} from "@/category/infra/db/sequelize/category.model";
import {Config} from "@/@shared/infra/config";

describe('CategoryModel Integration Test', () => {
	let sequelize: Sequelize;
	const force: boolean = true;

	beforeEach(async () => {
		console.log(Config.db());
		sequelize = new Sequelize({
			dialect: 'sqlite',
			storage: ':memory:',
			logging: false,
			models: [CategoryModel]
		});

		await sequelize.sync({force})
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