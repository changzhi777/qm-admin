# qm-admin — 青沐 admin Web 后台

> 青沐生命科技 · 大健康生活方式平台 管理后台（**V0.3.29**，2026-07-28 整理收官）
>
> 配套后端：[QM-WX/apps/server](https://github.com/changzhi777/QM-WX/tree/main/apps/server)（Fastify + TS / V0.3.29 / 66 表 / 36 module / 44 admin action）
>
> AI 上下文：见 [CLAUDE.md](./CLAUDE.md)（项目级 AI 上下文 + 19 page 路由 + 44 action 对齐矩阵 + GAP 状态）
>
> 机器可读索引：见 [`.claude/index.json`](./.claude/index.json)

## 技术栈

- **框架**：[Umi Max](https://umijs.org/docs/max/introduce) 4 + React 18
- **UI**：Ant Design 5 + Ant Design ProComponents 2.7
- **状态**：Umi `initialState` + `useModel`（**已删 zustand**，fa1529a）
- **请求**：Umi `request`（axios）+ Bearer JWT 拦截器
- **构建**：Umi 4 内置（esbuild + webpack5 + MFSU）
- **TS**：5.6 严格模式
- **测试**：Vitest 3.2.6 + happy-dom + RTL + jsdom（**78 测 / 6 文件**）

## 快速上手

```bash
# 1. Node 20+
nvm use 20

# 2. 装依赖（已在 .npmrc 锁 npm）
npm install

# 3. 生成 .umi 运行时（首次必跑）
npm run setup

# 4. 起 dev（默认 8000 端口）
npm run dev
# → http://localhost:8000
```

需要后端：`cd ../QM-WX/apps/server && pnpm dev`（默认 3000 端口）。
dev proxy 已在 `config/config.ts` 配 `/api → http://127.0.0.1:3000`。

## 19 管理页路由（V0.3.29）

| 路由 | 页面 | 业务 | 后端 action |
|---|---|---|---|
| `/login` | Login.tsx | 账号密码登录 | adminLogin |
| `/dashboard` | Dashboard.tsx | V0.3.4 MIS 9 字段 + 7 天趋势 | dashboard + statsByTimeRange |
| `/mall/categories` | Categories.tsx | 商品分类 CRUD | upsertContent |
| `/mall/products` | Products.tsx | 商品 CRUD | upsertProduct |
| `/mall/orders` | Orders.tsx | 订单 + 状态机 + 退款 + CSV | listOrders/updateOrderStatus/refundOrder/exportOrders |
| `/mall/group-buys` | GroupBuys.tsx | 团购 CRUD | upsertGroupBuy + listGroupBuys |
| `/contents` | Contents.tsx | 内容 CRUD | upsertContent + listContents |
| `/training-plans` | TrainingPlans.tsx | 训练计划 CRUD | upsertTrainingPlan + listTrainingPlans |
| `/reviews` | Reviews.tsx | 评价管理 + 回复 | listReviews + addReviewReply |
| `/withdrawals` | Withdrawals.tsx | 提现审核 + 结算单 CSV | listWithdrawals/approveWithdrawal/rejectWithdrawal/exportSettlement |
| `/users` | Users.tsx | 用户管理 + 封禁 + CSV | listUsers/banUser/unbanUser/exportUsers |
| `/pickup` | Pickup.tsx | 自提核销 | confirmPickup |
| `/invite` | Invite.tsx | 邀请裂变（V0.2.6） | adjustPoints/grantMember/listInviteStats |
| `/uploads` | Uploads.tsx | 上传管理（V0.1.150） | listUploads + retryParse |
| `/interpret` | Interpret.tsx | AI 资料解读（V0.2.37） | listInterpret |
| `/audit-logs` | AuditLogs.tsx | 审计日志查询 | listAuditLogs |
| `/config` | Config.tsx | AppConfig 功能开关 | setConfig |
| `/race` | Race.tsx | 赛事成绩录入 | submitRaceResult + listEnrollmentsByContent |
| `/admins` | Admins.tsx | 管理员账号 + 登录日志（V0.2.8） | listAdmins/createAdmin/updateAdmin/adminLoginLogs |

**44/44 wrapper 全对齐后端 admin 44 action**（V0.3.29 整理收官）

## 目录

```
qm-admin/
├── config/
│   └── config.ts          # Umi 配置（路由 / proxy / 插件）
├── src/
│   ├── app.tsx            # 运行时配置（getInitialState / request / layout + V0.3.5 GlobalSearch 接入）
│   ├── access.ts          # 权限矩阵（canAdmin: token+user+isAdmin）
│   ├── components/
│   │   └── GlobalSearch.tsx   # V0.3.5 全局搜索（5 表 LIKE 跨表 + Debounce 300ms）
│   ├── types/             # 全局类型（app + admin + mall，admin 600+ 行对齐后端 44 action）
│   ├── services/          # API wrapper（api + admin + mall，admin 33 wrapper 全覆盖）
│   ├── pages/             # 19 页面（V0.3.29 Dashboard/Admins 已升级）
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Admins.tsx
│   │   ├── ...
│   │   └── mall/
│   │       ├── Categories.tsx
│   │       ├── Products.tsx
│   │       ├── Orders.tsx
│   │       └── GroupBuys.tsx
│   └── .umi/              # Umi 运行时（gitignore）
├── tests/                 # Vitest 78 测 / 6 文件
├── CLAUDE.md              # 项目级 AI 上下文（V0.3.29 新建，GAP-A 关闭）
├── .claude/index.json     # 机器可读索引
└── package.json
```

## V0.3.29 整理 sprint（2026-07-28）

**目标**：qm-admin Web 前端从「独立 demo 级 admin」升级为「与后端 admin 44 action 全对齐 + 业务可立即见效 + AI 上下文完整」

**关键改动**：
1. **types/admin.ts** +13 类型（DashboardResp / GlobalSearch / AdminRole / Create/UpdateAdmin / AdminLoginLogs / MpCategory / UploadMpMedia / SubmitMpAudit / ProductList / Export / InterpretList）
2. **services/admin.ts** +13 wrapper（dashboard / globalSearch / createAdmin / updateAdmin / adminLoginLogs / getMpCategory / uploadMpMedia / submitMpAudit / listProducts / exportOrders / exportUsers / exportSettlement / listInterpret）
3. **pages/Dashboard.tsx** 重写（V0.3.4 dashboard 1 API 拉全 9 字段：totalUsers/activeUsers7d/totalOrders/totalRevenueFen/paidOrders/totalCheckins/checkins30d/failedAdminLogins30d/totalInterpret）
4. **pages/Admins.tsx** 改 wrapper + 加 adminLoginLogs Tab
5. **components/GlobalSearch.tsx** 新建（V0.3.5 全局搜索）
6. **app.tsx** layout actionsRender 接入 GlobalSearch
7. **tests/services/admin.test.ts** 9 → **48** 测
8. **CLAUDE.md** 新建 + **.claude/index.json** 新建

**量化**：
- 后端 44 action 对齐：31/44 (70.5%) → **44/44 (100%)** ✅
- 测试：47 → **78 passed / 0 failed**
- typecheck exit 0
- **0 后端改动**（纯前端整理）

**GAP 状态**：
- GAP-A 项目级 AI 上下文 ✅ closed（CLAUDE.md + index.json）
- GAP-B services/types 深度重构 ⚠️ open（拆 7 文件待办）
- GAP-C page test 覆盖率 ⚠️ open（19 page 仅 2 page 有测）
- GAP-D dist/ rebuild ⚠️ open（已 12 天未 build）
- GAP-E ESLint + Prettier ⚠️ open
- GAP-F CI 接入 vitest ⚠️ open
- GAP-G funcs% 实测 ⚠️ open（baseline 未跑）

## 后端契约

所有写操作走 `POST /api/admin`：

```ts
{
  action: 'upsertProduct' | 'listOrders' | 'dashboard' | 'globalSearch' | ...,
  payload: { ... }
}
```

后端鉴权：JWT → 后端 checkPermission middleware → super-admin/admin/operator 三角色 RBAC（V0.2.8）。
完整契约见 [apps/server/src/modules/admin/CLAUDE.md](https://github.com/changzhi777/QM-WX/blob/main/apps/server/src/modules/admin/CLAUDE.md)。

## 品牌色

`#0FAF8E`（青沐绿）— 与小程序统一。已在 `app.tsx` 的 layout token 注入顶栏。

## 部署

### 本地 Docker 构建验证

```bash
# 1. 多阶段构建（node:20 build → nginx:1.27-alpine serve）
docker build -t qm-admin:dev .

# 2. 跑起来（映射到本机 18080）
docker run -d --rm --name qm-admin-test -p 18080:80 qm-admin:dev

# 3. 访问 http://localhost:18080
#    SPA 任意深路径都会 fallback 到 index.html
#    /api/* 默认反代到 host.docker.internal:3000（本地后端）

# 4. 停
docker stop qm-admin-test
```

### 上 ECS / CT400 LXC

后端地址若不是 `host.docker.internal:3000`，编辑 [deploy/nginx.conf](./deploy/nginx.conf) 改 `proxy_pass`：

```nginx
location /api/ {
    proxy_pass http://your-backend-host:3000;
    ...
}
```

或者跑容器时挂卷覆盖：

```bash
docker run -d --restart=always --name qm-admin \
  -p 80:80 \
  -v /etc/qm-admin/nginx.conf:/etc/nginx/conf.d/qm-admin.conf:ro \
  qm-admin:prod
```

### 镜像优化要点

- **多阶段构建**：node:20 跑 build，最终镜像基于 nginx-alpine（~20MB）
- **.dockerignore** 排除 `node_modules` / `.umi` / `dist`，避免 build context 膨胀
- **首次必跑 `max setup`**：Dockerfile 已固化（生成 `src/.umi/exports.ts`）
- **HEALTHCHECK** 内置（30s 间隔 wget `/`）
- **gzip + 1y 静态资源缓存**：nginx 配置已开

## CI（Gitea Actions）

`.gitea/workflows/ci.yml` 已就位：

| Job | 触发 | 内容 |
| --- | --- | --- |
| `lint-typecheck` | push/PR/手动 | install → max setup → tsc --noEmit |
| `build` | push/PR/手动 | install → max setup → max build，产物 upload artifact |
| `docker-image` | 仅 main 分支 push | build & push 到 Gitea Container Registry |
└── package.json
```

## 功能模块（V1）

| 模块 | 路径 | 后端 action | 状态 |
| --- | --- | --- | --- |
| Dashboard | /dashboard | — | ✅ 占位 |
| 商品分类 | /mall/categories | `mall.listCategories` | ✅ 只读 |
| 商品管理 | /mall/products | `mall.listProducts` + `admin.upsertProduct` | ✅ CRUD |
| 订单管理 | /mall/orders | `admin.listOrders` + `admin.updateOrderStatus` | ✅ 列表 + 状态扭转 |

## 鉴权（临时方案）

Web 端没法跑 `wx.login`，当前用**手工填 JWT token + openid**：

1. 用微信开发者工具登录 [QM-WX 小程序](../QM-WX/apps/miniprogram)
2. 在 Network 面板抠出 `POST /api/user {action: 'login'}` 的响应中 `accessToken`
3. 你的 openid 必须已被加入后端 `AppConfig.admin_whitelist.openids`
4. 在 /login 页粘贴 token + openid 进入

**生产**：扫码登录（小程序扫 admin 二维码 → 后端验 admin → 签 JWT）— 待做。

## 后端契约

所有写操作走 `POST /api/admin`：

```ts
{
  action: 'upsertProduct' | 'listOrders' | 'updateOrderStatus' | ...,
  payload: { ... }
}
```

后端鉴权：JWT 中的 openid 必须在 `AppConfig.admin_whitelist.openids`，否则 403。

完整契约见 [apps/server/src/modules/admin/admin.routes.ts](../QM-WX/apps/server/src/modules/admin/admin.routes.ts)。

## 品牌色

`#0FAF8E`（青沐绿）— 与小程序统一。已在 `app.tsx` 的 layout token 注入顶栏。

## 部署

### 本地 Docker 构建验证

```bash
# 1. 多阶段构建（node:20 build → nginx:1.27-alpine serve）
docker build -t qm-admin:dev .

# 2. 跑起来（映射到本机 18080）
docker run -d --rm --name qm-admin-test -p 18080:80 qm-admin:dev

# 3. 访问 http://localhost:18080
#    SPA 任意深路径都会 fallback 到 index.html
#    /api/* 默认反代到 host.docker.internal:3000（本地后端）

# 4. 停
docker stop qm-admin-test
```

### 上 ECS / CT400 LXC

后端地址若不是 `host.docker.internal:3000`，编辑 [deploy/nginx.conf](./deploy/nginx.conf) 改 `proxy_pass`：

```nginx
location /api/ {
    proxy_pass http://your-backend-host:3000;
    ...
}
```

或者跑容器时挂卷覆盖：

```bash
docker run -d --restart=always --name qm-admin \
  -p 80:80 \
  -v /etc/qm-admin/nginx.conf:/etc/nginx/conf.d/qm-admin.conf:ro \
  qm-admin:prod
```

### 镜像优化要点

- **多阶段构建**：node:20 跑 build，最终镜像基于 nginx-alpine（~20MB）
- **.dockerignore** 排除 `node_modules` / `.umi` / `dist`，避免 build context 膨胀
- **首次必跑 `max setup`**：Dockerfile 已固化（生成 `src/.umi/exports.ts`）
- **HEALTHCHECK** 内置（30s 间隔 wget `/`）
- **gzip + 1y 静态资源缓存**：nginx 配置已开

## CI（Gitea Actions）

`.gitea/workflows/ci.yml` 已就位：

| Job | 触发 | 内容 |
| --- | --- | --- |
| `lint-typecheck` | push/PR/手动 | install → max setup → tsc --noEmit |
| `build` | push/PR/手动 | install → max setup → max build，产物 upload artifact |
| `docker-image` | 仅 main 分支 push | build & push 到 Gitea Container Registry |

> ⚠️ CT400 Gitea 默认未启用 Actions，启用步骤见 [.gitea/RUNNER-SETUP.md](./.gitea/RUNNER-SETUP.md)。

## 开发笔记

- **tsconfig paths**：`@umijs/max` 同时映射 `src/.umi/exports.ts`（运行时）和 `node_modules/umi`（构建时）
- **config.ts**：用 `from 'umi'` 而非 `'@umijs/max'`（拿 `defineConfig`）
- **`useModel('@@initialState')`**：Umi Max 注入登录态用
- **首次 setup**：装完依赖必须 `npm run setup` 生成 `src/.umi/exports.ts`，否则 tsc / dev 都跑不起来

## License

Private · 青沐生命科技
