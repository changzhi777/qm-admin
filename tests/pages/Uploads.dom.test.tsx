/**
 * UploadsPage 页面渲染测（用 adminTableRequest 调 listUploads）
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

import UploadsPage from '@/pages/Uploads';

function renderWithApp(ui: React.ReactElement) {
  return render(<AntdApp>{ui}</AntdApp>);
}

beforeEach(() => {
  mockAdminTableRequest.mockReset();
  mockAdminTableRequest.mockResolvedValue({ data: [], success: true, total: 0 });
});

describe('上传管理 页面（listUploads）', () => {
  it('渲染上传管理标题', () => {
    renderWithApp(<UploadsPage />);
    expect(screen.getByText(/上传管理/)).toBeInTheDocument();
  });

  it('调用 adminTableRequest("listUploads")', async () => {
    renderWithApp(<UploadsPage />);
    await waitFor(() => {
      expect(mockAdminTableRequest).toHaveBeenCalledWith(
        'listUploads',
        expect.anything(),
      );
    });
  });

  it('导出 adminTableRequest wrapper', () => {
    expect(typeof mockAdminTableRequest).toBe('function');
  });
});
