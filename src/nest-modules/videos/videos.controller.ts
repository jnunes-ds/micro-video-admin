import {
	Body,
	Controller,
	Get,
	HttpStatus,
	Inject,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	UploadedFiles,
	ValidationPipe
} from '@nestjs/common';
import {CreateVideoUsecase} from "@core/video/application/create_video/create_video.usecase";
import {UpdateVideoUsecase} from "@core/video/application/update_video/update_video.usecase";
import {
	UploadAudioVideoMediasUsecase
} from "@core/video/application/upload_audio_video_medias/upload_audio_video_medias.usecase";
import {GetVideoUsecase} from "@core/video/application/get_video/get_video.usecase";
import {CreateVideoDto} from "@/nest-modules/videos/dto/create_video.dto";
import {UpdateVideoDto} from "@/nest-modules/videos/dto/update_vide.dto";
import {UpdateVideoInput} from "@core/video/application/update_video/update_video.input";

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
	async update(
		@Param('id', new ParseUUIDPipe({errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY})) id: string,
		@Body() updateVideoDto: any,
	) {
		const hasData: boolean = Object.keys(updateVideoDto).length > 0;

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
	}

	@Patch(':id/upload')
	async uploadFile(
		@UploadedFiles()
		@Body()
		data: any
	) {}
}