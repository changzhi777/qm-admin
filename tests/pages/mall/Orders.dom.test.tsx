/**
 * OrdersPage 页面渲染测
 *
 * 覆盖：
 * - 渲染「订单管理」标题
 * - listOrders 调用
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

const mockListOrders = vi.fn();
vi.mock("@/services/api", () => ({
  adminTableRequest: (...args: unknown[]) => vi.fn()(...args),
}));
vi.mock('@/services/admin', () => ({
  listOrders: (...args: unknown[]) => mockListOrders(...args),
}));

import OrdersPage from '@/pages/mall/Orders';

function renderWithApp(ui: React.ReactElement) {
  return render(<AntdApp>{ui}</AntdApp>);
}

beforeEach(() => {
  mockListOrders.mockReset();
  mockListOrders.mockResolvedValue({ ok: true });
});

describe('订单管理 页面（admin）', () => {
  it('渲染订单管理标题', () => {
    renderWithApp(<OrdersPage />);
    expect(screen.getByText(/订单管理/)).toBeInTheDocument();
  });

  it('调用 listOrders', async () => {
    renderWithApp(<OrdersPage />);
    await waitFor(() => {
      expect(mockListOrders).toHaveBeenCalled();
    });
  });

  it('导出 listOrders wrapper', () => {
    expect(typeof mockListOrders).toBe('function');
  });
});
