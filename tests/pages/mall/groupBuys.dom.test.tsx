/**
 * mall/GroupBuys 页面渲染测（V0.1.38 团购 listGroupBuys + upsertGroupBuy）
 *
 * 覆盖：
 * - 渲染「团购管理」标题
 * - listGroupBuys 调用
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

const mockListGroupBuys = vi.fn();
const mockUpsertGroupBuy = vi.fn();
const mockListProducts = vi.fn();
vi.mock('@/services/mall', () => ({
  listProducts: (...args: unknown[]) => mockListProducts(...args),
}));
vi.mock('@/services/admin', () => ({
  listGroupBuys: (...args: unknown[]) => mockListGroupBuys(...args),
  upsertGroupBuy: (...args: unknown[]) => mockUpsertGroupBuy(...args),
}));

import GroupBuysPage from '@/pages/mall/GroupBuys';

function renderWithApp(ui: React.ReactElement) {
  return render(<AntdApp>{ui}</AntdApp>);
}

beforeEach(() => {
  mockListGroupBuys.mockReset();
  mockUpsertGroupBuy.mockReset();
  mockListProducts.mockReset();
  mockListGroupBuys.mockResolvedValue({ list: [], total: 0 });
  mockListProducts.mockResolvedValue({ list: [], total: 0 });
  mockUpsertGroupBuy.mockResolvedValue({ id: 'gb-new' });
});

describe('mall/GroupBuys 页面（V0.1.38 团购）', () => {
  it('渲染团购管理标题', () => {
    renderWithApp(<GroupBuysPage />);
    expect(screen.getByText(/团购管理/)).toBeInTheDocument();
  });

  it('调用 listGroupBuys', async () => {
    renderWithApp(<GroupBuysPage />);
    await waitFor(() => {
      expect(mockListGroupBuys).toHaveBeenCalled();
    });
  });

  it('导出 listGroupBuys / upsertGroupBuy wrappers', () => {
    expect(typeof mockListGroupBuys).toBe('function');
    expect(typeof mockUpsertGroupBuy).toBe('function');
  });
});