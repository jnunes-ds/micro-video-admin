import {IUseCase} from "@/@shared/application/usecase.interface";
import {Category} from "@/category/domain/category.entity";
import {ICategoryRepository} from "@/category/domain/category.repository";

export class CreatecategoryUsecase
	implements IUseCase<CreateCategoryInput, CreateCategoryOutput> {

	constructor(private readonly categoryRepository: ICategoryRepository) {}

	async execute(input: CreateCategoryInput): Promise<CreateCategoryOutput> {
		const entity = Category.create(input);

		this.categoryRepository.insert(entity);

		return {
			id: entity.category_id.id,
			name: entity.name,
			description: entity.description,
			is_active: entity.is_active,
			created_at: entity.created_at,
		}
	}
}

export type CreateCategoryInput = {
	name: string;
	description?: string | null;
	is_active?: boolean;
}

export type CreateCategoryOutput = {
	id: string;
	name: string;
	description?: string | null;
	is_active?: boolean;
	created_at: Date;
}