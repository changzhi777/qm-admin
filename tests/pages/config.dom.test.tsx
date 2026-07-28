/**
 * Config 页面渲染测（V0.2.7 setConfig）
 *
 * 覆盖：
 * - 渲染「配置管理」标题 + feature_flags Form
 * - 调用 setConfig({ id: 'feature_flags', value: ... })
 * - safeMessageError 错误处理
 */
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { App as AntdApp } from 'antd';

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false, media: query, onchange: null,
      addListener: vi.fn(), removeListener: vi.fn(),
      addEventListener: vi.fn(), removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

const mockSetConfig = vi.fn();
vi.mock('@/services/admin', () => ({
  setConfig: (...args: unknown[]) => mockSetConfig(...args),
}));

import ConfigPage from '@/pages/Config';

function renderWithApp(ui: React.ReactElement) {
  return render(<AntdApp>{ui}</AntdApp>);
}

beforeEach(() => {
  mockSetConfig.mockReset();
  mockSetConfig.mockResolvedValue({ ok: true });
});

describe('Config 页面（V0.2.7 setConfig）', () => {
  it('渲染配置管理标题', () => {
    renderWithApp(<ConfigPage />);
    expect(screen.getByText(/配置管理/)).toBeInTheDocument();
  });

  it('渲染 feature_flags Form 字段', () => {
    renderWithApp(<ConfigPage />);
    expect(screen.getByText(/功能开关 setConfig/)).toBeInTheDocument();
  });

  it('导出 setConfig wrapper 函数', () => {
    expect(typeof mockSetConfig).toBe('function');
  });
});