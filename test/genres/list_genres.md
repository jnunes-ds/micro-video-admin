# Plano de testes E2E — `list_genres`

Arquivo alvo: `test/genres/list_genres.e2e-spec.ts`

Usecase: `src/core/genre/application/usecases/list_genres/list_genres.usecase.ts`
Rota: `GET /genres` → `GenresController.search`

---

## 0. Contexto levantado do código

| Item                      | Valor                                                                                                                                                            |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rota                      | `GET /genres`                                                                                                                                              |
| Status de sucesso         | `200 OK`                                                                                                                                                         |
| Formato da resposta       | `{ data: GenrePresenter[], meta: { current_page, per_page, last_page, total } }` — via `GenreCollectionPresenter extends CollectionPresenter`         |
| DTO de query              | `SearchGenresDto` → `page`, `per_page`, `sort`, `sort_dir`, `filter?: { name?, categories_id? }` |
| Defaults de`SearchParams` | `page = 1`, `per_page = 15`, `sort = null`, `sort_dir = null`                                                                                                    |
| Ordenação default       | `[['created_at', 'DESC']]` quando `sort` ausente ou não-ordenável                                                                                              |
| Campos ordenáveis        | `['name', 'created_at']` (`GenreSequelizeRepository.sortableFields`)                                                                                        |

---

## 1. Pré-requisitos

### 1.1 Adicionar `ListGenresFixture` em `src/nest-modules/genres/testing/genre_fixture.ts`

```typescript
export class ListGenresFixture {
  static arrangeIncrementedWithCreatedAt()  // paginação + ordenação default
  static arrangeUnsorted()                  // filtro + sort explícito
  static arrangeInvalid()                   // queries inválidas
}
```

Fonte de dados: `Genre.fake().theGenres(n)`, associadas a categorias previamente criadas.

---

## 2. Passo a passo dos testes

### Passo 1 — `describe('should return genres sorted by created_at when request query is empty')`

Testes verificam comportamento default com paginação: paginação, página além do fim vazia, default de per_page.

### Passo 2 — `describe('should apply defaults for invalid pagination params')`

Testar strings onde se espera numérico (`page=a`), page<=0, per_page<=0 etc.

### Passo 3 — `describe('should return genres using paginate, filter by name and sort')`

Testes focando no filtro de `name` do Genre e a paginação associada.

### Passo 4 — `describe('should filter by categories_id')`

Testes para garantir que buscar passando `filter[categories_id][]=<id1>&filter[categories_id][]=<id2>` ou arrays no query resultam nos gêneros correspondentes a essas categorias.

### Passo 5 — `describe('should ignore non-sortable sort fields')`

`sort=invalid_field` deve reverter para `created_at DESC`.

### Passo 6 — casos de borda (um `it` cada)

1. **Banco vazio**.
2. **Filtro sem resultado**.
3. **`filter` vazio**.
4. **Chaves do item da lista**.
5. **Chaves do envelope**.
