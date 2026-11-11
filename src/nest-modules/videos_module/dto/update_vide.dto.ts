import {OmitType} from "@nestjs/mapped-types";
import {UpdateVideoInput} from "@core/video/application/usecases/update_video/update_video.input";

export class UpdateVideoInputWithoutId extends OmitType(UpdateVideoInput, ['id']) {}

export class UpdateVideoDto extends UpdateVideoInputWithoutId {}