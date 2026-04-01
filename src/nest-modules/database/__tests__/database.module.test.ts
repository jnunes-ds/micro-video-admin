import {CONFIG_SCHEMA_TYPE, ConfigModule} from "@/nest-modules/config/config.module";
import {Test} from "@nestjs/testing";
import {DatabaseModule} from "@/nest-modules/database/database.module";
import {Sequelize} from "sequelize-typescript";
import {getConnectionToken} from "@nestjs/sequelize";

describe('DatabaseModule Unit Tests', () => {
	describe('sqlite connection', () => {
		const connOptions: CONFIG_SCHEMA_TYPE = {
			DB_VENDOR: 'sqlite',
			DB_HOST: ':memory:',
			DB_LOGGING: false,
			DB_AUTO_LOAD_MODELS: true
		}

		test(' sqlite connection', async () => {
			const module = await Test.createTestingModule({
				imports: [
					DatabaseModule,
					ConfigModule.forRoot({
						isGlobal: true,
						ignoreEnvFile: true,
						ignoreEnvVars: true,
						validate: (env) => env,
						load: [() => connOptions]
					})
				]
			}).compile();

			const app = module.createNestApplication();
			const conn = app.get<Sequelize>(getConnectionToken());
			expect(conn).toBeDefined();
			expect(conn.options.dialect).toBe('sqlite');
			expect(conn.options.host).toBe(':memory:');
			await conn.close();
		});
	});
	describe('mysql connection', () => {
		const connOptions: CONFIG_SCHEMA_TYPE = {
			DB_VENDOR: 'mysql',
			DB_HOST: 'db',
			DB_DATABASE: 'micro_videos',
			DB_USERNAME: 'root',
			DB_PASSWORD: 'root',
			DB_PORT: 3306,
			DB_LOGGING: false,
			DB_AUTO_LOAD_MODELS: true,
		};

		test('mysql connection', async () => {
			const module = await Test.createTestingModule({
				imports: [
					DatabaseModule,
					ConfigModule.forRoot({
						isGlobal: true,
						ignoreEnvFile: true,
						ignoreEnvVars: true,
						validate: (env) => env,
						load: [() => connOptions],
					}),
				]
			}).compile();

			const app = module.createNestApplication();
			const conn = app.get<Sequelize>(getConnectionToken());
			expect(conn).toBeDefined();
			expect(conn.options.dialect).toBe('mysql');
			expect(conn.options.host).toBe('db');
			expect(conn.options.port).toBe(3306);
		});
	});
});