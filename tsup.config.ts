import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/main.ts'],
    minify: true,
    outDir: 'dist',
    format: ['esm'],
    dts: true,
    clean: true,
});
