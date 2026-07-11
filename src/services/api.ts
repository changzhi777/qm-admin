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

/** 调 /api/user（登录用） */
export async function userCall<T = unknown>(action: string, payload?: unknown): Promise<T> {
  return request<T>('/user', {
    method: 'POST',
    data: { action, payload: payload ?? {} },
  });
}
