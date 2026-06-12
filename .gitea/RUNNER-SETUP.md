# Gitea Actions Runner 启用清单

> CT400 Gitea 1.21.11 默认不启用 Actions。下面是把 `ci.yml` 跑起来的完整步骤。

## 1. 全局启用 Actions（CT400 容器内）

```bash
ssh pve
pct exec 400 -- bash -c '
cat >> /etc/gitea/app.ini <<EOF

[actions]
ENABLED = true
DEFAULT_ACTIONS_URL = https://github.com
EOF
'

# 重启 Gitea
pct exec 400 -- systemctl restart gitea
```

## 2. repo 级别启用

UI 路径：`http://10.10.10.4:3000/qingmu/qm-admin/settings` → Advanced Settings → 勾 "Actions" → Update。

或 API：

```bash
TOKEN=98c4576625e186da90074038eb71825e7d1ede1d
curl -X PATCH -H "Authorization: token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"has_actions": true}' \
  "http://10.10.10.4:3000/api/v1/repos/qingmu/qm-admin"
```

## 3. 装 act_runner

```bash
# CT400 容器内
pct exec 400 -- bash -c '
RUNNER_VERSION=0.2.10
ARCH=amd64
cd /tmp
wget -q https://gitea.com/gitea/act_runner/releases/download/v${RUNNER_VERSION}/act_runner-${RUNNER_VERSION}-linux-${ARCH}
chmod +x act_runner-${RUNNER_VERSION}-linux-${ARCH}
mv act_runner-${RUNNER_VERSION}-linux-${ARCH} /usr/local/bin/act_runner

# 拿 runner token（global）
curl -s -X POST -H "Authorization: token $TOKEN" \
  "http://localhost:3000/api/v1/admin/runners/registration-token" \
  | python3 -c "import json,sys; print(json.load(sys.stdin)[\"token\"])"

# 注册（交互填上面的 token）
mkdir -p /var/lib/gitea/act_runner
cd /var/lib/gitea/act_runner
act_runner register --no-interactive \
  --instance http://localhost:3000 \
  --token <RUNNER_TOKEN> \
  --name ct400-runner \
  --labels ubuntu-latest:docker://node:20-bullseye
chown -R git:git /var/lib/gitea/act_runner
'
```

## 4. 设置 systemd 服务

```bash
pct exec 400 -- bash -c '
cat > /etc/systemd/system/act_runner.service <<EOF
[Unit]
Description=Gitea Actions Runner
After=docker.service

[Service]
Type=simple
User=git
WorkingDirectory=/var/lib/gitea/act_runner
ExecStart=/usr/local/bin/act_runner daemon
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now act_runner
systemctl status act_runner --no-pager
'
```

## 5. 配置 secrets / variables（构镜像才需要）

UI 路径：`http://10.10.10.4:3000/qingmu/qm-admin/settings/actions/secrets`

需要：
- `GITEA_USERNAME` — qingmu
- `GITEA_TOKEN` — 上面那个 admin access token

variables（可选）：
- `GITEA_REGISTRY` — 默认 `10.10.10.4:3000`（Gitea Container Registry）

## 6. 验证

```bash
# 触发一次构建（push 任意 commit 到 main）
git commit --allow-empty -m "ci: trigger first run"
git push origin main

# 看构建状态
# UI: http://10.10.10.4:3000/qingmu/qm-admin/actions
```

## 故障排查

- **docker push 401**：检查 secrets / Gitea Container Registry 是否启用（`[packages] ENABLED = true`）
- **runner 不接活**：`systemctl status act_runner` 看是否在线；labels 不匹配也会跳过
- **镜像下载慢**：在 act_runner 配置里加镜像源（`/var/lib/gitea/act_runner/.runner` 同级 `config.yaml`）
