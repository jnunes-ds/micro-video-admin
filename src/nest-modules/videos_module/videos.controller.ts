import {
	BadRequestException,
	Body,
	Controller,
	Get,
	HttpStatus,
	Inject,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	UploadedFiles, UseInterceptors,
	ValidationPipe
} from '@nestjs/common';
import {CreateVideoUsecase} from "@core/video/application/usecases/create_video/create_video.usecase";
import {UpdateVideoUsecase} from "@core/video/application/usecases/update_video/update_video.usecase";
import {
	UploadAudioVideoMediasUsecase
} from "@core/video/application/usecases/upload_audio_video_medias/upload_audio_video_medias.usecase";
import {GetVideoUsecase} from "@core/video/application/usecases/get_video/get_video.usecase";
import {CreateVideoDto} from "@/nest-modules/videos_module/dto/create_video.dto";
import {UpdateVideoDto} from "@/nest-modules/videos_module/dto/update_vide.dto";
import {UpdateVideoInput} from "@core/video/application/usecases/update_video/update_video.input";
import {FileFieldsInterceptor} from "@nestjs/platform-express";
import {UploadAudioVideoMediaInput} from "@core/video/application/usecases/upload_audio_video_medias/audio_video_media.input";

//TODO - Adicionar VideoPresenter

@Controller('videos')
export class VideosController {
	@Inject(CreateVideoUsecase)
	private createUsecase: CreateVideoUsecase;

	@Inject(UpdateVideoUsecase)
	private updateUsecase: UpdateVideoUsecase;

	@Inject(UploadAudioVideoMediasUsecase)
	private uploadAudioVideoMedia: UploadAudioVideoMediasUsecase;

	@Inject(GetVideoUsecase)
	private getUsecase: GetVideoUsecase;

	@Post()
	async create(@Body() createVideoDto: CreateVideoDto) {
		const {id} = await this.createUsecase.execute(createVideoDto);
		//VideoPresenter
		return await this.getUsecase.execute({id});
	}

	@Get(':id')
	async findOne(
		@Param('id', new ParseUUIDPipe({errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY})) id: string
	) {
		//VideoPresenter
		return await this.getUsecase.execute({id});
	}

	@Patch(':id')
	@UseInterceptors(FileFieldsInterceptor([
		{name: 'banner', maxCount: 1},
		{name: 'thumbnail', maxCount: 1},
		{name: 'thumbnail_half', maxCount: 1},
		{name: 'trailer', maxCount: 1},
		{name: 'video', maxCount: 1},
	]))
	async update(
		@Param('id', new ParseUUIDPipe({errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY})) id: string,
		@Body() updateVideoDto: any,
		@UploadedFiles() files: {
			banner?: Express.Multer.File[],
			thumbnail?: Express.Multer.File[],
			thumbnail_half?: Express.Multer.File[],
			trailer?: Express.Multer.File[],
			video?: Express.Multer.File[],
		}
	) {
		const hasFiles: boolean = Object.keys(files).length > 0;
		const hasData: boolean = Object.keys(updateVideoDto).length > 0;

		if (hasFiles && hasData) {
			throw new BadRequestException("Files and data cannot be sent together.");
		}

		if (hasData) {
			const data = await new ValidationPipe({errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY})
				.transform(updateVideoDto, {
					metatype: UpdateVideoDto,
					type: 'body',
				});
			const input  = new UpdateVideoInput({id, ...data});
			const {id: newId} = await this.updateUsecase.execute(input);
			return await this.getUsecase.execute({id: newId});
		}

		const hasMoreThanOneFile: boolean = Object.keys(files).length > 1;

		if (hasMoreThanOneFile) {
			throw new BadRequestException('Only one file can be sent');
		}

		const hasAudioVideoMedia =
			(files?.trailer && files.trailer?.length > 0 ||
			files?.video && files.video?.length > 0) || false;
		const fileField = Object.keys(files)[0];
		const file = files[fileField][0];

		if (hasAudioVideoMedia) {
			const dto: UploadAudioVideoMediaInput = {
				video_id: id,
				field: fileField as any,
				file: {
					raw_name: file.originalname,
					data: file.buffer,
					mime_type: file.mimetype,
					size: file.size
				}
			}
			const input = await new ValidationPipe({errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY})
				.transform(dto, {
					metatype: UploadAudioVideoMediaInput,
					type: 'body',
				});

			await this.uploadAudioVideoMedia.execute(input);
		} else {

		}
		return await this.getUsecase.execute({id});
	}

}