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

export type ContentType = 'article' | 'marathon' | 'event' | 'course';
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
