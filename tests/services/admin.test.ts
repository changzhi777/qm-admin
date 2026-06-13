/**
 * services/admin.ts 单元测试
 *
 * 覆盖：所有 admin action 包装都正确调 adminCall
 * 复用 services/api.test 的 mock 模式
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockAdminCall = vi.fn();
vi.mock('@/services/api', () => ({
  adminCall: (...args: unknown[]) => mockAdminCall(...args),
}));

import {
  upsertProduct,
  upsertContent,
  listOrders,
  updateOrderStatus,
  listAdmins,
} from '@/services/admin';

beforeEach(() => {
  mockAdminCall.mockReset();
  mockAdminCall.mockResolvedValue({ ok: true });
});

describe('admin services 包装层', () => {
  it('upsertProduct → adminCall("upsertProduct", input)', async () => {
    const input = { name: 'p', category: 'c', price: 1 };
    await upsertProduct(input);
    expect(mockAdminCall).toHaveBeenCalledWith('upsertProduct', input);
  });

  it('upsertContent → adminCall("upsertContent", input)', async () => {
    const input = { type: 'race' as const, title: 't' };
    await upsertContent(input);
    expect(mockAdminCall).toHaveBeenCalledWith('upsertContent', input);
  });

  it('listOrders 缺省 → adminCall("listOrders", {})', async () => {
    await listOrders();
    expect(mockAdminCall).toHaveBeenCalledWith('listOrders', {});
  });

  it('listOrders 带 status 过滤', async () => {
    await listOrders({ status: 'paid', page: 1, pageSize: 20 });
    expect(mockAdminCall).toHaveBeenCalledWith('listOrders', {
      status: 'paid',
      page: 1,
      pageSize: 20,
    });
  });

  it('updateOrderStatus → adminCall("updateOrderStatus", req)', async () => {
    await updateOrderStatus({ orderId: 'o1', status: 'shipped' });
    expect(mockAdminCall).toHaveBeenCalledWith('updateOrderStatus', {
      orderId: 'o1',
      status: 'shipped',
    });
  });

  it('listAdmins → adminCall("listAdmins")', async () => {
    await listAdmins();
    expect(mockAdminCall).toHaveBeenCalledWith('listAdmins');
  });
});
