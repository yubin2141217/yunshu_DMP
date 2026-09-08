# frame/ — 共享原型框架

本目录是资源包根级的 **原型母版与运行时资产库**，由统一技能 `prototype-demo` 消费。约定文档（`component.md` / `charts.md` / `setup.md` 等）放在技能 `references/`，**不要**再复制进本目录。

配套入口：技能 [.agents/skills/prototype-demo/SKILL.md](../.agents/skills/prototype-demo/SKILL.md)；注册表 [index.json](./index.json)。

Admin 母版用法：[admin-usage.md](./admin-usage.md)。

## 设计目标

| 目标 | 做法 |
| --- | --- |
| 单一原型入口 | 仅保留技能 **`prototype-demo`** |
| 共享母版外置 | 运行时母版与 vendor 放在包根 **`frame/`**，不堆在技能 `assets/` 内 |
| 端别清晰 | 交付仍落在项目根 **`admin/`**、**`web/`**、**`app/`**（或自定义 `--out`）；框架目录默认与端同名 |
| 可扩展 | 新增组件模板库 → 在 `frame/` **根下新建文件夹** + 改 `index.json`；**不改名**现有 `admin` / `web` / `app` |

## 包结构

本目录挂在**资源包根**下。包根约定与本目录的关系如下（注释风格与包级说明一致）：

```text
vibepm-demo-agent/                         # 资源包根目录
├── .agents/                               # AI 技能与 Agent 配置
│   └── skills/                            # 技能工作流（prd-writer、prototype-demo 等）
│       ├── prototype-demo/                # 统一三端原型技能（消费 frame/）
│       │   ├── SKILL.md
│       │   ├── references/{admin,web,app}/
│       │   └── scripts/
│       │       ├── scaffold.mjs           # 从 frame 初始化交付目录
│       │       └── sync-arco-template.mjs
│       └── …                              # 其余技能（文档 / PM / 图表等）
├── docs/                                  # 项目文档目录（PRD、功能清单、手册等产出）
├── frame/                                 # 共享原型母版与运行时资产（本目录）
│   ├── README.md                          # 本文（架构 + 操作约定）
│   ├── index.json                         # 端 → 框架注册表（必改入口）
│   ├── gallery.html                       # 母版样板预览 Gallery（非 scaffold 产物）
│   ├── .style/                            # 预置视觉规范；web/app 创建时必问并写入交付 css
│   ├── admin/                             # 后台默认母版（Vibe Design Pro 全量 runtime）
│   ├── web/                               # WEB 默认资源包（fonts/vendor/images…）
│   └── app/                               # APP 默认壳 + vendor（iOS/微信壳、Vant…）
├── AGENTS.md                              # AI 技能触发与规范索引
├── CHANGELOG.md                           # 技能包版本变更记录
├── admin/ | web/ | app/                   # 交付产物（资源闭环；`--out` 也可为 web-saas 等）
└── …
```

| 包根项 | 与 `frame/` 的关系 |
| --- | --- |
| `.agents/skills/` | 工作流与约定文档；`prototype-demo` 通过 scaffold 从本目录拷贝母版 |
| `docs/` | 产品/流程文档产出区；**不**放母版 runtime |
| `AGENTS.md` | 包级触发词与技能索引；指向本目录为共享母版 |
| `CHANGELOG.md` | 技能包版本记录（含 `frame/` 架构变更） |
| 交付 `admin` / `web` / `app` | scaffold 输出；运行时只引用交付目录内资源，不依赖本目录路径 |

## 职责划分

| 区域 | 放什么 | 不放什么 |
| --- | --- | --- |
| `frame/*` | 可复制的母版、壳、vendor、`_meta` | 产品业务页、PRD、技能流程长文 |
| `prototype-demo` | 端别判断、Theme/Style、pages 索引、脚手架 | 大体积 runtime（应引用 frame） |
| 交付 `admin` / `web` / `app` | 用户可见原型；路径只引用本目录内资源 | 运行时依赖 `frame/` 或技能路径 |

### 术语：--framework ≠ --out

| 参数 / 字段 | 含义 |
| --- | --- |
| `--end` | 端别：`admin` / `web` / `app` |
| `--framework` | `index.json` 中的**母版库 id**（从哪拷）；默认常与端同名，扩展库可不同 |
| `--out` | **交付根目录**（页面写到哪）；默认 `admin`/`web`/`app`，也可 `web-saas` 等 |

默认三端时三者字符串可能都是 `web`，容易误以为是一回事——**母版 id 与输出目录是两套概念**。

## 目录与当前库

默认三套目录挂在本目录根下，与交付端同名；**勿改这三套目录名**。不再使用 `frame/admin/arco-pro` 这类「端/库」嵌套。端别由 [index.json](./index.json) 的 `ends` 声明；`path` 为相对本目录的文件夹名。

| 路径 | 端 | capability | 说明 |
| --- | --- | --- | --- |
| `admin/` | admin | `full-runtime` | Vibe Design Pro：Shell、多页样板、vendor、boot/routes |
| `web/` | web | `vendor-and-conventions` | fonts / vendor / 图片等本地化资源 |
| `app/` | app | `shells-and-vendor` | iOS/微信壳 HTML + css/js + vendor |

能力可以不对称：admin 是完整后台 runtime；web/app 现阶段偏基座 + 约定，页面仍由技能规则生成。

| 框架目录 | 交付目录 | 说明 |
| --- | --- | --- |
| `frame/admin` | `admin/`（或 `--out`） | scaffold 复制 runtime（不含 `_meta/`、`scripts/`） |
| `frame/web` | `web/`（或 `--out`） | 首次建站复制 fonts/vendor/images |
| `frame/app` | `app/`（或 `--out`） | 选壳模板生成页面，并复制运行时资源 |

**禁止**：交付页运行时引用 `frame/` 或技能目录。**禁止**把 `*-preview` 当作 scaffold 输出目录名。预览母版或交付页：**默认**用浏览器直接打开对应 html；仅当 `file://` 明显异常且用户需要时，再可选对 `frame/<名>/` 或已交付目录起静态服务。

## index.json 注册表

`index.json` 是 scaffold 与 Agent 的**唯一选型源**。只建文件夹不登记 → 技能/脚手架**不会**使用该库。

```json
{
  "ends": {
    "admin": {
      "outputDir": "admin",
      "defaultFramework": "admin",
      "frameworks": {
        "admin": {
          "path": "admin",
          "theme": "arco",
          "capability": "full-runtime",
          "label": "管理后台 · Vibe Design Pro",
          "configFile": ".admin-config.json",
          "status": "ready"
        }
      }
    }
  }
}
```

| 字段 | 含义 |
| --- | --- |
| `ends.<end>` | 端：`admin` \| `web` \| `app` |
| `outputDir` | 默认交付目录名 |
| `defaultFramework` | 未指定时使用的 framework id |
| `frameworks.<id>.path` | 相对 `frame/` 的文件夹名 |
| `theme` | （admin）组件库主题键，供 `--theme` / 配置写入 |
| `configFile` | （admin）交付配置文件名；web/app 为 `.prototype-config.json`（见技能 `references/config.md`） |
| `status` | `ready` 可用；`pending` 不可 scaffold |
| `capability` | 能力级别提示（文档/Agent 用） |

根目录 framework id **全局唯一**。多端同名库用可区分文件夹名（如 `admin-element-plus`），避免两个 end 抢同一个 `path`。

## 扩展框架（示例：新后台库）

1. 在 `frame/` 根下新建，例如 `admin-element-plus/`（**不要**覆盖或重命名现有 `admin/`）。
2. 按需补 `_meta/template.manifest.json`（建议另加 `pages.catalog.json`）。
3. 在 `index.json` → `ends.admin.frameworks` 增加条目；默认仍用现有库时 **不要**改 `defaultFramework`：

```json
"admin-element-plus": {
  "path": "admin-element-plus",
  "theme": "element-plus",
  "capability": "full-runtime",
  "label": "管理后台 · Element Plus",
  "configFile": ".admin-config.json",
  "status": "ready"
}
```

4. 创建时指定：

```bash
node .agents/skills/prototype-demo/scripts/scaffold.mjs --end admin --theme element-plus --out admin
# 或
node .agents/skills/prototype-demo/scripts/scaffold.mjs --end admin --framework admin-element-plus --out admin
```

5. 同步更新：该库 `_meta`、技能侧 `references/admin/`（design-system-index / setup / pages，仅流程）、必要时 `SKILL.md`。
6. **上墙（可选）**：`gallery.html` **不**读 `index.json`。只有官方样板要出现在预览墙时，再改 Gallery 内手写清单（见下节）。不做预览墙则跳过。

web / app 扩展同理：根下新目录 + 挂到对应 `ends.web` / `ends.app`。

## Gallery 预览

[`gallery.html`](./gallery.html) 是策展样板墙，**不是** scaffold 选型源。Agent 做原型、增页以 `index.json` 与各库 `_meta/pages.catalog.json` 为准，不要改本页。

| 要点 | 说明 |
| --- | --- |
| 不同步注册表 | 端 / 页 / 主题清单写在页面脚本里（`ENDS`、`ADMIN_PAGES`、`APP_PAGES`、`STYLE_CATALOG`）。只改 `index.json` **不会**自动上墙 |
| 何时改 | 官方默认库增了要展示的样板，或新库明确要进预览墙 |
| 改什么 | 对应端的页面数组 + `PAGES_BY_END`；新端还要改 `ENDS`（`ready` / `base`） |
| 预览桥 | admin 用 `?galleryPreview=1` 跳过登录（非交付行为）；http 下 Gallery 用 srcdoc 注入预览钩子（不改母版）以免登录态把登录页踢走；app 壳页须挂 `js/gallery-bridge.js` |
| 不要当源 | 交付与增页路径以 catalog 为准；Gallery 字段（分类、iframe 尺寸、`live`）只服务预览壳 |

页内「使用说明」面向浏览者（对照样板、跟 Agent 说「参考某某页」），不讲接入。WEB 端若仍显示「即将」，表示该端尚未写入 Gallery 清单，与 `frame/web` 是否可供 scaffold 无关。

## 用户自建框架（项目根）

用户把自建母版或已搭好的站点放在**资源包/项目根**（未必在 `frame/` 下）时，由技能 `prototype-demo` 第 0 步分流，**禁止**静默用本目录默认库覆盖。

| 情况 | 推荐动作 |
| --- | --- |
| 根下已是交付形态 `admin/` / `web/` / `app/` | 当作已初始化 → 技能 **流程 B**；可补写配置并标 `scaffoldMode: external` |
| 另有源目录，愿纳入共享母版 | **迁入本目录**（或登记 `path`）+ `index.json` + `_meta` → 再用 scaffold `--framework`（上文「扩展框架」） |
| 坚持外置、不搬入本目录 | 技能 **流程 C**：确认路径、写入交付配置（`sourcePath` / `scaffoldMode: external`），增页跟现有结构 |
| 脏目录（Axure 导出等，无本技能配置） | **先问**：换 `--out` / 清空重建 / 走流程 C；未确认不得覆盖 |

长期维护仍建议走「扩展框架」登记，以便 scaffold 与 catalog 可复用。流程细节见技能 `SKILL.md`（流程 C）。多端或多交付根并存时须先盘点并锁定唯一 `--out`。

## Scaffold

脚本：`.agents/skills/prototype-demo/scripts/scaffold.mjs`（工作目录为资源包根；读本目录 `index.json`）。非空 `--out` 拒绝覆盖。

| `--end` | 复制行为（摘要） | 写入配置 |
| --- | --- | --- |
| `admin` | **默认 lean**：运行时 + `login-cover.html`；业务页按 catalog 按需复制。`--full` 才整包样板 | `.admin-config.json` |
| `web` | `fonts` / `vendor` / `images` | `.prototype-config.json` |
| `app` | `css` / `js` / `fonts` / `images` / `vendor`（含 global.css） | `.prototype-config.json` |

```bash
node .agents/skills/prototype-demo/scripts/scaffold.mjs --end admin --theme arco --out admin
node .agents/skills/prototype-demo/scripts/scaffold.mjs --end web --out web
node .agents/skills/prototype-demo/scripts/scaffold.mjs --end app --out app
# 同母版、自定义交付目录:
# node .../scaffold.mjs --end web --out web-saas
```

同步外部 Arco 静态母版到 `frame/admin`：

```bash
node .agents/skills/prototype-demo/scripts/sync-arco-template.mjs --from <外部Arco静态目录>
```

## 技能工作流（与 frame 的关系）

1. **判定 end**（admin / web / app）；不明则先问。多交付根时锁定唯一 `--out`。
2. **流程 A**（尚无交付；目标根须为空）：读 `index.json` → scaffold → 按 `references` 增首批页。
  - **admin**：母版默认配色，**不**询问 Style。
  - **web / app**：创建时**必问** Style（枚举本目录 `.style/*-style.md`），选定后写入交付 `css/global.css` 与 `.prototype-config.json`。app 还须问壳。
3. **流程 B**（已有交付）：读 `.admin-config.json` 或 `.prototype-config.json` → **禁止擅自换 theme/库** → 从对应 frame 样板或已有页复制改业务。web/app **不重问** Style。
4. **流程 C**（外置自建、不搬入本目录）：确认路径，写入 `sourcePath` / `scaffoldMode: external`；后续增页走流程 B external。

用户明确要求改品牌色 / 明暗 / 布局时：只改**交付目录**（admin 见技能 `references/admin/style.md`），**禁止**改 `frame/`。包维护者更新共享母版则直接编辑本目录（见「维护」）。

## _meta/（可选）

各框架目录可含 `_meta/`，供 Agent / scaffold 读取，**不复制**到交付目录。浏览器预览交付页时不应依赖 `_meta`。

| 文件 | 用途 |
| --- | --- |
| `template.manifest.json` | 模板 id、theme、version、`pageTypes` / shells、status 等（必填）；可含 `pagesCatalog` 指向同目录 catalog 文件名 |
| `pages.catalog.json` | （admin 等 full-runtime 建议提供）`page-type →` 样板 html/js/css；**以各库为准**，勿把路径写死在技能 `references/` |

增页选型流程见技能 `references/admin/pages.md`；样板路径只读当前 framework 的 catalog。交付配置（如 `admin/.admin-config.json`）由 scaffold 生成。

## 维护

- **更新共享母版**（包维护）：直接编辑 `frame/admin/`（优化落在 theme CSS / `boot.js`，勿改 `vendor/arco` 源码）。项目换肤不要走这条路径。
- **预览**：默认直接打开对应 html（admin 演示账号 `admin` / `123456`）。浏览多页样板打开 `frame/gallery.html`。仅 `file://` 异常时再起静态服务。官方库增页后若要上墙，同步改 Gallery 手写清单（见「Gallery 预览」）。
- 技能工作流、Style/Theme 门禁见 `.agents/skills/prototype-demo/SKILL.md`；包级触发见 `AGENTS.md`。

## 改造清单（衍生技能包可对照）

- [ ] 包根存在 `frame/{admin,web,app}` 且三套**目录名不变**
- [ ] `frame/index.json` 与真实文件夹、`defaultFramework` 一致
- [ ] 仅保留 `prototype-demo`（旧三 generator 名只作别名）；AGENTS 触发词指向该技能
- [ ] scaffold 的 `FRAME_ROOT` 指向包根 `frame/`
- [ ] 技能 `references` 中的路径写 `frame/admin` 等，而非旧 `assets/templates/...` 或 `frameworks/`
- [ ] 交付目录资源闭环；无 CDN；无运行时引用 `frame/`
- [ ] web/app 创建询问 `frame/.style/`；admin 创建不询 Style；项目换肤不改 `frame/`
- [ ] 新增库：根下新文件夹 + 改 `index.json` + `_meta`（manifest + 建议 `pages.catalog.json`）+ 补 references 流程文
- [ ] （可选）官方样板要进预览墙时，同步 `gallery.html` 手写清单；不要假设它跟随 `index.json`

## 与旧架构对照

| 旧 | 新 |
| --- | --- |
| 三技能入口 `vibepm-web-generator` / `vibepm-admin-generator` / `vibepm-app-generator` + 各自 `assets/` | 一技能 **`prototype-demo`** + 根级 `frame/`（旧名仍走本技能） |
| `assets/templates/admin-arco-pro` 或包根 `frameworks/` | `frame/admin` |
| web/app assets 挂在技能下 | `frame/web`、`frame/app` |
| 无统一注册表 | `frame/index.json` |
| 文档散落在各 generator | `prototype-demo/references/*` + 本文 |
| 创建流程不注入 Style | **web/app 创建必问** `frame/.style/`；**admin 仍不询** |

## 相关文件

| 路径 | 用途 |
| --- | --- |
| [index.json](./index.json) | 端 → 框架注册表 |
| [admin-usage.md](./admin-usage.md) | Admin 母版使用说明 |
| [gallery.html](./gallery.html) | 母版样板预览 Gallery（手写清单，不读 `index.json`） |
| [.style/](./.style/) | 预置视觉规范（`*-style.md` + `*-preview.html`）；web/app 创建时枚举 |
| [admin/](./admin/) | 后台默认母版（Vibe Design Pro） |
| [admin/_meta/template.manifest.json](./admin/_meta/template.manifest.json) | 模板元数据 / pageTypes |
| [admin/_meta/pages.catalog.json](./admin/_meta/pages.catalog.json) | page-type → 样板路径 |
| [web/](./web/) | WEB 默认资源 |
| [app/](./app/) | APP 默认壳与 vendor |
| `../.agents/skills/prototype-demo/SKILL.md` | 统一原型技能 |
| `../.agents/skills/prototype-demo/references/config.md` | 交付配置字段；盘点交付根 |
| `../.agents/skills/prototype-demo/references/admin/charts.md` | Admin 图表规范（全文） |
| `../.agents/skills/prototype-demo/references/web/style.md` | WEB 创建时 Style 选型 |
| `../AGENTS.md` | 包级触发与工作流 |
