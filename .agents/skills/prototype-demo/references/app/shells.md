# APP 壳模板速览（frame/app）

选型时路径相对于 `frame/app/`；生成后落盘到 `app/`，禁止运行时引用 frame。

**创建时还须询问 Style**：见同目录 `style.md`（可与壳选型同轮询问）。

| 模板 | 说明 |
| --- | --- |
| `ios_frame.html` | iOS 纯内容（无标题栏、无 Tab） |
| `ios_frame_header.html` | iOS 仅标题栏 |
| `ios_frame_tabs.html` | iOS 仅底部标签栏 |
| `ios_frame_nav.html` | iOS 标题栏 + 标签栏 |
| `wechat-frame.html` | 微信纯内容（胶囊、隐藏标题栏） |
| `wechat-frame_header.html` | 微信仅标题栏 |
| `wechat-frame-tabs.html` | 微信仅底部标签栏 |
| `wechat-frame-nav.html` | 微信标题栏 + 标签栏 |

- 常规 H5 优先 iOS 系列；未明确导航形态时 **先问用户**。
- 小程序视觉还原用 wechat 系列。
- 详细规则见 `style.md`、`component.md` 与技能 `SKILL.md` 流程 A/B · app。
