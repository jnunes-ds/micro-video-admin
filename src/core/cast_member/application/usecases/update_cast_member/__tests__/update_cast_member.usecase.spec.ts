import {InvalidUuidError} from "@core/@shared/domain/value_objects/uuid.vo";
import {NotFoundError} from "@core/@shared/domain/errors/not_found.error";
import {
	UpdateCastMemberUsecase
} from "@core/cast_member/application/usecases/update_cast_member/update_cast_member.usecase";
import {CastMemberInMemoryRepository} from "@core/cast_member/infra/db/in_memory/cast_member_in_memory.repository";
import {CastMemberTypes} from "@core/cast_member/domain/cast-member-type.vo";
import {CastMember, CastMemberId} from "@core/cast_member/domain/cast_member.aggregate";


describe('UpdateCastMemberUsecase Unit Tests', () => {
	let usecase: UpdateCastMemberUsecase;
	let repository: CastMemberInMemoryRepository;

	beforeEach(() => {
		repository = new CastMemberInMemoryRepository();
		usecase = new UpdateCastMemberUsecase(repository);
	});

	it('should throws an error when entity is not found', async () => {
		await expect(
			() => usecase.execute({cast_member_id: 'fake id', name: 'fake', type: CastMemberTypes.ACTOR})
		).rejects.toThrow(new InvalidUuidError());

		const castMemberId = new CastMemberId();

		await expect(
			() => usecase.execute({cast_member_id: castMemberId.id, name: 'fake', type: CastMemberTypes.DIRECTOR})
		).rejects.toThrow(new NotFoundError(castMemberId, CastMember));
	});

	it('should update a cast member', async () => {
		const spyUpdate = jest.spyOn(repository, 'update');
		const entity = CastMember.fake()
			.anActor()
			.withName('Poul')
			.build();
		repository.items = [entity];

		let output = await usecase.execute({
			cast_member_id: entity.cast_member_id.id,
			name: 'test'
		});

		expect(spyUpdate).toHaveBeenCalledTimes(1);
		expect(output).toStrictEqual({
			cast_member_id: entity.cast_member_id.id,
			name: 'test',
			type: CastMemberTypes.ACTOR,
			created_at: entity.created_at,
		});

		type Arrange = {
			input: {
				cast_member_id: string;
				name?: string;
				type?: CastMemberTypes;
			};
			expected: {
				cast_member_id: string;
				name: string;
				type: CastMemberTypes;
				created_at: Date;
			}
		};

		const arrange: Arrange[] = [
			{
				input: {
					cast_member_id: entity.cast_member_id.id,
					name: 'test',
					type: CastMemberTypes.ACTOR
				},
				expected: {
					cast_member_id: entity.cast_member_id.id,
					name: 'test',
					type: CastMemberTypes.ACTOR,
					created_at: entity.created_at,
				}
			},
			{
				input: {
					cast_member_id: entity.cast_member_id.id,
					name: 'test',
					type: CastMemberTypes.DIRECTOR
				},
				expected: {
					cast_member_id: entity.cast_member_id.id,
					name: 'test',
					type: CastMemberTypes.DIRECTOR,
					created_at: entity.created_at,
				}
			},
			{
				input: {
					cast_member_id: entity.cast_member_id.id,
					name: 'test',
					type: CastMemberTypes.ACTOR
				},
				expected: {
					cast_member_id: entity.cast_member_id.id,
					name: 'test',
					type: CastMemberTypes.ACTOR,
					created_at: entity.created_at,
				}
			},
			{
				input: {
					cast_member_id: entity.cast_member_id.id,
					name: 'test',
				},
				expected: {
					cast_member_id: entity.cast_member_id.id,
					name: 'test',
					type: CastMemberTypes.ACTOR,
					created_at: entity.created_at,
				}
			}
		];

		for (const i of arrange) {
			output = await usecase.execute({
				cast_member_id: i.input.cast_member_id,
				...("name" in i.input && { name: i.input.name }),
				...("type" in i.input && { type: i.input.type })
			});

			expect(output).toStrictEqual({
				cast_member_id: i.expected.cast_member_id,
				name: i.expected.name,
				type: i.expected.type,
				created_at: i.expected.created_at,
			});
		}
	});
});