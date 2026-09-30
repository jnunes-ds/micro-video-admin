import {GoogleCloudStorage} from "@core/@shared/infra/storage/google_cloud.storage";
import {Storage as GoogleCloudStorageSdk} from '@google-cloud/storage';
import {Config} from "@core/@shared/infra/config";

describe('GoogleCloudStorage Unit Tests', () => {
	let googleCloudStorage: GoogleCloudStorage;

	beforeEach(() => {
		const storageSdk = new GoogleCloudStorageSdk({
			credentials: Config.googleCredentials()
		});
		const bucketName = Config.bucketName();

		googleCloudStorage = new GoogleCloudStorage(storageSdk, bucketName);
	});

	it('should store a file', async () => {

		await googleCloudStorage.store({
			data: Buffer.from('data'),
			id: 'location/1.txt',
			mime_type: 'text/plain'
		});

		const file = await googleCloudStorage.get('location/1.txt');

		expect(file.data.toString()).toBe('data');
		expect(file.mime_type).toBe('text/plain');
	}, 10000);
});