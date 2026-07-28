# qm-admin `x.error is not a function` BUG 调查（Playwright 2026-07-29）
## 总览
- 调查时间：2026-07-29
- 工具：Python Playwright SDK
- 测试模式：未登录态（admin page 重定向到 /login）
- 调查 page 数：5

## 关键发现

- **page_errors**: 0 个 PageError（每个 page 多次重复）
- **console_errors**: 4 个 console.error
- **network_errors**: 0 个网络请求失败

## PageError 详细堆栈

### Page: `/dashboard`

（无 PageError）

### Page: `/admins`

（无 PageError）

### Page: `/mall/orders`

（无 PageError）

### Page: `/users`

（无 PageError）

### Page: `/withdrawals`

（无 PageError）

## Console Errors

### `/dashboard`
- `error`: Failed to load resource: the server responded with a status of 401 (Unauthorized)
  - location: {'url': 'http://localhost:4172/api/admin', 'line': 0, 'column': 0, 'lineNumber': 0, 'columnNumber': 0}
- `error`: Failed to load resource: the server responded with a status of 401 (Unauthorized)
  - location: {'url': 'http://localhost:4172/api/admin', 'line': 0, 'column': 0, 'lineNumber': 0, 'columnNumber': 0}

### `/admins`
- `error`: Failed to load resource: the server responded with a status of 401 (Unauthorized)
  - location: {'url': 'http://localhost:4172/api/admin', 'line': 0, 'column': 0, 'lineNumber': 0, 'columnNumber': 0}

### `/mall/orders`
（无）

### `/users`
- `error`: Failed to load resource: the server responded with a status of 401 (Unauthorized)
  - location: {'url': 'http://localhost:4172/api/admin', 'line': 0, 'column': 0, 'lineNumber': 0, 'columnNumber': 0}

### `/withdrawals`
（无）

## Network Errors

### `/dashboard`
（无）

### `/admins`
（无）

### `/mall/orders`
（无）

### `/users`
（无）

### `/withdrawals`
（无）

## Root Cause 分析

