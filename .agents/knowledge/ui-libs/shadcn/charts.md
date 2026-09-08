# shadcn/ui 图表规范（强制）

适用于本工作区前端项目中所有数据可视化、统计图表。

**参考实现**（已对齐 [shadcn 图表](https://www.shadcn.com.cn/charts/area)）：

- 面积图：`src/features/dashboard/components/analytics-chart.tsx`
- 柱状图：`src/features/dashboard/components/overview.tsx`
- 基础组件：`src/components/ui/chart.tsx`

---

## 第一原则

| 禁止 | 必须 |
|------|------|
| 裸用 `ResponsiveContainer` + 硬编码 `#888888` | 使用 `ChartContainer` + `chartConfig` |
| 直接 `fill="currentColor"` 无主题变量 | `fill="var(--color-{key})"`，颜色来自 `var(--chart-1)`～`var(--chart-5)` |
| 无 Tooltip / 无网格的简陋 Recharts | `CartesianGrid`、`ChartTooltip` + `ChartTooltipContent` |
| 引入 Chart.js、ECharts 等其他图表库 | Recharts + `@/components/ui/chart` |

若 `src/components/ui/chart.tsx` 不存在，先执行：

```bash
pnpm dlx shadcn@latest add chart
```

---

## 标准结构

```tsx
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

/** 图表数据 */
const chartData = [/* ... */]

/** 系列配色与中文图例 */
const chartConfig = {
  clicks: {
    label: '点击量',
    color: 'var(--chart-1)',
  },
  uniques: {
    label: '独立访客',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

/** 流量面积图 */
export function TrafficAreaChart() {
  return (
    <ChartContainer config={chartConfig} className='h-[300px] w-full'>
      <AreaChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey='name'
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator='dot' />}
        />
        <Area
          dataKey='clicks'
          type='natural'
          fill='var(--color-clicks)'
          fillOpacity={0.4}
          stroke='var(--color-clicks)'
          stackId='a'
        />
        <ChartLegend content={<ChartLegendContent />} />
      </AreaChart>
    </ChartContainer>
  )
}
```

---

## 与 Card 组合

图表放在 `Card` 内，与仪表盘一致：

```tsx
<Card>
  <CardHeader>
    <CardTitle>流量概览</CardTitle>
    <CardDescription>每周点击量与独立访客数</CardDescription>
  </CardHeader>
  <CardContent className='px-2 sm:px-6'>
    <TrafficAreaChart />
  </CardContent>
</Card>
```

---

## 图表类型对照

| 场景 | Recharts 组件 | 官网示例（可复制后改路径） |
|------|---------------|---------------------------|
| 趋势 / 流量 | `AreaChart` + `Area` | [面积图](https://www.shadcn.com.cn/charts/area) |
| 对比 / 月度 | `BarChart` + `Bar` | [柱状图](https://www.shadcn.com.cn/charts/bar) |
| 折线趋势 | `LineChart` + `Line` | [折线图](https://www.shadcn.com.cn/charts/line) |
| 占比 | `PieChart` / `RadialBarChart` | [饼图](https://www.shadcn.com.cn/charts/pie) |

CLI 添加完整示例块：

```bash
pnpm dlx shadcn@latest add chart-area-interactive
pnpm dlx shadcn@latest add chart-bar-default
```

生成文件放入 `src/features/{Feature}/components/`，import 路径改为 `@/components/ui/...`。

---

## 颜色与主题

- 使用 `theme.css` 中已有变量：`--chart-1` … `--chart-5`（浅色/深色已配置）
- `chartConfig` 的 `color` 写 `var(--chart-N)`，系列 `fill` / `stroke` 写 `var(--color-{key})`
- 不要写死 `hsl(...)` 或 `#888888`

---

## 文案与无障碍

- `chartConfig.*.label`、Card 标题、Tooltip 使用**简体中文**
- 保留 `accessibilityLayer`（Recharts 无障碍层）
- 数据表需保留时，图表旁提供表格备选（WCAG）

---

## 文件组织

```
src/features/{Feature}/components/
├── {feature}-area-chart.tsx    # 单图单文件
├── {feature}-bar-chart.tsx
└── ...
```

复杂仪表盘可建 `components/charts/` 子目录，勿在 `index.tsx` 内堆超过 80 行图表 JSX。

---

## page-generator / AI 检查清单

生成或修改含图表的页面时，输出前自检：

- [ ] 已 import `@/components/ui/chart`
- [ ] 使用 `ChartContainer` + `satisfies ChartConfig`
- [ ] 未使用裸 `ResponsiveContainer`
- [ ] 坐标轴 `tickLine={false}` `axisLine={false}`（与官网一致）
- [ ] 含 `ChartTooltip` + `ChartTooltipContent`
- [ ] 中文 `label` 与页面语境一致
