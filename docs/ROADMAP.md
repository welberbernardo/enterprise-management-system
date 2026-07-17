# Roadmap

Este roadmap descreve a evolução planejada do **Sistema de Gestão Empresarial (EMS)**. As datas são indicativas e podem mudar com base em feedback e capacidade. Cada entrada lista os recursos alvo e quaisquer itens de dívida técnica associados a resolver.

---

## Visão Geral da Linha do Tempo de Versões

| Versão | Status | Tema | Alvo |
| --- | --- | --- | --- |
| 1.0.0 | ✅ Lançado | Lançamento Inicial | 2026-07-17 |
| 1.1.0 | 📋 Planejado | Relatórios Aprimorados | 2026-Q4 |
| 1.2.0 | 📋 Planejado | Suporte Multi-empresa | 2027-Q1 |
| 1.3.0 | 📋 Planejado | Análise Avançada | 2027-Q2 |
| 2.0.0 | 📋 Planejado | Aplicativo Mobile | 2027-Q3 |
| 2.1.0 | 📋 Planejado | Insights com IA | 2027-Q4 |
| 2.2.0 | 📋 Planejado | Marketplace de Integrações | 2028-Q1 |
| 3.0.0 | 🔮 Futuro | Migração para Microserviços | 2028+ |

Legenda: ✅ Lançado · 📋 Planejado · 🔮 Futuro

---

## 1.0.0 — Atual: Lançamento Inicial
**Status:** Lançado em 2026-07-17

Conjunto completo de funcionalidades: autenticação, RBAC, clientes, fornecedores, produtos, pedidos, faturas (PDF), estoque, finanças, painel, relatórios, logs de auditoria. Consulte [CHANGELOG.md](CHANGELOG.md).

---

## 1.1.0 — Planejado: Relatórios Aprimorados
**Alvo:** 2026-Q4

### Funcionalidades
- Entrega agendada de relatórios (email em cron).
- Construtor de relatórios personalizado (arrastar e soltar colunas, filtros, visualizações salvas).
- Tabelas de resumo/pivô e exportações bar/line/pie.
- Importação em massa CSV/Excel para clientes, produtos e fornecedores.
- Localização de rótulos de relatórios.

### Dívida Técnica
- Substituir queries de relatório ad-hoc por um repositório de relatórios compartilhado.
- Adicionar testes de integração para cada tipo de relatório.

---

## 1.2.0 — Planejado: Suporte Multi-empresa
**Alvo:** 2027-Q1

### Funcionalidades
- Escopo de tenant/empresa em todos os dados de negócio.
- Seletor de empresa na UI com configurações e branding por empresa.
- Relatórios consolidados entre empresas (apenas admin).
- Atribuições de usuários e funções por empresa.

### Dívida Técnica
- Introduzir um discriminador `CompanyId` nas 18 tabelas (estratégia de migração).
- Impor isolamento de tenant na camada de repositório/filtro de query.
- Log de auditoria deve capturar contexto de empresa.

---

## 1.3.0 — Planejado: Análise Avançada
**Alvo:** 2027-Q2

### Funcionalidades
- Análise de coorte e retenção de clientes.
- Rotatividade de estoque e detecção de itens mortos.
- Análise de margem e lucratividade por produto/categoria.
- Fluxo de caixa previsto com base em vencimento de contas a receber/pagar.
- Widgets de painel configuráveis (layouts personalizáveis pelo usuário).

### Dívida Técnica
- Introduzir um banco de dados de relatórios otimizado para leitura / views materializadas.
- Migrar agregados do painel para a camada de cache (Redis).

---

## 2.0.0 — Planejado: Aplicativo Mobile
**Alvo:** 2027-Q3

### Funcionalidades
- Aplicativo mobile nativo/híbrido (iOS e Android) para equipe de campo.
- Escaneamento de código de barras/QR para estoque e produtos.
- Entrada de pedido offline-first com sincronização na reconexão.
- Notificações push para estoque baixo e faturas vencidas.

### Dívida Técnica
- Extrair cliente API compartilhado para um SDK consumível por web + mobile.
- Reforçar API para conectividade intermitente (escritas idempotentes, tokens de sincronização).

---

## 2.1.0 — Planejado: Insights com IA
**Alvo:** 2027-Q4

### Funcionalidades
- Previsão de demanda para produtos usando vendas históricas.
- Detecção de anomalias em transações e estoque.
- Consulta em linguagem natural ("mostre-me os top clientes deste trimestre").
- Lembretes inteligentes de pagamento e sugestões de cobrança.

### Dívida Técnica
- Definir um feature store ML alimentado pelo banco de dados de relatórios.
- Estabelecer governança de modelo, avaliação e procedimentos de rollback.

---

## 2.2.0 — Planejado: Marketplace de Integrações
**Alvo:** 2028-Q1

### Funcionalidades
- Framework de plugin/conector (webhooks + adaptadores REST).
- Conectores pré-construídos: gateways de pagamento, contabilidade (ex., QuickBooks), frete, e-commerce.
- Registro de app OAuth para desenvolvedores terceiros.
- Barramento de eventos para eventos de domínio de saída.

### Dívida Técnica
- Formalizar o esquema de eventos de saída e versionamento.
- Construir um sandbox de conectores e processo de revisão.

---

## 3.0.0 — Futuro: Migração para Microserviços
**Alvo:** 2028 e além

### Funcionalidades
- Decompor o monólito em serviços de domínio (Identity, Catalog, Orders, Billing, Inventory, Finance, Reporting).
- API gateway com auth unificada e roteamento.
- Comunicação orientada a eventos (message broker).
- Implantabilidade e escalonamento independentes por serviço.

### Dívida Técnica
- Eliminar acoplamento de banco de dados compartilhado (bancos por serviço).
- Implementar tracing distribuído e consistência baseada em saga.
- Migrar de MediatR em processo para mensageria entre serviços.

---

## Como Influenciar o Roadmap

- Abra uma solicitação de funcionalidade: https://github.com/enterprise/ems/issues
- Junte-se à comunidade: https://community.ems.example.com
- Prioridades são revisadas a cada trimestre com base em feedback e métricas de adoção.
