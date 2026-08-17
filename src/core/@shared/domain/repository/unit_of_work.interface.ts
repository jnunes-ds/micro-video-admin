export interface IUnitOfWork {
	start(): Promise<void>;
	commit(): Promise<void>;
	rollback(): Promise<void>;
	getTransaction(): any;
	do<T>(workFn: (wow: IUnitOfWork) => Promise<T>): Promise<T>;
}