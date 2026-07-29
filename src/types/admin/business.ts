/**
 * admin module — 业务类型（商品/订单/内容/团购/训练/用户/核销/评价/赛事/上传/统计/搜索/提审/解读）
 * V0.3.29 GAP-B 拆出
 *
 * 与后端 apps/server/src/modules/admin/admin.{schema,service}.ts 对齐
 */

// ===== 商品 =====
export interface ProductUpsertInput {
  id?: string;
  name: string;
  category: string;
  brand?: string;
  price: number;
  originalPrice?: number;
  memberDiscount?: number;
  images?: string[];
  description?: string;
  stock?: number;
  status?: 'on' | 'off';
  sort?: number;
}

export interface ProductUpsertResp {
  id: string;
}

export interface ProductListReq {
  page?: number;
  pageSize?: number;
  status?: 'on' | 'off';
  category?: string;
}
export interface ProductListItem {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  price: string;
  originalPrice: string | null;
  stock: number;
  status: 'on' | 'off';
  createdAt: string;
}
export interface ProductListResp {
  list: ProductListItem[];
  total: number;
  page: number;
  pageSize: number;
}

// ===== 订单 =====
// 注意：后端 Prisma Order.status 实际支持 'refunded' / 'refunding'
export type OrderStatus =
  | 'pending_pay'
  | 'paid'
  | 'shipped'
  | 'done'
  | 'cancelled'
  | 'refunded'
  | 'refunding';

export interface OrderListReq {
  status?: OrderStatus;
  page?: number;
  pageSize?: number;
}

export interface OrderListItem {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: string;
  payAmount: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    nickname: string | null;
    phone: string | null;
  };
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    price: string;
  }>;
}

export interface OrderListResp {
  list: OrderListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface OrderStatusUpdateReq {
  orderId: string;
  status: OrderStatus;
}

export interface OrderStatusUpdateResp {
  id: string;
  status: OrderStatus;
  updatedAt: string;
}

/** Phase 4.1 退款请求（admin 调） */
export interface OrderRefundReq {
  orderId: string;
  /** 退款金额（分）— 缺省 = order.payAmount 全额 */
  amountFen?: number;
  reason?: string;
}

export interface OrderRefundResp {
  orderId: string;
  refundId: string;
  refundYuan: number;
  /** 微信侧返回：SUCCESS / PROCESSING */
  status: string;
  refundedBy: string;
}

// ===== 内容 =====
export type ContentType = 'marathon' | 'hotel' | 'scenic' | 'food' | 'rural';
export type ContentActionType = 'enroll' | 'book' | 'link' | 'none';
export type ContentStatus = 'on' | 'off';

export interface ContentUpsertInput {
  id?: string;
  type: ContentType;
  title: string;
  cover?: string;
  summary?: string;
  detail?: unknown;
  price?: number;
  fee?: number;
  date?: string;
  validRange?: unknown;
  location?: string;
  tags?: string[];
  actionType?: ContentActionType;
  status?: ContentStatus;
  sort?: number;
}

export interface ContentUpsertResp {
  id: string;
}

export interface ContentListItem {
  id: string;
  type: ContentType;
  title: string;
  cover: string | null;
  summary: string | null;
  price: string | null;
  fee: string | null;
  date: string | null;
  location: string | null;
  tags: string[];
  actionType: ContentActionType;
  status: 'on' | 'off';
  sort: number;
  createdAt: string;
  updatedAt: string;
}
export interface ContentListReq {
  type?: ContentType;
  status?: 'on' | 'off';
  page?: number;
  pageSize?: number;
}
export interface ContentListResp {
  list: ContentListItem[];
  total: number;
  page: number;
  pageSize: number;
}

// ===== 团购（V0.1.38 admin）=====
export interface GroupBuyUpsertInput {
  id?: string;
  productId: string;
  groupPrice: number;
  targetCount: number;
  endDate?: string; // ISO
}

export interface GroupBuyUpsertResp {
  id: string;
}

export type GroupBuyStatus = 'active' | 'reached';

export interface GroupBuyListReq {
  status?: GroupBuyStatus;
  page?: number;
  pageSize?: number;
}

export interface GroupBuyListItem {
  id: string;
  productId: string;
  groupPrice: string;
  targetCount: number;
  currentCount: number;
  status: GroupBuyStatus;
  endDate: string | null;
  createdAt: string;
  product: { id: string; name: string; price: string };
}

export interface GroupBuyListResp {
  list: GroupBuyListItem[];
  total: number;
  page: number;
  pageSize: number;
}

// ===== 用户管理 =====
export interface UserListItem {
  id: string;
  openid: string;
  nickname: string | null;
  phone: string | null;
  points: number;
  isBanned: boolean;
  bannedReason: string | null;
  createdAt: string;
}
export interface UserListReq {
  page?: number;
  pageSize?: number;
}
export interface UserListResp {
  list: UserListItem[];
  total: number;
  page: number;
  pageSize: number;
}
export interface UserBanReq {
  openid: string;
  reason?: string;
}
export interface UserUnbanReq {
  openid: string;
}

// ===== 自提核销 =====
export interface PickupConfirmReq {
  pickupCode: string;
}
export interface PickupConfirmResp {
  ok: boolean;
}

// ===== 训练计划管理 =====
export type TrainingPlanLevel = 'beginner' | 'intermediate' | 'challenge' | 'extreme';

export interface TrainingPlanUpsertInput {
  id?: string;
  key: string;
  name: string;
  weeks: number;
  level: TrainingPlanLevel;
  goal: string;
  desc: string;
  weeklyMileage: string;
  targetKm: number;
  status?: 'active' | 'archived';
}

export interface TrainingPlanListItem {
  id: string;
  key: string;
  name: string;
  weeks: number;
  level: TrainingPlanLevel;
  goal: string;
  desc: string;
  weeklyMileage: string;
  targetKm: number;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface TrainingPlanListReq {
  status?: 'active' | 'archived';
}

export interface TrainingPlanListResp {
  list: TrainingPlanListItem[];
}

// ===== 评价管理 =====
export interface ReviewListItem {
  id: string;
  userId: string;
  productId: string;
  orderId: string;
  rating: number;
  content: string | null;
  images: string[];
  replyContent: string | null;
  repliedAt: string | null;
  createdAt: string;
  user: { id: string; nickname: string | null; avatarUrl: string | null };
  product: { id: string; name: string };
}
export interface ReviewListReq {
  page?: number;
  pageSize?: number;
}
export interface ReviewListResp {
  list: ReviewListItem[];
  total: number;
  page: number;
  pageSize: number;
}
export interface ReviewReplyReq {
  reviewId: string;
  content: string;
}

// ===== 审计日志 =====
export interface AuditLogListItem {
  id: string;
  actorOpenid: string;
  action: string;
  target: string;
  payload: unknown;
  ip: string;
  createdAt: string;
}
export interface AuditLogListReq {
  action?: string;
  actorOpenid?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}
export interface AuditLogListResp {
  list: AuditLogListItem[];
  total: number;
  page: number;
  pageSize: number;
}

// ===== 统计（V0.1.124 Dashboard）=====
export interface StatsResp {
  userCount: number;
  orderCount: number;
  paidRevenue: number;
  checkinCount: number;
}

/** V0.3.4 admin MIS dashboard — 1 API 拉全 9 字段
 * 与后端 apps/server/src/modules/admin/admin.service.ts AdminDashboardData 对齐 */
export interface DashboardResp {
  totalUsers: number;
  activeUsers7d: number;
  totalOrders: number;
  totalRevenueFen: number; // CNY 分
  paidOrders: number;
  totalCheckins: number;
  checkins30d: number;
  failedAdminLogins30d: number;
  totalInterpret: number;
  // V0.3.34 A5：30 天每日趋势
  dailyTrend?: Array<{
    date: string; // YYYY-MM-DD
    orders: number;
    newUsers: number;
    checkins: number;
  }>;
}

// ===== 时段统计（Dashboard 增强）=====
export interface StatsByTimeRangeReq {
  startDate?: string;
  endDate?: string;
  granularity?: 'day' | 'week' | 'month';
}
export interface StatsByTimeRangeItem {
  bucket: string;
  revenue: string;
  orderCount: number;
  userCount: number;
}
export interface StatsByTimeRangeResp {
  list: StatsByTimeRangeItem[];
}

// ===== 上传管理（V0.1.150）=====
export type UploadStatus = 'pending' | 'parsing' | 'parsed' | 'failed';
export interface UploadListItem {
  id: string;
  userId: string;
  type: string;
  cosUrl: string;
  status: UploadStatus;
  mime: string | null;
  size: number;
  errorMsg: string | null;
  createdAt: string;
  user: { id: string; nickname: string | null; phone: string | null };
}

export interface UploadListReq {
  status?: UploadStatus;
  page?: number;
  pageSize?: number;
}
export interface UploadListResp {
  list: UploadListItem[];
  total: number;
  page: number;
  pageSize: number;
}

// ===== 配置管理 =====
export interface SetConfigReq {
  id: string;
  value: unknown;
}

// ===== 赛事成绩（V0.1.134）=====
export interface RaceResultReq {
  enrollmentId: string;
  finishTimeSec: number;
  rank?: number;
  bibNumber?: string;
}
export interface EnrollmentListItem {
  id: string;
  userId: string;
  contentId: string;
  status: string;
  createdAt: string;
  user: { id: string; nickname: string | null; phone: string | null };
  raceResult: {
    id: string;
    finishTimeSec: number;
    rank: number | null;
    bibNumber: string | null;
  } | null;
}
export interface EnrollmentsResp {
  list: EnrollmentListItem[];
}

// ===== V0.3.5 全局搜索 =====
export interface GlobalSearchResultItem {
  type: 'user' | 'feed' | 'comment' | 'interpret' | 'strength';
  id: string;
  title: string;
  snippet: string;
  link?: string;
}
export interface GlobalSearchReq {
  query: string;
  limit?: number;
}
export interface GlobalSearchResp {
  results: GlobalSearchResultItem[];
}

// ===== V0.2.65 提审相关 =====
export interface MpCategoryItem {
  id: number;
  name: string;
  /** 一级类目 */
  firstClass?: string;
  /** 二级类目 */
  secondClass?: string;
}
export interface GetMpCategoryResp {
  categories: MpCategoryItem[];
}

export interface UploadMpMediaReq {
  fileBase64: string;
  filename?: string;
  mime?: string;
}
export interface UploadMpMediaResp {
  mediaId: string;
  type: string;
  url?: string;
}

export interface SubmitMpAuditReq {
  itemList: unknown[];
  previewInfo?: unknown;
  versionDesc?: string;
  feedbackInfo?: string;
  privacyInfo?: unknown;
}
export interface SubmitMpAuditResp {
  auditId: string;
}

// ===== V0.2.37 interpret 解读记录 =====
export interface InterpretListItem {
  id: string;
  userId: string;
  nickname: string | null;
  type: string; // garmin_fit | garmin_zip | medical | screenshot
  inputKey: string;
  result: string;
  model: string;
  inputTokens: number | null;
  outputTokens: number | null;
  createdAt: string;
}
export interface InterpretListReq {
  type?: string;
  userId?: string;
  page?: number;
  pageSize?: number;
}
export interface InterpretListResp {
  list: InterpretListItem[];
  total: number;
  page: number;
  pageSize: number;
}
// ===== V0.3.34 A2：admin.users 详情页（5 维聚合）=====
export interface UserDetailResp {
  user: {
    id: string;
    openid: string;
    nickname: string | null;
    phone: string | null;
    points: number;
    isBanned: boolean;
    bannedReason: string | null;
    memberExpireAt: string | null;
    createdAt: string;
  };
  training: {
    checkinCount30d: number;
    distanceKm30d: number;
    strengthSessions30d: number;
  };
  orders: {
    total: number;
    paid: number;
    totalRevenueFen: number;
  };
  points: {
    current: number;
    recentTransactions: Array<{
      id: string;
      change: number;
      type: string;
      reason: string | null;
      createdAt: string;
    }>;
  };
  auditLogs: Array<{
    id: string;
    action: string;
    target: string;
    createdAt: string;
  }>;
}
