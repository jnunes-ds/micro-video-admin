import {IUseCase} from "@core/@shared/application/usecase.interface";
import {NotFoundError} from "@core/@shared/domain/errors/not_found.error";
import {CategoryOutput} from "@core/category/application/usecases/common/category_output";
import {EntityValidationError} from "@core/@shared/domain/validators/validation.error";
import {
	UpdateCastMemberInput
} from "@core/cast_member/application/usecases/update_cast_member/update_cast_member.input";
import {
	CastMemberOutput,
	CastMemberOutputMapper
} from "@core/cast_member/application/usecases/common/cast_member_output";
import {CastMember, CastMemberId} from "@core/cast_member/domain/cast_member.aggregate";
import {CastMemberType} from "@core/cast_member/domain/cast-member-type.vo";
import {ICastMemberRepository} from "@core/cast_member/domain/cast_member.repository";

type UpdateCastMemberOutput = CastMemberOutput;

export class UpdateCastMemberUsecase
	implements IUseCase<UpdateCastMemberInput, UpdateCastMemberOutput>{
	constructor(private castMemberRepository: ICastMemberRepository) {}

	async execute(input: UpdateCastMemberInput): Promise<UpdateCastMemberOutput> {
		const castMemberId = new CastMemberId(input.cast_member_id);
		const castMember = await this.castMemberRepository.findById(castMemberId);

		if (!castMember) {
			throw new NotFoundError(input.cast_member_id, CastMember);
		}

		if (input.name) castMember.changeName(input.name);
		if (input.type) castMember.changeType(new CastMemberType(input.type));

		if (castMember.notification.hasErrors()) {
			throw new EntityValidationError(castMember.notification.toJSON());
		}

		await this.castMemberRepository.update(castMember);

		return CastMemberOutputMapper.toOutput(castMember);
	}
}

export type UpdateCategoryOutput = CategoryOutput;