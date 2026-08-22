import Chance from "chance";
import {Genre, GenreId} from "@core/genre/domain/genre.aggregate";
import {GenreFakeBuilder} from "@core/genre/domain/genre_fake.builder";
import {CategoryId} from "@core/category/domain/category.aggregate";

describe('GenreFakeBuilder Unit Test', () => {
	describe('genre_id prop', () => {
		const faker = Genre.fake().aGenre();

		it('should throw error when any with methods has been called', () => {
			expect(() => faker.genre_id).toThrowError(
				new Error(
					"Property genre_id not have a factory, use 'with' methods"
				)
			);
		});

		it('should be undefined', () => {
			expect(faker['_genre_id']).toBeUndefined();
		});

		test('withGenreId', () => {
			const genre_id = new GenreId();
			const $this = faker.withGenreId(genre_id);
			expect($this).toBeInstanceOf(GenreFakeBuilder);
			expect(faker['_genre_id']).toBe(genre_id);

			faker.withGenreId(() => genre_id);
			// @ts-expect-error _genre_id is callable
			expect(faker['_genre_id']()).toBe(genre_id);
			expect(faker.genre_id).toBe(genre_id);
		});

		it('should pass index to genre_id factory', () => {
			let mockFactory = jest.fn(() => new GenreId());
			faker.withGenreId(mockFactory);
			faker.build();
			expect(mockFactory).toHaveBeenCalledTimes(1);

			const genreId = new GenreId();
			mockFactory = jest.fn(() => genreId);
			const fakerMany = Genre.fake().theGenres(2);
			fakerMany.withGenreId(mockFactory);
			fakerMany.build();

			expect(mockFactory).toHaveBeenCalledTimes(2);
			expect(fakerMany.build()[0].genre_id).toBe(genreId);
			expect(fakerMany.build()[1].genre_id).toBe(genreId);
		});
	});

	describe('name prop', () => {
		const faker = Genre.fake().aGenre();

		it('should be a function', () => {
			expect(typeof faker['_name']).toBe('function');
		});

		it('should call the word method', () => {
			const chance = Chance();
			const spyWordMethod = jest.spyOn(chance, 'word');
			faker['chance'] = chance;
			faker.build();
			expect(spyWordMethod).toHaveBeenCalled();
		});

		test('withName', () => {
			const $this = faker.withName('test');
			expect($this).toBeInstanceOf(GenreFakeBuilder);
			expect(faker['_name']).toBe('test');

			faker.withName(() => 'test name');

			// @ts-expect-error _name is callable
			expect(faker['_name']()).toBe('test name');
			expect(faker.name).toBe('test name');
		});

		it('should pass index to name factory', () => {
			faker.withName((index) => `test name ${index}`);
			const genre = faker.build();
			expect(genre.name).toBe(`test name 0`);

			const fakeMany = Genre.fake().theGenres(2);
			fakeMany.withName((index) => `test name ${index}`);
			const genres = fakeMany.build();

			expect(genres[0].name).toBe(`test name 0`);
			expect(genres[1].name).toBe(`test name 1`);
		});

		test('invalid name to long case', () => {
			const $this = faker.withInvalidNameTooLong();
			expect($this).toBeInstanceOf(GenreFakeBuilder);
			expect(faker['_name'].length).toBe(256);

			const tooLong = 'a'.repeat(256);
			faker.withInvalidNameTooLong(tooLong);
			expect(faker['_name']).toBe(tooLong);
			expect(faker['_name'].length).toBe(256);
		});
	});

	describe('categories_id prop', () => {
		it('should throw error when any with methods has been called', () => {
			const faker = Genre.fake().aGenre();
			expect(() => faker.categories_id).toThrowError(
				new Error(
					"Property categories_id not have a factory, use 'with' methods"
				)
			);
		});

		it('should be an empty array', () => {
			const faker = Genre.fake().aGenre();
			expect(faker['_categories_id']).toStrictEqual([]);
		});

		it('should create a random category id when no with method has been called', () => {
			const genre = Genre.fake().aGenre().build();
			expect(genre.categories_id.size).toBe(1);
			expect([...genre.categories_id.values()][0]).toBeInstanceOf(CategoryId);
		});

		test('addCategoryId', () => {
			const faker = Genre.fake().aGenre();
			const categoryId = new CategoryId();
			const $this = faker.addCategoryId(categoryId);
			expect($this).toBeInstanceOf(GenreFakeBuilder);
			expect(faker['_categories_id']).toStrictEqual([categoryId]);

			const otherCategoryId = new CategoryId();
			faker.addCategoryId(() => otherCategoryId);
			// @ts-expect-error _categories_id[1] is callable
			expect(faker['_categories_id'][1]()).toBe(otherCategoryId);
			expect(faker.categories_id).toStrictEqual([categoryId, otherCategoryId]);
		});

		test('withCategoriesId', () => {
			const faker = Genre.fake().aGenre();
			const categoryId = new CategoryId();
			const otherCategoryId = new CategoryId();
			faker.addCategoryId(new CategoryId());

			const $this = faker.withCategoriesId(categoryId, otherCategoryId);
			expect($this).toBeInstanceOf(GenreFakeBuilder);
			expect(faker['_categories_id']).toStrictEqual([
				categoryId,
				otherCategoryId,
			]);
			expect(faker.categories_id).toStrictEqual([categoryId, otherCategoryId]);
		});

		it('should pass index to categories_id factory', () => {
			const categoriesId = [new CategoryId(), new CategoryId()];
			const faker = Genre.fake().aGenre();
			faker.addCategoryId((index) => categoriesId[index]);

			const genre = faker.build();
			expect(genre.categories_id.get(categoriesId[0].id)).toBe(categoriesId[0]);

			const fakerMany = Genre.fake().theGenres(2);
			fakerMany.addCategoryId((index) => categoriesId[index]);
			const genres = fakerMany.build();

			expect(genres[0].categories_id.get(categoriesId[0].id)).toBe(
				categoriesId[0],
			);
			expect(genres[1].categories_id.get(categoriesId[1].id)).toBe(
				categoriesId[1],
			);
		});
	});

	describe('is_active prop', () => {
		const faker = Genre.fake().aGenre();

		it('should be a function', () => {
			expect(typeof faker['_is_active']).toBe('function');
		});

		test('activate', () => {
			const $this = faker.activate();
			expect($this).toBeInstanceOf(GenreFakeBuilder);
			expect(faker['_is_active']).toBe(true);
			expect(faker.is_active).toBe(true);
		});

		test('deactivate', () => {
			const $this = faker.deactivate();
			expect($this).toBeInstanceOf(GenreFakeBuilder);
			expect(faker['_is_active']).toBe(false);
			expect(faker.is_active).toBe(false);
		});
	});

	describe('created_at prop', () => {
		const faker = Genre.fake().aGenre();

		it('should throw an error when any `with` method is called', () => {
			const fakerGenre = Genre.fake().aGenre();
			expect(() => fakerGenre.created_at).toThrow(
				new Error("Property created_at not have a factory, use 'with' methods")
			);
		});

		it('should be undefined', () => {
			expect(faker['_created_at']).toBeUndefined();
		});

		test('withCreatedAt', () => {
			const date = new Date();
			const $this = faker.withCreatedAt(date);
			expect($this).toBeInstanceOf(GenreFakeBuilder);
			expect(faker['_created_at']).toBe(date);

			faker.withCreatedAt(() => date);
			// @ts-expect-error _created_at is callable
			expect(faker['_created_at']()).toBe(date);
			expect(faker.created_at).toBe(date);
		});

		it('should pass index to created_at factory', () => {
			const date = new Date();
			faker.withCreatedAt((index) => new Date(date.getTime() + index + 2));
			const genre = faker.build();
			expect(genre.created_at.getTime()).toBe(date.getTime() + 2);

			const fakerMany = GenreFakeBuilder.theGenres(2);
			fakerMany.withCreatedAt((index) => new Date(date.getTime() + index + 2));
			const genres = fakerMany.build();

			expect(genres[0].created_at.getTime()).toBe(date.getTime() + 2);
			expect(genres[1].created_at.getTime()).toBe(date.getTime() + 3);
		});
	});

	it('should create a genre', () => {
		const faker = GenreFakeBuilder.aGenre();
		let genre = faker.build();

		expect(genre.genre_id).toBeInstanceOf(GenreId);
		expect(typeof genre.name === 'string').toBeTruthy();
		expect(genre.categories_id).toBeInstanceOf(Map);
		expect(genre.categories_id.size).toBe(1);
		expect(genre.is_active).toBe(true);
		expect(genre.created_at).toBeInstanceOf(Date);

		const created_at = new Date();
		const genre_id = new GenreId();
		const categoryId = new CategoryId();
		genre = faker
			.withGenreId(genre_id)
			.withName('name test')
			.withCategoriesId(categoryId)
			.deactivate()
			.withCreatedAt(created_at)
			.build();

		expect(genre.genre_id.id).toBe(genre_id.id);
		expect(genre.name).toBe('name test');
		expect(genre.categories_id).toEqual(
			new Map([[categoryId.id, categoryId]]),
		);
		expect(genre.is_active).toBe(false);
		expect(genre.created_at).toBe(created_at);
	});

	it('should create many genres', () => {
		const faker = GenreFakeBuilder.theGenres(2);
		let genres = faker.build();

		genres.forEach((genre) => {
			expect(genre.genre_id).toBeInstanceOf(GenreId);
			expect(typeof genre.name === 'string').toBeTruthy();
			expect(genre.categories_id).toBeInstanceOf(Map);
			expect(genre.categories_id.size).toBe(1);
			expect(genre.is_active).toBe(true);
			expect(genre.created_at).toBeInstanceOf(Date);
		});

		const created_at = new Date();
		const genre_id = new GenreId();
		const categoryId = new CategoryId();
		genres = faker
			.withGenreId(genre_id)
			.withName('name test')
			.withCategoriesId(categoryId)
			.deactivate()
			.withCreatedAt(created_at)
			.build();

		genres.forEach((genre) => {
			expect(genre.genre_id.id).toBe(genre_id.id);
			expect(genre.name).toBe('name test');
			expect(genre.categories_id).toEqual(
				new Map([[categoryId.id, categoryId]]),
			);
			expect(genre.is_active).toBe(false);
			expect(genre.created_at).toBe(created_at);
		});
	});
});
