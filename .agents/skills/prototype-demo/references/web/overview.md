# WEB 交付约定摘要

- 交付根：默认 `web/`，或用户锁定的 `--out`（如 `web-saas/`）；资源来自 `frame/web`（scaffold 复制 fonts/vendor/images）。
- **创建顺序**：询问 Style → scaffold → 落实 tokens（见 `./style.md`）→ 写页面。
- **规范优先级**：`style.md`（含预览）> `component.md` > `frontend-design.md`（气质；不另起色板/字体）。
- 首页：`index.html` + `css/index.css` + 可选 `js/index.js`。
- 分层：`header` / `main` / `footer`；区块用 `section`。
- 样式：`css/global.css` + 页面 CSS；禁止大段内联样式/脚本堆叠。
- 图标：本地 Font Awesome（`./vendor/fontawesome/...`），禁止 CDN。
- 可选：本地 Vue3 + Element Plus / G2Plot，均从交付根 `vendor/` 引用。
- 增页：见 `./pages.md`；延续已选 Style；语义化文件名；导航/footer 挂链。
- **脏目录**（如 Axure 占用的 `web/`）：勿直接 scaffold；先问换 `--out` 或清空（见技能 SKILL 第 0 步）。

细节见 `style.md`、`pages.md`、`component.md`、`frontend-design.md`、`../config.md` 与技能 `SKILL.md`。
