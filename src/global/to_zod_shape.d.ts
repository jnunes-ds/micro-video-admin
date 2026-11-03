import {z} from "zod";

declare global {
	export type ToZodShape<T> = {
		[K in keyof T]-?: z.ZodType<T[K]>;
	};
}

