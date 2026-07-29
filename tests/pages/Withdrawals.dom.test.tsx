/**
 * WithdrawalsPage 页面渲染测（V0.3.34 A6 Excel）
 *
 * 覆盖：
 * - 渲染「提现管理」标题
 * - A6 导出本月结算单（CSV + Excel）两按钮存在
 */
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
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

const mockAdminTableRequest = vi.fn();
const mockExportSettlement = vi.fn();
const mockExportSettlementExcel = vi.fn();
vi.mock('@/services/api', () => ({
  adminTableRequest: (...args: unknown[]) => mockAdminTableRequest(...args),
  downloadAdminCsv: (...args: unknown[]) => mockExportSettlement(...args),
  downloadAdminExcel: (...args: unknown[]) => mockExportSettlementExcel(...args),
}));

import WithdrawalsPage from '@/pages/Withdrawals';

function renderWithApp(ui: React.ReactElement) {
  return render(<AntdApp>{ui}</AntdApp>);
}

describe('提现管理 页面', () => {
  it('渲染提现管理标题', () => {
    renderWithApp(<WithdrawalsPage />);
    expect(screen.getByText(/提现管理/)).toBeInTheDocument();
  });

  // ===== V0.3.34 A6：导出本月结算单（CSV + Excel）两按钮 =====
  it('A6：导出本月结算单 (CSV) 按钮存在', () => {
    renderWithApp(<WithdrawalsPage />);
    expect(screen.getByText(/导出本月结算单.*CSV/)).toBeInTheDocument();
  });

  it('A6：导出本月结算单 (Excel) 按钮存在', () => {
    renderWithApp(<WithdrawalsPage />);
    expect(screen.getByText(/导出本月结算单.*Excel/)).toBeInTheDocument();
  });
});
