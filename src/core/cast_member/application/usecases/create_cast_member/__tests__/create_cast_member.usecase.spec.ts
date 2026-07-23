import {
	CreatecastMemberUsecase
} from "@core/cast_member/application/usecases/create_cast_member/create_cast_member.usecase";
import {CastMemberInMemoryRepository} from "@core/cast_member/infra/db/in_memory/cast_member_in_memory.repository";
import {CastMemberType, CastMemberTypes} from "@core/cast_member/domain/cast-member-type.vo";


describe('CreateCastMemberUsecase Unit Tests', () => {
	let usecase: CreatecastMemberUsecase;
	let repository: CastMemberInMemoryRepository;

	beforeEach(() => {
		repository = new CastMemberInMemoryRepository();
		usecase = new CreatecastMemberUsecase(repository);
	});

	it('should create a category', async () => {
		const spyInsert = jest.spyOn(repository, 'insert');
		let output = await usecase.execute({name: 'test', type: CastMemberType.create(CastMemberTypes.ACTOR)});
		expect(spyInsert).toHaveBeenCalledTimes(1);
		expect(output).toStrictEqual({
			id: repository.items[0].cast_member_id.id,
			name: 'test',
			type: new CastMemberType(CastMemberTypes.ACTOR),
			created_at: repository.items[0].created_at,
		});

		output = await usecase.execute({
			name: 'test',
			type: CastMemberType.create(CastMemberTypes.DIRECTOR)
		});

		expect(spyInsert).toHaveBeenCalledTimes(2);
		expect(output).toStrictEqual({
			id: repository.items[1].cast_member_id.id,
			name: 'test',
			type: new CastMemberType(CastMemberTypes.DIRECTOR),
			created_at: repository.items[1].created_at,
		});
	});
});