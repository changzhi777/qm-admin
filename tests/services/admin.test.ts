/**
 * services/admin.ts 单元测试
 *
 * 覆盖：所有 admin action 包装都正确调 adminCall
 * 复用 services/api.test 的 mock 模式
 * V0.3.29 整理：扩到 40+ 测，覆盖 33 wrapper
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockAdminCall = vi.fn();
vi.mock('@/services/api', () => ({
  adminCall: (...args: unknown[]) => mockAdminCall(...args),
}));

import {
  upsertProduct,
  listProducts,
  upsertContent,
  listContents,
  upsertGroupBuy,
  listGroupBuys,
  upsertTrainingPlan,
  listTrainingPlans,
  listOrders,
  updateOrderStatus,
  refundOrder,
  listUsers,
  banUser,
  unbanUser,
  confirmPickup,
  listReviews,
  addReviewReply,
  listWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  listAuditLogs,
  listUploads,
  retryParse,
  setConfig,
  submitRaceResult,
  listEnrollmentsByContent,
  adjustPoints,
  grantMember,
  listInviteStats,
  listAdmins,
  createAdmin,
  updateAdmin,
  adminLoginLogs,
  stats,
  statsByTimeRange,
  dashboard,
  globalSearch,
  getMpCategory,
  uploadMpMedia,
  submitMpAudit,
  exportOrders,
  exportUsers,
  exportSettlement,
  listInterpret,
} from '@/services/admin';

beforeEach(() => {
  mockAdminCall.mockReset();
  mockAdminCall.mockResolvedValue({ ok: true });
});

describe('admin services 包装层 — 33+ wrapper 全覆盖', () => {
  // —— 商品 ——
  it('upsertProduct → adminCall("upsertProduct", input)', async () => {
    const input = { name: 'p', category: 'c', price: 1 };
    await upsertProduct(input);
    expect(mockAdminCall).toHaveBeenCalledWith('upsertProduct', input);
  });

  it('listProducts 缺省 → adminCall("listProducts", {})', async () => {
    await listProducts();
    expect(mockAdminCall).toHaveBeenCalledWith('listProducts', {});
  });

  it('listProducts 带 status + category 过滤', async () => {
    await listProducts({ status: 'on', category: 'shoes', page: 2 });
    expect(mockAdminCall).toHaveBeenCalledWith('listProducts', {
      status: 'on',
      category: 'shoes',
      page: 2,
    });
  });

  // —— 内容 ——
  it('upsertContent → adminCall("upsertContent", input)', async () => {
    const input = { type: 'race' as const, title: 't' };
    await upsertContent(input);
    expect(mockAdminCall).toHaveBeenCalledWith('upsertContent', input);
  });

  it('listContents 缺省 → adminCall("listContents", {})', async () => {
    await listContents();
    expect(mockAdminCall).toHaveBeenCalledWith('listContents', {});
  });

  // —— 团购 ——
  it('upsertGroupBuy → adminCall("upsertGroupBuy", input)', async () => {
    const input = { productId: 'p1', groupPrice: 99, targetCount: 10 };
    await upsertGroupBuy(input);
    expect(mockAdminCall).toHaveBeenCalledWith('upsertGroupBuy', input);
  });

  it('listGroupBuys → adminCall("listGroupBuys", req)', async () => {
    await listGroupBuys({ status: 'active' });
    expect(mockAdminCall).toHaveBeenCalledWith('listGroupBuys', { status: 'active' });
  });

  // —— 训练计划 ——
  it('upsertTrainingPlan → adminCall("upsertTrainingPlan", input)', async () => {
    const input = { key: 'k', name: 'n', weeks: 4, level: 'beginner' as const, goal: 'g', desc: 'd', weeklyMileage: '20', targetKm: 100 };
    await upsertTrainingPlan(input);
    expect(mockAdminCall).toHaveBeenCalledWith('upsertTrainingPlan', input);
  });

  it('listTrainingPlans → adminCall("listTrainingPlans", req)', async () => {
    await listTrainingPlans({ status: 'active' });
    expect(mockAdminCall).toHaveBeenCalledWith('listTrainingPlans', { status: 'active' });
  });

  // —— 订单 ——
  it('listOrders 缺省 → adminCall("listOrders", {})', async () => {
    await listOrders();
    expect(mockAdminCall).toHaveBeenCalledWith('listOrders', {});
  });

  it('listOrders 带 status 过滤', async () => {
    await listOrders({ status: 'paid', page: 1, pageSize: 20 });
    expect(mockAdminCall).toHaveBeenCalledWith('listOrders', {
      status: 'paid',
      page: 1,
      pageSize: 20,
    });
  });

  it('updateOrderStatus → adminCall("updateOrderStatus", req)', async () => {
    await updateOrderStatus({ orderId: 'o1', status: 'shipped' });
    expect(mockAdminCall).toHaveBeenCalledWith('updateOrderStatus', {
      orderId: 'o1',
      status: 'shipped',
    });
  });

  it('refundOrder 全额（不传 amountFen）→ adminCall("refundOrder", { orderId })', async () => {
    await refundOrder({ orderId: 'o1' });
    expect(mockAdminCall).toHaveBeenCalledWith('refundOrder', { orderId: 'o1' });
  });

  it('refundOrder 部分退款 → amountFen 透传', async () => {
    await refundOrder({ orderId: 'o1', amountFen: 500, reason: '用户申请' });
    expect(mockAdminCall).toHaveBeenCalledWith('refundOrder', {
      orderId: 'o1',
      amountFen: 500,
      reason: '用户申请',
    });
  });

  it('refundOrder 透传响应（断言类型 shape）', async () => {
    mockAdminCall.mockResolvedValue({
      orderId: 'o1',
      refundId: 'wx-refund-001',
      refundYuan: 5,
      status: 'SUCCESS',
      refundedBy: 'admin-openid-1',
    });
    const result = await refundOrder({ orderId: 'o1', amountFen: 500 });
    expect(result.refundId).toBe('wx-refund-001');
    expect(result.refundYuan).toBe(5);
    expect(result.status).toBe('SUCCESS');
  });

  // —— 用户 ——
  it('listUsers → adminCall("listUsers", req)', async () => {
    await listUsers({ page: 1, pageSize: 20 });
    expect(mockAdminCall).toHaveBeenCalledWith('listUsers', { page: 1, pageSize: 20 });
  });

  it('banUser → adminCall("banUser", req)', async () => {
    await banUser({ openid: 'o1', reason: '违规' });
    expect(mockAdminCall).toHaveBeenCalledWith('banUser', { openid: 'o1', reason: '违规' });
  });

  it('unbanUser → adminCall("unbanUser", req)', async () => {
    await unbanUser({ openid: 'o1' });
    expect(mockAdminCall).toHaveBeenCalledWith('unbanUser', { openid: 'o1' });
  });

  // —— 自提核销 ——
  it('confirmPickup → adminCall("confirmPickup", req)', async () => {
    await confirmPickup({ pickupCode: 'PICKUP-001' });
    expect(mockAdminCall).toHaveBeenCalledWith('confirmPickup', { pickupCode: 'PICKUP-001' });
  });

  // —— 评价 ——
  it('listReviews → adminCall("listReviews", req)', async () => {
    await listReviews({ page: 1, pageSize: 20 });
    expect(mockAdminCall).toHaveBeenCalledWith('listReviews', { page: 1, pageSize: 20 });
  });

  it('addReviewReply → adminCall("addReviewReply", req)', async () => {
    await addReviewReply({ reviewId: 'r1', content: '感谢反馈' });
    expect(mockAdminCall).toHaveBeenCalledWith('addReviewReply', {
      reviewId: 'r1',
      content: '感谢反馈',
    });
  });

  // —— 提现 ——
  it('listWithdrawals → adminCall("listWithdrawals", req)', async () => {
    await listWithdrawals({ status: 'pending' });
    expect(mockAdminCall).toHaveBeenCalledWith('listWithdrawals', { status: 'pending' });
  });

  it('approveWithdrawal → adminCall("approveWithdrawal", req)', async () => {
    await approveWithdrawal({ id: 'w1' });
    expect(mockAdminCall).toHaveBeenCalledWith('approveWithdrawal', { id: 'w1' });
  });

  it('rejectWithdrawal → adminCall("rejectWithdrawal", req)', async () => {
    await rejectWithdrawal({ id: 'w1', reason: '审核未通过' });
    expect(mockAdminCall).toHaveBeenCalledWith('rejectWithdrawal', {
      id: 'w1',
      reason: '审核未通过',
    });
  });

  // —— 审计 ——
  it('listAuditLogs → adminCall("listAuditLogs", req)', async () => {
    await listAuditLogs({ action: 'refundOrder', page: 1 });
    expect(mockAdminCall).toHaveBeenCalledWith('listAuditLogs', {
      action: 'refundOrder',
      page: 1,
    });
  });

  // —— 上传 ——
  it('listUploads → adminCall("listUploads", req)', async () => {
    await listUploads({ status: 'pending', page: 1 });
    expect(mockAdminCall).toHaveBeenCalledWith('listUploads', {
      status: 'pending',
      page: 1,
    });
  });

  it('retryParse → adminCall("retryParse", req)', async () => {
    await retryParse({ id: 'u1' });
    expect(mockAdminCall).toHaveBeenCalledWith('retryParse', { id: 'u1' });
  });

  // —— 配置 ——
  it('setConfig → adminCall("setConfig", req)', async () => {
    await setConfig({ id: 'feature_flags', value: { diet: false } });
    expect(mockAdminCall).toHaveBeenCalledWith('setConfig', {
      id: 'feature_flags',
      value: { diet: false },
    });
  });

  // —— 赛事 ——
  it('submitRaceResult → adminCall("submitRaceResult", req)', async () => {
    await submitRaceResult({ enrollmentId: 'e1', finishTimeSec: 3600, rank: 5 });
    expect(mockAdminCall).toHaveBeenCalledWith('submitRaceResult', {
      enrollmentId: 'e1',
      finishTimeSec: 3600,
      rank: 5,
    });
  });

  it('listEnrollmentsByContent → adminCall("listEnrollmentsByContent", { contentId })', async () => {
    await listEnrollmentsByContent('content-1');
    expect(mockAdminCall).toHaveBeenCalledWith('listEnrollmentsByContent', {
      contentId: 'content-1',
    });
  });

  // —— 邀请裂变 / 积分 ——
  it('adjustPoints → adminCall("adjustPoints", req)', async () => {
    await adjustPoints({ userId: 'u1', change: 100, reason: '补偿' });
    expect(mockAdminCall).toHaveBeenCalledWith('adjustPoints', {
      userId: 'u1',
      change: 100,
      reason: '补偿',
    });
  });

  it('grantMember → adminCall("grantMember", req)', async () => {
    await grantMember({ userId: 'u1', days: 30 });
    expect(mockAdminCall).toHaveBeenCalledWith('grantMember', { userId: 'u1', days: 30 });
  });

  it('listInviteStats → adminCall("listInviteStats", req)', async () => {
    await listInviteStats({ page: 1 });
    expect(mockAdminCall).toHaveBeenCalledWith('listInviteStats', { page: 1 });
  });

  // —— admin RBAC V0.2.8 ——
  it('listAdmins → adminCall("listAdmins")', async () => {
    await listAdmins();
    expect(mockAdminCall).toHaveBeenCalledWith('listAdmins');
  });

  it('createAdmin → adminCall("createAdmin", req)', async () => {
    await createAdmin({ username: 'a', password: 'p', role: 'admin', displayName: 'A' });
    expect(mockAdminCall).toHaveBeenCalledWith('createAdmin', {
      username: 'a',
      password: 'p',
      role: 'admin',
      displayName: 'A',
    });
  });

  it('updateAdmin → adminCall("updateAdmin", req)', async () => {
    await updateAdmin({ id: 'a1', role: 'operator', disabled: true });
    expect(mockAdminCall).toHaveBeenCalledWith('updateAdmin', {
      id: 'a1',
      role: 'operator',
      disabled: true,
    });
  });

  it('adminLoginLogs → adminCall("adminLoginLogs", req)', async () => {
    await adminLoginLogs({ page: 1, pageSize: 20 });
    expect(mockAdminCall).toHaveBeenCalledWith('adminLoginLogs', { page: 1, pageSize: 20 });
  });

  // —— 统计 ——
  it('stats → adminCall("stats")', async () => {
    await stats();
    expect(mockAdminCall).toHaveBeenCalledWith('stats');
  });

  it('statsByTimeRange → adminCall("statsByTimeRange", req)', async () => {
    await statsByTimeRange({ granularity: 'day' });
    expect(mockAdminCall).toHaveBeenCalledWith('statsByTimeRange', { granularity: 'day' });
  });

  // —— V0.3.4 dashboard 1 API 拉全 ——
  it('dashboard → adminCall("dashboard")', async () => {
    await dashboard();
    expect(mockAdminCall).toHaveBeenCalledWith('dashboard');
  });

  // —— V0.3.5 globalSearch ——
  it('globalSearch → adminCall("globalSearch", req)', async () => {
    await globalSearch({ query: 'test', limit: 10 });
    expect(mockAdminCall).toHaveBeenCalledWith('globalSearch', { query: 'test', limit: 10 });
  });

  // —— V0.2.65 提审 API（super-admin） ——
  it('getMpCategory → adminCall("getMpCategory")', async () => {
    await getMpCategory();
    expect(mockAdminCall).toHaveBeenCalledWith('getMpCategory');
  });

  it('uploadMpMedia → adminCall("uploadMpMedia", req)', async () => {
    await uploadMpMedia({ fileBase64: 'BASE64', filename: 'screen.png' });
    expect(mockAdminCall).toHaveBeenCalledWith('uploadMpMedia', {
      fileBase64: 'BASE64',
      filename: 'screen.png',
    });
  });

  it('submitMpAudit → adminCall("submitMpAudit", req)', async () => {
    await submitMpAudit({ itemList: [{ address: 'pages/index' }], versionDesc: 'V0.3.29' });
    expect(mockAdminCall).toHaveBeenCalledWith('submitMpAudit', {
      itemList: [{ address: 'pages/index' }],
      versionDesc: 'V0.3.29',
    });
  });

  // —— CSV 导出 ——
  it('exportOrders → adminCall("exportOrders", req)', async () => {
    await exportOrders({ format: 'csv', status: 'paid' });
    expect(mockAdminCall).toHaveBeenCalledWith('exportOrders', { format: 'csv', status: 'paid' });
  });

  it('exportUsers → adminCall("exportUsers", req)', async () => {
    await exportUsers({ format: 'csv', page: 1 });
    expect(mockAdminCall).toHaveBeenCalledWith('exportUsers', { format: 'csv', page: 1 });
  });

  it('exportSettlement → adminCall("exportSettlement", req)', async () => {
    await exportSettlement({ yearMonth: '2026-07', format: 'csv' });
    expect(mockAdminCall).toHaveBeenCalledWith('exportSettlement', {
      yearMonth: '2026-07',
      format: 'csv',
    });
  });

  // —— V0.2.37 listInterpret ——
  it('listInterpret → adminCall("listInterpret", req)', async () => {
    await listInterpret({ type: 'garmin_fit', page: 1 });
    expect(mockAdminCall).toHaveBeenCalledWith('listInterpret', {
      type: 'garmin_fit',
      page: 1,
    });
  });
});
