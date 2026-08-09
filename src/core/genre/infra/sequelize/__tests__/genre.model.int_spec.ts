import {DataType} from "sequelize-typescript";
import {setupSequelize} from "@core/@shared/infra/testing/helpers";
import {CategoryModel} from "@core/category/infra/db/sequelize/category.model";
import {GenreCategoryModel, GenreModel} from "@core/genre/infra/sequelize/genre.model";

describe('GenreModel Integration Test', () => {
	setupSequelize({
		models: [GenreModel, GenreCategoryModel, CategoryModel]
	});

	test('mapping props', () => {
		const attributesMap = GenreModel.getAttributes();
		const attributes = Object.keys(GenreModel.getAttributes());
		expect(attributes).toStrictEqual([
			"genre_id",
			"name",
			"is_active",
			"created_at"
		]);

		const genreIdAttr = attributesMap.genre_id;
		expect(genreIdAttr).toMatchObject({
			field: 'genre_id',
			fieldName: 'genre_id',
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
			type: DataType.DATE(6),
			allowNull: false
		});
	});

	test('mapping association genre_category', () => {
		const attributesMap = GenreCategoryModel.getAttributes();
		const attributes = Object.keys(GenreCategoryModel.getAttributes());
		expect(attributes).toStrictEqual([
			"genre_id",
			"category_id",
		]);

		const genreIdAttr = attributesMap.genre_id;
		expect(genreIdAttr).toMatchObject({
			field: 'genre_id',
			fieldName: 'genre_id',
			primaryKey: true,
		});

		const categoryIdAttr = attributesMap.category_id;
		expect(categoryIdAttr).toMatchObject({
			field: 'category_id',
			fieldName: 'category_id',
			primaryKey: true,
		});
	});

	test('creation', async () => {
		//arrange
		const arrange = {
			genre_id: '850704d1-806c-4a35-81c2-e535f36a07ae',
			name: 'test',
			is_active: true,
			created_at: new Date(),
		};

		//act
		const genre = await GenreModel.create(arrange);

		//assert
		expect(genre.toJSON()).toStrictEqual(arrange);
	});

	test('create genre_category relation', async () => {
		//arrange
		const categoryModel = await CategoryModel.create({
			category_id: '5490020a-e866-4229-9adc-aa44b83234c4',
			name: 'category',
			is_active: true,
			created_at: new Date(),
		});

		const genreModel = await GenreModel.create({
			genre_id: '850704d1-806c-4a35-81c2-e535f36a07ae',
			name: 'test',
			is_active: true,
			created_at: new Date(),
		});

		//act
		const genreCategory = await GenreCategoryModel.create({
			genre_id: genreModel.genre_id,
			category_id: categoryModel.category_id,
		});

		//assert
		expect(genreCategory.toJSON()).toStrictEqual({
			genre_id: genreModel.genre_id,
			category_id: categoryModel.category_id,
		});
	});
});
