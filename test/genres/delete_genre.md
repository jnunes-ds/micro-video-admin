# Plano de testes E2E — `delete_genre`

Arquivo alvo: `test/genres/delete_genre.e2e-spec.ts`

Usecase: `src/core/genre/application/usecases/delete_genre/delete_genre.usecase.ts`
Rota: `DELETE /genres/:id` → `GenresController.remove`

---

## 0. Contexto levantado do código

| Item                    | Valor                                                                                                     |
| ----------------------- | --------------------------------------------------------------------------------------------------------- |
| Rota                    | `DELETE /genres/:id`, `id` via `ParseUUIDPipe({ errorHttpStatusCode: 422 })`                        |
| Status de sucesso       | `204 NO_CONTENT` (`@HttpCode(HttpStatus.NO_CONTENT)` no controller)                                       |
| Corpo da resposta       | vazio — o controller não retorna nada                                                                   |
| Input do usecase        | `{ id: string }`; output `void`                                                                           |
| Erro de não encontrado | `404 { statusCode: 404, error: 'Not Found', message: 'Genre Not found using ID <id>' }`              |
| Erro de id malformado   | `422 { statusCode: 422, error: 'Unprocessable Entity', message: 'Validation failed (uuid is expected)' }` |

---

## 1. Pré-requisitos

Nenhuma fixture nova é necessária — este spec não tem arranges de corpo de requisição. Basta o fake builder de Genre e Category, e o helper `startApp()`.

### Estrutura do spec

```typescript
import request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { startApp } from '@/nest-modules/shared/testing/helpers/start_app.helper';
import { GENRE_PROVIDERS } from '@/nest-modules/genres/genres.providers';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { Genre } from '@core/genre/domain/genre.aggregate';

describe('GenresController (e2e)', () => {
  describe('/genres/:id (DELETE)', () => {
    const appHelper = startApp();
    // ...
  });
});
```

---

## 2. Passo a passo dos testes

### Passo 1 — `describe('should a response error when id is invalid or not found')`

| `id`                                                             | `expected`                                                                                                                                        |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `'88ff2587-ce5a-4769-a8c6-1d63d29c5f7a'` (uuid válido, ausente) | `{ statusCode: 404, error: 'Not Found', message: 'Genre Not found using ID 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a' }`                          |
| `'fake id'`                                                      | `{ statusCode: 422, error: 'Unprocessable Entity', message: 'Validation failed (uuid is expected)' }`                                             |

### Passo 2 — `it('should delete a genre and respond with status 204')`

1. Inserir uma categoria e um gênero associado.
2. `await request(...).delete(\`/genres/${genre.genre_id.id}\`).expect(HttpStatus.NO_CONTENT);`
3. Verificar a deleção com `genreRepo.existsById` ou requisição HTTP `GET /genres/:id` retornando 404.

### Passo 3 — `it('should respond with an empty body')`

Confirmar que a exclusão resulta num body e text vazios (evitando injeção do WrapperDataInterceptor).

### Passo 4 — `it('should delete only the target genre')`

Inserir múltiplos gêneros, excluir um, garantir que os demais existem e as associações continuam intactas para os outros.

### Passo 5 — `it('should return 404 when deleting the same id twice')`

Excluir o gênero que já foi excluído.

### Passo 6 — `it('should not appear in the listing after deletion')`

Garantir que não aparece no GET /genres.
