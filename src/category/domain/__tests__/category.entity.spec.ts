import {Category} from "../category.entity";
import {jest} from "@jest/globals";
import {Uuid} from "@/@shared/domain/value_objects/uuid.vo";

describe('Category Unit Tests', () => {
	let validateSpy: any;
	beforeEach(() => {
		validateSpy = jest.spyOn(Category, 'validate');
	});
	it('should change name', () => {
		const category = new Category({
			name: 'Movie'
		});
		category.changeName('Series');
		expect(category.name).toBe('Series');
	});

	it('should change description', () => {
		const category = new Category({
			name: 'Movie',
			description: 'Movie description'
		});

		category.changeDescription('Documentary');
		expect(category.description).toBe('Documentary');
	});

	it('should activate the category', () => {
		const category = new Category({
			name: 'Movie'
		});

		category.activate();
		expect(category.is_active).toBeTruthy();
	});

	it('should deactivate the category ', () => {
		const category = new Category({
			name: 'Movie',
			is_active: true
		});

		expect(category.is_active).toBeTruthy();
		category.deactivate();
		expect(category.is_active).toBeFalsy();
	});

	it('should returns all category info with a JSON format', () => {
		const created_at = new Date();
		const category = new Category({
			name: 'Movie',
			description: 'Movie description',
			is_active: false,
			created_at
		});
		expect(category.toJSON()).toStrictEqual({
			category_id: category.category_id.id,
			name: 'Movie',
			description: 'Movie description',
			is_active: false,
			created_at
		})
	});

	describe('category_id field', () => {
		const arrange: {category_id: Uuid}[] = [{category_id: null as never}, {category_id: undefined as never}, {category_id: new Uuid()}];
		test.each(arrange)('id = %j', ({category_id}) => {
			const category = new Category({
				name: 'Movie',
				category_id
			});
			expect(category.category_id).toBeInstanceOf(Uuid);
		});
	});

	describe('Constructor', () => {
		it('should create a category with default values', () => {
			const category = new Category({
				name: 'Movie'
			});
			expect(category.category_id).toBeInstanceOf(Uuid);
			expect(category.name).toBe('Movie');
			expect(category.description).toBeNull();
			expect(category.is_active).toBeTruthy();
			expect(category.created_at).toBeInstanceOf(Date);
		});

		it('should create a cetegory with description', () => {
			const category = new Category({
				name: 'Movie',
				description: 'Movie description'
			});

			expect(category.category_id).toBeInstanceOf(Uuid);
			expect(category.name).toBe('Movie');
			expect(category.description).toBe('Movie description');
			expect(category.is_active).toBeTruthy();
			expect(category.created_at).toBeInstanceOf(Date);
		});

		it('should create a category with active property true', () => {
			const category = new Category({
				name: 'Movie',
				is_active: true
			});
			expect(category.category_id).toBeInstanceOf(Uuid);
			expect(category.name).toBe('Movie');
			expect(category.description).toBeNull();
			expect(category.is_active).toBeTruthy();
			expect(category.created_at).toBeInstanceOf(Date);
		});

		it('should create a category with active property false', () => {
			const category = new Category({
				name: 'Movie',
				is_active: false
			});
			expect(category.category_id).toBeInstanceOf(Uuid);
			expect(category.name).toBe('Movie');
			expect(category.description).toBeNull();
			expect(category.is_active).toBeFalsy();
			expect(category.created_at).toBeInstanceOf(Date);
		});

		it('should create a category with specific created_at info', () => {
			const created_at = new Date();
			const category = new Category({
				name: 'Movie',
				created_at
			});
			expect(category.category_id).toBeInstanceOf(Uuid);
			expect(category.name).toBe('Movie');
			expect(category.description).toBeNull();
			expect(category.is_active).toBeTruthy();
			expect(category.created_at).toBe(created_at);
		});

		it('should create a category with all specific values', () => {
			const created_at = new Date();
			const category = new Category({
				name: 'Movie',
				description: 'Movie description',
				is_active: false,
				created_at
			});
			expect(category.category_id).toBeInstanceOf(Uuid);
			expect(category.name).toBe('Movie');
			expect(category.description).toBe('Movie description');
			expect(category.is_active).toBeFalsy();
			expect(category.created_at).toBe(created_at);
		});
	});

	describe('Create Command', () => {
		it('should create a category', () => {
			const category = Category.create({
				name: 'Movie'
			});

			expect(category.category_id).toBeInstanceOf(Uuid);
			expect(category.name).toBe('Movie');
			expect(category.description).toBeNull();
			expect(category.is_active).toBeTruthy();
			expect(category.created_at).toBeInstanceOf(Date);
			expect(validateSpy).toBeCalledTimes(1);
		});

		it('should create a cetegory with description', () => {
			const category = Category.create({
				name: 'Movie',
				description: 'Movie description'
			});

			expect(category.category_id).toBeInstanceOf(Uuid);
			expect(category.name).toBe('Movie');
			expect(category.description).toBe('Movie description');
			expect(category.is_active).toBeTruthy();
			expect(category.created_at).toBeInstanceOf(Date);
			expect(validateSpy).toBeCalledTimes(1);
		});

		it('should create a category with active property true', () => {
			const category = Category.create({
				name: 'Movie',
				is_active: true
			});
			expect(category.category_id).toBeInstanceOf(Uuid);
			expect(category.name).toBe('Movie');
			expect(category.description).toBeNull();
			expect(category.is_active).toBeTruthy();
			expect(category.created_at).toBeInstanceOf(Date);
			expect(validateSpy).toBeCalledTimes(1);
		});

		it('should create a category with active property false', () => {
			const category = Category.create({
				name: 'Movie',
				is_active: false
			});
			expect(category.category_id).toBeInstanceOf(Uuid);
			expect(category.name).toBe('Movie');
			expect(category.description).toBeNull();
			expect(category.is_active).toBeFalsy();
			expect(category.created_at).toBeInstanceOf(Date);
			expect(validateSpy).toBeCalledTimes(1);
		});
	});
});

describe('Category Validator', () => {
	describe('Create command', () => {
		it('should print an errors if name is invalid', () => {
			expect(() => Category.create({ name: null })).containsErrorMessages({
				name: [
					"name should not be empty",
					"name must be a string",
					"name must be shorter than or equal to 255 characters"
				]
			});
			expect(() => Category.create({ name: '' })).containsErrorMessages({
				name: [
					"name should not be empty",
				]
			});

			expect(() => Category.create({ name: false as any })).containsErrorMessages({
				name: [
					"name must be a string",
					"name must be shorter than or equal to 255 characters"
				]
			});
			expect(() => Category.create({ name: 'n'.repeat(256) })).containsErrorMessages({
				name: [
					"name must be shorter than or equal to 255 characters"
				]
			});
		});

		it('should print an errors if description is invalid', () => {
			expect(() => Category.create({ name: 'Movie', description: 8 as any })).containsErrorMessages({
				description: [
					"description must be a string"
				]
			});
		});

		it('should print an errors if is_active is invalid', () => {
			expect(() => Category.create({ name: 'Movie', is_active: 'false' as any })).containsErrorMessages({
				is_active: [
					"is_active must be a boolean value"
				]
			});
		});
	});

	// METHODS
	describe('Methods', () => {
		it('should print an errors if changeName method receives an is invalid argument', () => {
			const category = Category.create({ name: 'Movie' });
			expect(() => category.changeName(null)).containsErrorMessages({
				name: [
					"name should not be empty",
					"name must be a string",
					"name must be shorter than or equal to 255 characters"
				]
			});
		});

		it('should print an errors if changeDescription method receives an is invalid argument', () => {
			const category = Category.create({ name: 'Movie' });
			expect(() => category.changeDescription(null)).containsErrorMessages({
				description: [
					"name must be a string"
				]
			});
		});
	});
});