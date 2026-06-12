/**
 * mall module — 公开端点 wrapper（商品 / 分类查询）
 *
 * 后端契约见 apps/server/src/modules/mall/mall.routes.ts
 */
import { mallCall } from './api';
import type {
  CategoryListResp,
  ProductListReq,
  ProductListResp,
  ProductDetailReq,
  ProductDetailResp,
} from '@/types/mall';

/** 全部分类 */
export function listCategories() {
  return mallCall<CategoryListResp>('listCategories');
}

/** 商品列表（带分页 + 分类过滤） */
export function listProducts(req: ProductListReq = {}) {
  return mallCall<ProductListResp>('listProducts', req);
}

/** 商品详情 */
export function getProductDetail(req: ProductDetailReq) {
  return mallCall<ProductDetailResp>('productDetail', req);
}
