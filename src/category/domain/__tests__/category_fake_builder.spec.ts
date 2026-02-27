import Chance from "chance";
import {Category} from "@/category/domain/category.entity";
import {Uuid} from "@/@shared/domain/value_objects/uuid.vo";
import {CategoryFakeBuilder} from "@/category/domain/category_fake.builder";

describe('CategoryFakeBuilder Unit Test', () => {
	describe('category_id prop', () => {
		const faker = Category.fake().aCategory();

		it('should throw error when any with methods has been called', () => {
			expect(() => faker.category_id).toThrowError(
				new Error(
					"Property category_id not have a factory, use 'with' methods"
				)
			);

		});

		it('should be undefined', () => {
			expect(faker['_category_id']).toBeUndefined();
		});

		test('withUuid', () => {
			const category_id = new Uuid();
			const $this = faker.withUuid(category_id);
			expect($this).toBeInstanceOf(CategoryFakeBuilder);
			expect(faker['_category_id']).toBe(category_id);

			faker.withUuid(() => category_id);
			// @ts-expect-error _category_id is callable
			expect(faker['_category_id']()).toBe(category_id);
			expect(faker.category_id).toBe(category_id);
		});

		it('should pass index to category_id factory', () => {
			let mockFactory = jest.fn(() => new Uuid());
			faker.withUuid(mockFactory);
			faker.build();
			expect(mockFactory).toHaveBeenCalledTimes(1);

			const categoryId = new Uuid();
			mockFactory = jest.fn(() => categoryId);
			const fakerMany = Category.fake().theCategories(2);
			fakerMany.withUuid(mockFactory);
			fakerMany.build();

			expect(mockFactory).toHaveBeenCalledTimes(2);
			expect(fakerMany.build()[0].category_id).toBe(categoryId);
			expect(fakerMany.build()[1].category_id).toBe(categoryId);

		});
	});

	describe('name prop', () => {
		const faker = Category.fake().aCategory();

		it('should be a function', () => {
			expect(typeof faker["_name"]).toBe('function');
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
			expect($this).toBeInstanceOf(CategoryFakeBuilder);
			expect(faker['_name']).toBe('test');

			faker.withName(() => 'test name');

			// @ts-expect-error _name is callable
			expect(faker['_name']()).toBe('test name');
			expect(faker.name).toBe('test name');
		});

		it('should pass index to name factory', () => {
			faker.withName((index) => `test name ${index}`);
			const category = faker.build();
			expect(category.name).toBe(`test name 0`);
			const fakeMany =Category.fake().theCategories(2);
			fakeMany.withName((index) => `test name ${index}`);
			const categories = fakeMany.build();

			expect(categories[0].name).toBe(`test name 0`);
			expect(categories[1].name).toBe(`test name 1`);
		});

		test('invalid name to long case', () => {
			const $this = faker.withInvalidNameTooLong();
			expect($this).toBeInstanceOf(CategoryFakeBuilder);
			expect(faker['_name'].length).toBe(256);

			const tooLong = 'a'.repeat(256);
			faker.withInvalidNameTooLong(tooLong);
			expect(faker['_name']).toBe(tooLong);
			expect(faker['_name'].length).toBe(256);
		});
	});

	describe('description prop', () => {
		const faker = Category.fake().aCategory();

		it('should be a function', () => {
			expect(typeof faker['_description']).toBe('function');
		});

		it('should call the paragraph method', () => {
			const chance = Chance();
			const spyParagraphMethod = jest.spyOn(chance, 'paragraph');
			faker['chance'] = chance;
			faker.build();
			expect(spyParagraphMethod).toHaveBeenCalled();
		});

		test('withDescription', () => {
			const $this = faker.withDescription('test description');
			expect($this).toBeInstanceOf(CategoryFakeBuilder);
			expect(faker['_description']).toBe('test description');

			faker.withDescription(() => 'test description');
			// @ts-expect-error _description is callable
			expect(faker['_description']()).toBe('test description');
			expect(faker.description).toBe('test description');
		});

		it('should pass index to description factory', () => {
			faker.withDescription((index) => `test description ${index}`);
			const category = faker.build();
			expect(category.description).toBe(`test description 0`);

			const fakeMany = Category.fake().theCategories(2);
			fakeMany.withDescription((index) => `test description ${index}`);
			const categories = fakeMany.build();

			expect(categories[0].description).toBe(`test description 0`);
			expect(categories[1].description).toBe(`test description 1`);
		});
	});

	describe('is_active prop', () => {
		const faker = Category.fake().aCategory();

		it('should be a function', () => {
			expect(typeof faker['_is_active']).toBe('function');
		});

		test('activate', () => {
			const $this = faker.activate();
			expect($this).toBeInstanceOf(CategoryFakeBuilder);
			expect(faker['_is_active']).toBe(true);
			expect(faker.is_active).toBe(true);
		});

		test('deactivate', () => {
			const $this = faker.deactivate();
			expect($this).toBeInstanceOf(CategoryFakeBuilder);
			expect(faker['_is_active']).toBe(false);
			expect(faker.is_active).toBe(false);
		});
	});

	describe('created_at prop', () => {
		const faker = Category.fake().aCategory();

		it('should throw an error when any `with` method is called', () => {
			const fakerCategory = Category.fake().aCategory();
			expect(() => fakerCategory.created_at).toThrow(
				new Error("Property created_at not have a factory, use 'with' methods")
			);
		});

		it('should be undefined', () => {
			expect(faker['_created_at']).toBeUndefined();
		});

		test('withCreatedAt', () => {
			const date = new Date();
			const $this = faker.withCreatedAt(date);
			expect($this).toBeInstanceOf(CategoryFakeBuilder);
			expect(faker['_created_at']).toBe(date);

			faker.withCreatedAt(() => date);
			// @ts-expect-error _created_at is callable
			expect(faker['_created_at']()).toBe(date);
			expect(faker.created_at).toBe(date);
		});

		it('should pass index to created_at factory', () => {
			const date = new Date();
			faker.withCreatedAt((index) => new Date(date.getTime() + index + 2));
			const category = faker.build();
			expect(category.created_at.getTime()).toBe(date.getTime() + 2);

			const fakerMany = CategoryFakeBuilder.theCategories(2);
			fakerMany.withCreatedAt((index) => new Date(date.getTime() + index + 2));
			const categories = fakerMany.build();

			expect(categories[0].created_at.getTime()).toBe(date.getTime() + 2);
			expect(categories[1].created_at.getTime()).toBe(date.getTime() + 3);
		});
	});

	it('should create a category', () => {
		const faker = CategoryFakeBuilder.aCategory();
		let category = faker.build();

		expect(category.category_id).toBeInstanceOf(Uuid);
		expect(typeof category.name === 'string').toBeTruthy();
		expect(typeof category.description === 'string').toBeTruthy();
		expect(category.is_active).toBe(true);
		expect(category.created_at).toBeInstanceOf(Date);

		const created_at = new Date();
		const category_id = new Uuid();
		category = faker
			.withUuid(category_id)
			.withName('name test')
			.withDescription('description test')
			.deactivate()
			.withCreatedAt(created_at)
			.build();

		expect(category.category_id.id).toBe(category_id.id);
		expect(category.name).toBe('name test');
		expect(category.description).toBe('description test');
		expect(category.is_active).toBe(false);
		expect(category.created_at).toBe(created_at);
	});

	it('should create many categories', () => {
		const faker = CategoryFakeBuilder.theCategories(2);
		let categories = faker.build();

		categories.forEach((category) => {
			expect(category.category_id).toBeInstanceOf(Uuid);
			expect(typeof category.name === 'string').toBeTruthy();
			expect(typeof category.description === 'string').toBeTruthy();
			expect(category.is_active).toBe(true);
			expect(category.created_at).toBeInstanceOf(Date);
		});

		const created_at = new Date();
		const category_id = new Uuid();
		categories = faker
			.withUuid(category_id)
			.withName('name test')
			.withDescription('description test')
			.deactivate()
			.withCreatedAt(created_at)
			.build();

		categories.forEach((category) => {
			expect(category.category_id.id).toBe(category_id.id);
			expect(category.name).toBe('name test');
			expect(category.description).toBe('description test');
			expect(category.is_active).toBe(false);
			expect(category.created_at).toBe(created_at);
		});
	});
});