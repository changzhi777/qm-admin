/**
 * 薄荷科学.AI 食物数据 API wrappers — V0.3.35
 *
 * 直接用 admin_token 调 /api/boohee（auth.ts 的 jwtVerify 不区分 token kind，
 * admin token payload {sub:adminId, kind:'admin'} 同样通过 boohee 路由的 req.user 检查）。
 *
 * 与 food.module 关系：互不干扰，food.module 保留为降级备选。
 * feature flag 'boohee' 关闭时服务端会抛 Errors.featureDisabled('boohee')，wrapper 直接透传。
 */
import { booheeCall } from './api';
import type {
  BooheeFoodItem,
  BooheeFoodDetail,
  BooheeBatchItem,
  BooheeRankingItem,
  SearchBooheeResp,
  RankingBooheeResp,
} from '@/types/boohee';

/** 2.1 食物搜索（keyword + 分页/排序）*/
export function searchBoohee(
  keyword: string,
  opts: { page?: number; perPage?: number; sort?: 'calorie_asc' | 'calorie_desc' } = {},
) {
  const { page = 1, perPage = 20, sort } = opts;
  return booheeCall<{ page: number; per_page: number; has_more: boolean; foods: BooheeFoodItem[] }>(
    'search',
    {
      keyword,
      page,
      per_page: perPage,
      sort,
    },
  ).then((resp) => ({
    list: resp.foods,
    hasMore: resp.has_more,
    page: resp.page,
    perPage: resp.per_page,
  }));
}

/** 2.2 食物详情（GI/GL/NRV/health_light 全营养结构）*/
export function getBooheeDetail(code: string) {
  return booheeCall<BooheeFoodDetail>('detail', { code });
}

/** 2.3 食物分类 */
export function getBooheeCategories() {
  return booheeCall<{ list: Array<{ id: number; name: string }> }>('categories');
}

/** 2.6 批量营养信息（codes 数组）*/
export function batchBooheeNutrition(codes: string[]) {
  return booheeCall<{ list: BooheeBatchItem[] }>('batchNutrition', { codes });
}

/** 2.7 食物排行榜 */
export function getBooheeRanking(opts: { type?: string; limit?: number } = {}) {
  const { type, limit = 10 } = opts;
  return booheeCall<unknown>('foodRanking', { type, limit }).then((resp: unknown) => {
    const r = resp as { list?: unknown[]; foods?: unknown[]; ranks?: unknown[]; data?: unknown };
    return { list: (r.list ?? r.foods ?? r.ranks ?? r.data ?? []) as BooheeRankingItem[] };
  });
}
