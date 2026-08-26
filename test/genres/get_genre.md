# Plano de testes E2E — `get_genre`

Arquivo alvo: `test/genres/get_genre.e2e-spec.ts`

Usecase: `src/core/genre/application/usecases/get_genre/get_genre.usecase.ts`
Rota: `GET /genres/:id` → `GenresController.findOne`

---

## 0. Contexto levantado do código

| Item                    | Valor                                                                                                          |
| ----------------------- | -------------------------------------------------------------------------------------------------------------- |
| Rota                    | `GET /genres/:id`, `id` via `ParseUUIDPipe({ errorHttpStatusCode: 422 })`                                |
| Status de sucesso       | `200 OK`                                                                                                       |
| Chaves da resposta      | `['id', 'name', 'categories_id', 'categories', 'is_active', 'created_at']`                                     |
| Input do usecase        | `{ id: string }`                                                                                               |
| Erro de não encontrado | `404 { statusCode: 404, error: 'Not Found', message: 'Genre Not found using ID <id>' }`                   |
| Erro de id malformado   | `422 { statusCode: 422, error: 'Unprocessable Entity', message: 'Validation failed (uuid is expected)' }`      |

---

## 1. Pré-requisitos

### 1.1 Adicionar `GetGenreFixture` em `src/nest-modules/genres/testing/genre_fixture.ts`

```typescript
export class GetGenreFixture {
  static keysInResponse = ['id', 'name', 'categories_id', 'categories', 'is_active', 'created_at'];
}
```

### 1.2 Estrutura do spec

```typescript
describe('GenresController (e2e)', () => {
  const nestApp = startApp();

  describe('/genres/:id (GET)', () => {
    describe('should a response error when id is invalid or not found', () => { /* ... */ });
    it('should return a genre', async () => { /* ... */ });
  });
});
```

---

## 2. Passo a passo dos testes

### Passo 1 — `describe('should a response error when id is invalid or not found')`

| `id`                                                              | `expected`                                                                                                                                |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `'88ff2587-ce5a-4769-a8c6-1d63d29c5f7a'` (uuid válido, ausente)  | `{ statusCode: HttpStatus.NOT_FOUND, error: 'Not Found', message: 'Genre Not found using ID 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a' }` |
| `'fake id'`                                                       | `{ statusCode: HttpStatus.UNPROCESSABLE_ENTITY, error: 'Unprocessable Entity', message: 'Validation failed (uuid is expected)' }`         |

### Passo 2 — `it('should return a genre')`

1. Inserir categoria associada.
2. Inserir gênero associado.
3. `GET /genres/${genre.genre_id.id}` → `HttpStatus.OK`.
4. Comparar as chaves com `GetGenreFixture.keysInResponse`.
5. Comparar res.body.data com Presenter serializado (incluindo categories_id e objects de categorias completas).

### Passo 3 — asserções de contrato de serialização (um `it` cada)

1. **`created_at` sai como ISO string**.
2. **`is_active` é `boolean`**.
3. **Não há chave `genre_id`** (vaza apenas id).
4. **Um `GET` não altera o registro**.

### Passo 4 — `it('should return the right genre when several exist')`

Inserir 3 gêneros via `bulkInsert`, buscar o **segundo** pelo id e conferir que o body corresponde exatamente a ele.
