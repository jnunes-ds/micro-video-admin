import {Category} from "../category.entity";

describe('Category Unit Tests', () => {
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

	describe('Constructor', () => {
		it('should create a category with default values', () => {
			const category = new Category({
				name: 'Movie'
			});
			expect(category.category_id).toBeUndefined();
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

			expect(category.category_id).toBeUndefined();
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
			expect(category.category_id).toBeUndefined();
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
			expect(category.category_id).toBeUndefined();
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
			expect(category.category_id).toBeUndefined();
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
			expect(category.category_id).toBeUndefined();
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

			expect(category.category_id).toBeUndefined();
			expect(category.name).toBe('Movie');
			expect(category.description).toBeNull();
			expect(category.is_active).toBeTruthy();
			expect(category.created_at).toBeInstanceOf(Date);
		});

		it('should create a cetegory with description', () => {
			const category = Category.create({
				name: 'Movie',
				description: 'Movie description'
			});

			expect(category.category_id).toBeUndefined();
			expect(category.name).toBe('Movie');
			expect(category.description).toBe('Movie description');
			expect(category.is_active).toBeTruthy();
			expect(category.created_at).toBeInstanceOf(Date);
		});

		it('should create a category with active property true', () => {
			const category = Category.create({
				name: 'Movie',
				is_active: true
			});
			expect(category.category_id).toBeUndefined();
			expect(category.name).toBe('Movie');
			expect(category.description).toBeNull();
			expect(category.is_active).toBeTruthy();
			expect(category.created_at).toBeInstanceOf(Date);
		});

		it('should create a category with active property false', () => {
			const category = Category.create({
				name: 'Movie',
				is_active: false
			});
			expect(category.category_id).toBeUndefined();
			expect(category.name).toBe('Movie');
			expect(category.description).toBeNull();
			expect(category.is_active).toBeFalsy();
			expect(category.created_at).toBeInstanceOf(Date);
		});
	});
});