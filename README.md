# qm-admin — 青沐 admin Web 后台

> 青沐生命科技 · 大健康生活方式平台 管理后台
>
> 配套后端：[QM-WX/apps/server](https://github.com/your-org/QM-WX/tree/main/apps/server)（Fastify + TS）

## 技术栈

- **框架**：[Umi Max](https://umijs.org/docs/max/introduce) 4 + React 18
- **UI**：Ant Design 5 + Ant Design ProComponents 2.7
- **状态**：Umi `initialState` + `useModel`（必要时引 zustand）
- **请求**：Umi `request`（axios）+ Bearer JWT 拦截器
- **构建**：Umi 4 内置（esbuild + webpack5 + MFSU）
- **TS**：5.6 严格模式

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

## 目录

```
qm-admin/
├── config/
│   └── config.ts          # Umi 配置（路由 / proxy / 插件）
├── src/
│   ├── app.tsx            # 运行时配置（getInitialState / request / layout）
│   ├── access.ts          # 权限矩阵（当前简单粗暴：有 token 就放行）
│   ├── types/             # 全局类型（app + admin + mall）
│   ├── services/          # API wrapper（api / admin / mall）
│   ├── pages/             # 页面
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   └── mall/
│   │       ├── Categories.tsx
│   │       ├── Products.tsx
│   │       └── Orders.tsx
│   └── .umi/              # Umi 运行时（gitignore）
├── tsconfig.json
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

## 开发笔记

- **tsconfig paths**：`@umijs/max` 同时映射 `src/.umi/exports.ts`（运行时）和 `node_modules/umi`（构建时）
- **config.ts**：用 `from 'umi'` 而非 `'@umijs/max'`（拿 `defineConfig`）
- **`useModel('@@initialState')`**：Umi Max 注入登录态用
- **首次 setup**：装完依赖必须 `npm run setup` 生成 `src/.umi/exports.ts`，否则 tsc / dev 都跑不起来

## License

Private · 青沐生命科技
