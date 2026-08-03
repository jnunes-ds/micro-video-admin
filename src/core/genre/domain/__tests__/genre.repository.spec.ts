import {GenreSearchParams} from "@core/genre/domain/genre.repository";
import {SearchParams} from "@core/@shared/domain/repository/search_params";
import {CategoryId} from "@core/category/domain/category.aggregate";
import {InvalidUuidError} from "@core/@shared/domain/value_objects/uuid.vo";


describe('GenreSearchParams Unit Tests', () => {
	describe('create', () => {
		test('should create with default values', () => {
			const params = GenreSearchParams.create({});

			expect(params).toBeInstanceOf(GenreSearchParams);
			expect(params).toBeInstanceOf(SearchParams);
			expect(params.page).toBe(1);
			expect(params.per_page).toBe(15);
			expect(params.sort).toBeNull();
			expect(params.sort_dir).toBeNull();
			expect(params.filter).toBeNull();
		});

		test('should create with the given pagination and sort props', () => {
			const params = GenreSearchParams.create({
				page: 2,
				per_page: 10,
				sort: 'name',
				sort_dir: 'desc'
			});

			expect(params.page).toBe(2);
			expect(params.per_page).toBe(10);
			expect(params.sort).toBe('name');
			expect(params.sort_dir).toBe('desc');
		});

		test('should keep the inherited validation of the pagination props', () => {
			const params = GenreSearchParams.create({
				page: -1 as any,
				per_page: 0 as any,
				sort: '' as any,
				sort_dir: 'fake' as any
			});

			expect(params.page).toBe(1);
			expect(params.per_page).toBe(15);
			expect(params.sort).toBeNull();
			expect(params.sort_dir).toBeNull();
		});
	});

	describe('filter prop', () => {
		test('should be null when there is nothing to filter', () => {
			const arrange = [
				{ filter: null },
				{ filter: undefined },
				{ filter: '' },
				{ filter: {} },
				{ filter: { name: undefined, categories_id: undefined } },
				{ filter: { name: '' } },
				{ filter: { categories_id: [] } },
				{ filter: { name: '', categories_id: [] } },
			];

			arrange.forEach(i => {
				expect(GenreSearchParams.create({ filter: i.filter as any }).filter).toBeNull();
			});
		});

		test('should filter by name', () => {
			const arrange = [
				{ name: 'test', expected: 'test' },
				{ name: 5.5, expected: '5.5' },
				{ name: true, expected: 'true' },
				{ name: {}, expected: '[object Object]' },
			];

			arrange.forEach(i => {
				const params = GenreSearchParams.create({ filter: { name: i.name } as any });
				expect(params.filter).toEqual({ name: i.expected });
			});
		});

		test('should not filter by name when the value is falsy', () => {
			const arrange = [null, undefined, '', false, 0];

			arrange.forEach(name => {
				expect(GenreSearchParams.create({ filter: { name } as any }).filter).toBeNull();
			});
		});

		test('should filter by categories_id converting strings to CategoryId', () => {
			const category_id = new CategoryId();
			const params = GenreSearchParams.create({
				filter: { categories_id: [category_id.id] }
			});

			expect(params.filter?.categories_id).toHaveLength(1);
			expect(params.filter?.categories_id?.[0]).toBeInstanceOf(CategoryId);
			expect(params.filter?.categories_id?.[0].id).toBe(category_id.id);
		});

		test('should filter by categories_id keeping the given CategoryId instances', () => {
			const categories_id = [new CategoryId(), new CategoryId()];
			const params = GenreSearchParams.create({ filter: { categories_id } });

			expect(params.filter?.categories_id).toHaveLength(2);
			expect(params.filter?.categories_id?.[0]).toBe(categories_id[0]);
			expect(params.filter?.categories_id?.[1]).toBe(categories_id[1]);
		});

		test('should filter by categories_id with a mix of strings and CategoryId', () => {
			const category_id = new CategoryId();
			const other_category_id = new CategoryId();
			const params = GenreSearchParams.create({
				// the signature only accepts homogeneous arrays, but the mapping handles a mix
				filter: { categories_id: [category_id.id, other_category_id] as any }
			});

			expect(params.filter?.categories_id).toHaveLength(2);
			params.filter?.categories_id?.forEach(c => {
				expect(c).toBeInstanceOf(CategoryId);
			});
			expect(params.filter?.categories_id?.[0].id).toBe(category_id.id);
			expect(params.filter?.categories_id?.[1]).toBe(other_category_id);
		});

		test('should throw an error when a categories_id is not a valid uuid', () => {
			expect(() =>
				GenreSearchParams.create({ filter: { categories_id: ['fake-id'] } })
			).toThrow(InvalidUuidError);
		});

		test('should filter by name and categories_id together', () => {
			const categories_id = [new CategoryId()];
			const params = GenreSearchParams.create({
				filter: { name: 'test', categories_id: [categories_id[0].id] }
			});

			expect(params.filter).toEqual({
				name: 'test',
				categories_id
			});
		});

		test('should not expose the categories_id key when only the name is filtered', () => {
			const params = GenreSearchParams.create({ filter: { name: 'test' } });

			expect(Object.keys(params.filter as object)).toEqual(['name']);
		});

		test('should not expose the name key when only the categories_id is filtered', () => {
			const params = GenreSearchParams.create({
				filter: { categories_id: [new CategoryId()] }
			});

			expect(Object.keys(params.filter as object)).toEqual(['categories_id']);
		});
	});
});
