# 云数中台 DMP（yunshu_DMP）

数据中台运营 / 机构双端前端演示工程：Vue 3 + Vite + Arco Design，**默认 Mock，无需后端**。

仓库：https://github.com/yubin2141217/yunshu_DMP

## 目录一览

| 路径 | 说明 |
| --- | --- |
| `mt-web/` | **运营管理系统**（默认入口，`npm run dev`） |
| `v8-web/` | **机构端** |
| `mt/` / `v8/` | 静态 HTML 原型参考 |
| `docs/` | 需求 / SRS 等文档 |
| `admin/` / `mobile/` / `frame/` | 其它原型与母版 |

根目录已有 `package.json`，默认脚本指向运营端 `mt-web`。

## 本地启动

```bash
# 运营端（推荐）
cd mt-web && npm install && npm run dev
# http://localhost:5174  账号 yunying / 123456

# 或在仓库根目录
npm run install:all
npm run dev
```

机构端：`cd v8-web && npm install && npm run dev`（账号 `jigou` / `123456`）。

---

## Google AI Studio 导入（重要）

出现 **「No matching repositories found」** 时，几乎都是 **GitHub 账号未关联 / App 未授权**，不是仓库不存在。

AI Studio **不会**用公开 URL 去搜全网仓库，只会列出 **你已授权给 Google AI Studio 的那个 GitHub 账号** 下的仓库。

### 正确步骤

1. 用浏览器打开 [Google AI Studio](https://aistudio.google.com/) → **Build** → **Import from GitHub**。
2. 按提示 **Connect / Authorize GitHub**，登录的必须是拥有本仓库的账号：**`yubin2141217`**。  
   - 若你平时用的是另一个 GitHub 账号：请先把本仓库 **Fork** 到该账号，再导入 Fork 后的仓库。
3. 打开 GitHub → **Settings → Applications → Installed GitHub Apps**，确认已安装 **Google AI Studio**，并对 **`yunshu_DMP`** 有权限（或选 All repositories）。可参考社区说明：[GitHub App 权限问题讨论](https://discuss.ai.google.dev/t/fixed-failed-to-load-file-differences-the-github-repository-could-not-be-found-or-you-lack-permissions-please-ensure-the-ai-studio-github-app-is-installed/175934)。
4. 回到 AI Studio 搜索框，输入仓库名 **`yunshu_DMP`**（或 `yubin2141217/yunshu_DMP`），从列表里点选；不要只依赖粘贴完整 URL。
5. 导入后默认看运营端：`mt-web/`（根目录 `npm run dev` 即此工程）。

### 给其他人用

对方也必须：用自己的 GitHub 登录 AI Studio → **Fork** 本仓库 → 再 Import 自己的 Fork。仅打开 Public 链接、未授权 GitHub，会出现「No matching repositories found」。

---

## 技术栈

- Vue 3 + TypeScript + Vite  
- Arco Design Vue  
- 前端 Mock（`VITE_USE_MOCK=true`）

演示 / 原型用途，勿将演示账号用于生产。
