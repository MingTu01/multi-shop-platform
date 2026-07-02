import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// Vite library mode 配置 - @msp/ui
// 仅产出 ESM 产物（dist/index.js），类型由 tsc --emitDeclarationOnly 生成
// 同时承载 vitest 测试配置（包内运行 `vitest run` 时使用）
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'msp-ui',
      formats: ['es'],
      fileName: 'index',
      cssFileName: 'styles',
    },
    cssCodeSplit: false,
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', '@msp/shared'],
      output: {
        preserveModules: false,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
