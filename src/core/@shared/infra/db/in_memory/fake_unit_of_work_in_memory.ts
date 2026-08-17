import {IUnitOfWork} from "@core/@shared/domain/repository/unit_of_work.interface";
import {AggregateRoot} from "@core/@shared/domain/aggregate_root";

export class UnitOfWorkFakeInMemory implements IUnitOfWork {
	private aggregateRoots: Set<AggregateRoot> = new Set();

	constructor() {}

	getAggregateRoots(): AggregateRoot[] {
		return [...this.aggregateRoots];
	}

	addAggregateRoot(aggregateRoot: AggregateRoot): void {
		this.aggregateRoots.add(aggregateRoot);
	}

	async start(): Promise<void> {}

	async commit(): Promise<void> {}

	async rollback(): Promise<void> {}

	do<T>(workFn: (uow: IUnitOfWork) => Promise<T>): Promise<T> {
		return workFn(this);
	}

	getTransaction(): any {}
}