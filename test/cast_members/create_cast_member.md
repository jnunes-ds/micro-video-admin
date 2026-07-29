# Plano de testes E2E — `create_cast_member`

Arquivo alvo: `test/cast_members/create_cast_member.e2e-spec.ts`

Usecase: `src/core/cast_member/application/usecases/create_cast_member/create_cast_member.usecase.ts`
Rota: `POST /cast-members` → `CastMembersController.create`

---

## 0. Contexto levantado do código


| Item                            | Valor                                                                                                            |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Rota base                       | `/cast-members` (hífen, não underscore)                                                                        |
| Status de sucesso               | `201 CREATED`                                                                                                    |
| Chaves da resposta              | `['cast_member_id', 'name', 'type', 'created_at']` — **não existe `id`** (ver `CastMemberPresenter`)           |
| Envelope                        | `{ data: {...} }` (via `WrapperDataInterceptor`)                                                                 |
| DTO de entrada                  | `CreateCastMemberDto extends CreateCastMemberInput` → `name: @IsString @IsNotEmpty`, `type: @IsInt @IsNotEmpty` |
| Enum de tipo                    | `CastMemberTypes.DIRECTOR = 1`, `CastMemberTypes.ACTOR = 2`                                                      |
| Token do repositório           | `CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide` (`'CastMemberRepository'`)                   |
| Erro de validação de entidade | `EntityValidationErrorFilter` → `422 { statusCode, error: 'Unprocessable Entity', message: string[] }`          |
| Banco no E2E                    | MySQL (`envs/.env.e2e`, `NODE_ENV=e2e` via `test/jest-setup.ts`)                                                 |

---

## 1. Pré-requisitos (construir antes dos testes)

### 1.1 Criar `src/nest-modules/cast_members/testing/cast_member_fixture.ts`

Ainda **não existe** o equivalente de `category_fixture.ts` para cast members. É a primeira peça a construir. Deve exportar:

```
export class CreateCastMemberFixture {
  static keysInResponse = ['cast_member_id', 'name', 'type', 'created_at'];
  static arrangeForCreate()                 // casos válidos
  static arrangeInvalidRequest()            // falhas do ValidationPipe (DTO)
  static arrangeForEntityValidationError()  // falhas do domínio/usecase
}
```

Usar `CastMember.fake()` (`CastMemberFakeBuilder`) como fonte dos dados: `.anActor()`, `.aDirector()`, `.withName()`, `.withInvalidNameTooLong()`.

### 1.2 Esqueleto do spec

```typescript
import request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { startApp } from '@/nest-modules/shared/testing/helpers/start_app.helper';
import { CastMembersController } from '@/nest-modules/cast_members/cast_members.controller';
import { CAST_MEMBER_PROVIDERS } from '@/nest-modules/cast_members/cast_members.providers';
import { CreateCastMemberFixture } from '@/nest-modules/cast_members/testing/cast_member_fixture';
import { ICastMemberRepository } from '@core/cast_member/domain/cast_member.repository';
import { CastMemberId } from '@core/cast_member/domain/cast_member.aggregate';
import { CastMemberOutputMapper } from '@core/cast_member/application/usecases/common/cast_member_output';

describe('CastMembersController (e2e)', () => {
  const appHelper = startApp();
  let castMemberRepo: ICastMemberRepository;

  beforeEach(() => {
    castMemberRepo = appHelper.app.get<ICastMemberRepository>(
      CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
    );
  });

  describe('/cast-members (POST)', () => { /* ... */ });
});
```

`startApp()` já faz `sequelize.sync({ force: true })` no `beforeEach`, então cada teste começa com o banco limpo — não precisa de limpeza manual.

---

## 2. Passo a passo dos testes

### Passo 1 — `describe('should return a response error with status code 422 when request body is invalid')`

Casos vindos de `CreateCastMemberFixture.arrangeInvalidRequest()`. São falhas do `ValidationPipe` global (antes do usecase). Expectativa padrão: `{ statusCode: 422, error: 'Unprocessable Entity', message: [...] }`.


| Rótulo               | `send_data`                      | `message` esperada                                                                                                    |
| --------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `EMPTY`               | `{}`                             | `['name should not be empty', 'name must be a string', 'type should not be empty', 'type must be an integer number']` |
| `NAME_UNDEFINED`      | `{ name: undefined, type: 2 }`   | `['name should not be empty', 'name must be a string']`                                                               |
| `NAME_NULL`           | `{ name: null, type: 2 }`        | `['name should not be empty', 'name must be a string']`                                                               |
| `NAME_EMPTY`          | `{ name: '', type: 2 }`          | `['name should not be empty']`                                                                                        |
| `TYPE_UNDEFINED`      | `{ name: 'x', type: undefined }` | `['type should not be empty', 'type must be an integer number']`                                                      |
| `TYPE_NULL`           | `{ name: 'x', type: null }`      | `['type should not be empty', 'type must be an integer number']`                                                      |
| `TYPE_NOT_A_NUMBER`   | `{ name: 'x', type: 'a' }`       | `['type must be an integer number']`                                                                                  |
| `TYPE_NOT_AN_INTEGER` | `{ name: 'x', type: 1.5 }`       | `['type must be an integer number']`                                                                                  |

Implementação: iterar com `test.each` sobre `Object.keys(...)`, mapeando `{ label, value }` e conferindo com `.expect(HttpStatus.UNPROCESSABLE_ENTITY).expect(value.expected)`.

> **Atenção à ordem das mensagens.** O `class-validator` emite os erros na ordem em que os decorators são resolvidos por propriedade, e o array final é comparado com `toStrictEqual` implícito do supertest. Rodar uma vez, ler a saída real e fixar a ordem exata na fixture — não adivinhar.

### Passo 2 — `describe('should return a response error with status code 422 when throw EntityValidationError')`

Casos vindos de `CreateCastMemberFixture.arrangeForEntityValidationError()`. Aqui o corpo passa pelo DTO mas o domínio/usecase rejeita.


| Rótulo                          | `send_data`                                              | Origem do erro                                                           | `message` esperada                                                                        |
| -------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `NAME_TOO_LONG`                  | `{ name: faker.withInvalidNameTooLong().name, type: 2 }` | `CastMemberRules.name` `@MaxLength(255)`                                 | `['name must be shorter than or equal to 255 characters']`                                |
| `TYPE_INVALID`                   | `{ name: 'x', type: 3 }`                                 | `CastMemberType.create(3)` falha → `notification.setError(..., 'type')` | `['Invalid cast member type: 3']`                                                         |
| `TYPE_ZERO`                      | `{ name: 'x', type: 0 }`                                 | idem (0 não é 1 nem 2)                                                 | `['Invalid cast member type: 0']`                                                         |
| `NAME_TOO_LONG_AND_TYPE_INVALID` | `{ name: <256 chars>, type: 3 }`                         | ambos acumulam na`Notification`                                          | `['name must be shorter than or equal to 255 characters', 'Invalid cast member type: 3']` |

> Caso combinado é o mais valioso: prova que `CreateCastMemberUsecase` acumula o erro de tipo na notification (`setError`) em vez de lançar antes de validar o nome. Confirmar a ordem real no `EntityValidationErrorFilter` (que faz `union` dos valores) antes de fixar a fixture.

### Passo 3 — `describe('should create a cast member')`

Casos vindos de `CreateCastMemberFixture.arrangeForCreate()`:


| `send_data`                                            | `expected`                                                        |
| ------------------------------------------------------ | ----------------------------------------------------------------- |
| `{ name: 'John Doe', type: CastMemberTypes.ACTOR }`    | `{ name: 'John Doe', type: 2 }`                                   |
| `{ name: 'John Doe', type: CastMemberTypes.DIRECTOR }` | `{ name: 'John Doe', type: 1 }`                                   |
| `{ name: <string com 255 chars>, type: 2 }`            | `{ name: <mesmo>, type: 2 }` (limite exato aceito)                |
| `{ name: '  John  ', type: 2 }`                        | `{ name: '  John  ', type: 2 }` (documenta que **não** há trim) |

Fluxo de cada teste:

1. `POST /cast-members` com `send_data`, esperar `HttpStatus.CREATED`.
2. `expect(Object.keys(res.body)).toStrictEqual(['data'])`.
3. `expect(Object.keys(res.body.data)).toStrictEqual(CreateCastMemberFixture.keysInResponse)` — trava o contrato da resposta.
4. Recuperar do banco: `const created = await castMemberRepo.findById(new CastMemberId(res.body.data.cast_member_id))` — prova que houve persistência real, não só serialização.
5. Serializar o esperado:
   ```typescript
   const presenter = CastMembersController.serialize(CastMemberOutputMapper.toOutput(created!));
   const serialized = instanceToPlain(presenter);
   ```
6. `expect(res.body.data).toStrictEqual(serialized)`.
7. `expect(res.body.data).toStrictEqual({ cast_member_id: serialized.cast_member_id, created_at: serialized.created_at, ...expected })` — amarra os campos de negócio ao arrange.

### Passo 4 — asserções complementares (um `it` cada)

1. **`created_at` é ISO-8601** — `CastMemberPresenter` tem `@Transform(value => value.toISOString())`. Assertar `expect(res.body.data.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T/)` e `new Date(res.body.data.created_at).toString()` !== `'Invalid Date'`.
2. **`cast_member_id` é um UUID válido** — regex de UUID v4, ou `expect(() => new CastMemberId(res.body.data.cast_member_id)).not.toThrow()`.
3. **Campos extras no body são ignorados** — enviar `{ name: 'x', type: 2, cast_member_id: '<uuid>', created_at: '2020-01-01' }` e verificar que o id/created_at retornados **não** são os enviados (o `ValidationPipe` não usa `whitelist`/`forbidNonWhitelisted`, então extras passam mas o usecase os descarta). Documenta o comportamento atual.
4. **Duas criações com o mesmo nome geram ids distintos** — não há constraint de unicidade; dois `POST` idênticos devem retornar `201` duas vezes com ids diferentes.

---

## 3. Pontos de atenção / possíveis bloqueios

1. **`type` como string no JSON.** `@IsInt()` roda com `transform: true` no `ValidationPipe`, mas `CreateCastMemberInput` não tem `@Type(() => Number)`. Um corpo JSON com `type: "2"` (string) provavelmente falha com `type must be an integer number`. Vale um caso explícito em `arrangeInvalidRequest` para congelar esse comportamento — e, se o time decidir que string deve ser aceita, o teste vira o gatilho para adicionar `@Type`.
2. **Mensagens de erro devem ser lidas da execução real, não presumidas.** Escrever a fixture, rodar `npm run test:e2e -- create_cast_member`, copiar as mensagens exatas da saída. Isso vale tanto para a ordem quanto para o texto.
3. **E2E aponta para MySQL** (`envs/.env.e2e`), não sqlite. O banco `micro_videos_test` no host `db` precisa estar de pé (docker) antes de rodar. Verificar com `npm run test:e2e -- create_cast_member` isolado.
4. **`--runInBand` é obrigatório** (já está no script `test:e2e`), pois `sync({ force: true })` derruba as tabelas compartilhadas.
