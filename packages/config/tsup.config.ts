import { defineConfig } from "tsup";
import fs from "fs";

export default defineConfig({
  dts: true,
  clean: true,
  format: ["cjs", "esm"],
  treeshake: "recommended",
  entry: ['base/jest.config.ts'],
  onSuccess: async () => {
    // Copia os arquivos JSON da pasta base para o dist de forma multiplataforma
    if (fs.existsSync('base')) {
      const files = fs.readdirSync('base');
      if (!fs.existsSync('dist')) fs.mkdirSync('dist');
      files.forEach(file => {
        if (file.endsWith('.json')) {
          fs.copyFileSync(`base/${file}`, `dist/${file}`);
        }
      });
      console.log('✨ JSON files copied successfully!');
    }
  },
});