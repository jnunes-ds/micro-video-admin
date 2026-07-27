import {setupSequelize} from "@core/@shared/infra/testing/helpers";
import {
	CreateCastMemberUsecase
} from "@core/cast_member/application/usecases/create_cast_member/create_cast_member.usecase";
import {CastMemberSequelizeRepository} from "@core/cast_member/infra/db/sequelize/cast_member-sequelize.repository";
import {CastMemberModel} from "@core/cast_member/infra/db/sequelize/cast_member.model";
import {
	CreateCastMemberInput
} from "@core/cast_member/application/usecases/create_cast_member/create_cast_member.input";
import {CastMemberTypes} from "@core/cast_member/domain/cast-member-type.vo";
import {CastMemberId} from "@core/cast_member/domain/cast_member.aggregate";


describe('CreateCastMemberUsecase Integration Tests', () => {
	let usecase: CreateCastMemberUsecase;
	let repository: CastMemberSequelizeRepository;

	setupSequelize({models: [CastMemberModel]});

	beforeEach(() => {
		repository = new CastMemberSequelizeRepository(CastMemberModel);
		usecase = new CreateCastMemberUsecase(repository);
	});

	it('should create a cast member', async () => {
		let input: CreateCastMemberInput = {name: 'test', type: CastMemberTypes.ACTOR};
		let output = await usecase.execute(input);
		let entity = await repository.findById(new CastMemberId(output.cast_member_id));

		expect(output).toStrictEqual({
			cast_member_id: entity?.cast_member_id.id,
			name: 'test',
			type: CastMemberTypes.ACTOR,
			created_at: entity?.created_at,
		});

		input = {name: 'test2', type: CastMemberTypes.ACTOR}
		output = await usecase.execute(input);
		entity = await repository.findById(new CastMemberId(output.cast_member_id));
		expect(output).toStrictEqual({
			cast_member_id: entity?.cast_member_id.id,
			name: 'test2',
			type: CastMemberTypes.ACTOR,
			created_at: entity?.created_at,
		})
	});
});