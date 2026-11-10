import { UpdateGenreInput } from '@core/genre/application/usecases/update_genre/update_genre.input';
import { OmitType } from '@nestjs/mapped-types';

export class UpdateGenreInputWithoutId extends OmitType(UpdateGenreInput, ['id']) {}

export class UpdateGenreDto extends UpdateGenreInputWithoutId {}
