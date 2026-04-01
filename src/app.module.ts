import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoriesModule } from '@/nest-modules/categories/categories.module';
import { DatabaseModule } from '@/nest-modules/database/database.module';
import { ConfigModule } from '@/nest-modules/config/config.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    CategoriesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
