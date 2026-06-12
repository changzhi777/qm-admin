# ---- Stage 1: build ----
# 用 Node 20 跑 Umi Max build，产物在 dist/
FROM node:20-alpine AS builder

WORKDIR /app

# 1) 单独拷依赖描述，最大化 layer 缓存
COPY package.json package-lock.json ./

# 2) 装依赖（不跑 postinstall 的 max setup —— setup 需要 src/）
RUN npm ci --prefer-offline --no-audit --no-fund

# 3) 拷源码
COPY . .

# 4) 生成 .umi 运行时 + 构建
RUN npx max setup && npm run build


# ---- Stage 2: runtime ----
# 用 nginx alpine 提供静态托管 + SPA 路由 fallback + /api 反代
FROM nginx:1.27-alpine AS runner

# 删除默认配置
RUN rm /etc/nginx/conf.d/default.conf

# 拷自定义 nginx 配置
COPY deploy/nginx.conf /etc/nginx/conf.d/qm-admin.conf

# 拷构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 健康检查（nginx 监听 80，curl 一下根路径）
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
