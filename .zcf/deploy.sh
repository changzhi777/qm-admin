#!/usr/bin/env bash
# qm-admin 一键部署脚本（V0.3.34 2026-07-29）
#
# 主人手动 SSH 到 ECS 后执行：
#   ssh root@qingmulife.cn 'bash -s' < .zcf/deploy.sh
#
# 或本地 scp 后执行：
#   scp .zcf/deploy.sh root@qingmulife.cn:~
#   ssh root@qingmulife.cn 'chmod +x ~/deploy.sh && bash ~/deploy.sh'
#
# 变量（按主人 ECS 实际配置）：
GITEA_REGISTRY="${GITEA_REGISTRY:-gitea-registry:3000}"
GITEA_IMAGE="${GITEA_IMAGE:-qingmu/qm-admin}"
BACKEND_URL="${BACKEND_URL:-http://qm-server:3000}"
CONTAINER_NAME="${CONTAINER_NAME:-qm-admin}"
HOST_PORT="${HOST_PORT:-80}"
NGINX_CONF_PATH="${NGINX_CONF_PATH:-/etc/qm-admin/nginx.conf}"

set -euo pipefail

echo "=== qm-admin V0.3.34 部署 ==="
echo "Registry: $GITEA_REGISTRY/$GITEA_IMAGE"
echo "Backend: $BACKEND_URL"
echo ""

# 1. 拉最新镜像
echo "[1/4] 拉最新镜像..."
docker pull "$GITEA_REGISTRY/$GITEA_IMAGE:latest"

# 2. 停止旧容器
echo "[2/4] 停止旧容器..."
docker stop "$CONTAINER_NAME" 2>/dev/null || true
docker rm "$CONTAINER_NAME" 2>/dev/null || true

# 3. 启动新容器
echo "[3/4] 启动新容器..."
docker run -d \
  --restart=always \
  --name "$CONTAINER_NAME" \
  -p "$HOST_PORT:80" \
  -e "BACKEND_URL=$BACKEND_URL" \
  -v "$NGINX_CONF_PATH:/etc/nginx/conf.d/qm-admin.conf:ro" \
  "$GITEA_REGISTRY/$GITEA_IMAGE:latest"

# 4. 健康检查
echo "[4/4] 健康检查（等 10s 让 nginx 启动）..."
sleep 10

HEALTH=$(docker inspect --format='{{.State.Health.Status}}' "$CONTAINER_NAME" 2>/dev/null || echo "unknown")
echo "  Container health: $HEALTH"

HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$HOST_PORT/" || echo "000")
echo "  HTTP /: $HTTP_CODE"

HTTP_LOGIN=$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$HOST_PORT/login" || echo "000")
echo "  HTTP /login: $HTTP_LOGIN"

if [ "$HEALTH" = "healthy" ] && [ "$HTTP_CODE" = "200" ]; then
  echo ""
  echo "✅ 部署成功！"
  echo "访问: http://qm-admin.qingmulife.cn"
else
  echo ""
  echo "❌ 部署异常 — 检查:"
  echo "  docker logs $CONTAINER_NAME"
  echo "  docker inspect $CONTAINER_NAME"
  exit 1
fi