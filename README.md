# Monorepo Template: `pnpm` + `Turborepo`

Um template de monorepo escalável, pronto para servir de base a múltiplos projetos e pacotes compartilhados. Utiliza **pnpm workspaces** (com *Catalogs*) para gerenciamento de dependências e **Turborepo** para orquestração de tarefas, com cache inteligente.

---

## Sumário

- [Stack](#stack)
- [Estrutura do Repositório](#estrutura-do-repositório)
- [Pipeline de Build](#pipeline-de-build)
- [Primeiros Passos](#primeiros-passos)
- [Comandos](#comandos)
- [Gerenciamento de Dependências](#gerenciamento-de-dependências)
- [Adicionando um Novo Projeto](#adicionando-um-novo-projeto)
- [Licença](#licença)

---

## Stack

| Categoria | Ferramenta | Versão / Observação |
|---|---|---|
| Gerenciador de pacotes e workspaces | [pnpm](https://pnpm.io/) | `12.23.0` |
| Orquestração de tarefas e cache | [Turborepo](https://turbo.build/) | — |
| Lint e formatação | [Biome](https://biomejs.dev/) | Configuração centralizada em `packages/config` |
| Tipagem | [TypeScript](https://www.typescriptlang.org/) | Configuração centralizada em `packages/config` |
| Testes | [Jest](https://jestjs.io/) | Configuração centralizada em `packages/config` |

### Aplicações de exemplo (`apps/meu-projeto`)

- **API** (`@meu-projeto/api`): NestJS
- **Web** (`@meu-projeto/web`): React + Vite

---

## Estrutura do Repositório

```text
.
├── apps/
│   └── meu-projeto/
│       ├── api/                  # Back-end NestJS (@meu-projeto/api)
│       └── web/                  # Front-end React + Vite (@meu-projeto/web)
├── packages/
│   └── config/                   # Configurações compartilhadas (Biome, TS, Jest)
├── scripts/
│   └── create-project.mjs        # Gerador de novos projetos em apps/
├── package.json                  # Scripts globais e dependências da raiz
├── pnpm-workspace.yaml           # Workspaces e catálogo de versões
├── pnpm-lock.yaml                # Lockfile único do monorepo
└── turbo.json                    # Pipeline de build, dev, lint, test e cache
```

O `pnpm-workspace.yaml` suporta tanto aplicações diretas (`apps/*`) quanto agrupadas por projeto (`apps/*/*`), além de pacotes compartilhados (`packages/*`).

### Por que agrupar em `apps/<projeto>/<app>`?

Essa organização permite manter vários projetos independentes no mesmo repositório (por exemplo, `apps/ecommerce/api`, `apps/ecommerce/web` e `apps/admin/web`), todos compartilhando as mesmas configurações base e bibliotecas internas de `packages/`.

---

## Pipeline de Build

O `turbo.json` define `"dependsOn": ["^build"]` para a tarefa `build`, assim como para `start:dev`, `lint` e `test`. O prefixo `^` garante que as dependências internas sejam processadas antes das aplicações que as consomem:

```text
packages/config  (build primeiro via tsup → gera dist/)
       │
       ├──▶ apps/meu-projeto/api  (nest build)
       └──▶ apps/meu-projeto/web  (tsc -b && vite build)
```

### Cache

- Os artefatos (`dist/**`, `.next/**`, `coverage/**`) são armazenados localmente na pasta `.turbo`.
- Ao alterar apenas `@meu-projeto/web`, o Turborepo restaura do cache o resultado de `config` e `@meu-projeto/api` e recompila somente o que mudou.

---

## Primeiros Passos

### Pré-requisitos

- **Node.js** (versão LTS recomendada)
- **pnpm** `12.23.0`. Com Corepack habilitado, a versão é definida automaticamente pelo campo `"packageManager"` do `package.json`.

### Instalação

```bash
# 1. Instale as dependências a partir da raiz
pnpm install

# 2. Execute a build inicial de pacotes e aplicações
pnpm turbo build
```

---

## Comandos

### Scripts globais

```bash
pnpm lint:all                 # Executa o lint (Biome) em todos os workspaces
pnpm format:all               # Formata o código em todos os workspaces
pnpm new:project <nome>       # Cria um novo projeto em apps/<nome> a partir do molde
```

### Tarefas via Turborepo

```bash
pnpm turbo build       # Build respeitando a ordem de dependências
pnpm turbo start:dev   # Sobe os servidores de desenvolvimento em paralelo
pnpm turbo test        # Executa os testes
```

### Filtragem com `--filter`

Use `--filter` para executar tarefas em um pacote específico, identificado pelo campo `"name"` do `package.json`:

```bash
# Somente a API em modo de desenvolvimento
pnpm turbo start:dev --filter=@meu-projeto/api

# Somente o Web em modo de desenvolvimento
pnpm turbo start:dev --filter=@meu-projeto/web

# Build da API e de todas as suas dependências (ex.: config)
pnpm turbo build --filter=@meu-projeto/api...
```

---

## Gerenciamento de Dependências

### 1. Catálogo centralizado (`catalog:`)

As versões de ferramentas comuns (`typescript`, `@biomejs/biome`, `jest`, `ts-jest`, `@types/node` e `@types/jest`) ficam definidas na seção `catalog` do `pnpm-workspace.yaml`. Nos `package.json` dos workspaces, basta referenciá-las:

```json
"devDependencies": {
  "typescript": "catalog:",
  "@biomejs/biome": "catalog:"
}
```

Isso garante que todos os projetos utilizem exatamente a mesma versão.

### 2. Pacotes internos (`workspace:`)

Para consumir um pacote de `packages/`, use o protocolo `workspace:` no `package.json` da aplicação:

```json
"devDependencies": {
  "config": "workspace:^"
}
```

---

## Adicionando um Novo Projeto

### Forma automatizada (recomendada)

Utilize o script gerador configurado na raiz:

```bash
pnpm new:project loja-virtual
```

O script `scripts/create-project.mjs` realiza o processo automaticamente:

1. Valida o nome do projeto (apenas letras minúsculas, números e hífen).
2. Copia o molde `apps/meu-projeto` para `apps/loja-virtual`, ignorando `node_modules`, `dist`, `.turbo` e `pnpm-lock.yaml`.
3. Atualiza o campo `"name"` nos `package.json` para `@loja-virtual/api` e `@loja-virtual/web`.
4. Executa `pnpm install` na raiz para registrar os novos workspaces e atualizar os links internos.

### Forma manual

1. Crie as pastas dentro de `apps/`, por exemplo `apps/novo-projeto/api` e `apps/novo-projeto/web`.
2. Garanta que o campo `"name"` de cada `package.json` seja **único em todo o monorepo** (ex.: `"@novo-projeto/api"` e `"@novo-projeto/web"`).
3. Para usar as configurações compartilhadas, adicione `"config": "workspace:*"` às dependências.
4. Na raiz, execute `pnpm install` para registrar os novos workspaces e atualizar os links internos.

---

## Licença

Este projeto está licenciado sob a licença **ISC**. Consulte o arquivo [LICENSE](./LICENSE) para mais detalhes.

Desenvolvido por **Paulo Cesar**.