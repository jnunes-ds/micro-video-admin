import {IUseCase} from "@core/@shared/application/usecase.interface";
import {EntityValidationError} from "@core/@shared/domain/validators/validation.error";
import {ICastMemberRepository} from "@core/cast_member/domain/cast_member.repository";
import {CastMember} from "@core/cast_member/domain/cast_member.aggregate";
import {
	CreateCastMemberInput
} from "@core/cast_member/application/usecases/create_cast_member/create_cast_member.input";
import {
	CastMemberOutput,
	CastMemberOutputMapper
} from "@core/cast_member/application/usecases/common/cast_member_output";
import {CastMemberType} from "@core/cast_member/domain/cast-member-type.vo";

export type CreateCastMemberOutput = CastMemberOutput;

export class CreateCastMemberUsecase
	implements IUseCase<CreateCastMemberInput, CreateCastMemberOutput> {

	constructor(private readonly castMemberRepository: ICastMemberRepository) {}

	async execute(input: CreateCastMemberInput): Promise<CreateCastMemberOutput> {
		const [type, errorCastMemberType] = CastMemberType.create(input.type).asArray();
		const entity = CastMember.create({
			...input,
			type
		});

		const notification = entity.notification;

		if (errorCastMemberType) {
			notification.setError(errorCastMemberType.message, 'type');
		}

		if (notification.hasErrors()) {
			throw new EntityValidationError(entity.notification.toJSON());
		}

		await this.castMemberRepository.insert(entity);

		return CastMemberOutputMapper.toOutput(entity);
	}
}
