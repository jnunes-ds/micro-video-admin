import {IUseCase} from "@core/@shared/application/usecase.interface";
import {CreateCategoryInput} from "@core/category/application/usecases/create_category/create_category.input";
import {Category} from "@core/category/domain/category.aggregate";
import {CategoryOutput, CategoryOutputMapper} from "@core/category/application/usecases/common/category_output";
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

export type CreateCastMemberOutput = CastMemberOutput;

export class CreatecastMemberUsecase
	implements IUseCase<CreateCastMemberInput, CreateCastMemberOutput> {

	constructor(private readonly categoryRepository: ICastMemberRepository) {}

	async execute(input: CreateCastMemberInput): Promise<CreateCastMemberOutput> {
		const entity = CastMember.create(input);

		if (entity.notification.hasErrors()) {
			throw new EntityValidationError(entity.notification.toJSON());
		}

		await this.categoryRepository.insert(entity);

		return CastMemberOutputMapper.toOutput(entity);
	}
}
