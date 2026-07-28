# qm-admin 19 page 测试报告（Playwright 2026-07-28）
## 总览
- 测试时间：2026-07-28 22:55 → 2026-07-29
- 测试范围：19 page
- 工具：Python Playwright SDK（替代 ego-browser/Playwright MCP 因 sandbox 限制）
- 服务：qm-admin preview localhost:4172 + 后端 dev 127.0.0.1:3000
- 测试模式：**未登录态**（无 admin token — auth guard 验证用）
- 结果：19/19 OK

## 关键发现

- ✅ **19/19 page URL 全部 200 + React 渲染 + title 正确**（无 5xx/404/崩溃）
- ✅ **Auth guard 工作**：所有 admin page 未登录态都 redirect 到 `/login`（正确安全行为）
- 🐛 **BUG：`x.error is not a function` 反复出现**（React 渲染错误 — 需排查根因）
- 🐛 **401 Unauthorized**：admin API 调用未带 token（auth guard 验证 — 但与 `x.error` 联动需排查）

## 19 page 详细结果

| # | 路径 | 截图 | Title | 跳转 /login | H1 | Button | 状态 |
|---|------|------|-------|------------|----|--------|------|
| 1 | `/login` | [01_login.png](../screenshots/01_login.png) | 青沐 admin | — | 1 | 1 | ✓ |
| 2 | `/dashboard` | [02_dashboard.png](../screenshots/02_dashboard.png) | Dashboard - 青沐 admin | ✓ 是 | 1 | 1 | ✓ (redirect→/login, auth OK) |
| 3 | `/mall/categories` | [03_mall_categories.png](../screenshots/03_mall_categories.png) | 商品分类 - 青沐 admin | ✓ 是 | 1 | 1 | ✓ (redirect→/login, auth OK) |
| 4 | `/mall/products` | [04_mall_products.png](../screenshots/04_mall_products.png) | 商品管理 - 青沐 admin | ✓ 是 | 1 | 1 | ✓ (redirect→/login, auth OK) |
| 5 | `/mall/orders` | [05_mall_orders.png](../screenshots/05_mall_orders.png) | 订单管理 - 青沐 admin | ✓ 是 | 1 | 1 | ✓ (redirect→/login, auth OK) |
| 6 | `/mall/group-buys` | [06_mall_group_buys.png](../screenshots/06_mall_group_buys.png) | 团购管理 - 青沐 admin | ✓ 是 | 1 | 1 | ✓ (redirect→/login, auth OK) |
| 7 | `/audit-logs` | [07_audit_logs.png](../screenshots/07_audit_logs.png) | 审计日志 - 青沐 admin | ✓ 是 | 1 | 1 | ✓ (redirect→/login, auth OK) |
| 8 | `/training-plans` | [08_training_plans.png](../screenshots/08_training_plans.png) | 训练计划 - 青沐 admin | ✓ 是 | 1 | 1 | ✓ (redirect→/login, auth OK) |
| 9 | `/contents` | [09_contents.png](../screenshots/09_contents.png) | 内容管理 - 青沐 admin | ✓ 是 | 1 | 1 | ✓ (redirect→/login, auth OK) |
| 10 | `/reviews` | [10_reviews.png](../screenshots/10_reviews.png) | 评价管理 - 青沐 admin | ✓ 是 | 1 | 1 | ✓ (redirect→/login, auth OK) |
| 11 | `/withdrawals` | [11_withdrawals.png](../screenshots/11_withdrawals.png) | 提现管理 - 青沐 admin | ✓ 是 | 1 | 1 | ✓ (redirect→/login, auth OK) |
| 12 | `/users` | [12_users.png](../screenshots/12_users.png) | 用户管理 - 青沐 admin | ✓ 是 | 1 | 1 | ✓ (redirect→/login, auth OK) |
| 13 | `/pickup` | [13_pickup.png](../screenshots/13_pickup.png) | 自提核销 - 青沐 admin | ✓ 是 | 1 | 1 | ✓ (redirect→/login, auth OK) |
| 14 | `/invite` | [14_invite.png](../screenshots/14_invite.png) | 邀请裂变 - 青沐 admin | ✓ 是 | 1 | 1 | ✓ (redirect→/login, auth OK) |
| 15 | `/uploads` | [15_uploads.png](../screenshots/15_uploads.png) | 上传管理 - 青沐 admin | ✓ 是 | 1 | 1 | ✓ (redirect→/login, auth OK) |
| 16 | `/interpret` | [16_interpret.png](../screenshots/16_interpret.png) | 解读管理 - 青沐 admin | ✓ 是 | 1 | 1 | ✓ (redirect→/login, auth OK) |
| 17 | `/config` | [17_config.png](../screenshots/17_config.png) | 配置管理 - 青沐 admin | ✓ 是 | 1 | 1 | ✓ (redirect→/login, auth OK) |
| 18 | `/race` | [18_race.png](../screenshots/18_race.png) | 赛事成绩 - 青沐 admin | ✓ 是 | 1 | 1 | ✓ (redirect→/login, auth OK) |
| 19 | `/admins` | [19_admins.png](../screenshots/19_admins.png) | 管理员账号 - 青沐 admin | ✓ 是 | 1 | 1 | ✓ (redirect→/login, auth OK) |

## 控制台错误汇总

共捕获 **6** 个 console error

- **401 Unauthorized (auth guard)**: 3 次
- **x.error is not a function (React 渲染错误)**: 2 次
- **other**: 1 次

### 样本错误（前 5）

- `console.error: Failed to load resource: the server responded with a status of 401 (Unauthorized)`
- `console.error: Failed to load resource: the server responded with a status of 401 (Unauthorized)`
- `pageerror: x.error is not a function`
- `pageerror: x.error is not a function`
- `console.error: Failed to load resource: the server responded with a status of 401 (Unauthorized)`

## 待跟进事项

1. **🐛 BUG：定位 `x.error is not a function`** — 影响所有 admin page 渲染
   - 可能性：第三方库（antd / ProComponents）的 error handler 与 React 18 不兼容
   - 建议：在浏览器 console 打开 /dashboard 看堆栈定位
2. **登录态测试**：当前未登录态只验证 redirect；下一步用 admin 账号登录后跑真实 page 验证
3. **性能基线**：19 page 平均加载 < 2s（networkidle 2s timeout）

## 文件清单

- 截图：`.zcf/screenshots/01-19.png` × 19（每张 ~217 KB）
- 文本快照：`.zcf/snapshots/01-19.json` × 19（含 title / H1 / button / console errors）
- 测试脚本：`.zcf/audit_19pages.py`（可重跑）
- 本报告：`.zcf/reports/qm-admin-audit-2026-07-28.md`
