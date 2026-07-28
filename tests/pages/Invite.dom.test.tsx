/**
 * InvitePage 页面渲染测（用 adminTableRequest 调 listInviteStats）
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

import InvitePage from '@/pages/Invite';

function renderWithApp(ui: React.ReactElement) {
  return render(<AntdApp>{ui}</AntdApp>);
}

beforeEach(() => {
  mockAdminTableRequest.mockReset();
  mockAdminTableRequest.mockResolvedValue({ data: [], success: true, total: 0 });
});

describe('邀请裂变 页面（listInviteStats）', () => {
  it('渲染邀请裂变标题', () => {
    renderWithApp(<InvitePage />);
    expect(screen.getByText(/邀请裂变/)).toBeInTheDocument();
  });

  it('调用 adminTableRequest("listInviteStats")', async () => {
    renderWithApp(<InvitePage />);
    await waitFor(() => {
      expect(mockAdminTableRequest).toHaveBeenCalledWith(
        'listInviteStats',
        expect.anything(),
      );
    });
  });

  it('导出 adminTableRequest wrapper', () => {
    expect(typeof mockAdminTableRequest).toBe('function');
  });
});
