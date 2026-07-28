# qm-admin 部署命令清单（V0.3.34 2026-07-29）

> 📍 路径：`qm-admin/.zcf/DEPLOY-V0.3.34.md`
> 上下文：qm-admin 11/11 GAP closed，HEAD commit `ef6cfff`（GAP-C 17 page test）
> 状态：准备就绪，**待主人手动执行外部操作**（按 CLAUDE.md 「外部服务需用户手动触发」范式）

---

## 📋 前置条件

- ✅ qm-admin 仓 commit `ef6cfff` 已 push origin
- ✅ Gitea Actions 配置：`.gitea/workflows/ci.yml` 4 jobs（lint-typecheck / test / build / docker-image）
- ✅ Gitea Container Registry 凭证：`GITEA_REGISTRY` / `GITEA_USERNAME` / `GITEA_TOKEN` secrets
- ✅ 后端生产部署：V0.3.29 healthy（init #22 后）
- ⏳ **qm-admin 生产环境**：未部署（dev / preview 验证过，缺生产镜像 + ECS 部署）

---

## 🚀 部署 3 步

### Step 1：Gitea Actions 触发（主人手动）

**触发方式**：
1. push 到 main 分支（已自动，commit `ef6cfff`）
2. 或登录 Gitea Web UI → Repo → Actions → Run workflow

**预期流程**：
1. `lint-typecheck` job（30s）→ tsc --noEmit + npm run lint
2. `test` job（60s）→ vitest run --coverage + upload artifact
3. `build` job（120s）→ max build + upload dist artifact
4. `docker-image` job（300s）→ build image + push to `gitea-registry:3000/qingmu/qm-admin:${{ github.sha }}` + `:latest`

**监控**：https://gitea.example.com/qingmu/qm-admin/actions

---

### Step 2：ECS 拉镜像部署（主人手动）

**前置**：SSH 到 ECS 主机（如 `ssh root@qingmulife.cn` 或 `ssh ubuntu@qm-admin-host`）

```bash
# 1. 登录 Gitea Container Registry
docker login gitea-registry:3000 -u $GITEA_USERNAME -p $GITEA_TOKEN

# 2. 拉最新镜像
docker pull gitea-registry:3000/qingmu/qm-admin:${{ github.sha }}
# 或 latest tag
docker pull gitea-registry:3000/qingmu/qm-admin:latest

# 3. 停止旧容器
docker stop qm-admin
docker rm qm-admin

# 4. 启动新容器
docker run -d --restart=always --name qm-admin \
  -p 80:80 \
  -e BACKEND_URL=http://qm-server:3000 \
  -v /etc/qm-admin/nginx.conf:/etc/nginx/conf.d/qm-admin.conf:ro \
  gitea-registry:3000/qingmu/qm-admin:latest

# 5. 健康检查
sleep 5
docker ps | grep qm-admin
docker inspect --format='{{.State.Health.Status}}' qm-admin
# 应输出 "healthy"（Dockerfile HEALTHCHECK wget / 30s 间隔）

# 6. 验证 HTTP 200
curl -sI https://qm-admin.qingmulife.cn/ | head -3
# 应输出 HTTP/1.1 200 OK
```

---

### Step 3：生产后端地址（必填）

**重要**：qm-admin 部署时 `BACKEND_URL` 必须指向生产后端：

| 环境 | BACKEND_URL |
|---|---|
| **生产（qingmulife.cn）** | `http://qm-server:3000`（ECS 内部通信）/ 或 `http://106.53.168.73:3000`（如 server 在同 VPC）|
| **staging** | `http://qm-server-staging:3000` |
| **dev** | `http://host.docker.internal:3000`（macOS Docker Desktop）|

**当前生产后端**：V0.3.29 已部署 healthy
**建议**：先验证后端 V0.3.30 部署（如有），再 qm-admin V0.3.34 部署

---

## 🔍 部署后验证清单

| 项 | 期望 | 命令 |
|---|---|---|
| Docker 容器 running | ✅ | `docker ps \| grep qm-admin` |
| Health check healthy | ✅ | `docker inspect --format='{{.State.Health.Status}}' qm-admin` |
| HTTP 200 /login | ✅ | `curl -sI https://qm-admin.qingmulife.cn/login \| head -3` |
| HTTP 200 /dashboard | ✅ | `curl -sI https://qm-admin.qingmulife.cn/dashboard \| head -3` |
| Nginx 反代 /api | ✅ | `curl -s -o /dev/null -w "%{http_code}\n" https://qm-admin.qingmulife.cn/api/admin/login` |
| adminLogin 401 预期 | ✅ | `curl -s -X POST https://qm-admin.qingmulife.cn/api/admin/login -H "Content-Type: application/json" -d '{}'` 应返 401 |
| adminLogin 200 + token | ✅ | 用 admin 账号登入返 JWT token |

---

## 🔧 故障排查

| 现象 | 排查 |
|---|---|
| 容器启动后立刻退出 | `docker logs qm-admin` 看 nginx 错误 |
| HTTP 502 Bad Gateway | `BACKEND_URL` 配置错（dev vs prod 不同） |
| Health check unhealthy | `curl localhost:80` 看 nginx 是否返回 200 |
| adminLogin 401 | 后端 admin seed 是否完成（参考 dev seed 流程） |
| 静态资源 404 | `ls /usr/share/nginx/html/` 容器内应含 dist/ 内容 |

---

## 📋 部署后续（验证通过后）

1. **真机登录测试**：
   - 打开 https://qm-admin.qingmulife.cn/login
   - 用 admin / qmtest_admin_2026 登录（如用 seed 测试账号）
   - 验证 6 page 真实渲染：Dashboard / Admins / Users / Withdrawals / mall/orders / mall/products
2. **功能验证**（如有时间）：
   - 创建管理员 → adminLoginLogs 记录
   - 用户列表 ban/unban
   - 提现审核 通过/拒绝
   - 订单状态扭转
3. **监控告警**：
   - 健康检查 30s 间隔失败 3 次告警
   - qm-admin 域名 SSL 证书自动续期

---

## 📝 部署日志模板

```
=== qm-admin V0.3.34 部署 ===
时间：2026-07-29
操作人：
- [ ] Gitea Actions 触发：commit ef6cfff
- [ ] docker-image job 通过
- [ ] ECS 拉镜像：sha256=...
- [ ] 容器启动：docker run ...
- [ ] 健康检查：healthy
- [ ] HTTP 200 验证：/login /dashboard
- [ ] adminLogin 401/200 验证
- [ ] 真机登录 + 6 page 渲染
- [ ] nginx 反代 /api 验证
- [ ] 部署完成
```

---

🤙 **注意**：以上所有外部操作需**主人手动执行**。本仓 agent 不能 SSH ECS / push Gitea Container Registry / 修改线上 nginx。

如需 agent 协助：可读 `.zcf/DEPLOY-V0.3.34.md` 提供指导。