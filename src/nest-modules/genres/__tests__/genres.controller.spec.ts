import { GenresController } from '@/nest-modules/genres/genres.controller';
import { GenreOutput } from '@core/genre/application/usecases/common/genre_output';
import { Uuid } from '@core/@shared/domain/value_objects/uuid.vo';
import { CreateGenreDto } from '@/nest-modules/genres/dto/create_genre.dto';
import {
  GenreCollectionPresenter,
  GenrePresenter,
} from '@/nest-modules/genres/genres.presenter';
import { UpdateGenreDto } from '@/nest-modules/genres/dto/update_genre.dto';
import { SearchGenresDto } from '@/nest-modules/genres/dto/search_genres.dto';
import { ListGenresOutput } from '@core/genre/application/usecases/list_genres/list_genres.usecase';

describe('GenresControler Unit Tests', () => {
  let controller: GenresController;

  beforeEach(() => {
    controller = new GenresController();
  });

  it('shoud creates a genre', async () => {
    const genreId = new Uuid().id;
    const categoryId = new Uuid().id;

    const output: GenreOutput = {
      id: genreId,
      name: 'action',
      categories: [
        {
          id: categoryId,
          name: 'category',
          created_at: new Date(),
        },
      ],
      is_active: true,
      categories_id: [categoryId],
      created_at: new Date(),
    };

    const mockCreateUsecase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };

    //@ts-expect-error
    controller['createUsecase'] = mockCreateUsecase;
    const input: CreateGenreDto = {
      name: 'action',
      categories_id: [categoryId],
    };
    const presenter = await controller.create(input);
    expect(mockCreateUsecase.execute).toHaveBeenCalledWith(input);
    expect(presenter).toBeInstanceOf(GenrePresenter);
    expect(presenter).toStrictEqual(new GenrePresenter(output));
  });

  it('should update a genre', async () => {
    const genreId = new Uuid().id;
    const categoryId = new Uuid().id;

    const output: GenreOutput = {
      id: genreId,
      name: 'action updated',
      categories: [
        {
          id: categoryId,
          name: 'category',
          created_at: new Date(),
        },
      ],
      is_active: false,
      categories_id: [categoryId],
      created_at: new Date(),
    };

    const mockUpdateUsecase = {
      execute: jest.fn().mockResolvedValue(output),
    };

    //@ts-expect-error
    controller['updateUsecase'] = mockUpdateUsecase;

    const input: UpdateGenreDto = {
      name: 'action updated',
      categories_id: [categoryId],
      is_active: false,
    };

    const presenter = await controller.update(genreId, input);

    expect(mockUpdateUsecase.execute).toHaveBeenCalledWith({
      id: genreId,
      ...input,
    });
    expect(presenter).toBeInstanceOf(GenrePresenter);
    expect(presenter).toStrictEqual(new GenrePresenter(output));
  });

  it('should get a genre', async () => {
    const genreId = new Uuid().id;
    const categoryId = new Uuid().id;

    const output: GenreOutput = {
      id: genreId,
      name: 'action',
      categories: [
        {
          id: categoryId,
          name: 'category',
          created_at: new Date(),
        },
      ],
      is_active: true,
      categories_id: [categoryId],
      created_at: new Date(),
    };

    const mockGetUsecase = {
      execute: jest.fn().mockResolvedValue(output),
    };

    //@ts-expect-error
    controller['getUsecase'] = mockGetUsecase;

    const presenter = await controller.findOne(genreId);

    expect(mockGetUsecase.execute).toHaveBeenCalledWith({ id: genreId });
    expect(presenter).toBeInstanceOf(GenrePresenter);
    expect(presenter).toStrictEqual(new GenrePresenter(output));
  });

  it('should search genres', async () => {
    const genreId = new Uuid().id;
    const categoryId = new Uuid().id;

    const items: GenreOutput[] = [
      {
        id: genreId,
        name: 'action',
        categories: [
          {
            id: categoryId,
            name: 'category',
            created_at: new Date(),
          },
        ],
        is_active: true,
        categories_id: [categoryId],
        created_at: new Date(),
      },
    ];

    const output: ListGenresOutput = {
      items,
      current_page: 1,
      per_page: 10,
      total: 1,
      last_page: 1,
    };

    const mockListUsecase = {
      execute: jest.fn().mockResolvedValue(Promise.resolve(output)),
    };

    //@ts-expect-error
    controller['listUsecase'] = mockListUsecase;

    const input: SearchGenresDto = {
      page: 1,
      per_page: 10,
      sort: undefined,
      sort_dir: undefined,
      filter: undefined,
    };

    const presenter = await controller.search(input);

    expect(mockListUsecase.execute).toHaveBeenCalledWith(input);
    expect(presenter).toBeInstanceOf(GenreCollectionPresenter);
    expect(presenter).toStrictEqual(new GenreCollectionPresenter(output));
  });

  it('should delete a genre', async () => {
    const mockDeleteUsecase = {
      execute: jest.fn().mockResolvedValue(undefined),
    };

    //@ts-expect-error
    controller['deleteUsecase'] = mockDeleteUsecase;

    const genreId = new Uuid().id;

    const presenter = await controller.remove(genreId);

    expect(mockDeleteUsecase.execute).toHaveBeenCalledWith({ id: genreId });
    expect(presenter).toBeUndefined();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
