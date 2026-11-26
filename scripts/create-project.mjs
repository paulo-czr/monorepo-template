import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const projectName = process.argv[2]?.trim().toLowerCase();

if (!projectName || !/^[a-z0-9-]+$/.test(projectName)) {
  console.error('Informe um nome válido (apenas letras minúsculas, números e hífen).');
  console.error('   Exemplo: pnpm new:project loja-virtual');
  process.exit(1);
}

const rootDir = process.cwd();
const templateDir = path.join(rootDir, 'apps', 'meu-projeto');
const targetDir = path.join(rootDir, 'apps', projectName);

if (!fs.existsSync(templateDir)) {
  console.error('Pasta modelo "apps/meu-projeto" não encontrada.');
  process.exit(1);
}

if (fs.existsSync(targetDir)) {
  console.error(`O projeto "apps/${projectName}" já existe.`);
  process.exit(1);
}

// Copia o molde
const ignoredFolders = new Set(['node_modules', 'dist', '.turbo']);

console.log(`📁 Criando projeto em apps/${projectName}... \n`);
fs.cpSync(templateDir, targetDir, {
  recursive: true,
  filter: (src) => {
    const baseName = path.basename(src);
    return !ignoredFolders.has(baseName) && baseName !== 'pnpm-lock.yaml';
  },
});

// Atualiza o "name" nos package.json de api e web
for (const app of ['api', 'web']) {
  const pkgPath = path.join(targetDir, app, 'package.json');
  if (!fs.existsSync(pkgPath)) continue;

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.name = `@${projectName}/${app}`;
  fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
}

// Registra os novos workspaces no monorepo
console.log('Instalando e vinculando dependências com pnpm...');
execSync('pnpm install', { stdio: 'inherit', cwd: rootDir });

console.log(`\n✅ Projeto "@${projectName}" criado com sucesso!`);
console.log(`   Rode a API: pnpm turbo start:dev --filter=@${projectName}/api`);
console.log(`   Rode o Web: pnpm turbo start:dev --filter=@${projectName}/web`);