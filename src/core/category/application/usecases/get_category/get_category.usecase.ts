import {IUseCase} from "@core/@shared/application/usecase.interface";
import {ICategoryRepository} from "@core/category/domain/category.repository";
import {Uuid} from "@core/@shared/domain/value_objects/uuid.vo";
import {NotFoundError} from "@core/@shared/domain/errors/not_found.error";
import {Category} from "@core/category/domain/category.entity";
import {CategoryOutput, CategoryOutputMapper} from "@core/category/application/usecases/common/category_output";


export class GetCategoryUsecase
	implements IUseCase<GetCategoryInput, GetCategoryOutput> {
	constructor(private readonly repository: ICategoryRepository) {}

	async execute(input: GetCategoryInput): Promise<GetCategoryOutput> {
		const category = await this.repository.findById(new Uuid(input.id));

		if (!category) {
			throw new NotFoundError(input.id, Category);
		}

		return CategoryOutputMapper.toOutput(category);
	}
}

export type GetCategoryInput = {
	id: string;
};

export type GetCategoryOutput = CategoryOutput;