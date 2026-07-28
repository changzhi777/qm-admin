/**
 * admin module — 财务类型（提现/积分/会员/邀请裂变/CSV 导出）
 * V0.3.29 GAP-B 拆出
 *
 * 与后端 apps/server/src/modules/admin/admin.{schema,service}.ts 对齐
 */

// ===== 提现管理 =====
export type WithdrawalStatus = 'pending' | 'approved' | 'rejected';
export interface WithdrawalListItem {
  id: string;
  userId: string;
  amount: string;
  status: WithdrawalStatus;
  reason: string | null;
  processedBy: string | null;
  processedAt: string | null;
  createdAt: string;
  user: { id: string; nickname: string | null };
}
export interface WithdrawalListReq {
  status?: WithdrawalStatus;
  page?: number;
  pageSize?: number;
}
export interface WithdrawalListResp {
  list: WithdrawalListItem[];
  total: number;
  page: number;
  pageSize: number;
}
export interface WithdrawalActionReq {
  id: string;
  reason?: string;
}

// ===== 邀请裂变 / 积分 =====
export interface AdjustPointsReq {
  userId: string;
  change: number; // ± 正加负扣
  reason?: string;
}
export interface AdjustPointsResp {
  ok: boolean;
  userId: string;
  points: number;
}
export interface GrantMemberReq {
  userId: string;
  days: number;
}
export interface GrantMemberResp {
  ok: boolean;
  userId: string;
  memberExpireAt: string | null;
}
export interface InviteStatsReq {
  page?: number;
  pageSize?: number;
}
export interface InviteStatsItem {
  id: string;
  nickname: string | null;
  avatarUrl: string | null;
  inviteCode: string | null;
  distributorLevel: string;
  inviteCount: number;
}
export interface InviteStatsResp {
  list: InviteStatsItem[];
  total: number;
  page: number;
  pageSize: number;
}

// ===== CSV 导出请求 =====
export interface ExportOrdersReq {
  status?: 'pending_pay' | 'paid' | 'shipped' | 'done' | 'cancelled' | 'refunded' | 'refunding';
  page?: number;
  pageSize?: number;
  format: 'csv';
}
export interface ExportUsersReq {
  page?: number;
  pageSize?: number;
  format: 'csv';
}
export interface ExportSettlementReq {
  yearMonth: string; // YYYY-MM
  format: 'csv';
}