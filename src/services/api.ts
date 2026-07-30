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

/** V0.2.8 admin 专属登录（POST /api/admin/login，替 auth.login password）*/
export async function adminLoginCall(username: string, password: string) {
  return request<{
    accessToken: string;
    admin: { id: string; username: string; role: string; nickname: string | null };
  }>('/admin/login', { method: 'POST', data: { username, password } });
}

/**
 * ProTable request 适配器（V0.1.122 DRY）— adminCall + catch + {data,success,total}
 * 用法：
 *   request={adminTableRequest<ReviewListResp>('listReviews', message)}
 *   request={adminTableRequest<WithdrawalListResp>('listWithdrawals', message, (p) => ({ status: p.status }))}
 */
export function adminTableRequest<RecordType>(
  action: string,
  messageApi: { error: (m: string) => void },
  extraPayload?: (params: Record<string, unknown>) => Record<string, unknown>,
) {
  return async (params: Record<string, unknown>) => {
    try {
      const resp = await adminCall<{ list: RecordType[]; total: number }>(action, {
        page: (params.current as number) ?? 1,
        pageSize: (params.pageSize as number) ?? 20,
        ...(extraPayload ? extraPayload(params) : {}),
      });
      return { data: resp.list, success: true, total: resp.total };
    } catch (e) {
      messageApi.error((e as Error).message);
      return { data: [] as RecordType[], success: false, total: 0 };
    }
  };
}

/** 调 /api/mall（同样 action/payload 协议） */
export async function mallCall<T = unknown>(action: string, payload?: unknown): Promise<T> {
  return request<T>('/mall', {
    method: 'POST',
    data: { action, payload: payload ?? {} },
  });
}

/**
 * 调 /api/boohee（V0.3.35 薄荷食物数据 — 用户侧 action/payload 协议，但 admin_token 同样通过 jwtVerify）
 * 与 adminCall 区别：path 是 /boohee 不是 /admin
 */
export async function booheeCall<T = unknown>(action: string, payload?: unknown): Promise<T> {
  return request<T>('/boohee', {
    method: 'POST',
    data: { action, payload: payload ?? {} },
  });
}

/**
 * CSV 导出（V0.1.124）— exportOrders/exportUsers/exportSettlement 返 raw CSV（非 envelope）
 * 直接 fetch + Blob 下载，绕过 request 拦截器
 */
export async function downloadAdminCsv(
  action: string,
  payload: Record<string, unknown>,
  filename: string,
): Promise<void> {
  const token = localStorage.getItem('admin_token') ?? '';
  const resp = await fetch('/api/admin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ action, payload }),
  });
  if (!resp.ok) throw new Error(`导出失败: ${resp.status}`);
  const blob = await resp.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** 调 /api/user（登录用） */
export async function userCall<T = unknown>(action: string, payload?: unknown): Promise<T> {
  return request<T>('/user', {
    method: 'POST',
    data: { action, payload: payload ?? {} },
  });
}

/**
 * 调 /api/auth/{action}（独立 route，V0.1.129 多方式认证）
 * 拦截器解包 envelope（{code,data}→data）+ 401 跳 /login
 */
export async function authCall<T = unknown>(action: string, payload?: unknown): Promise<T> {
  return request<T>(`/auth/${action}`, {
    method: 'POST',
    data: { action, payload: payload ?? {} },
  });
}

/**
 * V0.3.34 A6：admin.excel 导出（base64 解码 + 下载 .xlsx）
 * 后端返 envelope {code: 0, data: {filename, base64}}
 * 与 downloadAdminCsv 区别：base64 编码 xlsx（不是 raw 二进制）
 */
export async function downloadAdminExcel(
  action: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const resp = await adminCall<{ filename: string; base64: string }>(action, payload);
  // base64 → Blob → 下载
  const binary = atob(resp.base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = resp.filename;
  a.click();
  URL.revokeObjectURL(url);
}
