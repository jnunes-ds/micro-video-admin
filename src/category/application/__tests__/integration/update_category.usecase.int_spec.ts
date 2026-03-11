import {UpdateCategoryUseCase} from "@/category/application/update_category.usecase";
import {Uuid} from "@/@shared/domain/value_objects/uuid.vo";
import {NotFoundError} from "@/@shared/domain/errors/not_found.error";
import {Category} from "@/category/domain/category.entity";
import {CategorySequelizeRepository} from "@/category/infra/db/sequelize/category-sequelize.repository";
import {CategoryModel} from "@/category/infra/db/sequelize/category.model";
import {setupSequelize} from "@/@shared/infra/testing/helpers";

describe('UpdateCategoryUsecase Integration Tests', () => {
	let usecase: UpdateCategoryUseCase;
	let repository: CategorySequelizeRepository;

	setupSequelize({models: [CategoryModel]});

	beforeEach(() => {
		repository = new CategorySequelizeRepository(CategoryModel);
		usecase = new UpdateCategoryUseCase(repository);
	});

	it('should throws an error when entity is not found', async () => {
		const uuid = new Uuid();

		await expect(
			() => usecase.execute({id: uuid.id, name: 'fake'})
		).rejects.toThrow(new NotFoundError(uuid, Category));
	});

	it('should update a category', async () => {
		const spyUpdate = jest.spyOn(repository, 'update');
		const entity = Category.fake()
			.aCategory()
			.withName('Movie')
			.withDescription(null)
			.build();
		repository.insert(entity);

		let output = await usecase.execute({
			id: entity.category_id.id,
			name: 'test'
		});

		expect(spyUpdate).toHaveBeenCalledTimes(1);
		expect(output).toStrictEqual({
			id: entity.category_id.id,
			name: 'test',
			description: null,
			is_active: true,
			created_at: entity.created_at,
		});

		type Arrange = {
			input: {
				id: string;
				name: string;
				description?: string | null;
				is_active?: boolean;
			};
			expected: {
				id: string;
				name: string;
				description: string | null;
				is_active: boolean;
				created_at: Date;
			}
		};

		const arrange: Arrange[] = [
			{
				input: {
					id: entity.category_id.id,
					name: 'test',
					description: 'some description'
				},
				expected: {
					id: entity.category_id.id,
					name: 'test',
					description: 'some description',
					is_active: true,
					created_at: entity.created_at,
				}
			},
			{
				input: {
					id: entity.category_id.id,
					name: 'test',
					is_active: false
				},
				expected: {
					id: entity.category_id.id,
					name: 'test',
					description: 'some description',
					is_active: false,
					created_at: entity.created_at,
				}
			},
			{
				input: {
					id: entity.category_id.id,
					name: 'test',
				},
				expected: {
					id: entity.category_id.id,
					name: 'test',
					description: 'some description',
					is_active: false,
					created_at: entity.created_at,
				}
			},
			{
				input: {
					id: entity.category_id.id,
					name: 'test',
					is_active: true
				},
				expected: {
					id: entity.category_id.id,
					name: 'test',
					description: 'some description',
					is_active: true,
					created_at: entity.created_at,
				}
			}
		];

		for (const i of arrange) {
			output = await usecase.execute({
				id: i.input.id,
				...("name" in i.input && { name: i.input.name }),
				...("description" in i.input && { description: i.input.description }),
				...("is_active" in i.input && { is_active: i.input.is_active }),
			});
			const entityUpdated = await repository.findById(new Uuid(i.input.id));
			expect(output).toStrictEqual({
				id: i.expected.id,
				name: i.expected.name,
				description: i.expected.description,
				is_active: i.expected.is_active,
				created_at: entityUpdated.created_at,
			});

			expect(entityUpdated.toJSON()).toStrictEqual({
				category_id: entity.category_id.id,
				name: i.expected.name,
				description: i.expected.description,
				is_active: i.expected.is_active,
				created_at: entityUpdated.created_at,
			});
		}
	});
});