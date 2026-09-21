import {IStorage, IStorageObject} from "@core/@shared/application/storage.interface";

export class InMemoryStorage implements IStorage {
	private storage: Map<string, Omit<IStorageObject, 'id'>> = new Map();

	async store(object: IStorageObject): Promise<void> {
		this.storage.set(object.id, {
			data: object.data,
			mime_type: object.mime_type || 'image/png'
		});
	}

	async get(id: string): Promise<IStorageObject> {
		const file = this.storage.get(id);
		if (!file) throw new Error(`File ${id} not found`);

		return { data: file.data, mime_type: file.mime_type, id }
	}
}