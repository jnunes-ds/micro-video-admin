import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateGenreUsecase } from '@core/genre/application/usecases/create_genre/create_genre.usecase';
import { DeleteGenreUsecase } from '@core/genre/application/usecases/delete_genre/delete_genre.usecase';
import { GetGenreUsecase } from '@core/genre/application/usecases/get_genre/get_genre.usecase';
import { ListGenresUsecase } from '@core/genre/application/usecases/list_genres/list_genres.usecase';
import { UpdateGenreUsecase } from '@core/genre/application/usecases/update_genre/update_genre.usecase';
import { CreateGenreDto } from '@/nest-modules/genres/dto/create_genre.dto';
import { UpdateGenreDto } from '@/nest-modules/genres/dto/update_genre.dto';
import { SearchGenresDto } from '@/nest-modules/genres/dto/search_genres.dto';
import { GenreOutput } from '@core/genre/application/usecases/common/genre_output';
import {
  GenreCollectionPresenter,
  GenrePresenter,
} from '@/nest-modules/genres/genres.presenter';

@Controller('genres')
export class GenresController {
  @Inject(CreateGenreUsecase)
  private createUsecase: CreateGenreUsecase;

  @Inject(UpdateGenreUsecase)
  private updateUsecase: UpdateGenreUsecase;

  @Inject(DeleteGenreUsecase)
  private deleteUsecase: DeleteGenreUsecase;

  @Inject(GetGenreUsecase)
  private getUsecase: GetGenreUsecase;

  @Inject(ListGenresUsecase)
  private listUsecase: ListGenresUsecase;

  @Post()
  async create(@Body() createGenreDto: CreateGenreDto) {
    const output = await this.createUsecase.execute(createGenreDto);
    return GenresController.serialize(output);
  }

  @Get()
  async search(@Query() searchParamsDto: SearchGenresDto) {
    const output = await this.listUsecase.execute(searchParamsDto);
    return new GenreCollectionPresenter(output);
  }

  @Get(':id')
  async findOne(
    @Param(
      'id',
      new ParseUUIDPipe({
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    )
    id: string,
  ) {
    const output = await this.getUsecase.execute({ id });
    return GenresController.serialize(output);
  }

  @Patch(':id')
  async update(
    @Param(
      'id',
      new ParseUUIDPipe({
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    )
    id: string,
    @Body() updateGenreDto: UpdateGenreDto,
  ) {
    const output = await this.updateUsecase.execute({ id, ...updateGenreDto });
    return GenresController.serialize(output);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(
    @Param(
      'id',
      new ParseUUIDPipe({
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    )
    id: string,
  ) {
    await this.deleteUsecase.execute({ id });
  }

  static serialize(output: GenreOutput) {
    return new GenrePresenter(output);
  }
}
