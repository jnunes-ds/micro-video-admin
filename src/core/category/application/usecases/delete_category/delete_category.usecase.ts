import {IUseCase} from "@core/@shared/application/usecase.interface";
import {ICategoryRepository} from "@core/category/domain/category.repository";
import {NotFoundError} from "@core/@shared/domain/errors/not_found.error";
import {Category, CategoryId} from "@core/category/domain/category.aggregate";


export class DeleteCategoryUsecase
	implements IUseCase<DeleteCategoryUsecaseInput, DeleteCategoryUsecaseOutput>
{
	constructor(private readonly categoryRepository: ICategoryRepository) {}

	async execute(input: DeleteCategoryUsecaseInput): Promise<DeleteCategoryUsecaseOutput> {
		const entityId = new CategoryId(input.id);
		const entity = await this.categoryRepository.findById(entityId);

		if (!entity) {
			throw new NotFoundError(input.id, Category);
		}

		await this.categoryRepository.delete(entityId)
	}

}

export type DeleteCategoryUsecaseInput = {
	id: string;
}

export type DeleteCategoryUsecaseOutput = void;