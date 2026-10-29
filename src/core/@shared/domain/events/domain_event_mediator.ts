import {EventEmitter2} from "eventemitter2";
import {AggregateRoot} from "@core/@shared/domain/aggregate_root";

export class DomainEventMediator {
	constructor(private eventEmitter: EventEmitter2) {}

	register(event: string, handler: any) {
		this.eventEmitter.on(event, handler);
	}

	async publish(aggregateRoot: AggregateRoot) {
		for (const event of aggregateRoot.getUndispatchedEvents()) {
			const eventClassName = event.constructor.name;
			aggregateRoot.markEventAsDispatched(event);
			await this.eventEmitter.emitAsync(eventClassName, event);
		}
	}
}