# Plano de testes E2E — `list_cast_members`

Arquivo alvo: `test/cast_members/list_cast_members.e2e-spec.ts`

Usecase: `src/core/cast_member/application/usecases/list_cast_members/list_cast_members.usecase.ts`
Rota: `GET /cast-members` → `CastMembersController.search`

> **Leia a §3 antes de escrever o arranje.** Este é o plano com mais armadilhas: existem três bugs conhecidos no caminho de busca que afetam diretamente o que os testes podem afirmar. Boa parte deste plano é sobre decidir, caso a caso, se o teste congela o comportamento atual ou documenta o desejado.

---

## 0. Contexto levantado do código


| Item                      | Valor                                                                                                                                                            |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rota                      | `GET /cast-members`                                                                                                                                              |
| Status de sucesso         | `200 OK`                                                                                                                                                         |
| Formato da resposta       | `{ data: CastMemberPresenter[], meta: { current_page, per_page, last_page, total } }` — via `CastMemberCollectionPresenter extends CollectionPresenter`         |
| DTO de query              | `SearchCastMembersDto` → `page`, `per_page`, `sort`, `sort_dir`, `filter?: { name?, type? }` — **filter é objeto aninhado**, diferente de categorias (string) |
| Defaults de`SearchParams` | `page = 1`, `per_page = 15`, `sort = null`, `sort_dir = null`                                                                                                    |
| Ordenação default       | `[['created_at', 'DESC']]` quando `sort` ausente ou não-ordenável                                                                                              |
| Campos ordenáveis        | `['name', 'created_at']` (`CastMemberSequelizeRepository.sortableFields`)                                                                                        |
| Enum de tipo              | `DIRECTOR = 1`, `ACTOR = 2`                                                                                                                                      |
| Banco no E2E              | MySQL (`envs/.env.e2e`) — collation afeta ordenação de `name`                                                                                                 |

---

## 1. Pré-requisitos

### 1.1 Adicionar `ListCastMembersFixture` em `src/nest-modules/cast_members/testing/cast_member_fixture.ts`

```typescript
export class ListCastMembersFixture {
  static arrangeIncrementedWithCreatedAt()  // paginação + ordenação default
  static arrangeUnsorted()                  // filtro + sort explícito
  static arrangeInvalid()                   // queries inválidas (novo em relação a categorias)
}
```

Fonte de dados: `CastMember.fake().theCastMembers(n)`, `.theActors(n)`, `.theDirectors(n)`, com `.withName((i) => ...)` e `.withCreatedAt((i) => new Date(new Date().getTime() + i * 2000))`.

### 1.2 Query string com filtro aninhado

`filter` é objeto, então `new URLSearchParams(send_data).toString()` **não serve** — ele produz `filter=%5Bobject+Object%5D`. Duas opções:

- **Recomendado:** usar o encadeamento de `.query()` do supertest, que serializa objetos aninhados em `filter[name]=x&filter[type]=1`:
  ```typescript
  request(app.getHttpServer()).get('/cast-members').query(send_data)
  ```
- Ou montar a string manualmente com `qs.stringify(send_data)`.

Escolher uma e usar em todos os blocos, para que os arranges fiquem uniformes.

### 1.3 Estrutura do spec

Um `startApp()` por `describe` interno (padrão de `list_categories.e2e-spec.ts`), com o `bulkInsert` no `beforeEach`:

```typescript
describe('CastMembersController (e2e)', () => {
  describe('/cast-members (GET)', () => {
    describe('should return cast members sorted by created_at when request query is empty', () => {
      let castMemberRepo: ICastMemberRepository;
      const nestApp = startApp();
      const { entitiesMap, arrange } = ListCastMembersFixture.arrangeIncrementedWithCreatedAt();

      beforeEach(async () => {
        castMemberRepo = nestApp.app.get<ICastMemberRepository>(
          CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
        );
        await castMemberRepo.bulkInsert(Object.values(entitiesMap));
      });
      // ...
    });
  });
});
```

Helper de comparação reutilizável:

```
const toExpectedBody = (entities, meta) => ({
  data: entities.map((e) =>
    instanceToPlain(CastMembersController.serialize(CastMemberOutputMapper.toOutput(e))),
  ),
  meta,
});
```

---

## 2. Passo a passo dos testes

### Passo 1 — `describe('should return cast members sorted by created_at when request query is empty')`

`ListCastMembersFixture.arrangeIncrementedWithCreatedAt()`: 4 entidades com `name = '0'..'3'` e `created_at` incrementais de 2s. `entitiesMap = { first, second, third, fourth }`.


| `send_data`                | `expected.entities` (ordem)      | `expected.meta`                                             |
| -------------------------- | -------------------------------- | ----------------------------------------------------------- |
| `{}`                       | `[fourth, third, second, first]` | `{ current_page: 1, last_page: 1, per_page: 15, total: 4 }` |
| `{ page: 1, per_page: 2 }` | `[fourth, third]`                | `{ current_page: 1, last_page: 2, per_page: 2, total: 4 }`  |
| `{ page: 2, per_page: 2 }` | `[second, first]`                | `{ current_page: 2, last_page: 2, per_page: 2, total: 4 }`  |
| `{ page: 3, per_page: 2 }` | `[]`                             | `{ current_page: 3, last_page: 2, per_page: 2, total: 4 }`  |

Verifica: ordenação default `created_at DESC`, paginação, `last_page` calculado, página além do fim retornando lista vazia sem erro.

### Passo 2 — `describe('should apply defaults for invalid pagination params')`

`SearchParams` sanitiza silenciosamente valores inválidos em vez de rejeitar. Congelar isso:


| `send_data`                | Resultado esperado                    |
| -------------------------- | ------------------------------------- |
| `{ page: 0, per_page: 2 }` | `current_page: 1` (page ≤ 0 → 1)    |
| `{ page: -1 }`             | `current_page: 1`                     |
| `{ page: 'a' }`            | `current_page: 1` (NaN → 1)          |
| `{ page: 1.5 }`            | `current_page: 1` (não-inteiro → 1) |
| `{ per_page: 0 }`          | `per_page: 15` (≤ 0 → default)      |
| `{ per_page: 'a' }`        | `per_page: 15`                        |
| `{ per_page: -5 }`         | `per_page: 15`                        |

Reaproveitar o mesmo `entitiesMap` do Passo 1 e assertar apenas o bloco `meta` (`expect(res.body.meta).toStrictEqual(...)`) — mais legível que comparar o `data` inteiro.

### Passo 3 — `describe('should return cast members using paginate, filter by name and sort')`

`ListCastMembersFixture.arrangeUnsorted()`, 5 entidades por nome: `a`, `AAA`, `AaA`, `b`, `c` (todos actors, para isolar o filtro de nome).


| `send_data`                                                                       | `expected.entities` | `expected.meta`                                            |
| --------------------------------------------------------------------------------- | ------------------- | ---------------------------------------------------------- |
| `{ page: 1, per_page: 2, sort: 'name', filter: { name: 'a' } }`                   | `[AAA, AaA]`        | `{ total: 3, current_page: 1, last_page: 2, per_page: 2 }` |
| `{ page: 2, per_page: 2, sort: 'name', filter: { name: 'a' } }`                   | `[a]`               | `{ total: 3, current_page: 2, last_page: 2, per_page: 2 }` |
| `{ page: 1, per_page: 2, sort: 'name', sort_dir: 'desc', filter: { name: 'a' } }` | `[a, AaA]`          | `{ total: 3, ... }`                                        |

> ⚠️ **A expectativa de ordem case-sensitive (`AAA` < `AaA` < `a`) depende de um bug não corrigido — ver §3.3.** Rodar primeiro, ler a ordem real do MySQL, e só então fixar a fixture. Se a collation for case-insensitive, a ordem sai `a, AAA, AaA` (ou instável entre `AAA`/`AaA`). Não fixar uma ordem que o banco não garante: se `AAA` e `AaA` empatarem sob collation CI, o teste fica flaky. Nesse cenário, escolher nomes que não colidam sob CI (ex: `aaa`, `bbb`, `ccc` + um `Xa`) e mover a verificação case-sensitive para um `it.failing` separado.
>
> ⚠️ **O filtro de nome hoje é sufixo, não substring — ver §3.1.** O padrão gerado é `LIKE '%a'` (falta o `%` final). Com os nomes `a`/`AAA`/`AaA`, todos terminam em `a`/`A`, então `total: 3` sai correto **por coincidência**. Adicionar um caso que separa os comportamentos: incluir uma entidade `ab` no arranje e filtrar por `name: 'a'`. Com o bug, `ab` **não** aparece (`total` continua 3); com o comportamento correto (`%a%`), apareceria (`total: 4`). Escrever esse caso como `it.failing` com a expectativa correta.

### Passo 4 — `describe('should filter by type')`

Arranje: 2 actors + 3 directors, nomes distintos.


| `send_data`                                              | Esperado                       |
| -------------------------------------------------------- | ------------------------------ |
| `{ filter: { type: CastMemberTypes.ACTOR } }`            | 2 itens, todos com`type: 2`    |
| `{ filter: { type: CastMemberTypes.DIRECTOR } }`         | 3 itens, todos com`type: 1`    |
| `{ filter: { name: 'x', type: CastMemberTypes.ACTOR } }` | intersecção dos dois filtros |

> ⚠️ **Este bloco provavelmente falha por completo hoje — ver §3.1 e §3.2.** Dois problemas independentes: (a) o `where` de nome é montado mesmo quando só `type` foi informado, gerando `name LIKE '%undefined'` → zero resultados; (b) `where['type']` recebe a **instância do VO** `CastMemberType` em vez do número. Escrever o bloco com as expectativas corretas e marcá-lo `describe.skip` ou os testes como `it.failing`, com comentário apontando para as linhas do repositório. É o bloco que mais justifica este plano existir.

### Passo 5 — `describe('should ignore non-sortable sort fields')`


| `send_data`                               | Esperado                                                                     |
| ----------------------------------------- | ---------------------------------------------------------------------------- |
| `{ sort: 'type' }`                        | cai no default`created_at DESC` (`type` não está em `sortableFields`)      |
| `{ sort: 'cast_member_id' }`              | idem                                                                         |
| `{ sort: 'invalid_field' }`               | idem —**não** deve retornar 500 nem erro de SQL                            |
| `{ sort: 'created_at', sort_dir: 'asc' }` | ordem crescente por`created_at`                                              |
| `{ sort: 'name', sort_dir: 'bogus' }`     | `sort_dir` inválido → `'asc'` (ver setter de `sort_dir` em `SearchParams`) |

O caso `invalid_field` é o mais importante: prova que o guard `this.sortableFields.includes(props.sort)` protege contra injeção de coluna no `ORDER BY`.

### Passo 6 — `describe('should return an error when filter type is invalid')`

`CastMemberSearchParams.create` lança `SearchValidationError` quando `CastMemberType.create(type)` falha.


| `send_data`                 | Esperado hoje                                                                       |
| --------------------------- | ----------------------------------------------------------------------------------- |
| `{ filter: { type: 3 } }`   | ⚠️`500` — não há filtro `@Catch(SearchValidationError)` em `applyGlobalConfig` |
| `{ filter: { type: 'a' } }` | ⚠️ ver §3.4                                                                      |

Comportamento **desejado**: `422 { statusCode: 422, error: 'Unprocessable Entity', message: ['Invalid cast member type: 3'] }`.

Escrever com a expectativa desejada, marcar `it.failing`, e abrir tarefa: `SearchValidationError` estende `BaseValidationError` igual a `EntityValidationError`, mas o `EntityValidationErrorFilter` só captura `EntityValidationError`. A correção é um filtro novo (ou generalizar o existente para `BaseValidationError`).

### Passo 7 — casos de borda (um `it` cada)

1. **Banco vazio** — `GET /cast-members` sem nenhum registro → `200` com `{ data: [], meta: { current_page: 1, last_page: 0, per_page: 15, total: 0 } }`. Confirmar o valor real de `last_page` em `PaginationPresenter`/`PaginationOutputMapper` (pode ser `0` ou `1`) e fixar.
2. **Filtro sem resultado** — `{ filter: { name: 'zzzzzz' } }` → `data: []`, `total: 0`.
3. **`filter` vazio** — `{ filter: {} }` → equivalente a sem filtro. O setter de `filter` em `CastMemberSearchParams` zera o filtro quando nenhuma chave sobra (`Object.keys(filter).length === 0 → null`); confirmar que não vira `WHERE` algum.
4. **Chaves do item da lista** — `expect(Object.keys(res.body.data[0])).toStrictEqual(['cast_member_id', 'name', 'type', 'created_at'])`. Mesmo contrato do `GET /:id`.
5. **Chaves do envelope** — `expect(Object.keys(res.body)).toStrictEqual(['data', 'meta'])`. Note que aqui o `WrapperDataInterceptor` **não** deve aninhar duas vezes (o presenter de coleção já traz `data`); verificar que não sai `{ data: { data: [...], meta: {...} } }`.

---

## 3. Bugs conhecidos que afetam este spec

Todos em `src/core/cast_member/infra/db/sequelize/cast_member-sequelize.repository.ts`, método `search()` e `formatSort()`.

### 3.1 Filtro de nome aplicado quando só `type` foi informado, e padrão `LIKE` incompleto

```typescript
if (props.filter && (props.filter.name || props.filter.type)) {
  where['name'] = { [Op.like]: `%${props.filter.name}` }
}
```

Dois defeitos numa linha:

- A condição dispara se **`type`** existir, mesmo sem `name`. Com `filter: { type: 1 }`, `props.filter.name` é `undefined` → `WHERE name LIKE '%undefined'` → sempre zero resultados.
- O padrão é `` `%${name}` ``, sem `%` no fim → busca por **sufixo**, não substring. `filter: { name: 'a' }` não acha `'ab'`.

Correção esperada: `if (props.filter?.name) { where['name'] = { [Op.like]: \`%${props.filter.name}%\` } }`.

### 3.2 `where['type']` recebe o VO em vez do número

```typescript
if (props.filter?.type) { where['type'] = props.filter.type; }
```

`CastMemberFilter.type` é `CastMemberType | null` — uma instância de VO. Sequelize recebe um objeto onde espera um inteiro; o resultado é erro de bind ou zero matches. Correção: `where['type'] = props.filter.type.type`.

### 3.3 `formatSort` nunca aplica o `binary name` do MySQL

```typescript
if (this.orderBy[dialect] && this.orderBy[sort]) { return this.orderBy[dialect][sort](sort_dir); }
```

A segunda condição deveria ser `this.orderBy[dialect][sort]`. Como `this.orderBy['name']` é `undefined`, o guard nunca passa e a função cai no `return [[sort, sort_dir]]` genérico. Efeito: no MySQL, ordenar por `name` usa a collation default (case-insensitive), não `binary`. É exatamente o que torna a expectativa `AAA < AaA < a` do Passo 3 incerta.

### 3.4 `type` chega como string na query e o VO valida com `==`

`SearchCastMembersDto` não tem decorators de `class-validator` nem `@Type(() => Number)`, e `filter` é um objeto plano — o `ValidationPipe` não tem o que validar nem transformar em profundidade. Portanto `?filter[type]=1` chega como `'1'` (string).

Em `CastMemberType.validate()` a comparação é `==` (loose), então `'1' == 1` é `true` e o VO é construído sem erro. Ou seja: o valor atravessa, mas como string coagida — e depois entra no `where` como VO (§3.2). Já `?filter[type]=a` produz `'a' == 1 → false` → `InvalidCastMemberTypeError` → `SearchValidationError` → `500` (Passo 6).

Ao escrever o Passo 4 e o Passo 6, lembrar que os valores vêm como **string** da query, não como número. Isso muda o que se pode esperar das mensagens de erro (`Invalid cast member type: a`, não `: NaN`).

---

## 4. Ordem sugerida de construção

1. Criar a fixture com `arrangeIncrementedWithCreatedAt()` e escrever o **Passo 1** — é o único bloco que não depende de nenhum dos bugs. Deve passar de primeira.
2. **Passo 2** e **Passo 5** — também independentes dos bugs (sanitização de params e guard de `sortableFields`).
3. **Passo 7** (bordas) — idem.
4. **Passo 3** — rodar, ler a ordem real, fixar; adicionar o `it.failing` do filtro substring.
5. **Passo 4** e **Passo 6** — escrever com as expectativas corretas, marcar como `failing`/`skip`, abrir tarefas de correção referenciando §3.1, §3.2 e §3.4.
