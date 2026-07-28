/**
 * admin services — 用户业务域（用户管理 + 核销 + 评价）
 * V0.3.29 GAP-B 拆出
 *
 * 与后端 apps/server/src/modules/admin/admin.routes.ts 对齐
 */
import { adminCall } from '../api';
import type {
  UserListReq,
  UserListResp,
  UserBanReq,
  UserUnbanReq,
  PickupConfirmReq,
  PickupConfirmResp,
  ReviewListReq,
  ReviewListResp,
  ReviewReplyReq,
  ExportUsersReq,
} from '@/types/admin';

/** V0.1.122 用户列表 */
export function listUsers(req: UserListReq = {}) {
  return adminCall<UserListResp>('listUsers', req);
}

/** V0.1.122 封禁用户 */
export function banUser(req: UserBanReq) {
  return adminCall<{ ok: true }>('banUser', req);
}

/** V0.1.122 解封用户 */
export function unbanUser(req: UserUnbanReq) {
  return adminCall<{ ok: true }>('unbanUser', req);
}

/** V0.1.122 自提核销 */
export function confirmPickup(req: PickupConfirmReq) {
  return adminCall<PickupConfirmResp>('confirmPickup', req);
}

/** V0.1.122 评价列表 */
export function listReviews(req: ReviewListReq = {}) {
  return adminCall<ReviewListResp>('listReviews', req);
}

/** V0.1.122 评价回复 */
export function addReviewReply(req: ReviewReplyReq) {
  return adminCall<{ ok: true }>('addReviewReply', req);
}

/** CSV 导出用户 */
export function exportUsers(req: ExportUsersReq) {
  return adminCall<Blob>('exportUsers', req);
}