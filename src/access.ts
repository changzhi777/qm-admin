/**
 * umi access 插件 — 权限矩阵
 *
 * 真正校验：登录时已调 listAdmins 验过 openid 是否在白名单
 * 这里只是消费 initialState.isAdmin，由 useAccess() 在路由层使用
 */
import type { InitialState } from '@/types/app';

export default function access(initialState: InitialState | undefined) {
  return {
    canAdmin: Boolean(initialState?.token && initialState?.user && initialState?.isAdmin),
  };
}
