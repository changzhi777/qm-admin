/**
 * qm-admin vitest 配置
 *
 * 双 environment：
 * - happy-dom（默认）：轻量 DOM 模拟，**纯逻辑 / 包装层测试用**
 * - jsdom（按 file 标注 .dom.test.tsx）：antd / React 组件渲染用
 *
 * alias 与 tsconfig.json paths 对齐（@/* → src/*，@@/* → src/.umi/*）
 * 排除 Umi Max 自身 .umi 生成代码（避免误入测试集）
 */
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const SRC_DIR = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      // '@/*' → 'src/*'（与 tsconfig paths 对齐）
      { find: /^@\//, replacement: resolve(SRC_DIR, '') + '/' },
      // '@@/*' → 'src/.umi/*'（Umi Max 内部模块占位）
      { find: /^@@\//, replacement: resolve(SRC_DIR, '.umi') + '/' },
      // 包内源码用 ESM 标准 .js 后缀，vitest 跑测试时改写为 .ts
      // 锚定相对路径前缀，避免误伤第三方模块内部 `import './xxx.js'`
      { find: /^(\.{1,2}\/.+)\.js$/, replacement: '$1.ts' },
    ],
  },
  test: {
    globals: true,
    // 默认 happy-dom（轻量），用 .dom.test.tsx 命名的组件测试走 jsdom
    environmentMatchGlobs: [
      ['tests/**/*.{dom,component,jsx,tsx}.test.{ts,tsx}', 'jsdom'],
    ],
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    exclude: ['node_modules', 'dist', 'src/.umi', 'src/.umi-production'],
    setupFiles: ['./tests/setup.ts'],
  },
});
