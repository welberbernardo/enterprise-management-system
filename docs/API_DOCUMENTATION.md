# Documentação da API

Este documento descreve a API REST do **Sistema de Gestão Empresarial (EMS)**. A API é implementada com ASP.NET Core 9 e documentada ao vivo via Swagger UI (OpenAPI 3).

---

## Índice

- [Introdução](#introdução)
- [URL Base](#url-base)
- [Autenticação](#autenticação)
- [Tratamento de Erros](#tratamento-de-erros)
- [Formatos de Resposta Comuns](#formatos-de-resposta-comuns)
- [Paginação, Filtros e Ordenação](#paginação-filtros-e-ordenação)
- [Rate Limiting](#rate-limiting)
- [Uploads de Arquivo](#uploads-de-arquivo)
- [Swagger UI](#swagger-ui)
- [Módulo: Auth](#módulo-auth)
- [Módulo: Users](#módulo-users)
- [Módulo: Roles](#módulo-roles)
- [Módulo: Customers](#módulo-customers)
- [Módulo: Suppliers](#módulo-suppliers)
- [Módulo: Products](#módulo-products)
- [Módulo: Orders](#módulo-orders)
- [Módulo: Invoices](#módulo-invoices)
- [Módulo: Inventory](#módulo-inventory)
- [Módulo: Finance](#módulo-finance)
- [Módulo: Reports](#módulo-reports)
- [Módulo: Audit Logs](#módulo-audit-logs)

---

## Introdução

A API do EMS segue convenções REST. Ela usa JSON para corpos de requisição e resposta, retorna códigos HTTP apropriados e requer um **Bearer JWT** para todos os endpoints exceto autenticação.

---

## URL Base

```
http://localhost:5000/api
```

Em produção, substitua pela sua API hospedada, ex. `https://api.ems.example.com/api`.

Todos os endpoints abaixo são relativos a esta URL base e são **versionados** sob `/v1`.

---

## Autenticação

O EMS usa tokens **JWT Bearer** mais **refresh tokens**.

### Login

`POST /v1/auth/login`

**Corpo da requisição:**

```json
{
  "email": "admin@ems.local",
  "password": "Admin@12345"
}
```

**Resposta `200`:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "a1b2c3d4-...",
  "expiresAt": "2026-07-17T19:35:42Z",
  "user": {
    "id": "3f2a...",
    "email": "admin@ems.local",
    "fullName": "System Admin",
    "roles": ["Admin"]
  }
}
```

### Usando o token

Inclua-o no cabeçalho `Authorization` de cada requisição:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Atualizando o token

`POST /v1/auth/refresh`

```json
{
  "token": "<expired-or-valid-access-token>",
  "refreshToken": "<refreshToken>"
}
```

Retorna um novo `token` e `refreshToken`. Refresh tokens são de uso único e rotacionados a cada refresh.

### Logout

`POST /v1/auth/logout` — revoga o refresh token atual.

---

## Tratamento de Erros

Erros retornam um envelope JSON consistente e um código HTTP apropriado.

**Exemplo `400`:**

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {
    "email": ["The Email field is required."],
    "password": ["Password must be at least 12 characters."]
  },
  "traceId": "00-abc123-..."
}
```

**Exemplo `401`:**

```json
{
  "success": false,
  "message": "Unauthorized. Invalid or missing token."
}
```

**Exemplo `404`:**

```json
{
  "success": false,
  "message": "Customer 'a1b2' was not found."
}
```

**Exemplo `500`:**

```json
{
  "success": false,
  "message": "An unexpected error occurred.",
  "traceId": "00-def456-..."
}
```

### Resumo de códigos de status

| Código | Significado |
| --- | --- |
| 200 | Sucesso |
| 201 | Criado |
| 204 | Sem Conteúdo |
| 400 | Requisição inválida / erro de validação |
| 401 | Não autorizado |
| 403 | Proibido (permissão insuficiente) |
| 404 | Não encontrado |
| 409 | Conflito (ex., duplicado) |
| 422 | Entidade não processável |
| 429 | Muitas requisições |
| 500 | Erro interno do servidor |

---

## Formatos de Resposta Comuns

Uma resposta de coleção bem-sucedida é encapsulada com metadados de paginação:

```json
{
  "items": [ { "id": "1", "name": "Acme" } ],
  "page": 1,
  "pageSize": 20,
  "totalItems": 145,
  "totalPages": 8
}
```

Uma resposta de recurso único retorna o objeto diretamente (com envelope `success` em respostas de mutação):

```json
{
  "success": true,
  "data": { "id": "1", "name": "Acme" }
}
```

---

## Paginação, Filtros e Ordenação

Endpoints de lista aceitam:

| Param de query | Tipo | Descrição |
| --- | --- | --- |
| `page` | int | Número da página baseado em 1 (padrão 1). |
| `pageSize` | int | Itens por página (padrão 20, máx 100). |
| `sortBy` | string | Coluna para ordenar. |
| `sortDir` | string | `asc` ou `desc` (padrão `asc`). |
| `search` | string | Filtro de texto livre. |
| `from` / `to` | date | Filtros de intervalo de datas quando aplicável. |

Exemplo:

```
GET /v1/orders?page=2&pageSize=25&sortBy=orderDate&sortDir=desc&search=acme
```

---

## Rate Limiting

- Limite padrão: **100 requisições / 60 segundos** por IP para endpoints anônimos.
- Limite autenticado: **600 requisições / 60 segundos** por usuário.
- Exceder o limite retorna `429 Too Many Requests` com cabeçalho `Retry-After` (segundos).
- Endpoints de auth (`/login`, `/refresh`) têm limites mais rigorosos para mitigar força bruta.

---

## Uploads de Arquivo

Uploads de arquivo usam `multipart/form-data`. O tamanho máximo de requisição é **10 MB** por padrão.

Exemplo — fazendo upload de imagem de produto:

```
POST /v1/products/{id}/image
Content-Type: multipart/form-data

file: <binary>
```

Resposta `200`:

```json
{ "success": true, "url": "https://api.ems.example.com/uploads/products/1.png" }
```

---

## Swagger UI

Documentação interativa é servida em:

```
http://localhost:5000/swagger
```

Inclui schemas de requisição, valores de exemplo e a capacidade de autorizar com um JWT e testar chamadas diretamente.

---

## Módulo: Auth

| Método | URL | Descrição |
| --- | --- | --- |
| POST | `/v1/auth/login` | Autenticar e receber tokens. |
| POST | `/v1/auth/refresh` | Rotacionar access + refresh token. |
| POST | `/v1/auth/logout` | Revogar refresh token. |
| POST | `/v1/auth/forgot-password` | Solicitar email de redefinição de senha. |
| POST | `/v1/auth/reset-password` | Definir nova senha via token. |
| POST | `/v1/auth/change-password` | Alterar senha (autenticado). |

**Requisição de esqueci a senha:**

```json
{ "email": "user@ems.local" }
```

**Requisição de reset password:**

```json
{ "token": "reset-token", "newPassword": "NewStrong@123" }
```

---

## Módulo: Users

| Método | URL | Descrição |
| --- | --- | --- |
| GET | `/v1/users` | Listar usuários (paginado). |
| GET | `/v1/users/{id}` | Obter um usuário. |
| POST | `/v1/users` | Criar um usuário. |
| PUT | `/v1/users/{id}` | Atualizar um usuário. |
| DELETE | `/v1/users/{id}` | Desativar/excluir um usuário. |

**Requisição de criação de usuário:**

```json
{
  "fullName": "Jane Doe",
  "email": "jane@ems.local",
  "phone": "+1 555 0100",
  "roleIds": ["role-admin"],
  "isActive": true
}
```

**Resposta `201`:**

```json
{
  "success": true,
  "data": { "id": "usr-9", "email": "jane@ems.local", "isActive": true }
}
```

---

## Módulo: Roles

| Método | URL | Descrição |
| --- | --- | --- |
| GET | `/v1/roles` | Listar funções. |
| GET | `/v1/roles/{id}` | Obter função com permissões. |
| POST | `/v1/roles` | Criar função. |
| PUT | `/v1/roles/{id}` | Atualizar função/permissões. |
| DELETE | `/v1/roles/{id}` | Excluir função. |

**Requisição de criação de função:**

```json
{
  "name": "Warehouse",
  "description": "Inventory operations only",
  "permissions": ["Inventory.View", "Inventory.Entry", "Inventory.Exit"]
}
```

---

## Módulo: Customers

| Método | URL | Descrição |
| --- | --- | --- |
| GET | `/v1/customers` | Listar clientes. |
| GET | `/v1/customers/{id}` | Obter cliente (+ contatos). |
| POST | `/v1/customers` | Criar cliente. |
| PUT | `/v1/customers/{id}` | Atualizar cliente. |
| DELETE | `/v1/customers/{id}` | Excluir cliente. |
| GET | `/v1/customers/{id}/contacts` | Listar contatos. |
| POST | `/v1/customers/{id}/contacts` | Adicionar contato. |

**Requisição de criação de cliente:**

```json
{
  "name": "Acme Corporation",
  "taxId": "US-12345678",
  "email": "billing@acme.com",
  "phone": "+1 555 0200",
  "address": "1 Main St, Springfield",
  "creditLimit": 50000,
  "paymentTermsDays": 30
}
```

---

## Módulo: Suppliers

| Método | URL | Descrição |
| --- | --- | --- |
| GET | `/v1/suppliers` | Listar fornecedores. |
| GET | `/v1/suppliers/{id}` | Obter fornecedor. |
| POST | `/v1/suppliers` | Criar fornecedor. |
| PUT | `/v1/suppliers/{id}` | Atualizar fornecedor. |
| DELETE | `/v1/suppliers/{id}` | Excluir fornecedor. |

**Requisição de criação de fornecedor:**

```json
{
  "name": "Global Components Ltd",
  "taxId": "GB-99887766",
  "email": "sales@globalcomp.com",
  "phone": "+44 20 7946 0000",
  "address": "10 Trade Rd, London",
  "paymentTermsDays": 45
}
```

---

## Módulo: Products

| Método | URL | Descrição |
| --- | --- | --- |
| GET | `/v1/products` | Listar produtos (filtrar por categoria). |
| GET | `/v1/products/{id}` | Obter produto. |
| POST | `/v1/products` | Criar produto. |
| PUT | `/v1/products/{id}` | Atualizar produto. |
| DELETE | `/v1/products/{id}` | Excluir produto. |
| GET | `/v1/categories` | Listar categorias. |
| POST | `/v1/categories` | Criar categoria. |
| POST | `/v1/products/{id}/image` | Upload de imagem do produto. |

**Requisição de criação de produto:**

```json
{
  "sku": "WID-001",
  "name": "Industrial Widget",
  "description": "Standard grade widget",
  "categoryId": "cat-3",
  "unitOfMeasure": "each",
  "purchasePrice": 12.50,
  "salePrice": 19.99,
  "reorderLevel": 50,
  "stock": 120
}
```

---

## Módulo: Orders

| Método | URL | Descrição |
| --- | --- | --- |
| GET | `/v1/orders` | Listar pedidos. |
| GET | `/v1/orders/{id}` | Obter pedido com itens de linha. |
| POST | `/v1/orders` | Criar pedido (rascunho). |
| PUT | `/v1/orders/{id}` | Atualizar pedido. |
| POST | `/v1/orders/{id}/confirm` | Confirmar (reservar estoque). |
| POST | `/v1/orders/{id}/cancel` | Cancelar pedido. |
| GET | `/v1/orders/{id}/print` | Obter HTML pronto para impressão. |

**Requisição de criação de pedido:**

```json
{
  "customerId": "cust-7",
  "orderDate": "2026-07-17",
  "items": [
    { "productId": "prod-1", "quantity": 10, "unitPrice": 19.99 }
  ],
  "taxRate": 0.10,
  "notes": "Priority shipping"
}
```

**Resposta `201`:**

```json
{
  "success": true,
  "data": {
    "id": "ord-1024",
    "orderNumber": "ORD-2026-001024",
    "status": "Draft",
    "total": 219.89
  }
}
```

---

## Módulo: Invoices

| Método | URL | Descrição |
| --- | --- | --- |
| GET | `/v1/invoices` | Listar faturas. |
| GET | `/v1/invoices/{id}` | Obter fatura. |
| POST | `/v1/invoices` | Criar/emitir fatura. |
| POST | `/v1/invoices/{id}/payments` | Registrar pagamento. |
| GET | `/v1/invoices/{id}/pdf` | Download PDF (binário). |

**Requisição de criação de fatura:**

```json
{
  "orderId": "ord-1024",
  "issueDate": "2026-07-17",
  "dueDate": "2026-08-16",
  "notes": "Thank you for your business"
}
```

**Requisição de registro de pagamento:**

```json
{
  "amount": 219.89,
  "method": "Transfer",
  "paymentDate": "2026-07-20"
}
```

---

## Módulo: Inventory

| Método | URL | Descrição |
| --- | --- | --- |
| GET | `/v1/inventory/movements` | Listar movimentações (paginado). |
| POST | `/v1/inventory/entry` | Entrada de estoque (entrada). |
| POST | `/v1/inventory/exit` | Saída de estoque (saída). |
| GET | `/v1/inventory/stock-levels` | Estoque atual por produto. |

**Requisição de entrada de estoque:**

```json
{
  "supplierId": "sup-2",
  "reference": "PO-5001",
  "items": [
    { "productId": "prod-1", "quantity": 100 }
  ]
}
```

**Requisição de saída de estoque:**

```json
{
  "reason": "Sale",
  "reference": "ORD-2026-001024",
  "items": [
    { "productId": "prod-1", "quantity": 10 }
  ]
}
```

---

## Módulo: Finance

| Método | URL | Descrição |
| --- | --- | --- |
| GET | `/v1/finance/accounts-payable` | Listar contas a pagar. |
| GET | `/v1/finance/accounts-receivable` | Listar contas a receber. |
| GET | `/v1/finance/cash-flow?from=&to=` | Demonstrativo de fluxo de caixa. |

Todos retornam JSON paginado/agregado adequado para gráficos.

---

## Módulo: Reports

| Método | URL | Descrição |
| --- | --- | --- |
| GET | `/v1/reports/sales` | Relatório de vendas. |
| GET | `/v1/reports/inventory` | Relatório de estoque. |
| GET | `/v1/reports/customers` | Relatório de clientes. |
| GET | `/v1/reports/products` | Relatório de produtos. |
| GET | `/v1/reports/financial` | Resumo financeiro. |
| GET | `/v1/reports/{type}/export?format=pdf|excel|csv` | Exportar relatório. |

Exemplo:

```
GET /v1/reports/sales?from=2026-01-01&to=2026-07-17&groupBy=customer
```

---

## Módulo: Audit Logs

| Método | URL | Descrição |
| --- | --- | --- |
| GET | `/v1/audit-logs` | Listar eventos de auditoria (paginado, filtrável). |
| GET | `/v1/audit-logs/{id}` | Obter um evento único. |

Params de query: `action`, `entity`, `userId`, `from`, `to`.

**Entrada de amostra:**

```json
{
  "id": "log-5521",
  "timestamp": "2026-07-17T18:40:12Z",
  "userId": "usr-9",
  "action": "Update",
  "entity": "Product",
  "entityId": "prod-1",
  "ipAddress": "192.0.2.45",
  "detail": "Changed salePrice 19.99 -> 21.50"
}
```
