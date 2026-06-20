import { Module } from '@nestjs/common';
import {ConfigModule} from "@/nest-modules/config/config.module";
import {DatabaseModule} from "@/nest-modules/database/database.module";

@Module({imports: [ConfigModule.forRoot(), DatabaseModule]})
export class MigrationsModule {}
