/**
 * pages/login-flow.ts 单元测试
 *
 * 覆盖 Login V0.2 加固版的 4 步业务流：
 * - 空 token/openid → 失败
 * - getMe 失败 / 抛错
 * - openid 不匹配（前端填的 vs token 解的）
 * - openid 不在 admin 白名单
 * - 全部通过 → 返回 user + token + isAdmin
 * - nickname fallback（无 nickname → admin-{openid 前 6}）
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetMe = vi.fn();
const mockListAdmins = vi.fn();
vi.mock('@/services/auth', () => ({
  getMe: (...args: unknown[]) => mockGetMe(...args),
  listAdmins: (...args: unknown[]) => mockListAdmins(...args),
}));

import { performLogin } from '@/pages/login-flow';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('performLogin', () => {
  it('token 空 → ok:false, reason 含「不能为空」', async () => {
    const r = await performLogin({ token: '  ', openid: 'o1' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/不能为空/);
    expect(mockGetMe).not.toHaveBeenCalled();
  });

  it('openid 空 → ok:false', async () => {
    const r = await performLogin({ token: 'tk', openid: '' });
    expect(r.ok).toBe(false);
  });

  it('openid 不匹配（token 解的 vs 用户填的）→ ok:false', async () => {
    mockGetMe.mockResolvedValue({ user: { openid: 'o_real', id: 'u1' } });
    const r = await performLogin({ token: 'tk', openid: 'o_fake' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/openid 不匹配.*o_fake.*o_real/);
    expect(mockListAdmins).not.toHaveBeenCalled();
  });

  it('openid 不在 admin 白名单 → ok:false', async () => {
    mockGetMe.mockResolvedValue({ user: { openid: 'o1', id: 'u1' } });
    mockListAdmins.mockResolvedValue({ openids: ['o2', 'o3'] });
    const r = await performLogin({ token: 'tk', openid: 'o1' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/不在 admin 白名单/);
  });

  it('全部通过 + 有 nickname → 返回 user + token + isAdmin=true', async () => {
    mockGetMe.mockResolvedValue({
      user: { openid: 'o1', id: 'u1', nickname: '智', avatarUrl: 'http://x' },
    });
    mockListAdmins.mockResolvedValue({ openids: ['o1', 'o2'] });
    const r = await performLogin({ token: 'tk', openid: 'o1' });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.user).toEqual({
        id: 'u1',
        openid: 'o1',
        nickname: '智',
        avatarUrl: 'http://x',
      });
      expect(r.token).toBe('tk');
      expect(r.isAdmin).toBe(true);
    }
  });

  it('全部通过 + 无 nickname → fallback `admin-{openid 前 6}`', async () => {
    mockGetMe.mockResolvedValue({
      user: { openid: 'olongid', id: 'u1' }, // 无 nickname
    });
    mockListAdmins.mockResolvedValue({ openids: ['olongid'] });
    const r = await performLogin({ token: 'tk', openid: 'olongid' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.user.nickname).toBe('admin-olongi');
  });

  it('getMe 抛错 → 异常向上抛（调用方 try/catch 处理）', async () => {
    mockGetMe.mockRejectedValue(new Error('401 Unauthorized'));
    await expect(performLogin({ token: 'tk', openid: 'o1' })).rejects.toThrow(/401/);
  });

  it('listAdmins 抛错 → 异常向上抛', async () => {
    mockGetMe.mockResolvedValue({ user: { openid: 'o1', id: 'u1' } });
    mockListAdmins.mockRejectedValue(new Error('500'));
    await expect(performLogin({ token: 'tk', openid: 'o1' })).rejects.toThrow(/500/);
  });
});
