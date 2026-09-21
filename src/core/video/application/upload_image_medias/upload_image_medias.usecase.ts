import {IUseCase} from "@core/@shared/application/usecase.interface";
import {Fields, UploadImageMediasInput} from "@core/video/application/upload_image_medias/upload_image_medias.input";
import {Video, VideoId} from "@core/video/domain/video.aggregate";
import {NotFoundError} from "@core/@shared/domain/errors/not_found.error";
import {IVideoRepository} from "@core/video/domain/video.repository";
import {Banner} from "@core/video/domain/banner.vo";
import {Thumbnail} from "@core/video/domain/thumbnail.vo";
import {ThumbnailHalf} from "@core/video/domain/thumbnail_half.vo";
import {EntityValidationError} from "@core/@shared/domain/validators/validation.error";
import {IUnitOfWork} from "@core/@shared/domain/repository/unit_of_work.interface";
import {IStorage} from "@core/@shared/application/storage.interface";

export class UploadImageMediasUsecase
	implements IUseCase<UploadImageMediasInput, UploadImageMediasOutput>
{

	constructor(
		private uow: IUnitOfWork,
		private videoRepo: IVideoRepository,
		private storage: IStorage
	) {}


	async execute(input: UploadImageMediasInput): Promise<UploadImageMediasOutput> {
			const videoId = new VideoId(input.video_id);
			const video = await this.videoRepo.findById(videoId);

			if (!video) throw new NotFoundError(input.video_id, Video);

			const imagesMap: ImagesMap = {
				banner: Banner,
				thumbnail: Thumbnail,
				thumbnail_half: ThumbnailHalf
			};

			const [image, errorImage] = imagesMap[input.field].createFromFile({
				...input.file,
				video_id: videoId
			}).asArray();

			if (errorImage) throw new EntityValidationError([{ [input.field]: [errorImage.message] }]);

			image instanceof Banner && video.replaceBanner(image);
			image instanceof Thumbnail && video.replaceThumbnail(image);
			image instanceof ThumbnailHalf && video.replaceThumbnailHalf(image);

			await this.storage.store({
				data: input.file.data,
				mime_type: input.file.mime_type,
				id: image.url,
			});

			await this.uow.do(async () => {
				await this.videoRepo.update(video);
			});

	}
}

export type UploadImageMediasOutput = void;

type ImagesMap = {
	[Field in Fields]: typeof Banner | typeof Thumbnail | typeof ThumbnailHalf;
}