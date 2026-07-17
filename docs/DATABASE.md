# Documentação do Banco de Dados

Este documento descreve o banco de dados do **Sistema de Gestão Empresarial (EMS)**: sua estrutura, tabelas, relacionamentos, restrições e procedimentos operacionais. O EMS usa **Microsoft SQL Server** com migrações do **Entity Framework Core 9**.

---

## Índice

- [Visão Geral do Banco de Dados](#visão-geral-do-banco-de-dados)
- [Diagrama de Relacionamento de Entidades](#diagrama-de-relacionamento-de-entidades)
- [Descrições das Tabelas](#descrições-das-tabelas)
- [Relacionamentos](#relacionamentos)
- [Índices](#índices)
- [Restrições](#restrições)
- [Dados de Seed](#dados-de-seed)
- [Estratégia de Backup](#estratégia-de-backup)
- [Plano de Manutenção](#plano-de-manutenção)
- [Ajuste de Performance](#ajuste-de-performance)

---

## Visão Geral do Banco de Dados

- **Engine:** Microsoft SQL Server 2019+ (Express/Developer/Standard). LocalDB para desenvolvimento.
- **Nome:** `EMS`
- **Collation:** `SQL_Latin1_General_CP1_CI_AS` (case-insensitive).
- **ORM:** Entity Framework Core 9 (Code First, migrações).
- **Modelo de identidade:** Chaves primárias GUID (`uniqueidentifier`) geradas no código da aplicação.
- **Auditoria:** Colunas `CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy` na maioria das tabelas.
- **Exclusão suave:** a maioria das entidades de negócio usa um flag `IsDeleted` em vez de exclusão física.

Existem **18 tabelas principais** abrangendo identidade, partes (clientes/fornecedores), catálogo, transações (pedidos/faturas/estoque), finanças e sistema (auditoria/configurações).

---

## Diagrama de Relacionamento de Entidades

ERD baseado em texto (relacionamentos mostrados como `──<` um-para-muitos):

```
Users ──< UserRoles >── Roles ──< RolePermissions >── Permissions
  │
  ├──< AuditLogs
  │
Customers ──< CustomerContacts
  │
Suppliers
  │
Categories ──< Products
  │
Products ──< OrderItems  <── Orders ──< Invoices ──< InvoicePayments
  │            │
  └────────────┘
Products ──< InventoryMovements
  │
Orders ──< InventoryMovements (referência)
Suppliers ──< InventoryMovements (referência)
  │
Settings (linha única de empresa)
  │
FinanceTransactions  (payable / receivable / cash)
```

**Legenda:** `──<` = "um pai, muitos filhos".

---

## Descrições das Tabelas

### 1. Users
Armazena contas da aplicação.

| Coluna | Tipo | Null | Notas |
| --- | --- | --- | --- |
| Id | uniqueidentifier | Não | PK |
| FullName | nvarchar(200) | Não | |
| Email | nvarchar(256) | Não | Único |
| PasswordHash | nvarchar(512) | Não | Hash Argon2/bcrypt |
| Phone | nvarchar(50) | Sim | |
| IsActive | bit | Não | Padrão 1 |
| LastLoginAt | datetime2 | Sim | |
| CreatedAt | datetime2 | Não | |
| CreatedBy | uniqueidentifier | Sim | |
| UpdatedAt | datetime2 | Sim | |
| UpdatedBy | uniqueidentifier | Sim | |
| IsDeleted | bit | Não | Padrão 0 |

### 2. Roles
Grupos de permissão nomeados.

| Coluna | Tipo | Null | Notas |
| --- | --- | --- | --- |
| Id | uniqueidentifier | Não | PK |
| Name | nvarchar(100) | Não | Único |
| Description | nvarchar(500) | Sim | |
| IsSystem | bit | Não | Padrão 0 (funções de sistema protegidas) |
| CreatedAt | datetime2 | Não | |

### 3. Permissions
Definições de permissão granulares (ex., `Orders.Create`).

| Coluna | Tipo | Null | Notas |
| --- | --- | --- | --- |
| Id | uniqueidentifier | Não | PK |
| Name | nvarchar(100) | Não | Único |
| Module | nvarchar(100) | Não | Agrupamento |
| Description | nvarchar(500) | Sim | |

### 4. UserRoles (join)
Mapeia usuários para funções (muitos-para-muitos).

| Coluna | Tipo | Null | Notas |
| --- | --- | --- | --- |
| UserId | uniqueidentifier | Não | PK/FK → Users |
| RoleId | uniqueidentifier | Não | PK/FK → Roles |

### 5. RolePermissions (join)
Mapeia funções para permissões (muitos-para-muitos).

| Coluna | Tipo | Null | Notas |
| --- | --- | --- | --- |
| RoleId | uniqueidentifier | Não | PK/FK → Roles |
| PermissionId | uniqueidentifier | Não | PK/FK → Permissions |

### 6. Customers
Organizações clientes.

| Coluna | Tipo | Null | Notas |
| --- | --- | --- | --- |
| Id | uniqueidentifier | Não | PK |
| Name | nvarchar(200) | Não | |
| TaxId | nvarchar(50) | Sim | |
| Email | nvarchar(256) | Sim | |
| Phone | nvarchar(50) | Sim | |
| Address | nvarchar(500) | Sim | |
| CreditLimit | decimal(18,2) | Não | Padrão 0 |
| PaymentTermsDays | int | Não | Padrão 30 |
| Balance | decimal(18,2) | Não | Desnormalizado, mantido por triggers/jobs |
| CreatedAt | datetime2 | Não | |
| IsDeleted | bit | Não | Padrão 0 |

### 7. CustomerContacts
Contatos pertencentes a um cliente.

| Coluna | Tipo | Null | Notas |
| --- | --- | --- | --- |
| Id | uniqueidentifier | Não | PK |
| CustomerId | uniqueidentifier | Não | FK → Customers |
| Name | nvarchar(200) | Não | |
| Email | nvarchar(256) | Sim | |
| Phone | nvarchar(50) | Sim | |
| Role | nvarchar(100) | Sim | |
| IsPrimary | bit | Não | Padrão 0 |

### 8. Suppliers
Organizações fornecedoras.

| Coluna | Tipo | Null | Notas |
| --- | --- | --- | --- |
| Id | uniqueidentifier | Não | PK |
| Name | nvarchar(200) | Não | |
| TaxId | nvarchar(50) | Sim | |
| Email | nvarchar(256) | Sim | |
| Phone | nvarchar(50) | Sim | |
| Address | nvarchar(500) | Sim | |
| PaymentTermsDays | int | Não | Padrão 30 |
| CreatedAt | datetime2 | Não | |
| IsDeleted | bit | Não | Padrão 0 |

### 9. Categories
Categorias de produtos (auto-referenciadas para aninhamento).

| Coluna | Tipo | Null | Notas |
| --- | --- | --- | --- |
| Id | uniqueidentifier | Não | PK |
| Name | nvarchar(100) | Não | |
| ParentId | uniqueidentifier | Sim | FK → Categories (anulável) |
| IsDeleted | bit | Não | Padrão 0 |

### 10. Products
Itens de catálogo.

| Coluna | Tipo | Null | Notas |
| --- | --- | --- | --- |
| Id | uniqueidentifier | Não | PK |
| Sku | nvarchar(50) | Não | Único |
| Name | nvarchar(200) | Não | |
| Description | nvarchar(1000) | Sim | |
| CategoryId | uniqueidentifier | Sim | FK → Categories |
| UnitOfMeasure | nvarchar(20) | Não | |
| PurchasePrice | decimal(18,2) | Não | |
| SalePrice | decimal(18,2) | Não | |
| ReorderLevel | int | Não | Padrão 0 |
| Stock | int | Não | Atual em mãos |
| ImageUrl | nvarchar(500) | Sim | |
| IsDeleted | bit | Não | Padrão 0 |

### 11. Orders
Pedidos de venda.

| Coluna | Tipo | Null | Notas |
| --- | --- | --- | --- |
| Id | uniqueidentifier | Não | PK |
| OrderNumber | nvarchar(50) | Não | Único |
| CustomerId | uniqueidentifier | Não | FK → Customers |
| OrderDate | datetime2 | Não | |
| Status | nvarchar(20) | Não | Draft/Confirmed/Processing/Completed/Cancelled |
| SubTotal | decimal(18,2) | Não | |
| TaxRate | decimal(5,2) | Não | |
| TaxAmount | decimal(18,2) | Não | |
| Total | decimal(18,2) | Não | |
| Notes | nvarchar(1000) | Sim | |
| CreatedBy | uniqueidentifier | Não | FK → Users |
| CreatedAt | datetime2 | Não | |
| IsDeleted | bit | Não | Padrão 0 |

### 12. OrderItems
Itens de linha de um pedido.

| Coluna | Tipo | Null | Notas |
| --- | --- | --- | --- |
| Id | uniqueidentifier | Não | PK |
| OrderId | uniqueidentifier | Não | FK → Orders |
| ProductId | uniqueidentifier | Não | FK → Products |
| Quantity | int | Não | |
| UnitPrice | decimal(18,2) | Não | |
| LineTotal | decimal(18,2) | Não | Quantity * UnitPrice |

### 13. Invoices
Faturas emitidas.

| Coluna | Tipo | Null | Notas |
| --- | --- | --- | --- |
| Id | uniqueidentifier | Não | PK |
| InvoiceNumber | nvarchar(50) | Não | Único |
| OrderId | uniqueidentifier | Sim | FK → Orders |
| CustomerId | uniqueidentifier | Não | FK → Customers |
| IssueDate | datetime2 | Não | |
| DueDate | datetime2 | Não | |
| SubTotal | decimal(18,2) | Não | |
| TaxAmount | decimal(18,2) | Não | |
| Total | decimal(18,2) | Não | |
| PaidAmount | decimal(18,2) | Não | Padrão 0 |
| Status | nvarchar(20) | Não | Unpaid/Partial/Paid/Overdue |
| Notes | nvarchar(1000) | Sim | |
| CreatedAt | datetime2 | Não | |

### 14. InvoicePayments
Pagamentos aplicados a faturas.

| Coluna | Tipo | Null | Notas |
| --- | --- | --- | --- |
| Id | uniqueidentifier | Não | PK |
| InvoiceId | uniqueidentifier | Não | FK → Invoices |
| Amount | decimal(18,2) | Não | |
| Method | nvarchar(20) | Não | Cash/Transfer/Card |
| PaymentDate | datetime2 | Não | |
| CreatedAt | datetime2 | Não | |

### 15. InventoryMovements
Histórico de entrada/saída de estoque.

| Coluna | Tipo | Null | Notas |
| --- | --- | --- | --- |
| Id | uniqueidentifier | Não | PK |
| ProductId | uniqueidentifier | Não | FK → Products |
| Type | nvarchar(10) | Não | Entry/Exit |
| Quantity | int | Não | Magnitude sinalizada (sempre positiva) |
| Reference | nvarchar(100) | Sim | Referência de order/PO/invoice |
| SupplierId | uniqueidentifier | Sim | FK → Suppliers (entradas) |
| OrderId | uniqueidentifier | Sim | FK → Orders (saídas) |
| Reason | nvarchar(100) | Sim | |
| CreatedBy | uniqueidentifier | Não | FK → Users |
| CreatedAt | datetime2 | Não | |

### 16. FinanceTransactions
Linhas de razão financeira geral (payable/receivable/cash).

| Coluna | Tipo | Null | Notas |
| --- | --- | --- | --- |
| Id | uniqueidentifier | Não | PK |
| Type | nvarchar(20) | Não | Payable/Receivable/CashIn/CashOut |
| ReferenceId | uniqueidentifier | Sim | Link para invoice/order/supplier |
| Amount | decimal(18,2) | Não | |
| Direction | nvarchar(10) | Não | In/Out |
| TransactionDate | datetime2 | Não | |
| Description | nvarchar(500) | Sim | |
| CreatedAt | datetime2 | Não | |

### 17. Settings
Linha única de configuração da empresa.

| Coluna | Tipo | Null | Notas |
| --- | --- | --- | --- |
| Id | uniqueidentifier | Não | PK |
| CompanyName | nvarchar(200) | Não | |
| TaxId | nvarchar(50) | Sim | |
| Address | nvarchar(500) | Sim | |
| Phone | nvarchar(50) | Sim | |
| Email | nvarchar(256) | Sim | |
| LogoUrl | nvarchar(500) | Sim | |
| DefaultCurrency | nvarchar(10) | Não | Padrão 'USD' |
| DefaultTaxRate | decimal(5,2) | Não | |
| Theme | nvarchar(20) | Não | Light/Dark |

### 18. AuditLogs
Log de eventos imutável de segurança/dados.

| Coluna | Tipo | Null | Notas |
| --- | --- | --- | --- |
| Id | uniqueidentifier | Não | PK |
| Timestamp | datetime2 | Não | |
| UserId | uniqueidentifier | Sim | FK → Users |
| Action | nvarchar(50) | Não | Login/Create/Update/Delete/etc. |
| Entity | nvarchar(100) | Sim | |
| EntityId | nvarchar(100) | Sim | |
| IpAddress | nvarchar(50) | Sim | |
| Detail | nvarchar(1000) | Sim | |

---

## Relacionamentos

| Filho | Pai | FK | Ao Excluir |
| --- | --- | --- | --- |
| UserRoles | Users | UserId | Cascade |
| UserRoles | Roles | RoleId | Cascade |
| RolePermissions | Roles | RoleId | Cascade |
| RolePermissions | Permissions | PermissionId | Cascade |
| CustomerContacts | Customers | CustomerId | Cascade |
| Categories | Categories | ParentId | Restrict (sem aninhamento órfão) |
| Products | Categories | CategoryId | Set Null |
| Orders | Customers | CustomerId | Restrict |
| OrderItems | Orders | OrderId | Cascade |
| OrderItems | Products | ProductId | Restrict |
| Invoices | Orders | OrderId | Restrict |
| Invoices | Customers | CustomerId | Restrict |
| InvoicePayments | Invoices | InvoiceId | Cascade |
| InventoryMovements | Products | ProductId | Restrict |
| InventoryMovements | Suppliers | SupplierId | Set Null |
| InventoryMovements | Orders | OrderId | Set Null |
| AuditLogs | Users | UserId | Set Null |

---

## Índices

Índices recomendados/auto-criados:

| Tabela | Índice | Colunas |
| --- | --- | --- |
| Users | UQ_Users_Email | Email (único) |
| Roles | UQ_Roles_Name | Name (único) |
| Permissions | UQ_Permissions_Name | Name (único) |
| Customers | IX_Customers_Name | Name |
| Products | UQ_Products_Sku | Sku (único) |
| Products | IX_Products_Category | CategoryId |
| Orders | IX_Orders_Customer | CustomerId |
| Orders | IX_Orders_Status_Date | Status, OrderDate |
| OrderItems | IX_OrderItems_Order | OrderId |
| Invoices | UQ_Invoices_Number | InvoiceNumber (único) |
| Invoices | IX_Invoices_Customer | CustomerId |
| Invoices | IX_Invoices_Status_Due | Status, DueDate |
| InvoicePayments | IX_Payments_Invoice | InvoiceId |
| InventoryMovements | IX_Movements_Product_Date | ProductId, CreatedAt |
| FinanceTransactions | IX_Finance_Date_Type | TransactionDate, Type |
| AuditLogs | IX_Audit_Timestamp | Timestamp |
| AuditLogs | IX_Audit_User | UserId |

---

## Restrições

- **Chaves primárias:** todas as colunas `Id` (`uniqueidentifier`, clustered).
- **Chaves estrangeiras:** conforme listado em Relacionamentos.
- **Restrições únicas:** Email, Role.Name, Permission.Name, Product.Sku, Order.OrderNumber, Invoice.InvoiceNumber.
- **Restrições de check:** `Orders.Status IN (...)`, `Invoices.Status IN (...)`, `InventoryMovements.Type IN ('Entry','Exit')`, `FinanceTransactions.Direction IN ('In','Out')`, colunas monetárias não negativas.
- **Restrições default:** `IsDeleted=0`, `IsActive=1`, `PaymentTermsDays=30`, timestamps padrão para `SYSUTCDATETIME()`.

---

## Dados de Seed

A rotina de seed (`dotnet run --seed`) cria:

1. **Permissions** — uma linha por ação de módulo (ex., `Users.View`, `Orders.Create`).
2. **Roles** — `Admin` (todas as permissões, `IsSystem=1`) e `User` (subconjunto somente leitura).
3. **Admin user** — `admin@ems.local` / `Admin@12345` (hashed), atribuído a `Admin`.
4. **Settings** — uma linha padrão de empresa.
5. **Sample reference data** (flag opcional) — alguns clientes, fornecedores, categorias e produtos para o painel renderizar imediatamente.

> Seed é idempotente: re-executar não duplica linhas de sistema.

---

## Estratégia de Backup

- **Backup completo:** noturno (`BACKUP DATABASE [EMS] TO DISK = ...`).
- **Diferencial:** a cada 6 horas.
- **Log de transação:** a cada 15 minutos (modelo de recuperação FULL).
- **Retenção:** 30 dias online, 12 meses arquivados em armazenamento frio.
- **Teste de restore:** drill de restore trimestral para verificar integridade.
- **Docker:** monte um volume nomeado para `/var/opt/mssql` e faça snapshot, ou use `sqlcmd` para fazer backup para um caminho host montado.

Exemplo:

```sql
BACKUP DATABASE [EMS]
TO DISK = N'/var/opt/mssql/backups/ems_full.bak'
WITH COMPRESSION, STATS = 10;
```

---

## Plano de Manutenção

- **Manutenção de índices:** `REORGANIZE` semanal, `REBUILD` mensal para índices fragmentados (>30%).
- **Estatísticas:** auto-update ativado; `UPDATE STATISTICS` manual após grandes cargas em massa.
- **Verificação de integridade:** `DBCC CHECKDB` semanal.
- **Limpeza de logs de auditoria:** arquive linhas mais antigas que 24 meses para uma tabela de histórico.
- **Reconciliação de saldo de estoque:** job noturno para recomputar `Customer.Balance` e verificar `Product.Stock` contra `InventoryMovements`.

---

## Ajuste de Performance

- Mantenha índices de cobertura para os filtros de lista mais comuns (`Status`, intervalos de data).
- Use **paginação** em todos os endpoints de lista (evite `SELECT *` sem `OFFSET/FETCH`).
- Mantenha a coluna `Customer.Balance` desnormalizada via job noturno em vez de computar a cada leitura.
- Habilite **query store** para capturar regressões.
- Para relatórios, considere agregados materializados agendados (vendas/dia) em vez de escanear tabelas brutas.
- Defina `TrustServerCertificate=True` apenas em dev; use um certificado real e conexões criptografadas em produção.
