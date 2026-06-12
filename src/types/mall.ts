/**
 * mall module 接口类型（与 apps/server 的 mall.routes.ts 对齐）
 */

export interface Category {
  id: string;
  name: string;
  sort: number;
  status: 'on' | 'off';
}

export interface CategoryListResp {
  list: Category[];
}

/** —— 商品 —— */

export interface ProductListReq {
  category?: string;
  page?: number;
  pageSize?: number;
}

export interface ProductSummary {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  price: string;
  originalPrice: string | null;
  memberDiscount: number | null;
  images: string[];
  stock: number;
  status: 'on' | 'off';
  sort: number;
  createdAt: string;
}

export interface ProductListResp {
  list: ProductSummary[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ProductDetailReq {
  id: string;
}

export interface ProductDetail extends ProductSummary {
  description: string | null;
}

export interface ProductDetailResp {
  product: ProductDetail;
}
