import {Uuid} from "@core/@shared/domain/value_objects/uuid.vo";
import {AggregateRoot} from "@core/@shared/domain/aggregate_root";
import {CastMemberType} from "@core/cast_member/domain/cast-member-type.vo";
import {CastMemberFakeBuilder} from "@core/cast_member/domain/cast_member_fake_builder";
import CastMemberValidatorFactory from "@core/cast_member/domain/validators/cast_member.validator";
import {EntityId} from "@core/@shared/domain/entity";

export type CastMemberConstructorProps = {
	cast_member_id?: CastMemberId;
	name: string;
	type:CastMemberType;
	created_at?: Date;
}

export type CastMemberProperties = {
	name: string;
	type: CastMemberType;
	created_at?: Date;
};


export type CastMemberCreateCommand = {
	name: string;
	type: CastMemberType;
}

export class CastMemberId extends EntityId {}

export class CastMember extends AggregateRoot {
	cast_member_id: CastMemberId;
	name: string;
	type: CastMemberType;
	created_at: Date;

	constructor(props: CastMemberConstructorProps) {
		super();
		this.cast_member_id = props.cast_member_id ?? new CastMemberId();
		this.name = props.name;
		this.type = props.type;
		this.created_at = props.created_at ?? new Date();
	}

	static create(props: CastMemberCreateCommand) {
		const castMember = new CastMember(props);
		castMember.validate(['name']);
		return castMember;
	}

	changeName(name: string): void {
		this.name = name;
		this.validate(['name']);
	}

	changeType(type: CastMemberType): void {
		this.type = type;
	}

	validate(fields?: string[]) {
		const validator = CastMemberValidatorFactory.create();
		return validator.validate(this.notification, this, fields ?? []);
	}

	static fake() {
		return CastMemberFakeBuilder;
	}

	get entity_id() {
		return this.cast_member_id;
	}

	toJSON() {
		return {
			cast_member_id: this.cast_member_id.id,
			name: this.name,
			type: this.type.type,
			created_at: this.created_at,
		}
	}
}