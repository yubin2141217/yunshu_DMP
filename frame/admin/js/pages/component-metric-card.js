;(function () {
  const METRIC_GROUPS = [
    {
      key: 'stat',
      title: '基础数字指标',
      items: [
        {
          id: 'n1',
          title: '内容发布量',
          value: '18,642',
          deltaLabel: '较上周',
          deltaValue: '+6.4%',
          up: true,
          icon: 'icon-edit',
        },
        {
          id: 'n2',
          title: '活跃创作者',
          value: '1,286',
          deltaLabel: '较上周',
          deltaValue: '+9.1%',
          up: true,
          icon: 'icon-user-group',
        },
        {
          id: 'n3',
          title: '待审内容',
          value: '372',
          deltaLabel: '较昨日',
          deltaValue: '-14.6%',
          up: true,
          icon: 'icon-file',
        },
        {
          id: 'n4',
          title: '平均审核时长',
          value: '26 分',
          deltaLabel: '较昨日',
          deltaValue: '+3.2 分',
          up: false,
          icon: 'icon-clock-circle',
        },
      ],
    },
    {
      key: 'stat-solid',
      title: '色块数字指标',
      items: [
        {
          id: 's1',
          title: '线索转化',
          value: '2,418',
          deltaLabel: '较上周',
          deltaValue: '+4.2%',
          up: true,
          icon: 'icon-chart-area',
          tone: 'primary',
        },
        {
          id: 's2',
          title: '付费用户',
          value: '8,905',
          deltaLabel: '较上周',
          deltaValue: '+12.8%',
          up: true,
          icon: 'icon-user',
          tone: 'success',
        },
        {
          id: 's3',
          title: '客单价',
          value: '¥268',
          deltaLabel: '较昨日',
          deltaValue: '-1.6%',
          up: false,
          icon: 'icon-credit-card',
          tone: 'warning',
        },
        {
          id: 's4',
          title: '退订量',
          value: '94',
          deltaLabel: '较昨日',
          deltaValue: '+8.3%',
          up: false,
          icon: 'icon-notification',
          tone: 'danger',
        },
      ],
    },
    {
      key: 'stat-soft',
      title: '浅色数字指标',
      items: [
        {
          id: 'f1',
          title: '新增订单',
          value: '1,562',
          deltaLabel: '较同期',
          delta: '5.8%',
          up: true,
          icon: 'icon-list',
          tone: 'primary',
        },
        {
          id: 'f2',
          title: '复购用户',
          value: '3,204',
          deltaLabel: '较同期',
          delta: '7.3%',
          up: true,
          icon: 'icon-user-group',
          tone: 'success',
        },
        {
          id: 'f3',
          title: '售后工单',
          value: '128',
          deltaLabel: '较同期',
          delta: '2.4%',
          up: false,
          icon: 'icon-message',
          tone: 'warning',
        },
        {
          id: 'f4',
          title: '库存预警',
          value: '36',
          deltaLabel: '较同期',
          delta: '11.0%',
          up: false,
          icon: 'icon-exclamation-circle',
          tone: 'danger',
        },
      ],
    },
    {
      key: 'icon-bar',
      title: '图标进度指标',
      items: [
        { id: 'ib1', title: '完成进度', value: '75%', percent: 0.75, icon: 'icon-check-circle', tone: 'success' },
        { id: 'ib2', title: '项目进度', value: '65%', percent: 0.65, icon: 'icon-message', tone: 'primary' },
        { id: 'ib3', title: '学习进度', value: '45%', percent: 0.45, icon: 'icon-fire', tone: 'danger' },
        { id: 'ib4', title: '任务进度', value: '90%', percent: 0.9, icon: 'icon-star', tone: 'info' },
      ],
    },
    {
      key: 'progress',
      title: '圆环数字指标',
      items: [
        { id: 'p1', title: '内容发布进度', value: '76%', target: '目标 100%', percent: 0.76, tone: 'primary' },
        { id: 'p2', title: '质检完成度', value: '52%', target: '目标 80%', percent: 0.52, tone: 'success' },
        { id: 'p3', title: '审核及时率', value: '91%', target: '目标 95%', percent: 0.91, tone: 'warning' },
        { id: 'p4', title: '存储使用率', value: '64%', target: '容量 2TB', percent: 0.64, tone: 'danger' },
      ],
    },
    {
      key: 'progress-line',
      title: '进度条指标',
      items: [
        { id: 'l1', title: '周活达成率', value: '68%', target: '目标 75%', percent: 0.68, tone: 'primary' },
        { id: 'l2', title: '线索跟进率', value: '84%', target: '目标 90%', percent: 0.84, tone: 'success' },
        { id: 'l3', title: '工单关闭率', value: '43%', target: '目标 60%', percent: 0.43, tone: 'warning' },
        { id: 'l4', title: '带宽占用率', value: '79%', target: '上限 100%', percent: 0.79, tone: 'danger' },
      ],
    },
    {
      key: 'status',
      title: '状态进度指标',
      items: [
        { id: 'st1', title: '发电总量', value: '91%', percent: 0.91, done: false },
        { id: 'st2', title: '并网容量', value: '78%', percent: 0.78, done: false },
        { id: 'st3', title: '巡检完成', value: '100%', percent: 1, done: true },
        { id: 'st4', title: '告警闭环', value: '100%', percent: 1, done: true },
      ],
    },
    {
      key: 'spark',
      title: '趋势图指标',
      items: [
        {
          id: 'sp1',
          chart: 'line',
          smooth: false,
          title: '成交金额',
          tip: '统计周期内已成交订单的金额合计',
          value: '5250.45',
          unit: '万元',
          deltaLabel: '较上周',
          delta: '22%',
          up: true,
          series: [42, 48, 45, 52, 58, 55, 62, 70, 68, 75, 82, 88],
        },
        {
          id: 'sp2',
          chart: 'line',
          smooth: false,
          title: '回款金额',
          tip: '统计周期内实际到账的回款金额合计',
          value: '3670.30',
          unit: '万元',
          deltaLabel: '较上周',
          delta: '15%',
          up: false,
          series: [80, 78, 74, 70, 72, 68, 65, 60, 58, 55, 52, 48],
        },
        {
          id: 'sp3',
          chart: 'bar',
          title: '新增客户',
          tip: '统计周期内新录入或新注册的客户数量',
          value: '2065',
          unit: '人',
          deltaLabel: '较上周',
          delta: '25%',
          up: true,
          series: [36, 48, 42, 58, 52, 66, 60, 74, 68, 82, 76, 90],
        },
        {
          id: 'sp4',
          chart: 'ring',
          title: '新增合同',
          tip: '统计周期内新签订合同数量及完成进度',
          value: '1786',
          unit: '份',
          deltaLabel: '较上周',
          delta: '20%',
          up: false,
          percent: 0.72,
        },
      ],
    },
    {
      key: 'spark-kpi',
      title: '图标趋势指标',
      items: [
        {
          id: 'sk1',
          title: '成交金额(元)',
          tip: '统计周期内成交订单金额合计',
          value: '65,200',
          deltaLabel: '较昨日',
          delta: '20%',
          up: true,
          icon: 'icon-chart-column-solid',
          series: [46, 48, 51, 49, 53, 58, 56, 61, 59, 64, 67, 65, 70, 68, 73, 77, 75, 79, 82, 86],
        },
        {
          id: 'sk2',
          title: '订单数量(笔)',
          tip: '统计周期内订单笔数合计',
          value: '3350',
          deltaLabel: '较昨日',
          delta: '25%',
          up: true,
          icon: 'icon-activity-solid',
          series: [54, 61, 57, 63, 48, 52, 59, 55, 67, 62, 58, 71, 66, 73, 69, 76, 72, 80, 77, 84],
        },
        {
          id: 'sk3',
          title: '访客数量(人)',
          tip: '统计周期内独立访客数量',
          value: '6780',
          deltaLabel: '较昨日',
          delta: '10%',
          up: true,
          icon: 'icon-chart-area-solid',
          series: [58, 62, 60, 67, 71, 68, 64, 70, 74, 72, 69, 76, 73, 78, 81, 79, 83, 80, 85, 88],
        },
        {
          id: 'sk4',
          title: '客户数量(人)',
          tip: '统计周期内客户总量',
          value: '3578',
          deltaLabel: '较昨日',
          delta: '15%',
          up: true,
          icon: 'icon-user-group-solid',
          series: [34, 36, 39, 37, 41, 45, 43, 48, 52, 50, 55, 53, 58, 61, 59, 64, 67, 65, 71, 76],
        },
      ],
    },
    {
      key: 'trend',
      title: '目标达成指标',
      items: [
        {
          id: 'tr1',
          title: '总销售额',
          value: '467,500',
          unit: '元',
          deltaLabel: '较昨日',
          delta: '18%',
          up: true,
          percent: 0.85,
          marker: 0.92,
          rateLabel: '完成率',
          rate: '95%',
          targetLabel: '目标销售额',
          target: '550,000元',
        },
        {
          id: 'tr2',
          title: '本月订单数',
          value: '12,480',
          unit: '笔',
          deltaLabel: '较昨日',
          delta: '12%',
          up: false,
          percent: 0.68,
          marker: 0.8,
          rateLabel: '完成率',
          rate: '72%',
          targetLabel: '目标订单数',
          target: '17,300笔',
        },
        {
          id: 'tr3',
          title: '新增商户',
          value: '386',
          unit: '家',
          deltaLabel: '较昨日',
          delta: '8%',
          up: true,
          percent: 0.76,
          marker: 0.88,
          rateLabel: '完成率',
          rate: '81%',
          targetLabel: '目标新增',
          target: '480家',
        },
        {
          id: 'tr4',
          title: '客单价',
          value: '1,286',
          unit: '元',
          deltaLabel: '较昨日',
          delta: '5%',
          up: false,
          percent: 0.54,
          marker: 0.7,
          rateLabel: '完成率',
          rate: '64%',
          targetLabel: '目标客单价',
          target: '2,000元',
        },
      ],
    },
    {
      key: 'flip',
      title: '翻牌数字指标',
    },
    {
      key: 'type',
      title: '支付渠道指标',
      items: [
        {
          id: 't0',
          title: '渠道交易总额',
          value: '825,400',
          unit: '元',
          delta: '12%',
          up: true,
          segments: [
            { color: 'var(--chart-1)', flex: 3.5 },
            { color: 'var(--chart-2)', flex: 2.9 },
            { color: 'var(--chart-3)', flex: 2.0 },
            { color: 'var(--chart-4)', flex: 1.0 },
            { color: 'var(--chart-5)', flex: 0.6 },
          ],
        },
        {
          id: 't1',
          title: '微信支付',
          value: '286,420',
          unit: '元',
          delta: '15%',
          up: true,
          percent: 0.347,
          barColor: 'var(--chart-1)',
        },
        {
          id: 't2',
          title: '支付宝',
          value: '241,180',
          unit: '元',
          delta: '8%',
          up: false,
          percent: 0.292,
          barColor: 'var(--chart-2)',
        },
        {
          id: 't3',
          title: '银行卡',
          value: '168,650',
          unit: '元',
          delta: '6%',
          up: true,
          percent: 0.204,
          barColor: 'var(--chart-3)',
        },
        {
          id: 't4',
          title: '现金',
          value: '78,960',
          unit: '元',
          delta: '3%',
          up: false,
          percent: 0.096,
          barColor: 'var(--chart-4)',
        },
        {
          id: 't5',
          title: '其它渠道',
          value: '50,190',
          unit: '元',
          delta: '9%',
          up: true,
          percent: 0.061,
          barColor: 'var(--chart-5)',
        },
      ],
    },
  ]

  function buildSparklinePath(series, options) {
    const smooth = !!(options && options.smooth)
    const w = 160
    const h = 58
    const padX = 1
    const padY = 4
    const min = Math.min.apply(null, series)
    const max = Math.max.apply(null, series)
    const range = max - min || 1
    const pts = series.map((v, i) => {
      const x = padX + (i / (series.length - 1)) * (w - padX * 2)
      const y = h - padY - ((v - min) / range) * (h - padY * 2)
      return [x, y]
    })

    function polyline(points) {
      return points
        .map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(2) + ' ' + p[1].toFixed(2))
        .join(' ')
    }

    function smoothLine(points) {
      if (points.length < 2) return ''
      let d = 'M' + points[0][0].toFixed(2) + ' ' + points[0][1].toFixed(2)
      if (points.length === 2) {
        return d + ' L' + points[1][0].toFixed(2) + ' ' + points[1][1].toFixed(2)
      }
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i === 0 ? 0 : i - 1]
        const p1 = points[i]
        const p2 = points[i + 1]
        const p3 = points[i + 2] || p2
        const c1x = p1[0] + (p2[0] - p0[0]) / 7
        const c1y = p1[1] + (p2[1] - p0[1]) / 7
        const c2x = p2[0] - (p3[0] - p1[0]) / 7
        const c2y = p2[1] - (p3[1] - p1[1]) / 7
        d +=
          ' C' +
          c1x.toFixed(2) +
          ' ' +
          c1y.toFixed(2) +
          ',' +
          c2x.toFixed(2) +
          ' ' +
          c2y.toFixed(2) +
          ',' +
          p2[0].toFixed(2) +
          ' ' +
          p2[1].toFixed(2)
      }
      return d
    }

    const line = smooth ? smoothLine(pts) : polyline(pts)
    const last = pts[pts.length - 1]
    const first = pts[0]
    const area = line + ' L' + last[0].toFixed(2) + ' ' + h + ' L' + first[0].toFixed(2) + ' ' + h + ' Z'
    return { line, area, w, h }
  }

  function buildSparkBars(series) {
    const w = 148
    const h = 58
    const gap = 3.5
    const padY = 4
    const max = Math.max.apply(null, series) || 1
    const barW = (w - gap * (series.length - 1)) / series.length
    return {
      w,
      h,
      bars: series.map((v, i) => {
        const bh = Math.max(4, ((v / max) * (h - padY)))
        return {
          x: i * (barW + gap),
          y: h - bh,
          width: Math.max(2, barW),
          height: bh,
        }
      }),
    }
  }

  function buildSparkRing(percent, options) {
    const size = (options && options.size) || 72
    const stroke = (options && options.stroke) || 8
    const r = (size - stroke) / 2
    const c = 2 * Math.PI * r
    const p = Math.max(0, Math.min(1, percent))
    return {
      size,
      stroke,
      r,
      cx: size / 2,
      cy: size / 2,
      c,
      offset: c * (1 - p),
      label: Math.round(p * 100) + '%',
    }
  }

  ;['spark', 'spark-kpi'].forEach((key) => {
    const group = METRIC_GROUPS.find((g) => g.key === key)
    if (!group) return
    group.items.forEach((item) => {
      if (item.chart === 'bar') {
        item.spark = buildSparkBars(item.series)
      } else if (item.chart === 'ring') {
        item.spark = buildSparkRing(item.percent)
      } else {
        item.spark = buildSparklinePath(item.series, {
          smooth: item.smooth !== false && key === 'spark-kpi',
        })
      }
    })
  })

  ;(function prepProgressRings() {
    const group = METRIC_GROUPS.find((g) => g.key === 'progress')
    if (!group) return
    group.items.forEach((item) => {
      item.ring = buildSparkRing(item.percent, { size: 64, stroke: 6 })
    })
  })()

  const FLIP_SEED = [
    { id: 'd1', title: '日活用户', value: 24216758, delta: '30%', up: true, tone: 'success' },
    { id: 'd2', title: '累计访问', value: 51783254, delta: '20%', up: true, tone: 'info' },
    { id: 'd3', title: '交易笔数', value: 63515006, delta: '20%', up: false, tone: 'warning' },
  ]

  const MetricCardPage = {
    name: 'MetricCardPage',
    data() {
      return {
        metricGroups: METRIC_GROUPS,
        flipItems: FLIP_SEED.map((item) => ({
          ...item,
          display: item.value,
        })),
        flipTimer: null,
      }
    },
    mounted() {
      this.flipTimer = window.setInterval(() => {
        this.tickFlipNumbers()
      }, 2200)
      this._onChartPalette = () => this.$forceUpdate()
      window.addEventListener('arco-pro-chart-palette-change', this._onChartPalette)
      window.addEventListener('arco-pro-theme-change', this._onChartPalette)
    },
    beforeUnmount() {
      if (this.flipTimer) {
        window.clearInterval(this.flipTimer)
        this.flipTimer = null
      }
      if (this._onChartPalette) {
        window.removeEventListener('arco-pro-chart-palette-change', this._onChartPalette)
        window.removeEventListener('arco-pro-theme-change', this._onChartPalette)
      }
    },
    methods: {
      chartColor(tone) {
        const api = window.ArcoProChartPalette
        const isTheme =
          api && api.getScheme(api.getCurrentId()).mode === 'theme'
        if (isTheme) return 'var(--chart-1)'
        const map = {
          primary: 'var(--chart-1)',
          success: 'var(--chart-2)',
          warning: 'var(--chart-3)',
          danger: 'var(--chart-4)',
          info: 'var(--chart-5)',
        }
        return map[tone] || 'var(--chart-1)'
      },
      flipTokens(value) {
        const text = String(Math.max(0, Math.floor(value))).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        return Array.from(text).map((ch) =>
          ch === ',' ? { type: 'comma' } : { type: 'digit', n: Number(ch) }
        )
      },
      tickFlipNumbers() {
        this.flipItems.forEach((item) => {
          // 每次仅变动末 3～4 位（约 100～9999），高位保持稳定
          const abs = 100 + Math.floor(Math.random() * 9900)
          const next = item.display + (Math.random() < 0.55 ? abs : -abs)
          const lo = item.value - 9999
          const hi = item.value + 9999
          item.display = Math.min(hi, Math.max(lo, next))
        })
      },
    },
    template: `
      <div class="list-card-page">
        <div class="list-card-metric-panel">
          <div v-for="group in metricGroups" :key="group.key" class="list-card-metric-group">
            <div class="list-card-metric-group-title">{{ group.title }}</div>

            <a-row v-if="group.key === 'stat' || group.key === 'stat-solid' || group.key === 'stat-soft'" :gutter="[16, 16]">
              <a-col v-for="item in group.items" :key="item.id" :xs="24" :sm="12" :md="8" :lg="6">
                <a-card
                  class="list-card-item list-card-item--metric list-card-item--metric-stat"
                  :class="{
                    'list-card-item--metric-stat-solid': group.key === 'stat-solid',
                    'list-card-item--metric-stat-soft': group.key === 'stat-soft',
                  }"
                  hoverable
                >
                  <div
                    class="list-card-metric list-card-metric--stat"
                    :class="{
                      'list-card-metric--stat-solid': group.key === 'stat-solid' || group.key === 'stat-soft',
                      'list-card-metric--stat-soft': group.key === 'stat-soft',
                    }"
                  >
                    <div class="list-card-metric-stat-main">
                      <div class="list-card-metric-stat-head">
                        <span class="list-card-metric-stat-title">{{ item.title }}</span>
                        <template v-if="group.key === 'stat'">
                          <span v-if="item.iconText" class="list-card-metric-stat-icon-text" aria-hidden="true">{{ item.iconText }}</span>
                          <component v-else :is="item.icon" class="list-card-metric-stat-icon" />
                        </template>
                      </div>
                      <div class="list-card-metric-stat-value">{{ item.value }}</div>
                      <div v-if="group.key === 'stat-soft'" class="list-card-metric-stat-foot">
                        <span
                          class="list-card-metric-badge"
                          :class="item.up ? 'list-card-metric-badge--up' : 'list-card-metric-badge--down'"
                        >
                          <icon-caret-up-fill v-if="item.up" />
                          <icon-caret-down-fill v-else />
                          {{ item.deltaLabel }} {{ item.delta }}
                        </span>
                      </div>
                      <div v-else class="list-card-metric-stat-delta">
                        <span class="list-card-metric-stat-delta-label">{{ item.deltaLabel }}</span>
                        <span
                          class="list-card-metric-stat-delta-value"
                          :class="item.up ? 'is-up' : 'is-down'"
                        >{{ item.deltaValue }}</span>
                      </div>
                    </div>
                    <span
                      v-if="group.key === 'stat-solid'"
                      class="list-card-metric-stat-block"
                      :class="'is-' + item.tone"
                    >
                      <component :is="item.icon" />
                    </span>
                    <span
                      v-else-if="group.key === 'stat-soft'"
                      class="list-card-metric-stat-soft-icon"
                      :class="'is-' + item.tone"
                    >
                      <component :is="item.icon" />
                    </span>
                  </div>
                </a-card>
              </a-col>
            </a-row>

            <a-row v-else-if="group.key === 'progress'" :gutter="[16, 16]">
              <a-col v-for="item in group.items" :key="item.id" :xs="24" :sm="12" :md="8" :lg="6">
                <a-card class="list-card-item list-card-item--metric list-card-item--metric-progress" hoverable>
                  <div class="list-card-metric list-card-metric--progress">
                    <div class="list-card-metric-progress-top">
                      <div class="list-card-metric-progress-copy">
                        <span class="list-card-metric-stat-title">{{ item.title }}</span>
                        <div class="list-card-metric-value">{{ item.value }}</div>
                        <a-typography-text type="secondary" class="list-card-metric-tip">{{ item.target }}</a-typography-text>
                      </div>
                      <div class="list-card-metric-progress-ring-wrap">
                        <svg
                          class="list-card-metric-progress-ring"
                          :viewBox="'0 0 ' + item.ring.size + ' ' + item.ring.size"
                          aria-hidden="true"
                        >
                          <circle
                            class="list-card-metric-progress-ring-track"
                            :cx="item.ring.cx"
                            :cy="item.ring.cy"
                            :r="item.ring.r"
                            fill="none"
                            stroke="var(--color-fill-3)"
                            :stroke-width="item.ring.stroke"
                          />
                          <circle
                            class="list-card-metric-spark-ring-progress"
                            :cx="item.ring.cx"
                            :cy="item.ring.cy"
                            :r="item.ring.r"
                            fill="none"
                            :stroke="chartColor(item.tone)"
                            :stroke-width="item.ring.stroke"
                            stroke-linecap="round"
                            :stroke-dasharray="item.ring.c"
                            :stroke-dashoffset="item.ring.offset"
                            :style="{ '--spark-c': item.ring.c }"
                            :transform="'rotate(-90 ' + item.ring.cx + ' ' + item.ring.cy + ')'"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </a-card>
              </a-col>
            </a-row>

            <a-row v-else-if="group.key === 'progress-line'" :gutter="[16, 16]">
              <a-col v-for="item in group.items" :key="item.id" :xs="24" :sm="12" :md="8" :lg="6">
                <a-card class="list-card-item list-card-item--metric list-card-item--metric-progress" hoverable>
                  <div class="list-card-metric list-card-metric--progress-line">
                    <div class="list-card-metric-progress-head">
                      <span class="list-card-metric-stat-title">{{ item.title }}</span>
                      <div class="list-card-metric-value list-card-metric-value--sm">{{ item.value }}</div>
                    </div>
                    <a-progress
                      class="list-card-metric-progress-bar"
                      :percent="item.percent"
                      :color="chartColor(item.tone)"
                      :show-text="false"
                      :stroke-width="6"
                    />
                    <a-typography-text type="secondary" class="list-card-metric-tip">{{ item.target }}</a-typography-text>
                  </div>
                </a-card>
              </a-col>
            </a-row>

            <a-card v-else-if="group.key === 'type'" class="list-card-item list-card-item--metric list-card-item--metric-type" :bordered="true">
              <div class="list-card-metric-type-grid">
                <div v-for="item in group.items" :key="item.id" class="list-card-metric-type-cell">
                  <div class="list-card-metric-type-head">
                    <span class="list-card-metric-type-title list-card-metric-stat-title">{{ item.title }}</span>
                    <span
                      class="list-card-metric-type-delta"
                      :class="item.up ? 'is-up' : 'is-down'"
                    >
                      {{ item.up ? '+' : '-' }}{{ item.delta }}
                      <icon-caret-up-fill v-if="item.up" />
                      <icon-caret-down-fill v-else />
                    </span>
                  </div>
                  <div class="list-card-metric-type-value">
                    <span class="list-card-metric-type-num">{{ item.value }}</span>
                    <span class="list-card-metric-type-unit">{{ item.unit }}</span>
                  </div>
                  <div v-if="item.segments" class="list-card-metric-type-segments">
                    <span
                      v-for="(seg, idx) in item.segments"
                      :key="idx"
                      class="list-card-metric-type-segment"
                      :style="{ flex: seg.flex, background: seg.color }"
                    ></span>
                  </div>
                  <div v-else class="list-card-metric-type-bar">
                    <span
                      class="list-card-metric-type-bar-fill"
                      :style="{ width: item.percent * 100 + '%', background: item.barColor }"
                    ></span>
                  </div>
                </div>
              </div>
            </a-card>

            <a-row v-else-if="group.key === 'status'" :gutter="[16, 16]">
              <a-col v-for="item in group.items" :key="item.id" :xs="24" :sm="12" :md="8" :lg="6">
                <a-card class="list-card-item list-card-item--metric list-card-item--metric-status" hoverable>
                  <div class="list-card-metric list-card-metric--status">
                    <div class="list-card-metric-status-head">
                      <div class="list-card-metric-status-title list-card-metric-stat-title">{{ item.title }}</div>
                      <div
                        class="list-card-metric-status-label"
                        :class="item.done ? 'is-done' : 'is-pending'"
                      >{{ item.done ? '已完成' : '未完成' }}</div>
                    </div>
                    <div class="list-card-metric-status-value">{{ item.value }}</div>
                    <div
                      class="list-card-metric-status-bar"
                      :class="item.done ? 'is-done' : 'is-pending'"
                    >
                      <span class="list-card-metric-status-bar-fill" :style="{ width: item.percent * 100 + '%' }"></span>
                    </div>
                  </div>
                </a-card>
              </a-col>
            </a-row>

            <a-row v-else-if="group.key === 'trend'" :gutter="[16, 16]">
              <a-col v-for="item in group.items" :key="item.id" :xs="24" :sm="12" :md="12" :lg="12" :xl="6">
                <a-card class="list-card-item list-card-item--metric list-card-item--metric-trend" hoverable>
                  <div class="list-card-metric list-card-metric--trend">
                    <div class="list-card-metric-trend-title list-card-metric-stat-title">{{ item.title }}</div>
                    <div class="list-card-metric-trend-mid">
                      <div class="list-card-metric-trend-value">
                        <span class="list-card-metric-trend-num">{{ item.value }}</span>
                        <span class="list-card-metric-trend-unit">{{ item.unit }}</span>
                      </div>
                      <div
                        class="list-card-metric-trend-delta"
                        :class="item.up ? 'is-up' : 'is-down'"
                      >
                        <span class="list-card-metric-trend-delta-label">{{ item.deltaLabel }}</span>
                        <icon-caret-up-fill v-if="item.up" />
                        <icon-caret-down-fill v-else />
                        <span class="list-card-metric-trend-delta-val">{{ item.delta }}</span>
                      </div>
                    </div>
                    <div class="list-card-metric-trend-bar">
                      <span class="list-card-metric-trend-bar-fill" :style="{ width: item.percent * 100 + '%' }"></span>
                      <span
                        v-if="item.marker != null"
                        class="list-card-metric-trend-bar-marker"
                        :style="{ left: item.marker * 100 + '%' }"
                      ></span>
                    </div>
                    <div class="list-card-metric-trend-foot">
                      <span>{{ item.rateLabel }} {{ item.rate }}</span>
                      <span>{{ item.targetLabel }} {{ item.target }}</span>
                    </div>
                  </div>
                </a-card>
              </a-col>
            </a-row>

            <a-row v-else-if="group.key === 'icon-bar'" :gutter="[16, 16]">
              <a-col v-for="item in group.items" :key="item.id" :xs="24" :sm="12" :md="8" :lg="6">
                <a-card class="list-card-item list-card-item--metric list-card-item--metric-icon-bar" hoverable>
                  <div class="list-card-metric list-card-metric--icon-bar">
                    <div class="list-card-metric-icon-bar-top">
                      <span class="list-card-metric-icon-bar-icon" :class="'is-' + item.tone">
                        <component :is="item.icon" />
                      </span>
                      <div class="list-card-metric-icon-bar-copy">
                        <div class="list-card-metric-icon-bar-value">{{ item.value }}</div>
                        <div class="list-card-metric-stat-title">{{ item.title }}</div>
                      </div>
                    </div>
                    <div class="list-card-metric-icon-bar-track" :class="'is-' + item.tone">
                      <span class="list-card-metric-icon-bar-fill" :style="{ width: item.percent * 100 + '%' }"></span>
                    </div>
                  </div>
                </a-card>
              </a-col>
            </a-row>

            <a-row v-else-if="group.key === 'spark'" :gutter="[16, 16]">
              <a-col v-for="item in group.items" :key="item.id" :xs="24" :sm="12" :md="12" :lg="12" :xl="6">
                <a-card class="list-card-item list-card-item--metric list-card-item--metric-spark" hoverable>
                  <div class="list-card-metric list-card-metric--spark">
                    <div class="list-card-metric-spark-main">
                      <div class="list-card-metric-spark-title">
                        <span class="list-card-metric-stat-title">{{ item.title }}</span>
                        <a-tooltip :content="item.tip">
                          <span class="list-card-metric-spark-help-wrap">
                            <icon-info-circle class="list-card-metric-spark-help" />
                          </span>
                        </a-tooltip>
                      </div>
                      <div class="list-card-metric-spark-value">
                        <span class="list-card-metric-spark-num">{{ item.value }}</span>
                        <span class="list-card-metric-spark-unit">{{ item.unit }}</span>
                      </div>
                      <span
                        class="list-card-metric-spark-tag"
                        :class="item.up ? 'is-up' : 'is-down'"
                      >
                        {{ item.deltaLabel }}
                        <icon-caret-up-fill v-if="item.up" />
                        <icon-caret-down-fill v-else />
                        {{ item.delta }}
                      </span>
                    </div>
                    <svg
                      v-if="item.chart === 'line' || item.chart === 'area'"
                      class="list-card-metric-spark-chart"
                      :viewBox="'0 0 ' + item.spark.w + ' ' + item.spark.h"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <defs>
                        <linearGradient :id="'spark-fill-' + item.id" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stop-color="var(--chart-1)" stop-opacity="0.35" />
                          <stop offset="100%" stop-color="var(--chart-1)" stop-opacity="0.04" />
                        </linearGradient>
                      </defs>
                      <path
                        class="list-card-metric-spark-area"
                        :d="item.spark.area"
                        :fill="'url(#spark-fill-' + item.id + ')'"
                      />
                      <path
                        v-if="item.chart === 'line'"
                        class="list-card-metric-spark-line"
                        :d="item.spark.line"
                        fill="none"
                        stroke="var(--chart-1)"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    <svg
                      v-else-if="item.chart === 'bar'"
                      class="list-card-metric-spark-chart list-card-metric-spark-chart--bar"
                      :viewBox="'0 0 ' + item.spark.w + ' ' + item.spark.h"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <rect
                        v-for="(bar, bi) in item.spark.bars"
                        :key="item.id + '-bar-' + bi"
                        class="list-card-metric-spark-bar"
                        :x="bar.x"
                        :y="bar.y"
                        :width="bar.width"
                        :height="bar.height"
                        rx="1.5"
                        fill="var(--chart-1)"
                      />
                    </svg>
                    <div v-else class="list-card-metric-spark-ring-wrap">
                      <svg
                        class="list-card-metric-spark-chart list-card-metric-spark-chart--ring"
                        :viewBox="'0 0 ' + item.spark.size + ' ' + item.spark.size"
                        aria-hidden="true"
                      >
                        <circle
                          class="list-card-metric-spark-ring-track"
                          :cx="item.spark.cx"
                          :cy="item.spark.cy"
                          :r="item.spark.r"
                          fill="none"
                          stroke="var(--color-fill-3)"
                          :stroke-width="item.spark.stroke"
                        />
                        <circle
                          class="list-card-metric-spark-ring-progress"
                          :cx="item.spark.cx"
                          :cy="item.spark.cy"
                          :r="item.spark.r"
                          fill="none"
                          stroke="var(--chart-1)"
                          :stroke-width="item.spark.stroke"
                          stroke-linecap="round"
                          :stroke-dasharray="item.spark.c"
                          :stroke-dashoffset="item.spark.offset"
                          :style="{ '--spark-c': item.spark.c }"
                          :transform="'rotate(-90 ' + item.spark.cx + ' ' + item.spark.cy + ')'"
                        />
                      </svg>
                      <span class="list-card-metric-spark-ring-label">{{ item.spark.label }}</span>
                    </div>
                  </div>
                </a-card>
              </a-col>
            </a-row>

            <a-row v-else-if="group.key === 'spark-kpi'" :gutter="[16, 16]">
              <a-col v-for="item in group.items" :key="item.id" :xs="24" :sm="12" :md="12" :lg="12" :xl="6">
                <a-card class="list-card-item list-card-item--metric list-card-item--metric-spark-kpi" hoverable>
                  <div class="list-card-metric list-card-metric--spark-kpi">
                    <div class="list-card-metric-spark-kpi-main">
                      <div class="list-card-metric-spark-kpi-title">
                        <span class="list-card-metric-spark-kpi-icon" aria-hidden="true">
                          <component :is="item.icon" />
                        </span>
                        <span class="list-card-metric-spark-kpi-name">{{ item.title }}</span>
                      </div>
                      <div class="list-card-metric-spark-kpi-value">{{ item.value }}</div>
                      <div class="list-card-metric-spark-kpi-trend" :class="item.up ? 'is-up' : 'is-down'">
                        <span class="list-card-metric-spark-kpi-trend-label">{{ item.deltaLabel }}</span>
                        <icon-trending-up v-if="item.up" class="list-card-metric-spark-kpi-trend-icon" />
                        <icon-trending-down v-else class="list-card-metric-spark-kpi-trend-icon" />
                        <span class="list-card-metric-spark-kpi-delta">{{ item.delta }}</span>
                      </div>
                    </div>
                    <svg
                      class="list-card-metric-spark-kpi-chart"
                      :viewBox="'0 0 ' + item.spark.w + ' ' + item.spark.h"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <defs>
                        <linearGradient :id="'spark-kpi-fill-' + item.id" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stop-color="var(--chart-1)" stop-opacity="0.32" />
                          <stop offset="100%" stop-color="var(--chart-1)" stop-opacity="0.02" />
                        </linearGradient>
                      </defs>
                      <path
                        class="list-card-metric-spark-area"
                        :d="item.spark.area"
                        :fill="'url(#spark-kpi-fill-' + item.id + ')'"
                      />
                      <path
                        class="list-card-metric-spark-line"
                        :d="item.spark.line"
                        fill="none"
                        stroke="var(--chart-1)"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </div>
                </a-card>
              </a-col>
            </a-row>

            <a-card v-else-if="group.key === 'flip'" class="list-card-item list-card-item--metric list-card-item--metric-flip" :bordered="true">
              <div class="list-card-metric-flip-list">
                <div
                  v-for="item in flipItems"
                  :key="item.id"
                  class="list-card-metric-flip-row"
                  :class="'is-' + item.tone"
                >
                  <div class="list-card-metric-flip-head">
                    <span class="list-card-metric-stat-title">{{ item.title }}</span>
                    <span
                      class="list-card-metric-flip-delta"
                      :class="item.up ? 'is-up' : 'is-down'"
                    >
                      {{ item.delta }}
                      <icon-caret-up-fill v-if="item.up" />
                      <icon-caret-down-fill v-else />
                    </span>
                  </div>
                  <div class="list-card-metric-flip-board">
                    <template v-for="(token, idx) in flipTokens(item.display)" :key="item.id + '-' + idx">
                      <span v-if="token.type === 'comma'" class="list-card-metric-flip-comma">,</span>
                      <span v-else class="list-card-metric-flip-digit">
                        <span
                          class="list-card-metric-flip-strip"
                          :style="{ transform: 'translateY(-' + token.n * 10 + '%)' }"
                        >
                          <span v-for="n in 10" :key="n">{{ n - 1 }}</span>
                        </span>
                      </span>
                    </template>
                  </div>
                </div>
              </div>
            </a-card>
          </div>
        </div>
      </div>
    `,
  }

  mountProPage({
    pageKey: 'chart/metric-card',
    title: ArcoProLocale.menu['menu.chart.metricCard'],
    pageComponent: MetricCardPage,
  })
})()
