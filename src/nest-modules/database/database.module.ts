import { Global, Module, Scope } from '@nestjs/common';
import { getConnectionToken, SequelizeModule } from '@nestjs/sequelize';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { ConfigService } from '@nestjs/config';
import { CONFIG_SCHEMA_TYPE } from '@/nest-modules/config/config.module';
import { CastMemberModel } from '@core/cast_member/infra/db/sequelize/cast_member.model';
import {
  GenreModel,
  GenreCategoryModel,
} from '@core/genre/infra/sequelize/genre.model';
import { UnitOfWorkSequelize } from '@core/@shared/infra/db/sequelize/unit_of_work_sequelize';
import { Sequelize } from 'sequelize-typescript';

type Dialect = CONFIG_SCHEMA_TYPE['DB_VENDOR'];

const models = [CategoryModel, CastMemberModel, GenreModel, GenreCategoryModel];

@Global()
@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useFactory: (configService: ConfigService<CONFIG_SCHEMA_TYPE>) => {
        const dbVendor: Dialect | undefined = configService.get('DB_VENDOR');
        if (dbVendor === 'sqlite') {
          return {
            dialect: dbVendor,
            host: configService.get('DB_HOST'),
            logging: configService.get('DB_LOGGING'),
            autoLoadModels: configService.get('DB_AUTO_LOAD_MODELS'),
            models,
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
            models,
          };
        }

        throw new Error(
          `Unsupported database configuration: ${configService.get('DB_VENDOR')}`,
        );
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: UnitOfWorkSequelize,
      useFactory: (sequelize: Sequelize) => {
        return new UnitOfWorkSequelize(sequelize);
      },
      inject: [getConnectionToken()],
      scope: Scope.REQUEST,
    },
    {
      provide: 'UnitOfWork',
      useExisting: UnitOfWorkSequelize,
      scope: Scope.REQUEST,
    },
  ],
  exports: ['UnitOfWork', UnitOfWorkSequelize],
})
export class DatabaseModule {}
