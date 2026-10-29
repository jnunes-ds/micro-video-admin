import {
	ListCastMembersUsecase
} from "@core/cast_member/application/usecases/list_cast_members/list_cast_members.usecase";
import {CastMemberInMemoryRepository} from "@core/cast_member/infra/db/in_memory/cast_member_in_memory.repository";
import {CastMemberSearchResult} from "@core/cast_member/domain/cast_member.repository";
import {CastMember} from "@core/cast_member/domain/cast_member.aggregate";
import {CastMemberOutputMapper} from "@core/cast_member/application/usecases/common/cast_member_output";


describe('ListCastMembersUsecase Unit Tests', () => {
	let usecase: ListCastMembersUsecase;
	let repository: CastMemberInMemoryRepository;

	beforeEach(() => {
		repository = new CastMemberInMemoryRepository();
		usecase = new ListCastMembersUsecase(repository);
	});

	test('toOutput method', () => {
		let result = new CastMemberSearchResult({
			items: [],
			total: 1,
			current_page: 1,
			per_page: 2,
		});
		let output = usecase['toOutput'](result);
		expect(output).toStrictEqual({
			items: [],
			total: 1,
			current_page: 1,
			per_page: 2,
			last_page: 1
		});

		const entity = CastMember.fake()
			.anActor()
			.withName('Esse menino')
			.build();

		result = new CastMemberSearchResult({
			items: [entity],
			total: 1,
			current_page: 1,
			per_page: 2
		});

		output = usecase['toOutput'](result);
		expect(output).toStrictEqual({
			items: [
				{
					cast_member_id: entity.cast_member_id.id,
					name: entity.name,
					type: entity.type.type,
					created_at: entity.created_at,
				}
			],
			total: 1,
			current_page: 1,
			per_page:2,
			last_page: 1
		})
	});

	it('should return output sorted by created_at when input param is empty', async () => {
		const items = CastMember.fake()
			.theActors(2)
			.withName(index => `name ${index + 1}`)
			.withCreatedAt(index => new Date(new Date().getTime() + (index + 1) * 1000))
			.build();

		repository.items = items;

		const output = await usecase.execute({per_page: 2});

		expect(output).toStrictEqual({
			items: [...items].reverse().map(CastMemberOutputMapper.toOutput),
			total: 2,
			current_page: 1,
			per_page: 2,
			last_page: 1
		});
	});
});