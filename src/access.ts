/**
 * umi access 插件 — 权限矩阵
 *
 * 当前简单粗暴：有 token 就放行（admin 鉴权在后端做）。
 * 后期接 RBAC 时再细分。
 */
import type { InitialState } from '@/types/app';

export default function access(initialState: InitialState | undefined) {
  return {
    canAdmin: Boolean(initialState?.token && initialState?.user),
  };
}
