import {IUseCase} from "@core/@shared/application/usecase.interface";
import {IVideoRepository} from "@core/video/domain/video.repository";
import {ICategoryRepository} from "@core/category/domain/category.repository";
import {IGenreRepository} from "@core/genre/domain/genre.repository";
import {VideoOutput, VideoOutputMapper} from "@core/video/application/get_video/get_video.output";
import {Video, VideoId} from "@core/video/domain/video.aggregate";
import {NotFoundError} from "@core/@shared/domain/errors/not_found.error";
import {ICastMemberRepository} from "@core/cast_member/domain/cast_member.repository";

export class GetVideoUsecase
	implements IUseCase<GetVideoInput, GetVideoOutput>
{
	constructor(
		private videoRepo: IVideoRepository,
		private categoryRepo: ICategoryRepository,
		private genreRepo: IGenreRepository,
		private castMemberRepo: ICastMemberRepository
	) {}

	async execute(input: GetVideoInput): Promise<GetVideoOutput> {
		const videoId = new VideoId(input.id);
		const video = await this.videoRepo.findById(videoId);

		if (!video) throw new NotFoundError(input.id, Video);

		const genres = await this.genreRepo.findByIds(
			Array.from(video.genres_id.values()),
		);

		const allCategoriesOfVideoAndGenre = await this.categoryRepo.findByIds(
			Array.from(video.categories_id.values()).concat(
				genres.flatMap(g => Array.from(g.categories_id.values()))
			)
		);

		const castMembers = await this.castMemberRepo.findByIds(
			Array.from(video.cast_members_id.values())
		);

		return VideoOutputMapper.toOutput({
			video,
			genres,
			allCategoriesOfVideoAndGenre,
			cast_members: castMembers
		});
	}
}

export type GetVideoInput = { id: string; };
export type GetVideoOutput = VideoOutput;
