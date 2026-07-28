# qm-admin Web 前端整理任务执行计划

> 📍 计划路径：`.zcf/plan/current/qm-admin-整理.md`
> 创建时间：2026-07-28 20:28
> 工作流：/zcf:workflow（研究 → 构思 → 计划 → 执行 → 优化 → 评审）
> 模式：业务价值驱动（C 方案）+ 一口气推

---

## 📋 上下文与决策记录

### 用户决策（2026-07-28 20:24-20:28）

| 问题 | 答案 |
|---|---|
| 整理对象 | qm-admin Web 前端（独立 repo） |
| 整理深度 | 代码清理 + 测试加固 + 文档同步 + 架构重构（4 档全选） |
| 已知痛点 | 没有，从头盘点现状再决定 |
| 推进方案 | **方案 C（业务价值驱动，高 ROI）** |
| types 拆分 | **包含** — 一起拉齐 |
| CLAUDE.md | **必建**（项目级 AI 上下文 GAP-A） |
| 工作流节奏 | **一口气推**（计划一次性批准，6 批连续执行，末尾评审） |

### 方案 C 6 批（业务价值驱动）

```
C1 Dashboard.tsx 切 V0.3.4 dashboard 1 API 拉全  → 1 commit
C2 Admins.tsx 补 RBAC 4 action 闭环             → 2 commit
C3 顶部加 globalSearch 搜索栏（V0.3.5）          → 1 commit
C4 补 CSV 导出 3 action（exportOrders/Users/Settlement） → 1 commit
C5 tests/services + tests/pages 关键 page 测     → 2-3 commit
C6 架构重构（拆 services/types/抽 hooks/utils/components） + 文档同步（CLAUDE.md + index.json + README）→ 4 commit
```

**总预估：11-12 commit · 12 个文件新增/改动 · 零 schema 改动（后端不动）**

---

## 🎯 整体目标

把 qm-admin Web 前端从「独立 demo 级 admin」升级为「与后端 admin 44 action 全对齐 + 业务可立即见效 + AI 上下文完整 + 架构可持续演进」的运营管理后台。

### 量化指标（验收标准）

| 维度 | 当前 | 目标 |
|---|---|---|
| 与后端 44 action 对齐 | 31/44 (70.5%) | **44/44 (100%)** |
| service wrapper 函数 | 33 | **44+**（含全局辅助） |
| 单元测试 it() | 47 | **90+**（+ service 补测 + 关键 page 测） |
| service 文件数 | 1（admin.ts 191 行） | **6-8**（按业务域拆） |
| types 文件 | 1（admin.ts 497 行） | **2-3**（按业务域拆） |
| 共享层（components/hooks/utils） | 0 | **3 个目录 ≥6 文件** |
| CLAUDE.md | 0 字节 | **完整建档** |
| .claude/index.json | 缺失 | **完整建档** |
| README 同步到 V0.3.x | 滞后（V1） | **最新 V0.3.29 + qm-admin HEAD** |

---

## 📦 6 批原子步骤（详细）

### 【C1】Dashboard.tsx 切 V0.3.4 dashboard 1 API 拉全

**业务价值**：管理员登录后第一眼看到的页面，数据呈现立刻提升

**原子操作**：
1. **services/admin.ts** 新增 `dashboard(): Promise<DashboardResp>` wrapper
   - 逻辑概要：调 `adminCall('dashboard')` 解包 `{code, data}` → data 含 9 字段（totalUsers / activeUsers7d / totalOrders / totalRevenueFen / paidOrders / totalCheckins / checkins30d / failedAdminLogins30d / totalInterpret）
2. **types/admin.ts** 新增 `DashboardResp` interface（9 字段 + 类型对齐后端）
3. **Dashboard.tsx**（73 行）改：
   - 顶部 3 个统计卡（总用户/总订单/总营收）从 stats+statsByTimeRange 改为 dashboard 1 API
   - 删 stats/statsByTimeRange 调用（保留作为时间范围统计的次要图表）
   - 用 ProCard 9 字段网格布局
4. **预期结果**：Dashboard 加载 1 次请求替代多次合并，**9 字段真实展示**

**commit**：`feat(qm-admin): Dashboard 切 V0.3.4 dashboard 1 API 拉全 9 字段`

---

### 【C2】Admins.tsx 补 RBAC 4 action 闭环

**业务价值**：V0.2.8 RBAC 已上线但前端 Admins.tsx 209 行只有列表，缺增删改查 + 登录日志 → 闭环

**原子操作**：
1. **services/admin.ts** 新增 4 个 wrapper：
   - `createAdmin(req: { username, password, role, displayName? }): Promise<{ id }>`
   - `updateAdmin(req: { id, password?, role?, displayName? }): Promise<{ ok }>`
   - `disableAdmin(req: { id }): Promise<{ ok }>`
   - `adminLoginLogs(req: { page?, pageSize?, adminId? }): Promise<{ list, total }>`
2. **types/admin.ts** 新增 4 个 input/resp interface（对齐后端 schema）
3. **Admins.tsx** 改造：
   - 顶部加「+ 新建管理员」按钮 → Modal Form
   - 列表行加「编辑 / 停用」按钮 → Modal Form / 确认弹窗
   - 新增 Tab：「管理员列表 / 登录日志」
4. **预期结果**：admin RBAC 完整闭环 — 创建/编辑/停用/查看登录日志全可用

**commit 1**：`feat(qm-admin): Admins 补 createAdmin/updateAdmin/disableAdmin 4 RBAC action`
**commit 2**：`feat(qm-admin): Admins 登录日志 Tab + adminLoginLogs action`

---

### 【C3】顶部加 globalSearch 搜索栏（V0.3.5）

**业务价值**：5 表 LIKE 跨表搜索（user/feed/feedComment/interpretRecord/strengthSession），管理员快速定位任何资源

**原子操作**：
1. **services/admin.ts** 新增 `globalSearch(req: { query, limit? }): Promise<{ results: GlobalSearchResult[] }>`
   - 逻辑概要：调 `adminCall('globalSearch', { query, limit: 5 })`
2. **types/admin.ts** 新增 `GlobalSearchResult` interface（type: 'user'|'feed'|'comment'|'interpret'|'strength', id, title, snippet, link）
3. **src/components/GlobalSearch.tsx** 新建：
   - ProLayout header actions 区挂载（src/app.tsx layout.actionsRender 内插）
   - antd AutoComplete + Debounce 300ms + 后端 5 结果分组渲染
4. **预期结果**：管理员 Ctrl+K 或点击搜索栏，输入关键词即得 5 表分组结果

**commit**：`feat(qm-admin): 顶部 globalSearch 搜索栏（V0.3.5 5 表 LIKE 跨表）`

---

### 【C4】补 CSV 导出 3 action

**业务价值**：管理员导出订单/用户/结算单到 Excel（含 UTF8_BOM 中文兼容）— 已有 downloadAdminCsv helper 但 services wrapper 缺

**原子操作**：
1. **services/admin.ts** 新增 3 个 wrapper：
   - `exportOrders(req: OrderListReq & { format: 'csv' }): Promise<Blob>`
   - `exportUsers(req: UserListReq & { format: 'csv' }): Promise<Blob>`
   - `exportSettlement(req: { yearMonth: string }): Promise<Blob>`
   - 逻辑概要：调 adminCall 返 Blob，前端用 downloadAdminCsv helper 触发下载
2. **types/admin.ts** 不变（CSV 无类型）
3. **页面接入**：
   - Orders.tsx / Users.tsx 列表头加「导出 CSV」按钮
   - 新建 /finance 或在现有页加「结算单」Tab，yearMonth picker + 导出按钮
4. **预期结果**：管理员一键导出订单/用户/结算单到 CSV

**commit**：`feat(qm-admin): CSV 导出 3 action（exportOrders/Users/Settlement）+ 页面接入`

---

### 【C5】测试加固（services + 关键 page）

**业务价值**：funcs% 提升 + 错误分支覆盖

**原子操作**：
1. **tests/services/admin.test.ts**（10 测）扩到 **40 测**：
   - 新增 30 个 wrapper 的「正确 action name + payload 透传」测
   - 包括 C1-C4 新增的 8 个 wrapper（dashboard / createAdmin / updateAdmin / disableAdmin / adminLoginLogs / globalSearch / exportOrders / exportUsers / exportSettlement）
2. **tests/pages/Dashboard.test.tsx** 新建（5 测）：渲染 9 字段 + mock dashboard 成功/失败
3. **tests/pages/Admins.test.tsx** 新建（6 测）：列表 + 新建 Modal + 编辑 + 停用 + 登录日志 Tab
4. **tests/pages/globalSearch.test.tsx** 新建（3 测）：输入 → 渲染分组结果
5. **预期结果**：vitest 47→90+ 测，**覆盖率 funcs 从未知升到 > 60%**（baseline 待测）

**commit 1**：`test(qm-admin): services/admin 补齐 30 wrapper 单测（10→40）`
**commit 2**：`test(qm-admin): Dashboard/Admins/globalSearch 关键 page 渲染测（+14）`

---

### 【C6】架构重构 + 文档同步（最终批）

**业务价值**：拆大文件 + 抽共享层 + AI 上下文完整

**原子操作**：

#### C6.1 拆 services/admin.ts（191 行 → 6 文件）
- `services/admin/index.ts` — 重导出
- `services/admin/mall.ts` — upsertProduct/listProducts/listOrders/refundOrder/updateOrderStatus/upsertGroupBuy/listGroupBuys
- `services/admin/content.ts` — upsertContent/listContents/upsertTrainingPlan/listTrainingPlans/submitRaceResult/listEnrollmentsByContent
- `services/admin/user.ts` — listUsers/banUser/unbanUser/addReviewReply/listReviews
- `services/admin/finance.ts` — listWithdrawals/approveWithdrawal/rejectWithdrawal/confirmPickup/exportOrders/exportUsers/exportSettlement/adjustPoints/grantMember/listInviteStats
- `services/admin/system.ts` — listAdmins/createAdmin/updateAdmin/disableAdmin/adminLoginLogs/adminLogin/setConfig/listAuditLogs/listUploads/retryParse
- `services/admin/dashboard.ts` — stats/statsByTimeRange/dashboard/globalSearch/listInterpret

#### C6.2 拆 types/admin.ts（497 行 → 3 文件）
- `types/admin/common.ts` — AdminLoginResp / AuditLog / Pagination
- `types/admin/business.ts` — Product / Order / Content / GroupBuy / TrainingPlan / Review / Withdrawal / User
- `types/admin/finance.ts` — AdjustPoints / GrantMember / InviteStats / ExportReq
- `types/admin/index.ts` — 重导出

#### C6.3 抽共享层
- `src/hooks/useAdminForm.ts` — 通用 CRUD form hook（含 messageApi + Modal 确认）
- `src/hooks/useAdminTable.ts` — 通用 ProTable 适配（adminTableRequest 包装）
- `src/utils/csv.ts` — downloadAdminCsv helper 移入（已有 inline 实现）
- `src/utils/date.ts` — dayjs 常用格式封装
- `src/components/AdminCard.tsx` — ProCard 9 字段网格组件
- `src/components/ConfirmModal.tsx` — 通用确认弹窗（替换各 page 的 Modal.confirm）

#### C6.4 文档同步
- `CLAUDE.md` 新建（项目根）— 350+ 行结构化（仿 QM-WX 根 CLAUDE.md）
  - 模块职责 / 技术栈 / 目录结构 / 路由清单 / service 矩阵 / 测试现状 / 与 QM-WX 后端对齐矩阵 / 变更记录 / GAP 状态
- `.claude/index.json` 新建（机读 phaseA/B/C）
- `README.md` 更新（V1 → V0.3.x 现状 + 19 page 全列 + GitHub 链接修复 `your-org` → `changzhi777`）

**预期结果**：
- services 从 1 文件 → 8 文件（按业务域清晰分组）
- types 从 1 文件 497 行 → 4 文件
- 共享层 0 → 6 文件（hooks ×2 + utils ×2 + components ×2）
- 文档：CLAUDE.md 0 → 350+ 行，index.json 新建，README 同步最新

**commit 1**：`refactor(qm-admin): 拆 services/admin.ts 为 7 业务域文件 + types/admin.ts 拆 3 文件`
**commit 2**：`refactor(qm-admin): 抽 hooks/{useAdminForm, useAdminTable} + utils/{csv, date} + components/{AdminCard, ConfirmModal}`
**commit 3**：`docs(qm-admin): 新建 CLAUDE.md（项目级 AI 上下文）+ .claude/index.json`
**commit 4**：`docs(qm-admin): README 更新到 V0.3.x + GitHub 链接修正 + 19 page 全列`

---

## 📊 总览表

| 批 | commit 数 | 改动文件 | 新增文件 | 风险 |
|---|:-:|---:|---:|:-:|
| C1 | 1 | Dashboard.tsx | services wrapper | 低 |
| C2 | 2 | Admins.tsx | 4 wrapper + types | 中 |
| C3 | 1 | app.tsx layout | GlobalSearch.tsx + wrapper | 低 |
| C4 | 1 | Orders/Users/Withdrawals | 3 wrapper | 低 |
| C5 | 2 | tests/ | 3 page test | 低 |
| C6 | 4 | 多文件 | CLAUDE.md + index.json + 6 共享 + 6 service | 中 |
| **合计** | **11** | **~20** | **~15** | **可控** |

---

## ⚠️ 风险与依赖

### 依赖
- **后端不动**：纯前端整理（仅消费既有 44 action）
- **后端 V0.3.x 已部署**（init #22 收官，生产 healthy）
- **本地无后端运行**：完整测需 `cd /Users/mac/Documents/Claude/Projects/QM-WX/apps/server && pnpm dev`（dev proxy 配 127.0.0.1:3000）

### 风险
1. **types 拆分**涉及所有 19 page 的 import 路径批量改 → 用 TypeScript path alias + 重导出兜底
2. **services 拆分**涉及所有 page 的 import 路径批量改 → 同上
3. **架构重构（C6）跨 4 commit 改动量大** → 每 commit 后 typecheck 必须过 + vitest 必须过
4. **CLAUDE.md 创建**参考 QM-WX 根 CLAUDE.md 范式，但需独立适配 qm-admin（不是 monorepo 子目录）
5. **dist/ 已 12 天没 build** → 最后应跑一次 `npm run build` 验证

### 验证策略（每 commit 后）
- `npm run typecheck`（tsc --noEmit，必须 exit 0）
- `npm test`（vitest run，所有测试必须 pass）
- 关键批（C2/C3/C5/C6）后请求用户反馈

---

## 🎯 执行顺序（一口气推）

```
[C1] Dashboard → typecheck → test → commit
[C2-1] Admins 4 action → typecheck → test → commit
[C2-2] Admins 登录日志 → typecheck → test → commit
[C3] GlobalSearch → typecheck → test → commit
[C4] CSV 导出 → typecheck → test → commit
[C5-1] services 测补齐 → typecheck → test → commit
[C5-2] page 测补齐 → typecheck → test → commit
[C6-1] 拆 services + types → typecheck → test → commit
[C6-2] 抽 hooks/utils/components → typecheck → test → commit
[C6-3] CLAUDE.md + index.json → 手工校对 → commit
[C6-4] README 更新 → 校对 → commit
[最终] npm run build 验证 → 阶段 5 优化 → 阶段 6 评审
```

**总 commit 数：11 · 每次 typecheck+test 必过 · 中途不打断用户（按用户决策）**

---

## ✅ 用户确认

- [ ] 用户已审阅本计划
- [ ] 用户批准执行
- [ ] 工作流进入阶段 4 执行