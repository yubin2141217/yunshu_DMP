;(function () {
  const t = {
    pageTitle: '金融银行',
    tabOverview: '概览',
    tabActivity: '动态',
    tabInsights: '洞察',
    tabUtilities: '工具',
    placeholderActivity: '动态视图即将上线。',
    placeholderInsights: '洞察视图即将上线。',
    placeholderUtilities: '工具视图即将上线。',
    preset7d: '近 7 天',
    preset30d: '近 30 天',
    preset90d: '近 3 个月',
    presetCustom: '自定义',
    refresh: '刷新',
    refreshTip: '数据已刷新（原型演示）',
    primaryAccount: '主账户',
    availableBalance: '可用余额',
    pay: '付款',
    receive: '收款',
    netWorth: '净资产',
    thisMonth: '本月',
    momPrefix: '环比',
    netWorthFoot: '汇总所有关联账户',
    monthlyCashFlow: '月度现金流',
    thisMonthNet: '本月 · 净额',
    momPct: '环比 +4.1%',
    savingsRate: '储蓄率',
    savingsMeta: '本月 · 扣除支出后',
    savingsFoot: '高于您的平均水平',
    cashFlowTitle: '现金流概览',
    cashFlowDesc: '月度收入与支出及净现金流影响。',
    income: '收入',
    expenses: '支出',
    spendingTitle: '支出构成',
    spendingDesc: '按类别的支出分布。',
    reliabilityTitle: '收入稳定性',
    reliabilityDesc: '近期收入的一致程度。',
    reliabilityHigh: '稳定性高',
    reliabilityBased: '基于近 6 个月收入',
    fixedIncome: '固定收入',
    fixedIncomeSub: '周期性 · 可预测',
    variableIncome: '浮动收入',
    variableIncomeSub: '波动来源',
    consistencyTrend: '一致性趋势：',
    stable: '稳定',
    myCards: '我的卡片',
    myCardsDesc: '已添加 1 / 4 张卡 · 主卡概览与即将到期款项',
    cardHolder: '张三',
    validThru: '有效期',
    cvv: '安全码',
    cardType: '卡片类型',
    cardTypeValue: '虚拟卡',
    billingCycle: '账单周期',
    billingCycleValue: '每月 21 日',
    creditLimit: '信用额度',
    availableCredit: '可用额度',
    manageCard: '管理卡片',
    addCard: '添加卡片',
    upcoming: '即将到期',
    viewAllPayments: '查看全部款项',
  }

  const cashFlowData = [
    { month: '1月', income: 5900, expenses: 4200 },
    { month: '2月', income: 3800, expenses: 6100 },
    { month: '3月', income: 5200, expenses: 5600 },
    { month: '4月', income: 7100, expenses: 3200 },
    { month: '5月', income: 4500, expenses: 4400 },
    { month: '6月', income: 6100, expenses: 3600 },
    { month: '7月', income: 3300, expenses: 5200 },
    { month: '8月', income: 4300, expenses: 4000 },
    { month: '9月', income: 7200, expenses: 5800 },
    { month: '10月', income: 5600, expenses: 4600 },
    { month: '11月', income: 3600, expenses: 6400 },
    { month: '12月', income: 4700, expenses: 3400 },
  ]

  const expenses = [
    { key: 'housing', label: '住房', amount: 1650 },
    { key: 'utilities', label: '水电', amount: 420 },
    { key: 'groceries', label: '日用', amount: 560 },
    { key: 'transportation', label: '交通', amount: 740 },
    { key: 'subscriptions', label: '订阅', amount: 260 },
    { key: 'healthcare', label: '医疗', amount: 390 },
    { key: 'other', label: '其他', amount: 980 },
  ]

  function formatCurrency(n, opts) {
    const noDecimals = opts && opts.noDecimals
    const abs = Math.abs(Number(n) || 0)
    const formatted = noDecimals
      ? Math.round(abs).toLocaleString('zh-CN')
      : abs.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const sign = n < 0 ? '-' : ''
    return `${sign}¥${formatted}`
  }

  function addDays(base, days) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate())
    d.setDate(d.getDate() + days)
    return d
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

  function shiftDays(d, n) {
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
    const from = shiftDays(to, -(days - 1))
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

  function formatZhDate(d) {
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
  }

  function spendColor(index) {
    return 'var(--chart-' + ((index % 10) + 1) + ')'
  }

  const now = new Date()
  const upcomingPayments = [
    {
      id: 1,
      icon: 'fa-house',
      title: '房租',
      amount: 1200,
      date: `到期：${formatZhDate(addDays(now, 2))}`,
    },
    {
      id: 2,
      icon: 'fa-bolt',
      title: '电费',
      amount: 75,
      date: `到期：${formatZhDate(addDays(now, 2))}`,
    },
    {
      id: 3,
      icon: 'fa-sparkles',
      title: 'AI 助手 Plus',
      amount: 20,
      date: `到期：${formatZhDate(addDays(now, 7))}`,
    },
    {
      id: 4,
      icon: 'fa-receipt',
      title: '信用卡还款',
      amount: 420,
      date: `到期：${formatZhDate(addDays(now, 9))}`,
    },
  ]

  const totalIncome = cashFlowData.reduce((acc, item) => acc + item.income, 0)
  const totalExpenses = cashFlowData.reduce((acc, item) => acc + item.expenses, 0)
  const spendingTotal = expenses.reduce((sum, item) => sum + item.amount, 0)

  const BankingPage = {
    name: 'BankingDashboardPage',
    data() {
      const today = startOfDay(new Date())
      const [from, to] = presetRange('7d', today)
      return {
        t,
        activeTab: 'overview',
        timePreset: '7d',
        dateRange: [from, to],
        dataMax: today,
        dataMin: shiftDays(today, -89),
        refreshing: false,
        totalIncome,
        totalExpenses,
        spendingTotal,
        expenses: expenses.map((item, index) => ({
          ...item,
          pct: Math.round((item.amount / spendingTotal) * 100),
          width: `${(item.amount / spendingTotal) * 100}%`,
          color: spendColor(index),
        })),
        upcomingPayments,
        primaryBalance: formatCurrency(12450, { noDecimals: true }),
        netWorthValue: formatCurrency(84250, { noDecimals: true }),
        netWorthDelta: `+${formatCurrency(3680, { noDecimals: true })} ${t.momPrefix}`,
        monthlyNet: `+${formatCurrency(2780, { noDecimals: true })}`,
        savingsRateValue: '32%',
        savingsDelta: `${t.momPrefix} +3.5%`,
        fixedIncome: formatCurrency(90000, { noDecimals: true }),
        variableIncome: formatCurrency(46500, { noDecimals: true }),
        creditLimit: formatCurrency(62000),
        availableCredit: formatCurrency(13100.06),
      }
    },
    computed: {
      placeholderText() {
        const map = {
          activity: t.placeholderActivity,
          insights: t.placeholderInsights,
          utilities: t.placeholderUtilities,
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
        if (span > 90) from = shiftDays(to, -89)
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
        if (this.activeTab === 'overview') this.$nextTick(() => this.initCharts())
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
        if (!window.ProShadcnCharts || this.activeTab !== 'overview') return
        this.destroyCharts()
        if (!this.$refs.cashFlowChart) return
        this._cashFlowChart = ProShadcnCharts.mountBarChart(this.$refs.cashFlowChart, {
          data: cashFlowData.map((d) => ({
            label: d.month,
            income: d.income,
            expenses: d.expenses,
          })),
          height: 288,
          x: (d) => d.label,
          xLabel: (d) => d.label,
          crosshair: false,
          groupPadding: 0.35,
          series: [
            { key: 'income', label: t.income, color: 'var(--chart-1)' },
            { key: 'expenses', label: t.expenses, color: 'var(--chart-2)' },
          ],
          yTickFormat: (v) => {
            const abs = Math.abs(v)
            return abs >= 1000 ? `${abs / 1000}千` : `${abs}`
          },
          yTickValues: [0, 2000, 4000, 6000, 8000],
          yDomain: [0, 8000],
          // 无底图例：只修底轴（见 charts.md）
          autoMargin: false,
          margin: { top: 6, bottom: 22, right: 8 },
        })
      },
      destroyCharts() {
        if (!window.ProShadcnCharts) return
        ProShadcnCharts.destroy(this._cashFlowChart)
        this._cashFlowChart = null
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
      <div class="bank-page">
        <div class="bank-tabs-bar">
          <a-tabs
            v-model:active-key="activeTab"
            type="rounded"
            size="medium"
            class="bank-tabs"
            :header-padding="false"
          >
            <a-tab-pane key="overview" :title="t.tabOverview" />
            <a-tab-pane key="activity" :title="t.tabActivity" />
            <a-tab-pane key="insights" :title="t.tabInsights" />
            <a-tab-pane key="utilities" :title="t.tabUtilities" />
          </a-tabs>
          <div class="bank-filters">
            <a-button
              type="secondary"
              size="medium"
              class="bank-refresh-btn"
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

        <template v-if="activeTab === 'overview'">
          <a-row :gutter="[16, 16]">
            <a-col :xs="24" :sm="12" :xl="6">
              <a-card class="bank-card bank-card--kpi general-card">
                <div class="bank-kpi-head">
                  <span class="bank-kpi-icon-wrap">
                    <i class="pro-fa-icon fa-sharp fa-light fa-wallet"></i>
                  </span>
                  <span class="bank-kpi-title">{{ t.primaryAccount }}</span>
                </div>
                <div class="bank-kpi-value">{{ primaryBalance }}</div>
                <div class="bank-kpi-meta">{{ t.availableBalance }}</div>
                <div class="bank-kpi-actions">
                  <a-button type="primary" size="small" @click="onTip(t.pay)">{{ t.pay }}</a-button>
                  <a-button size="small" @click="onTip(t.receive)">{{ t.receive }}</a-button>
                </div>
              </a-card>
            </a-col>

            <a-col :xs="24" :sm="12" :xl="6">
              <a-card class="bank-card bank-card--kpi general-card">
                <div class="bank-kpi-head">
                  <span class="bank-kpi-icon-wrap">
                    <i class="pro-fa-icon fa-sharp fa-light fa-landmark"></i>
                  </span>
                  <span class="bank-kpi-title">{{ t.netWorth }}</span>
                </div>
                <div class="bank-kpi-value-row">
                  <span class="bank-kpi-value">{{ netWorthValue }}</span>
                  <span class="bank-kpi-aside">{{ netWorthDelta }}</span>
                </div>
                <div class="bank-kpi-meta">{{ t.thisMonth }}</div>
                <hr class="bank-kpi-divider" />
                <p class="bank-kpi-foot">{{ t.netWorthFoot }}</p>
              </a-card>
            </a-col>

            <a-col :xs="24" :sm="12" :xl="6">
              <a-card class="bank-card bank-card--kpi general-card">
                <div class="bank-kpi-head">
                  <span class="bank-kpi-icon-wrap">
                    <i class="pro-fa-icon fa-sharp fa-light fa-calendar"></i>
                  </span>
                  <span class="bank-kpi-title">{{ t.monthlyCashFlow }}</span>
                </div>
                <div class="bank-kpi-value">{{ monthlyNet }}</div>
                <div class="bank-kpi-meta">{{ t.thisMonthNet }}</div>
                <hr class="bank-kpi-divider" />
                <p class="bank-kpi-foot">
                  <icon-trending-up />
                  {{ t.momPct }}
                </p>
              </a-card>
            </a-col>

            <a-col :xs="24" :sm="12" :xl="6">
              <a-card class="bank-card bank-card--kpi general-card">
                <div class="bank-kpi-head">
                  <span class="bank-kpi-icon-wrap">
                    <i class="pro-fa-icon fa-sharp fa-light fa-hand-holding-dollar"></i>
                  </span>
                  <span class="bank-kpi-title">{{ t.savingsRate }}</span>
                </div>
                <div class="bank-kpi-value-row">
                  <span class="bank-kpi-value">{{ savingsRateValue }}</span>
                  <span class="bank-kpi-aside">{{ savingsDelta }}</span>
                </div>
                <div class="bank-kpi-meta">{{ t.savingsMeta }}</div>
                <hr class="bank-kpi-divider" />
                <p class="bank-kpi-foot">{{ t.savingsFoot }}</p>
              </a-card>
            </a-col>
          </a-row>

          <div class="bank-main-grid">
            <div class="bank-main-left">
              <a-card class="bank-card general-card">
                <div class="bank-section-head">
                  <div>
                    <a-typography-title :heading="6" class="bank-section-title">{{ t.cashFlowTitle }}</a-typography-title>
                    <a-typography-text type="secondary" class="bank-section-desc">{{ t.cashFlowDesc }}</a-typography-text>
                  </div>
                </div>
                <div class="bank-flow-summary">
                  <div class="bank-flow-stat">
                    <span class="bank-flow-icon bank-flow-icon--income">
                      <i class="pro-fa-icon fa-sharp fa-light fa-arrow-down-left"></i>
                    </span>
                    <div>
                      <p class="bank-flow-label">{{ t.income }}</p>
                      <p class="bank-flow-value">{{ formatCurrency(totalIncome, { noDecimals: true }) }}</p>
                    </div>
                  </div>
                  <div class="bank-flow-divider"></div>
                  <div class="bank-flow-stat">
                    <span class="bank-flow-icon bank-flow-icon--expense">
                      <icon-arrow-up-right />
                    </span>
                    <div>
                      <p class="bank-flow-label">{{ t.expenses }}</p>
                      <p class="bank-flow-value">{{ formatCurrency(totalExpenses, { noDecimals: true }) }}</p>
                    </div>
                  </div>
                </div>
                <div ref="cashFlowChart" class="shadcn-chart-host bank-flow-chart"></div>
              </a-card>

              <a-row class="bank-equal-row" :gutter="[16, 16]">
                <a-col :xs="24" :lg="12">
                  <a-card class="bank-card general-card">
                    <a-typography-title :heading="6" class="bank-section-title">{{ t.spendingTitle }}</a-typography-title>
                    <a-typography-text type="secondary" class="bank-section-desc">{{ t.spendingDesc }}</a-typography-text>
                    <div class="bank-spend-body">
                      <div class="bank-spend-total">{{ formatCurrency(spendingTotal, { noDecimals: true }) }}</div>
                      <div class="bank-spend-bar">
                        <div
                          v-for="item in expenses"
                          :key="item.key"
                          class="bank-spend-seg"
                          :style="{ width: item.width, background: item.color }"
                          :title="item.label + ': ' + formatCurrency(item.amount)"
                        ></div>
                      </div>
                      <ul class="bank-spend-list">
                        <li v-for="item in expenses" :key="'l-' + item.key" class="bank-spend-row">
                          <span class="bank-spend-left">
                            <i class="bank-spend-dot" :style="{ background: item.color }"></i>
                            {{ item.label }}
                          </span>
                          <span class="bank-spend-pct">{{ item.pct }}%</span>
                        </li>
                      </ul>
                    </div>
                  </a-card>
                </a-col>
                <a-col :xs="24" :lg="12">
                  <a-card class="bank-card general-card">
                    <a-typography-title :heading="6" class="bank-section-title">{{ t.reliabilityTitle }}</a-typography-title>
                    <a-typography-text type="secondary" class="bank-section-desc">{{ t.reliabilityDesc }}</a-typography-text>
                    <div class="bank-reliab-body">
                      <div class="bank-reliab-block">
                        <p class="bank-reliab-title">{{ t.reliabilityHigh }}</p>
                        <p class="bank-reliab-sub">{{ t.reliabilityBased }}</p>
                      </div>
                      <div class="bank-reliab-block">
                        <div class="bank-reliab-row">
                          <div>
                            <p class="bank-reliab-title">{{ t.fixedIncome }}</p>
                            <p class="bank-reliab-sub">{{ t.fixedIncomeSub }}</p>
                          </div>
                          <p class="bank-reliab-amount">{{ fixedIncome }}</p>
                        </div>
                      </div>
                      <div class="bank-reliab-block">
                        <div class="bank-reliab-row">
                          <div>
                            <p class="bank-reliab-title">{{ t.variableIncome }}</p>
                            <p class="bank-reliab-sub">{{ t.variableIncomeSub }}</p>
                          </div>
                          <p class="bank-reliab-amount">{{ variableIncome }}</p>
                        </div>
                      </div>
                      <p class="bank-reliab-foot">
                        {{ t.consistencyTrend }}<strong> {{ t.stable }}</strong>
                      </p>
                    </div>
                  </a-card>
                </a-col>
              </a-row>
            </div>

            <a-card class="bank-card general-card">
              <div class="bank-cards-head">
                <a-typography-title :heading="6" class="bank-section-title">{{ t.myCards }}</a-typography-title>
                <a-typography-text type="secondary" class="bank-section-desc">{{ t.myCardsDesc }}</a-typography-text>
              </div>

              <div class="bank-plastic-wrap">
                <div class="bank-plastic">
                  <div>
                    <i class="fa-brands fa-apple bank-plastic-brand" aria-hidden="true"></i>
                  </div>
                  <p class="bank-plastic-number">•••• •••• •••• 2301</p>
                  <div class="bank-plastic-bottom">
                    <div>
                      <p class="bank-plastic-name">{{ t.cardHolder }}</p>
                      <div class="bank-plastic-meta">
                        <div>
                          <p class="bank-plastic-meta-label">{{ t.validThru }}</p>
                          <p class="bank-plastic-meta-value">06/30</p>
                        </div>
                        <div>
                          <p class="bank-plastic-meta-label">{{ t.cvv }}</p>
                          <p class="bank-plastic-meta-value">•••</p>
                        </div>
                      </div>
                    </div>
                    <i class="fa-brands fa-cc-mastercard bank-plastic-mc" aria-hidden="true"></i>
                  </div>
                </div>
              </div>

              <div class="bank-card-meta">
                <div class="bank-card-meta-row">
                  <span class="bank-card-meta-label">{{ t.cardType }}</span>
                  <span class="bank-card-meta-value">{{ t.cardTypeValue }}</span>
                </div>
                <div class="bank-card-meta-row">
                  <span class="bank-card-meta-label">{{ t.billingCycle }}</span>
                  <span class="bank-card-meta-value">{{ t.billingCycleValue }}</span>
                </div>
                <div class="bank-card-meta-row">
                  <span class="bank-card-meta-label">{{ t.creditLimit }}</span>
                  <span class="bank-card-meta-value">{{ creditLimit }}</span>
                </div>
                <div class="bank-card-meta-row">
                  <span class="bank-card-meta-label">{{ t.availableCredit }}</span>
                  <span class="bank-card-meta-value">{{ availableCredit }}</span>
                </div>
              </div>

              <div class="bank-card-actions">
                <a-button type="primary" size="small" long @click="onTip(t.manageCard)">{{ t.manageCard }}</a-button>
                <a-button size="small" long @click="onTip(t.addCard)">{{ t.addCard }}</a-button>
              </div>

              <div class="bank-upcoming">
                <a-divider />
                <h6 class="bank-upcoming-title">{{ t.upcoming }}</h6>
                <ul class="bank-upcoming-list">
                  <li v-for="item in upcomingPayments" :key="item.id" class="bank-upcoming-item">
                    <span class="bank-upcoming-icon">
                      <i class="pro-fa-icon fa-sharp fa-light" :class="item.icon"></i>
                    </span>
                    <div class="bank-upcoming-body">
                      <div>
                        <p class="bank-upcoming-name">{{ item.title }}</p>
                        <p class="bank-upcoming-date">{{ item.date }}</p>
                      </div>
                      <span class="bank-upcoming-amount">{{ formatCurrency(item.amount, { noDecimals: true }) }}</span>
                    </div>
                  </li>
                </ul>
                <a-button size="small" long @click="onTip(t.viewAllPayments)">{{ t.viewAllPayments }}</a-button>
              </div>
            </a-card>
          </div>
        </template>

        <div v-else class="bank-placeholder">{{ placeholderText }}</div>
      </div>
    `,
  }

  mountProPage({
    pageKey: 'dashboard/banking',
    title: t.pageTitle,
    pageComponent: BankingPage,
  })
})()
