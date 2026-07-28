/**
 * admin services — RBAC 业务域（管理员账号 + 登录日志）
 * V0.3.29 GAP-B 拆出
 *
 * 与后端 apps/server/src/modules/admin/admin.routes.ts 对齐
 * 注意：disableAdmin 是 updateAdmin.disabled 子字段，**没有独立 action**
 */
import { adminCall } from '../api';
import type {
  AdminListResp,
  CreateAdminReq,
  CreateAdminResp,
  UpdateAdminReq,
  UpdateAdminResp,
  AdminLoginLogsReq,
  AdminLoginLogsResp,
} from '@/types/admin';

/** V0.2.8 管理员白名单列表（保留老接口兼容） */
export function listAdmins() {
  return adminCall<AdminListResp>('listAdmins');
}

/** V0.2.8 创建管理员（super-admin only） */
export function createAdmin(req: CreateAdminReq) {
  return adminCall<CreateAdminResp>('createAdmin', req);
}

/** V0.2.8 更新管理员（role / disabled / password / displayName） */
export function updateAdmin(req: UpdateAdminReq) {
  return adminCall<UpdateAdminResp>('updateAdmin', req);
}

/** V0.3.5 管理员登录日志查询 */
export function adminLoginLogs(req: AdminLoginLogsReq = {}) {
  return adminCall<AdminLoginLogsResp>('adminLoginLogs', req);
}