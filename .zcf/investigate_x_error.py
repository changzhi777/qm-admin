#!/usr/bin/env python3
"""
qm-admin x.error is not a function — 根因调查（Phase A 运行时堆栈）
"""
import asyncio
import json
import sys
from pathlib import Path
from playwright.async_api import async_playwright

BASE_URL = "http://localhost:4172"
REPORT_PATH = Path("/Users/mac/Documents/Claude/Projects/qm-admin/.zcf/reports/bug-x-error-investigate-2026-07-29.md")
PAGES_TO_INVESTIGATE = [
    "/dashboard",
    "/admins",
    "/mall/orders",
    "/users",
    "/withdrawals",
]


async def main():
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)

    all_findings = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()

        page_errors = []  # full PageError objects with stack
        console_errors = []  # console.error messages
        network_errors = []  # network request failures

        page.on("pageerror", lambda exc: page_errors.append({
            "name": exc.name,
            "message": exc.message,
            "stack": exc.stack,
        }))
        page.on("console", lambda msg: console_errors.append({
            "type": msg.type,
            "text": msg.text,
            "location": str(msg.location) if msg.location else None,
        }) if msg.type in ("error", "warning") else None)
        page.on("requestfailed", lambda req: network_errors.append({
            "url": req.url,
            "method": req.method,
            "failure": req.failure,
        }))

        for path in PAGES_TO_INVESTIGATE:
            print(f"\n>>> Investigating {path}")
            page_errors.clear()
            console_errors.clear()
            network_errors.clear()

            try:
                await page.goto(f"{BASE_URL}{path}", wait_until="networkidle", timeout=30000)
                await page.wait_for_timeout(3000)  # extra wait for React render

                findings = {
                    "page": path,
                    "page_errors": page_errors[:10],
                    "console_errors": console_errors[:10],
                    "network_errors": network_errors[:5],
                }
                all_findings.append(findings)
                print(f"   page_errors: {len(page_errors)}, console_errors: {len(console_errors)}, network_errors: {len(network_errors)}")
                if page_errors:
                    for e in page_errors[:3]:
                        print(f"   ⛔ {e['name']}: {e['message'][:100]}")
                        if e['stack']:
                            print(f"      stack[0]: {e['stack'].split(chr(10))[0][:200]}")
            except Exception as e:
                print(f"   ✗ ERROR: {e}")

        # Generate report
        md = ["# qm-admin `x.error is not a function` BUG 调查（Playwright 2026-07-29）\n"]
        md.append("## 总览\n")
        md.append(f"- 调查时间：2026-07-29\n")
        md.append(f"- 工具：Python Playwright SDK\n")
        md.append(f"- 测试模式：未登录态（admin page 重定向到 /login）\n")
        md.append(f"- 调查 page 数：{len(PAGES_TO_INVESTIGATE)}\n\n")

        md.append("## 关键发现\n\n")
        total_page_errors = sum(len(f['page_errors']) for f in all_findings)
        total_console_errors = sum(len(f['console_errors']) for f in all_findings)
        total_network_errors = sum(len(f['network_errors']) for f in all_findings)
        md.append(f"- **page_errors**: {total_page_errors} 个 PageError（每个 page 多次重复）\n")
        md.append(f"- **console_errors**: {total_console_errors} 个 console.error\n")
        md.append(f"- **network_errors**: {total_network_errors} 个网络请求失败\n\n")

        # Group page_errors by message pattern
        md.append("## PageError 详细堆栈\n\n")
        for finding in all_findings:
            md.append(f"### Page: `{finding['page']}`\n\n")
            if not finding['page_errors']:
                md.append("（无 PageError）\n\n")
                continue
            for i, err in enumerate(finding['page_errors'][:5], 1):
                md.append(f"#### Error #{i}\n")
                md.append(f"- **Name**: `{err['name']}`\n")
                md.append(f"- **Message**: `{err['message']}`\n")
                md.append(f"- **Stack**:\n```\n{err['stack'][:2000] if err['stack'] else '(无堆栈)'}\n```\n\n")

        # Console errors
        md.append("## Console Errors\n\n")
        for finding in all_findings:
            md.append(f"### `{finding['page']}`\n")
            if finding['console_errors']:
                for err in finding['console_errors'][:5]:
                    md.append(f"- `{err['type']}`: {err['text']}\n")
                    if err['location']:
                        md.append(f"  - location: {err['location']}\n")
            else:
                md.append("（无）\n")
            md.append("\n")

        # Network errors
        md.append("## Network Errors\n\n")
        for finding in all_findings:
            md.append(f"### `{finding['page']}`\n")
            if finding['network_errors']:
                for err in finding['network_errors']:
                    md.append(f"- `{err['method']} {err['url']}` — {err['failure']}\n")
            else:
                md.append("（无）\n")
            md.append("\n")

        # Root cause analysis (auto if possible)
        md.append("## Root Cause 分析\n\n")
        first_err = next((e for f in all_findings for e in f['page_errors']), None)
        if first_err:
            md.append(f"首个 PageError:\n")
            md.append(f"- Name: `{first_err['name']}`\n")
            md.append(f"- Message: `{first_err['message']}`\n\n")
            md.append("**可能原因**（基于错误消息 + 之前测试 0 src 命中）：\n\n")
            md.append("1. **第三方库错误处理代码** — antd / ProComponents / Umi Max 的 error handler 在 React 18 + 严格模式下行为异常\n")
            md.append("2. **React 18 effect cleanup** — useEffect cleanup 函数在 unmount 时被调用但 `.error()` 不存在（throw 出来的对象不是 Error 实例）\n")
            md.append("3. **Promise rejection handler** — 一个未捕获的 Promise rejection，handler 试图调 `.error()`\n")
            md.append("4. **A11y / ErrorBoundary** — 框架层 a11y 错误或 ErrorBoundary 注入代码\n\n")
            md.append("**下一步定位建议**：\n")
            md.append("1. 在浏览器 DevTools 看 stack trace，定位具体文件 + 行号\n")
            md.append("2. 在浏览器 console 加 `window.addEventListener('unhandledrejection', e => console.log('UNHANDLED', e.reason, e.reason.stack))`\n")
            md.append("3. 检查 React DevTools Profiler 看哪个组件 unmount 时触发\n")

        REPORT_PATH.write_text("".join(md))
        print(f"\nReport: {REPORT_PATH}")

        await context.close()
        await browser.close()


asyncio.run(main())