# 云数中台 · MT 运营端（前端工程）

基于 HTML 原型 `mt/` 落地的 Vue 3 + Vite + Arco Design Vue 工程。Mock 默认开启，无需后端。

对齐 SRS：`docs/01-需求与规划/20260908-云数中台-SRS需求规格说明书-V1.1.md`

## 启动

```bash
cd mt-web
npm install
npm run dev
```

访问 `http://localhost:5174`，演示账号 `yunying` / `123456`。

## 页面

| 路由 | 功能 |
| --- | --- |
| `/suppliers` | 供数方管理（含 appkey 轮换） |
| `/org-config` | 机构供数配置 |
| `/standard` | 接入方案管理（原接入标准拼装） |
| `/metadata` | 字段库管理 |
| `/scheme` | 接入方案（侧栏隐藏，路由保留） |
| `/whitelist` | IP 白名单（按供数方批量添加） |
| `/push` | 数据推送管理（使用方 / 外推任务） |

侧栏分组「数据接入管理」含：接入方案管理、字段库管理、IP 白名单。

## Mock

`VITE_USE_MOCK=true`（默认）。接入数据在 `src/mock/mt.ts`（`yunshu-mt-mock-v6`）；推送数据在 `src/mock/push.ts`（`yunshu-mt-push-v1`）。生效标准桥接写入 `localStorage` key `yunshu-enabled-standard-v1` 供 V8 读取。
