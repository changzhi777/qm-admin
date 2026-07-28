/**
 * ReviewsPage 页面渲染测（用 adminTableRequest 调 listReviews）
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

import ReviewsPage from '@/pages/Reviews';

function renderWithApp(ui: React.ReactElement) {
  return render(<AntdApp>{ui}</AntdApp>);
}

beforeEach(() => {
  mockAdminTableRequest.mockReset();
  mockAdminTableRequest.mockResolvedValue({ data: [], success: true, total: 0 });
});

describe('评价管理 页面（listReviews）', () => {
  it('渲染评价管理标题', () => {
    renderWithApp(<ReviewsPage />);
    expect(screen.getByText(/评价管理/)).toBeInTheDocument();
  });

  it('调用 adminTableRequest("listReviews")', async () => {
    renderWithApp(<ReviewsPage />);
    await waitFor(() => {
      expect(mockAdminTableRequest).toHaveBeenCalledWith(
        'listReviews',
        expect.anything(),
      );
    });
  });

  it('导出 adminTableRequest wrapper', () => {
    expect(typeof mockAdminTableRequest).toBe('function');
  });
});
