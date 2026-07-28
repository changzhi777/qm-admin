/**
 * user / auth 接口 wrapper
 */
import { userCall, adminCall, adminLoginCall } from './api';
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

/** V0.1.130 账号密码登录（调 /api/auth/login method=password，返 token + user） */
export interface PasswordLoginResp {
  user: AdminUser;
  accessToken: string;
  refreshToken: string;
  config?: unknown;
}

export function loginByPassword(username: string, password: string) {
  // V0.2.8 改调 admin 专属登录（/api/admin/login，替 auth.login password）
  return adminLoginCall(username, password);
}
