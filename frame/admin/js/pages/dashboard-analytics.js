;(function () {
  const t = {
    pageTitle: '经营分析',
    tabOverview: '概览',
    tabAudience: '受众',
    tabAcquisition: '获客',
    tabEngagement: '互动',
    tabConversions: '转化',
    placeholderAudience: '受众视图即将上线。',
    placeholderAcquisition: '获客视图即将上线。',
    placeholderEngagement: '互动视图即将上线。',
    placeholderConversions: '转化视图即将上线。',
    periodThisMonth: '本月',
    periodLastMonth: '上月',
    period30d: '近 30 天',
    periodYtd: '年初至今',
    refresh: '刷新',
    moreActions: '更多操作',
    exportReport: '导出报告',
    importData: '导入数据',
    shareDashboard: '分享仪表盘',
    refreshMetrics: '刷新指标',
    kpiVisitors: '独立访客',
    kpiSessions: '会话数',
    kpiPageviews: '页面浏览量',
    kpiEngagement: '互动率',
    kpiConversion: '转化率',
    samePeriod: '同期数据',
    trafficQuality: '流量质量',
    actualQuality: '实际质量',
    baselineQuality: '基准质量',
    realtimeVisitors: '实时访客',
    visitors: '独立访客',
    perMinute: '每分钟',
    live: '实时',
    topPages: '页面表现',
    colPath: '页面',
    colViews: '浏览量',
    colAvgTime: '平均时长',
    colBounce: '跳出率',
    trafficSources: '流量来源',
    tabSources: '来源',
    tabCampaigns: '活动',
    tabReferrers: '引荐站',
    tipExport: '已触发导出报告（演示）',
    tipImport: '已触发导入数据（演示）',
    tipShare: '已触发分享仪表盘（演示）',
    tipRefresh: '数据已刷新（原型演示）',
    viewDetail: '查看详情',
    tipViewDetail: '查看详情（演示）',
  }

  // 前段保留原有跌宕；后段原先贴顶过平，改为适度起伏（勿整表放大）
  const qualitySeries = [
    { actualQuality: 0.4, baselineQuality: -1.2 },
    { actualQuality: 0.1, baselineQuality: -0.9 },
    { actualQuality: 0.8, baselineQuality: -1.4 },
    { actualQuality: 1.5, baselineQuality: -1.1 },
    { actualQuality: 2.4, baselineQuality: -0.7 },
    { actualQuality: 2.6, baselineQuality: -0.2 },
    { actualQuality: 2.3, baselineQuality: -0.5 },
    { actualQuality: 3.1, baselineQuality: 0.3 },
    { actualQuality: 2.8, baselineQuality: -0.1 },
    { actualQuality: 3.6, baselineQuality: 0.8 },
    { actualQuality: 2.9, baselineQuality: 0.2 },
    { actualQuality: 1.2, baselineQuality: 1 },
    { actualQuality: -0.4, baselineQuality: 1.6 },
    { actualQuality: -1.1, baselineQuality: 0.8 },
    { actualQuality: -0.2, baselineQuality: 0.4 },
    { actualQuality: -1.5, baselineQuality: 1.3 },
    { actualQuality: -2.2, baselineQuality: 2.2 },
    { actualQuality: -1.4, baselineQuality: 2.9 },
    { actualQuality: -2.8, baselineQuality: 1.1 },
    { actualQuality: -1.8, baselineQuality: 0.3 },
    { actualQuality: -4.7, baselineQuality: 1.8 },
    { actualQuality: -2.8, baselineQuality: 1.4 },
    { actualQuality: -0.9, baselineQuality: 2.3 },
    { actualQuality: 0.6, baselineQuality: 1.7 },
    { actualQuality: 1.3, baselineQuality: 2.6 },
    { actualQuality: -0.4, baselineQuality: 2.2 },
    { actualQuality: -1.5, baselineQuality: 3.2 },
    { actualQuality: 4.1, baselineQuality: 5.8 },
    { actualQuality: 3.4, baselineQuality: 4.7 },
    { actualQuality: 2.7, baselineQuality: 3.6 },
    { actualQuality: 3.5, baselineQuality: 4.2 },
    { actualQuality: 2.6, baselineQuality: 2.9 },
    { actualQuality: 3.2, baselineQuality: 3.7 },
    { actualQuality: 2.4, baselineQuality: 2.8 },
    { actualQuality: 3, baselineQuality: 3.4 },
    { actualQuality: -2, baselineQuality: 2.6 },
    { actualQuality: -1.2, baselineQuality: 4 },
    { actualQuality: 0.4, baselineQuality: 2.7 },
    { actualQuality: 1.8, baselineQuality: 3.6 },
    { actualQuality: 1.2, baselineQuality: 4.1 },
    { actualQuality: 2.8, baselineQuality: 2.5 },
    { actualQuality: 2.2, baselineQuality: 1.4 },
    { actualQuality: 3, baselineQuality: -0.4 },
    { actualQuality: 2.5, baselineQuality: -1.4 },
    { actualQuality: 4.3, baselineQuality: -0.8 },
    { actualQuality: 3.7, baselineQuality: -0.3 },
    { actualQuality: 2.9, baselineQuality: -1.2 },
    { actualQuality: 2.1, baselineQuality: -0.6 },
    { actualQuality: 1.6, baselineQuality: 0.1 },
    { actualQuality: 3, baselineQuality: 0.9 },
    { actualQuality: 3.4, baselineQuality: 1.4 },
    { actualQuality: 2.8, baselineQuality: 1.9 },
    { actualQuality: 4, baselineQuality: 2.6 },
    { actualQuality: 4.8, baselineQuality: 3.4 },
    { actualQuality: 5.2, baselineQuality: 4 },
    // 后半段：落差更大、节奏不规则，折点更锋利
    { actualQuality: 4.8, baselineQuality: 4.2 },
    { actualQuality: 3.2, baselineQuality: 3.6 },
    { actualQuality: 4.6, baselineQuality: 2.4 },
    { actualQuality: 2.1, baselineQuality: 3.8 },
    { actualQuality: 3.9, baselineQuality: 4.5 },
    { actualQuality: 5.1, baselineQuality: 2.8 },
    { actualQuality: 3.4, baselineQuality: 1.9 },
    { actualQuality: 1.8, baselineQuality: 3.3 },
    { actualQuality: 4.2, baselineQuality: 4.1 },
    { actualQuality: 2.6, baselineQuality: 2.2 },
    { actualQuality: 4.9, baselineQuality: 3.6 },
    { actualQuality: 3.7, baselineQuality: 4.8 },
    { actualQuality: 5.0, baselineQuality: 3.1 },
    { actualQuality: 2.3, baselineQuality: 2.0 },
    { actualQuality: 3.8, baselineQuality: 4.2 },
    { actualQuality: 1.6, baselineQuality: 3.0 },
    { actualQuality: 4.4, baselineQuality: 1.7 },
    { actualQuality: 5.3, baselineQuality: 3.5 },
    { actualQuality: 3.0, baselineQuality: 4.6 },
    { actualQuality: 4.1, baselineQuality: 2.6 },
    { actualQuality: 2.4, baselineQuality: 3.9 },
    { actualQuality: 4.7, baselineQuality: 2.1 },
    { actualQuality: 3.3, baselineQuality: 4.0 },
    { actualQuality: 1.9, baselineQuality: 3.4 },
    { actualQuality: 3.6, baselineQuality: 2.3 },
    { actualQuality: 5.0, baselineQuality: 3.8 },
    { actualQuality: 2.8, baselineQuality: 4.4 },
    { actualQuality: 4.3, baselineQuality: 2.9 },
    { actualQuality: 3.1, baselineQuality: 3.5 },
  ]

  const weeklyTicks = [4, 11, 18, 25]
  const qualityLast = qualitySeries.length - 1
  const weekIndices = weeklyTicks.map((tick) => Math.round(((tick - 1) / 27) * qualityLast))

  const qualityChartData = qualitySeries.map((item, index) => {
    const weekIndex = weekIndices.indexOf(index)
    return {
      label: weekIndex >= 0 ? `第${weekIndex + 1}周` : `D${index + 1}`,
      tickLabel: weekIndex >= 0 ? `第${weekIndex + 1}周` : '',
      actualQuality: item.actualQuality,
      baselineQuality: item.baselineQuality,
    }
  })

  const qualityLegend = [
    { key: 'actual', label: t.actualQuality, color: 'var(--chart-1)' },
    { key: 'baseline', label: t.baselineQuality, color: 'var(--color-text-3)' },
  ]

  // 实时访客：近 12 小时加密采样，底轴 6 段（每段 2h），刻度居中对齐「流量质量」
  const realtimeHourLabels = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00']
  const realtimeSegments = realtimeHourLabels.length
  const realtimePointCount = 36
  const realtimeLast = realtimePointCount - 1
  const realtimeSeed = 281
  const realtimeBase = 2800
  const realtimeUnit = (i, salt) => {
    const x = Math.sin((realtimeSeed + 1) * 12.9898 + (i + salt + 1) * 78.233) * 43758.5453
    return x - Math.floor(x)
  }
  const realtimeJagged = (i) => {
    const u = realtimeUnit(i, 3)
    const u2 = realtimeUnit(i, 11)
    const u3 = realtimeUnit(i, 19)
    let v = realtimeBase * (0.78 + u * 0.2)
    v += Math.sin(i * 1.9 + realtimeSeed * 0.07) * realtimeBase * 0.08
    v += (u2 - 0.5) * realtimeBase * 0.22
    if (u3 > 0.88) v *= 0.62
    else if (u3 < 0.12) v *= 1.18
    const dip = Math.floor(realtimePointCount * 0.58)
    if (i === dip - 1) v = realtimeBase * 1.08
    if (i === dip) v = realtimeBase * 0.42
    if (i === dip + 1) v = realtimeBase * 0.95
    return Math.max(Math.round(realtimeBase * 0.28), Math.round(v))
  }
  const realtimeSegmentMids = realtimeHourLabels.map((_, s) => {
    const start = Math.round((s / realtimeSegments) * realtimeLast)
    const end = Math.round(((s + 1) / realtimeSegments) * realtimeLast)
    return Math.round((start + end) / 2)
  })
  const realtimeMidLabelByX = new Map(
    realtimeSegmentMids.map((mid, i) => [mid, realtimeHourLabels[i]])
  )
  const realtimeSeries = Array.from({ length: realtimePointCount }, (_, i) => {
    const mins = Math.round((i / realtimeLast) * 12 * 60)
    const hh = String(Math.floor(mins / 60)).padStart(2, '0')
    const mm = String(mins % 60).padStart(2, '0')
    return {
      x: i,
      label: realtimeMidLabelByX.get(i) || '',
      tipLabel: `${hh}:${mm}`,
      visitors: realtimeJagged(i),
    }
  })
  const realtimePeak = Math.max(...realtimeSeries.map((d) => Number(d.visitors) || 0), 1)
  // Y 顶格贴数据上沿（约 6% 余量），刻度取整千
  const realtimeYTop = (() => {
    const v = realtimePeak * 1.06
    if (v <= 3000) return 3000
    if (v <= 4000) return 4000
    if (v <= 5000) return 5000
    if (v <= 6000) return 6000
    return Math.ceil(v / 1000) * 1000
  })()
  const realtimeYTicks = [0, 0.25, 0.5, 0.75, 1].map((p) => Math.round(realtimeYTop * p))
  const realtimeXTicks = realtimeSegmentMids
  const realtimeLegend = [{ key: 'visitors', label: t.visitors, color: 'var(--chart-1)' }]

  const pages = [
    { bounce: '24%', path: '/dashboard', time: '3分12秒', views: '6.42万' },
    { bounce: '31%', path: '/pricing', time: '2分08秒', views: '4.18万' },
    { bounce: '18%', path: '/docs/getting-started', time: '4分44秒', views: '2.86万' },
    { bounce: '22%', path: '/blog/analytics-guide', time: '5分06秒', views: '1.93万' },
    { bounce: '42%', path: '/contact', time: '1分18秒', views: '0.89万' },
    { bounce: '35%', path: '/features', time: '2分26秒', views: '0.71万' },
  ]

  const sourcesData = [
    { label: '8.94万', source: '自然搜索', visitors: 89400 },
    { label: '5.52万', source: '直接访问', visitors: 55200 },
    { label: '3.81万', source: '社交媒体', visitors: 38100 },
    { label: '3.04万', source: '引荐', visitors: 30400 },
    { label: '2.27万', source: '付费', visitors: 22700 },
  ]

  const campaignsData = [
    { label: '1.68万', source: '春季发布', visitors: 16800 },
    { label: '1.20万', source: '邮件通讯', visitors: 12000 },
    { label: '0.77万', source: '再营销', visitors: 7700 },
    { label: '0.59万', source: '品牌搜索', visitors: 5900 },
    { label: '0.43万', source: '合作伙伴', visitors: 4300 },
  ]

  const referrersData = [
    { label: '1.84万', source: '谷歌', visitors: 18400 },
    { label: '0.89万', source: '领英', visitors: 8900 },
    { label: '0.57万', source: '新品发现社区', visitors: 5700 },
    { label: '0.48万', source: '代码托管平台', visitors: 4800 },
    { label: '0.36万', source: '博客平台', visitors: 3600 },
  ]

  function withBarWidth(rows) {
    const max = Math.max(...rows.map((r) => r.visitors), 1)
    return rows.map((r) => ({
      ...r,
      width: `${Math.max(12, Math.round((r.visitors / max) * 100))}%`,
    }))
  }

  const AnalyticsPage = {
    name: 'AnalyticsDashboardPage',
    data() {
      return {
        t,
        activeTab: 'overview',
        period: 'this-month',
        refreshing: false,
        sourceTab: 'sources',
        sourceEpoch: 0,
        chartEpoch: 0,
        qualityLegend,
        realtimeLegend,
        kpis: [
          {
            title: t.kpiVisitors,
            value: '21.31万',
            badge: '2.8%',
            up: true,
            prev: '20.73万',
            icon: 'icon-user-group',
          },
          {
            title: t.kpiSessions,
            value: '24.86万',
            badge: '2.1%',
            up: true,
            prev: '24.35万',
            icon: 'icon-message',
          },
          {
            title: t.kpiPageviews,
            value: '54.79万',
            badge: '3.3%',
            up: false,
            prev: '56.68万',
            icon: 'icon-eye',
          },
          {
            title: t.kpiEngagement,
            value: '61.4%',
            badge: '4.2%',
            up: true,
            prev: '58.9%',
            icon: 'icon-activity',
          },
          {
            title: t.kpiConversion,
            value: '8.4%',
            badge: '5.6%',
            up: false,
            prev: '8.9%',
            icon: 'icon-percent',
          },
        ],
        pages,
        pageColumns: [
          { title: t.colPath, dataIndex: 'path', slotName: 'path', ellipsis: true },
          { title: t.colViews, dataIndex: 'views', width: 88, align: 'right' },
          { title: t.colAvgTime, dataIndex: 'time', width: 96, align: 'right' },
          { title: t.colBounce, dataIndex: 'bounce', width: 80, align: 'right' },
        ],
        sourceSets: {
          sources: withBarWidth(sourcesData),
          campaigns: withBarWidth(campaignsData),
          referrers: withBarWidth(referrersData),
        },
      }
    },
    computed: {
      sourceRows() {
        return this.sourceSets[this.sourceTab] || this.sourceSets.sources
      },
      placeholderText() {
        const map = {
          audience: t.placeholderAudience,
          acquisition: t.placeholderAcquisition,
          engagement: t.placeholderEngagement,
          conversions: t.placeholderConversions,
        }
        return map[this.activeTab] || ''
      },
    },
    watch: {
      activeTab(key) {
        if (key === 'overview') {
          this.$nextTick(() => this.initCharts())
        } else {
          this.destroyCharts()
        }
      },
    },
    methods: {
      onAction(key) {
        if (key === 'refresh') {
          this.onRefresh()
          return
        }
        const tips = {
          export: t.tipExport,
          import: t.tipImport,
          share: t.tipShare,
        }
        if (tips[key]) ArcoVue.Message.info(tips[key])
      },
      onViewDetail() {
        ArcoVue.Message.info(t.tipViewDetail)
      },
      onRefresh() {
        if (this.refreshing) return
        this.refreshing = true
        this.destroyCharts()
        this.sourceEpoch += 1
        this.chartEpoch += 1
        this.$nextTick(() => {
          requestAnimationFrame(() => {
            this.initCharts()
            ArcoVue.Message.success(t.tipRefresh)
          })
        })
        window.setTimeout(() => {
          this.refreshing = false
        }, 600)
      },
      initCharts() {
        if (!window.ProShadcnCharts || this.activeTab !== 'overview') return
        this.destroyCharts()

        if (this.$refs.qualityChart) {
          this._qualityChart = ProShadcnCharts.mountLineChart(this.$refs.qualityChart, {
            data: qualityChartData,
            // 与财务管理「收支概览」一致：宿主 min-height 280，避免底轴下出现空白
            height: 280,
            curveType: 'linear',
            lineWidth: 2,
            yMinZero: false,
            yDomain: [-6, 6],
            yTickValues: [-6, -3, 0, 3, 6],
            yTickFormat: (v) => `${Number(v)}%`,
            xLabel: (d) => d.tickLabel || d.label,
            tooltipLabel: (d) => d.label,
            xTickValues: weekIndices,
            autoMargin: false,
            // 负号刻度固定左边距，避免动态测宽不足把 -6%/-3% 裁成 6%/3%
            dynamicYAxisMargin: false,
            margin: { top: 6, bottom: 22, right: 8, left: 48 },
            series: [
              {
                key: 'baselineQuality',
                label: t.baselineQuality,
                color: 'var(--color-text-3)',
                lineWidth: 1.5,
                lineDashArray: [5, 4],
                valueFormat: (v) => `${Number(v)}%`,
              },
              {
                key: 'actualQuality',
                label: t.actualQuality,
                color: 'var(--chart-1)',
                lineWidth: 2,
                valueFormat: (v) => `${Number(v)}%`,
              },
            ],
          })
        }

        if (this.$refs.realtimeChart) {
          this._realtimeChart = ProShadcnCharts.mountAreaChart(this.$refs.realtimeChart, {
            data: realtimeSeries,
            height: 248,
            x: (d) => d.x,
            xLabel: (d) => d.label || '',
            tooltipLabel: (d) => d.tipLabel || d.label || '',
            xTickValues: realtimeXTicks,
            stacked: false,
            curveType: 'linear',
            lineWidth: 2,
            yDomain: [0, realtimeYTop],
            yTickValues: realtimeYTicks,
            yTickFormat: (v) => (v >= 1000 ? `${v / 1000}k` : String(v)),
            autoMargin: false,
            margin: { top: 6, bottom: 22, right: 8 },
            yLabelMinWidth: 36,
            yLabelMaxWidth: 56,
            series: [
              {
                key: 'visitors',
                label: t.visitors,
                color: 'var(--chart-1)',
                opacity: 0.22,
              },
            ],
          })
        }
      },
      destroyCharts() {
        if (!window.ProShadcnCharts) return
        ProShadcnCharts.destroy(this._qualityChart)
        ProShadcnCharts.destroy(this._realtimeChart)
        this._qualityChart = null
        this._realtimeChart = null
      },
    },
    mounted() {
      this.$nextTick(() => this.initCharts())
    },
    beforeUnmount() {
      this.destroyCharts()
    },
    template: `
      <div class="anl-page">
        <div class="anl-tabs-bar">
          <a-tabs
            v-model:active-key="activeTab"
            type="rounded"
            size="medium"
            class="anl-tabs"
            :header-padding="false"
          >
            <a-tab-pane key="overview" :title="t.tabOverview" />
            <a-tab-pane key="audience" :title="t.tabAudience" />
            <a-tab-pane key="acquisition" :title="t.tabAcquisition" />
            <a-tab-pane key="engagement" :title="t.tabEngagement" />
            <a-tab-pane key="conversions" :title="t.tabConversions" />
          </a-tabs>

          <div class="anl-toolbar">
            <a-button
              size="small"
              class="anl-refresh-btn"
              :class="{ 'pro-refresh-spinning': refreshing }"
              :aria-label="t.refresh"
              :disabled="refreshing"
              @click="onRefresh"
            >
              <template #icon><icon-refresh /></template>
            </a-button>
            <a-select v-model="period" size="small" :style="{ width: '120px' }">
              <a-option value="this-month">{{ t.periodThisMonth }}</a-option>
              <a-option value="last-month">{{ t.periodLastMonth }}</a-option>
              <a-option value="last-30-days">{{ t.period30d }}</a-option>
              <a-option value="year-to-date">{{ t.periodYtd }}</a-option>
            </a-select>
            <a-dropdown trigger="click" @select="onAction">
              <a-button size="small" :aria-label="t.moreActions">
                <template #icon><icon-drag-dot /></template>
              </a-button>
              <template #content>
                <a-doption value="export">
                  <span class="anl-dropdown-item">
                    <i class="pro-fa-icon fa-sharp fa-light fa-file-export"></i>{{ t.exportReport }}
                  </span>
                </a-doption>
                <a-doption value="import">
                  <span class="anl-dropdown-item">
                    <i class="pro-fa-icon fa-sharp fa-light fa-file-import"></i>{{ t.importData }}
                  </span>
                </a-doption>
                <a-doption value="share">
                  <span class="anl-dropdown-item">
                    <i class="pro-fa-icon fa-sharp fa-light fa-share-nodes"></i>{{ t.shareDashboard }}
                  </span>
                </a-doption>
                <div class="anl-dropdown-divider" role="separator"></div>
                <a-doption value="refresh">
                  <span class="anl-dropdown-item">
                    <icon-refresh />{{ t.refreshMetrics }}
                  </span>
                </a-doption>
              </template>
            </a-dropdown>
          </div>
        </div>

        <template v-if="activeTab === 'overview'">
          <div class="anl-kpi-strip">
            <div class="anl-kpi-grid">
              <div v-for="(item, idx) in kpis" :key="idx" class="anl-kpi-cell">
                <div class="anl-kpi-head">
                  <span class="anl-kpi-label">{{ item.title }}</span>
                  <component :is="item.icon" class="anl-kpi-icon" />
                </div>
                <div class="anl-kpi-value-row">
                  <span class="anl-kpi-value">{{ item.value }}</span>
                </div>
                <div class="anl-kpi-meta">
                  <span class="anl-kpi-compare">{{ t.samePeriod }} <span class="anl-kpi-dot">•</span> {{ item.prev }}</span>
                  <span class="anl-badge" :class="item.up ? 'anl-badge--up' : 'anl-badge--down'">
                    <icon-arrow-up-right v-if="item.up" />
                    <icon-arrow-down-right v-else />
                    {{ item.badge }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <a-row class="anl-charts-row" :gutter="[16, 16]">
            <a-col :xs="24" :xl="14">
              <a-card class="anl-card general-card">
                <div class="anl-card-head">
                  <div class="anl-card-title">{{ t.trafficQuality }}</div>
                  <span class="anl-section-link" @click="onViewDetail">
                    {{ t.viewDetail }} <icon-right />
                  </span>
                </div>
                <div
                  :key="'quality-' + chartEpoch"
                  ref="qualityChart"
                  class="shadcn-chart-host anl-quality-chart anl-chart-motion"
                ></div>
                <div class="shadcn-chart-legend">
                  <span v-for="item in qualityLegend" :key="item.key" class="shadcn-chart-legend-item">
                    <span class="shadcn-chart-legend-dot" :style="{ '--legend-color': item.color }"></span>{{ item.label }}
                  </span>
                </div>
              </a-card>
            </a-col>
            <a-col :xs="24" :xl="10">
              <a-card class="anl-card general-card">
                <div class="anl-card-head">
                  <div class="anl-card-title">{{ t.realtimeVisitors }}</div>
                  <span class="anl-section-link" @click="onViewDetail">
                    {{ t.viewDetail }} <icon-right />
                  </span>
                </div>
                <div class="anl-realtime-top">
                  <div class="anl-realtime-value">
                    <strong>24</strong>
                    <span>{{ t.perMinute }}</span>
                  </div>
                  <div class="anl-live">
                    <i class="anl-live-dot" aria-hidden="true"></i>
                    <span>{{ t.live }}</span>
                  </div>
                </div>
                <div
                  :key="'realtime-' + chartEpoch"
                  ref="realtimeChart"
                  class="shadcn-chart-host anl-realtime-chart anl-chart-motion"
                ></div>
                <div class="shadcn-chart-legend">
                  <span v-for="item in realtimeLegend" :key="item.key" class="shadcn-chart-legend-item">
                    <span class="shadcn-chart-legend-dot" :style="{ '--legend-color': item.color }"></span>{{ item.label }}
                  </span>
                </div>
              </a-card>
            </a-col>
          </a-row>

          <a-row class="anl-bottom-row" :gutter="[16, 16]" align="stretch">
            <a-col :xs="24" :xl="14">
              <a-card class="anl-card general-card">
                <div class="anl-card-head">
                  <div class="anl-card-title">{{ t.topPages }}</div>
                  <span class="anl-section-link" @click="onViewDetail">
                    {{ t.viewDetail }} <icon-right />
                  </span>
                </div>
                <a-table
                  class="anl-pages-table"
                  :columns="pageColumns"
                  :data="pages"
                  :pagination="false"
                  :bordered="false"
                  row-key="path"
                  size="medium"
                >
                  <template #path="{ record }">
                    <div class="anl-path-cell" :title="record.path">{{ record.path }}</div>
                  </template>
                </a-table>
              </a-card>
            </a-col>
            <a-col :xs="24" :xl="10">
              <a-card class="anl-card general-card anl-sources-card">
                <div class="anl-card-head">
                  <div class="anl-card-title">{{ t.trafficSources }}</div>
                  <span class="anl-section-link" @click="onViewDetail">
                    {{ t.viewDetail }} <icon-right />
                  </span>
                </div>
                <a-tabs v-model:active-key="sourceTab" type="line" size="small" class="anl-source-tabs">
                  <a-tab-pane key="sources" :title="t.tabSources" />
                  <a-tab-pane key="campaigns" :title="t.tabCampaigns" />
                  <a-tab-pane key="referrers" :title="t.tabReferrers" />
                </a-tabs>
                <ul class="anl-source-list" :key="'sources-' + sourceEpoch">
                  <li v-for="row in sourceRows" :key="row.source" class="anl-source-row">
                    <span class="anl-source-fill" :style="{ width: row.width }"></span>
                    <span class="anl-source-name">{{ row.source }}</span>
                    <span class="anl-source-value">{{ row.label }}</span>
                  </li>
                </ul>
              </a-card>
            </a-col>
          </a-row>
        </template>

        <div v-else class="anl-placeholder">{{ placeholderText }}</div>
      </div>
    `,
  }

  mountProPage({
    pageKey: 'dashboard/analytics',
    title: t.pageTitle,
    pageComponent: AnalyticsPage,
  })
})()
