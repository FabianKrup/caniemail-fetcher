import { defineConfig } from 'tsup';

export default defineConfig({
    entryPoints: ['src/main.ts'],
    format: ['esm'],
    dts: true,
    outDir: 'dist',
    clean: true,
});
