import { CategoriesController } from '../categories.controller';
import {CreateCategoryOutput} from "@core/category/application/usecases/create_category/create_category.usecase";
import {CreateCategoryDto} from "@/nest-modules/categories/dto/create-category.dto";
import {CategoryPresenter, CategoryCollectionPresenter} from "@/nest-modules/categories/categories.presenter";

// beforeEach(async () => {
//   const module: TestingModule = await Test.createTestingModule({
//     imports: [ConfigModule.forRoot(), CategoriesModule],
//   }).overrideProvider(getModelToken(CategoryModel))
//     .useValue({})
//     .overrideProvider('CategoryRepository')
//     .useValue(REPOSITORIES.CATEGORY_IN_MEMORY_REPOSITORY.provide)
//     .compile();
//
//   controller = module.get<CategoriesController>(CategoriesController);
// });

describe('CategoriesController Unit Tests', () => {
  let controller: CategoriesController;

  beforeEach(async () => {
    controller = new CategoriesController();
  });

  test('category creation', async () => {
    // ARRANGE
    const output: CreateCategoryOutput = {
      id: '324dsfw32431-432dsa-4235bfd-43252gf-6t43f64fds52',
      name: 'Movie',
      description: null,
      is_active: true,
      created_at: new Date(),
    };

    const mockCreateUser = {
      execute: jest.fn().mockResolvedValue(Promise.resolve(output))
    };

    // @ts-expect-error
    controller['createUsecase'] = mockCreateUser;

    const input: CreateCategoryDto = {
      name: 'Movie',
      description: 'some description',
      is_active: true
    };

    // ACT
    const presenter = await controller.create(input);

    // ASSERT
    expect(mockCreateUser.execute).toHaveBeenCalledWith(input);
    expect(presenter).toBeInstanceOf(CategoryPresenter);
    expect(presenter).toStrictEqual(new CategoryPresenter(output));
  });

  test('category update', async () => {
    // ARRANGE
    const output = {
      id: '324dsfw32431-432dsa-4235bfd-43252gf-6t43f64fds52',
      name: 'Movie Updated',
      description: 'updated description',
      is_active: false,
      created_at: new Date(),
    };

    const mockUpdateUsecase = {
      execute: jest.fn().mockResolvedValue(output),
    };

// @ts-expect-error
    controller['updateUsecase'] = mockUpdateUsecase;

    const input = {
      id: '324dsfw32431-432dsa-4235bfd-43252gf-6t43f64fds52',
      name: 'Movie Updated',
      description: 'updated description',
      is_active: false,
    };

// ACT
    const presenter = await controller.update(input.id, input);

// ASSERT
    expect(mockUpdateUsecase.execute).toHaveBeenCalledWith(input);
    expect(presenter).toBeInstanceOf(CategoryPresenter);
    expect(presenter).toStrictEqual(new CategoryPresenter(output));
  });

  test('get category', async () => {
    // ARRANGE
    const output = {
      id: '324dsfw32431-432dsa-4235bfd-43252gf-6t43f64fds52',
      name: 'Movie',
      description: 'description',
      is_active: true,
      created_at: new Date(),
    };

    const mockGetUsecase = {
      execute: jest.fn().mockResolvedValue(output),
    };

    // @ts-expect-error
    controller['getUsecase'] = mockGetUsecase;

    const input = {
      id: '324dsfw32431-432dsa-4235bfd-43252gf-6t43f64fds52',
    };

    // ACT
    const presenter = await controller.findOne(input.id);

    // ASSERT
    expect(mockGetUsecase.execute).toHaveBeenCalledWith(input);
    expect(presenter).toBeInstanceOf(CategoryPresenter);
    expect(presenter).toStrictEqual(new CategoryPresenter(output));
  });

  test('category listage', async () => {
    // ARRANGE
    const items = [
      {
        id: '324dsfw32431-432dsa-4235bfd-43252gf-6t43f64fds52',
        name: 'Movie 1',
        description: 'description 1',
        is_active: true,
        created_at: new Date(),
      },
      {
        id: '424dsfw32431-432dsa-4235bfd-43252gf-6t43f64fds53',
        name: 'Movie 2',
        description: 'description 2',
        is_active: false,
        created_at: new Date(),
      },
    ]
    const output = {
      items,
      current_page: 1,
      per_page: 10,
      total: 2,
      last_page: 1,
    };

    const mockListUsecase = {
      execute: jest.fn().mockResolvedValue(Promise.resolve(output)),
    };

    // @ts-expect-error
    controller['listUsecase'] = mockListUsecase;

    const input = {
      items,
      page: 1,
      per_page: 10,
      sort: undefined,
      sort_dir: undefined,
      filter: undefined,
    };

    // ACT
    const presenter = await controller.search(input);

    // ASSERT
    expect(mockListUsecase.execute).toHaveBeenCalledWith(input);
    expect(presenter).toBeInstanceOf(CategoryCollectionPresenter);
    expect(presenter).toStrictEqual(new CategoryCollectionPresenter(output));
  });

  test('category deletion', async () => {
    // ARRANGE
    const mockDeleteUsecase = {
      execute: jest.fn().mockResolvedValue(undefined),
    };

    // @ts-expect-error
    controller['deleteUsecase'] = mockDeleteUsecase;

    const input = {
      id: '324dsfw32431-432dsa-4235bfd-43252gf-6t43f64fds52',
    };

    // ACT
    const presenter = await controller.remove(input.id);

    // ASSERT
    expect(mockDeleteUsecase.execute).toHaveBeenCalledWith(input);
    expect(presenter).toBeUndefined();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
