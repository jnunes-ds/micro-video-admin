import {Category} from "../category.entity";
import {Uuid} from "@/@shared/domain/value_objects/uuid.vo";

describe('Category Unit Tests', () => {

	it('should change name', () => {
		const category = Category.fake().aCategory().build();
		category.changeName('Series');
		expect(category.name).toBe('Series');
	});

	it('should change description', () => {
		const category = Category.fake().aCategory().build()

		category.changeDescription('Documentary');
		expect(category.description).toBe('Documentary');
	});

	it('should activate the category', () => {
		const category = Category.fake().aCategory().build()

		category.activate();
		expect(category.is_active).toBeTruthy();
	});

	it('should deactivate the category ', () => {
		const category = Category.fake().aCategory().build()

		expect(category.is_active).toBeTruthy();
		category.deactivate();
		expect(category.is_active).toBeFalsy();
	});

	it('should returns all category info with a JSON format', () => {
		const created_at = new Date();
		const category = Category.fake().aCategory()
			.withName('Movie')
			.withDescription('Movie description')
			.deactivate()
			.withCreatedAt(created_at)
			.build();

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
			const category = Category.fake().aCategory().withUuid(category_id).build();
			expect(category.category_id).toBeInstanceOf(Uuid);
		});
	});

	describe('Constructor', () => {
		it('should create a category with default values', () => {
			const category = Category.fake()
				.aCategory()
				.withName('Movie')
				.withDescription(null)
				.build();

			expect(category.category_id).toBeInstanceOf(Uuid);
			expect(category.name).toBe('Movie');
			expect(category.description).toBeNull();
			expect(category.is_active).toBeTruthy();
			expect(category.created_at).toBeInstanceOf(Date);
		});

		it('should create a cetegory with description', () => {
			const category = Category.fake()
				.aCategory()
				.withName('Movie')
				.withDescription('Movie description')
				.build();

			expect(category.category_id).toBeInstanceOf(Uuid);
			expect(category.name).toBe('Movie');
			expect(category.description).toBe('Movie description');
			expect(category.is_active).toBeTruthy();
			expect(category.created_at).toBeInstanceOf(Date);
		});

		it('should create a category with active property true', () => {
			const category = Category.fake()
				.aCategory()
				.withName('Movie')
				.withDescription(null)
				.activate()
				.build();

			expect(category.category_id).toBeInstanceOf(Uuid);
			expect(category.name).toBe('Movie');
			expect(category.description).toBeNull();
			expect(category.is_active).toBeTruthy();
			expect(category.created_at).toBeInstanceOf(Date);
		});

		it('should create a category with active property false', () => {
			const category = Category.fake()
				.aCategory()
				.withName('Movie')
				.withDescription(null)
				.deactivate()
				.build();

			expect(category.category_id).toBeInstanceOf(Uuid);
			expect(category.name).toBe('Movie');
			expect(category.description).toBeNull();
			expect(category.is_active).toBeFalsy();
			expect(category.created_at).toBeInstanceOf(Date);
		});

		it('should create a category with specific created_at info', () => {
			const created_at = new Date();
			const category = Category.fake()
				.aCategory()
				.withName('Movie')
				.withDescription(null)
				.activate()
				.withCreatedAt(created_at)
				.build();

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
			const category = Category.fake()
				.aCategory()
				.withName('Movie')
				.withDescription(null)
				.activate()
				.build();

			expect(category.category_id).toBeInstanceOf(Uuid);
			expect(category.name).toBe('Movie');
			expect(category.description).toBeNull();
			expect(category.is_active).toBeTruthy();
			expect(category.created_at).toBeInstanceOf(Date);
		});

		it('should create a cetegory with description', () => {
			const category = Category.fake()
				.aCategory()
				.withName('Movie')
				.withDescription('Movie description')
				.activate()
				.build();

			expect(category.category_id).toBeInstanceOf(Uuid);
			expect(category.name).toBe('Movie');
			expect(category.description).toBe('Movie description');
			expect(category.is_active).toBeTruthy();
			expect(category.created_at).toBeInstanceOf(Date);
		});

		it('should create a category with active property true', () => {
			const category = Category.fake()
				.aCategory()
				.withName('Movie')
				.withDescription(null)
				.activate()
				.build();

			expect(category.category_id).toBeInstanceOf(Uuid);
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
			expect(category.category_id).toBeInstanceOf(Uuid);
			expect(category.name).toBe('Movie');
			expect(category.description).toBeNull();
			expect(category.is_active).toBeFalsy();
			expect(category.created_at).toBeInstanceOf(Date);
		});
	});
});

describe('Category Validator', () => {
		it('should have errors if name is invalid', () => {
			const category = Category.create({name: "t".repeat(256)});

			expect(category.notification.hasErrors()).toBe(true);
		});
	});

	// METHODS
	describe('Methods', () => {
		it('should print an errors if changeName method receives an is invalid argument', () => {
			const category = Category.create({ name: 'Movie' });
			category.changeName('t'.repeat(256));

			expect(category.notification.hasErrors()).toBe(true);
		});
});