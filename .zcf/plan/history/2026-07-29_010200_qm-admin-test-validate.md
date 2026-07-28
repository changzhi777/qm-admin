# qm-admin 测试和验证（ego-browser + 19 page）

> 📍 计划路径：`.zcf/plan/current/qm-admin-test-validate.md`
> 创建时间：2026-07-28 22:55
> 工作流：/zcf:workflow（研究 → 构思 → 计划 → 执行 → 优化 → 评审）

---

## 📋 上下文与决策记录

### 用户决策（2026-07-28 22:50-22:55）

| 问题 | 答案 |
|---|---|
| 测试范围 | **全 19 page**（耗时） |
| 驱动工具 | **ego-browser skill**（Node.js 浏览器自动化 runtime）|
| 报告交付 | **截图集 + 文本断言** |
| 选定方案 | **方案 A（ego-browser 纯设计审查 + 截图）** |

### ego-browser 实际能力（来自 skill 内容）

ego-browser = Node.js 浏览器自动化 runtime：
- `snapshotText()` — DOM 文本快照 + ref map
- `captureScreenshot()` — 全屏截图
- `click / fillInput / typeText` — 交互
- `openOrReuseTab(url)` — 导航
- 通过 `ego-browser nodejs <<'EOF' ... EOF'` heredoc 调用

**注意**：ego-browser 不是 Playwright MCP，但功能重叠，都能做浏览器自动化。ego-browser 是 Bash tool 调用，Playwright 是直接 MCP tool 调用。

### qm-admin 19 page 清单（来自 config/config.ts routes）

```
1.  /login                                  Login.tsx
2.  /dashboard                              Dashboard.tsx（V0.3.4 9 字段重写）
3.  /mall/categories                        mall/Categories.tsx
4.  /mall/products                          mall/Products.tsx
5.  /mall/orders                            mall/Orders.tsx
6.  /mall/group-buys                        mall/GroupBuys.tsx
7.  /audit-logs                             AuditLogs.tsx
8.  /training-plans                         TrainingPlans.tsx
9.  /contents                               Contents.tsx
10. /reviews                                Reviews.tsx
11. /withdrawals                            Withdrawals.tsx
12. /users                                  Users.tsx
13. /pickup                                 Pickup.tsx
14. /invite                                 Invite.tsx
15. /uploads                                Uploads.tsx
16. /interpret                              Interpret.tsx（V0.2.37）
17. /config                                 Config.tsx
18. /race                                   Race.tsx
19. /admins                                 Admins.tsx（V0.2.8 RBAC + V0.3.5 登录日志 Tab）
```

### 当前服务状态

- qm-admin dev/preview: ❌ 未运行
- 后端 server: ❌ 未运行
- PG + Redis: ✅ docker compose running

---

## 🎯 目标

用 ego-browser 跑 qm-admin 全 19 page，产出：
1. **19 张全屏截图**（每 page 1 张）
2. **19 张文本断言表**（关键 H1/H2/button 文案 + DOM ref map 摘录）
3. **设计审查报告**（hallmark 反 AI 模式检查：typography / spacing / color / brand consistency）
4. **交互测试**（可选，4 个核心 page：dashboard / admins / users / withdrawals）

---

## 📦 执行步骤（原子）

### Phase 1：环境准备（5 分钟）

1. **启动 qm-admin preview server**：
   ```bash
   cd /Users/mac/Documents/Claude/Projects/qm-admin
   npm run preview  # Umi Max preview 8000（纯静态，dist/ 已 build）
   ```
   - 预期：Umi Max 启动 + 监听 http://localhost:8000

2. **启动后端 dev server**（让 dashboard/admins/users 等可拉数据）：
   ```bash
   cd /Users/mac/Documents/Claude/Projects/QM-WX/apps/server
   pnpm dev  # Fastify 3000（需要 docker compose up server — 已部分运行 PG/Redis）
   ```
   - 预期：Fastify 启动 + /health 200 + /api/admin/* JWT-protected 401（无 token 时）

3. **创建 ego-browser task space**：
   ```bash
   ego-browser nodejs <<'EOF'
   const task = await useOrCreateTaskSpace('qm-admin 19 page audit 2026-07-28')
   cliLog('task id: ' + task.id)
   await openOrReuseTab('http://localhost:8000/login', { wait: true, timeout: 30 })
   EOF
   ```

### Phase 2：19 page 截图 + 文本断言（30-45 分钟）

每 page 一个独立 heredoc 调用：

```bash
ego-browser nodejs <<'EOF'
const task = await useOrCreateTaskSpace('qm-admin 19 page audit 2026-07-28')
// 导航到 page
await gotoAndWait('http://localhost:8000/dashboard', { timeout: 20, settle: 2 })
// 截图（保存到 qm-admin/.zcf/screenshots/dashboard.png）
await captureScreenshot({ path: '/Users/mac/Documents/Claude/Projects/qm-admin/.zcf/screenshots/dashboard.png' })
// 文本断言（DOM ref map + H1/H2/button）
const snapshot = await snapshotText()
cliLog(snapshot.substring(0, 2000))  // 输出前 2000 字符用于断言
EOF
```

**19 page × 1 heredoc = 19 round**

每 round 产出：
- 截图 `qm-admin/.zcf/screenshots/<page-name>.png`
- 文本快照（page title + H1 + H2 + 关键 button 文案）
- 控制台错误（如有）

### Phase 3：关键 page 交互（可选，4 page，15 分钟）

对核心 page 做点击/分页/Modal 交互：
- `/admins` — 点「新建管理员」按钮 → Modal 出现
- `/users` — ProTable 分页（如有）
- `/withdrawals` — 点「通过」按钮 → Popconfirm 出现
- `/mall/orders` — 点「更新状态」按钮 → 状态机切换

每 page 1 个交互步骤，截图 + 文本断言 + 控制台错误检查。

### Phase 4：设计审查报告（10 分钟）

汇总 19 page 截图 + 文本断言到 `qm-admin/.zcf/reports/qm-admin-audit-2026-07-28.md`：

```markdown
# qm-admin 19 page 设计与文本审查报告（2026-07-28）

## 总览
- 测试环境：Umi Max preview 8000 + Fastify dev 3000
- 测试范围：19 page + 4 交互
- 截图：19 张全屏 + 4 张交互后
- 文本断言：19 页 H1/H2/button 全部通过

## 19 page 审查结果
| # | 路径 | 截图 | H1 | 关键文本 | 控制台 | 评分 |
|---|---|---|---|---|---|---|
| 1 | /login | login.png | "青沐 admin" | "账号登录" | 0 error | 95/100 |
| 2 | /dashboard | dashboard.png | "仪表盘" | "V0.3.4 MIS" | 0 error | 90/100 |
| ... |

## 反 AI 模式检查
- 品牌色 #2D9D78 一致性：✅
- Typography 一致性：✅
- Spacing 一致性：✅
- Shadow 一致性：✅

## 控制台错误汇总
- （如无）0 error
- （如有）[错误列表]

## 改进建议
- （基于 hallmark 反 AI 模式检查的发现）
```

### Phase 5：归档与完成（5 分钟）

1. **完成任务**：
   ```bash
   ego-browser nodejs <<'EOF'
   await completeTaskSpace('qm-admin 19 page audit 2026-07-28', { keep: false })
   EOF
   ```

2. **更新 qm-admin CLAUDE.md**：
   - 在 changelog 加段：「2026-07-28 (V0.3.31 ego-browser 19 page audit) — 全 19 page 截图 + 文本断言 + 4 page 交互 + 设计审查报告」

3. **commit + push**：
   - commit: `test(qm-admin): V0.3.31 ego-browser 19 page 截图 + 文本断言 + 报告`

---

## ⚠️ 风险与依赖

| 风险 | 缓解 |
|---|---|
| npm run preview 启动失败（dist/ 旧） | 重新 `npm run build`（typecheck + 测试已过）|
| ego-browser 安装问题 | 读 `references/install.md` 跟流程 |
| 后端 dev server 启动失败（缺迁移） | 仅跑 `pnpm prisma:generate` + docker compose up server |
| 19 page 截图耗时超 1 小时 | 分批（每批 5 page × 3 批） |
| 部分 page 截图失败（DOM 异常） | 截图失败时记录 + 跳过 + 报告说明 |

### 验证策略

- 每 page 截图完成 → 立即 `ls -la screenshots/<page>.png` 确认文件生成
- 文本断言：检查 `cliLog()` 输出含 page title + 至少 1 个 H1
- 控制台错误：通过 `drainEvents()` 捕获 network error / console error

---

## 🎯 预期产出

| 产出 | 路径 | 大小 |
|---|---|---|
| **19 张截图** | `qm-admin/.zcf/screenshots/*.png` | ~1-3MB/page = ~30-50MB |
| **19 张文本断言** | `qm-admin/.zcf/snapshots/*.json` | ~5-20KB/page |
| **设计审查报告** | `qm-admin/.zcf/reports/qm-admin-audit-2026-07-28.md` | ~30KB |
| **CLAUDE.md 同步段** | `qm-admin/CLAUDE.md` changelog + 1 行 | — |

---

## ✅ 用户确认

- [ ] 用户已审阅本计划
- [ ] 用户批准执行
- [ ] 工作流进入阶段 4 执行