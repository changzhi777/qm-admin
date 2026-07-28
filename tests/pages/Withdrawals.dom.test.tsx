/**
 * WithdrawalsPage 页面渲染测（简化）
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

import WithdrawalsPage from '@/pages/Withdrawals';

function renderWithApp(ui: React.ReactElement) {
  return render(<AntdApp>{ui}</AntdApp>);
}

describe('提现管理 页面', () => {
  it('渲染提现管理标题', () => {
    renderWithApp(<WithdrawalsPage />);
    expect(screen.getByText(/提现管理/)).toBeInTheDocument();
  });

  it('组件正常 render（无 crash）', () => {
    const { container } = renderWithApp(<WithdrawalsPage />);
    expect(container).toBeInTheDocument();
  });
});
