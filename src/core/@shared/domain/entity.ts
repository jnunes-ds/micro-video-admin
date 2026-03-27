import {ValueObject} from "@core/@shared/domain/value_object";
import {Notification} from "@core/@shared/domain/validators/notification";


export abstract class Entity {
	notification: Notification = new Notification();

	 abstract get entity_id(): ValueObject;
	 abstract toJSON(): any;
}