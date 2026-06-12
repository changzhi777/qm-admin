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

export type OrderStatus = 'pending_pay' | 'paid' | 'shipped' | 'done' | 'cancelled';

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
