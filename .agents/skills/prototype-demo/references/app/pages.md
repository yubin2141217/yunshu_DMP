# APP 增页 / 多屏约定

创建见技能 `SKILL.md` 流程 A · app、`./style.md`、`./shells.md`。本文管**已有交付根上加屏或改屏**。

## 前置

1. 锁定交付根；读 `.prototype-config.json`（含 `shell`、`styleSource`）。  
2. 延续壳与 Style；不重问（除非用户明确换壳/换 Style）。  
3. 同名 html 先问再写。

## 壳与内容

- 业务 UI **只**写在 `main.screen-content > section.app-shell`（或现有目录约定的等价节点）内。  
- **不**删除、不动画化设备外框（刘海、Home Indicator、手机框等）。  
- 多屏策略（与现有目录保持一致，选定一种为主）：  
  - **同 html 内切换**（推荐简单原型）：多 `section` / 面板，脚本显示隐藏；或  
  - **多 html**：每屏一页，共用同一壳系列与相对路径习惯。  
- 补齐缺失的 `vendor` / `fonts`；路径相对本交付根。

## 禁止

- 内容画在壳外；运行时引用 `frame/`。  
- 静默覆盖；CDN；改其它端目录。
