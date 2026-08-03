type Prettify<T> = { [K in keyof T]: T[K] } & {};

type Overwritable<T> = Partial<Record<keyof T, unknown>>;

declare global {
	type Overwrite<T, R extends Overwritable<T> = {}> = Prettify<
		Omit<T, keyof R> & R
	>;
}

export {};