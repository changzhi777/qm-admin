/**
 * Interpret 页面渲染测（V0.2.37 AI 资料解读 listInterpret）
 *
 * 覆盖：
 * - 渲染「解读管理」标题
 * - adminTableRequest('listInterpret') 调用
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

const mockAdminTableRequest = vi.fn();
vi.mock('@/services/api', () => ({
  adminTableRequest: (...args: unknown[]) => mockAdminTableRequest(...args),
}));

import InterpretPage from '@/pages/Interpret';

function renderWithApp(ui: React.ReactElement) {
  return render(<AntdApp>{ui}</AntdApp>);
}

beforeEach(() => {
  mockAdminTableRequest.mockReset();
  mockAdminTableRequest.mockResolvedValue({ data: [], success: true, total: 0 });
});

describe('Interpret 页面（V0.2.37 listInterpret）', () => {
  it('渲染解读管理标题', () => {
    renderWithApp(<InterpretPage />);
    expect(screen.getByText(/解读管理/)).toBeInTheDocument();
  });

  it('调用 adminTableRequest("listInterpret")', async () => {
    renderWithApp(<InterpretPage />);
    await waitFor(() => {
      expect(mockAdminTableRequest).toHaveBeenCalledWith(
        'listInterpret',
        expect.anything(),
      );
    });
  });

  it('导出 adminTableRequest mock', () => {
    expect(typeof mockAdminTableRequest).toBe('function');
  });
});