/**
 * ContentsPage 页面渲染测（ProTable / ModalForm 触发，简化）
 */
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
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

const mockAdminTableRequest = vi.fn();
vi.mock('@/services/api', () => ({
  adminTableRequest: (...args: unknown[]) => mockAdminTableRequest(...args),
}));

import ContentsPage from '@/pages/Contents';

function renderWithApp(ui: React.ReactElement) {
  return render(<AntdApp>{ui}</AntdApp>);
}

describe('内容管理 页面', () => {
  it('渲染内容管理标题', () => {
    renderWithApp(<ContentsPage />);
    expect(screen.getByText(/内容管理/)).toBeInTheDocument();
  });

  it('组件正常 render（无 crash）', () => {
    const { container } = renderWithApp(<ContentsPage />);
    expect(container).toBeInTheDocument();
  });
});
