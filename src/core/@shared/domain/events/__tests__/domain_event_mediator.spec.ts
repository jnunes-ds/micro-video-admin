import {AggregateRoot} from "@core/@shared/domain/aggregate_root";
import {ValueObject} from "@core/@shared/domain/value_object";
import {EntityId} from "@core/@shared/domain/entity";
import {DomainEventMediator} from "@core/@shared/domain/events/domain_event_mediator";
import {EventEmitter2} from "eventemitter2";
import {IDomainEvent} from "@core/@shared/domain/events/domain_event.interface";

class StubEvent implements IDomainEvent {
	occurred_on: Date;
	event_version: number;

	constructor(
		public aggregate_id: EntityId,
		public name: string
	) {
		this.occurred_on = new Date();
		this.event_version = 1;
	}
}

class StubAggregate extends AggregateRoot {
	id: EntityId;
	name: string;

	get entity_id(): ValueObject {
		return this.id;
	}

	action(name: string) {
		this.name = name;
		this.applyEvent(new StubEvent(this.id, this.name))
	}

	toJSON() {
		return {
			id: this.id.id,
			name: this.name
		}
	}
}

describe('DomainEventMediator Unit Tests', () => {
	let mediator: DomainEventMediator;

	beforeEach(() => {
		const eventEmitter = new EventEmitter2();
		mediator = new DomainEventMediator(eventEmitter);
	});

	it('should register handler', async () => {
		expect.assertions(1);
		mediator.register(StubEvent.name, (event: StubEvent) => {
			expect(event.name).toBe('test');
		});

		const aggregate = new StubAggregate();
		aggregate.action('test');
		await mediator.publish(aggregate);
	});
});