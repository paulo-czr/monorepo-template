<h1 align="center">Monorepo Template</h1>

<p align="center">
  Base para múltiplos projetos e pacotes compartilhados com <strong>pnpm workspaces</strong> e <strong>Turborepo</strong>.
</p>

<p align="center">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=pnpm,react,nestjs,vite,jest&theme=dark" />
  </a>
</p>

---

## Índice

- [Visão geral](#visão-geral)
- [Início rápido](#início-rápido)
- [Estrutura](#estrutura)
- [Comandos](#comandos)
- [Dependências](#dependências)
- [Criar um novo projeto](#criar-um-novo-projeto)
- [Licença](#licença)

---

## Visão geral

| Ferramenta | Função |
|---|---|
| [pnpm](https://pnpm.io/) `12.23.0` | Gerenciador de pacotes e workspaces |
| [Turborepo](https://turbo.build/) | Orquestração de tarefas e cache |
| [Biome](https://biomejs.dev/) | Lint e formatação |
| [TypeScript](https://www.typescriptlang.org/) | Tipagem |
| [Jest](https://jestjs.io/) | Testes |

Biome, TypeScript e Jest são configurados uma única vez em `packages/config`.

**Aplicações de exemplo** (em `apps/meu-projeto`):

- **API:** NestJS (`@meu-projeto/api`)
- **Web:** React + Vite (`@meu-projeto/web`)

---

## Início rápido

**Pré-requisitos:** Node.js (LTS) e pnpm `12.23.0`. Com Corepack habilitado, o pnpm é configurado automaticamente pelo campo `packageManager`.

```bash
pnpm install       # 1. Instala as dependências
pnpm turbo build   # 2. Compila pacotes e aplicações
```

---

## Estrutura

```text
.
├── apps/
│   └── meu-projeto/
│       ├── api/        # Back-end NestJS
│       └── web/        # Front-end React + Vite
├── packages/
│   └── config/         # Configurações compartilhadas (Biome, TS, Jest)
├── scripts/
│   └── create-project.mjs
├── turbo.json          # Pipeline de tarefas e cache
└── pnpm-workspace.yaml # Workspaces e catálogo de versões
```

Os workspaces são reconhecidos em três padrões: `apps/*`, `apps/*/*` e `packages/*`. Isso permite agrupar projetos, como `apps/ecommerce/api` e `apps/admin/web`, que compartilham os mesmos pacotes internos.

### Como o Turborepo ordena as tarefas

Em `turbo.json`, a tarefa `build` depende de `^build`. O `^` significa que as dependências internas são compiladas antes das aplicações que as usam:

```text
packages/config  →  compila primeiro (tsup)
      ├──▶ apps/meu-projeto/api   (nest build)
      └──▶ apps/meu-projeto/web   (tsc -b && vite build)
```

### Cache

Os resultados ficam em `.turbo`. Se você alterar só o `web`, o Turborepo reaproveita o cache de `config` e `api` e recompila apenas o que mudou.

---

## Comandos

### Globais

| Comando | Descrição |
|---|---|
| `pnpm lint:all` | Lint (Biome) em todos os workspaces |
| `pnpm format:all` | Formatação em todos os workspaces |
| `pnpm new:project <nome>` | Cria um novo projeto a partir do molde |

### Turborepo

| Comando | Descrição |
|---|---|
| `pnpm turbo build` | Build respeitando a ordem de dependências |
| `pnpm turbo start:dev` | Sobe os servidores de desenvolvimento em paralelo |
| `pnpm turbo test` | Executa os testes |

### Filtrar por pacote

Use `--filter` com o campo `name` do `package.json`:

```bash
pnpm turbo start:dev --filter=@meu-projeto/api   # Somente a API
pnpm turbo start:dev --filter=@meu-projeto/web   # Somente o Web
pnpm turbo build --filter=@meu-projeto/api...    # API e suas dependências
```

---

## Dependências

### Catálogo de versões (`catalog:`)

Versões de ferramentas comuns (`typescript`, `@biomejs/biome`, `jest`, `ts-jest`, `@types/node`, `@types/jest`) são definidas em `pnpm-workspace.yaml`. Nos `package.json`, basta usar `catalog:`:

```json
"devDependencies": {
  "typescript": "catalog:"
}
```

Assim, todos os projetos usam a mesma versão.

### Pacotes internos (`workspace:`)

Para usar um pacote de `packages/`, aponte para o workspace:

```json
"devDependencies": {
  "config": "workspace:^"
}
```

---

## Criar um novo projeto

### Automático (recomendado)

```bash
pnpm new:project loja-virtual
```

O script `scripts/create-project.mjs`:

1. Valida o nome (letras minúsculas, números e hífen).
2. Copia `apps/meu-projeto` para `apps/loja-virtual`, ignorando `node_modules`, `dist`, `.turbo` e `pnpm-lock.yaml`.
3. Renomeia os pacotes para `@loja-virtual/api` e `@loja-virtual/web`.
4. Executa `pnpm install` na raiz.

### Manual

1. Crie as pastas, por exemplo `apps/novo-projeto/api` e `apps/novo-projeto/web`.
2. Defina um `name` único em cada `package.json`, como `@novo-projeto/api`.
3. Adicione `"config": "workspace:*"` às dependências, se quiser usar as configurações compartilhadas.
4. Execute `pnpm install` na raiz.

---

## Licença

Distribuído sob a licença **ISC**. Veja o arquivo [LICENSE](./LICENSE).

Desenvolvido por **Paulo Cesar**.
