# shadcn/ui 组件规范

适用于 React + TypeScript + Tailwind CSS + shadcn/ui 项目（如 shadcn-admin）。

## 基础约定

- UI 组件位于 `@/components/ui/`，通过 `@/lib/utils` 的 `cn()` 合并 class
- 图标使用 `lucide-react`，品牌图标在 `@/assets/brand-icons/`
- 表单使用 `react-hook-form` + `zod` + `@hookform/resolvers/zod`
- 消息提示使用 `sonner` 的 `toast`，不用 alert
- 新增 shadcn 组件：`npx shadcn@latest add <component>`（在项目根目录执行）

## Chart（图表，强制）

**所有图表必须使用 shadcn/ui Chart 封装，禁止裸 Recharts。**

详细规范见 **`{KNOWLEDGE_ROOT}/ui-libs/shadcn/charts.md`**（生成含统计图、趋势图、仪表盘的页面时必读）。

- 组件：`ChartContainer`、`ChartTooltip`、`ChartTooltipContent`、`ChartLegend`（`@/components/ui/chart`）
- 参考：`src/features/dashboard/components/analytics-chart.tsx`、`overview.tsx`
- 官网示例：[shadcn 图表](https://www.shadcn.com.cn/charts/area)

## Button

```tsx
import { Button } from '@/components/ui/button'

// 主操作
<Button>新增</Button>
<Button variant='outline'>导出</Button>
<Button variant='destructive'>删除</Button>
<Button variant='ghost' size='icon'><Plus /></Button>
```

- 页面主操作区：`default` 或 `outline`
- 表格行操作：`ghost` + `size='sm'`
- 危险操作：`variant='destructive'`

## Dialog / AlertDialog

新增/编辑用 `Dialog`，删除确认用 `AlertDialog` 或项目封装的 `ConfirmDialog`：

```tsx
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog'

<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className='sm:max-w-lg'>
    <DialogHeader>
      <DialogTitle>新增用户</DialogTitle>
      <DialogDescription>填写用户信息</DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

- 弹窗状态用 `open` + `onOpenChange`，不用自定义 `visible`
- 编辑弹窗关闭后延迟清空 `currentRow`（参考 users 模块 500ms setTimeout）

## Form

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const form = useForm({ resolver: zodResolver(formSchema), defaultValues: { ... } })

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
    <FormField
      control={form.control}
      name='name'
      render={({ field }) => (
        <FormItem>
          <FormLabel>名称</FormLabel>
          <FormControl><Input placeholder='请输入' {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

- 校验规则写在 zod schema，不在组件内手写 if/else
- 下拉选择优先用项目封装的 `SelectDropdown`（`@/components/select-dropdown`）

## Table + TanStack Table

列表页使用 `@tanstack/react-table` + shadcn `Table` 组件：

```tsx
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
```

- 列定义放在 `*-columns.tsx`，导出 `ColumnDef<T>[]`
- 筛选/分页/排序优先用 `useTableUrlState` 同步 URL（参考 users 模块）
- 表头排序用 `DataTableColumnHeader`
- 分页用 `DataTablePagination`

## Select / Input / Switch / Badge

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
```

- 状态列用 `Badge` + 颜色 variant，不用裸文本
- 布尔开关用 `Switch`，配合 `onCheckedChange`

## Sheet

侧边抽屉场景（详情、筛选）用 `Sheet`：

```tsx
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
```

## 项目封装组件（优先复用）

| 组件 | 路径 | 用途 |
|------|------|------|
| `DataTableToolbar` | `@/components/data-table` | 表格筛选工具栏 |
| `DataTablePagination` | `@/components/data-table` | 表格分页 |
| `DataTableColumnHeader` | `@/components/data-table` | 可排序列头 |
| `DataTableBulkActions` | `@/components/data-table` | 批量操作 |
| `ConfirmDialog` | `@/components/confirm-dialog` | 删除确认 |
| `SelectDropdown` | `@/components/select-dropdown` | 表单下拉 |
| `PasswordInput` | `@/components/password-input` | 密码输入 |
| `LongText` | `@/components/long-text` | 长文本截断 |

## 消息与反馈

```tsx
import { toast } from 'sonner'
import { showSubmittedData } from '@/lib/show-submitted-data'

// 开发阶段 mock 提交反馈
showSubmittedData(data, '提交成功')

// 正式提示
toast.success('操作成功')
toast.error('操作失败')
```
