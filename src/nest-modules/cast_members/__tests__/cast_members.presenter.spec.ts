import {
	CastMemberCollectionPresenter,
	CastMemberPresenter
} from '@/nest-modules/cast_members/cast_members.presenter';
import {CastMemberTypes} from '@core/cast_member/domain/cast-member-type.vo';
import {instanceToPlain} from 'class-transformer';

describe('CastMembersPresenter Unit Tests', () => {
	test('CastMemberPresenter', () => {
		const date = new Date();
		const presenter = new CastMemberPresenter({
			cast_member_id: 'Some-Id',
			name: 'Some Name',
			type: CastMemberTypes.ACTOR,
			created_at: date,
		});

		const presenterPlain: CastMemberPresenter = instanceToPlain(presenter) as CastMemberPresenter;

		expect(presenterPlain.cast_member_id).toBe('Some-Id');
		expect(presenterPlain.name).toBe('Some Name');
		expect(presenterPlain.type).toBe(CastMemberTypes.ACTOR);
		expect(presenterPlain.created_at).not.toBe(date);
		expect(presenterPlain.created_at).toBe(date.toISOString());
	});

	test('CastMemberCollectionPresenter', () => {
		const date = new Date();
		const presenterOne = new CastMemberPresenter({
			cast_member_id: 'Some-Id',
			name: 'Some Name',
			type: CastMemberTypes.ACTOR,
			created_at: date,
		});
		const presenterTwo = new CastMemberPresenter({
			cast_member_id: 'Other-Id',
			name: 'Other Name',
			type: CastMemberTypes.DIRECTOR,
			created_at: date,
		});

		const collectionPresenter = new CastMemberCollectionPresenter({
			items: [presenterOne, presenterTwo],
			current_page: 1,
			per_page: 2,
			last_page: 1,
			total: 2
		});

		expect(collectionPresenter.data[0]).toBeInstanceOf(CastMemberPresenter);
		expect(collectionPresenter.data[1]).toBeInstanceOf(CastMemberPresenter);

		const presenterPlain = instanceToPlain(collectionPresenter);

		expect(presenterPlain).toStrictEqual({
			data: [
				{
					cast_member_id: 'Some-Id',
					name: 'Some Name',
					type: CastMemberTypes.ACTOR,
					created_at: date.toISOString(),
				},
				{
					cast_member_id: 'Other-Id',
					name: 'Other Name',
					type: CastMemberTypes.DIRECTOR,
					created_at: date.toISOString(),
				},
			],
			meta: {
				current_page: 1,
				per_page: 2,
				last_page: 1,
				total: 2,
			},
		});
	});
});
