import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/main.ts'],
    target: 'esnext',
    minify: true,
    keepNames: true,
    outDir: 'dist',
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
});
