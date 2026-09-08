# WEB 增页约定

创建基座见技能 `SKILL.md` 流程 A · web 与 `./style.md`。本文只管**在已有交付根上增页 / 改页**。

## 前置

1. 已锁定唯一交付根（见 `SKILL.md` 多端防冲突；字段见 `../config.md`）。  
2. 读该根 `.prototype-config.json`；**延续** `styleSource` 与 `css/global.css`，不重问 Style。  
3. 同名 `*.html` 已存在 → 先问覆盖 / 换名 / 改已有页。

## 文件

| 用途 | 路径 |
| --- | --- |
| 页面 | `<name>.html`（语义化英文或拼音短名，如 `pricing.html`、`about.html`） |
| 页样式 | `css/<name>.css` |
| 页脚本 | 有交互才建 `js/<name>.js` |
| 全局 | 只改 `css/global.css` 中确属全站的 token/组件；页面私有样式不进 global |

首页固定为 `index.html` + `css/index.css` + 可选 `js/index.js`。

## 结构与挂链

- 结构：`header` / `main` / `footer`；区块用 `section`。  
- **挂链**：顶栏、页脚、站内 CTA 链到新页；从新页可回到首页或主导航。  
- 复用已有导航 markup，保持与首页一致的信息架构。  
- 规范优先级：`style.md` > `component.md` > `frontend-design.md`。

## 禁止

- 静默覆盖已有页；引入 CDN；把页面写到其它端目录。  
- 为增页重新 scaffold 或换 Style 包（除非用户明确要求换肤并接受范围）。
