# TradeFlow - Análise de Arquitetura e Componentes (Server-Side)

Este documento fornece uma análise detalhada da arquitetura, estrutura de pastas, componentes e fluxo de dados do projeto TradeFlow, agora otimizado com **Next.js Server Components e Server Actions**. O objetivo é servir como um guia para desenvolvedores e IAs para entender o funcionamento do sistema e facilitar futuras modificações.

## 1. Visão Geral do Projeto

O TradeFlow é uma aplicação web construída com **Next.js (App Router)**, **React**, **TypeScript** e **Tailwind CSS**, utilizando componentes da biblioteca **ShadCN/UI** e ícones da **Phosphor Icons**. Ele funciona como um sistema de gerenciamento financeiro para *Day Traders*, permitindo ao usuário acompanhar seu desempenho, gerenciar sua banca, definir metas e visualizar seu progresso.

**Principais Funcionalidades:**
- **Configuração Inicial:** O usuário define o valor inicial de sua banca e metas percentuais.
- **Registro de Operações:** Lançamento de resultados diários (ganho/perda) e movimentações de banca (depósitos/retiradas).
- **Dashboard Principal:** Exibe cartões com estatísticas vitais, um gráfico da evolução da banca e o histórico de operações.
- **Projeção de Ganhos:** Mostra uma tabela com a projeção de crescimento da banca para os próximos 90 dias.
- **Calendário de Performance:** Visualização mensal onde os dias são coloridos de acordo com o resultado (ganho ou perda).
- **Persistência de Dados:** Todas as informações são salvas em um arquivo `data/database.json` no servidor.

---

## 2. Arquitetura Server-Side com Next.js

A aplicação foi refatorada para uma arquitetura "server-first", aproveitando ao máximo os recursos do Next.js App Router.

- **Server Components:** As páginas (`/dashboard`, `/projection`, etc.) são agora Server Components. Elas buscam os dados diretamente do sistema de arquivos do servidor **antes** de a página ser renderizada. Isso resulta em um carregamento inicial muito mais rápido, pois o HTML enviado ao navegador já contém todos os dados necessários.
- **Server Actions:** Todas as modificações de dados (salvar configurações, adicionar/deletar registros) são tratadas por **Server Actions** (`src/app/actions/trade-actions.ts`). Essas funções assíncronas rodam exclusivamente no servidor, garantindo segurança e simplificando o código do cliente. Elas manipulam o `database.json` e usam a função `revalidatePath` do Next.js para atualizar a interface do usuário automaticamente.
- **Sem Client-Side Data Fetching para Carregamento Inicial:** O `TradeDataProvider` e o hook `useTrade` foram removidos. O gerenciamento de estado global para os dados da aplicação não é mais necessário, pois os dados são passados do servidor para o cliente via `props`.

---

## 3. Estrutura de Pastas e Arquivos

```
src
├── app/                  # Rotas e Páginas (Next.js App Router)
│   ├── actions/
│   │   └── trade-actions.ts  # Server Actions para manipular os dados
│   ├── api/
│   │   └── exchange-rate/    # Rota de API para cotação do dólar
│   ├── calendar/page.tsx   # Página do Calendário (Server Component)
│   ├── dashboard/
│   │   ├── loading.tsx     # Skeleton UI para o dashboard
│   │   └── page.tsx        # Página do Dashboard (Server Component)
│   ├── projection/page.tsx # Página de Projeção (Server Component)
│   ├── globals.css         # Estilos globais e variáveis de tema
│   ├── layout.tsx          # Layout Raiz (Server Component)
│   └── page.tsx            # Página de Entrada (Setup ou redirecionamento)
│
├── components/           # Componentes React reutilizáveis ('use client')
│   ├── ui/                 # Componentes base do ShadCN/UI
│   ├── bank-evolution-chart.tsx
│   ├── bank-operation-dialog.tsx
│   ├── daily-log-form.tsx
│   ├── header.tsx
│   ├── performance-history-table.tsx
│   ├── projection-table.tsx
│   ├── settings-dialog.tsx
│   ├── setup.tsx
│   ├── stats-cards.tsx
│   ├── theme-toggle.tsx
│   └── trade-calendar.tsx
│
├── lib/                  # Funções utilitárias, tipos e lógica de negócio
│   ├── calculations.ts     # Funções puras para cálculos (banca, win rate)
│   ├── data-loader.ts      # Função para carregar dados do JSON no servidor
│   ├── types.ts            # Definições de tipos TypeScript
│   └── utils.ts            # Utilitários (ex: cn para classes Tailwind)
│
└── data/
    └── database.json       # "Banco de dados" em arquivo JSON
```

---

## 4. Fluxo de Dados

1.  **Carregamento de Página:**
    *   O usuário acessa uma URL, por exemplo, `/dashboard`.
    *   O Server Component `src/app/dashboard/page.tsx` é executado no servidor.
    *   Ele chama a função `loadData()` (`src/lib/data-loader.ts`), que lê o arquivo `data/database.json`.
    *   Os dados lidos (`settings` e `records`) são passados como `props` para os componentes de cliente (`'use client'`) que renderizam a UI, como `StatsCards` e `BankEvolutionChart`.
    *   O Next.js envia o HTML já renderizado e com os dados para o navegador.

2.  **Modificação de Dados (Ex: Adicionar Registro):**
    *   O usuário preenche e envia o formulário no componente `DailyLogForm` (um Client Component).
    *   O `onSubmit` do formulário chama a Server Action `addRecord` importada de `src/app/actions/trade-actions.ts`.
    *   A função `addRecord` executa **no servidor**, lê o `database.json`, adiciona o novo registro e salva o arquivo.
    *   Ao final, a action chama `revalidatePath('/dashboard')`. Isso instrui o Next.js a invalidar o cache da página do dashboard.
    *   O Next.js automaticamente busca os novos dados e re-renderiza a página com as informações atualizadas, sem a necessidade de um refresh manual.

---

## 5. Análise dos Componentes Chave

A maioria dos componentes manteve sua responsabilidade visual, mas a forma como recebem dados foi alterada.

-   **Páginas (`/dashboard/page.tsx`, etc.):** Agora são Server Components. Sua principal responsabilidade é carregar os dados via `loadData` e passá-los como props para os componentes de UI. Eles também contêm a lógica de redirecionamento.
-   **Componentes de UI (`StatsCards`, `BankEvolutionChart`, etc.):** São Client Components (`'use client'`) para poderem usar interatividade (hooks como `useState`, `useEffect`, etc.). Eles não buscam mais dados, apenas os recebem via `props` e os exibem.
-   **Componentes com Formulários (`DailyLogForm`, `SettingsDialog`, etc.):** Continuam como Client Components. A diferença crucial é que agora, ao invés de chamarem uma API via `fetch` ou uma função de um Contexto, eles importam e chamam diretamente as **Server Actions** para realizar as modificações.
-   **`loading.tsx`:** O arquivo em `app/dashboard/loading.tsx` é um recurso do Next.js. Ele cria uma UI de esqueleto (*skeleton loader*) que é exibida automaticamente no servidor enquanto os dados para a rota `/dashboard` estão sendo carregados, melhorando a performance percebida.
