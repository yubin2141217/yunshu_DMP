# 云数中台 · V8 机构端（前端工程）

基于 HTML 原型 `v8/` 落地的 Vue 3 + Vite + Arco Design Vue 工程。Mock 默认开启，无需后端。

## 启动

```bash
cd v8-web
npm install
npm run dev
```

访问 `http://localhost:5173`，演示账号 `jigou` / `123456`（登录页与 HTML 原型 `v8/login-cover.html` 对齐）。

## 页面

| 路由 | 功能 |
| --- | --- |
| `/overview` | 数据概览 |
| `/stats` | 供数统计 |
| `/suppliers` | 供数方查看 |
| `/spec` | 接入规范 |

## Mock

`VITE_USE_MOCK=true`（默认）。业务数据在 `src/mock/v8.ts`。
