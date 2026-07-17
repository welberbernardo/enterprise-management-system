# Documentação de Arquitetura

Este documento explica a arquitetura do **Sistema de Gestão Empresarial (EMS)**: como o sistema é estruturado, como as camadas interagem e as principais decisões técnicas por trás delas.

---

## Índice

- [Visão Geral da Arquitetura do Sistema](#visão-geral-da-arquitetura-do-sistema)
- [Camadas de Arquitetura Limpa](#camadas-de-arquitetura-limpa)
- [Arquitetura do Frontend](#arquitetura-do-frontend)
- [Arquitetura do Backend](#arquitetura-do-backend)
- [Arquitetura do Banco de Dados](#arquitetura-do-banco-de-dados)
- [Fluxo de Autenticação / Autorização](#fluxo-de-autentificação--autorização)
- [Fluxo de Dados](#fluxo-de-dados)
- [Estratégia de Versionamento da API](#estratégia-de-versionamento-da-api)
- [Estratégia de Tratamento de Erros](#estratégia-de-tratamento-de-erros)
- [Estratégia de Logging](#estratégia-de-logging)
- [Estratégia de Cache](#estratégia-de-cache)
- [Considerações de Segurança](#considerações-de-segurança)
- [Considerações de Escalabilidade](#considerações-de-escalabilidade)
- [Decisões Tecnológicas](#decisões-tecnológicas)

---

## Visão Geral da Arquitetura do Sistema

O EMS é um sistema **client-server** com separação clara entre a camada de apresentação (Angular SPA) e a camada de API (.NET Web API), ambas suportadas por um único banco de dados SQL Server.

```
┌────────────────────┐        HTTPS / JSON         ┌──────────────────────┐
│  Angular 19 SPA    │ ─────────────────────────▶ │   ASP.NET Core 9     │
│  (Browser)         │ ◀───────────────────────── │   Web API            │
│  - UI Components   │      JWT Bearer             │   - Controllers      │
│  - State (signals)│                             │   - MediatR handlers  │
│  - HTTP client     │                             │   - Domain services  │
└────────────────────┘                             └──────────┬───────────┘
                                                               │ EF Core 9
                                                               ▼
                                                     ┌────────────────────┐
                                                     │  SQL Server (EMS)  │
                                                     │  - 18 tables       │
                                                     │  - Migrations      │
                                                     └────────────────────┘
```

---

## Camadas de Arquitetura Limpa

O backend segue a **Arquitetura Limpa** (Regra de Dependência: dependências apontam para dentro).

```
EMS.Api (Presentation)
   │ depends on
EMS.Application (Use cases, DTOs, interfaces, CQRS)
   │ depends on
EMS.Domain / Core (Entities, value objects, domain rules)
   ▲ depends on
EMS.Infrastructure (EF Core, repositories, external services)
```

| Camada | Responsabilidade | Tipos principais |
| --- | --- | --- |
| **Core / Domain** | Entidades e regras de negócio; sem dependências externas. | `User`, `Order`, `Product`, `Invoice`, domain services. |
| **Application** | Casos de uso, handlers de command/query, DTOs, interfaces (abstrações). | `CreateOrderCommand`, `GetOrdersQuery`, `IRepository<T>`. |
| **Infrastructure** | Implementações concretas: `DbContext` EF Core, repositórios, email, armazenamento de arquivos. | `AppDbContext`, `EfRepository<T>`, `SmtpEmailService`. |
| **Presentation (Api)** | Preocupações HTTP: controllers, middleware, JWT, validação, Swagger. | `OrdersController`, `Program.cs`, filters. |

Isso mantém a lógica de negócio testável sem banco de dados ou framework web.

---

## Arquitetura do Frontend

- **Framework:** Angular 19 com componentes standalone (sem boilerplate `NgModule`).
- **Estado:** Angular **signals** para estado local/de componente e um `AuthStore` leve para estado de sessão.
- **Estrutura:**
  ```
  src/app/
    core/         # http, auth guard, interceptors, models
    features/     # customers/, orders/, invoices/ ... (um módulo por domínio)
    shared/       # UI reutilizável (tables, dialogs, forms)
    layout/       # shell, sidebar, navbar
  ```
- **HTTP:** Um `ApiService` tipado envolve `HttpClient`; um interceptor **JWT** anexa o bearer token e um **refresh interceptor** tenta novamente em 401.
- **Roteamento:** Módulos de funcionalidade com lazy-loading com guards `canActivate` em nível de rota verificando permissões.
- **UI:** Componentes Angular Material + theming SCSS (claro/escuro via variáveis CSS).

---

## Arquitetura do Backend

- **Host:** ASP.NET Core 9 modelo de hospedagem minimal (`WebApplication`).
- **Padrão:** **CQRS-lite** via **MediatR** — controllers enviam commands/queries; handlers contêm a lógica de caso de uso.
- **Validação:** Pipelines **FluentValidation** validam commands de entrada antes dos handlers executarem.
- **Mapeamento:** Perfis **AutoMapper** mapeiam entidades ↔ DTOs.
- **Persistência:** **EF Core 9** com um `DbContext` unit-of-work; repositórios abstraem acesso a dados.
- **DI:** Todos os serviços registrados em `Program.cs`; interfaces resolvidas de Infrastructure.
- **Cross-cutting:** Middleware trata tradução de exceções, IDs de correlação e logging de requisição.

---

## Arquitetura do Banco de Dados

- **Provedor:** SQL Server via EF Core `UseSqlServer`.
- **Migrações:** Code First; `EMS.Infrastructure` possui as assembles de migração.
- **Unit of Work:** `SaveChangesAsync` comita uma transação por requisição.
- **Concorrência:** Row-version (`byte[] Version`) concorrência otimista em entidades chave.
- **Exclusão suave:** filtro de query EF global em `IsDeleted` para entidades de negócio.
- **Auditoria:** escritas em nível de aplicação para `AuditLogs` (não triggers SQL) para portabilidade.

---

## Fluxo de Autenticação / Autorização

1. Cliente `POST /v1/auth/login` com email/senha.
2. API verifica hash da senha, então emite um **JWT de vida curta** (access token, 60 min) e um **refresh token** (7 dias, armazenado hasheado em `User`/token store).
3. Cliente armazena tokens (preferencialmente em memória + cookie seguro para refresh).
4. Cada chamada de API envia `Authorization: Bearer <jwt>`.
5. Em `401`, o refresh interceptor chama `/v1/auth/refresh` para obter um novo par (refresh token é rotacionado).
6. **Autorização** usa policies ASP.NET Core: claims carregam `role` e `permission`; handlers verificam `PermissionRequirement` (ex., `Orders.Create`).

```
Login ─▶ validate ─▶ issue JWT + refresh
   │
Request ─▶ [Auth Middleware] ─▶ validate JWT signature/exp
   │
   └▶ [Authorization Policy] ─▶ check permission claim ─▶ handler or 403
```

---

## Fluxo de Dados

**Exemplo Criar Pedido:**

```
UI (form) ─▶ ApiService.post('/orders', dto)
   │
   ▼
OrdersController.CreateOrder(CreateOrderCommand)
   │ MediatR
   ▼
CreateOrderCommandHandler
   ├─ FluentValidation (passed)
   ├─ Load Customer + Products (repositories)
   ├─ Domain: build Order + OrderItems, compute totals
   ├─ Persist via DbContext (transaction)
   ├─ Write AuditLogs entry
   └─ Return OrderDto
   │
   ▼
Controller → 201 Created (OrderDto)
   │
   ▼
UI → navigate to order detail, show toast
```

---

## Estratégia de Versionamento da API

- Versionamento por URL: `/api/v1/...`, `/api/v2/...`.
- Novas alterações incompatíveis com versões anteriores vão para um novo grupo de rota `v{N+1}`; versões antigas são suportadas por pelo menos um release major.
- Documentos OpenAPI são gerados por versão; Swagger UI as lista.
- Depreciações são anunciadas no CHANGELOG e via um cabeçalho de resposta `Api-Deprecated`.

---

## Estratégia de Tratamento de Erros

- Exceções são capturadas por um **middleware de exceção central** que as mapeia para envelopes JSON consistentes (consulte docs da API).
- Violações de regra de domínio lançam exceções tipadas (`ValidationException`, `NotFoundException`, `ConflictException`) mapeadas para `400/404/409`.
- Exceções não tratadas retornam `500` com um `traceId` (ID de correlação) para busca de suporte; detalhes não são vazados para clientes.
- Erros de validação agregam mensagens em nível de campo.

---

## Estratégia de Logging

- **Serilog** com logging estruturado; sinks: console (dev) e arquivo/Seq (prod).
- Cada requisição registra método, caminho, status, duração e ID de correlação.
- Dados sensíveis (senhas, tokens) nunca são registrados.
- Níveis de log: `Information` padrão; `Warning` para falhas de auth; `Error` para exceções não tratadas.
- ID de correlação flui do cabeçalho de requisição através de todas as camadas e para o contexto de log.

---

## Estratégia de Cache

- **Agregados do painel** cacheados em memória (IMemoryCache) com uma janela deslizante de 5 minutos; invalidados em escritas relevantes.
- **Dados de referência estáticos** (categorias, permissões) cacheados para a sessão.
- **Cache HTTP:** `Cache-Control` em endpoints GET de lista onde os dados não são sensíveis.
- Nenhum cache distribuído necessário para nó único; Redis é o add-on recomendado ao escalar horizontalmente (consulte Escalabilidade).

---

## Considerações de Segurança

- **Transporte:** HTTPS apenas; HSTS habilitado em produção.
- **Auth:** JWT com vida curta; rotação de refresh token e lista de revogação.
- **Senhas:** hash forte (Argon2id / BCrypt), política de senha forçada, bloqueio de conta após N tentativas falhas.
- **Autorização:** policies baseadas em permissão, menor privilégio por padrão.
- **CORS:** origens estritamente permitidas (sem wildcards em produção).
- **Entrada:** validação de modelo + queries parametrizadas (EF Core) previnem injeção.
- **Segredos:** `Jwt:Key` e strings de conexão via user-secrets/env vars, nunca comitados.
- **Auditoria:** logs imutáveis de auth e mutações de dados para forense.
- **Uploads de arquivo:** limites de tamanho (10 MB), lista de permissão de tipos, armazenados fora da raiz web.

---

## Considerações de Escalabilidade

- **API com estado:** nenhum estado de sessão server-side → escalonamento horizontal atrás de um load balancer.
- **Banco de dados:** réplicas de leitura podem servir relatórios; connection pooling via EF Core.
- **Cache:** adicione Redis para cache compartilhado entre nós de API.
- **Jobs em background:** tarefas longas (geração de relatórios, email, reconciliação de saldo) movidas para um hosted service / fila (ex., Hangfire, Azure Queue).
- **Frontend:** build estático servido via CDN/Nginx; hashes de cache-busting.
- **Gargalos:** recomputação de saldo de estoque é a principal contenção de escrita; mitigada por colunas desnormalizadas + reconciliação noturna.

---

## Decisões Tecnológicas

| Decisão | Rationale |
| --- | --- |
| **.NET 9 / ASP.NET Core** | Alta performance, ecossistema maduro, suporte de primeira classe a EF Core e JWT. |
| **Angular 19** | Tipagem forte, signals, ferramentas enterprise-grade, UI material excelente. |
| **Arquitetura Limpa** | Testabilidade, independência de framework, limites claros. |
| **MediatR + CQRS-lite** | Desacopla controllers de casos de uso; pipeline behaviors para validação/logging. |
| **EF Core 9** | ORM produtivo com migrações, suporte a SQL Server, change tracking. |
| **SQL Server** | RDBMS confiável com ferramentas fortes; LocalDB simplifica dev. |
| **JWT + refresh** | Auth sem estado adequado para SPA + escalonamento; rotação de refresh limita risco. |
| **Serilog** | Logs estruturados consultáveis por ID de correlação; troca fácil de sinks. |
| **FluentValidation** | Validação declarativa, testável, separada de handlers. |
| **Docker** | Ambientes reproduzíveis entre dev/CI/prod. |
