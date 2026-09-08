# Style（admin · 视觉覆盖 · 非创建选型）

**本文件不是创建时 Style 选型。** 与 `../web/style.md` / `../app/style.md` 职责不同：  
创建 / 增页 **不询问**、不注入 `.style` 预览。

仅当用户**明确要求**改后台视觉时执行——不限于品牌色，也包括默认明暗、布局默认、Shell 气质 token、点名换字体等。未点名的项保持母版默认。

**改动范围 = 交付目录**（通常为项目根 `admin/`，或用户指定的后台交付根）。  
**禁止**改包根 `frame/admin/` 母版，也禁止为单次换肤去改 `frame/` 内源文件；下次 scaffold 仍从母版拷出干净基线。

勿整页套用 `.style` / `*-preview.html`，勿按 web 的字体本地化 / 组件预置 / Motion E 层去改后台。

---

## 何时触发（关键词 / 场景）

本文件**不在** AGENTS 技能触发表单独占一行；挂在 `prototype-demo` 内，且须同时满足：

1. 语境已是 **admin 后台**（已有 `admin/` 或正在做后台），且  
2. 用户**主动**要求改视觉（创建 / 普通增页**不**自动走本文）。

| 类型 | 示例说法（命中任一且指向后台即可） |
| --- | --- |
| **主题色 / 品牌** | 改品牌色、换主题色、默认主色改成蓝/紫、客户 VI 主色、对齐品牌色 |
| **明暗** | 默认暗色、默认 dark、默认亮色主题 |
| **布局默认** | 默认侧栏通顶、默认顶栏布局、侧栏加宽/收窄 |
| **Shell 气质** | 圆角大一点、卡片边更弱、滚动条样式、间距收紧 |
| **字体** | 后台换成某某字体（仅点名时） |
| **综合** | 换肤、改后台视觉、按设计稿改配色（仍落在 Arco 变量，不换组件库） |

**不触发本文**（举例）：「做一个用户管理页」「加一个列表」→ 走 `pages.md`；「换成其它组件库」→ 换 Theme，不是本文；「创建后台」→ 用母版默认，不询 Style。

---

## 触发与禁止

| 做 | 不做 |
| --- | --- |
| 用户点名：主色 / 品牌色、默认明暗、布局默认、圆角边距、字体等 | 创建时主动询 Style 或枚举 `.style/` |
| **只**在交付 `admin/`（或指定交付根）改 `settings.js` / `arco-theme.js` / 覆盖 CSS | **改 `frame/admin/` 母版**；改 `vendor/arco` 编译产物语义 |
| 保留 Arco + `pro-*` / Shell | 换 theme、混装其它组件库，或假装成 web Style 包 |

**换 Theme（组件库）≠ 视觉覆盖**：已有 `.admin-config.json` 时不得擅自换 `theme`（见 `design-system-index.md`）。

---

## 可覆盖范围（须用户点名）

| 类别 | 典型诉求 | 落点 |
| --- | --- | --- |
| **主题色** | 默认蓝/紫、自定义品牌主色 | `settings.js` → `themeColorPreset`；或 `arco-theme.js` 追加 PRESET |
| **明暗** | 默认 dark / light | `arco-theme.js` 已有明暗机制设默认 |
| **布局默认** | 顶栏通栏 vs 侧栏通顶、侧栏宽、是否持久化 | `settings.js`（`layoutMode`、`menuWidth`、`themePersist` / `layoutPersist` 等） |
| **Shell / Pro 气质** | 圆角、卡片边、间距、阴影、滚动条 | `arco-theme-pro.css` 或其后的 `css/brand-override.css` |
| **字体** | 指定字体族 | 用户明确要求时才本地化替换；默认不改 |
| **单页例外** | 某页特殊强调色/间距 | 该页 `css/xxx.css`，不扩散为全站 |

| 默认不改 | 说明 |
| --- | --- |
| `.style` 预览组件与营销气质 | 后台保持 Arco Pro 信息密度 |
| 动效体系 | 跟 Arco；不强制同步 web Motion |
| 业务页 DOM / `pro-*` 结构 | 不为换肤重写样板 |
| `vendor/arco` | 禁止改编译产物语义 |

顶栏「主题色 / 明暗切换」仍可用；本文件改的是**默认值与基线 token**，不是拆掉运行时切换。

---

## 改哪里（优先顺序）

1. **`js/settings.js`** — 默认主题色预设、布局与持久化等开关（仅点名项）。  
2. **自定义主色（不在现有 PRESETS 内）** — 在交付 `js/arco-theme.js` **追加** preset，再改 `themeColorPreset`；或加 `css/brand-override.css`（挂在 `arco-theme-pro.css` 之后），保证与 `arco-theme.js` 写入方式一致，避免锁死按钮主色。  
3. **`css/arco-theme-pro.css`** — Shell / Pro 非色板硬编码；**勿在此写死整套 `--primary-*`**（色板由 `arco-theme.js` 动态写入）。  
4. **页面级** `css/xxx.css` — 单页例外。

可选写入 `.admin-config.json` 备注（不参与 scaffold）：

```json
"brandOverride": {
  "themeColorPreset": "blue",
  "note": "客户要求科技蓝默认主色；侧栏宽保持 220"
}
```

---

## 操作步骤（Agent）

1. 确认是 **视觉覆盖**（主色 / 明暗 / 布局 / Shell token / 字体等），不是换组件库 Theme。  
2. 列出用户点名的项；**未点名不改**。  
3. 读交付目录 `js/arco-theme.js`、`js/settings.js`、必要时 `arco-theme-pro.css`。  
4. 按上表落点修改；新主色则追加 preset 或受控覆盖 CSS。  
5. 自检：按钮 / 链接 / `--pro-theme-color`、Shell、点名项是否生效；**禁止** CDN；**未**改动 `frame/admin/`。  
6. 告知用户：顶栏切换仍可用；本次改的是交付目录默认与基线。

### 自检

- [ ] 未在创建/增页流程中主动询 Style  
- [ ] **未修改 `frame/admin/`**；未改 `vendor/arco`；未切换 `theme`  
- [ ] 仅改交付目录内用户点名项  
- [ ] Shell / `pro-*` / 样板结构仍在  

---

## 与其它文档

- Theme 选型与创建默认：`design-system-index.md`  
- CSS/脚本挂载顺序：`setup.md`  
- 增页结构：`pages.md` / `component.md`
