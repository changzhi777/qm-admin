/** 全局 initial state 形状 */
export interface AdminUser {
  id: string;
  openid: string;
  nickname?: string;
  avatarUrl?: string;
}

export interface InitialState {
  token: string | null;
  user: AdminUser | null;
}
