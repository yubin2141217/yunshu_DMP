;(function () {
  const t = ArcoProLocale.crm

  function toNativeDate(value) {
    if (!value) return null
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value
    }
    if (typeof value === 'number' || typeof value === 'string') {
      const d = new Date(value)
      return Number.isNaN(d.getTime()) ? null : d
    }
    if (typeof value.toDate === 'function') {
      const d = value.toDate()
      return d instanceof Date && !Number.isNaN(d.getTime()) ? d : null
    }
    if (typeof value.valueOf === 'function') {
      const d = new Date(value.valueOf())
      return Number.isNaN(d.getTime()) ? null : d
    }
    return null
  }

  function startOfDay(d) {
    const date = toNativeDate(d)
    if (!date) return null
    return new Date(date.getFullYear(), date.getMonth(), date.getDate())
  }

  function addDays(d, n) {
    const base = toNativeDate(d)
    if (!base) return null
    const next = new Date(base)
    next.setDate(next.getDate() + n)
    return next
  }

  function rangeDays(from, to) {
    const a = startOfDay(from)
    const b = startOfDay(to)
    if (!a || !b) return 0
    return Math.round((b - a) / 86400000) + 1
  }

  function presetRange(preset, end) {
    const days = preset === '30d' ? 30 : preset === '90d' ? 90 : 7
    const to = startOfDay(end)
    const from = addDays(to, -(days - 1))
    return [from, to]
  }

  function syncPreset(from, to, dataMax) {
    const start = startOfDay(from)
    const end = startOfDay(to)
    const max = startOfDay(dataMax)
    if (!start || !end || !max) return 'custom'
    const days = rangeDays(start, end)
    const endIsMax = end.getTime() === max.getTime()
    if (endIsMax && days === 7) return '7d'
    if (endIsMax && days === 30) return '30d'
    if (endIsMax && days === 90) return '90d'
    return 'custom'
  }

  const STAGE_LABELS = {
    'Proposal Sent': '已发方案',
    Discovery: '需求发现',
    Negotiation: '商务谈判',
    Qualified: '线索合格',
  }

  const STAGE_TONES = {
    Discovery: 'discovery',
    Qualified: 'qualified',
    'Proposal Sent': 'proposal',
    Negotiation: 'negotiation',
  }

  const HEALTH_LABELS = {
    'On Track': '正常',
    'Needs Review': '待复核',
    'At Risk': '有风险',
    'On Hold': '已暂停',
  }

  const HEALTH_SCORE = {
    'On Track': 18,
    'Needs Review': 11,
    'At Risk': 7,
    'On Hold': 4,
  }

  const pipelineSeries = {
    values: [34, 38, 31, 47, 42, 51, 44, 40, 58, 46, 43, 49],
    labels: ['9月', '10月', '11月', '12月', '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月'],
    booked: 184,
  }

  const projectRevenue = [
    { name: '最小可行产品开发', actual: 82000, target: 90000 },
    { name: '咨询服务', actual: 48000, target: 65000 },
    { name: '交互原型站点', actual: 34000, target: 45000 },
    { name: '运维支持', actual: 77000, target: 90000 },
    { name: '大模型训练', actual: 68000, target: 80000 },
    { name: '产品发布', actual: 52000, target: 70000 },
  ].map((row) => ({
    ...row,
    remaining: Math.max(0, row.target - row.actual),
  }))

  const regionSales = [
    { region: '华东', sales: 40100, percentage: 34, growth: '+9.4%', up: true },
    { region: '华南', sales: 37800, percentage: 31, growth: '+12.8%', up: true },
    { region: '华北', sales: 30950, percentage: 26, growth: '-3.2%', up: false },
    { region: '西南', sales: 12200, percentage: 7, growth: '+6.0%', up: true },
    { region: '华中', sales: 2450, percentage: 2, growth: '-1.7%', up: false },
  ]

  const funnelStages = [
    { stage: '潜在线索', value: 680, color: 'var(--chart-1)' },
    { stage: '线索合格', value: 480, color: 'var(--chart-2)' },
    { stage: '已发方案', value: 210, color: 'var(--chart-3)' },
    { stage: '商务谈判', value: 120, color: 'var(--chart-4)' },
    { stage: '成功成交', value: 45, color: 'var(--chart-5)' },
  ]

  const leadSources = [
    { key: 'website', label: '官网', value: 170, color: 'var(--chart-1)' },
    { key: 'referral', label: '推荐', value: 105, color: 'var(--chart-2)' },
    { key: 'social', label: '社交媒体', value: 90, color: 'var(--chart-3)' },
    { key: 'cold', label: '冷启动触达', value: 62, color: 'var(--chart-4)' },
    { key: 'other', label: '其他', value: 48, color: 'var(--chart-5)' },
  ]

  const proposalSent = 12
  const proposalGoal = 18
  const proposalBarCount = 42
  const activeProposalBars = Math.round((proposalSent / proposalGoal) * proposalBarCount)

  function formatCurrency(n) {
    return `¥${Number(n).toLocaleString('zh-CN')}`
  }

  const CrmPage = {
    name: 'CrmDashboardPage',
    data() {
      const allRows = Array.isArray(window.ProCrmOpportunities)
        ? window.ProCrmOpportunities.slice()
        : []
      const today = startOfDay(new Date())
      const [from, to] = presetRange('7d', today)
      return {
        t,
        timePreset: '7d',
        dateRange: [from, to],
        dataMax: today,
        dataMin: addDays(today, -89),
        refreshing: false,
        kpis: [
          {
            title: t.kpiLeadValue,
            value: '¥284,500',
            prev: t.kpiLeadValuePrev,
            delta: '12%',
            up: true,
            icon: 'icon-credit-card',
          },
          {
            title: t.kpiQualifiedRate,
            value: '28.4%',
            prev: t.kpiQualifiedRatePrev,
            delta: '2.5%',
            up: false,
            icon: 'icon-chart-column',
          },
          {
            title: t.kpiOpportunities,
            value: '42',
            prev: t.kpiOpportunitiesPrev,
            delta: '7%',
            up: true,
            icon: 'icon-briefcase',
          },
          {
            title: t.kpiWinRate,
            value: '18.1%',
            prev: t.kpiWinRatePrev,
            delta: '1.6%',
            up: true,
            icon: 'icon-handshake',
          },
        ],
        projectRevenue,
        regionSales,
        funnelStages,
        leadSources,
        proposalBars: Array.from({ length: proposalBarCount }, (_, i) => i < activeProposalBars),
        proposalSent,
        proposalGoal,
        proposalProgress: Math.round((proposalSent / proposalGoal) * 100),
        allRows,
        keyword: '',
        stageFilter: 'all',
        healthFilter: 'all',
        selectedKeys: [],
        pagination: { current: 1, pageSize: 10, showTotal: true },
        stageOptions: [
          { value: 'all', label: t.stageAll },
          { value: 'Qualified', label: STAGE_LABELS.Qualified },
          { value: 'Discovery', label: STAGE_LABELS.Discovery },
          { value: 'Proposal Sent', label: STAGE_LABELS['Proposal Sent'] },
          { value: 'Negotiation', label: STAGE_LABELS.Negotiation },
        ],
        healthOptions: [
          { value: 'all', label: t.healthAll },
          { value: 'On Track', label: HEALTH_LABELS['On Track'] },
          { value: 'Needs Review', label: HEALTH_LABELS['Needs Review'] },
          { value: 'At Risk', label: HEALTH_LABELS['At Risk'] },
          { value: 'On Hold', label: HEALTH_LABELS['On Hold'] },
        ],
        funnelHover: null,
        funnelTipX: 0,
        funnelTipY: 0,
        chartEpoch: 0,
        columns: [
          // 客户列仅 minWidth：承接余宽，勾选列保持 48
          { title: t.colId, dataIndex: 'id', width: 112 },
          { title: t.colAccount, dataIndex: 'account', minWidth: 120, ellipsis: true },
          { title: t.colStage, dataIndex: 'stage', width: 130, slotName: 'stage' },
          { title: t.colPriority, dataIndex: 'priority', width: 88, align: 'center' },
          { title: t.colHealth, dataIndex: 'health', width: 168, slotName: 'health' },
          { title: t.colValue, dataIndex: 'value', width: 120 },
          { title: t.colActions, dataIndex: 'actions', width: 80, slotName: 'actions', align: 'center' },
        ],
      }
    },
    computed: {
      pipelineData() {
        return pipelineSeries
      },
      totalQualified() {
        return this.pipelineData.values.reduce((s, n) => s + n, 0)
      },
      discoveryBooked() {
        return this.pipelineData.booked
      },
      discoveryProgress() {
        return Math.round((this.discoveryBooked / this.totalQualified) * 100)
      },
      regionTotal() {
        return this.regionSales.reduce((s, r) => s + r.sales, 0)
      },
      growingRegions() {
        return this.regionSales.filter((r) => r.up).length
      },
      leadSourceTotal() {
        return this.leadSources.reduce((s, r) => s + r.value, 0)
      },
      leadSourceRows() {
        const total = this.leadSourceTotal || 1
        return this.leadSources.map((s) => ({
          ...s,
          pct: ((s.value / total) * 100).toFixed(2),
        }))
      },
      funnelMax() {
        return Math.max(...this.funnelStages.map((s) => s.value), 1)
      },
      funnelRows() {
        const max = this.funnelMax
        const toPct = (v) => (v / max) * 100
        const pcts = this.funnelStages.map((s) => toPct(s.value))
        return this.funnelStages.map((step, i) => {
          // 上沿 = 本层占比，下沿 = 下一层占比，保证层与层外沿连续
          const topPct = pcts[i]
          const bottomPct =
            i < pcts.length - 1 ? pcts[i + 1] : Math.max(topPct * 0.45, 3)
          const prev = i > 0 ? this.funnelStages[i - 1].value : null
          const conv = prev ? Math.round((step.value / prev) * 1000) / 10 : null
          const insetTop = (100 - topPct) / 2
          const insetBottom = (100 - bottomPct) / 2
          return {
            ...step,
            index: i,
            topPct,
            bottomPct,
            sharePct: Math.round(topPct),
            conv,
            light: i >= 3,
            clipPath: `polygon(${insetTop}% 0%, ${100 - insetTop}% 0%, ${100 - insetBottom}% 100%, ${insetBottom}% 100%)`,
          }
        })
      },
      funnelWinRate() {
        const first = this.funnelStages[0]?.value || 1
        const last = this.funnelStages[this.funnelStages.length - 1]?.value || 0
        return Math.round((last / first) * 1000) / 10
      },
      funnelFooterText() {
        return t.funnelFooter.replace('{pct}', String(this.funnelWinRate))
      },
      filteredRows() {
        const kw = (this.keyword || '').trim().toLowerCase()
        return this.allRows.filter((row) => {
          if (this.stageFilter !== 'all' && row.stage !== this.stageFilter) return false
          if (this.healthFilter !== 'all' && row.health !== this.healthFilter) return false
          if (!kw) return true
          return (
            String(row.id).toLowerCase().includes(kw) ||
            String(row.account).toLowerCase().includes(kw) ||
            String(STAGE_LABELS[row.stage] || row.stage).includes(kw) ||
            String(row.value).toLowerCase().includes(kw)
          )
        })
      },
      pagedRows() {
        const { current, pageSize } = this.pagination
        const start = (current - 1) * pageSize
        return this.filteredRows.slice(start, start + pageSize)
      },
    },
    watch: {
      keyword() {
        this.pagination.current = 1
      },
      stageFilter() {
        this.pagination.current = 1
      },
      healthFilter() {
        this.pagination.current = 1
      },
      dateRange: {
        deep: true,
        handler(value) {
          if (this._rangeSilent) return
          this.commitDateRange(value)
        },
      },
    },
    methods: {
      formatCurrency,
      rangeKeyOf(from, to) {
        const a = startOfDay(from)
        const b = startOfDay(to)
        if (!a || !b) return ''
        return `${a.getTime()}-${b.getTime()}`
      },
      commitDateRange(value) {
        if (!value || !value[0] || !value[1]) return
        let from = startOfDay(value[0])
        let to = startOfDay(value[1])
        if (!from || !to) return
        if (to < from) {
          const swap = from
          from = to
          to = swap
        }
        const span = rangeDays(from, to)
        if (span > 90) from = addDays(to, -89)
        if (from < this.dataMin) from = startOfDay(this.dataMin)
        if (to > this.dataMax) to = startOfDay(this.dataMax)
        const key = this.rangeKeyOf(from, to)
        if (!key || key === this._rangeKey) {
          const preset = syncPreset(from, to, this.dataMax)
          if (this.timePreset !== preset) this.timePreset = preset
          return
        }
        this._rangeKey = key
        this._rangeSilent = true
        this.dateRange = [from, to]
        this.timePreset = syncPreset(from, to, this.dataMax)
        this._rangeSilent = false
      },
      onPresetChange(value) {
        if (value === 'custom') return
        this.timePreset = value
        this.commitDateRange(presetRange(value, this.dataMax))
      },
      onDateRangeChange(value) {
        this.commitDateRange(value && value[0] ? value : this.dateRange)
      },
      disabledDate(date) {
        const day = startOfDay(date)
        if (!day) return true
        return day < this.dataMin || day > this.dataMax
      },
      onExport() {
        ArcoVue.Message.success(t.exportTip)
      },
      onRefresh() {
        if (this.refreshing) return
        this.refreshing = true
        this.reloadPageCharts(true)
        window.setTimeout(() => {
          this.refreshing = false
        }, 600)
      },
      reloadPageCharts(showTip) {
        this.destroyCharts()
        this.funnelHover = null
        this.chartEpoch += 1
        // 主题色 / 配色会连发两次 arco-pro-theme-change，合并到同一次 nextTick
        if (this._reloadChartsPending) {
          if (showTip) this._reloadChartsShowTip = true
          return
        }
        this._reloadChartsPending = true
        this._reloadChartsShowTip = !!showTip
        this.$nextTick(() => {
          this._reloadChartsPending = false
          this.initCharts()
          if (this._reloadChartsShowTip) ArcoVue.Message.success(t.refreshTip)
          this._reloadChartsShowTip = false
        })
      },
      stageLabel(stage) {
        return STAGE_LABELS[stage] || stage
      },
      stageTone(stage) {
        return STAGE_TONES[stage] || 'default'
      },
      healthLabel(health) {
        return HEALTH_LABELS[health] || health
      },
      healthScore(health) {
        return HEALTH_SCORE[health] || 0
      },
      healthSlots(health) {
        const score = this.healthScore(health)
        return Array.from({ length: 18 }, (_, i) => i < score)
      },
      funnelPctLabel(step) {
        return step.conv != null ? `${step.conv}%` : '100%'
      },
      funnelTip(step) {
        return `${step.stage}：${step.value}`
      },
      funnelTipRows(step) {
        return [{ label: t.funnelCount, value: String(step.value) }]
      },
      updateFunnelTipPos(e) {
        const root = this.$refs.funnelRoot
        if (!root) return
        const rect = root.getBoundingClientRect()
        const tipW = 156
        const tipH = 56
        let x = e.clientX - rect.left + 12
        let y = e.clientY - rect.top + 12
        if (x + tipW > rect.width - 4) x = e.clientX - rect.left - tipW - 12
        if (y + tipH > rect.height - 4) y = e.clientY - rect.top - tipH - 8
        if (x < 4) x = 4
        if (y < 4) y = 4
        this.funnelTipX = x
        this.funnelTipY = y
      },
      onFunnelEnter(step, e) {
        this.funnelHover = step
        this.updateFunnelTipPos(e)
      },
      onFunnelMove(e) {
        if (!this.funnelHover) return
        this.updateFunnelTipPos(e)
      },
      onFunnelLeave() {
        this.funnelHover = null
      },
      projectActualPct(row) {
        return `${Math.round((row.actual / row.target) * 100)}%`
      },
      projectRemainPct(row) {
        return `${Math.round((row.remaining / row.target) * 100)}%`
      },
      onPageChange(page) {
        this.pagination.current = page
      },
      onEdit(row) {
        ArcoVue.Message.info(`${t.editTip} ${row.id}`)
      },
      onTip(msg) {
        ArcoVue.Message.info(msg)
      },
      remountPipelineChart() {
        if (!window.ProShadcnCharts) return
        ProShadcnCharts.destroy(this._pipelineChart)
        this._pipelineChart = null
        this.mountPipelineChart()
      },
      mountPipelineChart() {
        if (!window.ProShadcnCharts || !this.$refs.pipelineChart) return
        const { values, labels } = this.pipelineData
        this._pipelineChart = ProShadcnCharts.mountBarChart(this.$refs.pipelineChart, {
          data: values.map((qualified, i) => ({
            label: labels[i],
            qualified,
          })),
          height: 288,
          x: (d) => d.label,
          xLabel: (d) => d.label,
          crosshair: false,
          series: [{ key: 'qualified', label: t.qualifiedLeads, color: 'var(--chart-1)' }],
          xDomainPad: 0.35,
          // 无底图例：只修底轴
          autoMargin: false,
          margin: { top: 6, bottom: 22, right: 8 },
        })
      },
      initCharts() {
        if (!window.ProShadcnCharts) return
        this.destroyCharts()
        this.mountPipelineChart()
        this._sourceChart = ProShadcnCharts.mountDonutChart(this.$refs.sourceChart, {
          data: this.leadSources.map((s) => ({ label: s.label, value: s.value })),
          height: 200,
          radius: 96,
          arcWidth: 26,
          centralLabel: String(this.leadSourceTotal),
          centralSubLabel: t.leadsUnit,
          colors: this.leadSources.map((s) => s.color),
        })
      },
      destroyCharts() {
        if (!window.ProShadcnCharts) return
        ProShadcnCharts.destroy(this._pipelineChart)
        ProShadcnCharts.destroy(this._sourceChart)
        this._pipelineChart = null
        this._sourceChart = null
      },
    },
    mounted() {
      this._rangeKey = this.rangeKeyOf(this.dateRange[0], this.dateRange[1])
      this.$nextTick(() => this.initCharts())
      // 主题切换：与刷新一致，重挂载图表与漏斗入场（漏斗非 Unovis，依赖 chartEpoch）
      // chart-palette 是配色回声事件，Unovis 由 ProShadcnCharts.refreshAll 处理，这里忽略以免双挂圆环
      this._onThemeChange = (ev) => {
        const type = ev && ev.detail && ev.detail.type
        if (type === 'chart-palette') return
        this.reloadPageCharts(false)
      }
      window.addEventListener('arco-pro-theme-change', this._onThemeChange)
    },
    beforeUnmount() {
      this.destroyCharts()
      if (this._onThemeChange) {
        window.removeEventListener('arco-pro-theme-change', this._onThemeChange)
        this._onThemeChange = null
      }
    },
    template: `
      <div class="crm-page">
        <div class="crm-header">
          <div class="crm-header-text">
            <h2 class="crm-title">{{ t.pageTitle }}</h2>
            <p class="crm-desc">{{ t.pageDesc }}</p>
          </div>
          <div class="crm-filters">
            <a-button
              type="secondary"
              size="medium"
              class="crm-refresh-btn"
              :class="{ 'pro-refresh-spinning': refreshing }"
              :aria-label="t.refresh"
              :disabled="refreshing"
              @click="onRefresh"
            >
              <template #icon><icon-refresh /></template>
            </a-button>
            <a-select
              v-model="timePreset"
              :style="{ width: '120px' }"
              aria-label="选择时间范围"
              @change="onPresetChange"
            >
              <a-option value="7d">{{ t.preset7d }}</a-option>
              <a-option value="30d">{{ t.preset30d }}</a-option>
              <a-option value="90d">{{ t.preset90d }}</a-option>
              <a-option v-if="timePreset === 'custom'" value="custom">{{ t.presetCustom }}</a-option>
            </a-select>
            <a-range-picker
              v-model="dateRange"
              :disabled-date="disabledDate"
              :allow-clear="false"
              format="YYYY/M/D"
              style="width: 240px"
              @change="onDateRangeChange"
            />
            <a-button type="primary" size="medium" class="crm-export-btn" @click="onExport">
              <template #icon><icon-download /></template>
              {{ t.export }}
            </a-button>
          </div>
        </div>

        <a-row :gutter="[16, 16]">
          <a-col v-for="(item, idx) in kpis" :key="idx" :xs="24" :sm="12" :lg="6">
            <a-card class="crm-card general-card crm-kpi-card">
              <div class="crm-kpi-head">
                <span class="crm-kpi-title">{{ item.title }}</span>
                <component :is="item.icon" class="crm-kpi-icon" />
              </div>
              <div class="crm-kpi-value">{{ item.value }}</div>
              <div class="crm-kpi-foot">
                <span class="crm-kpi-delta">{{ item.prev }}</span>
                <span class="crm-badge" :class="item.up ? 'crm-badge--up' : 'crm-badge--down'">
                  <icon-caret-up-fill v-if="item.up" />
                  <icon-caret-down-fill v-else />
                  {{ item.delta }}
                </span>
              </div>
            </a-card>
          </a-col>
        </a-row>

        <a-row :gutter="[16, 16]" class="crm-equal-row">
          <a-col :xs="24" :sm="12">
            <a-card class="crm-card general-card crm-card--fill">
              <div class="crm-section-head crm-section-head--stack">
                <div class="crm-section-title-row">
                  <a-typography-title :heading="6" class="crm-section-title">{{ t.projectRevenue }}</a-typography-title>
                  <icon-arrow-up-right class="crm-section-link-icon" />
                </div>
                <a-typography-text type="secondary" class="crm-section-desc">{{ t.projectFooter }}</a-typography-text>
              </div>
              <ul :key="'project-' + chartEpoch" class="crm-project-list">
                <li v-for="row in projectRevenue" :key="row.name" class="crm-project-row">
                  <div class="crm-project-track">
                    <div class="crm-project-actual" :style="{ width: projectActualPct(row) }">
                      <span class="crm-project-name">{{ row.name }}</span>
                      <span>{{ formatCurrency(row.actual) }}</span>
                    </div>
                    <div class="crm-project-remain" :style="{ width: projectRemainPct(row) }">
                      <span>{{ formatCurrency(row.remaining) }}</span>
                    </div>
                  </div>
                </li>
              </ul>
            </a-card>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-card class="crm-card general-card crm-card--fill">
              <div class="crm-section-head crm-section-head--stack">
                <div class="crm-section-title-row">
                  <a-typography-title :heading="6" class="crm-section-title">{{ t.regionSales }}</a-typography-title>
                  <icon-arrow-up-right class="crm-section-link-icon" />
                </div>
                <a-typography-text type="secondary" class="crm-section-desc">
                  {{ regionSales.length }} {{ t.regionsUnit }} · {{ growingRegions }} {{ t.regionsGrowing }}
                </a-typography-text>
                <a-typography-text class="crm-section-metric">{{ formatCurrency(regionTotal) }}</a-typography-text>
              </div>
              <ul :key="'region-' + chartEpoch" class="crm-region-list">
                <li v-for="item in regionSales" :key="item.region">
                  <div class="crm-region-head">
                    <span class="crm-region-name">{{ item.region }}</span>
                    <div class="crm-region-nums">
                      <span class="crm-region-sales">{{ formatCurrency(item.sales) }}</span>
                      <span class="crm-region-growth" :class="item.up ? 'is-up' : 'is-down'">{{ item.growth }}</span>
                    </div>
                  </div>
                  <div class="crm-region-bar-row">
                    <div class="crm-region-track">
                      <div class="crm-region-fill" :style="{ width: item.percentage + '%' }"></div>
                    </div>
                    <span class="crm-region-pct">{{ item.percentage }}%</span>
                  </div>
                </li>
              </ul>
            </a-card>
          </a-col>
        </a-row>

        <a-row :gutter="[16, 16]" class="crm-equal-row">
          <a-col :xs="24" :lg="12">
            <a-card class="crm-card general-card crm-chart-card crm-card--fill shadcn-donut-card">
              <div class="crm-section-head crm-section-head--stack">
                <div class="crm-section-title-row">
                  <a-typography-title :heading="6" class="crm-section-title">{{ t.salesFunnel }}</a-typography-title>
                  <icon-arrow-up-right class="crm-section-link-icon" />
                </div>
                <a-typography-text type="secondary" class="crm-section-desc">{{ funnelFooterText }}</a-typography-text>
              </div>
              <div class="shadcn-donut-layout">
                <div class="shadcn-donut-chart">
                  <div
                    :key="'funnel-' + chartEpoch"
                    ref="funnelRoot"
                    class="crm-funnel crm-funnel--trap"
                    @mouseleave="onFunnelLeave"
                  >
                    <div
                      v-for="step in funnelRows"
                      :key="step.stage"
                      class="crm-funnel-step"
                      :class="{ 'is-light': step.light, 'is-active': funnelHover && funnelHover.stage === step.stage }"
                      :style="{
                        background: step.color,
                        clipPath: step.clipPath,
                        webkitClipPath: step.clipPath,
                        animationDelay: step.index * 80 + 'ms',
                      }"
                      @mouseenter="onFunnelEnter(step, $event)"
                      @mousemove="onFunnelMove($event)"
                    >
                      <span class="crm-funnel-step-pct">{{ funnelPctLabel(step) }}</span>
                    </div>
                    <div
                      v-show="funnelHover"
                      class="crm-funnel-tip crm-funnel-tip--float"
                      :style="{ left: funnelTipX + 'px', top: funnelTipY + 'px' }"
                    >
                      <template v-if="funnelHover">
                        <div class="crm-funnel-tip-title">
                          <i class="crm-funnel-tip-dot" :style="{ background: funnelHover.color }"></i>
                          <span>{{ funnelHover.stage }}</span>
                        </div>
                        <div class="crm-funnel-tip-rows">
                          <div v-for="row in funnelTipRows(funnelHover)" :key="row.label" class="crm-funnel-tip-row">
                            <span class="crm-funnel-tip-label">{{ row.label }}</span>
                            <span class="crm-funnel-tip-value">{{ row.value }}</span>
                          </div>
                        </div>
                      </template>
                    </div>
                  </div>
                </div>
                <div class="shadcn-donut-legend-wrap">
                  <ul class="shadcn-donut-legend shadcn-donut-legend--inline">
                    <li v-for="step in funnelRows" :key="'l-' + step.stage" class="shadcn-donut-legend-item">
                      <div class="shadcn-donut-legend-name-row">
                        <i class="shadcn-donut-legend-dot" :style="{ background: step.color }"></i>
                        <span class="shadcn-donut-legend-label">{{ step.stage }}</span>
                      </div>
                      <div class="shadcn-donut-legend-meta">
                        <span class="shadcn-donut-legend-value">{{ step.value }}</span>
                        <span class="shadcn-donut-legend-pct">{{ funnelPctLabel(step) }}</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </a-card>
          </a-col>
          <a-col :xs="24" :lg="12">
            <a-card class="crm-card general-card crm-chart-card crm-card--fill shadcn-donut-card">
              <div class="crm-section-head">
                <a-typography-title :heading="6" class="crm-section-title">{{ t.leadSource }}</a-typography-title>
                <div class="crm-section-actions">
                  <a-button size="small" :title="t.viewReport" @click="onTip(t.viewReport)">
                    <template #icon><icon-eye /></template>
                  </a-button>
                  <a-button size="small" :title="t.downloadCsv" @click="onTip(t.downloadCsv)">
                    <template #icon><icon-download /></template>
                  </a-button>
                </div>
              </div>
              <div class="shadcn-donut-layout">
                <div class="shadcn-donut-chart">
                  <div
                    :key="'source-' + chartEpoch"
                    ref="sourceChart"
                    class="shadcn-chart-host shadcn-chart-host--donut shadcn-donut-host"
                  ></div>
                </div>
                <div class="shadcn-donut-legend-wrap">
                  <ul class="shadcn-donut-legend shadcn-donut-legend--inline">
                    <li v-for="item in leadSourceRows" :key="item.key" class="shadcn-donut-legend-item">
                      <div class="shadcn-donut-legend-name-row">
                        <i class="shadcn-donut-legend-dot" :style="{ background: item.color }"></i>
                        <span class="shadcn-donut-legend-label">{{ item.label }}</span>
                      </div>
                      <div class="shadcn-donut-legend-meta">
                        <span class="shadcn-donut-legend-value">{{ item.value }}</span>
                        <span class="shadcn-donut-legend-pct">{{ item.pct }}%</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </a-card>
          </a-col>
        </a-row>

        <a-row :gutter="[16, 16]" class="crm-equal-row">
          <a-col :xs="24" :sm="12">
            <a-card class="crm-card general-card crm-card--fill">
              <div class="crm-section-head">
                <a-typography-title :heading="6" class="crm-section-title">{{ t.upcomingMeetings }}</a-typography-title>
                <a-button size="small" :title="t.viewCalendar" @click="onTip(t.viewCalendar)">
                  <template #icon><icon-calendar /></template>
                </a-button>
              </div>
              <div class="crm-meeting-body">
                <div class="crm-meeting-times">
                  <span>08:45<i></i></span>
                  <span>09:00<i></i></span>
                  <span>10:00<i></i></span>
                  <span>10:20<i></i></span>
                </div>
                <div class="crm-meeting-rail">
                  <div class="crm-meeting-block">
                    <div class="crm-meeting-icon"><icon-calendar /></div>
                    <div style="min-width:0">
                      <div class="crm-meeting-name">{{ t.meetingTitle }}</div>
                      <div class="crm-meeting-company">{{ t.meetingCompany }}</div>
                    </div>
                  </div>
                  <div class="crm-meeting-now"></div>
                </div>
              </div>
            </a-card>
          </a-col>
          <a-col :xs="24" :sm="12">
            <a-card class="crm-card general-card crm-card--fill">
              <div class="crm-section-head">
                <a-typography-title :heading="6" class="crm-section-title">{{ t.proposalGoal }}</a-typography-title>
                <icon-arrow-up-right class="crm-section-link-icon" />
              </div>
              <div class="crm-proposal-body">
                <div class="crm-proposal-head">
                  <div class="crm-proposal-value">{{ proposalSent }} <span>{{ t.sent }}</span></div>
                  <div class="crm-proposal-goal">{{ t.goal }} {{ proposalGoal }}</div>
                </div>
                <div class="crm-proposal-bars">
                  <div v-for="(on, i) in proposalBars" :key="i" class="crm-proposal-bar" :class="{ 'is-active': on }">
                    <i></i>
                  </div>
                </div>
                <p class="crm-proposal-note">{{ t.proposalNote.replace('{pct}', proposalProgress) }}</p>
              </div>
            </a-card>
          </a-col>
        </a-row>

        <a-card class="crm-card general-card">
          <div class="crm-section-head">
            <a-typography-title :heading="6" class="crm-section-title">{{ t.pipelineTitle }}</a-typography-title>
            <icon-arrow-up-right class="crm-section-link-icon" />
          </div>
          <div class="crm-pipeline-grid">
            <div
              :key="'pipeline-' + chartEpoch"
              ref="pipelineChart"
              class="shadcn-chart-host crm-pipeline-chart"
            ></div>
            <div class="crm-pipeline-side">
              <div class="crm-pipeline-side-summary">
                <div class="crm-pipeline-total">{{ totalQualified }} <span>{{ t.leadsCount }}</span></div>
                <p class="crm-pipeline-note">{{ t.pipelineNote }}</p>
              </div>
              <div class="crm-discovery-box">
                <div>
                  <div class="crm-discovery-label">{{ t.discoveryTitle }}</div>
                  <div class="crm-pipeline-total">{{ discoveryBooked }} <span>{{ t.meetingsCount }}</span></div>
                  <p class="crm-pipeline-note">{{ t.discoveryNote.replace('{pct}', discoveryProgress) }}</p>
                </div>
                <div>
                  <div
                    class="crm-discovery-track"
                    role="progressbar"
                    :aria-valuenow="discoveryProgress"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    <div
                      :key="'discovery-' + chartEpoch"
                      class="crm-discovery-fill"
                      :style="{ width: discoveryProgress + '%' }"
                    ></div>
                  </div>
                  <div class="crm-discovery-meta">
                    <span>{{ discoveryBooked }} {{ t.booked }}</span>
                    <span class="muted">{{ totalQualified }} {{ t.qualifiedLeads }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-card>

        <a-card class="crm-card general-card">
          <div class="crm-section-head" style="align-items: flex-start; flex-wrap: wrap">
            <div>
              <a-typography-title :heading="6" class="crm-section-title">{{ t.opportunities }}</a-typography-title>
              <a-typography-text type="secondary" class="crm-section-desc">{{ t.opportunitiesDesc }}</a-typography-text>
            </div>
            <div class="crm-opp-toolbar">
              <a-input
                v-model="keyword"
                allow-clear
                class="crm-opp-search"
                size="small"
                :placeholder="t.searchPh"
              >
                <template #prefix><icon-search /></template>
              </a-input>
              <a-select v-model="stageFilter" size="small" :style="{ width: '120px' }">
                <a-option v-for="opt in stageOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</a-option>
              </a-select>
              <a-select v-model="healthFilter" size="small" :style="{ width: '120px' }">
                <a-option v-for="opt in healthOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</a-option>
              </a-select>
            </div>
          </div>

          <a-table
            :columns="columns"
            :data="pagedRows"
            :pagination="false"
            row-key="id"
            :bordered="false"
            size="medium"
            :row-selection="{ type: 'checkbox', showCheckedAll: true, width: 48 }"
            :selected-keys="selectedKeys"
            @selection-change="(keys) => (selectedKeys = keys)"
          >
            <template #stage="{ record }">
              <span class="crm-stage-tag" :class="'is-' + stageTone(record.stage)">
                <i class="crm-stage-dot" aria-hidden="true"></i>
                <span class="crm-stage-label">{{ stageLabel(record.stage) }}</span>
              </span>
            </template>
            <template #health="{ record }">
              <div class="crm-health-strips" :title="healthLabel(record.health)">
                <i v-for="(on, i) in healthSlots(record.health)" :key="i" :class="{ 'is-on': on }"></i>
              </div>
            </template>
            <template #actions="{ record }">
              <a-button type="text" size="small" @click="onEdit(record)">
                <template #icon><icon-edit /></template>
              </a-button>
            </template>
          </a-table>

          <div class="crm-opp-footer">
            <span class="crm-opp-count">
              {{ t.showing }} {{ pagedRows.length }} / {{ filteredRows.length }} {{ t.oppUnit }}
            </span>
            <a-pagination
              :current="pagination.current"
              :page-size="pagination.pageSize"
              :total="filteredRows.length"
              show-total
              @change="onPageChange"
            />
          </div>
        </a-card>
      </div>
    `,
  }

  mountProPage({
    pageKey: 'dashboard/crm',
    title: t.pageTitle,
    pageComponent: CrmPage,
  })
})()
