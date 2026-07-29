/**
 * services/boohee.ts 单元测试 — V0.3.35
 *
 * 覆盖：
 * - 4 个 wrapper 都正确调用 /admin endpoint
 * - search 透传 keyword/page/per_page/sort
 * - detail 透传 code
 * - batchNutrition 透传 codes 数组
 * - foodRanking 透传 type/limit
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRequest = vi.fn();
vi.mock('@umijs/max', () => ({
  request: (...args: unknown[]) => mockRequest(...args),
}));

import {
  searchBoohee,
  getBooheeDetail,
  batchBooheeNutrition,
  getBooheeRanking,
} from '@/services/boohee';

beforeEach(() => {
  mockRequest.mockReset();
});

describe('searchBoohee', () => {
  it('默认 page=1, perPage=20', async () => {
    mockRequest.mockResolvedValue({ list: [], hasMore: false, page: 1, perPage: 20 });
    await searchBoohee('苹果');
    expect(mockRequest).toHaveBeenCalledWith('/admin', {
      method: 'POST',
      data: {
        action: 'search',
        payload: { keyword: '苹果', page: 1, per_page: 20, sort: undefined },
      },
    });
  });

  it('透传 sort', async () => {
    mockRequest.mockResolvedValue({ list: [], hasMore: false, page: 1, perPage: 20 });
    await searchBoohee('米饭', { sort: 'calorie_asc' });
    expect(mockRequest).toHaveBeenCalledWith('/admin', {
      method: 'POST',
      data: {
        action: 'search',
        payload: { keyword: '米饭', page: 1, per_page: 20, sort: 'calorie_asc' },
      },
    });
  });
});

describe('getBooheeDetail', () => {
  it('透传 code', async () => {
    mockRequest.mockResolvedValue({ code: 'apple001', name: '苹果' });
    await getBooheeDetail('apple001');
    expect(mockRequest).toHaveBeenCalledWith('/admin', {
      method: 'POST',
      data: { action: 'detail', payload: { code: 'apple001' } },
    });
  });
});

describe('batchBooheeNutrition', () => {
  it('透传 codes 数组', async () => {
    mockRequest.mockResolvedValue({ list: [] });
    await batchBooheeNutrition(['c1', 'c2', 'c3']);
    expect(mockRequest).toHaveBeenCalledWith('/admin', {
      method: 'POST',
      data: { action: 'batchNutrition', payload: { codes: ['c1', 'c2', 'c3'] } },
    });
  });
});

describe('getBooheeRanking', () => {
  it('默认 limit=10', async () => {
    mockRequest.mockResolvedValue({ list: [] });
    await getBooheeRanking();
    expect(mockRequest).toHaveBeenCalledWith('/admin', {
      method: 'POST',
      data: { action: 'foodRanking', payload: { type: undefined, limit: 10 } },
    });
  });

  it('透传 type + limit', async () => {
    mockRequest.mockResolvedValue({ list: [] });
    await getBooheeRanking({ type: 'calorie_low', limit: 20 });
    expect(mockRequest).toHaveBeenCalledWith('/admin', {
      method: 'POST',
      data: { action: 'foodRanking', payload: { type: 'calorie_low', limit: 20 } },
    });
  });
});
