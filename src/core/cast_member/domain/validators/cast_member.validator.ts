import {
	IsDate,
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
	IsInstance,
} from "class-validator";
import {CastMemberType} from "@core/cast_member/domain/cast-member-type.vo";
import {ClassValidatorFields} from "@core/@shared/domain/validators/class_validator_fields";
import {CastMemberProperties} from "@core/cast_member/domain/cast_member.aggregate";
import {Notification} from "@core/@shared/domain/validators/notification";

export class CastMemberRules {
	@MaxLength(255, { groups: ['name'] })
	@IsString({ groups: ['name'] })
	@IsNotEmpty({ groups: ['name'] })
	name: string;

	@IsInstance(CastMemberType, { groups: ['type'] })
	@IsNotEmpty({ groups: ['type'] })
	type: CastMemberType;

	@IsDate({ groups: ['created_at'] })
	@IsOptional({ groups: ['created_at'] })
	created_at: Date;

	constructor({ name, type, created_at }: CastMemberProperties) {
		Object.assign(this, { name, type, created_at });
	}
}

export class CastMemberValidator extends ClassValidatorFields<CastMemberRules> {
	validate(notification: Notification, data: any, fields: string[]): boolean {
		const newFields = fields?.length ? fields : ['name', 'type', 'created_at'];
		return super.validate(notification, new CastMemberRules(data), newFields);
	}
}

export class CastMemberValidatorFactory {
	static create() {
		return new CastMemberValidator();
	}
}

export default CastMemberValidatorFactory;
