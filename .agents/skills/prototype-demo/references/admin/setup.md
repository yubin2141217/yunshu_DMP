# 后台模板 Setup（统一入口）

本文是 admin **挂载与工程约定**的唯一 Setup 文档。按 `admin/.admin-config.json` 的 `theme` / `frameworkId` 阅读对应章节。

| theme | 框架目录 | 本章节 |
| --- | --- | --- |
| `arco`（默认） | `frame/admin/` | [Arco Design Pro](#theme--arcoarco-design-pro) |

**新增框架接入**：在 `frame/` 根下建库并登记 `index.json` → 补 `_meta/template.manifest.json` + `pages.catalog.json` → **在本文增加一节**（脚本顺序、CSS 顺序、挂载 API、登录页、增页检查、禁止项），并更新上表与 `design-system-index.md`。不要另建 `xxx-setup.md`。

选型见 `design-system-index.md`；page-type 见 `pages.md`。

---

## theme = `arco`（Arco Design Pro）

Theme = `arco` 时遵循本节。模板：`frame/admin/`；Meta：`frame/admin/_meta/`（含 `pages.catalog.json`）。

### 架构

- **多 HTML 静态页**，每页独立入口
- 共享 Shell：`js/boot.js` + `js/shell.js`（`ProShell`）
- 菜单/路由：`js/routes.js`（运行时 `ArcoProRoutes`；**须导出** `VibePMProRoutes` 供 Vibe Pack 扫描，见 `vibe-pack/references/admin-pro-routes-contract.md`）
- 鉴权：`js/auth.js`
- 配置：`js/settings.js`（`ArcoProSettings`）
- 图标：`js/fa-icons.js`（`icon-*` → Font Awesome）
- HTML 生成：`scripts/generate-html.mjs`

### 脚本顺序（业务页 `<body>` 末尾）

```html
<script src="./vendor/vue/vue.global.prod.js"></script>
<script src="./vendor/arco/arco-vue.min.js"></script>
<script src="./js/fa-icons.js"></script>
<script src="./js/settings.js"></script>
<script src="./js/locale.js"></script>
<script src="./js/auth.js"></script>
<script src="./js/routes.js"></script>
<script src="./js/mock-data.js"></script>
<script src="./js/arco-theme.js"></script>
<!-- chart-palette.js 由 arco-theme.js 自动注入，无需手写 -->
<script src="./js/shell.js"></script>
<script src="./js/boot.js"></script>
<!-- 若含图表 -->
<script src="./vendor/unovis/unovis.min.js"></script>
<script src="./js/charts/shadcn-charts.js"></script>
<script src="./js/pages/xxx.js"></script>
```

### CSS 顺序（`<head>`）

```html
<link rel="stylesheet" href="./vendor/arco/css/arco.css" />
<link rel="stylesheet" href="./vendor/fontawesome/css/all.min.css" />
<link rel="stylesheet" href="./vendor/fontawesome/css/sharp-light.css" />
<link rel="stylesheet" href="./css/fa-icons.css" />
<link rel="stylesheet" href="./css/arco-theme-pro.css" />
<link rel="stylesheet" href="./css/layout.css" />
<link rel="stylesheet" href="./css/pages-common.css" />
<!-- 页面 css -->
```

配色用母版默认。用户**明确要求**改视觉（主色 / 明暗 / 布局 / Shell token / 字体等）时，按 **`style.md`** 执行；**不要**套用 `../web/style.md` 的创建选型流程。

### 页面挂载

业务页 JS 末尾调用：

```javascript
mountProPage({
  pageKey: 'workplace',           // 与 routes.js 中 key 一致
  pageComponent: 'WorkplacePage', // components 中注册的页面组件名
  breadcrumb: true,               // 可选
  components: { WorkplacePage: { /* ... */ } },
})
```

`boot.js` 内已 `app.use(window.ArcoVueIcon)`（FA 适配层）。

### 增页检查

- [ ] `pages.md` 定 page-type → `_meta/pages.catalog.json` 取路径并复制样板
- [ ] `routes.js` 增加菜单项
- [ ] `generate-html.mjs` → `pages` 数组
- [ ] `node scripts/generate-html.mjs`
- [ ] 未删除 Shell 结构；未使用 CDN

### 禁止

- `app.mixin()` 注入 Shell
- 在 HTML 手写完整 Shell（应走 `mountProPage` + 模板）
- 混用其它组件库的标签或 API

### 登录页

独立 `login-cover.html`（及 `login-banner` / `login-split`），不使用 `mountProPage`；`createApp` + `.use(ArcoVue).use(ArcoVueIcon)`，见 `js/login-cover.js`。
