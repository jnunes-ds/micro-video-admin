import {Genre, GenreId} from "../genre.aggregate";
import {CategoryId} from "@core/category/domain/category.aggregate";


describe('Genre Unit Tests', () => {

	it('should change name', () => {
		const genre = Genre.fake().aGenre().build();
		genre.changeName('Drama');
		expect(genre.name).toBe('Drama');
	});

	it('should add a category id', () => {
		const genre = Genre.fake().aGenre().build();
		const categoryId = new CategoryId();

		genre.addCategoryId(categoryId);

		expect(genre.categories_id.size).toBe(2);
		expect(genre.categories_id.get(categoryId.id)).toBe(categoryId);
	});

	it('should not duplicate a category id already added', () => {
		const categoryId = new CategoryId();
		const genre = Genre.fake().aGenre().withCategoriesId(categoryId).build();

		genre.addCategoryId(categoryId);

		expect(genre.categories_id.size).toBe(1);
	});

	it('should remove a category id', () => {
		const categoryId = new CategoryId();
		const otherCategoryId = new CategoryId();
		const genre = Genre.fake()
			.aGenre()
			.withCategoriesId(categoryId, otherCategoryId)
			.build();

		genre.removeCategoryId(categoryId);

		expect(genre.categories_id.size).toBe(1);
		expect(genre.categories_id.get(categoryId.id)).toBeUndefined();
		expect(genre.categories_id.get(otherCategoryId.id)).toBe(otherCategoryId);
	});

	it('should sync the categories id', () => {
		const genre = Genre.fake().aGenre().build();
		const categoryId = new CategoryId();
		const otherCategoryId = new CategoryId();

		genre.syncCategoriesId([categoryId, otherCategoryId]);

		expect(genre.categories_id).toEqual(
			new Map([
				[categoryId.id, categoryId],
				[otherCategoryId.id, otherCategoryId],
			]),
		);
	});

	it('should throw an error when syncCategoriesId receives no categories id', () => {
		const genre = Genre.fake().aGenre().build();

		expect(() => genre.syncCategoriesId(null as never)).toThrow(
			new Error('Categories id is empty'),
		);
		expect(() => genre.syncCategoriesId(undefined as never)).toThrow(
			new Error('Categories id is empty'),
		);
	});

	it('should activate the genre', () => {
		const genre = Genre.fake().aGenre().deactivate().build();

		expect(genre.is_active).toBeFalsy();
		genre.activate();
		expect(genre.is_active).toBeTruthy();
	});

	it('should deactivate the genre', () => {
		const genre = Genre.fake().aGenre().build();

		expect(genre.is_active).toBeTruthy();
		genre.deactivate();
		expect(genre.is_active).toBeFalsy();
	});

	it('should returns the entity_id', () => {
		const genre = Genre.fake().aGenre().build();
		expect(genre.entity_id).toBe(genre.genre_id);
	});

	it('should returns all genre info with a JSON format', () => {
		const created_at = new Date();
		const categoryId = new CategoryId();
		const genre = Genre.fake()
			.aGenre()
			.withName('Drama')
			.withCategoriesId(categoryId)
			.deactivate()
			.withCreatedAt(created_at)
			.build();

		expect(genre.toJSON()).toStrictEqual({
			genre_id: genre.genre_id.id,
			name: 'Drama',
			categories_id: [categoryId.id],
			is_active: false,
			created_at,
		});
	});

	describe('gende_id field', () => {
		const arrange: {gende_id: GenreId}[] = [
			{gende_id: null as never},
			{gende_id: undefined as never},
			{gende_id: new GenreId()},
		];
		test.each(arrange)('id = %j', ({gende_id}) => {
			const genre = Genre.fake().aGenre().withGenreId(gende_id).build();
			expect(genre.genre_id).toBeInstanceOf(GenreId);
		});
	});

	describe('Constructor', () => {
		it('should create a genre with default values', () => {
			const categoryId = new CategoryId();
			const genre = new Genre({
				name: 'Drama',
				categories_id: new Map([[categoryId.id, categoryId]]),
			});

			expect(genre.genre_id).toBeInstanceOf(GenreId);
			expect(genre.name).toBe('Drama');
			expect(genre.categories_id).toEqual(
				new Map([[categoryId.id, categoryId]]),
			);
			expect(genre.is_active).toBeTruthy();
			expect(genre.created_at).toBeInstanceOf(Date);
		});

		it('should create a genre with active property false', () => {
			const categoryId = new CategoryId();
			const genre = new Genre({
				name: 'Drama',
				categories_id: new Map([[categoryId.id, categoryId]]),
				is_active: false,
			});

			expect(genre.genre_id).toBeInstanceOf(GenreId);
			expect(genre.name).toBe('Drama');
			expect(genre.is_active).toBeFalsy();
			expect(genre.created_at).toBeInstanceOf(Date);
		});

		it('should create a genre with all specific values', () => {
			const created_at = new Date();
			const gende_id = new GenreId();
			const categoryId = new CategoryId();
			const genre = new Genre({
				genre_id: gende_id,
				name: 'Drama',
				categories_id: new Map([[categoryId.id, categoryId]]),
				is_active: false,
				created_at,
			});

			expect(genre.genre_id).toBe(gende_id);
			expect(genre.name).toBe('Drama');
			expect(genre.categories_id).toEqual(
				new Map([[categoryId.id, categoryId]]),
			);
			expect(genre.is_active).toBeFalsy();
			expect(genre.created_at).toBe(created_at);
		});
	});

	describe('Create Command', () => {
		it('should create a genre', () => {
			const categoryId = new CategoryId();
			const genre = Genre.create({
				name: 'Drama',
				categories_id: [categoryId],
			});

			expect(genre.genre_id).toBeInstanceOf(GenreId);
			expect(genre.name).toBe('Drama');
			expect(genre.categories_id).toEqual(
				new Map([[categoryId.id, categoryId]]),
			);
			expect(genre.is_active).toBeTruthy();
			expect(genre.created_at).toBeInstanceOf(Date);
			expect(genre.notification.hasErrors()).toBe(false);
		});

		it('should create a genre with many categories id', () => {
			const categoryId = new CategoryId();
			const otherCategoryId = new CategoryId();
			const genre = Genre.create({
				name: 'Drama',
				categories_id: [categoryId, otherCategoryId],
			});

			expect(genre.categories_id.size).toBe(2);
			expect(genre.categories_id).toEqual(
				new Map([
					[categoryId.id, categoryId],
					[otherCategoryId.id, otherCategoryId],
				]),
			);
		});

		it('should create a genre with active property false', () => {
			const genre = Genre.create({
				name: 'Drama',
				categories_id: [new CategoryId()],
				is_active: false,
			});

			expect(genre.genre_id).toBeInstanceOf(GenreId);
			expect(genre.name).toBe('Drama');
			expect(genre.is_active).toBeFalsy();
			expect(genre.created_at).toBeInstanceOf(Date);
		});
	});
});

describe('Genre Validator', () => {
	it('should have errors if name is invalid', () => {
		const genre = Genre.create({
			name: 't'.repeat(256),
			categories_id: [new CategoryId()],
		});

		expect(genre.notification.hasErrors()).toBe(true);
	});

	it('should not have errors if name is valid', () => {
		const genre = Genre.create({
			name: 't'.repeat(255),
			categories_id: [new CategoryId()],
		});

		expect(genre.notification.hasErrors()).toBe(false);
	});
});

// METHODS
describe('Methods', () => {
	it('should print an errors if validate is called after changeName receives an invalid argument', () => {
		const genre = Genre.create({
			name: 'Drama',
			categories_id: [new CategoryId()],
		});
		genre.changeName('t'.repeat(256));
		genre.validate();

		expect(genre.notification.hasErrors()).toBe(true);
	});
});
