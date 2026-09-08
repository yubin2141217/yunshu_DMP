# 移动端 H5 - 开发规范

> **AI 协作说明**：技能触发与工作流见 [AGENTS.md](../AGENTS.md)；本文为移动端子项目实现规范的单一事实来源。
>
> `page-spec-loader` 优先读取本文，再从 `{WORKSPACE_PATH}/.agents/knowledge/` 加载通用与 UI 库规范；冲突时以本文为准。

## 项目配置

| 配置项 | 值 |
|--------|-----|
| 项目名称 | （待需求分析确定） |
| WORKSPACE_PATH | 仓库根（含 `.agents/`） |
| PROJECT_PATH | `mobile/` |
| UI 组件库 | vant |
| 导航方式 | 底部 Tabbar |
| 路由注册方式 | `src/router/index.ts` |
| Mock 模式 | 手动 Mock |
| 开发端口 | 3007 |

## 技术栈

- **框架**: Vue 3.5 + Composition API
- **构建工具**: Vite
- **语言**: TypeScript
- **UI 组件库**: Vant 4
- **状态管理**: Pinia
- **路由**: Vue Router 4（Hash）
- **HTTP 客户端**: Axios

## 规范加载顺序

| 优先级 | 来源 | 说明 |
|--------|------|------|
| 1 | 本文件 `README-DEV.md` | 路由、布局、Mock、项目约定 |
| 2 | `.agents/knowledge/conventions/project.md` | 通用目录与命名 |
| 3 | `.agents/knowledge/conventions/mock.md` | Mock 通用规则 |
| 4 | `.agents/knowledge/ui-libs/vant/` | 组件与页面写法 |

## 快速开始

```bash
cd mobile
npm install
npm run dev
```

开发地址：`http://localhost:3007`

## 项目特有约定

- 业务页面与菜单以后续 SRS 为准；当前目录中的示例页面仅为框架占位，新项目实现时按需求替换。
- **SPEC_SOURCE（机构详情方案排序增量）**：`docs/01-需求与规划/20260907-试用管理平台-H5机构详情产品方案列表排序-SRS需求规格说明书-V1.0.md`
