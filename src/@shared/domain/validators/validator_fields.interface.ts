export type FieldsErrors = {
	[field: string]: string[];
}

export interface IValidatorFields<PropsValidated> {
	errors: FieldsErrors | null;
	validateData: PropsValidated | null;
	validate(data: any): boolean;
}