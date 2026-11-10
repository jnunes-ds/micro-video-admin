import {ListCategoriesInput} from "@core/category/application/usecases/list_categories/list_categories.usecase";

export class SearchCategoriesDto implements ListCategoriesInput {
  page?: number;
  per_page?: number;
  sort?: string;
  sort_dir?: 'asc' | 'desc';
  filter?: string;
}