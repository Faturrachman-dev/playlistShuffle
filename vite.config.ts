import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    viteCompression({ algorithm: 'gzip' }),
    viteCompression({ algorithm: 'brotliCompress', ext: '.br' }),
  ],
  resolve: {
    // Prefer .ts/.tsx over .js/.jsx so new TypeScript files take precedence
    // while old .jsx files still exist during migration
    extensions: ['.mts', '.mjs', '.ts', '.tsx', '.js', '.jsx', '.json', '.node'],
  },
  server: {
    port: 9550,
    open: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  build: {
    outDir: 'dist',
  },
  base: '/',
  test: {
    globals: false,
    environment: 'node',
  },
});
