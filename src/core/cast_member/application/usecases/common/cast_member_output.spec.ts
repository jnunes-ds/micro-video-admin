import {CastMember} from "@core/cast_member/domain/cast_member.aggregate";
import {CastMemberOutputMapper} from "@core/cast_member/application/usecases/common/cast_member_output";
import {CastMemberTypes} from "@core/cast_member/domain/cast-member-type.vo";


describe('CategoryOutputMapper Unit Tests', () => {
	it('should convert a category in output', () => {
		const entity = CastMember.fake()
			.anActor()
			.withName("test")
			.build()

		const spyToJSON = jest.spyOn(entity, 'toJSON');
		const output = CastMemberOutputMapper.toOutput(entity);
		expect(spyToJSON).toHaveBeenCalled();
		expect(output).toStrictEqual({
			cast_member_id: entity.cast_member_id.id,
			name: entity.name,
			type: CastMemberTypes.ACTOR,
			created_at: entity.created_at,
		});
	});
});