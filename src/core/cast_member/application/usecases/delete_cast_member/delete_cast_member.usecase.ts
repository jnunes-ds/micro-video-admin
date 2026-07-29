import {IUseCase} from "@core/@shared/application/usecase.interface";
import {NotFoundError} from "@core/@shared/domain/errors/not_found.error";
import {ICastMemberRepository} from "@core/cast_member/domain/cast_member.repository";
import {CastMember, CastMemberId} from "@core/cast_member/domain/cast_member.aggregate";


export class DeleteCastMemberUsecase
	implements IUseCase<DeleteCastMemberUsecaseInput, DeleteCastMemberUsecaseOutput>
{
	constructor(private readonly castMemberRepository: ICastMemberRepository) {}

	async execute(input: DeleteCastMemberUsecaseInput): Promise<DeleteCastMemberUsecaseOutput> {
		const entityId = new CastMemberId(input.id);
		const entity = await this.castMemberRepository.findById(entityId);

		if (!entity) {
			throw new NotFoundError(input.id, CastMember);
		}

		await this.castMemberRepository.delete(entityId)
	}

}

export type DeleteCastMemberUsecaseInput = {
	id: string;
}

export type DeleteCastMemberUsecaseOutput = void;