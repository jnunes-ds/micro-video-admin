import {IUseCase} from "@core/@shared/application/usecase.interface";
import {ICategoryRepository} from "@core/category/domain/category.repository";
import {NotFoundError} from "@core/@shared/domain/errors/not_found.error";
import {Category, CastMemberId} from "@core/category/domain/category.aggregate";
import {CategoryOutput, CategoryOutputMapper} from "@core/category/application/usecases/common/category_output";


export class GetCategoryUsecase
	implements IUseCase<GetCategoryInput, GetCategoryOutput> {
	constructor(private readonly repository: ICategoryRepository) {}

	async execute(input: GetCategoryInput): Promise<GetCategoryOutput> {
		const categoryId = new CastMemberId(input.id);
		const category = await this.repository.findById(categoryId);

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