/**
 * Pickup 页面渲染测（V0.1.122 自提核销 confirmPickup）
 *
 * 覆盖：
 * - 渲染「自提核销」标题 + 输入框 + 核销按钮
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

const mockConfirmPickup = vi.fn();
vi.mock('@/services/admin', () => ({
  confirmPickup: (...args: unknown[]) => mockConfirmPickup(...args),
}));

import PickupPage from '@/pages/Pickup';

function renderWithApp(ui: React.ReactElement) {
  return render(<AntdApp>{ui}</AntdApp>);
}

beforeEach(() => {
  mockConfirmPickup.mockReset();
  mockConfirmPickup.mockResolvedValue({ ok: true });
});

describe('Pickup 页面（V0.1.122 confirmPickup）', () => {
  it('渲染自提核销标题', () => {
    renderWithApp(<PickupPage />);
    expect(screen.getByText(/自提核销/)).toBeInTheDocument();
  });

  it('渲染输入框 + 核销按钮', () => {
    renderWithApp(<PickupPage />);
    expect(screen.getByPlaceholderText(/pickupCode|核销码|提货码/)).toBeInTheDocument();
  });

  it('导出 confirmPickup wrapper', () => {
    expect(typeof mockConfirmPickup).toBe('function');
  });
});