# Guia de Instalação

Este guia fornece instruções detalhadas para instalar e executar o **Sistema de Gestão Empresarial (EMS)** em ambientes de desenvolvimento e produção.

---

## Índice

- [Pré-requisitos](#pré-requisitos)
- [Passo 1: Clonar / Configurar o Projeto](#passo-1-clonar--configurar-o-projeto)
- [Passo 2: Configuração do Banco de Dados](#passo-2-configuração-do-banco-de-dados)
  - [Opção A: SQL Server LocalDB (dev Windows)](#opção-a-sql-server-localdb-dev-windows)
  - [Opção B: SQL Server (instância completa)](#opção-b-sql-server-instância-completa)
  - [Opção C: Docker](#opção-c-docker)
- [Passo 3: Configuração do Backend](#passo-3-configuração-do-backend)
- [Passo 4: Configuração do Frontend](#passo-4-configuração-do-frontend)
- [Passo 5: Configuração de Ambiente](#passo-5-configuração-de-ambiente)
- [Passo 6: Executando a Aplicação](#passo-6-executando-a-aplicação)
- [Passo 7: Verificando a Instalação](#passo-7-verificando-a-instalação)
- [Solução de Problemas](#solução-de-problemas)
- [Notas Específicas do Windows](#notas-específicas-do-windows)
- [Notas Específicas do Linux / macOS](#notas-específicas-do-linux--macos)

---

## Pré-requisitos

| Componente | Versão | Notas |
| --- | --- | --- |
| **Node.js** | 20 LTS ou mais recente | Necessário para o frontend Angular. |
| **npm** | 10+ | Acompanha o Node.js. |
| **.NET 9 SDK** | 9.0.x | Necessário para build/executar a Web API. |
| **SQL Server** | 2019+ | Express, Developer ou Standard. LocalDB é suficiente para dev. |
| **Docker** (opcional) | 24+ | Necessário apenas para a configuração containerizada. |
| **Git** | 2.40+ | Para clonar o repositório. |

Verifique sua toolchain:

```bash
node --version
npm --version
dotnet --version
sqlcmd -?            # ou: docker --version
```

---

## Passo 1: Clonar / Configurar o Projeto

```bash
git clone https://github.com/enterprise/ems.git
cd ems
```

Layout do repositório:

```
ems/
├── src/
│   ├── Backend/        # .NET 9 Web API (arquitetura limpa)
│   └── Frontend/       # Angular 19 SPA
├── docker-compose.yml
├── Dockerfile
├── README.md
└── docs/
```

---

## Passo 2: Configuração do Banco de Dados

Escolha **uma** das seguintes opções.

### Opção A: SQL Server LocalDB (dev Windows)

LocalDB é incluído com o SQL Server Express e é a forma mais rápida de começar no Windows.

1. Confirme que o LocalDB está instalado:

    ```powershell
    sqllocaldb info
    ```

2. Crie (ou inicie) uma instância:

    ```powershell
    sqllocaldb create EMS
    sqllocaldb start EMS
    ```

3. Use esta string de conexão em `appsettings.json`:

    ```json
    "ConnectionStrings": {
      "DefaultConnection": "Server=(localdb)\\EMS;Database=EMS;Trusted_Connection=True;TrustServerCertificate=True"
    }
    ```

### Opção B: SQL Server (instância completa)

1. Instale o SQL Server 2019+ e o SQL Server Management Studio (SSMS).
2. Crie um banco de dados chamado `EMS` (ou deixe o EF Core criá-lo durante a migração).
3. Use autenticação SQL ou autenticação Windows:

    ```json
    "ConnectionStrings": {
      "DefaultConnection": "Server=localhost,1433;Database=EMS;User Id=ems_user;Password=Strong!Pass123;TrustServerCertificate=True"
    }
    ```

### Opção C: Docker

```bash
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=Strong!Pass123" \
  -p 1433:1433 --name ems-sql \
  -d mcr.microsoft.com/mssql/server:2022-latest
```

String de conexão:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost,1433;Database=EMS;User Id=sa;Password=Strong!Pass123;TrustServerCertificate=True"
}
```

---

## Passo 3: Configuração do Backend

```bash
cd src/Backend
dotnet restore
dotnet build
```

Aplique migrações de banco de dados e seed de dados iniciais:

```bash
dotnet ef database update --project EMS.Infrastructure --startup-project EMS.Api
```

> Se `dotnet ef` não estiver disponível, instale uma vez: `dotnet tool install --global dotnet-ef`.

Seed o banco de dados (cria o usuário admin padrão e dados de referência):

```bash
dotnet run --project EMS.Api -- --seed
```

> A conta admin padrão é `admin@ems.local` / `Admin@12345`. **Altere esta senha imediatamente após o primeiro login.**

---

## Passo 4: Configuração do Frontend

```bash
cd src/Frontend
npm install
```

O frontend lê a URL base da API de `src/environments/environment.ts`. Para desenvolvimento local:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

---

## Passo 5: Configuração de Ambiente

### Backend — `src/Backend/EMS.Api/appsettings.json`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\EMS;Database=EMS;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "Jwt": {
    "Key": "REPLACE_WITH_A_LONG_RANDOM_SECRET_AT_LEAST_32_CHARS",
    "Issuer": "EMS",
    "Audience": "EMS-Client",
    "DurationInMinutes": 60,
    "RefreshTokenDurationInDays": 7
  },
  "Cors": {
    "AllowedOrigins": ["http://localhost:4200"]
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

> **Segurança:** Nunca comite o `Jwt:Key` real. Use user-secrets no dev (`dotnet user-secrets set "Jwt:Key" "..."`) e variáveis de ambiente em produção.

### Frontend — `src/environments/environment.ts` / `environment.prod.ts`

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

Para produção, defina `production: true` e aponte `apiUrl` para o host da API publicada.

---

## Passo 6: Executando a Aplicação

**Terminal 1 — Backend:**

```bash
cd src/Backend
dotnet run --project EMS.Api
```

A API escuta em `http://localhost:5000` (Swagger em `/swagger`).

**Terminal 2 — Frontend:**

```bash
cd src/Frontend
npm start
```

O SPA é servido em `http://localhost:4200`.

---

## Passo 7: Verificando a Instalação

1. Abra http://localhost:5000/swagger — a página OpenAPI deve carregar.
2. Abra http://localhost:4200 — a tela de login deve aparecer.
3. Faça login com `admin@ems.local` / `Admin@12345`.
4. No painel, confirme que os tiles de KPI e gráficos são renderizados (os dados vêm do seed).
5. Navegue até **Gerenciamento de Usuários** e confirme que o usuário admin está listado.
6. Execute as suítes de teste:

    ```bash
    dotnet test                     # backend
    cd src/Frontend && npm test     # frontend (headless)
    ```

---

## Solução de Problemas

| Sintoma | Causa | Resolução |
| --- | --- | --- |
| `A connection was successfully established but then an error occurred during the login process` | SQL Server inacessível / credenciais incorretas | Verifique host, porta e `SA_PASSWORD`. Para LocalDB, certifique-se de que a instância foi iniciada com `sqllocaldb start EMS`. |
| `Cannot connect to API` no navegador | CORS ou `apiUrl` incorreta | Confirme que `Cors.AllowedOrigins` inclui `http://localhost:4200` e que `apiUrl` corresponde ao host da API. |
| `dotnet ef` não reconhecido | Ferramenta não instalada | Execute `dotnet tool install --global dotnet-ef`. |
| `The SSL connection could not be established` | Certificado auto-assinado | Adicione `TrustServerCertificate=True` à string de conexão (apenas dev). |
| Frontend builda mas mostra página em branco | Arquivo de ambiente incorreto | Certifique-se de que `ng serve` usa `environment.ts`; `ng build --configuration production` usa `environment.prod.ts`. |
| JWT 401 após login | Diferença de clock / issuer incorreto | Certifique-se de que os relógios do servidor e cliente estão sincronizados; verifique `Jwt:Issuer`/`Audience` correspondem à config do token. |
| Porta 5000/4200 já em uso | Outro processo vinculado | Altere `applicationUrl` em `launchSettings.json` / use `ng serve --port 4300`. |

---

## Notas Específicas do Windows

- LocalDB é o banco de dados de desenvolvimento recomendado (consulte Passo 2, Opção A).
- Use **PowerShell** ou **Command Prompt**; os comandos acima são compatíveis com PowerShell.
- Habilite o suporte a longos caminhos se encontrar erros `MAX_PATH` durante `npm install`.
- SQL Server Express + SSMS é a opção de instância completa mais fácil.

## Notas Específicas do Linux / macOS

- LocalDB **não** está disponível no Linux/macOS. Use **Opção B (container SQL Server)** ou **Opção C (Docker)**.
- Instale o .NET 9 SDK via feed de pacotes Microsoft (`dotnet-install.sh` ou o gerenciador de pacotes da sua distro).
- No macOS, o SQL Server roda apenas via Docker (sem engine nativa).
- Se usar autenticação Windows na string de conexão, substitua por autenticação SQL em hosts não-Windows.
- Caminhos de arquivo em `appsettings.json` (ex., para uploads/logs) devem usar barras para frente ou `Path.Combine` para permanecer multiplataforma.
