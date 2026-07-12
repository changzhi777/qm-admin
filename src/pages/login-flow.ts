/**
 * Login 业务流（纯函数 — 与 UI 解耦）
 *
 * 抽出来的目的：可被 Login.tsx 调用，也可被单测直接覆盖
 * 关键校验（V0.2 加固版 — P0 修）：
 * 1. 写 token → 后端 me 验 token + 拉真实 user
 * 2. openid 一致性（前端填的 vs token 解出的）
 * 3. listAdmins 白名单校验
 * 4. 任意失败 → 抛错，由调用方处理（清 localStorage / 提示）
 */
import { getMe, listAdmins, loginByPassword } from '@/services/auth';
import type { InitialState } from '@/types/app';

export interface LoginInput {
  token: string;
  openid: string;
}

export interface LoginSuccess {
  ok: true;
  user: NonNullable<InitialState['user']>;
  isAdmin: true;
  token: string;
}

export interface LoginFailure {
  ok: false;
  reason: string;
}

export type LoginResult = LoginSuccess | LoginFailure;

/**
 * 完整登录流程（纯函数）
 *
 * 副作用：写 localStorage（token / user）— 由调用方在 catch 块清理
 *
 * 失败时**不抛错**而返回 { ok: false, reason }，便于测试断言
 * 实际 Login.tsx onFinish 仍用 try/catch 处理 message 提示
 */
export async function performLogin(input: LoginInput): Promise<LoginResult> {
  const token = input.token.trim();
  const openid = input.openid.trim();

  if (!token || !openid) {
    return { ok: false, reason: 'token / openid 不能为空' };
  }

  // 1. 验 token + 拉真实 user
  const meResp = await getMe();
  if (meResp.user.openid !== openid) {
    return {
      ok: false,
      reason: `openid 不匹配：你填的是 ${openid.slice(0, 8)}..., 但 token 解出的是 ${meResp.user.openid.slice(0, 8)}...`,
    };
  }

  // 2. 验 admin 白名单
  const adminsResp = await listAdmins();
  if (!adminsResp.openids.includes(openid)) {
    return { ok: false, reason: '该 openid 不在 admin 白名单，请联系运营添加' };
  }

  return {
    ok: true,
    user: {
      id: meResp.user.id,
      openid: meResp.user.openid,
      nickname: meResp.user.nickname ?? `admin-${openid.slice(0, 6)}`,
      avatarUrl: meResp.user.avatarUrl,
    },
    isAdmin: true,
    token,
  };
}

/**
 * 账号密码登录流程（V0.1.130，替代手工填 token）
 *
 * 1. 调 /api/auth/login {method:'password'} → 拿 token + user
 * 2. listAdmins 验 openid 在白名单
 * 3. 失败 → { ok: false, reason }（不抛错，便于 UI 断言）
 *
 * admin User 需先在小程序 bind-apps 页绑 username + password
 */
export async function performPasswordLogin(input: {
  username: string;
  password: string;
}): Promise<LoginResult> {
  const username = input.username.trim();
  const password = input.password;
  if (!username || !password) {
    return { ok: false, reason: '账号 / 密码不能为空' };
  }

  let resp: Awaited<ReturnType<typeof loginByPassword>>;
  try {
    resp = await loginByPassword(username, password);
  } catch (e) {
    return { ok: false, reason: (e as Error).message || '账号或密码错误' };
  }

  // 写 token（拦截器加 Authorization）
  localStorage.setItem('qm_admin_token', resp.accessToken);

  // 验 admin 白名单（openid）
  const adminsResp = await listAdmins();
  if (!adminsResp.openids.includes(resp.user.openid)) {
    localStorage.removeItem('qm_admin_token');
    return { ok: false, reason: '该账号不在 admin 白名单，请联系运营' };
  }

  return {
    ok: true,
    user: {
      id: resp.user.id,
      openid: resp.user.openid,
      nickname: resp.user.nickname ?? `admin-${resp.user.openid.slice(0, 6)}`,
      avatarUrl: resp.user.avatarUrl,
    },
    isAdmin: true,
    token: resp.accessToken,
  };
}
