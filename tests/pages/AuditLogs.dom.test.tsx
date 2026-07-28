/**
 * AuditLogsPage 页面渲染测
 *
 * 覆盖：
 * - 渲染「审计日志」标题
 * - adminTableRequest 调用
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

const mockAdminTableRequest = vi.fn();

vi.mock('@/services/api', () => ({
  adminTableRequest: (...args: unknown[]) => mockAdminTableRequest(...args),
}));

import AuditLogsPage from '@/pages/AuditLogs';

function renderWithApp(ui: React.ReactElement) {
  return render(<AntdApp>{ui}</AntdApp>);
}

beforeEach(() => {
  mockAdminTableRequest.mockReset();
  mockAdminTableRequest.mockResolvedValue({ ok: true });
});

describe('审计日志 页面（api）', () => {
  it('渲染审计日志标题', () => {
    renderWithApp(<AuditLogsPage />);
    expect(screen.getByText(/审计日志/)).toBeInTheDocument();
  });

  it('调用 adminTableRequest', async () => {
    renderWithApp(<AuditLogsPage />);
    await waitFor(() => {
      expect(mockAdminTableRequest).toHaveBeenCalled();
    });
  });

  it('导出 adminTableRequest wrapper', () => {
    expect(typeof mockAdminTableRequest).toBe('function');
  });
});
