import { Transform } from 'class-transformer';
import { CollectionPresenter } from '@/nest-modules/shared/collection.presenter';
import {
  GenreCategoryOytput,
  GenreOutput,
} from '@core/genre/application/usecases/common/genre_output';
import { ListGenresOutput } from '@core/genre/application/usecases/list_genres/list_genres.usecase';

export class GenreCategoryPresenter {
  id: string;
  name: string;
  @Transform(({ value }: { value: Date }) => value.toISOString())
  created_at: Date;

  constructor(output: GenreCategoryOytput) {
    this.id = output.id;
    this.name = output.name;
    this.created_at = output.created_at;
  }
}

export class GenrePresenter {
  id: string;
  name: string;
  categories_id: string[];
  categories: GenreCategoryPresenter[];
  is_active: boolean;
  @Transform(({ value }: { value: Date }) => value.toISOString())
  created_at: Date;

  constructor(output: GenreOutput) {
    this.id = output.id;
    this.name = output.name;
    this.categories_id = output.categories_id;
    this.categories = output.categories.map(
      (c) => new GenreCategoryPresenter(c),
    );
    this.is_active = output.is_active;
    this.created_at = output.created_at;
  }
}

export class GenreCollectionPresenter extends CollectionPresenter {
  data: GenrePresenter[];

  constructor(output: ListGenresOutput) {
    const { items, ...paginationProps } = output;
    super(paginationProps);
    this.data = items.map((item) => new GenrePresenter(item));
  }
}
