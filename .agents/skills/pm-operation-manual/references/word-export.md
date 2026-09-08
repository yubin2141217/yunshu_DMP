# 操作手册 Word 导出规范与已知问题

导出操作手册 / 快速入门 / 管理员手册为 `.docx` 时，**必须**遵守本节。历史踩坑已固化为门禁，禁止回退到有缺陷的导出方式。

## 推荐导出方式（默认）

有截图或本地图片时，**优先**使用技能内本地嵌入脚本：

```bash
python .agents/skills/pm-operation-manual/scripts/md_to_docx_embed.py <markdown文件路径>
```

依赖：`pip install python-docx`（仅本机转换，不调用云端 API）。

脚本保证：

| 要求 | 实现 |
|------|------|
| 图片直接进入文档 | `run.add_picture()` 写入 `word/media/`，打开 Word 即可见图 |
| 目录可跳转 | 一级标题加书签；目录项用 `w:hyperlink w:anchor` 指向书签 |
| 步骤序号按章节重排 | **禁止**使用 Word「列表编号 / List Number」全文连续样式；按 Markdown 显式 `1. 2. 3.` 写入正文 |

验收：

1. 生成的 `.docx` 体积应明显大于「纯文字」——若含多张 PNG，通常应 ≥ 数百 KB～数 MB（视截图而定）。
2. 解压 docx 后存在 `word/media/image*.png`（或 jpg）。
3. 点击「目录」中的章节名，应跳转到对应标题。
4. 每一操作小节列表应从 **1** 重新开始，而不是跨「三、登录 / 四、仪表盘」连续成 8、9、10。

## 备选：云端 `export-word`（仅无图或确认 API 已修）

```powershell
.agents/skills/common/export-word.ps1 <markdown> operation-manual
```

```bash
python .agents/skills/common/export-word.py <markdown> operation-manual
```

**已知缺陷（2026-08 实测）：**

| 问题 | 现象 | 根因 / 处理 |
|------|------|-------------|
| 图片未嵌入 | Word 打不开图或看不到截图；docx 仅约数十 KB，远小于截图总大小 | 云端 `/api/document/export/word-with-images` 未把上传图片写入文档。有截图时**不要**用此路径，改走 `md_to_docx_embed.py` |
| 目录不能跳转 | 目录是普通项目符号列表，无超链接 | 导出结果未生成书签/内部链接。本地脚本必须生成可点击目录 |
| 序号全文连续 | 如「4.2」下步骤变成 8、9、10… | Word 自动编号列表跨段落连续。必须按章节重排：MD 各节从 1 写起 + 导出时不用连续 List Number |

若用户反馈上述任一问题，先用本地脚本重导，再检查 Markdown 各节步骤是否从 1 开始编写。

## Markdown 编写约定（避免导出后天坑）

1. **一级标题**使用 `## 一、…` / `## 二、…`，与目录文案一致，便于目录匹配书签。
2. **操作步骤**每个功能小节（或每个 `###` 下的步骤组）从 `1.` 重新编号，不要写成全文 1～N 流水号。
3. **图片**使用相对路径，且文件真实存在，例如：  
   `![登录页面](images/screenshots/quickstart-login.png)`  
   导出时路径相对 Markdown 所在目录解析。
4. **目录**可保留 Markdown 锚点列表；本地脚本会转为可点击内部链接。不要指望纯文本目录在 Word 里自动带跳转。

## 与截图流程的衔接

1. 截图保存到 `docs/images/screenshots/`（或手册约定目录）。
2. Markdown 中替换占位为 `![说明](相对路径)`。
3. **导出 Word 必须用 `md_to_docx_embed.py`**，确保图进文档、目录可跳、序号按章。
4. 向用户交付前自检：打开 docx 点目录、看步骤编号、确认截图可见。
