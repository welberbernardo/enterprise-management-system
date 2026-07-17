# Sistema de Gestão Empresarial

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/enterprise/ems)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green)](docs/CHANGELOG.md)
[![.NET](https://img.shields.io/badge/.NET-9.0-512BD4)](https://dotnet.microsoft.com/)
[![Angular](https://img.shields.io/badge/Angular-19-DE0031)](https://angular.dev/)

**Sistema de Gestão Empresarial (EMS)** é uma plataforma de gestão empresarial full-stack que unifica operações de clientes, fornecedores, produtos, pedidos, faturas, estoque e financeiro em uma aplicação única, segura e baseada em funções. Ele é construído com um backend de arquitetura limpa (**.NET 9 Web API**) e um frontend reativo moderno (**Angular 19**), suportado por **Microsoft SQL Server**.

---

## Índice

- [Descrição do Projeto](#descrição-do-projeto)
- [Funcionalidades](#funcionalidades)
- [Stack Tecnológica](#stack-tecnológica)
- [Capturas de Tela / Demo](#capturas-de-tela--demo)
- [Início Rápido](#início-rápido)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Executando a Aplicação](#executando-a-aplicação)
- [Build para Produção](#build-para-produção)
- [Configuração Docker](#configuração-docker)
- [Documentação da API](#documentação-da-api)
- [Testes](#testes)
- [Contribuindo](#contribuindo)
- [Licença](#licença)
- [Suporte / Contato](#suporte--contato)

---

## Descrição do Projeto

O Sistema de Gestão Empresarial ajuda pequenas e médias empresas a gerenciar todo o seu ciclo operacional:

- Manter **clientes**, **fornecedores** e **contatos**.
- Catalogar **produtos** e **categorias**.
- Processar **pedidos de venda** e acompanhar seu ciclo de vida.
- Gerar **faturas** com saída **PDF** para download.
- Acompanhar movimentações de **estoque** (entrada/saída) com histórico completo.
- Gerenciar **finanças**: contas a pagar, contas a receber e fluxo de caixa.
- Produzir **relatórios** de vendas, estoque, clientes, produtos e finanças.
- Aplicar **controle de acesso baseado em funções (RBAC)** com registro de auditoria.

O sistema é fornecido com um painel responsivo, tema claro/escuro e uma API REST totalmente documentada (Swagger UI incluída).

---

## Funcionalidades

| Módulo | Capacidades |
| --- | --- |
| **Autenticação & Autorização** | JWT + refresh tokens, hash seguro de senha, acesso baseado em funções e permissões, bloqueio de conta. |
| **Painel** | Tiles de KPI, gráficos (vendas, estoque, fluxo de caixa), atividade recente, notificações. |
| **Gerenciamento de Usuários** | Criar/editar/desativar usuários, atribuir funções, redefinir senhas, gerenciamento de perfil. |
| **Gerenciamento de Funções e Permissões** | Definir funções, atribuir permissões granulares, funções de sistema e personalizadas. |
| **Gerenciamento de Clientes** | Registros de clientes, múltiplos contatos, limites de crédito, acompanhamento de saldo. |
| **Gerenciamento de Fornecedores** | Registros de fornecedores, contatos, condições de pagamento. |
| **Gerenciamento de Produtos** | Produtos com preços, unidades, categorias, níveis de estoque. |
| **Gerenciamento de Pedidos** | Criar pedidos, itens de linha, fluxo de status, impressão/exportação. |
| **Gerenciamento de Faturas** | Gerar faturas a partir de pedidos, geração de PDF, acompanhamento de pagamento. |
| **Gerenciamento de Estoque** | Entrada/saída de estoque, ajustes, histórico completo de movimentações. |
| **Finanças** | Contas a pagar, contas a receber, demonstrativos de fluxo de caixa. |
| **Relatórios** | Relatórios de vendas, estoque, clientes, produtos e financeiros ( filtráveis, exportáveis). |
| **Configurações** | Perfil da empresa, preferências, tema (claro/escuro), localização. |
| **Logs de Auditoria** | Registro imutável de eventos relevantes de segurança e dados. |

---

## Stack Tecnológica

### Frontend
- **Angular 19** (componentes standalone, signals)
- **TypeScript 5**
- **RxJS** para streams reativos
- **Angular Material** / SCSS para UI
- **Chart.js** (ou equivalente) para gráficos do painel
- Interceptor de auth **JWT**

### Backend
- **.NET 9 SDK** (C# 13)
- **ASP.NET Core 9 Web API**
- **Entity Framework Core 9** (provedor SQL Server)
- **MediatR** para tratamento de requisições estilo CQRS
- **FluentValidation** para validação de entrada
- **AutoMapper** para mapeamento de DTOs
- **Serilog** para logging estruturado
- Autenticação **JWT Bearer**

### Banco de Dados
- **Microsoft SQL Server 2019+** (Express, Developer ou Standard)
- **SQL Server LocalDB** para desenvolvimento local
- Migrações gerenciadas via EF Core

### DevOps / Ferramentas
- **Docker** & **Docker Compose**
- **Swagger / OpenAPI 3** para docs da API
- **xUnit** + **Moq** para testes backend
- **Karma / Jasmine** para testes frontend

---

## Capturas de Tela / Demo

> **Nota:** As capturas de tela abaixo são espaços reservados. Substitua os caminhos por capturas reais quando disponíveis.

| Tela | Descrição |
| --- | --- |
| `docs/assets/dashboard.png` | Painel principal com tiles de KPI e gráficos. |
| `docs/assets/orders.png` | Lista de gerenciamento de pedidos e visualização detalhada. |
| `docs/assets/invoice.png` | Pré-visualização de fatura com botão de exportação PDF. |
| `docs/assets/users.png` | Tela de administração de usuários e funções. |

**Demo ao vivo:** `https://demo.ems.example.com` (espaço reservado)

---

## Início Rápido

Obtenha uma instância local rodando em menos de 10 minutos usando Docker:

```bash
git clone https://github.com/enterprise/ems.git
cd ems
docker compose up --build
```

Em seguida abra:
- Frontend: http://localhost:4200
- API + Swagger: http://localhost:5000/swagger

Credenciais admin padrão (apenas desenvolvimento):

```
Email:    admin@ems.local
Senha:    Admin@12345
```

---

## Instalação

Para instruções detalhadas passo a passo cobrindo Windows, Linux e macOS, consulte **[docs/INSTALL.md](docs/INSTALL.md)**.

Resumo:

1. Instale **Node.js 20+**, **.NET 9 SDK** e **SQL Server** (ou Docker).
2. Clone o repositório.
3. Configure a string de conexão do banco de dados.
4. Aplique migrações de banco de dados / dados de seed.
5. Inicie o backend (`dotnet run`) e o frontend (`ng serve`).

---

## Configuração

A configuração é orientada por ambiente. O backend lê de `appsettings.json` e sobrescreve via variáveis de ambiente / `appsettings.{Environment}.json`.

Configurações principais:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=EMS;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "Jwt": {
    "Key": "REPLACE_WITH_STRONG_SECRET",
    "Issuer": "EMS",
    "Audience": "EMS-Client",
    "DurationInMinutes": 60,
    "RefreshTokenDurationInDays": 7
  },
  "Cors": {
    "AllowedOrigins": ["http://localhost:4200"]
  }
}
```

O frontend usa `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

Consulte **[docs/INSTALL.md](docs/INSTALL.md)** → *Passo 5: Configuração de ambiente* para a referência completa.

---

## Executando a Aplicação

**Backend** (de `/src/Backend`):

```bash
dotnet restore
dotnet run --project EMS.Api
```

**Frontend** (de `/src/Frontend`):

```bash
npm install
npm start
```

Visite http://localhost:4200.

---

## Build para Produção

**Backend:**

```bash
dotnet publish src/Backend/EMS.Api/EMS.Api.csproj -c Release -o ./publish
```

**Frontend:**

```bash
npm run build -- --configuration production
```

O frontend compilado é emitido para `dist//. Sirva-o com qualquer host estático ou via middleware de arquivos estáticos do backend.

---

## Configuração Docker

O repositório inclui `Dockerfile` e `docker-compose.yml` para a API, o aplicativo Angular (servido via Nginx) e SQL Server.

```bash
# Build e start de tudo
docker compose up --build

# Rodar em modo destacado
docker compose up -d

# Parar
docker compose down
```

`docker-compose.yml` expõe:
- `sqlserver` na porta `1433`
- `api` na porta `5000`
- `web` (frontend) na porta `8080`

---

## Documentação da API

A API REST é totalmente documentada com OpenAPI 3 e servida via Swagger UI.

- Swagger UI (local): http://localhost:5000/swagger
- Referência escrita completa: **[docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)**

---

## Testes

**Backend:**

```bash
dotnet test
```

**Frontend:**

```bash
npm test
```

**End-to-end:**

```bash
npm run e2e
```

---

## Contribuindo

1. Faça um fork do repositório e crie uma branch de feature (`git checkout -b feat/minha-funcionalidade`).
2. Siga o estilo de código e a arquitetura existentes (camadas de arquitetura limpa).
3. Adicione/atualize testes unitários para suas alterações.
4. Certifique-se de que `dotnet test` e `npm test` passam.
5. Execute `dotnet format` e as verificações ESLint/Prettier.
6. Abra um pull request descrevendo a alteração e referenciando qualquer issue.

Por favor, leia **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** antes de contribuir para que seu código se encaixe nos padrões estabelecidos.

---

## Licença

Lançado sob a **Licença MIT**. Consulte [LICENSE](LICENSE).

---

## Suporte / Contato

- **Documentação:** consulte a pasta [`docs/`](docs).
- **Issues:** https://github.com/enterprise/ems/issues
- **Email:** support@ems.example.com
- **Comunidade:** https://community.ems.example.com

---

### Índice de Documentação

| Documento | Propósito |
| --- | --- |
| [README.md](README.md) | Visão geral do projeto e início rápido. |
| [docs/INSTALL.md](docs/INSTALL.md) | Guia de instalação detalhado. |
| [docs/USER_MANUAL.md](docs/USER_MANUAL.md) | Manual de operação para usuário final. |
| [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) | Referência da API REST. |
| [docs/DATABASE.md](docs/DATABASE.md) | Schema do banco de dados e manutenção. |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Arquitetura do sistema e de software. |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | Histórico de versões. |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Planos futuros e cronograma. |
