# Style 选型（WEB · 创建时）

**创建** `web/`（流程 A）时必须先处理 Style，再 scaffold / 写首页。  
**增页**（流程 B）延续已有配置与 `css/global.css`，**不**再问 Style。

---

## 步骤（创建）

1. **询问**（未指定前不定稿）：枚举包根 `.style/*-style.md`（可对照 `*-preview.html`）／口述主色／「默认」。**禁止**在本文件维护固定风格清单；以目录现状为准。
2. 选定后 **先读** `*-style.md`，有同名预览则一并打开；tokens 写入 `css/global.css`，记入 `.prototype-config.json`（`styleSource`；可选 `stylePrimary`）。
3. 按序落实：
   - **字体本地化**（下文）
   - **有预览** → **预览同步**（下文，含组件预置主规则）
   - **无预览** → 仅按 `*-style.md` 文字 Tokens / 组件描述
4. 页面气质与编排可参考 `frontend-design.md`，但 **不得**用其另选色板/字体或推翻预览组件基线（优先级：本文 > `component.md` > `frontend-design.md`）。
5. 外部站点对齐 → 先 `style-extractor`，再落 `global.css`。

---

## 字体本地化

目标：风格规定的字体族在交付内闭环；**禁止**页面引用字体 CDN。

1. **解析**：读 `*-style.md` Typography；**有预览则以预览 `:root` 的 `--font-*` 完整栈为真源**（逐项一致，勿改写回退）。区分须下载的 Web 字体 vs 系统回退（只写栈）。
2. **检查** `fonts/`：缺则补 `*.woff2` + `@font-face`（建议 `fonts/<family>.css`）；不得因只有 Inter 就换族顶替。
3. **引用**：`global.css` 写 `--font-display` / `--font-sans`（及预览有的 `--font-serif`）；页面 `<link>` 本地字体 CSS；正文/标题用变量。
4. 无法合法获取字体 → **告知用户**，禁止静默换族。

自检：字体栈与预览/风格一致；非系统字体已本地化；无外链字体；`styleSource` 已写。

---

## 预览同步（有 `*-preview.html` 时）

**视觉真源 = 预览。** 抽 CSS/交互进交付，禁止整页复制预览 HTML，禁止只抄色板。

### 主规则（必读）

落实 Style 时 **扫描预览中的主题组件**，把其**样式 + 交互**写入基线（`css/global.css` + 可复用 JS）。

- 范围 = **预览里实际有的组件**（清单不封闭；预览新增下次扫描即纳入，**不必改本文件**）。
- 本页 DOM **可以不挂**某组件，但类名与 API（如 combo、`showToast`）**必须就绪**；禁止等用到再补。
- **禁止**：裸 `<select>` / 未皮肤化原生勾选顶替主题控件；`alert()` 或随意条顶替主题 Toast；因「文档没点名」忽略预览已有组件。
- **可不拷**：swatch 墙、painterly 等纯演示排版。

### 同步层次

| 层 | 内容 |
| --- | --- |
| **A. Tokens** | `:root` / 主题块：色、半径、阴影、玻璃、`--font-*`、`--scrollbar-*`、动效相关变量（如 `--ease` / `motion.ease`、时长）等 → 照抄同名变量 |
| **B. Chrome** | 滚动条、`::selection`、`focus-visible` |
| **C. 组件基线** | 预览中的按钮、chip、表单、combo、field-error、Toast、alert、checkbox/radio/toggle 等（**含本页未用**）样式 + 通用交互 |
| **D. 气质** | 顶栏磨砂、主 CTA 策略等落到实际布局 |
| **E. Motion** | 见下节（组件微交互 + 可访问性；**不**整页拷贝演示编排） |

字段错误用 `.field-error`；短时成功/操作反馈用 **Toast**；页内说明用 `.alert`（若预览有）。

### E. Motion（动效）

**不单独询问动效套餐**；气质跟选定 Style / 预览。用户主动说「少动 / 更动感」时再记可选偏好并覆盖，否则跟预览。

**须同步（基线）：**

- Style / 预览中的缓动与时长 token（写入 `:root`；无变量则按 `*-style.md` 动效描述落到组件 `transition`）
- 组件自带的 hover / active / 展开 / Toast 进出等 `transition`（随 C 层一起拷）
- 预览若有 `@media (prefers-reduced-motion: reduce)`（或等价 JS），写入 `global.css`（及共用 JS），缩短或关闭动画

**不须 / 禁止整页照搬：**

- 预览演示用的入场秀、无限循环氛围动画、纯展示用 scroll-reveal
- 页面级编排（首屏入场、区块交错等）由实际页按 `frontend-design.md` **按需自写**，时长/缓动仍用本 Style 的 motion tokens，气质与预览一致即可

### 操作

1. 打开预览 → 抄 Tokens（含 motion）→ 抄 Chrome → 按主规则预置组件样式/交互（含微交互）→ 落实 `prefers-reduced-motion`。  
2. 结构 / IA 仍走 `component.md`（**component 管结构，预览/Style 管视觉与微交互**）。  
3. 无预览时回退 `*-style.md` 描述（含动效时长/缓动条文）。

自检：Tokens/chrome/motion 与预览一致；已扫描并预置预览组件；`prefers-reduced-motion` 已处理；交互可复用；无字体 CDN。

---

## 其它

- 页面级微调进 `css/xxx.css`；Element Plus 用 CSS 变量映射主题色。  
- 图标：本地 Font Awesome。  
- **admin** 创建不询问 Style；仅 web / app 走本文。
