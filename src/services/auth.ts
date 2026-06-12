/**
 * user / auth 接口 wrapper
 */
import { userCall, adminCall } from './api';
import type { AdminUser } from '@/types/app';
import type { AdminListResp } from '@/types/admin';

/** 当前登录用户（从 token 解析 openid → 后端拉真实 user） */
export interface MeResp {
  user: AdminUser;
  config?: unknown;
}

export function getMe() {
  return userCall<MeResp>('me');
}

/** 查 admin 白名单（用于客户端二次校验，避免无效操作请求） */
export function listAdmins() {
  return adminCall<AdminListResp>('listAdmins');
}
