# 云数中台 DMP（yunshu_DMP）

数据中台 **运营端 + 机构端** 前端演示：Vue 3 + Vite + Arco Design，默认 Mock。

仓库：https://github.com/yubin2141217/yunshu_DMP

> **默认启动工程是 `mt-web`（云数中台 · 运营管理系统）**，不是试用管理平台。  
> 仓库内 **不包含** `admin/`（试用管理平台）；若 AI Studio 仍显示旧预览，请 **重新 Import** 本仓库最新代码。

## 目录

| 路径 | 说明 |
| --- | --- |
| `mt-web/` | 运营管理系统（根目录 `npm run dev` 即此工程） |
| `v8-web/` | 机构端 |
| `mt/` / `v8/` | 静态 HTML 原型 |
| `docs/` | 需求与流程文档 |

## 本地 / AI Studio

```bash
npm install
npm run dev
```

- 预览：云数中台运营端，打开即为「供数方管理」（免登录）  
- 机构端：`cd v8-web && npm install && npm run dev`（`jigou` / `123456`）

### AI Studio 说明

1. 用 GitHub 账号 `yubin2141217` 授权后 Import `yunshu_DMP`。  
2. 应识别为 **Vue 3 + Vite + Arco**，入口为根目录 → `mt-web`。  
3. 若仍出现「试用管理平台」，说明导入的是旧提交：在 AI Studio **重新 Import** 或 Remix 最新 `main`。

## Google AI Studio 授权提示

出现 `No matching repositories found` 时：连接拥有本仓库的 GitHub 账号，或先 Fork 再导入自己的 Fork。
