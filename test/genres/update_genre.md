# Plano de testes E2E — `update_genre`

Arquivo alvo: `test/genres/update_genre.e2e-spec.ts`

Usecase: `src/core/genre/application/usecases/update_genre/update_genre.usecase.ts`
Rota: `PATCH /genres/:id` → `GenresController.update`

---

## 0. Contexto levantado do código

| Item                    | Valor                                                                                                                                          |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Rota                    | `PATCH /genres/:id`, `id` passa por `ParseUUIDPipe({ errorHttpStatusCode: 422 })`                                                        |
| Status de sucesso       | `200 OK`                                                                                                                                       |
| Chaves da resposta      | `['id', 'name', 'categories_id', 'categories', 'is_active', 'created_at']`                                                                     |
| DTO de entrada          | `UpdateGenreDto extends OmitType(UpdateGenreInput, ['id'])` → `name: @IsString @IsOptional`, `categories_id: @IsArray @IsOptional`, `is_active: @IsBoolean @IsOptional` |
| Montagem do input       | Controller faz`execute({ id, ...dto })`                                                                                        |
| Erro de id inválido    | `422 { statusCode: 422, error: 'Unprocessable Entity', message: 'Validation failed (uuid is expected)' }`                                      |
| Erro de não encontrado | `404 { statusCode: 404, error: 'Not Found', message: 'Genre Not found using ID <id>' }`                                                   |
| Semântica do usecase   | `if (input.name) changeName(...)`; atualização condicional.                                                |

---

## 1. Pré-requisitos

### 1.1 Adicionar `UpdateGenreFixture` em `src/nest-modules/genres/testing/genre_fixture.ts`

```typescript
export class UpdateGenreFixture {
  static keysInResponse = ['id', 'name', 'categories_id', 'categories', 'is_active', 'created_at'];
  static arrangeForUpdate()                 // atualizações válidas
  static arrangeInvalidRequest()            // falhas do ValidationPipe
  static arrangeForEntityValidationError()  // falhas do domínio
}
```

### 1.2 Estrutura do spec

```typescript
describe('GenresController (e2e)', () => {
  const uuid = '9366b7dc-2d71-4799-b91c-c64adb205104'; // uuid válido, inexistente

  describe('/genres/:id (PATCH)', () => {
    describe('should a response error when id is invalid or not found', () => { const nestApp = startApp(); ... });
    describe('should a response error with 422 when request body is invalid', () => { const app = startApp(); ... });
    describe('should a response error with 422 when throw EntityValidationError', () => { const app = startApp(); ... });
    describe('should update a genre', () => { const appHelper = startApp(); ... });
  });
});
```

---

## 2. Passo a passo dos testes

### Passo 1 — `describe('should a response error when id is invalid or not found')`

Testes simulando IDs de rotas mal formatados ou IDs válidos inexistentes.

### Passo 2 — `describe('should a response error with 422 when request body is invalid')`

Testar o formato do Body enviado. Validações referentes ao DTO.

### Passo 3 — `describe('should a response error with 422 when throw EntityValidationError')`

Testar o caso em que o `categories_id` passados no Body sejam falsos (IDs não existentes na tabela Category) ou quando as propriedades de Domain são inválidas (e.g., name muito longo).

### Passo 4 — `describe('should update a genre')`

`UpdateGenreFixture.arrangeForUpdate()`. Cada caso: inserir entidade nova, fazer o `PATCH`, comparar.
* Atualizar apenas o `name`
* Atualizar apenas o `categories_id`
* Atualizar o status (`is_active`)

### Passo 5 — `describe('no-op e comportamentos limítrofes')` (um `it` cada)

1. Enviar payload que não atualiza nada.
2. Atualizar enviando os mesmos valores atuais.
3. ID passado no corpo sendo sobrescrito pelo ID da rota.
