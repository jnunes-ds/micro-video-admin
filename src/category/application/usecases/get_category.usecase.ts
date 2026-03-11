import {IUseCase} from "@/@shared/application/usecase.interface";
import {ICategoryRepository} from "@/category/domain/category.repository";
import {Uuid} from "@/@shared/domain/value_objects/uuid.vo";
import {NotFoundError} from "@/@shared/domain/errors/not_found.error";
import {Category} from "@/category/domain/category.entity";
import {CategoryOutput, CategoryOutputMapper} from "@/category/application/usecases/common/category_output";

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