import { SortDirection } from '@core/@shared/domain/repository/search_params';
import {
  ListGenresFilter,
  ListGenresInput,
} from '@core/genre/application/usecases/list_genres/list_genres.input';

export class SearchGenresDto implements ListGenresInput {
  page?: number;
  per_page?: number;
  sort?: string;
  sort_dir?: SortDirection;
  filter?: ListGenresFilter;
}
