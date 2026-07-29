# Plano de testes E2E — `get_cast_member`

Arquivo alvo: `test/cast_members/get_cast_member.e2e-spec.ts`

Usecase: `src/core/cast_member/application/usecases/get_cast_member/get_cast_member.usecase.ts`
Rota: `GET /cast-members/:id` → `CastMembersController.findOne`

---

## 0. Contexto levantado do código


| Item                    | Valor                                                                                                          |
| ----------------------- | -------------------------------------------------------------------------------------------------------------- |
| Rota                    | `GET /cast-members/:id`, `id` via `ParseUUIDPipe({ errorHttpStatusCode: 422 })`                                |
| Status de sucesso       | `200 OK`                                                                                                       |
| Chaves da resposta      | `['cast_member_id', 'name', 'type', 'created_at']`                                                             |
| Input do usecase        | `{ id: string }`                                                                                               |
| Mapper usado            | ⚠️`CastMemberModelMapper.toOutput` (do arquivo do repositório Sequelize), **não** `CastMemberOutputMapper` |
| Erro de não encontrado | `404 { statusCode: 404, error: 'Not Found', message: 'CastMember Not found using ID <id>' }`                   |
| Erro de id malformado   | `422 { statusCode: 422, error: 'Unprocessable Entity', message: 'Validation failed (uuid is expected)' }`      |

---

## 1. Pré-requisitos

### 1.1 Adicionar `GetCastMemberFixture` em `src/nest-modules/cast_members/testing/cast_member_fixture.ts`

Mínimo necessário (espelhando `GetCategoryFixture`):

```typescript
export class GetCastMemberFixture {
  static keysInResponse = ['cast_member_id', 'name', 'type', 'created_at'];
}
```

Vale extrair essa lista para uma const `_keysInResponse` compartilhada no arquivo de fixture, como o `category_fixture.ts` faz — as quatro fixtures (create/get/update/list) usam a mesma lista.

### 1.2 Estrutura do spec

Um único `startApp()` no topo é suficiente aqui (o spec de `get_category` faz assim):

```typescript
describe('CastMembersController (e2e)', () => {
  const nestApp = startApp();

  describe('/cast-members/:id (GET)', () => {
    describe('should a response error when id is invalid or not found', () => { /* ... */ });
    it('should return a cast member', async () => { /* ... */ });
  });
});
```

---

## 2. Passo a passo dos testes

### Passo 1 — `describe('should a response error when id is invalid or not found')`

Arrange inline:


| `id`                                                              | `expected`                                                                                                                                |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `'88ff2587-ce5a-4769-a8c6-1d63d29c5f7a'` (uuid válido, ausente)  | `{ statusCode: HttpStatus.NOT_FOUND, error: 'Not Found', message: 'CastMember Not found using ID 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a' }` |
| `'fake id'`                                                       | `{ statusCode: HttpStatus.UNPROCESSABLE_ENTITY, error: 'Unprocessable Entity', message: 'Validation failed (uuid is expected)' }`         |
| `'123'`                                                           | igual ao anterior (422)                                                                                                                   |
| `'9366b7dc-2d71-4799-b91c-c64adb20510'` (uuid truncado, 35 chars) | igual (422) — cobre o caso "quase válido"                                                                                               |

```typescript
test.each(arrange)('when id is $id', async ({ id, expected }) =>
  request(nestApp.app.getHttpServer())
    .get(`/cast-members/${id}`)
    .expect(expected.statusCode)
    .expect(expected),
);
```

> A ordem importa: o `ParseUUIDPipe` roda **antes** do usecase, então id malformado é sempre 422 e nunca chega ao banco. Um uuid bem-formado mas inexistente é 404.

### Passo 2 — `it('should return a cast member')`

1. Obter o repositório: `const castMemberRepo = nestApp.app.get<ICastMemberRepository>(CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide)`.
2. `const castMember = CastMember.fake().anActor().build(); await castMemberRepo.insert(castMember);`
3. `GET /cast-members/${castMember.cast_member_id.id}` → `HttpStatus.OK`.
4. `expect(Object.keys(res.body)).toStrictEqual(['data'])`.
5. `expect(Object.keys(res.body.data)).toStrictEqual(GetCastMemberFixture.keysInResponse)`.
6. `const serialized = instanceToPlain(CastMembersController.serialize(CastMemberOutputMapper.toOutput(castMember)))`.
7. `expect(res.body.data).toStrictEqual(serialized)`.

### Passo 3 — variações de tipo (`test.each`)

Rodar o mesmo fluxo do Passo 2 para os dois tipos, garantindo que o valor numérico atravessa a stack intacto:


| Builder                         | `type` esperado no body |
| ------------------------------- | ----------------------- |
| `CastMember.fake().anActor()`   | `2`                     |
| `CastMember.fake().aDirector()` | `1`                     |

Assertar `expect(res.body.data.type).toBe(CastMemberTypes.ACTOR)` / `.toBe(CastMemberTypes.DIRECTOR)` — número puro, não objeto.

### Passo 4 — asserções de contrato de serialização (um `it` cada)

1. **`created_at` sai como ISO string** — `expect(res.body.data.created_at).toBe(castMember.created_at.toISOString())`. Cobre o `@Transform` do `CastMemberPresenter`.
2. **`type` é `number`, não o VO serializado** — `expect(typeof res.body.data.type).toBe('number')`. Protege contra alguém trocar o mapper por um que vaze `{ type: 2 }` aninhado.
3. **Não há chave `id`** — `expect(res.body.data).not.toHaveProperty('id')`. Divergência intencional em relação a categorias (que expõem `id`); travar isso evita quebrar clientes sem perceber.
4. **Um `GET` não altera o registro** — reler pelo repositório após a requisição e comparar `toJSON()` com o original.

### Passo 5 — `it('should return the right cast member when several exist')`

Inserir 3 cast members via `bulkInsert` (`CastMember.fake().theCastMembers(3).build()`), buscar o **segundo** pelo id e conferir que o body corresponde exatamente a ele (name e type do segundo, não do primeiro). Barato e pega erros de `findByPk`/mapeamento.

---

## 3. Pontos de atenção / possíveis bloqueios

### 3.1 O usecase usa o mapper "errado" (mas equivalente hoje)

`GetCastMemberUsecase.execute` retorna `CastMemberModelMapper.toOutput(entity)` — uma função definida em `cast_member-sequelize.repository.ts`, camada de infra, importada pela camada de aplicação. Isso inverte a dependência (application → infra) e destoa dos outros usecases, que usam `CastMemberOutputMapper.toOutput` de `application/usecases/common/cast_member_output.ts`.

Os dois produzem o mesmo resultado hoje:

- `CastMemberOutputMapper.toOutput` — lista os campos explicitamente.
- `CastMemberModelMapper.toOutput` — faz `{ cast_member_id: entity.cast_member_id.id, ...otherProps }` sobre `entity.toJSON()`.

Então o teste do Passo 2 pode usar `CastMemberOutputMapper` no lado esperado sem falhar. Mas: se `CastMember.toJSON()` ganhar um campo novo no futuro, o mapper do repositório passa a vazar esse campo na resposta e o do application não — e a asserção `toStrictEqual(keysInResponse)` do Passo 2.5 é justamente o que vai capturar a divergência. Manter essa asserção. Abrir tarefa para trocar o import no usecase.

### 3.2 `findById` lança em vez de retornar `null`

Como no plano de `update_cast_member` (§3.1): `CastMemberSequelizeRepository.findById` lança `NotFoundError` quando não acha, então o `if (!entity) throw new NotFoundError(...)` do usecase é código morto no caminho Sequelize. A resposta HTTP é 404 com a mesma mensagem, então o Passo 1 passa. Deixar comentário no spec explicando de onde o 404 realmente vem.

Efeito colateral relevante para este spec: **testes que usam o repositório in-memory** (se algum dia esse spec for adaptado) vão exercitar o caminho do usecase; os de Sequelize, o do repositório. Comportamento observável idêntico, origens diferentes.

### 3.3 `ParseUUIDPipe` sem versão fixada

`new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY })` aceita qualquer versão de UUID. Um UUID v1 bem-formado passa pelo pipe e resulta em 404, não 422. Se o teste incluir um id de versão diferente, esperar 404.
