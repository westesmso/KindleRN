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

Para Android com development build:

```bash
npm run android:dev
```

Em outro terminal, inicie o Metro para dev client:

```bash
npm run start:dev
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

Fluxo recomendado no Android:

1. Rode `npm run build:android` para gerar um APK via EAS Build.
1. Instale o APK no celular.
1. Rode `npm run start:dev` para subir o Metro no modo dev client se você estiver usando development build.

Se você quiser um build de desenvolvimento em vez de APK final para testes, use `npm run build:android:dev`.

Os comandos do projeto usam `npx eas`, então você não precisa instalar o EAS CLI globalmente. Se for a primeira vez, faça login com `npx eas login`.

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
