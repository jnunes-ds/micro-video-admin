import { Module } from '@nestjs/common';
import {SequelizeModule} from "@nestjs/sequelize";
import {CategoryModel} from "@core/category/infra/db/sequelize/category.model";
import {ConfigService} from "@nestjs/config";
import {CONFIG_SCHEMA_TYPE} from "@/config/config.module";

type Dialect = CONFIG_SCHEMA_TYPE['DB_VENDOR'];

const models =[CategoryModel];

@Module({
	imports: [
		SequelizeModule.forRootAsync({
			useFactory: (configService: ConfigService<CONFIG_SCHEMA_TYPE>) => {
				const dbVendor: Dialect = configService.get('DB_VENDOR');
				if (dbVendor === 'sqlite') {
					return {
						dialect: dbVendor,
						host: configService.get('DB_HOST'),
						logging: configService.get('DB_LOGGING'),
						autoLoadModels: configService.get('DB_AUTO_LOAD_MODELS'),
						models
					};
				}

				if (dbVendor === 'mysql') {
					return {
						dialect: dbVendor,
						host: configService.get('DB_HOST'),
						port: configService.get('DB_PORT'),
						username: configService.get('DB_USERNAME'),
						password: configService.get('DB_PASSWORD'),
						database: configService.get('DB_DATABASE'),
						logging: configService.get('DB_LOGGING'),
						autoLoadModels: configService.get('DB_AUTO_LOAD_MODELS'),
						models
					};
				}

				throw new Error(
					`Unsupported database configuration: ${configService.get('DB_VENDOR')}`
				);
			},
			inject: [ConfigService]
		}),
	]
})
export class DatabaseModule {}
