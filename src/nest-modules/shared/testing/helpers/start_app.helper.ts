import {Test, TestingModule} from "@nestjs/testing";
import {AppModule} from "@/app.module";
import {applyGlobalConfig} from "@/nest-modules/global_config";
import {INestApplication} from "@nestjs/common";
import {getConnectionToken} from "@nestjs/sequelize";
import {Sequelize} from "sequelize-typescript";

export function startApp() {
	let _app: INestApplication;
	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();
		const sequelize = moduleFixture.get<Sequelize>(getConnectionToken());

		await sequelize.sync({ force: true });

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