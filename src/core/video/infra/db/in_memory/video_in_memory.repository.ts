import {InMemorySearchableRepository} from "@core/@shared/infra/db/in_memory/in_memory.repository";
import {Video, VideoId} from "@core/video/domain/video.aggregate";
import {IVideoRepository, VideoFilter} from "@core/video/domain/video.repository";

export class VideoInMemoryRepository
	extends InMemorySearchableRepository<Video, VideoId, VideoFilter>
	implements IVideoRepository
{
	sortableFields: string[] = ['title', 'created_at'];

	getEntity(): { new(...args: any[]): Video } {
		return Video;
	}

	protected async applyFilter(
		items:Video[],
		filter:VideoFilter | null
	): Promise<Video[]> {
		if (!filter) return items;

		return items.filter(i => {
			const containsTitle = filter.title &&
				i.title.toLocaleLowerCase().includes(filter.title.toLocaleLowerCase());
			const containsCategoriesId = filter.categories_id
				?.some(c => i.categories_id.has(c.id));
			const containsGenresId = filter.genres_id
				?.some(g => i.genres_id.has(g.id));
			const containsCastMembersId = filter.cast_members_id
				?.some(c => i.cast_members_id.has(c.id));

			const filterMap = [
				[filter.title, containsTitle],
				[filter.categories_id, containsCategoriesId],
				[filter.genres_id, containsGenresId],
				[filter.cast_members_id, containsCastMembersId]
			].filter(i => i[0]);

			return filterMap.every(i => i[1]);
		});
	}
}