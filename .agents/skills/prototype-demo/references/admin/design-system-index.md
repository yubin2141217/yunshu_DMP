# 设计系统与主题索引（Theme）

后台以 **Theme（Arco Design Pro）** 为准；配色用母版默认。**创建 / 增页流程不询问、不注入 Style。**

| 层 | 决定什么 | 说明 |
| --- | --- | --- |
| **Theme** | 组件库与 Shell | 当前仅 **`arco`** → `frame/admin` |
| 配色 / 视觉 | 母版默认 | 默认不改；用户**明确要求**时走 **`./style.md`**（视觉覆盖，非创建选型） |

同一 `admin/` 仅一套 theme。已有 `.admin-config.json` 时 **不得切换 theme**（要换则新建目录或用户确认重建）。

---

## 默认组合

| 维度 | 默认值 |
| --- | --- |
| Theme | **Arco Design Pro**（`frame/admin`，theme=`arco`） |
| 配色 | 母版默认（含顶栏主题色切换） |
| 视觉覆盖 | 仅用户点名 → `./style.md`（主色 / 明暗 / 布局 / Shell token 等） |
| 图标 | Font Awesome + `fa-icons.js` |
| 结构 / IA | `./component.md` |
| 图表 | `./charts.md` |
| 挂载 | `./setup.md` |
| 增页 | `./pages.md` + `_meta/pages.catalog.json` |

---

## Theme 选型

| theme | 用户说法 | 前缀 | 布局 | Runtime / Meta | Setup | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| **`arco`** | Arco、Arco Pro、默认、未指定 | `a-*` | 侧栏 220px、顶栏 60px | `frame/admin/` + `_meta/` | `./setup.md`（arco 节） | **已同步** |

用户点名其它组件库时：说明本包暂未接入，继续用 Arco；接入步骤见 `setup.md` 文首。

### 母版目录（Arco）

```
admin/
├── _meta/
│   ├── template.manifest.json
│   └── pages.catalog.json
├── *.html
├── css/
├── js/
├── scripts/generate-html.mjs
└── vendor/
```

---

## 覆盖优先级

```
component.md（Shell / IA / 气质）
  > admin/.admin-config.json（已选 theme，增页不可变）
  > style.md（仅用户明确要求改视觉时；非创建询 Style）
  > Theme 母版默认配色与布局
```

---

## Agent 阅读顺序

**创建后台**

1. `../SKILL.md` — 流程 A  
2. 本文件 — Theme  
3. `./setup.md` — lean 基座挂载  
4. `./pages.md` — **整页复制样板 → 在 `pro-*` 结构上改业务**（禁止裸 Arco 重写）

**增页**

1. `admin/.admin-config.json`  
2. `./pages.md` + `_meta/pages.catalog.json`  
3. `./component.md` / `./setup.md`  

**用户要求改视觉（主色 / 明暗 / 布局默认 / Shell 气质等）**

1. 本文件（确认不是换 Theme）  
2. `./style.md`  
3. 交付目录 `js/settings.js` / `js/arco-theme.js` / 可选覆盖 CSS  

**创建时动作摘要**

1. scaffold（默认 lean）  
2. 写 `.admin-config.json`  
3. 按 catalog 按需复制并改造业务页  
