/**
 * admin module 接口类型（与 apps/server 的 admin.routes.ts 对齐）
 */

/** —— 商品 —— */

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

/** —— 订单 —— */
// 注意：后端 Prisma Order.status 实际支持 'refunded' / 'refunding'，admin 列表也可能返回
// 这里保留前端常用 5 态，'refunded' 单独提
export type OrderStatus = 'pending_pay' | 'paid' | 'shipped' | 'done' | 'cancelled' | 'refunded' | 'refunding';

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

/** —— 内容 —— */

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

/** —— admin 白名单 —— */

export interface AdminListResp {
  openids: string[];
}

/** —— 团购（V0.1.38 admin）—— */

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

/** —— 评价管理（V0.1.122 qm-admin）—— */
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

/** —— 提现管理（V0.1.122）—— */
export type WithdrawalStatus = 'pending' | 'approved' | 'rejected';
export interface WithdrawalListItem {
  id: string;
  userId: string;
  amount: string;
  status: WithdrawalStatus;
  reason: string | null;
  processedBy: string | null;
  processedAt: string | null;
  createdAt: string;
  user: { id: string; nickname: string | null };
}
export interface WithdrawalListReq {
  status?: WithdrawalStatus;
  page?: number;
  pageSize?: number;
}
export interface WithdrawalListResp {
  list: WithdrawalListItem[];
  total: number;
  page: number;
  pageSize: number;
}
export interface WithdrawalActionReq {
  id: string;
  reason?: string;
}

/** —— 用户管理（V0.1.122）—— */
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

/** —— 自提核销（V0.1.122）—— */
export interface PickupConfirmReq {
  pickupCode: string;
}
export interface PickupConfirmResp {
  ok: boolean;
}

/** —— 训练计划管理（V0.1.123）—— */
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

/** —— 审计日志（V0.1.124）—— */
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

/** —— 统计（V0.1.124 Dashboard）—— */
export interface StatsResp {
  userCount: number;
  orderCount: number;
  paidRevenue: number;
  checkinCount: number;
}

/** —— V0.2.6 邀请裂变管理 —— */
export interface AdjustPointsReq {
  userId: string;
  change: number; // ± 正加负扣
  reason?: string;
}
export interface AdjustPointsResp {
  ok: boolean;
  userId: string;
  points: number;
}
export interface GrantMemberReq {
  userId: string;
  days: number;
}
export interface GrantMemberResp {
  ok: boolean;
  userId: string;
  memberExpireAt: string | null;
}
export interface InviteStatsReq {
  page?: number;
  pageSize?: number;
}
export interface InviteStatsItem {
  id: string;
  nickname: string | null;
  avatarUrl: string | null;
  inviteCode: string | null;
  distributorLevel: string;
  inviteCount: number;
}
export interface InviteStatsResp {
  list: InviteStatsItem[];
  total: number;
  page: number;
  pageSize: number;
}

/** —— V0.1.150 上传管理 —— */
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

/** —— 配置管理（setConfig）—— */
export interface SetConfigReq {
  id: string;
  value: unknown;
}

/** —— V0.1.134 赛事成绩 —— */
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
  raceResult: { id: string; finishTimeSec: number; rank: number | null; bibNumber: string | null } | null;
}
export interface EnrollmentsResp {
  list: EnrollmentListItem[];
}

/** —— 时段统计（Dashboard 增强）—— */
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

/** V0.2.8 管理员账号（listAdmins 返）*/
export interface AdminListItem {
  id: string;
  username: string;
  role: string;
  nickname: string | null;
  lastLoginAt: string | null;
  disabled: boolean;
  createdAt: string;
}
