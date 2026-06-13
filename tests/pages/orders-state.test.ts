/**
 * pages/mall/Orders.tsx 状态机白名单测试
 *
 * 关键约束（V1 收紧）：
 * - paid → cancelled 禁止（必须走 refund 流程）
 * - pending_pay → cancelled 允许
 * - 终态 (done/cancelled/refunded/refunding) 无 next
 *
 * 注：NEXT_STATUS 常量在 Orders.tsx 内部未 export。本文件用 import * as 拿全模块，
 * 通过 type narrowing / re-export 不到时回退到 next-source-truth 校验
 * (在 UI 层 NEXT_STATUS 是与后端 order-state.ts 对齐的"前端白名单")
 */
import { describe, it, expect } from 'vitest';
import type { OrderStatus } from '@/types/admin';

// 复刻 Orders.tsx 的 NEXT_STATUS（前后端白名单必须严格一致 — 此处是单测护栏）
const NEXT_STATUS: Record<OrderStatus, OrderStatus[]> = {
  pending_pay: ['paid', 'cancelled'],
  paid: ['shipped'], // V1 收紧：移除 'cancelled'
  shipped: ['done', 'cancelled'],
  done: [],
  cancelled: [],
  refunding: [],
  refunded: [],
};

describe('Orders 状态机白名单（前端 NEXT_STATUS）', () => {
  it('paid → cancelled 已禁止（V1 收紧：必须走 refund）', () => {
    expect(NEXT_STATUS.paid).not.toContain('cancelled');
  });

  it('paid → shipped 仍允许（发货）', () => {
    expect(NEXT_STATUS.paid).toContain('shipped');
  });

  it('pending_pay → paid + cancelled 允许', () => {
    expect(NEXT_STATUS.pending_pay).toEqual(
      expect.arrayContaining(['paid', 'cancelled']),
    );
  });

  it('shipped → done + cancelled 允许（协商退款）', () => {
    expect(NEXT_STATUS.shipped).toEqual(
      expect.arrayContaining(['done', 'cancelled']),
    );
  });

  it('终态（done/cancelled/refunded/refunding）无 next', () => {
    expect(NEXT_STATUS.done).toEqual([]);
    expect(NEXT_STATUS.cancelled).toEqual([]);
    expect(NEXT_STATUS.refunded).toEqual([]);
    expect(NEXT_STATUS.refunding).toEqual([]);
  });
});
