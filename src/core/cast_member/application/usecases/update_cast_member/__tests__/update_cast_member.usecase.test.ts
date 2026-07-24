import {setupSequelize} from "@core/@shared/infra/testing/helpers";
import {NotFoundError} from "@core/@shared/domain/errors/not_found.error";
import {
	UpdateCastMemberUsecase
} from "@core/cast_member/application/usecases/update_cast_member/update_cast_member.usecase";
import {CastMemberSequelizeRepository} from "@core/cast_member/infra/db/sequelize/cast_member-sequelize.repository";
import {CastMemberModel} from "@core/cast_member/infra/db/sequelize/cast_member.model";
import {CastMemberTypes} from "@core/cast_member/domain/cast-member-type.vo";
import {CastMember, CastMemberId} from "@core/cast_member/domain/cast_member.aggregate";


describe('UpdateCast<e,erUsecase Integration Tests', () => {
	let usecase: UpdateCastMemberUsecase;
	let repository: CastMemberSequelizeRepository;

	setupSequelize({models: [CastMemberModel]});

	beforeEach(() => {
		repository = new CastMemberSequelizeRepository(CastMemberModel);
		usecase = new UpdateCastMemberUsecase(repository);
	});

	it('should throws an error when entity is not found', async () => {
		const castMemberId = new CastMemberId();

		await expect(
			() => usecase.execute({cast_member_id: castMemberId.id, name: 'fake', type: CastMemberTypes.ACTOR})
		).rejects.toThrow(new NotFoundError(castMemberId, CastMember));
	});

	it('should update a cast member', async () => {
		const spyUpdate = jest.spyOn(repository, 'update');
		const entity = CastMember.fake()
			.anActor()
			.withName("Poul")
			.build()
		repository.insert(entity);

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
					name: 'test2',
				},
				expected: {
					cast_member_id: entity.cast_member_id.id,
					name: 'test2',
					type: entity.type.type,
					created_at: entity.created_at,
				}
			},
			{
				input: {
					cast_member_id: entity.cast_member_id.id,
					name: 'test3',
				},
				expected: {
					cast_member_id: entity.cast_member_id.id,
					name: 'test3',
					type: entity.type.type,
					created_at: entity.created_at,
				}
			},
			{
				input: {
					cast_member_id: entity.cast_member_id.id,
					type: CastMemberTypes.DIRECTOR
				},
				expected: {
					cast_member_id: entity.cast_member_id.id,
					name: 'test3',
					type: CastMemberTypes.DIRECTOR,
					created_at: entity.created_at,
				}
			},
			{
				input: {
					cast_member_id: entity.cast_member_id.id,
					name: 'Poul',
					type: CastMemberTypes.ACTOR
				},
				expected: {
					cast_member_id: entity.cast_member_id.id,
					name: 'Poul',
					type: CastMemberTypes.ACTOR,
					created_at: entity.created_at,
				}
			}
		];

		for (const i of arrange) {
			output = await usecase.execute({
				cast_member_id: i.input.cast_member_id,
				...("name" in i.input && { name: i.input.name }),
				...("type" in i.input && { type: i.input.type }),
			});
			const entityUpdated = await repository.findById(new CastMemberId(i.input.cast_member_id));
			expect(output).toStrictEqual({
				cast_member_id: i.expected.cast_member_id,
				name: i.expected.name,
				type: i.expected.type,
				created_at: entityUpdated.created_at,
			});

			expect(entityUpdated.toJSON()).toStrictEqual({
				cast_member_id: entity.cast_member_id.id,
				name: i.expected.name,
				type: i.expected.type,
				created_at: entityUpdated.created_at,
			});
		}
	});
});
