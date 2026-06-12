/** 全局 initial state 形状 */
export interface AdminUser {
  id: string;
  openid: string;
  nickname?: string | null;
  avatarUrl?: string | null;
}

export interface InitialState {
  token: string | null;
  user: AdminUser | null;
  /** openid 是否在后端 admin_whitelist（登录时一次性校验，存进 initialState） */
  isAdmin: boolean;
}
