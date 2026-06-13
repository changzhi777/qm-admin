/**
 * qm-admin vitest 配置
 *
 * 关注：
 * - happy-dom env（轻量 DOM 模拟，替代 jsdom 提速 30%）
 * - alias 与 tsconfig.json paths 对齐（@/* → src/*，@@/* → src/.umi/*）
 * - 排除 Umi Max 自身 .umi 生成代码（避免误入测试集）
 *
 * 暂不引 @testing-library/react：先做高 ROI 纯逻辑 / 包装层测试
 * UI 组件测试等需要时再加（避免早期过度基建）
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
    environment: 'happy-dom',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    exclude: ['node_modules', 'dist', 'src/.umi', 'src/.umi-production'],
  },
});
