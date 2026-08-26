import { Module } from '@nestjs/common';
import { GenresController } from './genres.controller';
import { GENRE_PROVIDERS } from './genres.providers';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  GenreModel,
  GenreCategoryModel,
} from '@core/genre/infra/sequelize/genre.model';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    SequelizeModule.forFeature([GenreModel, GenreCategoryModel]),
    CategoriesModule,
  ],
  controllers: [GenresController],
  providers: [
    ...Object.values(GENRE_PROVIDERS.REPOSITORIES),
    ...Object.values(GENRE_PROVIDERS.USE_CASES),
  ],
  exports: [GENRE_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide]
})
export class GenresModule {}
