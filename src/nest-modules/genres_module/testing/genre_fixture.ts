import { Genre } from '@core/genre/domain/genre.aggregate';
import { Category } from '@core/category/domain/category.aggregate';
import { SortDirection } from '@core/@shared/domain/repository/search_params';

const _keysInResponse = [
  'id',
  'name',
  'categories_id',
  'categories',
  'is_active',
  'created_at',
];

export class GetGenreFixture {
  static keysInResponse = _keysInResponse;
}

export class CreateGenreFixture {
  static keysInResponse = _keysInResponse;

  static arrangeForCreate() {
    const category = Category.fake().aCategory().build();
    const faker = Genre.fake()
      .aGenre()
      .withName('Action')
      .addCategoryId(category.category_id);

    return [
      {
        send_data: {
          name: faker.name,
          categories_id: [category.category_id.id],
        },
        expected: {
          name: faker.name,
          is_active: true,
          categories_id: [category.category_id.id],
        },
        relations: [category],
      },
      {
        send_data: {
          name: faker.name,
          categories_id: [category.category_id.id],
          is_active: false,
        },
        expected: {
          name: faker.name,
          is_active: false,
          categories_id: [category.category_id.id],
        },
        relations: [category],
      },
    ];
  }

  static arrangeInvalidRequest() {
    const defaultExpected = {
      statusCode: 422,
      error: 'Unprocessable Entity',
    };

    return {
      EMPTY: {
        send_data: {},
        expected: {
          message: [
            'name should not be empty',
            'name must be a string',
            'categories_id should not be empty',
            'each value in categories_id must be a UUID',
          ],
          ...defaultExpected,
        },
      },
      NAME_UNDEFINED: {
        send_data: {
          name: undefined,
          categories_id: ['f47ac10b-58cc-4372-a567-0e02b2c3d479'],
        },
        expected: {
          message: ['name should not be empty', 'name must be a string'],
          ...defaultExpected,
        },
      },
      CATEGORIES_ID_NOT_AN_ARRAY: {
        send_data: {
          name: 'Action',
          categories_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        },
        expected: {
          message: ['each value in categories_id must be a UUID'],
          ...defaultExpected,
        },
      },
      IS_ACTIVE_NOT_A_BOOLEAN: {
        send_data: {
          name: 'Action',
          categories_id: ['f47ac10b-58cc-4372-a567-0e02b2c3d479'],
          is_active: 'a',
        },
        expected: {
          message: ['is_active must be a boolean value'],
          ...defaultExpected,
        },
      },
    };
  }

  static arrangeForEntityValidationError() {
    const faker = Genre.fake().aGenre();
    const defaultExpected = {
      statusCode: 422,
      error: 'Unprocessable Entity',
    };

    return {
      NAME_TOO_LONG: {
        send_data: {
          name: faker.withInvalidNameTooLong().name,
          categories_id: ['f47ac10b-58cc-4372-a567-0e02b2c3d479'],
        },
        expected: {
          message: ['name must be shorter than or equal to 255 characters'],
          ...defaultExpected,
        },
      },
      CATEGORIES_ID_NOT_EXISTS: {
        send_data: {
          name: 'Action',
          categories_id: ['f47ac10b-58cc-4372-a567-0e02b2c3d479'],
        },
        expected: {
          message: [
            'Category Not found using ID f47ac10b-58cc-4372-a567-0e02b2c3d479',
          ],
          ...defaultExpected,
        },
      },
    };
  }
}

export class UpdateGenreFixture {
  static keysInResponse = _keysInResponse;

  static arrangeForUpdate() {
    const category1 = Category.fake().aCategory().build();
    const category2 = Category.fake().aCategory().build();
    const faker = Genre.fake()
      .aGenre()
      .withName('Action Updated')
      .addCategoryId(category2.category_id);

    return [
      {
        send_data: {
          name: faker.name,
        },
        expected: {
          name: faker.name,
        },
        relations: [category1, category2],
      },
      {
        send_data: {
          categories_id: [category2.category_id.id],
        },
        expected: {
          categories_id: [category2.category_id.id],
        },
        relations: [category1, category2],
      },
      {
        send_data: {
          name: faker.name,
          categories_id: [category2.category_id.id],
          is_active: false,
        },
        expected: {
          name: faker.name,
          categories_id: [category2.category_id.id],
          is_active: false,
        },
        relations: [category1, category2],
      },
    ];
  }

  static arrangeInvalidRequest() {
    const defaultExpected = {
      statusCode: 422,
      error: 'Unprocessable Entity',
    };

    return {
      CATEGORIES_ID_NOT_AN_ARRAY: {
        send_data: {
          categories_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        },
        expected: {
          message: ['each value in categories_id must be a UUID'],
          ...defaultExpected,
        },
      },
      IS_ACTIVE_NOT_A_BOOLEAN: {
        send_data: {
          is_active: 'a',
        },
        expected: {
          message: ['is_active must be a boolean value'],
          ...defaultExpected,
        },
      },
    };
  }

  static arrangeForEntityValidationError() {
    const faker = Genre.fake().aGenre();
    const defaultExpected = {
      statusCode: 422,
      error: 'Unprocessable Entity',
    };

    return {
      NAME_TOO_LONG: {
        send_data: {
          name: faker.withInvalidNameTooLong().name,
        },
        expected: {
          message: ['name must be shorter than or equal to 255 characters'],
          ...defaultExpected,
        },
      },
      CATEGORIES_ID_NOT_EXISTS: {
        send_data: {
          categories_id: ['f47ac10b-58cc-4372-a567-0e02b2c3d479'],
        },
        expected: {
          message: [
            'Category Not found using ID f47ac10b-58cc-4372-a567-0e02b2c3d479',
          ],
          ...defaultExpected,
        },
      },
    };
  }
}

export class ListGenresFixture {
  static arrangeIncrementedWithCreatedAt() {
    const category = Category.fake().aCategory().build();
    const _entities = Genre.fake()
      .theGenres(4)
      .withName((i) => i + '')
      .addCategoryId(category.category_id)
      .withCreatedAt((i) => new Date(new Date().getTime() + i * 2000))
      .build();

    const entitiesMap = {
      first: _entities[0],
      second: _entities[1],
      third: _entities[2],
      fourth: _entities[3],
    };

    const arrange = [
      {
        send_data: {},
        expected: {
          entities: [
            entitiesMap.fourth,
            entitiesMap.third,
            entitiesMap.second,
            entitiesMap.first,
          ],
          meta: {
            current_page: 1,
            last_page: 1,
            per_page: 15,
            total: 4,
          },
        },
      },
      {
        send_data: {
          page: 1,
          per_page: 2,
        },
        expected: {
          entities: [entitiesMap.fourth, entitiesMap.third],
          meta: {
            current_page: 1,
            last_page: 2,
            per_page: 2,
            total: 4,
          },
        },
      },
      {
        send_data: {
          page: 2,
          per_page: 2,
        },
        expected: {
          entities: [entitiesMap.second, entitiesMap.first],
          meta: {
            current_page: 2,
            last_page: 2,
            per_page: 2,
            total: 4,
          },
        },
      },
    ];

    return { arrange, entitiesMap, category };
  }

  static arrangeUnsorted() {
    const category = Category.fake().aCategory().build();
    const faker = Genre.fake().aGenre().addCategoryId(category.category_id);

    const entitiesMap = {
      a: faker.withName('a').build(),
      AAA: faker.withName('AAA').build(),
      AaA: faker.withName('AaA').build(),
      b: faker.withName('b').build(),
      c: faker.withName('c').build(),
    };

    const arrange = [
      {
        send_data: {
          page: 1,
          per_page: 2,
          sort: 'name',
          sort_dir: 'asc' as SortDirection,
          filter: { name: 'a' },
        },
        expected: {
          entities: [entitiesMap.AAA, entitiesMap.AaA],
          meta: {
            total: 3,
            current_page: 1,
            last_page: 2,
            per_page: 2,
          },
        },
      },
      {
        send_data: {
          page: 2,
          per_page: 2,
          sort: 'name',
          sort_dir: 'asc' as SortDirection,
          filter: { name: 'a' },
        },
        expected: {
          entities: [entitiesMap.a],
          meta: {
            total: 3,
            current_page: 2,
            last_page: 2,
            per_page: 2,
          },
        },
      },
    ];

    return { arrange, entitiesMap, category };
  }
}
