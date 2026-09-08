# 云数中台 DMP（yunshu_DMP）

数据中台运营 / 机构双端前端演示工程：Vue 3 + Vite + Arco Design，**默认 Mock，无需后端**，适合在 [Google AI Studio](https://aistudio.google.com/) 通过 **Import from GitHub** 导入后阅读与改代码。

仓库地址：https://github.com/yubin2141217/yunshu_DMP

## 目录一览

| 路径 | 说明 |
| --- | --- |
| `mt-web/` | **运营管理系统**（接入方案、字段库、快速模板、供数方、IP 白名单等） |
| `v8-web/` | **机构端**（概览、供数统计、接入规范预览/下载） |
| `mt/` / `v8/` | 对应静态 HTML 原型参考 |
| `docs/` | 需求 / SRS 等文档 |
| `admin/` / `mobile/` / `frame/` | 其它原型与母版资源 |

## 本地启动（推荐先看运营端）

### 运营端 MT

```bash
cd mt-web
npm install
npm run dev
```

- 地址：http://localhost:5174  
- 演示账号：`yunying` / `123456`

### 机构端 V8

```bash
cd v8-web
npm install
npm run dev
```

- 地址：http://localhost:5173  
- 演示账号：`jigou` / `123456`

## Google AI Studio 导入说明

1. 打开 [Google AI Studio](https://aistudio.google.com/) → 新建项目 / Build → **Import from GitHub**（或等价入口）。
2. 粘贴仓库：`https://github.com/yubin2141217/yunshu_DMP`（需仓库为 **Public**，或授权访问）。
3. 导入后优先打开 `mt-web/`、`v8-web/` 下的 `src/views` 与 `README-DEV.md`；业务 Mock 在各自 `src/mock/`。
4. AI Studio 侧重代码阅读与生成；完整页面预览请在本机执行上方 `npm run dev`。

## 技术栈

- Vue 3 + TypeScript + Vite  
- Arco Design Vue  
- 前端 Mock（`VITE_USE_MOCK=true`）

## 许可与用途

演示 / 原型交付用途。勿将演示账号用于生产环境。
