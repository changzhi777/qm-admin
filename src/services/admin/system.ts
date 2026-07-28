/**
 * admin services — 系统业务域（配置/审计/上传）
 * V0.3.29 GAP-B 拆出
 *
 * 与后端 apps/server/src/modules/admin/admin.routes.ts 对齐
 */
import { adminCall } from '../api';
import type {
  SetConfigReq,
  AuditLogListReq,
  AuditLogListResp,
  UploadListReq,
  UploadListResp,
} from '@/types/admin';

/** 配置管理（功能开关/会员等级/Categories 写入）*/
export function setConfig(req: SetConfigReq) {
  return adminCall<{ ok: true }>('setConfig', req);
}

/** V0.1.124 审计日志查询 */
export function listAuditLogs(req: AuditLogListReq = {}) {
  return adminCall<AuditLogListResp>('listAuditLogs', req);
}

/** V0.1.150 上传列表（COS 中转 + 异步解析） */
export function listUploads(req: UploadListReq = {}) {
  return adminCall<UploadListResp>('listUploads', req);
}

/** V0.1.150 重试解析（重置 pending + 入队） */
export function retryParse(req: { id: string }) {
  return adminCall<{ ok: true }>('retryParse', req);
}