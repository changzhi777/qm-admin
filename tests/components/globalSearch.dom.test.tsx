/**
 * GlobalSearch 组件渲染测（V0.3.5 admin.globalSearch）
 *
 * 覆盖：
 * - 渲染 AutoComplete + 占位符（antd Select 的 placeholder 是单独的 span，不是 input 属性）
 * - 输入触发 globalSearch + debounce 300ms
 * - 空白输入不触发 globalSearch
 * - globalSearch 失败时容错
 *
 * 注：antd AutoComplete 内部 input 没 placeholder 属性（占位符在 .ant-select-selection-placeholder span）
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';

const mockGlobalSearch = vi.fn();
vi.mock('@/services/admin', () => ({
  globalSearch: (...args: unknown[]) => mockGlobalSearch(...args),
}));

import GlobalSearch from '@/components/GlobalSearch';

beforeEach(() => {
  mockGlobalSearch.mockReset();
});

describe('GlobalSearch 组件（V0.3.5 admin.globalSearch）', () => {
  it('渲染 AutoComplete + 占位符（span 形式）', () => {
    const { container } = render(<GlobalSearch />);
    const placeholder = container.querySelector('.ant-select-selection-placeholder');
    expect(placeholder).toBeInTheDocument();
    expect(placeholder?.textContent).toBe('全局搜索（用户/动态/评论/解读/力量）');
  });

  it('输入非空触发 globalSearch（debounce 300ms）', async () => {
    mockGlobalSearch.mockResolvedValue({ results: [] });
    const { container } = render(<GlobalSearch />);
    const input = container.querySelector('.ant-select-selection-search-input') as HTMLInputElement;
    expect(input).toBeTruthy();
    fireEvent.change(input, { target: { value: 'test-user' } });
    await waitFor(
      () => {
        expect(mockGlobalSearch).toHaveBeenCalledWith({ query: 'test-user', limit: 5 });
      },
      { timeout: 500 },
    );
  });

  it('空白输入不触发 globalSearch', async () => {
    const { container } = render(<GlobalSearch />);
    const input = container.querySelector('.ant-select-selection-search-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '   ' } });
    await new Promise((r) => setTimeout(r, 350));
    expect(mockGlobalSearch).not.toHaveBeenCalled();
  });

  it('globalSearch 失败时容错（不抛错）', async () => {
    mockGlobalSearch.mockRejectedValue(new Error('网络错误'));
    const { container } = render(<GlobalSearch />);
    const input = container.querySelector('.ant-select-selection-search-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'test' } });
    await waitFor(
      () => {
        expect(mockGlobalSearch).toHaveBeenCalled();
      },
      { timeout: 500 },
    );
    // catch 内 setOptions([]) — 组件不抛错即过
  });
});