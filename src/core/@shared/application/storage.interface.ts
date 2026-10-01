export interface IStorage {
	store(object: IStorageObject): Promise<void>;
	get(id: string): Promise<IStorageObject>;
}

export interface IStorageObject {
	data: Buffer;
	mime_type?: string;
	id: string;
}