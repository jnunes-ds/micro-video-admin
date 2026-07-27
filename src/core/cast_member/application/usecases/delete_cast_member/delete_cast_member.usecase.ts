import {IUseCase} from "@core/@shared/application/usecase.interface";
import {NotFoundError} from "@core/@shared/domain/errors/not_found.error";
import {ICastMemberRepository} from "@core/cast_member/domain/cast_member.repository";
import {CastMember, CastMemberId} from "@core/cast_member/domain/cast_member.aggregate";


export class DeleteCastMemberUsecase
	implements IUseCase<DeleteCastMemberUsecaseInput, DeleteCastMemberUsecaseOutput>
{
	constructor(private readonly categoryRepository: ICastMemberRepository) {}

	async execute(input: DeleteCastMemberUsecaseInput): Promise<DeleteCastMemberUsecaseOutput> {
		const entityId = new CastMemberId(input.id);
		const entity = await this.categoryRepository.findById(entityId);

		if (!entity) {
			throw new NotFoundError(input.id, CastMember);
		}

		await this.categoryRepository.delete(entityId)
	}

}

export type DeleteCastMemberUsecaseInput = {
	id: string;
}

export type DeleteCastMemberUsecaseOutput = void;