import {AggregateRoot} from "@core/@shared/domain/aggregate_root";

export interface IUnitOfWork {
	start(): Promise<void>;
	commit(): Promise<void>;
	rollback(): Promise<void>;
	getTransaction(): any;
	do<T>(workFn: (wow: IUnitOfWork) => Promise<T>): Promise<T>;
	addAggregateRoot(aggregateRoot: AggregateRoot): void;
	getAggregateRoots(): AggregateRoot[];
}