/**
 * access.ts 单元测试
 *
 * access 插件：基于 initialState 计算权限矩阵
 * - canAdmin: token + user + isAdmin 三者全有
 */
import { describe, it, expect } from 'vitest';
import access from '@/access';
import type { InitialState } from '@/types/app';

const baseUser = { id: 'u1', openid: 'o1', nickname: 'admin' };

describe('access.canAdmin', () => {
  it('undefined initialState → canAdmin=false', () => {
    const result = access(undefined);
    expect(result.canAdmin).toBe(false);
  });

  it('缺 token → canAdmin=false', () => {
    const state: InitialState = { user: baseUser, isAdmin: true } as InitialState;
    const result = access(state);
    expect(result.canAdmin).toBe(false);
  });

  it('缺 user → canAdmin=false', () => {
    const state: InitialState = { token: 'tk', isAdmin: true } as InitialState;
    const result = access(state);
    expect(result.canAdmin).toBe(false);
  });

  it('缺 isAdmin（白名单未过）→ canAdmin=false', () => {
    const state: InitialState = { token: 'tk', user: baseUser } as InitialState;
    const result = access(state);
    expect(result.canAdmin).toBe(false);
  });

  it('token + user + isAdmin=true → canAdmin=true', () => {
    const state: InitialState = { token: 'tk', user: baseUser, isAdmin: true };
    const result = access(state);
    expect(result.canAdmin).toBe(true);
  });

  it('isAdmin=false（白名单拒绝）→ canAdmin=false', () => {
    const state: InitialState = { token: 'tk', user: baseUser, isAdmin: false };
    const result = access(state);
    expect(result.canAdmin).toBe(false);
  });

  it('空字符串 token → 视为缺（falsy）→ canAdmin=false', () => {
    const state: InitialState = { token: '', user: baseUser, isAdmin: true };
    const result = access(state);
    expect(result.canAdmin).toBe(false);
  });
});
