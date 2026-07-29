import {SortDirection} from "@core/@shared/domain/repository/search_params";

export class SearchInput<T> {
  page?: number;
  per_page?: number;
  sort?: string;
  sort_dir?: SortDirection;
  filter?: T;
}
