# Plano de testes E2E — `delete_cast_member`

Arquivo alvo: `test/cast_members/delete_cast_member.e2e-spec.ts`

Usecase: `src/core/cast_member/application/usecases/delete_cast_member/delete_cast_member.usecase.ts`
Rota: `DELETE /cast-members/:id` → `CastMembersController.remove`

---

## 0. Contexto levantado do código


| Item                    | Valor                                                                                                     |
| ----------------------- | --------------------------------------------------------------------------------------------------------- |
| Rota                    | `DELETE /cast-members/:id`, `id` via `ParseUUIDPipe({ errorHttpStatusCode: 422 })`                        |
| Status de sucesso       | `204 NO_CONTENT` (`@HttpCode(HttpStatus.NO_CONTENT)` no controller)                                       |
| Corpo da resposta       | vazio — o controller não retorna nada                                                                   |
| Input do usecase        | `{ id: string }`; output `void`                                                                           |
| Erro de não encontrado | `404 { statusCode: 404, error: 'Not Found', message: 'CastMember Not found using ID <id>' }`              |
| Erro de id malformado   | `422 { statusCode: 422, error: 'Unprocessable Entity', message: 'Validation failed (uuid is expected)' }` |

---

## 1. Pré-requisitos

Nenhuma fixture nova é necessária — este spec não tem arranges de corpo de requisição. Basta o fake builder e o helper `startApp()`.

### Estrutura do spec (padrão de `test/categories/delete_category.e2e-spec.ts`)

```typescript
import request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { startApp } from '@/nest-modules/shared/testing/helpers/start_app.helper';
import { CAST_MEMBER_PROVIDERS } from '@/nest-modules/cast_members/cast_members.providers';
import { ICastMemberRepository } from '@core/cast_member/domain/cast_member.repository';
import { CastMember } from '@core/cast_member/domain/cast_member.aggregate';

describe('CastMembersController (e2e)', () => {
  describe('/cast-members/:id (DELETE)', () => {
    const appHelper = startApp();
    // ...
  });
});
```

> Nota: o `describe` externo do spec de categoria está rotulado `'/delete/:id (DELETE)'`, o que não reflete a rota real. Usar `'/cast-members/:id (DELETE)'` aqui.

---

## 2. Passo a passo dos testes

### Passo 1 — `describe('should a response error when id is invalid or not found')`


| `id`                                                             | `expected`                                                                                                                                        |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `'88ff2587-ce5a-4769-a8c6-1d63d29c5f7a'` (uuid válido, ausente) | `{ statusCode: 404, error: 'Not Found', message: 'CastMember Not found using ID 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a' }`                          |
| `'fake id'`                                                      | `{ statusCode: 422, error: 'Unprocessable Entity', message: 'Validation failed (uuid is expected)' }`                                             |
| `''` (id vazio → rota `/cast-members/`)                         | ⚠️ cai no`@Get()` de busca, não no delete → `404` do Nest com mensagem própria (`Cannot DELETE /cast-members/`). Ver §3.3 antes de incluir. |

```typescript
test.each(arrange)('when id is $id', async ({ id, expected }) =>
  request(appHelper.app.getHttpServer())
    .delete(`/cast-members/${id}`)
    .expect(expected.statusCode)
    .expect(expected),
);
```

### Passo 2 — `it('should delete a cast member and respond with status 204')`

1. `const castMemberRepo = appHelper.app.get<ICastMemberRepository>(CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide);`
2. `const castMember = CastMember.fake().anActor().build(); await castMemberRepo.insert(castMember);`
3. `await request(...).delete(\`/cast-members/${castMember.cast_member_id.id}\`).expect(HttpStatus.NO_CONTENT);`
4. **Verificar que sumiu do banco.** ⚠️ Não usar `expects(repo.findById(id)).resolves.toBeNull()` — ver §3.1. Usar uma das alternativas:
   - `await expect(castMemberRepo.findById(castMember.cast_member_id)).rejects.toThrow(NotFoundError)` — congela o comportamento atual do repositório.
   - **Preferível:** verificar por um caminho que não dependa do bug —
     ```typescript
     const { not_exists } = await castMemberRepo.existsById([castMember.cast_member_id]);
     expect(not_exists).toHaveLength(1);
     ```

     ou `expect(await castMemberRepo.findAll()).toHaveLength(0)`.
   - Verificação por HTTP, que é a mais fiel ao E2E: `await request(...).get(\`/cast-members/${id}\`).expect(HttpStatus.NOT_FOUND)`.

Recomendação: usar a verificação por HTTP **e** `findAll()`. A primeira prova o contrato externo; a segunda, a persistência.

### Passo 3 — `it('should respond with an empty body')`

`const res = await request(...).delete(...).expect(HttpStatus.NO_CONTENT);`

- `expect(res.body).toEqual({})` — `204` não pode ter corpo. Confirma que o `WrapperDataInterceptor` não injeta `{ data: null }` numa resposta sem conteúdo (risco real: o interceptor envolve tudo indiscriminadamente).
- `expect(res.text).toBe('')`.

Esse teste é o mais propenso a revelar um problema no interceptor — vale isolá-lo.

### Passo 4 — `it('should delete only the target cast member')`

1. `bulkInsert` de 3 entidades (`CastMember.fake().theCastMembers(3).build()`).
2. `DELETE` no id do **segundo**.
3. `expect(HttpStatus.NO_CONTENT)`.
4. `const remaining = await castMemberRepo.findAll(); expect(remaining).toHaveLength(2);`
5. `expect(remaining.map(c => c.cast_member_id.id).sort()).toStrictEqual([first.id, third.id].sort())` — prova que o `where` do `destroy` está correto e não apagou tudo.

Este teste importa porque `CastMemberSequelizeRepository.delete` não checa `affectedRows`; um `where` malformado apagaria a tabela inteira em silêncio.

### Passo 5 — `it('should return 404 when deleting the same id twice')`

1. Inserir uma entidade.
2. Primeiro `DELETE` → `204`.
3. Segundo `DELETE` no mesmo id → `404` com `message: 'CastMember Not found using ID <id>'`.

Cobre idempotência e confirma que o `delete` não é silenciosamente bem-sucedido para registros ausentes.

### Passo 6 — `it('should not appear in the listing after deletion')`

1. `bulkInsert` de 2 entidades.
2. `DELETE` em uma.
3. `GET /cast-members` → `200`, `res.body.meta.total === 1` e `res.body.data` com um único item, o remanescente.

Fecha o ciclo entre delete e list pelo contrato HTTP, sem tocar no repositório.

### Passo 7 — variação por tipo (`test.each`)

Rodar o Passo 2 para `CastMember.fake().anActor()` e `CastMember.fake().aDirector()`. Barato, e garante que nada no caminho de delete depende do tipo.

---

## 3. Pontos de atenção / possíveis bloqueios

### 3.1 `findById` lança `NotFoundError` em vez de retornar `null` — quebra a asserção óbvia

Em `src/core/cast_member/infra/db/sequelize/cast_member-sequelize.repository.ts`:

```typescript
async findById(id: CastMemberId): Promise<CastMember | null> {
  const castMember = await this.castMemberModel.findByPk(id.id);
  if (!castMember) { throw new NotFoundError(id.id, CastMember); }
  return CastMemberModelMapper.toEntity(castMember);
}
```

A assinatura promete `CastMember | null`, mas a implementação lança. Consequências para este spec:

1. A asserção padrão copiada do spec de categoria —
   `await expect(castMemberRepo.findById(id)).resolves.toBeNull()`
   — **falha**, porque a promise rejeita em vez de resolver. Este é o bloqueio mais direto e a razão de o Passo 2.4 propor alternativas.
2. O `if (!entity) throw new NotFoundError(...)` dentro de `DeleteCastMemberUsecase` é código morto no caminho Sequelize: o 404 vem do repositório. A mensagem HTTP é idêntica, então o Passo 1 e o Passo 5 passam mesmo assim.

Ação: escrever o spec contornando o bug (Passo 2.4), deixar comentário apontando para esta seção, e abrir tarefa para corrigir o repositório para `return null`. Quando corrigido, a asserção `resolves.toBeNull()` volta a ser a forma canônica e os planos de `get`/`update` também são afetados.

### 3.2 `delete` não verifica `affectedRows`

```typescript
async delete(cast_member_id: CastMemberId): Promise<void> {
  await this.castMemberModel.destroy({ where: { cast_member_id: id } });
}
```

Diferente de `update`, que checa `affectedRows !== 1` e lança. Aqui, um delete que não afeta nada passa em silêncio. Hoje isso é mascarado porque o `findById` anterior já lançou — mas se o §3.1 for corrigido para `return null`, o usecase passa a fazer a checagem e o comportamento se mantém. Vale registrar: o Passo 5 (delete duplo) é o teste que protege esse contrato.

### 3.3 `DELETE /cast-members/` (id vazio)

Sem `id`, a URL não casa com `@Delete(':id')`. O Nest responde `404` com o formato **dele** (`{ message: 'Cannot DELETE /cast-members/', error: 'Not Found', statusCode: 404 }`), não com o do `NotFoundErrorFilter`. Se incluir esse caso, esperar essa mensagem — ou omiti-lo, já que testa o roteamento do framework, não o usecase. Sugestão: omitir do arrange principal e, se quiser cobrir, deixar um `it` isolado e explicitamente rotulado.

### 3.4 Ausência de cascata / relacionamentos

`CastMemberModel` não tem associações hoje. Quando cast members passarem a ser referenciados por vídeos, este spec precisará de casos de integridade referencial (delete bloqueado ou cascateado). Registrar como pendência futura, não como teste agora.

### 3.5 Ambiente

- E2E roda contra **MySQL** (`envs/.env.e2e`, `NODE_ENV=e2e` definido em `test/jest-setup.ts`), não sqlite. O serviço `db` precisa estar disponível.
- `npm run test:e2e -- delete_cast_member` para rodar só este arquivo. O `--runInBand` já vem no script e é necessário por causa do `sync({ force: true })` em cada `beforeEach`.
