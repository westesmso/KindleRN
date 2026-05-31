# KindleRN

Aplicativo Expo/React Native inspirado no Kindle, com navegação por Drawer + Tabs, biblioteca, leitor EPUB, upload de arquivos e edição de metadados.

## Visão Geral

O projeto usa Expo SDK 54 e foi montado para funcionar em Android, iOS e web. A experiência principal inclui biblioteca com filtros, leitor EPUB com capítulos e tema, upload de arquivos e um fluxo de edição rápida para metadados.

## Funcionalidades

- Navegação principal com Drawer e Tabs.
- Biblioteca com filtros, favoritos e ordenação.
- Upload de arquivos PDF e EPUB.
- Editor rápido e editor completo de metadados do arquivo.
- Leitor EPUB com capítulos, busca, tema e ajuste de fonte.
- Leitor PDF nativo no Android e iOS, com fallback para abrir externamente quando necessário.
- Persistência local de uploads, favoritos e progresso de leitura.

## Requisitos

- Node.js
- Expo CLI via `npx`
- Para testar o leitor PDF nativo no celular, use um development build. O Expo Go pode não carregar o módulo nativo do visualizador.

## Instalação

```bash
npm install
```

## Como executar

```bash
npm start
```

Para Android:

```bash
npm run android
```

Para iOS:

```bash
npm run ios
```

Para web:

```bash
npm run web
```

## Build Nativo

Para validar o leitor PDF nativo em dispositivo real, use um development build no Android ou iOS. Em ambientes Expo Go, alguns módulos nativos podem não estar disponíveis.

## Estrutura do Projeto

- `App.tsx` e `index.ts` - inicialização do app.
- `app.json` - configuração do Expo.
- `babel.config.js` - configuração do Babel para o Expo.
- `src/navigation/` - navegação principal.
- `src/screens/` - telas do app.
- `src/context/` - estado global da biblioteca.
- `src/components/` - componentes reutilizáveis, incluindo o visualizador de PDF.
- `src/utils/` - utilitários como o parser de EPUB.

## Arquivos de Apoio ao Workspace

Alguns arquivos no repositório existem para orientar o assistente e o workspace, não para a execução do app:

- `CLAUDE.md` e `AGENTS.md` - instruções do workspace/assistente.
- `.claude/` - configurações locais do ambiente de assistência.

Esses arquivos são úteis se você continuar usando este ambiente de desenvolvimento assistido. Não são necessários para o runtime do app, mas ajudam a manter o comportamento e as instruções do workspace consistentes.

## Observações

- O app já está configurado para Expo SDK 54.
- Alguns recursos nativos, como o leitor PDF, exigem build nativo para funcionar no dispositivo.
- Arquivos enviados, favoritos e progresso são salvos localmente no aparelho.
