import {IUseCase} from "@/@shared/application/usecase.interface";
import {Category} from "@/category/domain/category.entity";
import {ICategoryRepository} from "@/category/domain/category.repository";
import {CategoryOutput, CategoryOutputMapper} from "@/category/application/usecases/common/category_output";

export class CreatecategoryUsecase
	implements IUseCase<CreateCategoryInput, CreateCategoryOutput> {

	constructor(private readonly categoryRepository: ICategoryRepository) {}

	async execute(input: CreateCategoryInput): Promise<CreateCategoryOutput> {
		const entity = Category.create(input);

		this.categoryRepository.insert(entity);

		return CategoryOutputMapper.toOutput(entity);
	}
}

export type CreateCategoryInput = {
	name: string;
	description?: string | null;
	is_active?: boolean;
}

export type CreateCategoryOutput = CategoryOutput