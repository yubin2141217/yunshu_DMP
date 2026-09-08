# Vibepm Demo Agent 更新记录

---

## v1.4

> 更新日期：2026-08-27

### 升级概要

v1.4 将三端静态原型收敛为统一技能，并强化 Style / 多交付根 / 配置约定；

- **统一原型技能：** `prototype-demo` 覆盖 WEB / Admin / APP；**移除** `vibepm-web-generator`、`vibepm-admin-generator`、`vibepm-app-generator` 三入口（旧名仍统一走 `prototype-demo`，不另留技能目录）
- **技能改名：**`vibepm-style-extractor` → `style-extractor`（目录 `.agents/skills/style-extractor/`；旧名仍走本技能）
- **共享框架目录：** 包根 `frame/`（扁平：`admin` / `web` / `app` + `index.json` 按端映射）；scaffold 自 `frame/` 初始化交付目录；非空 `--out` 拒绝覆盖。
- **流程分流：** 第 0 步判定端别与基座来源（流程 A 创建 / B 增页 / C 外置自建）；多端或多交付根须盘点并锁定唯一 `--out`；脏目录（如 Axure 占用的 `web/`）须先问换目录 / 清空 / 走 C。
- **术语澄清：** `--framework`（母版库 id）≠ `--out`（交付目录名）；默认三端字符串可相同但概念不同（见技能 `SKILL.md` 术语；字段表见 `references/config.md`）。
- **WEB / APP Style：** 创建时必问；枚举包根 `.style/*-style.md`（不维护固定清单）；字体本地化、预览同步（组件预置主规则）、Motion（E 层，不另询套餐）；规范优先级 `style.md` > `component.md` > `frontend-design.md`；APP Style 共用 WEB 规则并仅记端差异（`references/app/style.md`）。
- **Admin 视觉：** 创建/增页**不**询 Style；用户明确要求改主色/明暗/布局/Shell 气质等时走 `references/admin/style.md`（只改交付目录，**禁止**改 `frame/admin`）。
- **增页短规：** 新增 `references/web/pages.md`、`references/app/pages.md`；admin 仍以 `pages.md` + catalog 整页复制为准。
- **上游对齐：** 以 `prd-writer`（`docs/` PRD）为主，`prototype-list` 为辅（冲突以 PRD 为准）。
- **交付摘要：** 任务结束须说明端、交付根、页面列表、Style/Theme、打开方式与限制；**默认浏览器直接打开 html**，不默认推荐用户启静态服务。
- **AGENTS.md / pm-product-pipeline：** 触发词与阶段改为走 `prototype-demo`；admin 换肤指向 `admin/style.md`；预置视觉表改为指向技能 Style 文档（以 `.style/` 目录现状为准）。
- **图表技能自包含：** `diagram-generator` 将子 Agent 定义与绘图规范收入 `references/`（`drawer.md`、`*-rules.md`）；**删除** `.agents/agents/`、`.agents/knowledge/`。
- **共享 API 配置：** `config.json` 从 `.agents/skills/` 根迁至 `.agents/skills/common/config.json`（Word 导出与图表渲染共用）。
- **Word 导出别名：** `common/export-word` 增加 `srs-writer` → `req-doc` 模板别名（与 dev 包共用脚本）。
- `prd-writer`**：** 新增 §10 后续可选路径——PRD 完成后若用户要做页面，可提示 `prototype-list`（对齐结构）或直接 `prototype-demo`；**均非必须**，不阻断 PRD 交付。
- `pm-operation-manual`**：** 含截图的 Word 导出改走本地 `md_to_docx_embed.py`（图片嵌入、目录可跳转、步骤序号按章从 1 重排）。
- `pm-test-cases`**：** 任务清单示例改为 CRM；扫描优先 PRD / 功能清单 / 三端 HTML。
- **PM 扫描表：** `pm-market-research` 等 6 个技能补齐设计方案与功能清单 glob，并增加 `admin/` 原型页。
- **移除重复技能：** 删除 `drawio-generator`（与 `diagram-generator` 能力重复）；画图统一走 `diagram-generator`。


### 推荐路径

```text
prd-writer / prototype-list → prototype-demo（web / admin / app）
外部站点对齐 → style-extractor → prototype-demo
```



### 技能内主要新增 / 调整路径


| 路径 | 说明 |
| --- | --- |
| `.agents/skills/prototype-demo/SKILL.md` | 统一入口与流程 A/B/C |
| `references/config.md` | 交付配置字段、盘点步骤 |
| `references/web                          | app/style.md`、`pages.md` |
| `references/admin/style.md` | 非创建选型的视觉覆盖 |
| `frame/` | 共享母版（原 `frameworks/`） |
| `.agents/skills/diagram-generator/references/` | 子 Agent 定义与绘图规范（原 `.agents/agents/`、`.agents/knowledge/diagram/`） |
| `.agents/skills/common/config.json` | 导出与图表渲染 API 配置（原 `.agents/skills/config.json`） |




### 升级指引

1. **备份** 已有交付目录（`web/`、`admin/`、`app/` 等）与自定义母版
2. **覆盖** `.agents/skills/prototype-demo/`；**删除** 项目中若仍残留的旧三 generator 技能目录
3. **确认** 包根使用 `frame/`（若仍为 `frameworks/` 需按本包更名并对齐 `index.json`、scaffold）
4. **更新** 根目录 `AGENTS.md`、`CHANGELOG.md`
5. **保留** 业务产出与 `.style/`；新会话重新注入 AGENTS 后验证：落地页 / 管理后台 / APP 壳均走 `prototype-demo`
6. **验证** 多交付根并存时会询问写入目标；admin 点名换品牌色走 `admin/style.md` 且不改 `frame/`
7. **删除** 若仍残留 `.agents/agents/`、`.agents/knowledge/`（已迁入 `.agents/skills/diagram-generator/references/`）
8. **移动** 若仍残留 `.agents/skills/config.json`，已迁至 `.agents/skills/common/config.json`
9. **删除** 若仍残留 `.agents/skills/drawio-generator/`（已与 `diagram-generator` 重复，本版移除；画图统一走 `diagram-generator`）

---



## v1.3

> 更新日期：2026-07-10



### 升级概要

v1.3 在 v1.2 基础上重构 PRD 写作链路，并升级图表技能形成「源文件 / PNG 渲染」双路径。主要变化如下：

- **重构：** `prd-writer` → `SKILL.md` + `references/`；概念版 / 落地 PRD / 评审分文件交付
- **新增：** `prototype-to-prd`（Axure / HTML / 站点逆向盘点 → 复用 `prd-writer` 写 PRD）
- **升级：** `diagram-generator` — 模板统一为 17 个扁平 `.xml`（替代旧版 4 类子目录）；新增 `validate-diagram` 本地校验；类型扩展至功能架构、横向/矩阵泳道、用例/状态图及 4 种思维导图；工作流：保存 → 校验 → API 渲染 PNG
- **新增：** `drawio-generator` — 与 `diagram-generator` 共享 17 模板；**仅交付** `docs/images/src/*.xml` 可编辑源文件，离线校验，不调用渲染 API
- **能力：** MVP 闸门、先读 `docs/`、写后自检、Word 导出；`AGENTS.md` 补触发词与工作流
- **交付模式：** 三档（标准 / 快速 / 严格），**默认标准**；可说「快速模式」降档或「严格模式」升档
- **包名统一：** 技能包由 **VibePM Web App** 更名为 **Vibepm Demo Agent**（目录 `vibepm-demo-agent`）

**图表选型：** 文档需嵌入 PNG → `diagram-generator`；仅需 draw.io 源文件 / 离线 → `drawio-generator`。

---



### 依赖说明

- `prototype-to-prd` **依赖** `prd-writer/references/`，不可单独安装；
- `diagram-generator` **依赖** `diagram-drawer`、`.agents/knowledge/diagram/` 及可选渲染 API（`config.json`）；
- `drawio-generator` **自包含**，仅需 Python 3 运行 `validate-diagram`；
- Playwright MCP、Word 导出 API 为**可选**运行时依赖。

---



### 升级指引

1. **备份** 建议备份 `docs/` 下已有 PRD 与 `docs/images/src/` 图表源文件
2. **覆盖** `.agents/skills/prd-writer/`、`.agents/skills/diagram-generator/` 整个目录
3. **复制** `.agents/skills/prototype-to-prd/`、`.agents/skills/drawio-generator/` 新技能目录
4. **删除** 旧版 `diagram-generator/examples/` 下子目录模板（`business-flow/` 等），已改为扁平 `examples/*.xml`
5. **更新** 根目录 `AGENTS.md`、`CHANGELOG.md`
6. **保留** 业务产出目录（`docs/`、`web/`、`app/`）无需覆盖
7. **验证** 触发「写 PRD」「Axure 转 PRD」；触发「画流程图」（PNG 渲染）与「draw.io 源文件 / 思维导图」（校验 + 可导入）

---



## v1.2

> 更新日期：2026-06-08



### 升级概要

v1.2 为能力扩展版本，在 v1.1 原型工作流基础上，同步 Agent 侧产品规划与文档交付能力。主要变化如下：

- **目录：** 技能目录由 `.skills/` 迁移至 `.agents/skills/`，并新增 `.agents/agents/`、`.agents/knowledge/` 支撑子 Agent 与知识库；
- **新增：** 图表生成、测试用例、操作手册、演示文稿、技能创建及 11 项产品规划技能（含全流程编排）；
- **升级：** `AGENTS.md` 扩展技能触发表、推荐工作流与扩展依赖说明，覆盖「方案 B」产品规划路径；
- **视觉：** 预置风格新增「暗粉霓虹潮」「暗黑亮青发光」「暗黑荧光绿」三套深色主题（各含 `*-style.md` 规范与 `*-preview.html` 预览页）；
- **保留：** 5 项核心原型技能（`prd-writer`、`prototype-list`、`vibepm-web-generator`、`vibepm-app-generator`、`vibepm-style-extractor`）内容未变；



### 完整性修复（2026-06-08）

- `AGENTS.md` 技能路径由 `.skills/` 统一更正为 `.agents/skills/`
- 预置视觉规范表补全 3 套深色主题（暗粉霓虹潮、暗黑亮青发光、暗黑荧光绿）
- 补全离线字体资源：Font Awesome `webfonts/`（web/app generator）、Inter `inter-variable.woff2`
- `vibepm-app-generator` 文档中 Vant JS 文件名与包内 `vant.min.js` 对齐

---



### 升级指引

1. **备份** 建议备份业务项目中现有的 `.skills/` 目录及 `AGENTS.md`（或旧版 `README.md`）
2. **删除** 旧的 `.skills/` 目录
3. **复制** 新版 `.agents/` 目录与 `AGENTS.md`、`CHANGELOG.md` 到项目根目录
4. **保留** 业务产出目录（`docs/`、`web/`、`app/`）无需覆盖
5. **保留** `.style/` 可按需合并；若需新风格，复制新增的 `暗粉霓虹潮-style.md`、`暗粉霓虹潮-preview.html`、`暗黑亮青发光-style.md`、`暗黑亮青发光-preview.html`、`暗黑荧光绿-style.md`、`暗黑荧光绿-preview.html`
6. **验证** 新建对话重新读取一次 AGENTS.md 完成注入，确认技能可被正确触发；

---
