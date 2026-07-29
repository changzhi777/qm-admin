/**
 * admin services — 商城业务域（商品/订单/团购/CSV 导出）
 * V0.3.29 GAP-B 拆出
 *
 * 与后端 apps/server/src/modules/admin/admin.routes.ts 对齐
 */
import { adminCall } from '../api';
import type {
  ProductUpsertInput,
  ProductUpsertResp,
  ProductListReq,
  ProductListResp,
  OrderListReq,
  OrderListResp,
  OrderStatusUpdateReq,
  OrderStatusUpdateResp,
  OrderRefundReq,
  OrderRefundResp,
  GroupBuyUpsertInput,
  GroupBuyUpsertResp,
  GroupBuyListReq,
  GroupBuyListResp,
  ExportOrdersReq,
} from '@/types/admin';

/** 商品 upsert（id 缺省 = create） */
export function upsertProduct(input: ProductUpsertInput) {
  return adminCall<ProductUpsertResp>('upsertProduct', input);
}

/** V0.1.122 商品列表（admin，分页 + status/category 过滤） */
export function listProducts(req: ProductListReq = {}) {
  return adminCall<ProductListResp>('listProducts', req);
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

/** V0.1.38 团购 upsert（id 缺省 = create）*/
export function upsertGroupBuy(input: GroupBuyUpsertInput) {
  return adminCall<GroupBuyUpsertResp>('upsertGroupBuy', input);
}

/** V0.1.38 团购列表（admin，分页 + status 过滤）*/
export function listGroupBuys(req: GroupBuyListReq = {}) {
  return adminCall<GroupBuyListResp>('listGroupBuys', req);
}

/** CSV 导出订单 */
export function exportOrders(req: ExportOrdersReq) {
  return adminCall<Blob>('exportOrders', req);
}
/** V0.3.34 A6：admin.excel 导出（订单）*/
export function exportOrdersExcel(req: ExportOrdersReq) {
  return adminCall<{ filename: string; base64: string }>('exportOrdersExcel', req);
}
