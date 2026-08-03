/**
 * admin services — Dashboard 业务域（统计/全局搜索/提审/解读）
 * V0.3.29 GAP-B 拆出
 *
 * 与后端 apps/server/src/modules/admin/admin.routes.ts 对齐
 */
import { adminCall } from '../api';
import type {
  StatsResp,
  StatsByTimeRangeReq,
  StatsByTimeRangeResp,
  DashboardResp,
  GlobalSearchReq,
  GlobalSearchResp,
  GetMpCategoryResp,
  UploadMpMediaReq,
  UploadMpMediaResp,
  SubmitMpAuditReq,
  SubmitMpAuditResp,
  InterpretListReq,
  InterpretListResp,
  NutritionBalanceReq,
  NutritionBalanceResp,
  AdminListCheckinsReq,
  AdminListCheckinsResp,
  AdminListDeviceSourcesReq,
  AdminListDeviceSourcesResp,
} from '@/types/admin';

/** V0.1.124 Dashboard 统计（旧版，4 字段） */
export function stats() {
  return adminCall<StatsResp>('stats');
}

/** V0.2.7 时段统计（Dashboard 增强） */
export function statsByTimeRange(req: StatsByTimeRangeReq = {}) {
  return adminCall<StatsByTimeRangeResp>('statsByTimeRange', req);
}

/** V0.3.4 admin MIS dashboard — 1 API 拉全 9 字段（admin + super-admin） */
export function dashboard() {
  return adminCall<DashboardResp>('dashboard');
}

/** V0.3.5 全局搜索（5 表 LIKE 跨表） */
export function globalSearch(req: GlobalSearchReq) {
  return adminCall<GlobalSearchResp>('globalSearch', req);
}

/** V0.2.65 提审 API（super-admin 独占）— 获取小程序类目 */
export function getMpCategory() {
  return adminCall<GetMpCategoryResp>('getMpCategory');
}

/** V0.2.65 提审 API（super-admin 独占）— 上传审核素材（base64 → media_id） */
export function uploadMpMedia(req: UploadMpMediaReq) {
  return adminCall<UploadMpMediaResp>('uploadMpMedia', req);
}

/** V0.2.65 提审 API（super-admin 独占）— 提交代码审核 */
export function submitMpAudit(req: SubmitMpAuditReq) {
  return adminCall<SubmitMpAuditResp>('submitMpAudit', req);
}

/** V0.2.37 interpret 列表（分页 + type/userId 过滤） */
export function listInterpret(req: InterpretListReq = {}) {
  return adminCall<InterpretListResp>('listInterpret', req);
}

/** V0.3.35 boohee×运动 营养×运动平衡聚合（admin 验证 boohee API 落地） */
export function getNutritionBalance(req: NutritionBalanceReq) {
  return adminCall<NutritionBalanceResp>('nutritionBalance', req);
}
/** V0.3.35 sprint B：admin.checkins 全站打卡列表 */
export function listCheckins(req: AdminListCheckinsReq = {}) {
  return adminCall<AdminListCheckinsResp>('listCheckins', req);
}

/** V0.3.35 sprint B：admin.deviceSources 设备数据源 */
export function listDeviceSources(req: AdminListDeviceSourcesReq = {}) {
  return adminCall<AdminListDeviceSourcesResp>('listDeviceSources', req);
}
