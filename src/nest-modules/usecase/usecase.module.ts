import {Global, Module, Scope} from '@nestjs/common';
import {ApplicationService} from "@core/@shared/application/application.service";
import {IUnitOfWork} from "@core/@shared/domain/repository/unit_of_work.interface";
import {DomainEventMediator} from "@core/@shared/domain/events/domain_event_mediator";

@Global()
@Module({
	providers: [
		{
			provide: ApplicationService,
			useFactory: (
				uow: IUnitOfWork,
				domainEventMediator: DomainEventMediator
			) => new ApplicationService(uow, domainEventMediator),
			inject: ['UnitOfWork', DomainEventMediator],
			scope: Scope.REQUEST
		},
	],
	exports: [ApplicationService]
})
export class UsecaseModule {}
