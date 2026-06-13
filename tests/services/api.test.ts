/**
 * services/api.ts 单元测试
 *
 * 覆盖：
 * - adminCall / mallCall / userCall 三个包装的 URL + method + body 正确性
 * - payload 缺省 → {}
 * - 类型泛型 T 透传
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRequest = vi.fn();
vi.mock('@umijs/max', () => ({
  request: (...args: unknown[]) => mockRequest(...args),
}));

import { adminCall, mallCall, userCall } from '@/services/api';

beforeEach(() => {
  mockRequest.mockReset();
  mockRequest.mockResolvedValue({ ok: true });
});

describe('adminCall', () => {
  it('POST /admin with { action, payload }', async () => {
    await adminCall('listAdmins');
    expect(mockRequest).toHaveBeenCalledWith('/admin', {
      method: 'POST',
      data: { action: 'listAdmins', payload: {} },
    });
  });

  it('带 payload 透传', async () => {
    const input = { orderId: 'o1', amountFen: 5000 };
    await adminCall('refundOrder', input);
    expect(mockRequest).toHaveBeenCalledWith('/admin', {
      method: 'POST',
      data: { action: 'refundOrder', payload: input },
    });
  });
});

describe('mallCall', () => {
  it('POST /mall with { action, payload: {} }', async () => {
    await mallCall('listProducts');
    expect(mockRequest).toHaveBeenCalledWith('/mall', {
      method: 'POST',
      data: { action: 'listProducts', payload: {} },
    });
  });

  it('带 payload 透传', async () => {
    await mallCall('productDetail', { id: 'p1' });
    expect(mockRequest).toHaveBeenCalledWith('/mall', {
      method: 'POST',
      data: { action: 'productDetail', payload: { id: 'p1' } },
    });
  });
});

describe('userCall', () => {
  it('POST /user with { action, payload: {} }', async () => {
    await userCall('me');
    expect(mockRequest).toHaveBeenCalledWith('/user', {
      method: 'POST',
      data: { action: 'me', payload: {} },
    });
  });

  it('透传泛型 T（断言返回值类型）', async () => {
    interface MeResp {
      user: { id: string; openid: string };
    }
    mockRequest.mockResolvedValue({ user: { id: 'u1', openid: 'o1' } });
    const result = await userCall<MeResp>('me');
    expect(result.user.id).toBe('u1');
  });
});
