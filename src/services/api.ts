/**
 * 通用 admin POST { action, payload } 调用封装
 *
 * 后端 /api/admin 是统一入口，所有动作走 { action, payload } 协议。
 * mall 端点是公开 + 部分鉴权，但 admin 端也可直接调（带 JWT 即可）。
 */
import { request } from '@umijs/max';

/**
 * 调 /api/admin（POST { action, payload }）
 * - 拦截器已解包 envelope（{code, data} → data）
 * - 401 已自动跳 /login
 */
export async function adminCall<T = unknown>(action: string, payload?: unknown): Promise<T> {
  return request<T>('/admin', {
    method: 'POST',
    data: { action, payload: payload ?? {} },
  });
}

/** 调 /api/mall（同样 action/payload 协议） */
export async function mallCall<T = unknown>(action: string, payload?: unknown): Promise<T> {
  return request<T>('/mall', {
    method: 'POST',
    data: { action, payload: payload ?? {} },
  });
}

/** 调 /api/user（登录用） */
export async function userCall<T = unknown>(action: string, payload?: unknown): Promise<T> {
  return request<T>('/user', {
    method: 'POST',
    data: { action, payload: payload ?? {} },
  });
}
