# Vibepm Demo Agent — 原型工作指南

本资源包为 AI 编程代理提供标准化的 **WEB 端**、**管理后台** 与 **APP 端** 静态原型交付工作流。主 Agent 的职责是识别任务、匹配触发词并调用对应技能——而非跳过流程直接生成页面或撰写文档。技能名称与子目录一致，入口为 `.agents/skills/{name}/SKILL.md`；其中 `prd-writer` 负责将产品方向写成或迭代 **PRD**，`prototype-list` 负责在选用原型技能前整理 **功能清单 + 完整页面结构**——文档类技能产出均存 `docs/`（`prd-writer` 流程见 `SKILL.md`，模板与附录见同目录 `references/`）。完整链路覆盖「PRD → 信息结构 → WEB/Admin/APP 原型 → 测试/手册」，技能配置位于 `.agents/skills/` 目录。

**本包原型入口统一为 `prototype-demo`**；共享母版与 vendor 在包根 **`frame/`**。

> **别名（旧名仍走新技能）**：`vibepm-web-generator` / `vibepm-admin-generator` / `vibepm-app-generator` → `prototype-demo`；`vibepm-style-extractor` → `style-extractor`。正式文档与目录一律用新名。

## 预置视觉规范（.style）

`.style/` 预置多套视觉规范（`*-style.md` + `*-preview.html`）。

| 端 | Style 策略 |
| --- | --- |
| **web / app** | **创建时必问**（见 `prototype-demo` → `references/web|app/style.md`）；选定后写入对应端 `css/global.css` 与 `.prototype-config.json`。增页延续，不重问。 |
| **admin** | **不询问**；用 `frame/admin` 母版配色。用户明确要求改视觉（主色等）时再改（`prototype-demo` → `references/admin/style.md`，非创建选型）。 |

外部站点对齐 → `style-extractor`，再回 `prototype-demo` 落实。

预置清单与询问步骤见 `prototype-demo` → `references/web|app/style.md`（文件在包根 `.style/`）。

## 技能与触发关键词

**规则：用户消息中任一触发词命中，即视为必须走对应技能（见下节「执行规则」）。**

> **端别判断**：原「创建页面 / 实现功能 / 开发模块」类需求，一律走 **`prototype-demo`**，再在技能内区分交付物——**WEB 静态页** → `web/`，**管理后台 / CRUD** → `admin/`，**设备壳 APP** → `app/`。用户未说明且语境不明时，**先询问再选端**。母版取自 `frame/`（见 `frame/index.json`）。

| 技能 | 触发关键词（任一匹配即触发） | 说明 |
| --- | --- | --- |
| `prd-writer` | 需求文档、PRD、产品需求、功能文档、写需求、整理需求、补充需求、审查需求、改进需求文档、从零写 PRD、我想做个产品、我想做个功能、我想做个 App、做个工具、AI 写的需求有没有问题、PRD 导出 Word、需求文档转 Word | 读取 `.agents/skills/prd-writer/SKILL.md` → 第零步判断是否适合本技能；**三视角诊断** 与 **模式 A/B/C**；产出 Markdown 存 **`docs/`**；可选 Word 导出；**不写实现级代码细节**，与 `prototype-demo` 分工 |
| `prototype-to-prd` | Axure 转 PRD、原型转需求、原型生成 PRD、从原型写 PRD、逆向 PRD、网站转 PRD、线上产品写需求、分析原型写 PRD、HTML 原型转文档、/prototype-to-prd、PRD 导出 Word、需求文档转 Word | 读取该技能 → 盘点 → 概念版与落地 PRD；用户仅口述想法时用 `prd-writer` |
| `prototype-list` | 功能清单、页面结构、信息结构、原型范围、MVP、分期、整理需求稿、站点地图、IA、基于 PRD 整理、feature checklist | 读取该技能 → 功能 + 信息结构存 **`docs/`**；第 2 章为完整页面结构列表；再接 `prototype-demo` |
| `prototype-demo` | 创建页面、生成页面、添加页面、新建页面、实现WEB页面、开发WEB模块、企业官网、落地页、营销页、多页静态站、后台系统、管理后台、运营后台、控制台、Admin、CMS、Arco、Ant Design、Element、Pro风格、数据看板、CRUD页面、列表页、表单页、权限管理、实现后台页面、APP原型、手机页面、小程序原型、iOS壳、微信壳、设备框、带壳页面、移动端原型、用WEB技能、用APP技能、/prototype-demo、/vibepm-web-generator、/vibepm-admin-generator、/vibepm-app-generator | 统一原型技能 → 判定端别 → 从 `frame/` scaffold → 交付 `web/` / `admin/` / `app/`；旧名 `vibepm-web-generator` / `vibepm-admin-generator` / `vibepm-app-generator` 仍走本技能 |
| `style-extractor` | 模仿网站风格、参考站、提取风格、设计tokens、风格逆向、样式提取、从URL/截图提取、/style-extractor、/vibepm-style-extractor | 输出 tokens 与可复用提示词，供后续 `prototype-demo` 对齐视觉；旧名 `vibepm-style-extractor` 仍走本技能 |
| `diagram-generator` | 流程图、架构图、时序图、泳道图、ER图、UML、组织架构图、BPMN、生成图表、画流程图、插入流程图 | 读取该技能 → 生成 XML → 渲染 PNG；源文件存 `docs/images/src/` |
| `pm-test-cases` | 生成测试用例、写测试用例、QA测试、测试文档、验收标准、测试计划、测试用例导出Word | 基于 `docs/` PRD 与功能清单生成测试用例 |
| `pm-operation-manual` | 操作手册、用户手册、使用说明、功能说明文档、快速入门、用户指南、操作手册导出Word | 基于 PRD 与 `web/`/`admin/`/`app/` 原型页面生成操作手册 |
| `slides` | 演示文稿、PPT、幻灯片、汇报材料、路演、HTML演示 | 生成战略性 HTML 演示文稿 |
| `skill-creator` | 创建技能、新建技能、更新技能、写技能、技能模板、扩展技能 | 在 `.agents/skills/` 下创建或更新技能 |

### 产品规划

| 技能 | 触发关键词（任一匹配即触发） | 说明 |
| --- | --- | --- |
| `pm-market-research` | 市场调研、竞品分析、分析市场、竞争对手分析、TAM、SAM、SOM | 市场规模与竞品对比；产出存 **`docs/`** |
| `pm-user-persona` | 用户画像、定义目标用户、用户分析、用户分层、Persona | 创建用户画像与用户旅程；产出存 **`docs/`** |
| `pm-user-interview` | 用户访谈、访谈提纲、用户调研、需求挖掘、分析访谈 | 设计访谈提纲或分析访谈记录；产出存 **`docs/`** |
| `pm-feature-prioritization` | 功能排优先级、需求排期、哪些功能先做、功能评估、RICE、MoSCoW | 多框架功能优先级排序；产出存 **`docs/`** |
| `pm-roadmap` | 路线图、产品规划、版本计划、roadmap、里程碑 | 季度/年度路线图；产出存 **`docs/`** |
| `pm-okr-designer` | 制定OKR、设计KPI、指标拆解、目标管理 | OKR/KPI 体系设计；产出存 **`docs/`** |
| `pm-product-metrics` | 数据分析、埋点设计、指标体系、数据看板、漏斗分析、留存分析 | 埋点方案与数据分析；产出存 **`docs/`** |
| `pm-sprint-planning` | 迭代规划、sprint计划、需求拆解、任务分解、迭代复盘 | 敏捷迭代规划与复盘；产出存 **`docs/`** |
| `pm-stakeholder-report` | 做汇报、写汇报材料、产品复盘、产品Review、向老板汇报 | 面向管理层/团队的汇报材料；产出存 **`docs/`** |
| `pm-release-notes` | 发版说明、更新日志、版本更新、changelog、上线公告 | 面向用户或团队的发版说明；产出存 **`docs/`** |
| `pm-product-pipeline` | 走完整流程、一键生成所有文档、完整产品交付、从0到1 | 编排「调研 → 画像 → 优先级 → 路线图 → PRD → 原型 → 测试 → 手册 → 发版」全流程 |

**本仓库未包含的技能**（勿当作本包内置）：`feature-dev`、`annotation`。「做页面 / 做功能」一律用 `prototype-demo`；PRD 由 `prd-writer` / `prototype-to-prd` / 可选 `prototype-list` 覆盖。

## 交付模式（PRD 类技能）

用户可在首句声明 **快速模式 / 标准模式 / 严格模式**；未声明时 `prd-writer` / `prototype-to-prd` 默认「标准」。

| 模式 | 触发词示例 | `prd-writer` | `prototype-to-prd` |
| --- | --- | --- | --- |
| **标准**（默认） | （默认） | 分两版交付；可说「快速模式」等走快路径（单文件） | 盘点 **默认继续**；概念版 → 落地版 |
| **快速** | 快速模式、直接写 PRD、跳过概念版 | 单文件 PRD；跳过概念版；MVP 用 §4 🔴 | 盘点默认继续；可跳过概念版 |
| **严格** | 严格模式、正式交付、完整审查 | 完整概念版确认 + MVP 口头确认 | 盘点须用户确认后再写 PRD |

**自动升档**：用户消息含 **正式交付、验收、完整审查、严格模式** 等意图时，整任务升为 **严格**。

## 执行规则

**检查清单（每次收到用户请求时建议执行）：**

1. **触发检测**：扫描用户消息是否命中上表「触发关键词」列（含同义口语变体）。
2. **强制调用**：若命中，须先通过 `Skill` 工具加载对应技能名称（与上表第一列一致），**不得**在未加载技能的情况下直接大段写代码、生成文档或改文件。
3. **禁止跳步**：不允许跳过技能直接实现、直接杜撰需求结构或自行「简化」技能规定的输出格式。
4. **工作流遵守**：加载技能后，须阅读并执行该目录下的 `SKILL.md`，严格按文档内步骤与门禁执行。
5. **完整性检查**：不省略步骤、不擅自合并技能规定的多阶段输出；若技能要求任务清单，须按清单逐项更新状态。

**示例判断：**

✅ 正确：
```
用户："做一个 SaaS 落地页，要有价格和 FAQ"
→ 命中「落地页」等 → Skill: prototype-demo（end=web）
→ 阅读 .agents/skills/prototype-demo/SKILL.md → 从 frame/web 初始化并交付 web/
```

✅ 正确：
```
用户："帮我从零写一份健身 App 的 PRD，想法是记录训练与饮食"
→ 命中「PRD」「App」→ Skill: prd-writer
→ 阅读 .agents/skills/prd-writer/SKILL.md → 按模式 A 分两版写入 docs/*.md；不写实现代码
```

✅ 正确：
```
用户："把这个 PRD 整理成功能清单和全站页面结构，再定 MVP"
→ 命中「功能清单」「页面结构」「MVP」→ Skill: prototype-list
→ 写入 docs/*功能清单*.md 后，再接 prototype-demo 落原型
```

✅ 正确：
```
用户："做一个用户管理后台，含列表和编辑表单"
→ 命中「管理后台」「CRUD」→ Skill: prototype-demo（end=admin）
→ 流程 A/B：scaffold frame/admin、按 pages.md 增页
```

❌ 错误：
```
用户："实现用户管理页面"
→ 未选技能直接改 html ← 错误！应 Skill: prototype-demo 并先确认端别
```

❌ 错误：
```
用户："帮我写 PRD"
→ 跳过第零步与三视角诊断，直接输出一版长文档 ← 错误！应先 Skill: prd-writer
```

## 推荐工作流

### 单技能路径

1. **有基本产品/功能方向，要写或迭代 PRD** → `prd-writer`
1b. **已有 Axure 导出 HTML 或要对线上站点逆向写 PRD** → `prototype-to-prd`
1. **要先对齐功能与页面/屏结构、分期与 MVP 边界** → `prototype-list`
2. **PRD 中需要流程图/架构图** → `diagram-generator`
3. **静态原型（WEB / Admin / APP）** → **`prototype-demo`**（web/app 创建先问 Style；admin 用母版配色；按端交付 `web/` / `admin/` / `app/`）
4. **原型完成后写测试用例或操作手册** → `pm-test-cases` / `pm-operation-manual`
5. **对外汇报或路演** → `slides` 或 `pm-stakeholder-report`

### 产品规划路径（方案 B）

1. **只有想法，要先验证市场** → `pm-market-research` → `pm-user-persona` → `pm-feature-prioritization` → `pm-roadmap`
2. **定目标与度量** → `pm-okr-designer` / `pm-product-metrics`
3. **研发排期与复盘** → `pm-sprint-planning`
4. **版本上线对外说明** → `pm-release-notes`
5. **一次性走完从 0 到 1** → `pm-product-pipeline`（内部串联上述技能与 `prd-writer`、`prototype-list`、`prototype-demo` 等）

✅ 正确：
```
用户："我想从想法到原型一次性走完"
→ 命中「完整产品交付」→ Skill: pm-product-pipeline
→ 按流水线阶段依次调用 pm-market-research、prd-writer、prototype-demo 等
```

## 扩展技能依赖说明

| 路径 | 用途 |
| --- | --- |
| `.agents/skills/common/export-word.ps1` / `.py` / `.sh` | `prd-writer`、`pm-test-cases`、`pm-operation-manual` 等的 Word 导出 |
| `.agents/skills/common/config.json` | 导出与图表渲染 API 配置 |
| `.agents/skills/diagram-generator/references/drawer.md` | `diagram-generator` 的子 Agent 定义 |
| `.agents/skills/diagram-generator/references/*-rules.md` | `diagram-generator` 绘图规范 |
| `frame/` | 三端共享母版与 vendor（`index.json` 注册）；由 `prototype-demo` 消费 |
| `.agents/skills/prototype-demo/scripts/` | `scaffold.mjs`、`sync-arco-template.mjs` |

## 通用原则

### 克制

只做被明确要求的事；未提到的样式、动效、额外组件不要自行追加。若认为有必要扩展，先征得同意再动手。

### 注释与可维护性

以当前所用技能中的约定为准（例如 `web/`、`admin/`、`app/` 下的文件组织、样式作用域、禁止 CDN 等）。在技能未单独规定处：对非显而易见的逻辑保留简短注释，便于后续把原型迁入工程化项目时对照。
