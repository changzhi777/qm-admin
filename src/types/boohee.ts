/**
 * 薄荷科学.AI 食物数据 API 类型 — V0.3.35 对接
 *
 * 数据源：apps/server/src/modules/boohee/boohee.client.ts
 * 调用：src/services/boohee.ts
 * 后端 envelope: { code: 0, message, data }，adminCall 拦截器已解包 → 直接拿 data
 *
 * 关键营养维度（比 FatSecret 强）：
 * - GI（血糖生成指数，0-100）
 * - GL（血糖负荷 = GI × 碳水 / 100）
 * - NRV（营养素参考值 %）
 * - health_light（健康红绿灯 0 无/1 绿/2 黄/3 红）
 */

/** 食物单位（克数换算，search with_units=true / detail）*/
export interface BooheeFoodUnit {
  unit_id: number;
  unit_name: string;
  weight: string;
  eat_weight: string;
}

/** 食物搜索结果项（2.1 /v1/food/search）*/
export interface BooheeFoodItem {
  code: string;
  name: string;
  calories: number; // kcal/100g
  protein: number; // g/100g
  fat: number;
  carbohydrate: number;
  health_light: number;
  is_liquid: boolean;
  image_url: string;
  units?: BooheeFoodUnit[];
}

/** 食物搜索响应（envelope.data）*/
export interface BooheeSearchData {
  page: number;
  per_page: number;
  has_more: boolean;
  foods: BooheeFoodItem[];
}

/** 基础营养字段（详情接口含单位/单位名/NRV）*/
export interface BooheeNutrient {
  name: string;
  value: number;
  unit: string;
  unit_name: string;
  nrv: number;
}

/** GI/GL 营养（带 level 等级）*/
export interface BooheeGiNutrient extends BooheeNutrient {
  level: number;
}

/** 食物详情（2.2 /v1/food/detail）*/
export interface BooheeFoodDetail {
  code: string;
  name: string;
  health_light: number;
  image_url: string;
  food_weight_url?: string;
  is_liquid: boolean;
  food_type: string;
  calories: BooheeNutrient;
  protein: BooheeNutrient;
  fat: BooheeNutrient;
  carbohydrate: BooheeNutrient;
  gi?: BooheeGiNutrient;
  gl?: BooheeGiNutrient;
  ingredients: string[];
  units: BooheeFoodUnit[] | null;
  materials: unknown;
}

/** 食物分类（2.3 /v1/food/categories）*/
export interface BooheeCategory {
  id: number;
  name: string;
  [k: string]: unknown;
}

/** 批量营养（2.6 /v1/food/ingredients，codes → items 数组）*/
export interface BooheeBatchItem {
  code: string;
  name?: string;
  calories?: number;
  protein?: number;
  fat?: number;
  carbohydrate?: number;
  health_light?: number;
  [k: string]: unknown;
}

/** 食物排行榜项（2.7 /v1/food/ranks）*/
export interface BooheeRankingItem {
  code?: string;
  name: string;
  calories?: number;
  rank?: number;
  [k: string]: unknown;
}

/** search wrapper 返参 */
export interface SearchBooheeResp {
  list: BooheeFoodItem[];
  hasMore: boolean;
  page: number;
  perPage: number;
}

/** 排行榜 wrapper 返参 */
export interface RankingBooheeResp {
  list: BooheeRankingItem[];
}
