import {AggregateRoot} from "@core/@shared/domain/aggregate_root";
import {Uuid} from "@core/@shared/domain/value_objects/uuid.vo";
import {IDomainEvent} from "@core/@shared/domain/events/domain_event.interface";

class StubEvent implements IDomainEvent {
	occurred_on: Date;
	event_version: number;

	constructor(public aggregate_id: Uuid, public name: string) {
		this.occurred_on = new Date();
		this.event_version = 2;
	}
}

class StubAggregateRoot extends AggregateRoot {
	aggregate_id: Uuid;
	name: string;
	field1: string;

	constructor(name: string, id: Uuid) {
		super();
		this.aggregate_id = id;
		this.name = name;
		this.registerHandler(StubEvent.name, this.onStubEvent.bind(this))
	}

	operation() {
		this.name = this.name.toUpperCase();
		this.applyEvent(new StubEvent(this.aggregate_id, this.name));
	}

	onStubEvent(event: StubEvent) {
		this.field1 = event.name;
	}

	registerHandler(event: string, handler: (event: IDomainEvent) => void) {
		super.registerHandler(event, handler);
	}

	toJSON(): any {
		return {
			aggregate_id: this.aggregate_id,
			name: this.name,
			field1: this.field1
		}
	}

	get entity_id(): Uuid {
		return this.aggregate_id;
	}
}

describe('AggregateRoot Unit Tests', () => {
	it('should dispatch events', () => {
		const id = new Uuid();
		const aggregate = new StubAggregateRoot('test name', id);
		aggregate.operation();
		expect(aggregate.field1).toBe('TEST NAME');
	});
});