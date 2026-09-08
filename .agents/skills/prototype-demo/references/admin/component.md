# 组件规范（B 端管理后台 · Arco）

约束 **Shell 契约、页面 IA、B 端气质**。  
Theme：`frame/admin`（见 `./design-system-index.md`、`./setup.md`）。  
**增页与组件复用**（整页样板 → 共享层 → `component-*`）见 `./pages.md`，本文不重复长表。

## 适用范围与原则

- 适用：登录、Dashboard、CRUD 列表、表单、详情、设置等；左侧导航 + 顶栏 + 主内容区。
- 组件服务效率与可读性；不用 APP 壳或营销 Hero/Footer 当主布局。
- 同项目风格统一；颜色/间距/圆角优先母版变量（`arco-theme-pro`）与 `pages-common` 的 `pro-*`。
- **增页外观必须以 catalog 样板为准**，业务只改字段/区块/操作；禁止退回默认 Arco 拼页（细则见 `pages.md`）。
- 状态完整：`default` / `hover` / `active` / `disabled`（表单另含 `focus` / `error`）。
- 信息密度适中，避免无层级堆砌。

## Admin Shell

- 布局：左侧导航 + 顶栏 + 主内容；侧栏 **220px**、顶栏 **60px**（`ArcoProSettings`）。
- Shell：`boot.js` / `shell.js`；业务页经 `mountProPage` 挂载。登录页无 Shell。
- 增页沿用模板 Shell，勿手写空壳。

## 侧栏 / 顶栏 / PageHeader

- 侧栏：品牌区 + 菜单（`routes.js`）；一级不宜超过 7 个；FA 图标经 `fa-icons.js`。
- 业务逻辑放在 `mountProPage` 注册的页面组件内，**禁止** `app.mixin()`。
- 顶栏：面包屑 / 模块名；右侧通知、用户、搜索（按需）；高度以母版为准。
- PageHeader：主内容顶部；标题约 20px semibold；主操作 1 个、次操作 ≤ 2。

## 各页面 IA

### 列表（`list` 及变体）

- 结构：筛选（3～5 项 + 查询/重置）→ 表格 → 分页；须有加载/空态。
- 表格：Arco `a-table`，写法以 catalog 样板为准；状态用 `a-tag`；危险操作用样板内确认方式。
- 业务命名：`<模块>-list.html`（及 card / kanban / tree-table 等变体见速查）。

### 表单（`form` / `form-step` 等）

- PageHeader → 分组或分步表单 → 底栏保存/取消；`rules` 字段级错误。
- 控件组合参考 `component-form`；业务命名：`<模块>-form.html`。

### 详情（`detail` / `detail-advanced`）

- descriptions / tabs 等只读分区；命名：`<模块>-detail.html`。

### Dashboard / 可视化

- 指标卡 → 图表 → 快捷入口；图表用母版 Unovis + `shadcn-charts`，容器明确高度。
- **图表（取色 / 轴边距 / 图例 / 圆环 / 载入）**：一律遵循 `./charts.md`。
- 分析页见 `visualization` / `visualization-multi` 样板。

### 结果 / 异常 / 用户

- result-*、exception-*、user-home / user-setting：直接复制对应 catalog 样板改文案。

### 登录

- 无 Shell；居中卡片；见 `login` / `login-cover` 样板与 `js/login-cover.js`。

### `component-*`

- 仅写法参考，不改名作业务路由（细则在 `pages.md`）。

## 图标与响应式

- Font Awesome 本地：`./vendor/fontawesome/css/all.min.css`；图标约 14–16px。
- 桌面优先；小屏侧栏折叠须与母版行为一致。

## 视觉气质（B 端）

- 克制、数据与操作优先；忌营销大 Hero、强装饰背景。
- 紧凑表格、灰底内容区；配色用母版默认（用户明确要求时再改）。

## 禁止（IA / 气质）

- 营销落地页或 APP 壳作后台主布局。
- 同项目多套互不相干的按钮/表格/表单皮肤。
- 跳过样板手写空壳或裸 Arco 重写（复用细则见 `pages.md`）。

工程向禁止（CDN、内联脚本、`mixin`、挂载顺序）见 `setup.md`。

## 检查清单

- [ ] Admin Shell + `mountProPage`（登录除外）
- [ ] PageHeader / 筛选 / 表 / 分页层级清晰
- [ ] 资源在 `admin/` 闭环；沿用 `pages-common` / theme CSS 与 catalog 样板
