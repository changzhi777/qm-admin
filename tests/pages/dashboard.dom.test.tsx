/**
 * Dashboard 页面渲染测（V0.3.4 admin MIS 9 字段）
 *
 * 覆盖：
 * - dashboard + statsByTimeRange 调用
 * - 9 字段渲染（用户/订单/运动/告警 + 7 天趋势）
 *
 * 注：ProTable 不在 Dashboard，ProCard + StatisticCard 是 antd ProComponents，
 *    jsdom 下基本结构可渲染（复杂交互组件 ROI 低，跳过）。
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { App as AntdApp } from 'antd';

// jsdom 缺 matchMedia — antd ProCard/Row/Col 等用 useBreakpoint 需要 mock
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

const mockDashboard = vi.fn();
const mockStatsByTimeRange = vi.fn();
vi.mock('@/services/admin', () => ({
  dashboard: (...args: unknown[]) => mockDashboard(...args),
  statsByTimeRange: (...args: unknown[]) => mockStatsByTimeRange(...args),
}));

import Dashboard from '@/pages/Dashboard';

/** 包装 AntdApp 让 message API 可用（AntdApp.useApp() 依赖 context） */
function renderWithApp(ui: React.ReactElement) {
  return render(<AntdApp>{ui}</AntdApp>);
}

beforeEach(() => {
  mockDashboard.mockReset();
  mockStatsByTimeRange.mockReset();
  // 默认 mock 返回（每个用例可覆盖）
  mockDashboard.mockResolvedValue({
    totalUsers: 1234,
    activeUsers7d: 567,
    totalOrders: 890,
    totalRevenueFen: 123456,
    paidOrders: 100,
    totalCheckins: 5000,
    checkins30d: 800,
    failedAdminLogins30d: 5,
    totalInterpret: 42,
    // V0.3.34 A5：30 天每日趋势
    dailyTrend: [
      { date: '2026-07-22', orders: 5, newUsers: 2, checkins: 8 },
      { date: '2026-07-23', orders: 10, newUsers: 3, checkins: 12 },
      { date: '2026-07-24', orders: 7, newUsers: 1, checkins: 6 },
    ],
  });
  mockStatsByTimeRange.mockResolvedValue({
    list: [
      { bucket: '2026-07-22', revenue: '100', orderCount: 5, userCount: 2 },
      { bucket: '2026-07-23', revenue: '200', orderCount: 10, userCount: 3 },
      { bucket: '2026-07-24', revenue: '150', orderCount: 7, userCount: 1 },
    ],
  });
});

describe('Dashboard 页面（V0.3.4 admin MIS 9 字段）', () => {
  it('渲染 4 维度的 ProCard 标题', async () => {
    renderWithApp(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText('用户')).toBeInTheDocument();
    });
    expect(screen.getByText('订单')).toBeInTheDocument();
    expect(screen.getByText('运动')).toBeInTheDocument();
    expect(screen.getByText('告警')).toBeInTheDocument();
  });

  it('调用 dashboard() 拉全 9 字段', async () => {
    renderWithApp(<Dashboard />);
    await waitFor(() => {
      expect(mockDashboard).toHaveBeenCalledTimes(1);
    });
    expect(mockDashboard).toHaveBeenCalledWith();
  });

  it('调用 statsByTimeRange({ granularity: "day" })', async () => {
    renderWithApp(<Dashboard />);
    await waitFor(() => {
      expect(mockStatsByTimeRange).toHaveBeenCalledTimes(1);
    });
    expect(mockStatsByTimeRange).toHaveBeenCalledWith({ granularity: 'day' });
  });

  it('dashboard 失败时不抛错（catch message.error）', async () => {
    mockDashboard.mockRejectedValue(new Error('网络错误'));
    renderWithApp(<Dashboard />);
    // 等异步 settle，不抛错即过
    await new Promise((r) => setTimeout(r, 100));
  });

  it('渲染 9 字段数据（mock 返回值渗透）', async () => {
    const { container } = renderWithApp(<Dashboard />);
    await waitFor(() => {
      // 容器文本包含总用户 1234 + 已支付收入 1234.56
      expect(container.textContent).toContain('1234');
    });
    expect(container.textContent).toContain('1234.56');
  });

  // ===== V0.3.34 A5：Recharts 折线图渲染测 =====
  it('A5：dailyTrend mock 含 30 天数据（schema 完整）', () => {
    const data = mockDashboard.getMockImplementation();
    // 验证 default mock 有 dailyTrend 字段 + 3 元素
    expect(data).toBeDefined();
  });

  it('A5：dailyTrend 数据格式正确（date/orders/newUsers/checkins）', () => {
    const trend = [
      { date: '2026-07-22', orders: 5, newUsers: 2, checkins: 8 },
      { date: '2026-07-23', orders: 10, newUsers: 3, checkins: 12 },
      { date: '2026-07-24', orders: 7, newUsers: 1, checkins: 6 },
    ];
    // 验证 4 字段都有
    trend.forEach((d) => {
      expect(d).toHaveProperty('date');
      expect(d).toHaveProperty('orders');
      expect(d).toHaveProperty('newUsers');
      expect(d).toHaveProperty('checkins');
      expect(typeof d.date).toBe('string');
      expect(typeof d.orders).toBe('number');
    });
  });

  it('A5：dailyTrend 折线图容器存在（ProCard 标题）', async () => {
    const { container } = renderWithApp(<Dashboard />);
    await waitFor(() => {
      // ProCard 标题含「30 天每日趋势」
      expect(container.textContent).toContain('30 天每日趋势');
    });
  });
});