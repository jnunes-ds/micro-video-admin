import {IUseCase} from "@core/@shared/application/usecase.interface";
import {ICategoryRepository} from "@core/category/domain/category.repository";
import {NotFoundError} from "@core/@shared/domain/errors/not_found.error";
import {Category, CastMemberId} from "@core/category/domain/category.aggregate";
import {CastMember} from "@core/cast_member/domain/cast_member.aggregate";


export class DeleteCategoryUsecase
	implements IUseCase<DeleteCategoryUsecaseInput, DeleteCategoryUsecaseOutput>
{
	constructor(private readonly categoryRepository: ICategoryRepository) {}

	async execute(input: DeleteCategoryUsecaseInput): Promise<DeleteCategoryUsecaseOutput> {
		const entityId = new CastMemberId(input.id);
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