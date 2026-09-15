import {Either} from "@core/@shared/domain/either";
import {NotFoundError} from "@core/@shared/domain/errors/not_found.error";
import {ICastMemberRepository} from "@core/cast_member/domain/cast_member.repository";
import {CastMember, CastMemberId} from "@core/cast_member/domain/cast_member.aggregate";

export class CastMembersIdExistsInDatabaseValidator {
	constructor(private castMemberRepo: ICastMemberRepository) {}

	async validate(cast_members_id: string[]): Promise<Either<CastMemberId[], NotFoundError[]>> {
		const castMemberIds = cast_members_id.map(id => new CastMemberId(id));

		const existsResult = await this.castMemberRepo.existsById(castMemberIds);

		return existsResult.not_exists.length > 0
			? Either.fail(existsResult.not_exists.map(c => new NotFoundError(c.id, CastMember)))
			: Either.ok(castMemberIds);
	}
}