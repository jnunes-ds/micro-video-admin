import {MaxLength} from "class-validator";
import {Video} from "@core/video/domain/video.aggregate";
import ClassValidatorFields from "@core/@shared/domain/validators/class_validator_fields";
import {Notification} from "@core/@shared/domain/validators/notification";

export class VideoRules {
	@MaxLength(255, { groups: ['title'] })
	title: string;

	constructor(aggregate: Video) {
		Object.assign(this, aggregate);
	}
}

export class VideoValidator extends ClassValidatorFields {
	validate(notification: Notification, data: any, fields?: string[]): boolean {
		const newFields = fields?.length ? fields : ['title'];
		return super.validate(notification, new VideoRules(data), newFields)
	}
}

class VideoValidatorFactory {
	static create() {
		return new VideoValidator();
	}
}

export default VideoValidatorFactory;