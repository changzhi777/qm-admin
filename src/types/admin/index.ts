/**
 * admin module 接口类型（重导出）
 * V0.3.29 GAP-B 拆分为 common / business / finance 三文件，按业务域清晰分组
 *
 * ⚠️ 向后兼容：所有 page 仍可 `import type { ... } from '@/types/admin'`，
 *    旧路径通过本 index 重导出保证零 breaking change。
 *
 * 新代码建议按业务域精确 import：
 *   import type { DashboardResp } from '@/types/admin/business';
 *   import type { AdminRole } from '@/types/admin/common';
 *   import type { WithdrawalStatus } from '@/types/admin/finance';
 */

export * from './common';
export * from './business';
export * from './finance';