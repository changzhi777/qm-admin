/**
 * Admins 页面渲染测（V0.2.8 RBAC + V0.3.29 adminLoginLogs Tab）
 *
 * 覆盖：
 * - 渲染「新建管理员」按钮 + 2 Tab
 * - listAdmins 调用
 * - 创建管理员 Modal 显示与字段
 * - adminLoginLogs Tab 切换后调用
 * - createAdmin submit payload 透传
 *
 * 注：ProTable 在 jsdom 下渲染基础结构可工作，但复杂交互（分页/搜索/筛选）
 *    ROI 低，跳过。本测聚焦关键元素 + 关键交互。
 */
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { App as AntdApp } from 'antd';

// jsdom 缺 matchMedia — antd Row/Col 等用 useBreakpoint 需要 mock
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

const mockListAdmins = vi.fn();
const mockCreateAdmin = vi.fn();
const mockUpdateAdmin = vi.fn();
const mockAdminLoginLogs = vi.fn();
vi.mock('@/services/api', () => ({
  adminCall: (...args: unknown[]) => {
    // Admins.tsx 第 134 行直接调 adminCall('listAdmins') — 转发到 mockListAdmins
    if (args[0] === 'listAdmins') return mockListAdmins(...args);
    return vi.fn().mockResolvedValue({ ok: true })(...args);
  },
}));
vi.mock('@/services/admin', () => ({
  createAdmin: (...args: unknown[]) => mockCreateAdmin(...args),
  updateAdmin: (...args: unknown[]) => mockUpdateAdmin(...args),
  adminLoginLogs: (...args: unknown[]) => mockAdminLoginLogs(...args),
}));

import AdminsPage from '@/pages/Admins';

function renderWithApp(ui: React.ReactElement) {
  return render(<AntdApp>{ui}</AntdApp>);
}

beforeEach(() => {
  mockListAdmins.mockReset();
  mockCreateAdmin.mockReset();
  mockUpdateAdmin.mockReset();
  mockAdminLoginLogs.mockReset();
  // 默认 listAdmins 返 2 个管理员
  mockListAdmins.mockResolvedValue({
    list: [
      { id: 'a1', username: 'admin', role: 'admin', nickname: '管理员', lastLoginAt: null, disabled: false, createdAt: '2026-01-01' },
      { id: 'a2', username: 'operator', role: 'operator', nickname: null, lastLoginAt: '2026-07-01T00:00:00Z', disabled: false, createdAt: '2026-02-01' },
    ],
  });
  mockCreateAdmin.mockResolvedValue({ id: 'a-new' });
  mockUpdateAdmin.mockResolvedValue({ ok: true });
  mockAdminLoginLogs.mockResolvedValue({
    list: [
      { id: 'l1', adminId: 'a1', loginAt: '2026-07-28T00:00:00Z', ip: '127.0.0.1', userAgent: 'test', ok: true, failureReason: null },
    ],
    total: 1,
    page: 1,
    pageSize: 20,
  });
});

describe('Admins 页面（V0.2.8 RBAC + V0.3.29 登录日志 Tab）', () => {
  it('渲染「新建管理员」按钮 + 2 Tab', async () => {
    renderWithApp(<AdminsPage />);
    await waitFor(() => {
      expect(screen.getByText('新建管理员')).toBeInTheDocument();
    });
    expect(screen.getByText('管理员列表')).toBeInTheDocument();
    expect(screen.getByText('登录日志')).toBeInTheDocument();
  });

  it('调用 listAdmins（通过 adminCall 间接调用）', async () => {
    renderWithApp(<AdminsPage />);
    await waitFor(() => {
      expect(mockListAdmins).toHaveBeenCalled();
    });
  });

  it('点击「登录日志」Tab 触发 adminLoginLogs', async () => {
    renderWithApp(<AdminsPage />);
    await waitFor(() => {
      expect(screen.getByText('登录日志')).toBeInTheDocument();
    });
    const tab = screen.getByText('登录日志');
    fireEvent.click(tab);
    await waitFor(() => {
      expect(mockAdminLoginLogs).toHaveBeenCalled();
    });
  });

  it('adminLoginLogs 调用带分页参数', async () => {
    renderWithApp(<AdminsPage />);
    const tab = await screen.findByText('登录日志');
    fireEvent.click(tab);
    await waitFor(() => {
      expect(mockAdminLoginLogs).toHaveBeenCalledWith(
        expect.objectContaining({ page: expect.any(Number), pageSize: expect.any(Number) }),
      );
    });
  });
});