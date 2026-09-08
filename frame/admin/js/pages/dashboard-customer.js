;(function () {
  /* Locale strings — parent may move to ArcoProLocale.customer */
  const t = {
    pageTitle: '客户洞察',
    pageDesc: '指标卡片、客户活动与客户列表',
    kpiRevenue: '总收入',
    kpiRevenueHint: '收入表现持续向好',
    kpiNewCustomers: '新客户',
    kpiNewCustomersHint: '获客表现需关注',
    kpiActiveAccounts: '活跃账户',
    kpiActiveAccountsHint: '互动超出目标',
    kpiGrowth: '增长率',
    kpiGrowthHint: '符合增长预期',
    activityTitle: '客户活动',
    activityDesc: '近 3 个月客户活动趋势',
    segmentAll: '全部分群',
    segmentPaid: '付费',
    segmentOrganic: '自然流量',
    seriesNew: '新客户',
    seriesActive: '活跃账户',
    seriesReturning: '回访用户',
    customersTitle: '18,426 位客户',
    customersDesc: '近期客户记录，含套餐、账单、状态与注册时间。',
    export: '导出',
    exportTip: '导出任务已创建（原型演示）',
    preset7d: '近 7 天',
    preset30d: '近 30 天',
    preset90d: '近 3 个月',
    presetCustom: '自定义',
    refresh: '刷新',
    refreshTip: '数据已刷新（原型演示）',
    searchPh: '搜索客户...',
    filterStatus: '状态',
    filterBilling: '账单',
    filterSort: '排序',
    statusAll: '全部',
    statusSubscribed: '已订阅',
    statusInactive: '未活跃',
    statusUnsubscribed: '已退订',
    billingAll: '全部',
    billingPaid: '已付费',
    billingPending: '待处理',
    billingOverdue: '已逾期',
    billingTrial: '试用中',
    planEnterprise: '企业版',
    planGrowth: '增长版',
    planPro: '专业版',
    planStarter: '入门版',
    sortNewest: '最新优先',
    sortOldest: '最早优先',
    sortNameAsc: '按姓名升序',
    sortNameDesc: '按姓名降序',
    colCustomer: '客户',
    colStatus: '状态',
    colBilling: '账单',
    colPlan: '套餐',
    colJoined: '注册时间',
    showing: '显示',
    of: '/',
    selected: '已选',
    rows: '行',
  }

  const STATUS_LABELS = {
    Subscribed: t.statusSubscribed,
    Inactive: t.statusInactive,
    Unsubscribed: t.statusUnsubscribed,
  }

  const BILLING_LABELS = {
    Paid: t.billingPaid,
    Pending: t.billingPending,
    Overdue: t.billingOverdue,
    Trial: t.billingTrial,
  }

  const PLAN_LABELS = {
    Enterprise: t.planEnterprise,
    Growth: t.planGrowth,
    Pro: t.planPro,
    Starter: t.planStarter,
  }

  /* ~36 pts；三条曲线各自有峰值与起伏，便于对比 */
  const activitySeries = [
    { newCustomers: 23840, activeAccounts: 16280, returningUsers: 9240 },
    { newCustomers: 11476, activeAccounts: 14820, returningUsers: 8120 },
    { newCustomers: 8885, activeAccounts: 13150, returningUsers: 7380 },
    { newCustomers: 7445, activeAccounts: 11960, returningUsers: 6910 },
    { newCustomers: 10154, activeAccounts: 12840, returningUsers: 7640 },
    { newCustomers: 8716, activeAccounts: 14110, returningUsers: 8250 },
    { newCustomers: 22106, activeAccounts: 17640, returningUsers: 10860 },
    { newCustomers: 9200, activeAccounts: 13920, returningUsers: 7940 },
    { newCustomers: 10196, activeAccounts: 12680, returningUsers: 7120 },
    { newCustomers: 15297, activeAccounts: 15430, returningUsers: 9680 },
    { newCustomers: 7529, activeAccounts: 11240, returningUsers: 6530 },
    { newCustomers: 9635, activeAccounts: 12180, returningUsers: 7280 },
    { newCustomers: 10134, activeAccounts: 13460, returningUsers: 8410 },
    { newCustomers: 13396, activeAccounts: 14890, returningUsers: 9150 },
    { newCustomers: 9542, activeAccounts: 13620, returningUsers: 7860 },
    { newCustomers: 15883, activeAccounts: 16150, returningUsers: 10240 },
    { newCustomers: 6902, activeAccounts: 11870, returningUsers: 6240 },
    { newCustomers: 9848, activeAccounts: 12940, returningUsers: 7590 },
    { newCustomers: 19721, activeAccounts: 18260, returningUsers: 11680 },
    { newCustomers: 11193, activeAccounts: 15780, returningUsers: 8940 },
    { newCustomers: 8002, activeAccounts: 12450, returningUsers: 6830 },
    { newCustomers: 10372, activeAccounts: 13290, returningUsers: 8010 },
    { newCustomers: 9279, activeAccounts: 14160, returningUsers: 8720 },
    { newCustomers: 6307, activeAccounts: 10980, returningUsers: 5960 },
    { newCustomers: 9909, activeAccounts: 12810, returningUsers: 7480 },
    { newCustomers: 10126, activeAccounts: 13940, returningUsers: 8350 },
    { newCustomers: 9549, activeAccounts: 15270, returningUsers: 9180 },
    { newCustomers: 15233, activeAccounts: 16840, returningUsers: 10450 },
    { newCustomers: 14874, activeAccounts: 17420, returningUsers: 11120 },
    { newCustomers: 8014, activeAccounts: 14560, returningUsers: 8670 },
    { newCustomers: 8613, activeAccounts: 13180, returningUsers: 7920 },
    { newCustomers: 11234, activeAccounts: 14350, returningUsers: 8840 },
    { newCustomers: 11104, activeAccounts: 15680, returningUsers: 9620 },
    { newCustomers: 9249, activeAccounts: 14820, returningUsers: 8910 },
    { newCustomers: 7467, activeAccounts: 13240, returningUsers: 7650 },
    { newCustomers: 10727, activeAccounts: 14190, returningUsers: 8380 },
  ]

  const activityLegend = [
    { key: 'newCustomers', label: t.seriesNew, color: 'var(--chart-1)' },
    { key: 'activeAccounts', label: t.seriesActive, color: 'var(--chart-2)' },
    { key: 'returningUsers', label: t.seriesReturning, color: 'var(--chart-3)' },
  ]

  function pad2(n) {
    return n < 10 ? '0' + n : String(n)
  }

  function buildActivityChartData() {
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    const hoursSpan = (activitySeries.length - 1) * 60
    const start = new Date(end.getTime() - hoursSpan * 3600 * 1000)
    return activitySeries.map((point, index) => {
      const d = new Date(start.getTime() + index * 60 * 3600 * 1000)
      const label = `${d.getMonth() + 1}月${d.getDate()}日`
      return {
        label,
        dateKey: `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`,
        newCustomers: point.newCustomers,
        activeAccounts: point.activeAccounts,
        returningUsers: point.returningUsers,
      }
    })
  }

  function parseJoined(iso) {
    const parts = String(iso || '').split('-').map(Number)
    if (parts.length < 3 || parts.some((n) => !n && n !== 0)) return new Date(NaN)
    return new Date(parts[0], parts[1] - 1, parts[2])
  }

  function formatJoinedDate(iso, id) {
    const base = parseJoined(iso)
    if (Number.isNaN(base.getTime())) return { date: iso, time: '' }
    const minutes = 9 * 60 + (Number(id) % 12) * 17
    const joinedAt = new Date(base.getTime() + minutes * 60 * 1000)
    return {
      date: `${joinedAt.getFullYear()}年${joinedAt.getMonth() + 1}月${joinedAt.getDate()}日`,
      time: `${pad2(joinedAt.getHours())}:${pad2(joinedAt.getMinutes())}`,
      ts: joinedAt.getTime(),
    }
  }

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

  const CustomerPage = {
    name: 'CustomerDashboardPage',
    data() {
      const allRows = Array.isArray(window.ProCustomerDashboardRows)
        ? window.ProCustomerDashboardRows.slice()
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
        segment: 'all',
        keyword: '',
        statusFilter: 'all',
        billingFilter: 'all',
        sortBy: 'newest',
        selectedKeys: [],
        pagination: { current: 1, pageSize: 10, showTotal: true },
        allRows,
        activityLegend,
        kpis: [
          {
            title: t.kpiRevenue,
            value: '¥1,250.00',
            badge: '12.5%',
            up: true,
            hint: t.kpiRevenueHint,
            icon: 'icon-credit-card',
          },
          {
            title: t.kpiNewCustomers,
            value: '1,234',
            badge: '20%',
            up: false,
            hint: t.kpiNewCustomersHint,
            icon: 'icon-user',
          },
          {
            title: t.kpiActiveAccounts,
            value: '45,678',
            badge: '12.5%',
            up: true,
            hint: t.kpiActiveAccountsHint,
            icon: 'icon-user-group',
          },
          {
            title: t.kpiGrowth,
            value: '4.5%',
            badge: '4.5%',
            up: true,
            hint: t.kpiGrowthHint,
            icon: 'icon-activity',
          },
        ],
        statusOptions: [
          { value: 'all', label: t.statusAll },
          { value: 'Subscribed', label: t.statusSubscribed },
          { value: 'Inactive', label: t.statusInactive },
          { value: 'Unsubscribed', label: t.statusUnsubscribed },
        ],
        billingOptions: [
          { value: 'all', label: t.billingAll },
          { value: 'Paid', label: t.billingPaid },
          { value: 'Pending', label: t.billingPending },
          { value: 'Overdue', label: t.billingOverdue },
          { value: 'Trial', label: t.billingTrial },
        ],
        sortOptions: [
          { value: 'newest', label: t.sortNewest },
          { value: 'oldest', label: t.sortOldest },
          { value: 'name-asc', label: t.sortNameAsc },
          { value: 'name-desc', label: t.sortNameDesc },
        ],
        columns: [
          // 客户列仅 minWidth：承接余宽，勾选列保持 48
          { title: t.colCustomer, dataIndex: 'name', minWidth: 180, slotName: 'customer' },
          { title: t.colStatus, dataIndex: 'status', width: 120, slotName: 'status' },
          { title: t.colBilling, dataIndex: 'billing', width: 140, slotName: 'billing' },
          { title: t.colPlan, dataIndex: 'plan', width: 120, slotName: 'plan' },
          { title: t.colJoined, dataIndex: 'joined', width: 196, slotName: 'joined' },
        ],
      }
    },
    computed: {
      filteredRows() {
        const kw = (this.keyword || '').trim().toLowerCase()
        let rows = this.allRows.filter((row) => {
          if (this.statusFilter !== 'all' && row.status !== this.statusFilter) return false
          if (this.billingFilter !== 'all' && row.billing !== this.billingFilter) return false
          if (!kw) return true
          const hay = `${row.id} ${row.name} ${row.email}`.toLowerCase()
          return hay.includes(kw)
        })

        const sorted = rows.slice()
        if (this.sortBy === 'oldest') {
          sorted.sort((a, b) => parseJoined(a.joined) - parseJoined(b.joined))
        } else if (this.sortBy === 'name-asc') {
          sorted.sort((a, b) => String(a.name).localeCompare(String(b.name), 'zh-CN'))
        } else if (this.sortBy === 'name-desc') {
          sorted.sort((a, b) => String(b.name).localeCompare(String(a.name), 'zh-CN'))
        } else {
          sorted.sort((a, b) => parseJoined(b.joined) - parseJoined(a.joined))
        }
        return sorted
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
      statusFilter() {
        this.pagination.current = 1
      },
      billingFilter() {
        this.pagination.current = 1
      },
      sortBy() {
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
      statusLabel(v) {
        return STATUS_LABELS[v] || v
      },
      statusColor(v) {
        if (v === 'Subscribed') return 'green'
        if (v === 'Unsubscribed') return 'red'
        return 'gray'
      },
      billingLabel(v) {
        return BILLING_LABELS[v] || v
      },
      planLabel(v) {
        return PLAN_LABELS[v] || v
      },
      joinedParts(row) {
        return formatJoinedDate(row.joined, row.id)
      },
      billingClass(billing) {
        if (billing === 'Paid') return 'is-paid'
        if (billing === 'Overdue') return 'is-overdue'
        if (billing === 'Trial') return 'is-trial'
        return ''
      },
      onPageChange(page) {
        this.pagination.current = page
      },
      onPageSizeChange(size) {
        this.pagination.pageSize = size
        this.pagination.current = 1
      },
      onTip(msg) {
        ArcoVue.Message.info(msg)
      },
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
      onRefresh() {
        if (this.refreshing) return
        this.refreshing = true
        this.destroyCharts()
        this.$nextTick(() => {
          this.initCharts()
          ArcoVue.Message.success(t.refreshTip)
        })
        window.setTimeout(() => {
          this.refreshing = false
        }, 600)
      },
      initCharts() {
        if (!window.ProShadcnCharts) return
        const data = buildActivityChartData()
        const activityPeak = Math.max(
          ...data.map((d) =>
            Math.max(
              Number(d.newCustomers) || 0,
              Number(d.activeAccounts) || 0,
              Number(d.returningUsers) || 0
            )
          ),
          1
        )
        // Y 顶格贴数据上沿（约 6% 余量），刻度取整千
        const activityYTop = Math.max(1000, Math.ceil((activityPeak * 1.06) / 1000) * 1000)
        const activityYTicks = [0, 0.25, 0.5, 0.75, 1].map((p) => Math.round(activityYTop * p))
        this._activityChart = ProShadcnCharts.mountAreaChart(this.$refs.activityChart, {
          data,
          height: 320,
          x: (d) => d.label,
          xLabel: (d) => d.label,
          stacked: false,
          curveType: 'monotoneX',
          lineWidth: 2,
          yDomain: [0, activityYTop],
          yTickValues: activityYTicks,
          series: [
            { key: 'newCustomers', label: t.seriesNew, color: 'var(--chart-1)', opacity: 0.28 },
            { key: 'activeAccounts', label: t.seriesActive, color: 'var(--chart-2)', opacity: 0.18 },
            { key: 'returningUsers', label: t.seriesReturning, color: 'var(--chart-3)', opacity: 0.12 },
          ],
          // XY + 底部 HTML 图例：只修底轴（见 charts.md）
          autoMargin: false,
          margin: { top: 6, bottom: 22, right: 8 },
        })
      },
      destroyCharts() {
        if (!window.ProShadcnCharts) return
        ProShadcnCharts.destroy(this._activityChart)
        this._activityChart = null
      },
    },
    mounted() {
      this._rangeKey = this.rangeKeyOf(this.dateRange[0], this.dateRange[1])
      this.$nextTick(() => this.initCharts())
    },
    beforeUnmount() {
      this.destroyCharts()
    },
    template: `
      <div class="cust-page">
        <div class="cust-header">
          <div class="cust-header-text">
            <h2 class="cust-title">{{ t.pageTitle }}</h2>
            <p class="cust-desc">{{ t.pageDesc }}</p>
          </div>
          <div class="cust-filters">
            <a-button
              type="secondary"
              size="medium"
              class="cust-refresh-btn"
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
          </div>
        </div>

        <a-row :gutter="[16, 16]">
          <a-col v-for="(item, idx) in kpis" :key="idx" :xs="24" :sm="12" :xl="6">
            <a-card class="cust-card general-card">
              <div class="cust-kpi-head">
                <span class="cust-kpi-title">{{ item.title }}</span>
                <span class="cust-kpi-icon-box">
                  <component :is="item.icon" />
                </span>
              </div>
              <div class="cust-kpi-value">{{ item.value }}</div>
              <div class="cust-kpi-foot">
                <span class="cust-kpi-hint">{{ item.hint }}</span>
                <span class="cust-badge" :class="item.up ? 'cust-badge--up' : 'cust-badge--down'">
                  <icon-arrow-up-right v-if="item.up" />
                  <icon-arrow-down-right v-else />
                  {{ item.badge }}
                </span>
              </div>
            </a-card>
          </a-col>
        </a-row>

        <a-card class="cust-card general-card">
          <div class="cust-section-head">
            <div>
              <a-typography-title :heading="6" class="cust-section-title">{{ t.activityTitle }}</a-typography-title>
              <span class="cust-section-desc">{{ t.activityDesc }}</span>
            </div>
            <div class="cust-section-actions">
              <a-select v-model="segment" size="small" :style="{ width: '120px' }">
                <a-option value="all">{{ t.segmentAll }}</a-option>
                <a-option value="paid">{{ t.segmentPaid }}</a-option>
                <a-option value="organic">{{ t.segmentOrganic }}</a-option>
              </a-select>
            </div>
          </div>
          <div ref="activityChart" class="shadcn-chart-host cust-activity-chart"></div>
          <div class="shadcn-chart-legend">
            <span v-for="item in activityLegend" :key="item.key" class="shadcn-chart-legend-item">
              <span class="shadcn-chart-legend-dot" :style="{ '--legend-color': item.color }"></span>{{ item.label }}
            </span>
          </div>
        </a-card>

        <a-card class="cust-card general-card">
          <div class="cust-section-head">
            <div>
              <a-typography-title :heading="6" class="cust-section-title">{{ t.customersTitle }}</a-typography-title>
              <span class="cust-section-desc">{{ t.customersDesc }}</span>
            </div>
            <div class="cust-section-actions">
              <a-input
                v-model="keyword"
                allow-clear
                class="cust-search"
                size="small"
                :placeholder="t.searchPh"
              >
                <template #prefix><icon-search /></template>
              </a-input>
              <a-select v-model="statusFilter" size="small" :style="{ width: '120px' }">
                <a-option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</a-option>
              </a-select>
              <a-select v-model="billingFilter" size="small" :style="{ width: '120px' }">
                <a-option v-for="opt in billingOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</a-option>
              </a-select>
              <a-select v-model="sortBy" size="small" :style="{ width: '128px' }">
                <a-option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</a-option>
              </a-select>
              <a-button size="small" @click="onTip(t.exportTip)">
                <template #icon><icon-download /></template>
                {{ t.export }}
              </a-button>
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
            <template #customer="{ record }">
              <div class="cust-customer-cell">
                <span class="cust-avatar"><icon-user /></span>
                <div class="cust-customer-meta">
                  <div class="cust-customer-name">{{ record.name }}</div>
                  <div class="cust-customer-id">#{{ record.id }}</div>
                </div>
              </div>
            </template>
            <template #status="{ record }">
              <a-tag size="small" bordered :color="statusColor(record.status)">{{ statusLabel(record.status) }}</a-tag>
            </template>
            <template #billing="{ record }">
              <span class="cust-billing-tag" :class="billingClass(record.billing)">
                <icon-check-circle v-if="record.billing === 'Paid'" />
                <icon-refresh v-else-if="record.billing === 'Pending'" />
                <icon-exclamation-circle v-else-if="record.billing === 'Overdue'" />
                <icon-clock-circle v-else />
                {{ billingLabel(record.billing) }}
              </span>
            </template>
            <template #plan="{ record }">
              {{ planLabel(record.plan) }}
            </template>
            <template #joined="{ record }">
              <div class="cust-joined">
                <span class="cust-joined-date">{{ joinedParts(record).date }}</span>
                <span class="cust-joined-time">{{ joinedParts(record).time }}</span>
              </div>
            </template>
          </a-table>

          <div class="cust-table-footer">
            <span class="cust-table-count">
              {{ t.selected }} {{ selectedKeys.length }} / {{ filteredRows.length }} {{ t.rows }}
            </span>
            <a-pagination
              :current="pagination.current"
              :page-size="pagination.pageSize"
              :total="filteredRows.length"
              show-total
              show-page-size
              :page-size-options="[10, 20, 30, 40, 50]"
              @change="onPageChange"
              @page-size-change="onPageSizeChange"
            />
          </div>
        </a-card>
      </div>
    `,
  }

  mountProPage({
    pageKey: 'dashboard/customer',
    title: t.pageTitle,
    pageComponent: CustomerPage,
  })
})()
