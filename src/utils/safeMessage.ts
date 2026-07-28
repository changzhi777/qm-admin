/**
 * safeMessage — 防御性 message API 包装
 *
 * 背景（V0.3.32 BUG）：
 *   未登录态访问 admin page 触发 redirect → /login，组件 unmount。
 *   React 18 严格模式 + antd message 静态 API 在 unmount + redirect 时序下
 *   调用 message.error 可能 throw `TypeError: x.error is not a function`。
 *
 * 修复范式：try/catch + 可选链 `?.` + 静默 fallback（不影响业务逻辑）。
 *
 * 用法（替换所有 `message.error((e as Error).message)`）：
 *   import { safeMessageError } from '@/utils/safeMessage';
 *   .catch((e) => safeMessageError(message, e));
 */
import type { MessageInstance } from 'antd/es/message/interface';

/** antd message API 的最小子集（避免引入 antd 全量类型） */
export interface MessageApi {
  error?: (content: string) => void;
  success?: (content: string) => void;
  warning?: (content: string) => void;
  info?: (content: string) => void;
}

/**
 * 安全的 message.error — try/catch + 可选链，message API 失效时静默 fallback
 *
 * @param message - antd `AntdApp.useApp().message` 或 undefined
 * @param e - 捕获的错误（任意类型）
 */
export function safeMessageError(
  message: MessageApi | MessageInstance | undefined,
  e: unknown,
): void {
  const msg = e instanceof Error ? e.message : String(e);
  try {
    message?.error?.(msg);
  } catch {
    /* silent — message API 在 unmount + redirect 时序失效时静默 */
  }
}

/** 安全 message.success */
export function safeMessageSuccess(
  message: MessageApi | MessageInstance | undefined,
  content: string,
): void {
  try {
    message?.success?.(content);
  } catch {
    /* silent */
  }
}

/** 安全 message.warning */
export function safeMessageWarning(
  message: MessageApi | MessageInstance | undefined,
  e: unknown,
): void {
  const msg = e instanceof Error ? e.message : String(e);
  try {
    message?.warning?.(msg);
  } catch {
    /* silent */
  }
}