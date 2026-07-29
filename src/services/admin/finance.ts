/**
 * admin services — 财务业务域（提现/积分/会员/邀请/CSV 导出）
 * V0.3.29 GAP-B 拆出
 *
 * 与后端 apps/server/src/modules/admin/admin.routes.ts 对齐
 */
import { adminCall } from '../api';
import type {
  WithdrawalListReq,
  WithdrawalListResp,
  WithdrawalActionReq,
  AdjustPointsReq,
  AdjustPointsResp,
  GrantMemberReq,
  GrantMemberResp,
  InviteStatsReq,
  InviteStatsResp,
  ExportSettlementReq,
} from '@/types/admin';

/** V0.1.122 提现列表 */
export function listWithdrawals(req: WithdrawalListReq = {}) {
  return adminCall<WithdrawalListResp>('listWithdrawals', req);
}

/** V0.1.122 提现通过（事务内扣钱包） */
export function approveWithdrawal(req: WithdrawalActionReq) {
  return adminCall<{ ok: true }>('approveWithdrawal', req);
}

/** V0.1.122 提现拒绝 */
export function rejectWithdrawal(req: WithdrawalActionReq) {
  return adminCall<{ ok: true }>('rejectWithdrawal', req);
}

/** V0.2.6 邀请裂变 — 手动调整积分 */
export function adjustPoints(req: AdjustPointsReq) {
  return adminCall<AdjustPointsResp>('adjustPoints', req);
}

/** V0.2.6 邀请裂变 — 手动送会员 */
export function grantMember(req: GrantMemberReq) {
  return adminCall<GrantMemberResp>('grantMember', req);
}

/** V0.2.6 邀请裂变 — 邀请统计榜 */
export function listInviteStats(req: InviteStatsReq = {}) {
  return adminCall<InviteStatsResp>('listInviteStats', req);
}

/** CSV 导出结算单 */
export function exportSettlement(req: ExportSettlementReq) {
  return adminCall<Blob>('exportSettlement', req);
}
/** V0.3.34 A6：admin.excel 导出（结算单）*/
export function exportSettlementExcel(req: { yearMonth: string }) {
  return adminCall<{ filename: string; base64: string }>('exportSettlementExcel', req);
}
