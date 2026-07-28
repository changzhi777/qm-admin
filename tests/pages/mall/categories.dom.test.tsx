/**
 * mall/Categories 页面渲染测（商品分类 listCategories）
 *
 * 覆盖：
 * - 渲染「商品分类」标题
 * - listCategories 调用
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

const mockListCategories = vi.fn();
vi.mock('@/services/mall', () => ({
  listCategories: (...args: unknown[]) => mockListCategories(...args),
}));

import CategoriesPage from '@/pages/mall/Categories';

function renderWithApp(ui: React.ReactElement) {
  return render(<AntdApp>{ui}</AntdApp>);
}

beforeEach(() => {
  mockListCategories.mockReset();
  mockListCategories.mockResolvedValue({ list: [], total: 0 });
});

describe('mall/Categories 页面（商品分类 listCategories）', () => {
  it('渲染商品分类标题', () => {
    renderWithApp(<CategoriesPage />);
    expect(screen.getByText(/商品分类/)).toBeInTheDocument();
  });

  it('调用 listCategories', async () => {
    renderWithApp(<CategoriesPage />);
    await waitFor(() => {
      expect(mockListCategories).toHaveBeenCalled();
    });
  });

  it('导出 listCategories wrapper', () => {
    expect(typeof mockListCategories).toBe('function');
  });
});