import {Entity} from "@core/@shared/domain/entity";
import {IDomainEvent} from "@core/@shared/domain/events/domain_event.interface";

export abstract class AggregateRoot extends Entity {
	// Vai disparar o evento dentro do próprio agregado
	applyEvent(event: IDomainEvent) {}

	registerHandler(event: string, handler: (event: IDomainEvent) => void) {}
}