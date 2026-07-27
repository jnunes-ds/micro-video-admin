import {InvalidUuidError} from "@core/@shared/domain/value_objects/uuid.vo";
import {NotFoundError} from "@core/@shared/domain/errors/not_found.error";
import {
	DeleteCastMemberUsecase
} from "@core/cast_member/application/usecases/delete_cast_member/delete_cast_member.usecase";
import {CastMemberInMemoryRepository} from "@core/cast_member/infra/db/in_memory/cast_member_in_memory.repository";
import {CastMember, CastMemberId} from "@core/cast_member/domain/cast_member.aggregate";


describe('DeleteCastMemberUsecase Unit Tests', () => {
	let usecase: DeleteCastMemberUsecase;
	let repository: CastMemberInMemoryRepository;

	beforeEach(() => {
		repository = new CastMemberInMemoryRepository();
		usecase = new DeleteCastMemberUsecase(repository);
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

	it('should delete a cast member', async () => {
		const items = [
			CastMember.fake().anActor().build()
		];
		repository.items = items;

		const spy = jest.spyOn(repository, 'delete');
		await usecase.execute({id: items[0].cast_member_id.id});

		expect(spy).toHaveBeenCalledTimes(1);
		expect(repository.items).toHaveLength(0);
	});
});