/**
 * admin module — 通用类型（RBAC 管理员账号 + 分页）
 * V0.3.29 GAP-B 拆出
 *
 * 与后端 apps/server/src/modules/admin/admin.service.ts 对齐
 */

/** V0.2.8 管理员账号（listAdmins 返）*/
export interface AdminListItem {
  id: string;
  username: string;
  role: string;
  nickname: string | null;
  lastLoginAt: string | null;
  disabled: boolean;
  createdAt: string;
}

/** V0.2.8 白名单老接口（admin.routes.ts listAdmins 老实现，仍兼容）*/
export interface AdminListResp {
  openids: string[];
}

/** V0.2.8 RBAC 角色枚举 */
export type AdminRole = 'super-admin' | 'admin' | 'operator';

export interface CreateAdminReq {
  username: string;
  password: string;
  role: AdminRole;
  displayName?: string;
}
export interface CreateAdminResp {
  id: string;
}

export interface UpdateAdminReq {
  id: string;
  password?: string;
  role?: AdminRole;
  displayName?: string;
  disabled?: boolean;
}
export interface UpdateAdminResp {
  ok: true;
}

export interface DisableAdminReq {
  id: string;
}
export interface DisableAdminResp {
  ok: true;
}

export interface AdminLoginLogItem {
  id: string;
  adminId: string;
  loginAt: string;
  ip: string | null;
  userAgent: string | null;
  ok: boolean;
  failureReason: string | null;
}
export interface AdminLoginLogsReq {
  page?: number;
  pageSize?: number;
  adminId?: string;
}
export interface AdminLoginLogsResp {
  list: AdminLoginLogItem[];
  total: number;
  page: number;
  pageSize: number;
}