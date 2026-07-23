import {InMemorySearchableRepository} from "@core/@shared/infra/db/in_memory/in_memory.repository";
import {CastMember, CastMemberId} from "@core/cast_member/domain/cast_member.aggregate";
import {CastMemberFilter} from "@core/cast_member/domain/cast_member.repository";

export class CastMemberInMemoryRepository
	extends InMemorySearchableRepository<CastMember, CastMemberId, CastMemberFilter>
 {
	sortableFields: string[] = ['name', 'created_at'];

	getEntity(): new(...args: any[]) => CastMember {
		return CastMember;
	}

	public async applyFilter(
		items: CastMember[],
		filter: CastMemberFilter
	): Promise<CastMember[]> {
		if (!filter) {
			return items;
		}

		return items.filter((i) => {
			const containsName =
				filter.name && i.name.toLowerCase().includes(filter.name.toLowerCase());
			const hasType = filter.type && i.type.equals(filter.type);
			return filter.name && filter.type
				? containsName && hasType
				: filter.name
				? containsName
					: hasType;
		});
	}
}