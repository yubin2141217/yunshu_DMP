# Admin 图表规范

生成 / 增页含图表时读本文。**抄样板类名与模板**，勿在业务页另写色值、图例间距、圆环布局或入场动画。

实现细节（动态轴边距、入场毫秒、配色 API）在 `js/charts/shadcn-charts.js`、`css/shadcn-chart.css`、`js/chart-palette.js`，不必在业务页重算。

## 1. 生成时必守

### 取色

| 项 | 值 |
| --- | --- |
| 系列色 | `var(--chart-N)`；禁止写死 hex，禁止用 `primary-6` 冒充系列色 |
| 独立单系列 | **一律 C1**（一页多张单系列图也全用 C1） |
| 多系列 / 多分类 | 从 C1 连续编号，勿跳号 |
| 涨跌 / 告警 | `success` / `danger` / `warning`，不当普通分类色 |
| 标题左侧色条 | 界面主色（`--pro-theme-color` / `--primary-6`），不跟图表配色方案 |
| 同组指标卡 | 主题单色 → 全组 C1；多彩方案 → 可按序 C1、C2…；卡内分段条仍按多系列 |

`chart-palette.js` 由 `arco-theme.js` 自动注入，HTML 不必手写 script。

### 布局与挂载

| 项 | 值 |
| --- | --- |
| XY 底图例 | 只用 `.shadcn-chart-legend*`；间距已在全局 CSS（轴下 20px、项间距 16px） |
| XY 挂载 | `autoMargin: false`；`margin: { top: 6, bottom: 22, right: 8 }`（勿写死 `left`） |
| 圆环尺寸 | `height` / 宿主 **200**，`radius: 100`，`arcWidth: 28` |
| 圆环结构 | `.shadcn-donut-card` + `.shadcn-donut-layout`；≥**520px** 左环右例，不够则上下 |
| 圆环图例 | 新页默认单行 `--inline`（对齐基础圆环图）。叠排（名称上 / 金额下 / 占比右）为定制，抄 `dashboard-finance.html` 账户分配，**不要**加 `--inline` |
| 中心数字 | `mountDonutChart` 自动缩字号，业务侧一般不必再设 |
| 折线形态 | 折角 `curveType: 'linear'`；圆滑默认 `'monotoneX'` |
| 组合图 / 标题行图例 | 抄 `component-chart-extended.html`，勿自写双轴 |
| 自定义横条 | 填色元素加 **`pro-meter-fill`**；禁止业务页自写 keyframes |
| 入场 | 用 `mount*Chart` 默认；禁止对圆环宿主做 `transform` 入场 |

类名：`shadcn-chart-legend*`、`shadcn-donut-*`。样式：`css/shadcn-chart.css`。横条动画：`css/pages-common.css`。标题行图例：`.ecom-chart-legend`（见扩展图表）。

## 2. 模板

### XY + 底部图例（对齐常用图表柱/面积/折线）

```html
<div ref="xxxChart" class="shadcn-chart-host ..."></div>
<div class="shadcn-chart-legend">
  <span v-for="item in legend" :key="item.key" class="shadcn-chart-legend-item">
    <span class="shadcn-chart-legend-dot" :style="{ '--legend-color': item.color }"></span>{{ item.label }}
  </span>
</div>
```

```js
ProShadcnCharts.mountAreaChart(el, { // 或 mountLineChart / mountBarChart / mountStackedBarChart
  height: 280,
  margin: { top: 6, bottom: 22, right: 8 },
  autoMargin: false,
})
```

### 圆环 + 右侧图例（对齐基础圆环图）

```html
<a-card class="… shadcn-donut-card">
  <div class="shadcn-donut-layout">
    <div class="shadcn-donut-chart">
      <div ref="donutChart" class="shadcn-chart-host shadcn-chart-host--donut shadcn-donut-host"></div>
    </div>
    <div class="shadcn-donut-legend-wrap">
      <ul class="shadcn-donut-legend shadcn-donut-legend--inline">
        <li v-for="item in items" :key="item.key" class="shadcn-donut-legend-item">
          <div class="shadcn-donut-legend-name-row">
            <i class="shadcn-donut-legend-dot" :style="{ background: item.color }"></i>
            <span class="shadcn-donut-legend-label">{{ item.name }}</span>
          </div>
          <div class="shadcn-donut-legend-meta">
            <span class="shadcn-donut-legend-value">{{ item.valueText }}</span>
            <span class="shadcn-donut-legend-pct">{{ item.percentText }}</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</a-card>
```

```js
ProShadcnCharts.mountDonutChart(el, {
  height: 200,
  radius: 100,
  arcWidth: 28,
  padAngle: 0,
  centralLabel: '¥234,896',
  centralSubLabel: '合计',
})
```

### 圆环 + 右侧叠排图例（定制，财务账户分配）

新页不要默认用本结构。仅金额+占比需要上下分行、色条贴名称时抄财务页：无 `--inline`，用 `.shadcn-donut-legend-main` 包名称与金额，占比与金额底对齐。

```html
<ul class="shadcn-donut-legend">
  <li v-for="item in items" :key="item.key" class="shadcn-donut-legend-item">
    <div class="shadcn-donut-legend-main">
      <div class="shadcn-donut-legend-name-row">
        <i class="shadcn-donut-legend-dot" :style="{ background: item.color }"></i>
        <span class="shadcn-donut-legend-label">{{ item.name }}</span>
      </div>
      <span class="shadcn-donut-legend-value">{{ item.valueText }}</span>
    </div>
    <span class="shadcn-donut-legend-pct">{{ item.percentText }}</span>
  </li>
</ul>
```

## 3. 禁止

- 另写 `workplace-channel-*` / `crm-channel-*` 等业务图例类；圆环侧栏一律 `.shadcn-donut-*`。
- 业务 CSS 覆盖 `.shadcn-chart-legend` 的 `margin-top`，或用空 `div` 冒充图例间距。
- 另写 `xxx-donut-layout`、固定图例宽 220/232px、或把断点降到 520px 以下强行左右排。
- 独立单系列用 C2/C3；用 success/danger 当普通分类色。
- 标题色条用 `--chart-*`。
- 在 `dashboard-*.css` 复制 `pro-meter-grow` / `pro-donut-in` / 顺时针 veil。
- 改 CSS/JS 后忘记 bump `?v=`（含 `generate-html.mjs`）。

## 4. 抄哪一页

图例与挂载**以展柜为准**，业务看板对齐同类卡片。

| 场景 | 文件 |
| --- | --- |
| XY + 底图例 | `component-chart.html`（柱 / 面积 / 折线 / 雷达） |
| 圆环右侧单行图例 | `component-chart.html`（基础圆环图） |
| 圆环右侧叠排图例（定制） | `dashboard-finance.html`（账户分配） |
| 圆环底图例（省空间） | `component-chart.html`（精简圆环图） |
| 漏斗 + 右侧单行图例 | `component-chart.html`（基础漏斗图） |
| 标题行图例 / 组合图 | `component-chart-extended.html` |
| 指标卡 / spark | `component-metric-card.html` |
| 配色预览 | `component-chart-palette.html` |

挂载 API：`js/charts/shadcn-charts.js`（`ProShadcnCharts.mount*Chart`）。

## 5. 排查（生成后画面不对时）

1. 图例与轴空白过大 → 是否 `autoMargin: false`，是否改了图例 `margin-top`。
2. Y 轴数字被裁 → 看宿主 `data-y-label-left`；提高 `yLabelMaxWidth`，勿只加大 `margin.bottom`。
3. 圆环图例贴边或右侧空一截 → 是否用 `.shadcn-donut-*`；勿写死列宽。
4. 切主题/配色后图不更新 → 须走 `ProShadcnCharts`（内置 remount）。
5. 自定义条无载入 → 是否加了 `pro-meter-fill`。
