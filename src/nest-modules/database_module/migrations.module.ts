import { Module } from '@nestjs/common';
import {ConfigModule} from "@/nest-modules/config_module/config.module";
import {DatabaseModule} from "@/nest-modules/database_module/database.module";

@Module({imports: [ConfigModule.forRoot(), DatabaseModule]})
export class MigrationsModule {}
