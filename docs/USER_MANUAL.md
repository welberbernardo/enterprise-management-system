# Manual do Usuário

Este manual explica como usar o **Sistema de Gestão Empresarial (EMS)** da perspectiva de um operador do dia a dia. Ele assume que o sistema já foi instalado (consulte [INSTALL.md](../docs/INSTALL.md)) e que você possui uma conta de usuário.

---

## Índice

1. [Introdução](#1-introdução)
2. [Primeiros Passos](#2-primeiros-passos)
3. [Painel](#3-painel)
4. [Gerenciamento de Usuários](#4-gerenciamento-de-usuários)
5. [Gerenciamento de Clientes](#5-gerenciamento-de-clientes)
6. [Gerenciamento de Fornecedores](#6-gerenciamento-de-fornecedores)
7. [Gerenciamento de Produtos](#7-gerenciamento-de-produtos)
8. [Gerenciamento de Pedidos](#8-gerenciamento-de-pedidos)
9. [Gerenciamento de Faturas](#9-gerenciamento-de-faturas)
10. [Gerenciamento de Estoque](#10-gerenciamento-de-estoque)
11. [Finanças](#11-finanças)
12. [Relatórios](#12-relatórios)
13. [Configurações](#13-configurações)
14. [Logs de Auditoria](#14-logs-de-auditoria)
15. [Melhores Práticas](#15-melhores-práticas)
16. [FAQ](#16-faq)

---

## 1. Introdução

O EMS centraliza suas operações empresariais. Dependendo da sua **função** atribuída, você verá um subconjunto dos módulos descritos abaixo. Administradores veem tudo; caixas podem ver apenas pedidos e faturas; funcionários do armazém podem ver apenas o estoque.

> **Espaço reservado para screenshot:** `docs/assets/login.png` — a tela de login com email/senha e link "Esqueceu a senha?".

---

## 2. Primeiros Passos

### Login

1. Abra a URL do aplicativo (ex., `http://localhost:4200`).
2. Insira seu **email** e **senha**.
3. Clique em **Entrar**.

Após o sucesso você é redirecionado para o **Painel**.

### Primeiro Login

A conta de administrador padrão é criada durante o seed:

```
Email:    admin@ems.local
Senha:    Admin@12345
```

> Altere esta senha imediatamente após o primeiro login (veja abaixo).

### Alterando Sua Senha

1. Clique no seu avatar (canto superior direito) → **Perfil**.
2. Selecione a aba **Segurança**.
3. Insira a **senha atual**, uma **nova senha** e confirme-a.
4. Clique em **Salvar**.

Política de senha: mínimo de 12 caracteres, pelo menos uma letra maiúscula, uma letra minúscula, um dígito e um caractere especial.

> **Espaço reservado para screenshot:** `docs/assets/profile-security.png` — a aba perfil/segurança com campos de senha.

---

## 3. Painel

O painel é sua página inicial e mostra uma visão geral em tempo real do negócio.

### Visão Geral

- **Tiles de KPI:** Total de clientes, pedidos abertos, valor do estoque, recebíveis pendentes, dinheiro em caixa.
- **Ações rápidas:** Criar pedido, adicionar cliente, registrar entrada de estoque.

### Estatísticas

Os tiles são atualizados ao vivo a partir de agregados em cache. Passar o mouse sobre um tile mostra o delta período contra período.

### Gráficos

- **Tendência de vendas** (gráfico de linha, últimos 30 dias).
- **Top produtos** (gráfico de barras).
- **Fluxo de caixa** (gráfico de área, entradas vs. saídas).
- **Pedidos por status** (gráfico de rosca).

### Notificações

Um ícone de sino mostra alertas: avisos de estoque baixo, faturas vencidas, tentativas de login falhas. Clique para expandir e marcar como lidas.

> **Espaço reservado para screenshot:** `docs/assets/dashboard.png` — painel com tiles de KPI, gráficos e sino de notificações.

---

## 4. Gerenciamento de Usuários

*Requer a permissão `UserManagement`.*

### Usuários

1. Vá para **Administração → Usuários**.
2. Clique em **Novo Usuário**.
3. Preencha: nome, email, telefone, função atribuída, status (ativo/desativado).
4. Clique em **Salvar**. Uma senha temporária é enviada por email (ou mostrada uma vez).
5. Para desativar um usuário, abra o menu da linha → **Desativar**.

### Funções

1. Vá para **Administração → Funções**.
2. Clique em **Nova Função**, forneça um nome e descrição.
3. Alterne as **permissões** que a função deve conceder.
4. Clique em **Salvar**.

### Permissões

Permissões são flags granulares (ex., `Orders.Create`, `Invoices.View`). Elas são agrupadas por módulo e atribuídas a funções. As permissões efetivas de um usuário são a união de todas as funções atribuídas a ele.

> **Espaço reservado para screenshot:** `docs/assets/users.png` — lista de usuários com dropdown de atribuição de função.

---

## 5. Gerenciamento de Clientes

### Clientes

1. Vá para **Clientes → Todos os Clientes**.
2. Clique em **Novo Cliente**.
3. Insira nome da empresa, ID fiscal, endereço de cobrança/entrega, limite de crédito e condições de pagamento.
4. Clique em **Salvar**.

Cada cliente mostra um **saldo** (soma de faturas não pagas) e **valor vitalício**.

### Contatos

Abra um cliente, mude para a aba **Contatos** e adicione um ou mais contatos (nome, email, telefone, função). Marque um como principal.

> **Espaço reservado para screenshot:** `docs/assets/customers.png` — detalhe do cliente com aba de contatos.

---

## 6. Gerenciamento de Fornecedores

1. Vá para **Fornecedores → Todos os Fornecedores**.
2. Clique em **Novo Fornecedor** e insira o nome legal, ID fiscal, endereço e condições de pagamento.
3. Adicione contatos na aba **Contatos**.
4. Salve.

Fornecedores são referenciados ao registrar **entradas de estoque** (recibos de compra).

---

## 7. Gerenciamento de Produtos

### Categorias

1. Vá para **Produtos → Categorias**.
2. Clique em **Nova Categoria**, insira um nome e categoria pai opcional.
3. Salve. Categorias podem ser aninhadas.

### Produtos

1. Vá para **Produtos → Todos os Produtos**.
2. Clique em **Novo Produto**.
3. Preencha: SKU, nome, descrição, categoria, unidade de medida, preço de compra, preço de venda, nível de reposição e estoque atual.
4. Salve.

A lista de produtos suporta busca, filtragem por categoria e exportação CSV.

> **Espaço reservado para screenshot:** `docs/assets/products.png` — grade de produtos com filtros e badges de estoque.

---

## 8. Gerenciamento de Pedidos

### Criando um Pedido

1. Vá para **Pedidos → Novo Pedido**.
2. Selecione um **cliente**.
3. Adicione **itens de linha**: busque um produto, defina quantidade e preço unitário (preenchido automaticamente pelo produto).
4. O total do pedido é atualizado automaticamente, incluindo qualquer imposto aplicável.
5. Clique em **Salvar** (rascunho) ou **Salvar e Confirmar**.

### Status do Pedido

| Status | Significado |
| --- | --- |
| **Rascunho** | Criado, ainda não confirmado. Editável. |
| **Confirmado** | Aceito; estoque é reservado. |
| **Processando** | Sendo atendido. |
| **Concluído** | Entregue/fechado. |
| **Cancelado** | Anulado. Sem impacto financeiro. |

### Impressão

Abra um pedido e clique em **Imprimir** para abrir uma visualização pronta para impressão. Use o diálogo de impressão do navegador para salvar como PDF ou enviar para uma impressora.

> **Espaço reservado para screenshot:** `docs/assets/orders.png` — detalhe do pedido com itens de linha e badge de status.

---

## 9. Gerenciamento de Faturas

### Criando uma Fatura

1. Vá para **Faturas → Nova Fatura**.
2. Vincule-a a um **pedido** existente (recomendado) ou crie independente.
3. Verifique itens de linha, data de vencimento e imposto.
4. Clique em **Emitir**. O número da fatura é atribuído automaticamente (formato `INV-YYYY-00001`).

### Geração de PDF

Abra a fatura emitida e clique em **Baixar PDF**. O EMS renderiza uma fatura profissional (cabeçalho da empresa, itens de linha, totais, observações) usando o gerador de PDF server-side.

### Registrando Pagamentos

Abra a fatura → **Registrar Pagamento**, insira valor, método (dinheiro/transferência/cartão) e data. Faturas parcialmente pagas mostram um saldo restante.

> **Espaço reservado para screenshot:** `docs/assets/invoice.png` — pré-visualização de fatura com botões Baixar PDF e Registrar Pagamento.

---

## 10. Gerenciamento de Estoque

### Entrada de Estoque (entrada)

1. Vá para **Estoque → Entrada de Estoque**.
2. Selecione um **fornecedor** e opcionalmente um pedido de compra vinculado.
3. Adicione produtos e quantidades recebidas.
4. Envie. Os níveis de estoque aumentam e um registro de movimentação é criado.

### Saída de Estoque (saída)

1. Vá para **Estoque → Saída de Estoque**.
2. Selecione um motivo (venda, ajuste, transferência, dano).
3. Adicione produtos e quantidades.
4. Envie. O estoque diminui.

### Histórico

**Estoque → Histórico** mostra todas as movimentações com: data, produto, tipo (entrada/saída), quantidade, referência (pedido/fatura) e usuário. Exportável para CSV.

> Produtos com estoque baixo (abaixo do nível de reposição) disparam notificações no painel.

---

## 11. Finanças

### Contas a Pagar

Lista faturas/contas de fornecedores não pagas, com datas de vencimento e faixas de vencimento (0–30, 31–60, 61–90+ dias).

### Contas a Receber

Lista faturas de clientes com status (não paga, parcialmente paga, vencida) e vencimento. Clique em uma fatura para registrar um pagamento.

### Fluxo de Caixa

**Finanças → Fluxo de Caixa** mostra entradas (recebimentos) e saídas (pagamentos) ao longo de um período selecionável, com saldo de execução e posição líquida.

---

## 12. Relatórios

Todos os relatórios estão em **Relatórios** e suportam filtros de intervalo de datas e exportação (PDF/Excel/CSV).

| Relatório | Descrição |
| --- | --- |
| **Relatório de Vendas** | Receita por período, por cliente, por produto. |
| **Relatório de Estoque** | Níveis de estoque, valoração, itens de movimento lento. |
| **Relatório de Clientes** | Top clientes por receita, saldos. |
| **Relatório de Produtos** | Mais vendidos, análise de margem. |
| **Relatório Financeiro** | Resumo de lucros e perdas, posição de caixa. |

> **Espaço reservado para screenshot:** `docs/assets/reports.png` — construtor de relatórios com filtros e menu de exportação.

---

## 13. Configurações

### Informações da Empresa

**Configurações → Empresa** armazena o nome legal, ID fiscal, endereço, logo e detalhes bancários. Esta informação aparece nas faturas e relatórios gerados.

### Preferências

Configure taxa de imposto padrão, moeda, formato de data e formato de número.

### Tema

Alterne o modo **Claro / Escuro** no menu do usuário ou em **Configurações → Aparência**. A escolha é salva por usuário.

---

## 14. Logs de Auditoria

*Requer a permissão `Audit.View`.*

**Administração → Logs de Auditoria** registra eventos relevantes de segurança e dados: logins (sucesso/falha), alterações de permissão, criação/atualização/exclusão de registros e alterações de configuração. Cada entrada mostra data/hora, usuário, ação, entidade e endereço IP. Use os filtros para investigar incidentes.

---

## 15. Melhores Práticas

- **Altere a senha de admin padrão** antes de colocar em produção.
- **Atribua funções de menor privilégio** — não torne todos administradores.
- **Registre movimentações de estoque prontamente** para manter a precisão do inventário.
- **Emita faturas a partir de pedidos** para evitar dados incompatíveis.
- **Reconcilie Contas a Receber/Pagar** semanalmente.
- **Revise os Logs de Auditoria** periodicamente por atividade suspeita.
- **Faça backup do banco de dados** diariamente (consulte [DATABASE.md](../docs/DATABASE.md)).

---

## 16. FAQ

**P: Esqueci minha senha.**  
R: Clique em **Esqueceu a senha?** na tela de login e siga o email de redefinição. Administradores também podem redefini-la no Gerenciamento de Usuários.

**P: Por que não consigo ver um módulo?**  
R: Sua função carece da permissão necessária. Contate um administrador.

**P: Como imprimo uma fatura como PDF?**  
R: Abra a fatura e clique em **Baixar PDF**.

**P: O estoque mostra negativo — o que aconteceu?**  
R: Uma saída de estoque excedeu a quantidade em mãos. Revise **Estoque → Histórico** para encontrar a movimentação e corrigi-la com um ajuste.

**P: Posso exportar dados?**  
R: Sim. Listas e relatórios suportam exportação CSV/Excel/PDF.

**P: Os gráficos do painel estão vazios.**  
R: Pode não haver dados para o período selecionado, ou o cache de agregados não foi atualizado. Tente alterar o intervalo de datas ou recarregar.
