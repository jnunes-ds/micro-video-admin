# Plano de testes E2E — `create_genre`

Arquivo alvo: `test/genres/create_genre.e2e-spec.ts`

Usecase: `src/core/genre/application/usecases/create_genre/create_genre.usecase.ts`
Rota: `POST /genres` → `GenresController.create`

---

## 0. Contexto levantado do código

| Item                            | Valor                                                                                                            |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Rota base                       | `/genres`                                                                                                        |
| Status de sucesso               | `201 CREATED`                                                                                                    |
| Chaves da resposta              | `['id', 'name', 'categories_id', 'categories', 'is_active', 'created_at']`                                       |
| Envelope                        | `{ data: {...} }` (via `WrapperDataInterceptor`)                                                                 |
| DTO de entrada                  | `CreateGenreDto extends CreateGenreInput` → `name: @IsString @IsNotEmpty`, `categories_id: @IsArray @IsUUID`, `is_active: @IsBoolean @IsOptional` |
| Token do repositório           | `GENRE_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide`                                                          |
| Erro de validação de entidade | `EntityValidationErrorFilter` → `422 { statusCode, error: 'Unprocessable Entity', message: string[] }`          |
| Banco no E2E                    | MySQL (`envs/.env.e2e`, `NODE_ENV=e2e` via `test/jest-setup.ts`)                                                 |

---

## 1. Pré-requisitos (construir antes dos testes)

### 1.1 Criar `src/nest-modules/genres/testing/genre_fixture.ts`

É necessário construir a fixture para genres:

```typescript
export class CreateGenreFixture {
  static keysInResponse = ['id', 'name', 'categories_id', 'categories', 'is_active', 'created_at'];
  static arrangeForCreate()                 // casos válidos
  static arrangeInvalidRequest()            // falhas do ValidationPipe (DTO)
  static arrangeForEntityValidationError()  // falhas do domínio/usecase
}
```

Usar `Genre.fake()` (`GenreFakeBuilder`) como fonte dos dados, semelhante a `CastMember.fake()` e instanciar/inserir algumas categorias associadas previamente para os testes que exigem relacionamentos válidos.

### 1.2 Esqueleto do spec

```typescript
import request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { startApp } from '@/nest-modules/shared/testing/helpers/start_app.helper';
import { GenresController } from '@/nest-modules/genres/genres.controller';
import { GENRE_PROVIDERS } from '@/nest-modules/genres/genres.providers';
import { CreateGenreFixture } from '@/nest-modules/genres/testing/genre_fixture';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { GenreId } from '@core/genre/domain/genre.aggregate';
import { GenreOutputMapper } from '@core/genre/application/usecases/common/genre_output';

describe('GenresController (e2e)', () => {
  const appHelper = startApp();
  let genreRepo: IGenreRepository;
  let categoryRepo: ICategoryRepository;

  beforeEach(() => {
    genreRepo = appHelper.app.get<IGenreRepository>(
      GENRE_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
    );
    // Também buscar o repository de categorias para semear dados base
  });

  describe('/genres (POST)', () => { /* ... */ });
});
```

`startApp()` já faz `sequelize.sync({ force: true })` no `beforeEach`, então cada teste começa com o banco limpo — não precisa de limpeza manual.

---

## 2. Passo a passo dos testes

### Passo 1 — `describe('should return a response error with status code 422 when request body is invalid')`

Casos vindos de `CreateGenreFixture.arrangeInvalidRequest()`. São falhas do `ValidationPipe` global (antes do usecase). Expectativa padrão: `{ statusCode: 422, error: 'Unprocessable Entity', message: [...] }`.

Implementação: iterar com `test.each` sobre `Object.keys(...)`, mapeando `{ label, value }` e conferindo com `.expect(HttpStatus.UNPROCESSABLE_ENTITY).expect(value.expected)`.

### Passo 2 — `describe('should return a response error with status code 422 when throw EntityValidationError')`

Casos vindos de `CreateGenreFixture.arrangeForEntityValidationError()`. Aqui o corpo passa pelo DTO mas o domínio/usecase rejeita. Isso inclui a verificação da existência das categorias e regras da entidade (como nome longo).

*   Deve-se simular inserção com IDs de categorias que não existem no banco.

### Passo 3 — `describe('should create a genre')`

Casos vindos de `CreateGenreFixture.arrangeForCreate()`:

| `send_data`                                            | `expected`                                                        |
| ------------------------------------------------------ | ----------------------------------------------------------------- |
| `{ name: 'Action', categories_id: [cat1.id] }`         | `{ name: 'Action', is_active: true }`                             |
| `{ name: 'Action', categories_id: [cat1.id], is_active: false }` | `{ name: 'Action', is_active: false }`                  |

Fluxo de cada teste:
1. Inserir categorias base usando o repo de categorias.
2. `POST /genres` com `send_data`, esperar `HttpStatus.CREATED`.
3. Validar chaves e garantir que `categories` e `categories_id` estão bem formatados.
4. Recuperar do banco com `genreRepo.findById(new GenreId(...))`.
5. Comparar res.body com o output do Presenter serializado, da mesma forma como foi feito para categorias/cast members.

### Passo 4 — asserções complementares (um `it` cada)

1. **`created_at` é ISO-8601**.
2. **`id` é um UUID válido**.
3. **Duas criações com o mesmo nome geram ids distintos**.
