import {setupSequelize} from "@core/@shared/infra/testing/helpers";
import {NotFoundError} from "@core/@shared/domain/errors/not_found.error";
import {
	DeleteCastMemberUsecase
} from "@core/cast_member/application/usecases/delete_cast_member/delete_cast_member.usecase";
import {CastMemberSequelizeRepository} from "@core/cast_member/infra/db/sequelize/cast_member-sequelize.repository";
import {CastMemberModel} from "@core/cast_member/infra/db/sequelize/cast_member.model";
import {CastMember, CastMemberId} from "@core/cast_member/domain/cast_member.aggregate";


describe('DeleteCastMemberUsecase Integration Tests', () => {
	let usecase: DeleteCastMemberUsecase;
	let repository: CastMemberSequelizeRepository;

	setupSequelize({ models: [CastMemberModel] })

	beforeEach(() => {
		repository = new CastMemberSequelizeRepository(CastMemberModel);
		usecase = new DeleteCastMemberUsecase(repository);
	});

	test('if throws an error when entity is not found', async () => {
		const castMemberId = new CastMemberId();

		await expect(
			() => usecase.execute({id: castMemberId.id })
		).rejects.toThrow(new NotFoundError(castMemberId, CastMember));
	});

	test('delete cast member', async () => {
		const castMember = CastMember.fake().anActor().build();
		await repository.insert(castMember);
		await usecase.execute({ id: castMember.cast_member_id.id });

		const noHasModel = await CastMemberModel.findByPk(castMember.cast_member_id.id);
		expect(noHasModel).toBeNull();
	});
});