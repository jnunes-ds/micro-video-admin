import {IUseCase} from "@core/@shared/application/usecase.interface";
import {CreateCategoryInput} from "@core/category/application/usecases/create_category/create_category.input";
import {ICategoryRepository} from "@core/category/domain/category.repository";
import {Category} from "@core/category/domain/category.entity";
import {CategoryOutput, CategoryOutputMapper} from "@core/category/application/usecases/common/category_output";
import {EntityValidationError} from "@core/@shared/domain/validators/validation.error";

export class CreatecategoryUsecase
	implements IUseCase<CreateCategoryInput, CreateCategoryOutput> {

	constructor(private readonly categoryRepository: ICategoryRepository) {}

	async execute(input: CreateCategoryInput): Promise<CreateCategoryOutput> {
		const entity = Category.create(input);

		if (entity.notification.hasErrors()) {
			throw new EntityValidationError(entity.notification.toJSON());
		}

		this.categoryRepository.insert(entity);

		return CategoryOutputMapper.toOutput(entity);
	}
}

export type CreateCategoryOutput = CategoryOutput;