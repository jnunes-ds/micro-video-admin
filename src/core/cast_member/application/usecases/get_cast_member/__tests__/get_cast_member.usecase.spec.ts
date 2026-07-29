import {InvalidUuidError} from "@core/@shared/domain/value_objects/uuid.vo";
import {NotFoundError} from "@core/@shared/domain/errors/not_found.error";
import {
	GetCastMemberUsecase
} from "@core/cast_member/application/usecases/get_cast_member/get_cast_member.usecase";
import {CastMemberInMemoryRepository} from "@core/cast_member/infra/db/in_memory/cast_member_in_memory.repository";
import {CastMember, CastMemberId} from "@core/cast_member/domain/cast_member.aggregate";


describe('GetCastMemberUsecase Unit Tests', () => {
	let usecase: GetCastMemberUsecase;
	let repository: CastMemberInMemoryRepository;

	beforeEach(() => {
		repository = new CastMemberInMemoryRepository();
		usecase = new GetCastMemberUsecase(repository);
	});

	it('should throws an error when entity is not found', async () => {
		await expect(
			() => usecase.execute({id: 'fake id'})
		).rejects.toThrow(new InvalidUuidError());

		const castMemberId = new CastMemberId();

		await expect(
			() => usecase.execute({id: castMemberId.id })
		).rejects.toThrow(new NotFoundError(castMemberId, CastMember));
	});

	it('should get a cast member by id', async () => {
		const items = CastMember.fake()
			.theCastMembers(11)
			.withName(index => `name-${index + 1}`)
			.build();
		repository.items = items;

		const spy = jest.spyOn(repository, 'findById');
		const seventhItem = items[6];
		const output = await usecase.execute({id: seventhItem.cast_member_id.id});

		expect(spy).toHaveBeenCalledTimes(1);
		expect(output).toStrictEqual({
			cast_member_id: seventhItem.cast_member_id.id,
			name: 'name-7',
			type: seventhItem.type.type,
			created_at: seventhItem.created_at,
		});
	});
});
