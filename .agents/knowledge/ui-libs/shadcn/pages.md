# shadcn-admin 页面规范

适用于 React + TanStack Router + shadcn/ui 管理后台页面。

## 页面布局原则

```
AuthenticatedLayout（侧边栏 + 内容区）
  ├── Header（固定顶栏：Search / ThemeSwitch / ConfigDrawer / ProfileDropdown）
  └── Main（flex flex-1 flex-col gap-4 sm:gap-6）
        ├── 页面标题区（h2 + 描述 + 主操作按钮）
        ├── 数据表格 / 表单内容
        └── Dialogs（弹窗聚合组件，放在页面底部）
```

## Feature 模块目录结构

```
src/features/{FeatureName}/
├── index.tsx                    # 页面入口（导出 Feature 组件）
├── data/
│   ├── schema.ts                # Zod schema + TypeScript 类型
│   ├── data.ts                  # 枚举/选项常量
│   └── {feature}.ts             # Mock 数据数组
└── components/
    ├── {feature}-table.tsx      # 表格
    ├── {feature}-columns.tsx    # 列定义
    ├── {feature}-primary-buttons.tsx  # 顶部操作按钮
    ├── {feature}-provider.tsx   # Context（弹窗状态 + currentRow）
    ├── {feature}-dialogs.tsx    # 弹窗聚合
    ├── {feature}-action-dialog.tsx    # 新增/编辑
    ├── {feature}-delete-dialog.tsx    # 删除确认
    └── data-table-row-actions.tsx     # 行操作
```

## 标准列表页结构

参考 `src/features/users/` 和 `src/features/tasks/`：

```tsx
export function Users() {
  return (
    <UsersProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>页面标题</h2>
            <p className='text-muted-foreground'>页面描述</p>
          </div>
          <PrimaryButtons />
        </div>
        <UsersTable data={users} />
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
```

## 路由规范（TanStack Router 文件路由）

路由文件在 `src/routes/`，Feature 组件在 `src/features/`：

```
src/routes/_authenticated/{feature}/index.tsx   → 路由定义 + search schema
src/features/{feature}/index.tsx                → 页面 UI
```

路由文件示例：

```tsx
import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Users } from '@/features/users'

const searchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  name: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/users/')({
  validateSearch: searchSchema,
  component: Users,
})
```

- 新建页面路由放在 `_authenticated/` 下（需登录布局）
- 路由创建后 `routeTree.gen.ts` 自动生成，**不要手动编辑**
- 需要 URL 同步筛选时，在路由定义 `validateSearch`，页面用 `getRouteApi` 读取

## 导航（侧边栏菜单）

菜单配置在 `src/components/layout/data/sidebar-data.ts` 的 `navGroups`：

```tsx
{
  title: 'General',
  items: [
    { title: 'Users', url: '/users', icon: Users },
    // 二级菜单
    {
      title: 'Settings',
      icon: Settings,
      items: [
        { title: 'Profile', url: '/settings', icon: UserCog },
      ],
    },
  ],
}
```

- 新增功能页面后，在对应 `navGroups` 分组追加菜单项
- `url` 必须与路由 path 一致（不含 `_authenticated` 前缀）
- 图标从 `lucide-react` 导入

## Provider + Dialog 模式

弹窗状态通过 Context + `useDialogState` 管理：

```tsx
// provider.tsx
type DialogType = 'add' | 'edit' | 'delete'
const [open, setOpen] = useDialogState<DialogType>(null)
const [currentRow, setCurrentRow] = useState<Item | null>(null)

// dialogs.tsx — 聚合所有弹窗，根据 open 状态渲染
<AddDialog open={open === 'add'} onOpenChange={() => setOpen('add')} />
{currentRow && (
  <EditDialog open={open === 'edit'} currentRow={currentRow} ... />
)}
```

## 页面开发流程

1. 创建 `src/features/{name}/data/schema.ts`（Zod 类型）
2. 创建 `src/features/{name}/data/{name}.ts`（Mock 数据）
3. 创建 `src/features/{name}/components/` 下各组件
4. 创建 `src/features/{name}/index.tsx`（页面入口）
5. 创建 `src/routes/_authenticated/{name}/index.tsx`（路由 + search schema）
6. 更新 `src/components/layout/data/sidebar-data.ts`（侧边栏菜单）
7. 运行 `pnpm dev` 验证页面可访问

## 样式约定

- 使用 Tailwind 工具类，不写内联 style
- 间距：`gap-4 sm:gap-6`（页面级）、`space-y-4`（表单级）
- 标题：`text-2xl font-bold tracking-tight`
- 描述：`text-muted-foreground`
- 语义色：`text-destructive`、`bg-muted` 等 CSS 变量类

## 图表 / 仪表盘页

含统计图、趋势图时：

1. 必读 `.agents/knowledge/ui-libs/shadcn/charts.md`
2. 图表组件放在 `components/{feature}-*-chart.tsx` 或 `components/charts/`
3. 布局参考 `src/features/dashboard/`（Card + ChartContainer）
4. 从 [shadcn 图表库](https://www.shadcn.com.cn/charts/area) 复制示例后，将 import 改为 `@/components/ui/*`

## 国际化

- 项目已采用**方案 A：直接中文化**，所有 UI 文案使用简体中文
- 新增页面/功能时，菜单、标题、按钮、表单、提示信息均使用中文
- 公共组件文案见 `src/components/data-table/`、`confirm-dialog.tsx` 等
