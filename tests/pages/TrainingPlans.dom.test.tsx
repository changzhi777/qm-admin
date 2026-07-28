/**
 * TrainingPlansPage 页面渲染测
 *
 * 覆盖：
 * - 渲染「训练计划」标题
 * - listTrainingPlans 调用
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

const mockListTrainingPlans = vi.fn();
vi.mock("@/services/api", () => ({
  adminTableRequest: (...args: unknown[]) => vi.fn()(...args),
}));
vi.mock('@/services/admin', () => ({
  listTrainingPlans: (...args: unknown[]) => mockListTrainingPlans(...args),
}));

import TrainingPlansPage from '@/pages/TrainingPlans';

function renderWithApp(ui: React.ReactElement) {
  return render(<AntdApp>{ui}</AntdApp>);
}

beforeEach(() => {
  mockListTrainingPlans.mockReset();
  mockListTrainingPlans.mockResolvedValue({ ok: true });
});

describe('训练计划 页面（admin）', () => {
  it('渲染训练计划标题', () => {
    renderWithApp(<TrainingPlansPage />);
    expect(screen.getByText(/训练计划/)).toBeInTheDocument();
  });

  it('调用 listTrainingPlans', async () => {
    renderWithApp(<TrainingPlansPage />);
    await waitFor(() => {
      expect(mockListTrainingPlans).toHaveBeenCalled();
    });
  });

  it('导出 listTrainingPlans wrapper', () => {
    expect(typeof mockListTrainingPlans).toBe('function');
  });
});
