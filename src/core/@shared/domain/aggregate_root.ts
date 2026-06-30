import {Notification} from "@core/@shared/domain/validators/notification";
import {ValueObject} from "@core/@shared/domain/value_object";

export abstract class AggregateRoot {
	notification: Notification = new Notification();

	abstract get aggregate_root_id(): ValueObject;
	abstract toJSON(): any;
}