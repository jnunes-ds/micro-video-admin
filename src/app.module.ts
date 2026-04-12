import { Module } from '@nestjs/common';
import { CategoriesModule } from '@/nest-modules/categories/categories.module';
import { DatabaseModule } from '@/nest-modules/database/database.module';
import { ConfigModule } from '@/nest-modules/config/config.module';
import { SharedModule } from './shared/shared.module';
import {AppController} from "@nestjs/schematics/dist/lib/application/files/ts/src/app.controller";
import {AppService} from "@nestjs/schematics/dist/lib/application/files/ts/src/app.service";

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    CategoriesModule,
    SharedModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
