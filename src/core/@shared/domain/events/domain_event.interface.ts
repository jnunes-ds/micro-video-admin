import {ValueObject} from "@core/@shared/domain/value_object";

export interface IDomainEvent {
	aggregate_id: ValueObject;
	occurred_on: Date;
	event_version: number;
}