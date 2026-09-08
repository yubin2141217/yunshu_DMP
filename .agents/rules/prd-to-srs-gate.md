# PRD → SRS 转写门禁

> **真源原则**：研发链路（`page-generator`、`hld-design`、`lld-design`、`feature-list`、`annotation`、`delivery-plan` 生成模式）仅以 **SRS** 为规格真源。  
> PRD（`*-PRD.md`）是产品探索真源，**不可直接驱动上述技能**（除非用户显式声明降级，见 §4）。

---

## 1. 检测逻辑（所有下游技能步骤 0 须执行）

```text
SRS  ← Glob("docs/01-需求与规划/*SRS*.md") 或 Glob("**/*需求*说明书*.md")
     ← 且文内存在「3.1」「3.3」「3.5」章节结构

PRD  ← Glob("docs/*-PRD.md") 或 Glob("docs/**/*-PRD.md")
     ← 或 Glob("docs/*-概念版.md") / Glob("docs/*-原型盘点.md")
```

| 检测结果 | 动作 |
| --- | --- |
| **有 SRS 且结构完整** | 登记 `SPEC_SOURCE=<SRS路径>`，继续 |
| **仅有 PRD、无 SRS** | **阻断**研发类技能，输出 §3 标准话术，路由 **`req-doc` Step F** |
| **SRS + PRD 并存** | 以 **SRS** 为 `SPEC_SOURCE`；SRS 文首应链回 PRD；不阻断 |
| **皆无** | 按场景：`req-doc` 生成 或 `prd-writer` 探索 |

**结构完整性快检**（SRS）：文件含 `3.1`/`3.3`/`3.5` 标题或等价编号；缺任一则视为「不完整 SRS」，同「仅有 PRD」处理或走 `req-doc` 局部完善。

---

## 2. 受门禁约束的技能

| 技能 | 门禁点 | 无 SRS 时 |
| --- | --- | --- |
| `page-generator` | 步骤 1 之前 | **禁止**读 PRD 代替 SRS；须转写或用户 §4 降级 |
| `delivery-plan` | Step A1 | **禁止**用 PRD 生成交付计划 |
| `hld-design` / `lld-design` | Step A1 | 已有提示；须先 Step F |
| `feature-list` / `annotation` | Step 1 | 须 SRS 路径 |
| `pm-product-pipeline` | 阶段 6 前 | 强制阶段 **5C**（见该技能 §5C） |

**不受约束**（可读 PRD）：`prd-writer`、`prototype-to-prd`、`pm-test-cases`（流水线例外见 pipeline 技能）、纯文档类 PM 技能。

---

## 3. 阻断标准话术（复制输出）

```text
⛔ PRD → SRS 转写门禁

当前仅有产品 PRD（{PRD路径}），尚未生成研发用 SRS。
page-generator / 交付计划 / 概要设计 等技能需要 SRS 章节结构（3.1 / 3.3 / 3.5 / 6.1），不能直接用 PRD（§4 / §5）实现。

建议下一步（任选其一）：
  1. 【推荐】转写 SRS：说「PRD 转 SRS」或「进开发」→ 执行 req-doc Step F
  2. 若尚未定稿 PRD → 先完成 prd-writer 自检后再转写
  3. 【降级】快速原型：明确说「跳过 SRS，按 PRD 手动对齐实现」→ 仅本次 page-generator 放行，不登记为正式交付

转写完成后将登记：SPEC_SOURCE=docs/01-需求与规划/...-SRS需求规格说明书-V*.md
```

**批量 / 流水线模式**：不询问「是否继续」，默认执行 **选项 1**（转写 SRS），除非 Step 0 已登记 `SPEC_SOURCE` 指向 SRS。

---

## 4. 用户降级豁免（须原话触发）

仅当用户消息 **明确包含** 以下之一时，允许 `page-generator` 在无 SRS 下继续（**单次会话**）：

- 「跳过 SRS」
- 「跳过 SRS 模板」
- 「按 PRD 手动对齐」
- 「快速原型不按 SRS」

降级时：

1. 步骤 1 读取 `*-PRD.md` 的 §4 / §5，**不得**假装读到 3.1 / 3.3 / 3.5
2. 输出需求理解时标注：`⚠ 降级模式：来源 PRD，非 SRS 真源`
3. **不**登记 `SPEC_SOURCE` 为 SRS；可记 `SPEC_SOURCE=<PRD路径>（降级）`
4. 完成后提示：「正式交付前请执行 req-doc Step F 补 SRS」

未触发豁免词 → **一律阻断**，不得静默用 PRD 凑合。

---

## 5. 转写完成标志（Step F 出口）

`req-doc` Step F 完成后须满足以下 **全部** 项，方可解除门禁：

| # | 检查项 |
| --- | --- |
| 1 | SRS 已写入 `docs/01-需求与规划/*-SRS需求规格说明书-V*.md` |
| 2 | SRS 文首注明 **来源 PRD 路径** 与转写日期 |
| 3 | **3.1** 菜单与路由与 PRD §4 功能树一致 |
| 4 | **3.3** 覆盖 PRD §4 中本期 🔴 / MVP 全部页面级功能 |
| 5 | **3.5.x** 每个 V1.0 模块有字段表、业务规则、边界异常（由 PRD §5 展开并 `prd-language.md` 脱 UI 术语） |
| 6 | **6.1** 数据字典含 PRD §5「数据规范」中的枚举 |
| 7 | 会话登记 **`SPEC_SOURCE=<SRS路径>`**（覆盖原 PRD 登记） |

完成后输出：

```text
✅ PRD → SRS 转写完成

来源 PRD：{PRD路径}
SRS 真源：{SRS路径}
SPEC_SOURCE 已更新 → 可继续 page-generator / delivery-plan / hld-design
```

---

## 6. 会话变量

| 变量 | 含义 |
| --- | --- |
| `SPEC_SOURCE` | 当前研发规格真源路径；含阶段 6 时必须指向 SRS |
| `PRD_SOURCE` | 可选；转写前登记的 PRD 路径，供 Step F 读取 |

登记时机：

- `prd-writer` / `prototype-to-prd` 落盘 PRD 后 → `PRD_SOURCE` + 临时 `SPEC_SOURCE=PRD`（若仅文档）
- Step F 完成 → **`SPEC_SOURCE=SRS`**（强制覆盖）
- 用户说「进开发 / 实现 / 生成页面」且仅有 PRD → 先 Step F，再下游

---

## 7. 相关文件

| 文件 | 用途 |
| --- | --- |
| `.agents/skills/req-doc/SKILL.md` Step F | 转写执行流程 |
| `.agents/skills/req-doc/references/prd-to-srs-handoff.md` | PRD 章节 → SRS 章节映射与展开规则 |
| `AGENTS.md` § PRD→SRS 转写门禁 | 主 Agent 路由摘要 |
