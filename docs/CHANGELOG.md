# Changelog

Todas as alterações notáveis no Sistema de Gestão Empresarial são documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-07-17

### Adicionado

#### Sistema de Autenticação
- Autenticação baseada em JWT com access e refresh tokens.
- Rotação e revogação de refresh token.
- Redefinição de senha (esqueceu/redefinir) e fluxos de alteração de senha.
- Bloqueio de conta após tentativas de login falhas repetidas.
- Hash seguro de senha com política de senha forçada.

#### Gerenciamento de Usuários
- Criar, atualizar, desativar e listar usuários.
- Perfil de usuário com avatar e configurações de segurança.
- Atribuição de usuários a uma ou mais funções.

#### Controle de Acesso Baseado em Funções
- Gerenciamento de funções (criar, atualizar, excluir).
- Definições de permissão granulares agrupadas por módulo.
- Mapeamentos permissão-para-função e função-para-usuário.
- Autorização baseada em policy em todos os endpoints protegidos.

#### Gerenciamento de Clientes
- Registros de clientes com ID fiscal, endereço, limite de crédito e condições de pagamento.
- Múltiplos contatos por cliente com flag de contato principal.
- Acompanhamento de saldo de cliente desnormalizado.

#### Gerenciamento de Fornecedores
- Registros de fornecedores com contatos e condições de pagamento.

#### Gerenciamento de Produtos
- Catálogo de produtos com SKU, preços, unidade de medida e estoque.
- Categorias de produto aninhadas.
- Endpoint de upload de imagem de produto.

#### Gerenciamento de Pedidos
- Criação de pedidos com itens de linha e cálculo automático de total (subtotal, imposto, total).
- Fluxo de status de pedido: Rascunho → Confirmado → Processando → Concluído → Cancelado.
- Visualização de pedido pronta para impressão.

#### Gerenciamento de Faturas
- Geração de fatura vinculada a pedidos.
- Numeração automática de faturas (`INV-YYYY-NNNNN`).
- **Geração de PDF** server-side e download.
- Registro de pagamento (total e parcial) com acompanhamento de status (Unpaid/Partial/Paid/Overdue).

#### Gerenciamento de Estoque
- Entrada de estoque (entrada) e saída de estoque (saída) com códigos de motivo.
- Atualizações automáticas de nível de estoque.
- Histórico completo de movimentações com rastreamento de referência.
- Notificações de estoque baixo no painel.

#### Finanças
- Visualização de contas a pagar com faixas de vencimento.
- Visualização de contas a receber com vencimento e registro de pagamento.
- Demonstrativo de fluxo de caixa (entradas vs. saídas).

#### Painel
- Tiles de KPI (clientes, pedidos abertos, valor do estoque, recebíveis, caixa).
- Gráficos: tendência de vendas, top produtos, fluxo de caixa, pedidos por status.
- Notificações em tempo real (estoque baixo, faturas vencidas, logins falhos).

#### Relatórios
- Relatórios de vendas, estoque, clientes, produtos e financeiros.
- Filtragem por intervalo de datas e exportação CSV/Excel/PDF.

#### Logs de Auditoria
- Registro imutável de eventos de autenticação e mutação de dados.
- Visualizador de logs de auditoria filtrável para administradores.

#### Infraestrutura e Ferramentas
- Backend de Arquitetura Limpa (.NET 9): Core, Application, Infrastructure, Api.
- Frontend Angular 19 com signals, rotas lazy e theming.
- Schema SQL Server com 18 tabelas, migrações e dados de seed.
- Documentação Swagger / OpenAPI 3.
- Dockerfile e docker-compose para API, web e SQL Server.
- Scaffolding de testes unitários e de integração (xUnit, Karma/Jasmine).

---

[1.0.0]: https://github.com/enterprise/ems/releases/tag/v1.0.0
