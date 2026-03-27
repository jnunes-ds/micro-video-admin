import {IUseCase} from "@/@shared/application/usecase.interface";
import {ICategoryRepository} from "@/category/domain/category.repository";
import {Uuid} from "@/@shared/domain/value_objects/uuid.vo";
import {NotFoundError} from "@/@shared/domain/errors/not_found.error";
import {Category} from "@/category/domain/category.entity";

export class DeleteCategoryUsecase
	implements IUseCase<DeleteCategoryUsecaseInput, DeleteCategoryUsecaseOutput>
{
	constructor(private readonly categoryRepository: ICategoryRepository) {}

	async execute(input: DeleteCategoryUsecaseInput): Promise<DeleteCategoryUsecaseOutput> {
		const entityId = new Uuid(input.id);
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