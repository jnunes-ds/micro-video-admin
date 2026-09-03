import {ValueObject} from "@core/@shared/domain/value_object";
import {Notification} from "@core/@shared/domain/validators/notification";
import {Uuid} from "@core/@shared/domain/value_objects/uuid.vo";


export abstract class Entity {
	notification: Notification = new Notification();

	 abstract get entity_id(): ValueObject;
	 abstract toJSON(): any;
}

export class EntityId extends Uuid {}