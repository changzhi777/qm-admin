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
  OrderRefundReq,
  OrderRefundResp,
  AdminListResp,
  ContentUpsertInput,
  ContentUpsertResp,
  GroupBuyUpsertInput,
  GroupBuyUpsertResp,
  GroupBuyListReq,
  GroupBuyListResp,
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

/** Phase 4.1 — 管理员发起退款（调微信 refund API + 扣减钱包） */
export function refundOrder(req: OrderRefundReq) {
  return adminCall<OrderRefundResp>('refundOrder', req);
}

/** 管理员白名单 */
export function listAdmins() {
  return adminCall<AdminListResp>('listAdmins');
}

/** V0.1.38 团购 upsert（id 缺省 = create）*/
export function upsertGroupBuy(input: GroupBuyUpsertInput) {
  return adminCall<GroupBuyUpsertResp>('upsertGroupBuy', input);
}

/** V0.1.38 团购列表（admin，分页 + status 过滤）*/
export function listGroupBuys(req: GroupBuyListReq = {}) {
  return adminCall<GroupBuyListResp>('listGroupBuys', req);
}
