import {Global, Module} from '@nestjs/common';
import {ConfigService} from "@nestjs/config";
import {GoogleCloudStorage} from "@core/@shared/infra/storage/google_cloud.storage";
import {Storage as GoogleCloudStorageSdk} from "@google-cloud/storage";
import {DomainEventMediator} from "@core/@shared/domain/events/domain_event_mediator";
import {EventEmitter2} from 'eventemitter2';
import {ApplicationService} from "@core/@shared/application/application.service";
import {IUnitOfWork} from "@core/@shared/domain/repository/unit_of_work.interface";
import {Scope} from "@nestjs/common";

@Global()
@Module({
	providers: [
		{
			provide: 'IStorage',
			useFactory: (configService: ConfigService) => {
				const credentials = configService.get('GOOGLE_CLOUD_CREDENTIALS');
				const bucket =  configService.get('GOOGLE_CLOUD_STORAGE_BUCKET_NAME');
				const storage = new GoogleCloudStorageSdk({
					credentials
				});
				return new GoogleCloudStorage(storage, bucket);
			},
			inject: [ConfigService]
		},
		{
			provide: DomainEventMediator,
			useValue: new DomainEventMediator(new EventEmitter2())
		},
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
	exports: ['IStorage', ApplicationService]
})
export class SharedModule {}
