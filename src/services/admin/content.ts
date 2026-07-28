/**
 * admin services — 内容业务域（内容/训练计划/赛事）
 * V0.3.29 GAP-B 拆出
 *
 * 与后端 apps/server/src/modules/admin/admin.routes.ts 对齐
 */
import { adminCall } from '../api';
import type {
  ContentUpsertInput,
  ContentUpsertResp,
  ContentListReq,
  ContentListResp,
  TrainingPlanUpsertInput,
  TrainingPlanListReq,
  TrainingPlanListResp,
  RaceResultReq,
  EnrollmentsResp,
} from '@/types/admin';

/** 内容 upsert（id 缺省 = create） */
export function upsertContent(input: ContentUpsertInput) {
  return adminCall<ContentUpsertResp>('upsertContent', input);
}

/** V0.1.122 内容列表（admin，分页 + type/status 过滤） */
export function listContents(req: ContentListReq = {}) {
  return adminCall<ContentListResp>('listContents', req);
}

/** V0.1.123 训练计划 upsert */
export function upsertTrainingPlan(input: TrainingPlanUpsertInput) {
  return adminCall<{ id: string }>('upsertTrainingPlan', input);
}

/** V0.1.123 训练计划列表 */
export function listTrainingPlans(req: TrainingPlanListReq = {}) {
  return adminCall<TrainingPlanListResp>('listTrainingPlans', req);
}

/** V0.1.134 赛事成绩录入 */
export function submitRaceResult(req: RaceResultReq) {
  return adminCall<{ id: string }>('submitRaceResult', req);
}

/** V0.1.134 报名列表（按内容 id） */
export function listEnrollmentsByContent(contentId: string) {
  return adminCall<EnrollmentsResp>('listEnrollmentsByContent', { contentId });
}