import {UpdateCategoryUseCase} from "@/category/application/usecases/update_category/update_category.usecase";
import {CategoryInMemoryRepository} from "@/category/infra/db/in_memory/category_in_memory.repository";
import {InvalidUuidError, Uuid} from "@/@shared/domain/value_objects/uuid.vo";
import {NotFoundError} from "@/@shared/domain/errors/not_found.error";
import {Category} from "@/category/domain/category.entity";

describe('UpdateCategoryUsecase Unit Tests', () => {
	let usecase: UpdateCategoryUseCase;
	let repository: CategoryInMemoryRepository;

	beforeEach(() => {
		repository = new CategoryInMemoryRepository();
		usecase = new UpdateCategoryUseCase(repository);
	});

	it('should throws an error when entity is not found', async () => {
		await expect(
			() => usecase.execute({id: 'fake id', name: 'fake'})
		).rejects.toThrow(new InvalidUuidError());

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
		repository.items = [entity];

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

			expect(output).toStrictEqual({
				id: i.expected.id,
				name: i.expected.name,
				description: i.expected.description,
				is_active: i.expected.is_active,
				created_at: i.expected.created_at,
			});
		}
	});
});