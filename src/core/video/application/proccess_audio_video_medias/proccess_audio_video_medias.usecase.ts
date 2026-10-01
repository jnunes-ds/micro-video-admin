import {IUseCase} from "@core/@shared/application/usecase.interface";
import {Video, VideoId} from "@core/video/domain/video.aggregate";
import {NotFoundError} from "@core/@shared/domain/errors/not_found.error";
import {IUnitOfWork} from "@core/@shared/domain/repository/unit_of_work.interface";
import {IVideoRepository} from "@core/video/domain/video.repository";
import {
	ProcessAudioVideoMediaInput
} from "@core/video/application/proccess_audio_video_medias/proccess_audio_video_media.input";
import {AudioVideoMediaStatus} from "@core/@shared/domain/value_objects/audio_video_media.vo";

export class ProcessAudioVideoMediasUsecase
	implements IUseCase<ProcessAudioVideoMediaInput, ProcessAudioVideoMediaOutput>
{

	constructor(
		private uow: IUnitOfWork,
		private videoRepo: IVideoRepository,
	) {}

	async execute(input: ProcessAudioVideoMediaInput): Promise<ProcessAudioVideoMediaOutput> {
		const videoId = new VideoId(input.video_id);
		const video = await this.videoRepo.findById(videoId);
		if (!video) {
			throw new NotFoundError(input.video_id, Video);
		}

		if (input.field === 'trailer') {
			if (!video.trailer) {
				throw new Error('Trailer not found');
			}

			video.trailer = input.status === AudioVideoMediaStatus.COMPLETED
				? video.trailer?.complete(input.encoded_location)
				: video.trailer?.fail();
		}

		if (input.field === 'video') {
			if (!video.video) {
				throw new Error('Video not found');
			}

			video.video = input.status === AudioVideoMediaStatus.COMPLETED
				? video.video?.complete(input.encoded_location)
				: video.video?.fail();
		}

		await this.uow.do(async () => {
			await this.videoRepo.update(video);
		});
	}
}

export type ProcessAudioVideoMediaOutput = void;