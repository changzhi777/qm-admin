/**
 * admin module — 各 action 的强类型 wrapper
 *
 * 后端契约见 apps/server/src/modules/admin/admin.routes.ts
 */
import { adminCall } from './api';
import type {
  ProductUpsertInput,
  ProductUpsertResp,
  OrderListReq,
  OrderListResp,
  OrderStatusUpdateReq,
  OrderStatusUpdateResp,
  AdminListResp,
  ContentUpsertInput,
  ContentUpsertResp,
} from '@/types/admin';

/** 商品 upsert（id 缺省 = create） */
export function upsertProduct(input: ProductUpsertInput) {
  return adminCall<ProductUpsertResp>('upsertProduct', input);
}

/** 内容 upsert（id 缺省 = create） */
export function upsertContent(input: ContentUpsertInput) {
  return adminCall<ContentUpsertResp>('upsertContent', input);
}

/** 订单列表（分页 + 状态过滤） */
export function listOrders(req: OrderListReq = {}) {
  return adminCall<OrderListResp>('listOrders', req);
}

/** 更新订单状态 */
export function updateOrderStatus(req: OrderStatusUpdateReq) {
  return adminCall<OrderStatusUpdateResp>('updateOrderStatus', req);
}

/** 管理员白名单 */
export function listAdmins() {
  return adminCall<AdminListResp>('listAdmins');
}
