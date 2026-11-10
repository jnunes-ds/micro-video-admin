import {Global, Module} from "@nestjs/common";
import {EventEmitterModule} from '@nestjs/event-emitter';
import {DomainEventMediator} from "@core/@shared/domain/events/domain_event_mediator";
import {EventEmitter2} from "eventemitter2";

@Global()
@Module({
	imports: [EventEmitterModule.forRoot()],
	providers: [
		{
			provide: DomainEventMediator,
			useFactory: (eventEmitter: EventEmitter2) => {
				return new DomainEventMediator(eventEmitter)
			},
			inject: [EventEmitter2]
		},
	],
	exports: [DomainEventMediator]
})
export class EventModule {}