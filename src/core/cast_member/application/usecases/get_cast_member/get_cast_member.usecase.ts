import {IUseCase} from "@core/@shared/application/usecase.interface";
import {NotFoundError} from "@core/@shared/domain/errors/not_found.error";
import {ICastMemberRepository} from "@core/cast_member/domain/cast_member.repository";
import {CastMember, CastMemberId} from "@core/cast_member/domain/cast_member.aggregate";
import {CastMemberModelMapper} from "@core/cast_member/infra/db/sequelize/cast_member-sequelize.repository";
import {CastMemberOutput} from "@core/cast_member/application/usecases/common/cast_member_output";


export class GetCastMemberUsecase
	implements IUseCase<GetCastMemberUsecaseInput, GetCastMemberUsecaseOutput>
{
	constructor(private readonly castMemberRepository: ICastMemberRepository) {}

	async execute(input: GetCastMemberUsecaseInput): Promise<GetCastMemberUsecaseOutput> {
		const entityId = new CastMemberId(input.id);
		const entity = await this.castMemberRepository.findById(entityId);

		if (!entity) {
			throw new NotFoundError(input.id, CastMember);
		}

		return CastMemberModelMapper.toOutput(entity);
	}

}

export type GetCastMemberUsecaseInput = {
	id: string;
}

export type GetCastMemberUsecaseOutput = CastMemberOutput;