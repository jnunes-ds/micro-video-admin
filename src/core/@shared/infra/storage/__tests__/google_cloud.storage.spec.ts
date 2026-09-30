import {GoogleCloudStorage} from "@core/@shared/infra/storage/google_cloud.storage";
import {Storage as GoogleCloudStorageSdk} from '@google-cloud/storage';
import {Config} from "@core/@shared/infra/config";

describe('GoogleCloudStorage Unit Tests', () => {
	let googleCloudStorage: GoogleCloudStorage;
	let storageSdk: GoogleCloudStorageSdk;
	beforeEach(() => {
		storageSdk = new GoogleCloudStorageSdk({
			credentials: Config.googleCredentials()
		});
		const bucketName = Config.bucketName();
		googleCloudStorage = new GoogleCloudStorage(storageSdk, bucketName);
	});

	it('should store a file', async () => {
		const saveMock = jest.fn().mockImplementation(undefined);
		const fileMock = jest.fn().mockImplementation(() => ({
			save: saveMock
		}));
		jest.spyOn(storageSdk, 'bucket').mockImplementation(() => ({
			file: fileMock
		} as any));

		await googleCloudStorage.store({
			data: Buffer.from('data'),
			id: 'location/1.txt',
			mime_type: 'text/plain'
		});

		expect(storageSdk.bucket).toHaveBeenCalledWith(Config.bucketName());
		expect(fileMock).toHaveBeenCalledWith('location/1.txt');
		expect(saveMock).toHaveBeenCalledWith(Buffer.from('data'), {
			metadata: {
				contentType: 'text/plain'
			}
		});
	});
});