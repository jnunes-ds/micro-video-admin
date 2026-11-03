import {Controller, Inject, Post, Body, Get, Param, ParseUUIDPipe, Patch, UploadedFiles} from '@nestjs/common';
import {CreateVideoUsecase} from "@core/video/application/create_video/create_video.usecase";
import {UpdateVideoUsecase} from "@core/video/application/update_video/update_video.usecase";
import {
	UploadAudioVideoMediasUsecase
} from "@core/video/application/upload_audio_video_medias/upload_audio_video_medias.usecase";
import {GetVideoUsecase} from "@core/video/application/get_video/get_video.usecase";
import {CreateVideoDto} from "@/nest-modules/videos/dto/create_video.dto";
import {UpdateVideoDto} from "@/nest-modules/videos/dto/update_vide.dto";

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
		return await this.getUsecase.execute({id});
	}

	@Get(':id')
	async findOne(
		@Param('id', new ParseUUIDPipe({errorHttpStatusCode: 422})) id: string
	) {
		return await this.getUsecase.execute({id});
	}

	@Patch(':id')
	async update(
		@Param('id', new ParseUUIDPipe({errorHttpStatusCode: 422})) id: string,
		@Body() updateVideoDto: UpdateVideoDto
	) {}

	@Patch(':id/upload')
	async uploadFile(
		@UploadedFiles()
		@Body()
		data: any
	) {}
}