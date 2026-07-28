/**
 * umi max 运行时配置
 *
 * - getInitialState：注入登录态（token + user）
 * - request：fetch 拦截器（注入 Bearer，解 envelope）
 * - layout：Max 的 ProLayout 钩子（顶栏 avatar + 退出菜单）
 */
import type { RequestConfig, RunTimeLayoutConfig } from '@umijs/max';
import { LogoutOutlined } from '@ant-design/icons';
import { history } from '@umijs/max';
import GlobalSearch from '@/components/GlobalSearch';
import type { InitialState } from '@/types/app';

/** Max 约定：返回值即为 initialState */
export async function getInitialState(): Promise<InitialState> {
  const token = localStorage.getItem('qm_admin_token');
  const userRaw = localStorage.getItem('qm_admin_user');
  let user = null;
  try {
    user = userRaw ? JSON.parse(userRaw) : null;
  } catch {
    // 老格式或损坏 → 视为未登录
    localStorage.removeItem('qm_admin_user');
  }
  // 登录页本身不做白名单验证（用户还在填表）
  // 已登录态：信任登录时已校验过的 isAdmin（true）
  const isAdmin = Boolean(token && user);
  return { token, user, isAdmin };
}

/** ProLayout 钩子（顶栏 / 侧栏 / 退出菜单） */
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  const s = initialState as InitialState | undefined;
  return {
    title: '青沐 admin',
    logo: false,
    layout: 'mix',
    token: {
      header: { colorBgHeader: '#0FAF8E', colorTextMenu: '#fff' },
    },
    avatarProps: {
      src: s?.user?.avatarUrl,
      size: 'small',
      title: s?.user?.nickname ?? s?.user?.openid?.slice(0, 8) ?? 'admin',
    },
    actionsRender: () => [
      <GlobalSearch key="global-search" />,
      <a
        key="logout"
        onClick={() => {
          localStorage.removeItem('qm_admin_token');
          localStorage.removeItem('qm_admin_user');
          setInitialState({ token: null, user: null, isAdmin: false } as InitialState);
          history.push('/login');
        }}
      >
        <LogoutOutlined /> 退出
      </a>,
    ],
    onPageChange: () => {
      // UmiMax 的 UmiHistory 类型未暴露 location 字段（V0.3.29 GAP-E 待清理 as any）
      const location = (history as unknown as { location: { pathname: string } }).location;
      // 未登录访问非 /login 页面 → 跳登录
      if (!s?.token && location.pathname !== '/login') {
        history.push('/login');
      }
    },
  };
};

/**
 * 全局 request 配置（基于 axios）
 * baseURL 是 axios 字段，UmiMax RequestConfig 类型未暴露（V0.3.29 GAP-E 待清理）
 */
export const request = {
  baseURL: '/api',
  timeout: 15000,
  requestInterceptors: [
    ((config: any) => {
      const token = localStorage.getItem('qm_admin_token');
      if (token) {
        config.headers = {
          ...(config.headers ?? {}),
          Authorization: `Bearer ${token}`,
        };
      }
      return config;
    }) as any,
  ],
  responseInterceptors: [
    ((response: any) => {
      // 后端统一 envelope：{code, data, msg}
      const data = response.data as { code?: number; msg?: string; data?: unknown };
      if (data && typeof data === 'object' && 'code' in data) {
        if (data.code === 401) {
          localStorage.removeItem('qm_admin_token');
          localStorage.removeItem('qm_admin_user');
          if (location.pathname !== '/login') {
            // 用 history.push 替代 location.href，避免整页强刷丢失表单状态
            history.push('/login');
          }
        }
        if (data.code !== 0 && data.code !== undefined) {
          throw new Error(data.msg ?? `request failed: code=${data.code}`);
        }
        // 解包 data → 后续 await request<T>() 拿到的就是 T
        return { ...response, data: data.data };
      }
      return response;
    }) as any,
  ],
  errorConfig: {
    errorHandler: () => {
      // 静默；具体业务页弹 message
    },
  },
} as unknown as RequestConfig;
