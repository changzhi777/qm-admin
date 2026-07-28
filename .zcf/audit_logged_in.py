#!/usr/bin/env python3
"""
qm-admin GAP-I 登录态测试（V0.3.32）
- POST /api/admin/login 拿 JWT token
- 注入 localStorage
- 测核心 6 page 真实内容渲染 + 控制台错误收敛
"""
import asyncio
import json
import sys
from pathlib import Path
from playwright.async_api import async_playwright

BASE_URL = "http://localhost:4172"
API_BASE = "http://127.0.0.1:3000"
REPORT_PATH = Path("/Users/mac/Documents/Claude/Projects/qm-admin/.zcf/reports/qm-admin-logged-in-audit-2026-07-29.md")
SS_DIR = Path("/Users/mac/Documents/Claude/Projects/qm-admin/.zcf/screenshots")
SNAP_DIR = Path("/Users/mac/Documents/Claude/Projects/qm-admin/.zcf/snapshots")

USERNAME = "admin"
PASSWORD = "qmtest_admin_2026"

# 核心 6 page（GAP-I 重点验证）
PAGES = [
    ("01_dashboard", "/dashboard"),
    ("02_admins", "/admins"),
    ("03_users", "/users"),
    ("04_withdrawals", "/withdrawals"),
    ("05_mall_orders", "/mall/orders"),
    ("06_mall_products", "/mall/products"),
]


async def login_and_get_token():
    """直接调 API 拿 token（绕过 UI 登录流程）"""
    import urllib.request
    import urllib.parse
    data = json.dumps({"username": USERNAME, "password": PASSWORD}).encode("utf-8")
    req = urllib.request.Request(
        f"{API_BASE}/api/admin/login",
        data=data,
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = json.loads(resp.read().decode("utf-8"))
            return body
    except Exception as e:
        print(f"login failed: {e}")
        return None


async def main():
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    SS_DIR.mkdir(parents=True, exist_ok=True)
    SNAP_DIR.mkdir(parents=True, exist_ok=True)

    # Step 1: Get JWT token via API
    print(">>> Step 1: Login via API to get JWT token")
    login_result = await login_and_get_token()
    if not login_result or "data" not in login_result or "accessToken" not in login_result.get("data", {}):
        print(f"❌ Login failed: {login_result}")
        sys.exit(1)
    token = login_result["data"]["accessToken"]
    admin_user = login_result["data"]["admin"]
    print(f"   ✓ Login OK: username={admin_user['username']}, role={admin_user['role']}, token={token[:30]}...")

    # Step 2: Playwright test
    summary = {"total": len(PAGES), "ok": 0, "fail": 0, "results": [], "page_errors_total": 0, "console_errors_total": 0}

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1440, "height": 900})

        # 注入 token 到 localStorage（qm-admin app.tsx 读 qm_admin_token）
        await context.add_init_script(f"""
            window.localStorage.setItem('qm_admin_token', '{token}');
            window.localStorage.setItem('qm_admin_user', '{json.dumps(admin_user)}');
        """)

        page = await context.new_page()
        page_errors = []
        console_errors = []

        page.on("pageerror", lambda exc: page_errors.append({
            "name": exc.name,
            "message": exc.message,
            "stack": exc.stack,
        }))
        page.on("console", lambda msg: console_errors.append({
            "type": msg.type,
            "text": msg.text,
        }) if msg.type == "error" else None)

        for name, path in PAGES:
            print(f"\n>>> {name}: {path}")
            page_errors.clear()
            console_errors.clear()

            try:
                await page.goto(f"{BASE_URL}{path}", wait_until="networkidle", timeout=30000)
                await page.wait_for_timeout(3000)

                ss_file = SS_DIR / f"loggedin_{name}.png"
                await page.screenshot(path=str(ss_file), full_page=False)

                final_url = page.url
                title = await page.title()
                h1_elements = await page.evaluate("""
                    Array.from(document.querySelectorAll('h1, h2, h3')).slice(0, 10).map(el => ({
                        tag: el.tagName,
                        text: el.innerText.trim()
                    }))
                """)
                buttons = await page.evaluate("""
                    Array.from(document.querySelectorAll('button')).slice(0, 15).map(el => ({
                        text: (el.innerText || '').trim(),
                        disabled: el.disabled || false
                    }))
                """)
                body_text = await page.evaluate("document.body.innerText.substring(0, 1000)")
                redirected_to_login = final_url.endswith("/login")
                rendered_excerpt = body_text[:200].replace("\n", " | ").strip()

                snap = {
                    "page": name, "path": path, "url": final_url,
                    "redirected_to_login": redirected_to_login,
                    "title": title, "h1_h2_h3": h1_elements,
                    "buttons": buttons[:8], "body_excerpt": rendered_excerpt,
                    "ss_file": str(ss_file),
                    "page_errors": page_errors[:5], "console_errors": console_errors[:5],
                    "status": "ok",
                }
                snap_file = SNAP_DIR / f"loggedin_{name}.json"
                snap_file.write_text(json.dumps(snap, ensure_ascii=False, indent=2))

                if redirected_to_login:
                    verdict = "❌ STILL_REDIRECT_TO_LOGIN"
                    status = "fail"
                else:
                    verdict = "✓ rendered"
                    status = "ok"
                    summary["ok"] += 1

                summary["page_errors_total"] += len(page_errors)
                summary["console_errors_total"] += len(console_errors)
                summary["results"].append({
                    "name": name, "path": path, "title": title,
                    "redirected_to_login": redirected_to_login,
                    "h1_count": len(h1_elements), "btn_count": len(buttons),
                    "page_errors": len(page_errors), "console_errors": len(console_errors),
                    "verdict": verdict, "status": status,
                })
                print(f"   {verdict} title={title!r}, h1={len(h1_elements)}, btn={len(buttons)}, page_err={len(page_errors)}, console_err={len(console_errors)}")
                if page_errors:
                    for e in page_errors[:2]:
                        print(f"      ⛔ {e['name']}: {e['message'][:120]}")
            except Exception as e:
                summary["fail"] += 1
                summary["results"].append({"name": name, "path": path, "error": str(e), "status": "fail"})
                print(f"   ✗ ERROR: {e}")

        # Generate report
        md = ["# qm-admin GAP-I 登录态测试报告（V0.3.32）\n"]
        md.append("## 总览\n")
        md.append(f"- 测试时间：2026-07-29\n")
        md.append(f"- 工具：Python Playwright SDK\n")
        md.append(f"- 登录方式：adminLogin API 注入 token 到 localStorage（绕过 UI 流程）\n")
        md.append(f"- 账号：admin / qmtest_admin_2026（V0.2.8 RBAC admin role）\n")
        md.append(f"- 测试范围：核心 6 page\n")
        md.append(f"- 结果：{summary['ok']}/{summary['total']} 真实渲染 OK\n")
        md.append(f"- 总 page_error：{summary['page_errors_total']}（修复 V0.3.32 后应为 0）\n")
        md.append(f"- 总 console_error：{summary['console_errors_total']}\n\n")

        md.append("## 关键发现\n\n")
        real_render = [r for r in summary["results"] if r["status"] == "ok"]
        md.append(f"- ✅ **登录态下 {len(real_render)}/{len(PAGES)} page 真实渲染**（不再是 /login redirect）\n")
        md.append(f"- 🐛 page_error 总数：{summary['page_errors_total']}\n")
        md.append(f"- ⚠️ console_error 总数：{summary['console_errors_total']}（需分析是否仍为 auth/401 类）\n\n")

        md.append("## 6 page 详细\n\n")
        md.append("| # | 路径 | 截图 | Title | H1 | Button | page_err | console_err | 状态 |\n")
        md.append("|---|------|------|-------|----|--------|----------|-------------|------|\n")
        for i, r in enumerate(summary["results"], 1):
            ss = f"[loggedin_{r['name']}.png](../screenshots/loggedin_{r['name']}.png)"
            md.append(f"| {i} | `{r['path']}` | {ss} | {r['title'][:30]} | {r.get('h1_count','-')} | {r.get('btn_count','-')} | {r.get('page_errors','-')} | {r.get('console_errors','-')} | {r.get('verdict','-')} |\n")

        # Sample page_errors
        any_page_err = [r for r in summary["results"] if r.get("page_errors", 0) > 0]
        if any_page_err:
            md.append("\n## PageError 详情\n\n")
            for r in any_page_err:
                snap_file = SNAP_DIR / f"loggedin_{r['name']}.json"
                if snap_file.exists():
                    snap = json.loads(snap_file.read_text())
                    for e in snap.get("page_errors", []):
                        md.append(f"- `{r['name']}`: `{e['name']}: {e['message']}`\n")
                        if e.get('stack'):
                            md.append(f"  ```\n  {e['stack'][:600]}\n  ```\n")

        md.append("\n## 文件清单\n\n")
        md.append(f"- 截图：`.zcf/screenshots/loggedin_01-06.png` × 6（已 gitignore）\n")
        md.append(f"- 快照：`.zcf/snapshots/loggedin_01-06.json` × 6（已 gitignore）\n")
        md.append(f"- 测试脚本：`.zcf/audit_logged_in.py`\n")
        md.append(f"- 本报告：`.zcf/reports/qm-admin-logged-in-audit-2026-07-29.md`\n")

        REPORT_PATH.write_text("".join(md))
        print(f"\nReport: {REPORT_PATH}")

        await context.close()
        await browser.close()


asyncio.run(main())