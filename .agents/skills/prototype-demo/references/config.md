# 交付配置字段

写入交付根内的 `.prototype-config.json` / `.admin-config.json` 时对照本文。脚手架参数含义见技能 `SKILL.md`（`--end` / `--framework` / `--out`）。

---

## `.prototype-config.json`（web / app）

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `end` | 建议 | `web` 或 `app` |
| `frameworkId` | 建议 | 母版 id（`frame/index.json` / `--framework`） |
| `frameworkVersion` | 可选 | 来自母版 manifest |
| `outputDir` | 建议 | 交付目录名（与 `--out` 一致） |
| `styleSource` | web/app 创建后应有 | 如 `.style/电光玻璃-style.md` 或 `existing` |
| `stylePrimary` | 可选 | 口述主色等备注 |
| `shell` | app 建议 | 壳文件名，如 `ios_frame.html` |
| `scaffoldMode` | 流程 C 必填 | `external`；官方 scaffold 也可记 |
| `sourcePath` | 流程 C | 外置母版相对路径 |

---

## `.admin-config.json`（admin）

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `end` | 建议 | `admin` |
| `frameworkId` | 建议 | 母版 id，官方多为 `admin` |
| `theme` | 官方 | 如 `arco`；external 可为 `custom` |
| `templateId` | 可选 | 与 framework / manifest 对齐 |
| `outputDir` | 建议 | 交付目录名 |
| `scaffoldMode` | 建议 | `lean` / `full` / `external` |
| `sourcePath` | 流程 C | 外置源路径 |
| `brandOverride` | 可选 | 视觉覆盖备注对象（见 `admin/style.md`） |

---

## 盘点交付根

动手前在**项目根**：

1. 列出含 `.admin-config.json` 或 `.prototype-config.json` 的目录 → 正式交付候选。  
2. 列出标准名 `admin/`、`web/`、`app/`（不论有无配置）。  
3. 有内容但无配置、且不像本技能交付 → **脏目录**，先问再写。  
4. 多根时询问并锁定**一个** `--out` 后再 scaffold / 增页。
