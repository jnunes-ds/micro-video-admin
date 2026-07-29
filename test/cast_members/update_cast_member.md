# Plano de testes E2E — `update_cast_member`

Arquivo alvo: `test/cast_members/update_cast_member.e2e-spec.ts`

Usecase: `src/core/cast_member/application/usecases/update_cast_member/update_cast_member.usecase.ts`
Rota: `PATCH /cast-members/:id` → `CastMembersController.update`

---

## 0. Contexto levantado do código


| Item                    | Valor                                                                                                                                          |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Rota                    | `PATCH /cast-members/:id`, `id` passa por `ParseUUIDPipe({ errorHttpStatusCode: 422 })`                                                        |
| Status de sucesso       | `200 OK`                                                                                                                                       |
| Chaves da resposta      | `['cast_member_id', 'name', 'type', 'created_at']`                                                                                             |
| DTO de entrada          | `UpdateCastmemberDto extends OmitType(UpdateCastMemberInput, ['cast_member_id'])` → `name: @IsString @IsOptional`, `type: @IsInt @IsOptional` |
| Montagem do input       | Controller faz`execute({ cast_member_id: id, ...dto })`                                                                                        |
| Erro de id inválido    | `422 { statusCode: 422, error: 'Unprocessable Entity', message: 'Validation failed (uuid is expected)' }`                                      |
| Erro de não encontrado | `404 { statusCode: 404, error: 'Not Found', message: 'CastMember Not found using ID <id>' }`                                                   |
| Semântica do usecase   | `if (input.name) changeName(...)`; `if (input.type) changeType(new CastMemberType(input.type))`                                                |

---

## 1. Pré-requisitos

### 1.1 Adicionar `UpdateCastMemberFixture` em `src/nest-modules/cast_members/testing/cast_member_fixture.ts`

```typescript
export class UpdateCastMemberFixture {
  static keysInResponse = ['cast_member_id', 'name', 'type', 'created_at'];
  static arrangeForUpdate()                 // atualizações válidas
  static arrangeInvalidRequest()            // falhas do ValidationPipe
  static arrangeForEntityValidationError()  // falhas do domínio
}
```

### 1.2 Estrutura do spec

Seguir o padrão de `test/categories/update_category.e2e-spec.ts`: **um `startApp()` por `describe` interno** (não um só no topo), porque cada bloco cria suas próprias entidades e um `sync({ force: true })` compartilhado entre blocos com arranges estáticos gera interferência.

```typescript
describe('CastMembersController (e2e)', () => {
  const uuid = '9366b7dc-2d71-4799-b91c-c64adb205104'; // uuid válido, inexistente

  describe('/cast-members/:id (PATCH)', () => {
    describe('should a response error when id is invalid or not found', () => { const nestApp = startApp(); ... });
    describe('should a response error with 422 when request body is invalid', () => { const app = startApp(); ... });
    describe('should a response error with 422 when throw EntityValidationError', () => { const app = startApp(); ... });
    describe('should update a cast member', () => { const appHelper = startApp(); ... });
  });
});
```

---

## 2. Passo a passo dos testes

### Passo 1 — `describe('should a response error when id is invalid or not found')`

Arrange inline (não precisa de fixture), com um faker de apoio: `const faker = CastMember.fake().anActor();`


| `id`                                                                 | `send_data`            | `expected`                                                                                                               |
| -------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `'88ff2587-ce5a-4769-a8c6-1d63d29c5f7a'` (uuid válido, inexistente) | `{ name: faker.name }` | `{ statusCode: 404, error: 'Not Found', message: 'CastMember Not found using ID 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a' }` |
| `'fake id'`                                                          | `{ name: faker.name }` | `{ statusCode: 422, error: 'Unprocessable Entity', message: 'Validation failed (uuid is expected)' }`                    |
| `'123'`                                                              | `{ name: faker.name }` | igual ao anterior (422)                                                                                                  |

`test.each(arrange)('when id is $id', ...)` → `.patch(\`/cast-members/${id}\`).send(send_data).expect(expected.statusCode).expect(expected)`.

> ⚠️ Ver §3.1: o 404 chega, mas por um caminho diferente do esperado. A mensagem coincide, então o teste passa — registrar isso em comentário no spec para não confundir quem for depurar depois.

### Passo 2 — `describe('should a response error with 422 when request body is invalid')`

`UpdateCastMemberFixture.arrangeInvalidRequest()`, usando o `uuid` constante (não precisa de entidade no banco: o `ValidationPipe` roda antes do usecase).


| Rótulo                 | `send_data`              | `message` esperada                                            |
| ----------------------- | ------------------------ | ------------------------------------------------------------- |
| `NAME_NOT_A_STRING`     | `{ name: 5 }`            | `['name must be a string']`                                   |
| `TYPE_NOT_A_NUMBER`     | `{ type: 'a' }`          | `['type must be an integer number']`                          |
| `TYPE_NOT_AN_INTEGER`   | `{ type: 1.5 }`          | `['type must be an integer number']`                          |
| `NAME_AND_TYPE_INVALID` | `{ name: 5, type: 'a' }` | `['name must be a string', 'type must be an integer number']` |

> `name: null` **não** entra aqui: `@IsOptional()` deixa `null` passar pelo DTO, e o usecase ignora com `if (input.name)`. Esse caso pertence ao Passo 4 (no-op).

### Passo 3 — `describe('should a response error with 422 when throw EntityValidationError')`

Aqui é obrigatório **inserir uma entidade real antes** de cada requisição (`castMemberRepo.insert(CastMember.fake().anActor().build())`), porque o usecase precisa achar o registro para chegar à validação.

`UpdateCastMemberFixture.arrangeForEntityValidationError()`:


| Rótulo         | `send_data`                                     | Origem                                                    | `message` esperada                                         |
| --------------- | ----------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------- |
| `NAME_TOO_LONG` | `{ name: faker.withInvalidNameTooLong().name }` | `changeName` → `validate(['name'])` → `@MaxLength(255)` | `['name must be shorter than or equal to 255 characters']` |

> Note que só existe **um** caso viável aqui hoje. O caso natural de par (`type: 3`) **não** produz 422 — ver §3.2. Enquanto o bug não for corrigido, esse caso vai para o Passo 5 documentando o `500`.

### Passo 4 — `describe('should update a cast member')`

`UpdateCastMemberFixture.arrangeForUpdate()`. Cada caso: inserir entidade nova, fazer o `PATCH`, comparar.


| `send_data`                                        | `expected`                                     |
| -------------------------------------------------- | ---------------------------------------------- |
| `{ name: 'John Updated' }`                         | `{ name: 'John Updated' }` (type preservado)   |
| `{ type: CastMemberTypes.DIRECTOR }`               | `{ type: 1 }` (name preservado)                |
| `{ name: 'Jane', type: CastMemberTypes.DIRECTOR }` | `{ name: 'Jane', type: 1 }`                    |
| `{ name: 'Jane', type: CastMemberTypes.ACTOR }`    | `{ name: 'Jane', type: 2 }`                    |
| `{}` (corpo vazio)                                 | nada muda — name e type originais preservados |

Fluxo de cada teste:

1. `const created = CastMember.fake().anActor().build(); await castMemberRepo.insert(created);`
   Para o caso "muda só o name preservando type", inserir com um tipo conhecido (`.aDirector()`) para que a preservação seja verificável.
2. `PATCH /cast-members/${created.cast_member_id.id}` com `send_data`, esperar `HttpStatus.OK`.
3. `expect(Object.keys(res.body)).toStrictEqual(['data'])` e `expect(Object.keys(res.body.data)).toStrictEqual(UpdateCastMemberFixture.keysInResponse)`.
4. Reler do banco: `const updated = await castMemberRepo.findById(new CastMemberId(res.body.data.cast_member_id))` — confirma persistência.
5. `const serialized = instanceToPlain(CastMembersController.serialize(CastMemberOutputMapper.toOutput(updated!)))`.
6. `expect(res.body.data).toStrictEqual(serialized)`.
7. Asserção final amarrando ao arrange, no estilo do spec de categoria:
   ```
   expect(res.body.data).toStrictEqual({
     cast_member_id: serialized.cast_member_id,
     created_at: serialized.created_at,
     name: expected.name ?? updated!.name,
     type: expected.type ?? updated!.type.type,   // atenção: .type.type — é um VO
   });
   ```
8. **`created_at` não muda** — comparar `res.body.data.created_at` com `created.created_at.toISOString()`.

### Passo 5 — `describe('no-op e comportamentos limítrofes')` (um `it` cada)

1. **`{ name: '' }` é ignorado** — `@IsOptional` não barra string vazia? Confirmar: `@IsString()` passa em `''`, e `if (input.name)` no usecase é falsy → nada muda. Esperar `200` com o name original. (Se o `ValidationPipe` barrar, o caso migra para o Passo 2 — decidir pela execução real.)
2. **`{ name: null }` é ignorado** — esperar `200` e name original preservado.
3. **`{ type: null }` é ignorado** — esperar `200` e type original preservado.
4. **`{ type: 0 }` é ignorado** — `0` é falsy, então `if (input.type)` não dispara e `changeType` nunca roda. Esperar `200` sem mudança. Isso é um comportamento sutil e merece teste explícito para não regredir silenciosamente.
5. **`{ type: 3 }` (inválido) — hoje retorna `500`.** Ver §3.2. Escrever o teste com o comportamento que se deseja (`422` + `['Invalid cast member type: 3']`) e marcá-lo `it.failing(...)` ou `it.todo(...)` até o usecase ser corrigido — assim o teste documenta o bug em vez de o esconder.
6. **`cast_member_id` no corpo é ignorado** — enviar `{ cast_member_id: '<outro uuid>', name: 'x' }`. O `OmitType` remove a propriedade do DTO, mas sem `whitelist` no `ValidationPipe` ela sobrevive no objeto e o spread `{ cast_member_id: id, ...dto }` do controller a coloca **depois**, sobrescrevendo o id da URL. Testar que o registro atualizado é o da URL — se falhar, é um bug real de segurança leve (id da rota ignorável pelo corpo) e deve ser reportado.

---

## 3. Pontos de atenção / possíveis bloqueios

### 3.1 `findById` do repositório Sequelize lança em vez de retornar `null`

`CastMemberSequelizeRepository.findById` (`src/core/cast_member/infra/db/sequelize/cast_member-sequelize.repository.ts`) faz:

```
const castMember = await this.castMemberModel.findByPk(id.id);
if (!castMember) { throw new NotFoundError(id.id, CastMember); }
```

Consequência: o `if (!castMember) throw new NotFoundError(...)` **dentro do usecase nunca é alcançado**. O 404 vem do repositório. A mensagem é idêntica (`CastMember Not found using ID <id>`), então o teste do Passo 1 passa — mas o contrato `IRepository.findById(): Promise<Entity | null>` está violado. Registrar em comentário no spec e abrir tarefa para corrigir o repositório (ver também o plano de `delete_cast_member`, onde isso quebra uma asserção de verdade).

### 3.2 `changeType` com tipo inválido gera `500`, não `422`

`UpdateCastMemberUsecase` faz `castMember.changeType(new CastMemberType(input.type))` — o **construtor** de `CastMemberType` lança `InvalidCastMemberTypeError` diretamente. Não existe filtro `@Catch(InvalidCastMemberTypeError)` registrado em `applyGlobalConfig`, logo a resposta é `500 Internal Server Error`.

Compare com `CreateCastMemberUsecase`, que usa `CastMemberType.create(...).asArray()` e acumula o erro na notification → `422` correto. O update deveria seguir o mesmo padrão.

O `@IsInt()` do DTO filtra strings e floats, então só inteiros fora de `{1, 2}` (`0`, `3`, `-1`, `99`) chegam a esse ponto — e `0` escapa pelo `if (input.type)` falsy. Ou seja, os disparadores reais do `500` são `3`, `-1`, `99` etc.

### 3.3 `type` na resposta é `number`, mas na entidade é VO

`CastMemberOutputMapper.toOutput` usa `entity.toJSON()`, que já converte `type` para `this.type.type` (o número). Ao comparar contra a entidade lida do banco, usar `updated.type.type`, não `updated.type` — senão a comparação falha com "object vs number".

### 3.4 Isolamento entre blocos

`startApp()` roda `sync({ force: true })` em cada `beforeEach`. Arranges estáticos criados **fora** dos hooks (como `const faker = CastMember.fake()...`) são avaliados uma vez no load do módulo; isso é ok para dados, mas qualquer `insert` deve estar dentro de `beforeEach` ou do corpo do teste.
