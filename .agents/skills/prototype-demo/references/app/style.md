# Style 选型（APP · 创建时）

**创建** `app/`（流程 A）时先处理 Style，再选壳 / 写首页。  
壳询问（`shells.md`）可与 Style 同轮。  
**增页**延续已有配置与 `css/global.css`，不重问 Style。

---

## 与 WEB 共用的规则

下列内容 **以 `../web/style.md` 为准**，勿在本文重复维护：

- 风格询问与 `.style/` 枚举  
- **字体本地化**  
- **预览同步**（主规则、A–E 含 **Motion**、操作与自检）

落实时：读选定 `*-style.md`（及预览）→ 按 `web/style.md` 写入 **本端** `app/css/global.css` 与 `app/fonts/`、可复用 JS。  
**动效不另问**；跟 Style / 预览（用户主动要求强弱时再覆盖）。

---

## APP 差异（仅此节）

1. 交付根为 `app/`（或用户指定目录）；字体 `<link>`、脚本路径注意壳页相对层级。  
2. 主题样式与动效只作用在 `app-shell` 内业务内容；**不破坏、不动画化**设备外框节点（刘海、Home Indicator、手机框本身）；模板 frame CSS **不**整页引用进交付。  
3. Motion 同步同 `web/style.md` **E**：组件微交互 + motion tokens + `prefers-reduced-motion`；**不**拷预览演示编排。屏内入场/切换按 `frontend-design.md` 与 `component.md` 按需写，缓动时长用本 Style tokens。  
4. 写入 `.prototype-config.json`：`styleSource`；可选 `stylePrimary`、`shell`。  
5. 若用 Vant：用 CSS 变量映射主题色，勿改 vendor；控件过渡优先跟 Style tokens，避免与 Vant 默认动效互相打架。  
6. 结构另遵 `component.md` + `shells.md`（壳/结构优先；视觉与微交互仍跟 Style/预览）。

**admin** 不询问 Style。仅 web / app 创建走 Style 流程。
