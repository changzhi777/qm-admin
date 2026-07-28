# qm-admin GAP-I 登录态测试报告（V0.3.32）
## 总览
- 测试时间：2026-07-29
- 工具：Python Playwright SDK
- 登录方式：adminLogin API 注入 token 到 localStorage（绕过 UI 流程）
- 账号：admin / qmtest_admin_2026（V0.2.8 RBAC admin role）
- 测试范围：核心 6 page
- 结果：6/6 真实渲染 OK
- 总 page_error：0（修复 V0.3.32 后应为 0）
- 总 console_error：2

## 关键发现

- ✅ **登录态下 6/6 page 真实渲染**（不再是 /login redirect）
- 🐛 page_error 总数：0
- ⚠️ console_error 总数：2（需分析是否仍为 auth/401 类）

## 6 page 详细

| # | 路径 | 截图 | Title | H1 | Button | page_err | console_err | 状态 |
|---|------|------|-------|----|--------|----------|-------------|------|
| 1 | `/dashboard` | [loggedin_01_dashboard.png](../screenshots/loggedin_01_dashboard.png) | Dashboard - 青沐 admin | 1 | 0 | 0 | 1 | ✓ rendered |
| 2 | `/admins` | [loggedin_02_admins.png](../screenshots/loggedin_02_admins.png) | 管理员账号 - 青沐 admin | 1 | 2 | 0 | 1 | ✓ rendered |
| 3 | `/users` | [loggedin_03_users.png](../screenshots/loggedin_03_users.png) | 用户管理 - 青沐 admin | 1 | 5 | 0 | 0 | ✓ rendered |
| 4 | `/withdrawals` | [loggedin_04_withdrawals.png](../screenshots/loggedin_04_withdrawals.png) | 提现管理 - 青沐 admin | 1 | 3 | 0 | 0 | ✓ rendered |
| 5 | `/mall/orders` | [loggedin_05_mall_orders.png](../screenshots/loggedin_05_mall_orders.png) | 订单管理 - 青沐 admin | 1 | 3 | 0 | 0 | ✓ rendered |
| 6 | `/mall/products` | [loggedin_06_mall_products.png](../screenshots/loggedin_06_mall_products.png) | 商品管理 - 青沐 admin | 1 | 15 | 0 | 0 | ✓ rendered |

## 文件清单

- 截图：`.zcf/screenshots/loggedin_01-06.png` × 6（已 gitignore）
- 快照：`.zcf/snapshots/loggedin_01-06.json` × 6（已 gitignore）
- 测试脚本：`.zcf/audit_logged_in.py`
- 本报告：`.zcf/reports/qm-admin-logged-in-audit-2026-07-29.md`
