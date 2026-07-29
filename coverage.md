# Relatório de Cobertura — Arquivos sem Cobertura

Gerado a partir de `coverage-final.json` (`npm run test:cov`, `coverageProvider: "v8"`).

- **Arquivos instrumentados:** 69
- **Arquivos com 0% de cobertura:** 14
- **Linhas não cobertas nesses arquivos:** 389

---

## Arquivos com 0% de cobertura

### `src/nest-modules/cast_members` — camada NestJS de Cast Member (7 arquivos)

| Arquivo | Linhas | Cobertura |
| --- | --- | --- |
| `src/nest-modules/cast_members/cast_members.providers.ts` | 93 | 0% |
| `src/nest-modules/cast_members/cast_members.controller.ts` | 88 | 0% |
| `src/nest-modules/cast_members/cast_members.presenter.ts` | 32 | 0% |
| `src/nest-modules/cast_members/cast_members.module.ts` | 15 | 0% |
| `src/nest-modules/cast_members/dto/search-cast-member.dto.ts` | 13 | 0% |
| `src/nest-modules/cast_members/dto/update-cast-member.dto.ts` | 9 | 0% |
| `src/nest-modules/cast_members/dto/create-cast-member.dto.ts` | 5 | 0% |

**Por que está zerado:** esses arquivos são exercitados apenas pelos testes e2e
(`test/cast_members/*.e2e-spec.ts`), que rodam por outra configuração
(`test/jest-e2e.config.ts` via `npm run test:e2e`) e não entram no relatório do
`npm run test:cov`. Em contraste, o módulo de Categories tem specs unitários
(`src/nest-modules/categories/__tests__/categories.controller.spec.ts` e
`categories.presenter.spec.ts`) e por isso aparece coberto.

**Ação sugerida:** criar `src/nest-modules/cast_members/__tests__/` com
`cast_members.controller.spec.ts` e `cast_members.presenter.spec.ts`, espelhando
os specs já existentes de Categories.

### Migrations e migrator (3 arquivos)

| Arquivo | Linhas | Cobertura |
| --- | --- | --- |
| `src/core/category/infra/db/sequelize/migrations/2026.06.20T17.44.08.create-categories-table.ts` | 34 | 0% |
| `src/core/cast_member/infra/db/sequelize/migrations/2026.07.23T15.09.17.create-cast-member-table.ts` | 28 | 0% |
| `src/core/@shared/infra/db/sequelize/migrator.ts` | 21 | 0% |

**Ação sugerida:** normalmente não vale escrever testes unitários para migrations.
Considere adicioná-las a `coveragePathIgnorePatterns` no `jest.config.ts`
(ex.: `'/migrations/'`, `'migrator.ts'`) para não distorcer o percentual global.

### Bootstrap e configuração (4 arquivos)

| Arquivo | Linhas | Cobertura |
| --- | --- | --- |
| `src/nest-modules/global_config.ts` | 26 | 0% |
| `src/migrate.ts` | 15 | 0% |
| `src/nest-modules/database/migrations.module.ts` | 6 | 0% |
| `src/nest-modules/shared/shared.module.ts` | 4 | 0% |

**Ação sugerida:** `src/migrate.ts` é um script de linha de comando e
`migrations.module.ts` / `shared.module.ts` são apenas fiação de módulos — bons
candidatos a `coveragePathIgnorePatterns` (o `jest.config.ts` já ignora
`app.module.ts` e `main.ts` pelo mesmo motivo). Já `global_config.ts` contém
lógica de validação de env que vale testar diretamente.

---

## Apêndice — Arquivos abaixo do limite de 80%

O `jest.config.ts` define `coverageThreshold` global de 80%. Além dos arquivos
zerados acima, estes ficam abaixo do limite:

| Arquivo | Cobertura | Linhas cobertas |
| --- | --- | --- |
| `src/nest-modules/categories/dto/search_categories.dto.ts` | 33,3% | 3/9 |
| `src/core/@shared/domain/validators/notification.ts` | 42,9% | 21/49 |
| `src/core/cast_member/infra/db/sequelize/cast_member-sequelize.repository.ts` | 52,2% | 95/182 |
| `src/core/@shared/domain/validators/validation.error.ts` | 63,4% | 26/41 |
| `src/core/cast_member/infra/db/in_memory/cast_member_in_memory.repository.ts` | 65,9% | 29/44 |
| `src/core/category/infra/db/sequelize/category-sequelize.repository.ts` | 67,8% | 103/152 |
| `src/core/cast_member/domain/cast_member_fake_builder.ts` | 70,3% | 97/138 |
| `src/core/@shared/domain/either.ts` | 77,8% | 77/99 |

---

## Notas sobre os dados

- Com `coverageProvider: "v8"`, os mapas de função e de branch do
  `coverage-final.json` deste projeto contêm apenas uma entrada agregada por
  arquivo, então as métricas confiáveis aqui são **statements/linhas**.
- Os caminhos no JSON estão como `/home/node/app/...` (execução em container);
  neste relatório foram normalizados para caminhos relativos à raiz do projeto.
