# TradeFlow - Análise de Arquitetura e Componentes

Este documento fornece uma análise detalhada da arquitetura, estrutura de pastas, componentes e fluxo de dados do projeto TradeFlow. O objetivo é servir como um guia para desenvolvedores e IAs para entender o funcionamento do sistema e facilitar futuras modificações.

## 1. Visão Geral do Projeto

O TradeFlow é uma aplicação web construída com **Next.js (App Router)**, **React**, **TypeScript** e **Tailwind CSS** para estilização, utilizando componentes da biblioteca **ShadCN/UI**. Ele funciona como um sistema de gerenciamento financeiro para *Day Traders*, permitindo que o usuário acompanhe seu desempenho, gerencie sua banca, defina metas e visualize seu progresso.

**Principais Funcionalidades:**
- **Configuração Inicial:** O usuário define o valor inicial de sua banca e metas percentuais.
- **Registro Diário:** Lançamento de resultados diários (ganho/perda, número de operações, vitórias e derrotas).
- **Dashboard Principal:** Exibe cartões com estatísticas vitais, um gráfico da evolução da banca e o histórico de operações.
- **Projeção de Ganhos:** Mostra uma tabela com a projeção de crescimento da banca para os próximos 90 dias com base em juros compostos sobre a meta diária.
- **Calendário de Performance:** Visualização mensal onde os dias são coloridos de acordo com o resultado (ganho ou perda).
- **Persistência de Dados:** Todas as informações do usuário (configurações e registros) são salvas em um arquivo `data/database.json` no servidor, gerenciado por rotas de API do Next.js.

---

## 2. Estrutura de Pastas e Arquivos

```
src
├── app/                  # Rotas e Páginas (Next.js App Router)
│   ├── calendar/page.tsx   # Página do Calendário
│   ├── dashboard/page.tsx  # Página do Dashboard (Principal)
│   ├── projection/page.tsx # Página de Projeção
│   ├── globals.css         # Estilos globais e variáveis de tema (Tailwind)
│   ├── layout.tsx          # Layout Raiz da Aplicação
│   └── page.tsx            # Página de Entrada (Setup ou redirecionamento)
│
├── components/           # Componentes React reutilizáveis
│   ├── ui/                 # Componentes base do ShadCN/UI (Botão, Card, etc.)
│   ├── bank-evolution-chart.tsx
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
├── context/              # Contextos React para gerenciamento de estado
│   ├── theme-provider.tsx    # Gerencia o tema (light/dark)
│   └── trade-data-provider.tsx # Gerencia todos os dados da aplicação
│
├── hooks/                # Hooks React customizados
│   ├── use-mobile.tsx      # Hook para detectar se o dispositivo é mobile
│   └── use-toast.ts        # Hook para exibir notificações (toasts)
│
└── lib/                  # Funções utilitárias e definições de tipo
    ├── types.ts            # Definições de tipos TypeScript (UserSettings, DailyRecord)
    └── utils.ts            # Funções utilitárias (ex: cn para classes Tailwind)
```

---

## 3. Fluxo de Dados e Gerenciamento de Estado

O coração do gerenciamento de estado da aplicação é o **`TradeDataProvider`** (`src/context/trade-data-provider.tsx`).

- **Como Funciona:** Este provedor de contexto é responsável por:
    1.  Ler os dados de `settings` (configurações) e `records` (registros) do `localStorage` quando a aplicação é carregada.
    2.  Fornecer esses dados para todos os componentes que precisam deles através do hook `useTrade()`.
    3.  Disponibilizar funções para manipular os dados: `saveSettings`, `addRecord`, `deleteRecord`, e `resetData`. Essas funções atualizam tanto o estado no React quanto os dados no `localStorage`.
    4.  Calcular valores derivados em tempo real, como `currentBank` (banca atual) e `winRate` (taxa de acerto), e disponibilizá-los através do mesmo hook.

- **`ThemeProvider`**: Gerencia o estado do tema (claro, escuro ou sistema) e aplica a classe correspondente ao elemento `<html>` para que os estilos do Tailwind CSS funcionem corretamente.

---

## 4. Análise das Telas e Componentes

### a. Telas (Páginas)

-   **`app/page.tsx` (Página de Entrada):**
    -   **Lógica:** Verifica se `settings` existem no `useTrade()`.
    -   Se **NÃO** existem, renderiza o componente `Setup`.
    -   Se **SIM**, redireciona o usuário para `/dashboard`.

-   **`app/dashboard/page.tsx` (Dashboard):**
    -   **Função:** Tela principal que agrega os componentes mais importantes para o usuário.
    -   **Componentes Utilizados:** `Header`, `StatsCards`, `BankEvolutionChart`, `DailyLogForm`, `PerformanceHistoryTable`.
    -   **Estrutura:** Um grid layout que organiza os cards e o gráfico de forma responsiva.

-   **`app/projection/page.tsx` (Projeção):**
    -   **Função:** Exibe a projeção de ganhos futuros.
    -   **Componentes Utilizados:** `Header`, `ProjectionTable`.

-   **`app/calendar/page.tsx` (Calendário):**
    -   **Função:** Mostra a performance em uma visão de calendário.
    -   **Componentes Utilizados:** `Header`, `TradeCalendar`.

### b. Componentes Principais

-   **`Header` (`header.tsx`):**
    -   Barra de navegação fixa no topo.
    -   Contém os links para "Dashboard", "Projeção" e "Calendário".
    -   Inclui o `ThemeToggle` para mudar o tema e o `SettingsDialog` para acessar as configurações.

-   **`Setup` (`setup.tsx`):**
    -   Formulário inicial para o usuário inserir o valor da banca e as metas.
    -   Aparece apenas na primeira vez que o usuário acessa.
    -   Ao submeter, chama `saveSettings` do `useTrade()` e o usuário é redirecionado para o dashboard.

-   **`StatsCards` (`stats-cards.tsx`):**
    -   **Função:** Exibe 4 cartões com as métricas mais importantes.
    -   **Dados:** Banca Atual, Valor de Entrada Diária (meta), Meta de Lucro Diário e Taxa de Acerto.
    -   **Lógica:** Busca os dados de `settings`, `currentBank` e `winRate` do `useTrade()` e calcula os valores a serem exibidos.

-   **`BankEvolutionChart` (`bank-evolution-chart.tsx`):**
    -   **Função:** Renderiza um gráfico de área mostrando o crescimento da banca ao longo do tempo.
    -   **Lógica:** Usa a biblioteca `recharts`. Pega os `records` e `settings` do `useTrade()`, ordena os registros por data e calcula o valor acumulado da banca dia após dia para montar a série de dados do gráfico.

-   **`DailyLogForm` (`daily-log-form.tsx`):**
    -   **Função:** Formulário para o usuário registrar o resultado do seu dia de trade.
    -   **Campos:** Data, Resultado (Ganho/Perda), Valor, Entradas, Ganhos, Perdas.
    -   **Validação:** Usa `react-hook-form` e `zod` para validar os dados (ex: a soma de ganhos e perdas deve ser igual ao total de entradas).
    -   **Lógica:** Ao submeter, chama a função `addRecord` do `useTrade()`. Exibe toasts de sucesso ou erro.

-   **`PerformanceHistoryTable` (`performance-history-table.tsx`):**
    -   **Função:** Exibe uma tabela com o histórico de todos os registros diários.
    -   **Colunas:** Data, Resultado (R$), Entradas, Ganhos, Perdas, Taxa de Acerto (%), Ação (Deletar).
    -   **Lógica:** Mapeia os `records` do `useTrade()`. O resultado é colorido (verde/vermelho). A taxa de acerto é exibida em uma `Badge` também colorida. O botão de deletar abre um diálogo de confirmação e chama `deleteRecord` do `useTrade()`.

-   **`ProjectionTable` (`projection-table.tsx`):**
    -   **Função:** Tabela que calcula e exibe a projeção de ganhos para os próximos 90 dias.
    -   **Lógica:** Usa `useMemo` para calcular os dados da projeção. Pega a `currentBank` e a `dailyProfitTarget` do `useTrade()`. Itera 90 vezes, calculando o lucro diário com base no valor projetado da banca do dia anterior (juros compostos) e adiciona à tabela.

-   **`TradeCalendar` (`trade-calendar.tsx`):**
    -   **Função:** Exibe um calendário de tela cheia.
    -   **Lógica:** Usa a biblioteca `react-day-picker`. Pega os `records` do `useTrade()` e cria dois arrays de datas: `gainDays` e `lossDays`. Esses arrays são passados como "modificadores" para o calendário, que aplica estilos CSS diferentes para cada um (fundo verde para ganho, vermelho para perda). Utiliza a localidade `pt-BR` para tradução.

-   **`SettingsDialog` (`settings-dialog.tsx`):**
    -   **Função:** Um modal (diálogo) que permite ao usuário editar as configurações salvas ou resetar todos os dados.
    -   **Lógica:** Funciona de forma similar ao `Setup`, mas é acessado por um ícone no cabeçalho. Ao salvar, chama `saveSettings`. O botão "Resetar Dados" abre um segundo diálogo de confirmação e, se confirmado, chama `resetData`.
