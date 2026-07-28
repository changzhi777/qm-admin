/**
 * admin services — 重导出（向后兼容）
 * V0.3.29 GAP-B 拆分为 mall/content/user/finance/system/rbac/dashboard 七业务域
 *
 * ⚠️ 向后兼容：所有 page 仍可 `import { ... } from '@/services/admin'`，
 *    旧路径通过本 index 重导出保证零 breaking change。
 *
 * 新代码建议按业务域精确 import：
 *   import { listOrders } from '@/services/admin/mall';
 *   import { createAdmin } from '@/services/admin/rbac';
 *   import { dashboard } from '@/services/admin/dashboard';
 */

export * from './mall';
export * from './content';
export * from './user';
export * from './finance';
export * from './system';
export * from './rbac';
export * from './dashboard';