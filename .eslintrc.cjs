/**
 * ESLint 配置 — V0.3.29 GAP-E 接入
 *
 * 范围：
 * - TypeScript（@typescript-eslint）
 * - React 17+（eslint-plugin-react + hooks）
 * - 关闭与 Prettier 冲突的规则（eslint-config-prettier）
 *
 * 注：Umi Max / antd / @ant-design/pro-components 的 hook 用法可能触发
 *    react-hooks/exhaustive-deps warning，按 page 单独 disable 或 .eslintignore
 */
module.exports = {
  root: true,
  env: { browser: true, node: true, es2022: true },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
    // 解析 .tsx 与 .ts
  },
  settings: {
    react: { version: 'detect' },
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    // 必须放最后，覆盖冲突规则
    'prettier',
  ],
  rules: {
    // React 17+ 不需要 import React
    'react/react-in-jsx-scope': 'off',
    // 未使用变量 — TS 用 @typescript-eslint/no-unused-vars 替代
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    // any 谨慎使用（app.tsx 4 处 as any 已识别）
    '@typescript-eslint/no-explicit-any': 'off',
    // Umi Max 配置 .umi 运行时勿 lint
    // 关闭 — react-hooks/exhaustive-deps 太严（Umi 配置项 useModel 误报）
    'react-hooks/exhaustive-deps': 'off',
  },
  overrides: [
    {
      // 测试文件宽松
      files: ['tests/**/*.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'react/react-in-jsx-scope': 'off',
        'no-empty': 'off',
      },
    },
    {
      // .umi 运行时跳过
      files: ['src/.umi/**', 'src/.umi-production/**'],
      extends: [],
    },
  ],
  ignorePatterns: [
    'node_modules',
    'dist',
    'src/.umi',
    'src/.umi-production',
    '*.config.{js,ts}',
    'coverage',
    '.zcf/plan',
    '.gitea',
    '*.d.ts',
  ],
};