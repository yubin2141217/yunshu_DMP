---
name: prototype-demo
description: 统一静态原型技能：WEB 官网/落地页、管理后台、APP 设备壳。共享母版在包根 frame/；交付到 web/、admin/ 或 app/。旧名 vibepm-web-generator、vibepm-admin-generator、vibepm-app-generator：用户说这些名称或对应 slash 时仍走本技能。触发词含创建页面、落地页、管理后台、CRUD、APP原型、设备框、/prototype-demo 等。
user-invocable: true
---

## 目标

- **一个技能入口**覆盖三端静态原型；按端别选型后交付 `web/`、`admin/` 或 `app/`。旧名 `vibepm-web-generator` / `vibepm-admin-generator` / `vibepm-app-generator` 仍走本技能，禁止再当独立技能目录调用。
- **共享框架**默认只读自包根 `frame/`（见 `frame/index.json`）；技能目录只保留流程、references 与 scaffold。
- **用户自建框架**（项目根下已有交付目录或外置母版）优先延续，禁止静默用官方母版覆盖；见第 0 步分流与 **流程 C**。
- HTML / CSS / JS 分离；vendor 本地化；禁止 CDN；交付目录内资源闭环。

### 规范优先级（web / app）

```
style.md（含预览同步 / 字体 / Motion）
  > component.md（结构 / IA / 交互语义）
  > frontend-design.md（气质与表达；不得另起色板、字体族或推翻已选 Style）
```

admin：`pages.md` / catalog 样板 > `component.md` > `setup.md`；视觉覆盖仅用户点名时走 `admin/style.md`（不改 `frame/`）。

### 术语：`--framework` ≠ 交付目录名

| 参数 / 字段 | 含义 |
| --- | --- |
| `--end` | 端别：`admin` / `web` / `app` |
| `--framework` | `frame/index.json` 中的**母版库 id**（从哪拷）；默认常与端同名，**扩展库可不同** |
| `--out` | **交付根目录**（页面写到哪）；默认 `admin`/`web`/`app`，也可 `web-saas` 等 |

默认三端时三者字符串可能都是 `web`，容易误以为是一回事——**母版 id 与输出目录是两套概念**。

### 上游输入（有则对齐）

动手前扫一眼项目根；**以 `prd-writer` 产出为主，`prototype-list` 为辅**：

| 优先级 | 存在 | 用法 |
| --- | --- | --- |
| **主** | `docs/` 下由 `prd-writer`（或等价）产出的 PRD / 需求稿 | 对齐范围、角色、主路径、验收口径；**不发明 PRD 未写的大模块** |
| **辅** | `docs/` 下功能清单 / 页面结构（`prototype-list`） | 有则按其第 2 章页面结构落页、MVP 先做；**与 PRD 冲突时以 PRD 为准**，清单仅作信息结构参考 |
| — | 用户 `@` 的需求/清单路径 | 按上表：需求稿视作主，清单视作辅 |
| — | 皆无 | 按用户口述做 MVP；范围不清时先问再写 |

不在本技能内撰写或大改 PRD（改走 `prd-writer`）；仅缺页面结构、已有 PRD 要拆屏时可辅以 `prototype-list`。

---

## 第 0 步：判定端别（End）与基座来源

| 端 | 交付目录 | 典型信号 | 默认 framework |
| --- | --- | --- | --- |
| **admin** | `admin/` | 管理后台、运营后台、控制台、CMS、CRUD、列表/表单页、Arco、数据看板 | `admin` |
| **web** | `web/` | 企业官网、落地页、营销页、多页静态站 | `web` |
| **app** | `app/` | APP 原型、手机页、小程序壳、iOS/微信框、带壳页面 | `app` |

用户未说明且语境不明时 **先询问** 再继续。同一会话可多端交付，但每个交付目录独立配置。

**视觉覆盖（admin）**：用户明确要求改品牌色 / 默认明暗 / 布局默认 / Shell 气质等 → 读 `references/admin/style.md`（非创建选型；只改交付目录）。

### 多端 / 多交付根并存（防冲突）

项目根常同时存在 `admin/`、`web/`、`app/`，或同端多个交付根（如 `web/` + `web-saas/`）。**生成或增页前必须锁定唯一写入目标**，禁止凭猜测写错目录。

1. **盘点**（步骤见 `references/config.md`「盘点交付根」）：列出含配置的目录 + 标准 `admin|web|app/`；无配置且结构异常标为脏目录。
2. **定端**：用语命中则选端；**多端都在且话术含糊** → **先问端别**。
3. **定交付根（`--out`）**：该端仅一个 → 用之；多个 → **先问**；会话已锁定的根可延续，换根再确认。**不要**用 `--framework` 代替 `--out`。
4. **隔离写入**：一次只改一个交付根；不改其它端；`frame/` 只读。
5. **同名防覆盖**：已有同名 html（及 css/js）或 admin `pageKey` → 先问，勿静默覆盖。
6. **scaffold**：仅流程 A 且目标根为空或不存在（或用户同意清空重建）；`--out` = 锁定根。脚本对非空目录会 abort。

| 冲突场景 | 正确做法 |
| --- | --- |
| 根下已有三端，用户说「加页面」 | 先问端别 → 写入锁定根 |
| `web/` 与 `web-saas/` 并存 | 先问写入哪一个 |
| 目标已有 `pricing.html` | 询问后再写 |
| 「三端各做一页」 | 拆三次，每次一端一根 |

### 脏目录 / 非本技能交付（尤指 web）

目标路径已有文件，但**不像**本技能交付时（缺 `.prototype-config.json` / `.admin-config.json`，却含大量 `data/`、`files/`、Axure 导出、`start_c_*.html`、与 frame 结构不符的资源）→ **禁止**对该目录执行默认 scaffold 或当流程 B 热补。

**先问用户**：

1. 换新交付根（推荐，如 `web-saas/`、`web-marketing/`）再走流程 A；或  
2. 确认清空/移走旧内容后重建；或  
3. 将该目录当外置基座走流程 C（少见）。

未确认前不得覆盖、混写。

### 基座来源分流

先判定端别与交付根，再判定基座：

```
用户点名自建框架 / 根目录外置母版？
  愿登记进 frame/ + index.json → 扩展框架后走流程 A（--framework）
  坚持用根目录外置、不搬 frame → 流程 C
否则，目标是否为「脏目录 / 非本技能交付」？
  是 → 见上文「脏目录」；先问再继续
否则，已有对应交付（有配置或可识别的本技能结构）？
  admin/.admin-config.json 或完整 Shell → 流程 B
  web/.prototype-config.json 或本技能结构页面 → 流程 B
  app/.prototype-config.json 或已有壳页 → 流程 B
否则 → 流程 A（目标根须为空；--out 为锁定根）
```

| 形态 | 典型信号 | 处理 |
| --- | --- | --- |
| **已是交付目录** | 有配置或本技能结构 | **流程 B**；禁止 rescaffold |
| **脏目录** | Axure/杂乱导出、无本技能配置 | **先问**换 `--out` / 清空 / 流程 C |
| **自建母版（愿接入）** | 用户同意迁入/登记 | `frame/index.json` 后流程 A |
| **外置母版（不搬）** | 「就用根目录这份」 | **流程 C** |
| **结构不明** | 都不像 | **先问**端别 + 基座还是母版 |

**禁止**：未获同意用 `frame/{admin|web|app}` 覆盖已有自建或脏目录。

---

## 流程 A：创建框架 / 基座

### 共用

1. 读 `frame/index.json`，确认 framework `status: ready`。
2. 在**资源包根**执行脚手架（`--out` = 锁定交付根）：

```bash
node .agents/skills/prototype-demo/scripts/scaffold.mjs --end admin --theme arco --out admin
node .agents/skills/prototype-demo/scripts/scaffold.mjs --end web --out web
node .agents/skills/prototype-demo/scripts/scaffold.mjs --end app --out app
# 同母版、自定义交付目录:
# node .../scaffold.mjs --end web --out web-saas
# 扩展母版（须已在 frame/index.json 登记）:
# node .../scaffold.mjs --end web --framework <母版id> --out <交付目录名>
```

3. **禁止**把 `-preview` 当作交付目录；预览母版可直接在资源管理器 / IDE 中打开 `frame/...` 下对应 html（默认**不**要求用户启静态服务）。
4. 用户要求删除某目录时 **只删不建**，勿顺带 rescaffold。

### A · admin

1. **Theme**：仅 **`arco`** → `frame/admin`。配色母版默认，**不**询问 Style。
2. scaffold（默认 **lean**）→ 写入 `.admin-config.json`。
3. 首批业务页：按 `references/admin/pages.md` 整页复制样板 → 改业务；更新 `js/routes.js`。

```bash
node .agents/skills/prototype-demo/scripts/scaffold.mjs --end admin --theme arco --out admin
# --full 少用
```

### A · web

1. **询问 Style**（`references/web/style.md`）：枚举 `.style/` / 主色 / 默认；**先定案，再 scaffold**（此时尚不写完整 tokens 也可，避免空目录卡死）。
2. scaffold：`--out` 锁定根；复制 `fonts` / `vendor` / `images`；写 `.prototype-config.json`（随后补全 `styleSource`）。
3. **落实 Style**：字体本地化 + 预览同步（含 Motion）→ `css/global.css` + 可复用 JS；更新配置。
4. 首页：`index.html` + `css/index.css` + 可选 `js/index.js`；`header` / `main` / `footer`。
5. Font Awesome：`./vendor/fontawesome/css/all.min.css`。细则 `references/web/`。

### A · app

1. **询问 Style + 壳**（`app/style.md`、`shells.md`）；未明确先问。底部一级导航才用 `ios_frame_tabs.html`。
2. scaffold → `.prototype-config.json`（`styleSource`；可选 `shell`）。
3. 按 `app/style.md` → `web/style.md` 落实到 `css/global.css`。
4. 壳自 `frame/app/*.html`；内容在 `main.screen-content > section.app-shell`；路径改为交付根内相对路径。
5. 不整页引用模板 frame CSS。细则 `references/app/`。

---

## 流程 B：新增 / 修改页面

### admin

1. 读交付根 `.admin-config.json`；禁止换 theme / 混组件库。
2. 官方库：`pages.md` + catalog **整页复制** html/js/css → 改业务，保留 `pro-*`。
3. external：仿**本交付根**已有页；不强制拷 `frame/admin`。
4. 更新 routes / 菜单；`pageKey` 不冲突；不删 Shell。

### web / app

1. 读交付根 `.prototype-config.json` 与目录；**延续** Style / IA / 壳，不重问 Style。
2. **web**：按 `references/web/pages.md`（语义命名、挂链、文件三件套）。
3. **app**：按 `references/app/pages.md`（壳内多屏、不动画外框）。

---

## 流程 C：用户自建 / 外置基座

用户在项目根自建框架且不（或尚未）迁入 `frame/` 时用。须写清配置；后续增页走流程 B external。

### 门禁

1. 确认端别、源路径、交付根、in-place 还是复制。
2. 禁止对已有自建跑默认官方 `scaffold.mjs`。
3. 能力缺口先说明再动手。

### 步骤

1. 源 ≠ 交付则复制并改相对路径。
2. 写入配置（字段表见 `references/config.md`）：

**admin** `.admin-config.json`：

```json
{
  "end": "admin",
  "frameworkId": "user-root",
  "theme": "custom",
  "sourcePath": "./my-fw",
  "scaffoldMode": "external"
}
```

**web / app** `.prototype-config.json`：

```json
{
  "end": "web",
  "frameworkId": "user-root",
  "sourcePath": "./my-fw",
  "scaffoldMode": "external",
  "styleSource": "existing"
}
```

`frameworkId` = 母版 id；交付目录名用 `--out` / 配置里的 `outputDir`，二者不要混用。

3. 仿本目录结构增页；web/app 已有视觉基线则不重问 Style。
4. 建议稳定后迁入 `frame/<id>/` 并登记，再用 `--framework <id>`。

---

## 交付摘要（任务结束必给）

向用户简短说明：

1. **端** + **交付根路径**（如 `web-saas/`）  
2. **页面列表**（入口文件名）  
3. **Style / Theme**：web/app 的 `styleSource`；admin 为 Arco 默认或已做视觉覆盖  
4. **如何打开**：**默认**用浏览器直接打开对应 html 文件（给出路径即可）；**不**默认推荐用户启静态服务。仅当 `file://` 下明显异常（如部分模块加载失败）且用户需要时，再可选本地静态服务。勿指错其它端目录。
5. **已知限制**（原型范围、未做项）

---

## 文档索引

| 路径 | 用途 |
| --- | --- |
| `frame/index.json` / `frame/README.md` | 框架注册与用户自建约定 |
| `references/config.md` | 交付配置字段表；盘点交付根 |
| `references/admin/*` | Theme、pages、视觉覆盖 `style.md` |
| `references/web/*` | Style、`pages.md` 增页、组件、overview |
| `references/app/*` | Style、壳、`pages.md` 多屏、组件 |
| `scripts/scaffold.mjs` | 初始化交付根（非空则 abort） |
