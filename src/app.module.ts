import { Module } from '@nestjs/common';
import { CategoriesModule } from '@/nest-modules/categories_module/categories.module';
import { DatabaseModule } from '@/nest-modules/database_module/database.module';
import { ConfigModule } from '@/nest-modules/config_module/config.module';
import { SharedModule } from '@/nest-modules/shared_module/shared.module';
import {CastMembersModule} from "@/nest-modules/cast_members_module/cast_members.module";
import { GenresModule } from './nest-modules/genres_module/genres.module';
import {VideosModule} from "@/nest-modules/videos_module/videos.module";
import {EventModule} from "@/nest-modules/event_module/event.module";
import { UsecaseModule } from '@/nest-modules/usecase_module/usecase.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    SharedModule,
    EventModule,
    CategoriesModule,
    CastMembersModule,
    GenresModule,
    VideosModule,
    UsecaseModule
  ],
})
export class AppModule {}
