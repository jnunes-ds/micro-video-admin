import {Entity} from "@core/@shared/domain/entity";
import {IDomainEvent} from "@core/@shared/domain/events/domain_event.interface";
import {EventEmitter2} from "eventemitter2";


export abstract class AggregateRoot extends Entity {
	events: Set<IDomainEvent> =  new Set();
	dispatchedEvents: Set<IDomainEvent> = new Set<IDomainEvent>();
	localMediator = new EventEmitter2();

	// Vai disparar o evento dentro do próprio agregado
	applyEvent(event: IDomainEvent) {
		this.events.add(event);
		this.localMediator.emit(event.constructor.name, event);
	}

	registerHandler(event: string, handler: (event: IDomainEvent) => void) {
		this.localMediator.on(event, handler);
	}

	markEventAsDispatched(event: IDomainEvent) {
		this.dispatchedEvents.add(event);
	}

	getUndispatchedEvents(): IDomainEvent[] {
		return Array.from(this.events).filter(event => !this.dispatchedEvents.has(event));
	}

	clearEvents() {
		this.events.clear();
		this.dispatchedEvents.clear();
	}
}