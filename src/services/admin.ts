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
  ContentListReq,
  ContentListResp,
  GroupBuyUpsertInput,
  GroupBuyUpsertResp,
  GroupBuyListReq,
  GroupBuyListResp,
  ReviewListReq,
  ReviewListResp,
  ReviewReplyReq,
  WithdrawalListReq,
  WithdrawalListResp,
  WithdrawalActionReq,
  UserListReq,
  UserListResp,
  UserBanReq,
  UserUnbanReq,
  PickupConfirmReq,
  PickupConfirmResp,
  TrainingPlanListReq,
  TrainingPlanListResp,
  TrainingPlanUpsertInput,
  AuditLogListReq,
  AuditLogListResp,
  StatsResp,
  AdjustPointsReq,
  AdjustPointsResp,
  GrantMemberReq,
  GrantMemberResp,
  InviteStatsReq,
  InviteStatsResp,
  UploadListReq,
  UploadListResp,
  SetConfigReq,
  RaceResultReq,
  EnrollmentsResp,
  StatsByTimeRangeReq,
  StatsByTimeRangeResp,
} from '@/types/admin';

/** 商品 upsert（id 缺省 = create） */
export function upsertProduct(input: ProductUpsertInput) {
  return adminCall<ProductUpsertResp>('upsertProduct', input);
}

/** 内容 upsert（id 缺省 = create） */
export function upsertContent(input: ContentUpsertInput) {
  return adminCall<ContentUpsertResp>('upsertContent', input);
}

/** V0.1.122 内容列表（admin，分页 + type/status 过滤） */
export function listContents(req: ContentListReq = {}) {
  return adminCall<ContentListResp>('listContents', req);
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

/** V0.1.122 评价管理 */
export function listReviews(req: ReviewListReq = {}) {
  return adminCall<ReviewListResp>('listReviews', req);
}
export function addReviewReply(req: ReviewReplyReq) {
  return adminCall<{ ok: true }>('addReviewReply', req);
}

/** V0.1.122 提现管理 */
export function listWithdrawals(req: WithdrawalListReq = {}) {
  return adminCall<WithdrawalListResp>('listWithdrawals', req);
}
export function approveWithdrawal(req: WithdrawalActionReq) {
  return adminCall<{ ok: true }>('approveWithdrawal', req);
}
export function rejectWithdrawal(req: WithdrawalActionReq) {
  return adminCall<{ ok: true }>('rejectWithdrawal', req);
}

/** V0.1.122 用户管理 */
export function listUsers(req: UserListReq = {}) {
  return adminCall<UserListResp>('listUsers', req);
}
export function banUser(req: UserBanReq) {
  return adminCall<{ ok: true }>('banUser', req);
}
export function unbanUser(req: UserUnbanReq) {
  return adminCall<{ ok: true }>('unbanUser', req);
}

/** V0.1.122 自提核销 */
export function confirmPickup(req: PickupConfirmReq) {
  return adminCall<PickupConfirmResp>('confirmPickup', req);
}

/** V0.1.123 训练计划管理 */
export function listTrainingPlans(req: TrainingPlanListReq = {}) {
  return adminCall<TrainingPlanListResp>('listTrainingPlans', req);
}
export function upsertTrainingPlan(input: TrainingPlanUpsertInput) {
  return adminCall<{ id: string }>('upsertTrainingPlan', input);
}

/** V0.1.124 审计日志 */
export function listAuditLogs(req: AuditLogListReq = {}) {
  return adminCall<AuditLogListResp>('listAuditLogs', req);
}

/** V0.1.124 Dashboard 统计 */
export function stats() {
  return adminCall<StatsResp>('stats');
}

/** V0.2.6 邀请裂变管理 */
export function adjustPoints(req: AdjustPointsReq) {
  return adminCall<AdjustPointsResp>('adjustPoints', req);
}
export function grantMember(req: GrantMemberReq) {
  return adminCall<GrantMemberResp>('grantMember', req);
}
export function listInviteStats(req: InviteStatsReq = {}) {
  return adminCall<InviteStatsResp>('listInviteStats', req);
}

/** V0.1.150 上传管理 */
export function listUploads(req: UploadListReq = {}) {
  return adminCall<UploadListResp>('listUploads', req);
}
export function retryParse(req: { id: string }) {
  return adminCall<{ ok: true }>('retryParse', req);
}

/** 配置管理（功能开关/会员等级/Categories 写入）*/
export function setConfig(req: SetConfigReq) {
  return adminCall<{ ok: true }>('setConfig', req);
}

/** V0.1.134 赛事成绩 */
export function submitRaceResult(req: RaceResultReq) {
  return adminCall<{ id: string }>('submitRaceResult', req);
}
export function listEnrollmentsByContent(contentId: string) {
  return adminCall<EnrollmentsResp>('listEnrollmentsByContent', { contentId });
}

/** 时段统计（Dashboard 增强）*/
export function statsByTimeRange(req: StatsByTimeRangeReq = {}) {
  return adminCall<StatsByTimeRangeResp>('statsByTimeRange', req);
}
