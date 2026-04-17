import {Test, TestingModule} from "@nestjs/testing";
import {AppModule} from "@/app.module";
import {applyGlobalConfig} from "@/nest-modules/global_config";
import {INestApplication} from "@nestjs/common";

export function startApp() {
	let _app: INestApplication;
	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		_app = moduleFixture.createNestApplication();
		applyGlobalConfig(_app);
		await _app.init();
	});

	afterEach(async () => {
		await _app.close();
	});

	return {
		get app(): INestApplication {
			return _app;
		}
	};
}