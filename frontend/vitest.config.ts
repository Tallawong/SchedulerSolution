import angular from '@analogjs/vite-plugin-angular';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [angular({ tsconfig: 'tsconfig.spec.json' })],
  resolve: {
    alias: { src: fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
    pool: 'forks',
    fileParallelism: false,
    maxWorkers: 1,
    setupFiles: ['./src/test/setup-vitest.ts'],
  },
});
