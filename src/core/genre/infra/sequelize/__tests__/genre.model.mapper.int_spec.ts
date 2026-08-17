import {setupSequelize} from "@core/@shared/infra/testing/helpers";
import {CategoryModel} from "@core/category/infra/db/sequelize/category.model";
import {CategoryId} from "@core/category/domain/category.aggregate";
import {GenreCategoryModel, GenreModel} from "@core/genre/infra/sequelize/genre.model";
import {GenreModelMapper} from "@core/genre/infra/sequelize/genre.model.mapper";
import {Genre, GenreId} from "@core/genre/domain/genre.aggregate";

describe('GenreModelMapper Integration Test', () => {
	setupSequelize({
		models: [GenreModel, GenreCategoryModel, CategoryModel]
	});

	it('should throws an error when genre name is not valid', () => {
		const model = GenreModel.build({
			genre_id: '850704d1-806c-4a35-81c2-e535f36a07ae',
			name: 'a'.repeat(256),
			is_active: true,
			created_at: new Date(),
			categories_id: [],
		}, { include: ['categories_id'] });

		expect(() => GenreModelMapper.toEntity(model)).toThrow(Error);
	});

	it('should throws an error when genre has no categories_id', () => {
		const model = GenreModel.build({
			genre_id: '850704d1-806c-4a35-81c2-e535f36a07ae',
			name: 'test',
			is_active: true,
			created_at: new Date(),
			categories_id: [],
		}, { include: ['categories_id'] });

		expect(() => GenreModelMapper.toEntity(model)).toThrow(Error);
	});

	it('should convert a genre model to a genre entity', async () => {
		const category1 = await CategoryModel.create({
			category_id: '5490020a-e866-4229-9adc-aa44b83234c4',
			name: 'category1',
			is_active: true,
			created_at: new Date(),
		});
		const category2 = await CategoryModel.create({
			category_id: 'd8952775-5c66-4c62-99c2-1ce4c9c3a6b5',
			name: 'category2',
			is_active: true,
			created_at: new Date(),
		});

		const genre_id = '850704d1-806c-4a35-81c2-e535f36a07ae';
		const name = 'test';
		const is_active = true;
		const created_at = new Date();

		await GenreModel.create({
			genre_id,
			name,
			is_active,
			created_at,
			categories_id: []
		});
		await GenreCategoryModel.create({
			genre_id,
			category_id: category1.category_id,
		});
		await GenreCategoryModel.create({
			genre_id,
			category_id: category2.category_id,
		});

		const model = await GenreModel.findByPk(genre_id, { include: ['categories_id'] });

		const entity = GenreModelMapper.toEntity(model!);

		expect(entity.toJSON()).toStrictEqual(
			new Genre({
				genre_id: new GenreId(genre_id),
				name,
				categories_id: new Map([
					[category1.category_id, new CategoryId(category1.category_id)],
					[category2.category_id, new CategoryId(category2.category_id)],
				]),
				is_active,
				created_at,
			}).toJSON()
		);
	});

	it('should convert a genre entity to a genre model props', () => {
		const genre_id = '850704d1-806c-4a35-81c2-e535f36a07ae';
		const category_id_1 = new CategoryId();
		const category_id_2 = new CategoryId();
		const created_at = new Date();

		const entity = new Genre({
			genre_id: new GenreId(genre_id),
			name: 'test',
			categories_id: new Map([
				[category_id_1.id, category_id_1],
				[category_id_2.id, category_id_2],
			]),
			is_active: true,
			created_at,
		});

		const modelProps = GenreModelMapper.toModelProps(entity);

		expect(modelProps).toStrictEqual({
			genre_id,
			name: 'test',
			is_active: true,
			created_at,
			categories_id: [
				new GenreCategoryModel({
					genre_id,
					category_id: category_id_1.id,
				}),
				new GenreCategoryModel({
					genre_id,
					category_id: category_id_2.id,
				}),
			],
		});
	});
});
