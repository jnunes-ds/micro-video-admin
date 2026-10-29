import {IUnitOfWork} from "@core/@shared/domain/repository/unit_of_work.interface";
import {DomainEventMediator} from "@core/@shared/domain/events/domain_event_mediator";
import {ApplicationService} from "@core/@shared/application/application.service";
import {UnitOfWorkFakeInMemory} from "@core/@shared/infra/db/in_memory/fake_unit_of_work_in_memory";
import {EventEmitter2} from "eventemitter2";
import {AggregateRoot} from "@core/@shared/domain/aggregate_root";
import {ValueObject} from "@core/@shared/domain/value_object";

class StubAggregateRoot extends AggregateRoot {
	get entity_id(): ValueObject {
		throw new Error('methdo not implemeted');
	}

	toJSON(): any {
		throw new Error('methdo not implemeted');
	}
}

describe('Application Service Unit Tests', () => {
	let uow: IUnitOfWork;
	let domainEventediator: DomainEventMediator;
	let applicationService: ApplicationService;

	beforeEach(() => {
		uow = new UnitOfWorkFakeInMemory();
		const eventEmitter = new EventEmitter2();
		domainEventediator = new DomainEventMediator(eventEmitter);
		applicationService = new ApplicationService(uow, domainEventediator);
	});

	describe('start method', () => {
		it('should call the start method of unit of work', async () => {
			const spy = jest.spyOn(uow, 'start');
			await applicationService.start();
			expect(spy).toHaveBeenCalled();
		});

	});

	describe('finish', () => {
			it('should call the publish method of domain event mediator and the commit method', async () => {
					const aggregateRoot = new StubAggregateRoot();
					uow.addAggregateRoot(aggregateRoot);

					const publishSpy = jest.spyOn(domainEventediator, 'publish');
					const commitSpy = jest.spyOn(uow, 'commit');

					await  applicationService.finish();

					expect(publishSpy).toHaveBeenCalled();
					expect(commitSpy).toHaveBeenCalled();
			});
	});

	describe('fail', () => {
		it('should call the rollback method of unit of work', async () => {
			const rollbackSpy = jest.spyOn(uow, 'rollback');
			await applicationService.fail();
			expect(rollbackSpy).toHaveBeenCalled();
		});
	});

	describe('run', () => {
		it('should start, execute the callback, finish and return the result', async () => {
			const callback = jest.fn().mockResolvedValue('result');
			const spyStart = jest.spyOn(applicationService, 'start');
			const spyFinish = jest.spyOn(applicationService, 'finish');

			const result = await applicationService.run(callback);

			expect(spyStart).toHaveBeenCalled();
			expect(callback).toHaveBeenCalled();
			expect(spyFinish).toHaveBeenCalled();
			expect(result).toBe('result');
		});

		it('should rollback and throw the error if the callback throws an error', async () => {
			const callback = jest.fn().mockRejectedValue(new Error('test-error'));
			const spyFail = jest.spyOn(applicationService, 'fail');
			await expect(applicationService.run(callback)).rejects.toThrow('test-error');
			expect(spyFail).toHaveBeenCalled();
		});
	});
});