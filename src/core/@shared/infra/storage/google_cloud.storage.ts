import {IStorage, IStorageObject} from "@core/@shared/application/storage.interface";
import {Storage as GoogleCloudStorageSdk} from '@google-cloud/storage';


export class GoogleCloudStorage implements IStorage {

	constructor(
		private storageSdk: GoogleCloudStorageSdk,
		private buckedName: string
	) {}

	async store(object: IStorageObject): Promise<void> {
		const bucket = this.storageSdk.bucket(this.buckedName);
		const file = bucket.file(object.id);
		return await file.save(object.data, {
			metadata: {
				contentType: object.mime_type
			}
		});
	}

	async get(id: string): Promise<IStorageObject> {
		const bucket = this.storageSdk.bucket(this.buckedName);
		const file = bucket.file(id);
		const [metadata, content] = await Promise.all([
			file.getMetadata(),
			file.download()
		]);
		return {
			id,
			data: content[0],
			mime_type: metadata[0].contentType,
		};
	}
}