# 页面类型与增页流程（Arco）

增页：**匹配 page-type → 整页复制 catalog 样板（html+js+css）→ 在优化结构上改业务 → 用 `component.md` 核对**。

样板路径以 catalog / `template.manifest.json` 的 `pageTypes` 为准。挂载见 `setup.md`；选型总览见 `design-system-index.md`。

---

## 核心原则：继承优化皮肤，改业务内容

母版样板（如 `list-search-table`）已对 Arco 做过 Pro 级优化（搜索区、工具栏、表格脚、详情抽屉、`pro-*` 类名、`pages-common.css`）。  
**生成页必须看起来像母版，而不是官方文档里的默认 Arco。**

| 必须保留（从样板继承） | 必须按业务改 |
| --- | --- |
| HTML 的 CSS/JS 引用顺序（theme / layout / pages-common / 页 css） | 筛选字段、表格列、状态机、主/次操作 |
| 页根 class（如 `list-search-table-page`）与配套页 css | mock 数据与文案（locale） |
| `general-card`、`pro-search-panel`、`pro-search-form`、`pro-search-actions`、`pro-toolbar`、`pro-table-footer`、`pro-detail*`、`pro-confirm-modal` 等 | 详情分区标题与字段；可增删业务区块，但区块仍用母版写法 |
| 表格：`:bordered="false"`、`:size`、固定操作列、`pro-table-ops` | 行操作与批量操作是否贴合场景（发货/关闭等） |
| `mountProPage` + Shell | 路由 key / 菜单名 |

| 禁止 | 原因 |
| --- | --- |
| 丢开样板、按 Arco 文档从零写 `layout="inline"` 筛选 | 会退回未优化默认皮肤 |
| 只用 `a-descriptions bordered` 顶替 `pro-detail` | 详情气质不一致 |
| 删掉页 css 或不链 `pages-common.css` | 丢失间距/搜索栏/工具栏优化 |
| 只改文案不改业务列/操作 | 换皮 |
| 把 `component-*` 演示页改名当业务页 | 演示不是业务 IA |

**正确心智**：复制样板 → 对照样板改「里子」（字段/操作/区块）→ 外观仍是 Pro 样板。

---

## 组件复用规则（默认必须遵守）

| 优先级 | 做什么 | 说明 |
| --- | --- | --- |
| **1. 整页样板** | catalog **整页复制** html/js/css 再重命名 | lean scaffold 不预置业务页；**禁止只抄逻辑不抄模板 DOM** |
| **2. 业务改造** | 在样板结构上改列/筛/状态/操作/详情分区 | 可增删业务区块，新增块也从样板或 `component-*` 抄类名 |
| **3. 框架共享层** | Shell / `pages-common` / `arco-theme-pro` / 图表封装 | 禁止手写侧栏顶栏 |
| **4. 组件演示页** | 缺控件时从 `component-*` 抄用法与类名 | 禁止演示页改名当业务页 |
| **5. 官方文档** | 仅当母版与演示都无接近模式 | 仍用 `a-*` 前缀 + 母版变量，并套进现有 `pro-*` 容器 |

| 需要的能力 | 去哪抄（page-type） |
| --- | --- |
| 按钮、标签、徽标、头像、反馈、导航等 | `component-basic` |
| 扩展杂项 | `component-extended` |
| 表单控件 | `component-form` / `component-form-extended` |
| 表格扩展 | `component-table-extended` |
| 列表组件 | `component-list` |
| 图表 | `component-chart`（及 Unovis / `shadcn-charts`） |
| 富文本 | `component-rich-text` |
| 指标卡 | `component-metric-card` |

scaffold 默认 **lean**（仅 login + 运行时）。完整样板库用 `--full`（少用）。

---

## 需求 → page-type 速查

| 用户描述 | 优先 page-type |
| --- | --- |
| 登录、注册页 | `login` |
| 首页、工作台、Dashboard、数据概览 | `dashboard` |
| 实时监控 | `monitor` |
| 列表、表格、筛选、CRUD、分页 | `list` |
| 卡片列表、宫格 | `list-card` |
| 看板、Kanban | `list-kanban` |
| 左树右表、树表、目录树+表格 | `list-tree-table` |
| 左筛右表、侧栏筛选+表格 | `list-filter-table` |
| 顶部标签筛选、平铺标签筛、标签筛选 | `list-tag-filter` |
| 主从分栏、左右分栏、Master-Detail | `list-master-detail` |
| 可编辑表格、行内编辑 | `list-editable` |
| 日历、时间线、排期、运维变更 | `list-calendar` |
| 文件库、素材库、资源库 | `list-media` |
| 导入向导、批量导入 | `list-import` |
| 新建、编辑、分组表单 | `form` |
| 基础表单、简单表单 | `form-basic` |
| wizard、分步 | `form-step` |
| 纵向分步 | `form-step-vertical` |
| 详情、只读信息 | `detail` |
| 高级详情、多区块详情 | `detail-advanced` |
| 成功 / 提交成功 | `result-success` |
| 等待 / 处理中 | `result-waiting` |
| 警告结果 | `result-warning` |
| 失败 | `result-error` |
| 403 / 404 / 500 | `exception-*` |
| 个人中心、个人主页、账号设置、消息管理 | `user-home` / `user-setting` / `user-message` |
| 数据看板、图表分析 | `visualization` / `visualization-multi` |
| 组件样板 / 组件库演示 | `component-*`（仅作写法参考，不改名交付） |

无匹配时：选最接近的 page-type，或询问用户。

### 命名建议（新业务页）

| page-type | 输出文件名示例 |
| --- | --- |
| `list` | `<模块>-list.html` |
| `form` | `<模块>-form.html` |
| `detail` | `<模块>-detail.html` |
| `dashboard` | `dashboard.html` 或 `<模块>-dashboard.html` |

---

## 增页流程（Agent）

1. 读 `admin/.admin-config.json` → `theme` / `frameworkId`
2. 本文件速查表匹配 **page-type**
3. 打开 `frame/admin/_meta/pages.catalog.json` → **整页复制** html/js/css，重命名为目标业务文件（三件套一起改）
4. **打开复制后的 JS 模板**，在既有 `template` / class 上改：筛选项、列定义、状态、操作、详情分区、mock；需要的新控件从 `component-*` 抄进现有卡片内
5. 核对：仍有 `pro-search-*`（若样板有）、`pro-toolbar`、`pro-table-footer` / `pro-detail` 等；HTML 仍链 `pages-common` + 页 css
6. 更新 `js/routes.js` / locale；挂载见 `setup.md`

自检（不通过则重做，勿交付裸 Arco 页）：

- [ ] 与同 page-type 母版并排对比，搜索区/工具栏/表格气质一致
- [ ] 业务列与主操作已不是样板原领域文案
- [ ] 未使用 `layout="inline"` 简易筛选顶替 `pro-search-panel`（除非所选样板本身如此）

新增 page-type / 样板：更新 `_meta/template.manifest.json` 与 `pages.catalog.json`。

### 首项目命名

- 登录 + 后台：业务首页 `dashboard.html`（数据概览），登录 `login-cover.html`（另有 `login-banner.html` / `login-split.html`）
- 仅业务模块：首个页面 `dashboard.html`（或业务入口页）
