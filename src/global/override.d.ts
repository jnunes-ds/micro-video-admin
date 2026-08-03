declare global {
	export type Override<T, R extends {[K in keyof T]: any}> = {
		[K in keyof T]: K extends keyof R ? R[K] : T[K]
	}
}

export {};