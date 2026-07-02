import { defineWorkspace } from 'vitest/config';

// Vitest monorepo workspace - 按包配置测试
export default defineWorkspace([
  {
    test: {
      name: 'shared',
      root: './packages/shared',
      environment: 'jsdom',
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      globals: true,
    },
  },
  {
    test: {
      name: 'ui',
      root: './packages/ui',
      environment: 'jsdom',
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      globals: true,
      setupFiles: ['./tests/setup.ts'],
    },
  },
  {
    test: {
      name: 'push-core',
      root: './packages/push-core',
      environment: 'node',
      include: ['src/**/*.{test,spec}.ts', 'tests/**/*.test.ts'],
      globals: true,
    },
  },
  {
    test: {
      name: 'admin-server',
      root: './apps/admin/server',
      environment: 'node',
      include: ['src/**/*.{test,spec}.ts', 'tests/**/*.test.ts'],
      globals: true,
    },
  },
  {
    test: {
      name: 'admin-web',
      root: './apps/admin/web',
      environment: 'jsdom',
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      globals: true,
      setupFiles: ['./tests/setup.ts'],
    },
  },
  {
    test: {
      name: 'store-template',
      root: './apps/store-template',
      environment: 'jsdom',
      include: ['src/**/*.{test,spec}.{ts,tsx}', 'tests/**/*.{test,spec}.{ts,tsx}', 'core/**/*.{test,spec}.{ts,tsx}', 'shared-pages/**/*.{test,spec}.{ts,tsx}'],
      globals: true,
      setupFiles: ['./tests/setup.ts'],
    },
  },
]);
