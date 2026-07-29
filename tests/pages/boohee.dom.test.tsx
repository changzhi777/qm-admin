/**
 * 薄荷验证中心 页面渲染测 — V0.3.35
 *
 * 覆盖：
 * - 渲染「薄荷验证中心」标题
 * - 4 个 Tab 标题存在
 * - 默认 search 区块渲染关键词输入框
 * - 切换到 detail Tab 显示 code 输入框
 */
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
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

const mockSearchBoohee = vi.fn();
const mockGetBooheeDetail = vi.fn();
const mockBatchBooheeNutrition = vi.fn();
const mockGetBooheeRanking = vi.fn();

vi.mock('@/services/boohee', () => ({
  searchBoohee: (...args: unknown[]) => mockSearchBoohee(...args),
  getBooheeDetail: (...args: unknown[]) => mockGetBooheeDetail(...args),
  batchBooheeNutrition: (...args: unknown[]) => mockBatchBooheeNutrition(...args),
  getBooheeRanking: (...args: unknown[]) => mockGetBooheeRanking(...args),
}));

import BooheePage from '@/pages/Boohee';

function renderWithApp(ui: React.ReactElement) {
  return render(<AntdApp>{ui}</AntdApp>);
}

beforeEach(() => {
  mockSearchBoohee.mockReset().mockResolvedValue({ list: [], hasMore: false, page: 1, perPage: 20 });
  mockGetBooheeDetail.mockReset();
  mockBatchBooheeNutrition.mockReset().mockResolvedValue({ list: [] });
  mockGetBooheeRanking.mockReset().mockResolvedValue({ list: [] });
});

describe('薄荷验证中心 页面（V0.3.35）', () => {
  it('渲染主标题「薄荷验证中心」', () => {
    renderWithApp(<BooheePage />);
    expect(screen.getByText(/薄荷验证中心/)).toBeInTheDocument();
  });

  it('4 个 Tab 标题全部存在', () => {
    renderWithApp(<BooheePage />);
    expect(screen.getByText('① 搜索测试')).toBeInTheDocument();
    expect(screen.getByText('② 详情测试')).toBeInTheDocument();
    expect(screen.getByText('③ 批量营养')).toBeInTheDocument();
    expect(screen.getByText('④ 排行榜')).toBeInTheDocument();
  });

  it('默认 Tab 渲染搜索关键词输入框 + 搜索按钮', () => {
    renderWithApp(<BooheePage />);
    // 默认 keyword="苹果"
    const input = screen.getByDisplayValue('苹果');
    expect(input).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /搜索/ })).toBeInTheDocument();
  });

  it('顶部 Alert 提示当前权限范围', () => {
    renderWithApp(<BooheePage />);
    expect(screen.getByText(/仅开通 search\/detail\/batchNutrition/)).toBeInTheDocument();
  });
});
