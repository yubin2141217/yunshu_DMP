;(function () {
  const t = {
    pageTitle: '财务管理',
    tabOverview: '概览',
    tabAccounts: '账户',
    tabTransactions: '交易',
    updatedJustNow: '刚刚更新',
    updatedMinutesAgo: '{n} 分钟前更新',
    updatedHoursAgo: '{n} 小时前更新',
    updatedDaysAgo: '{n} 天前更新',
    refreshTip: '数据已刷新（原型演示）',
    settings: '设置',
    export: '导出',
    accountsSoon: '账户视图即将上线',
    transactionsSoon: '交易视图即将上线',
    incomeTitle: '收入来源',
    noticeTitle: '信用评分已更新',
    noticeDesc: '您的评分上升 14 分，当前为 782 分。',
    viewDetail: '查看详情',
    txOverview: '收支概览',
    rangeWeekly: '按周',
    rangeMonthly: '按月',
    rangeYearly: '按年',
    expense: '支出',
    income: '收入',
    balanceTitle: '账户分配',
    currencyCny: '人民币余额',
    currencyUsd: '美元余额',
    currencyEur: '欧元余额',
    total: '合计',
    wallet: '钱包',
    hardwareWallet: '硬件钱包：',
    offline: '离线存储',
    billsTitle: '待付账单',
    billsMeta: '本月还有',
    billsMetaUnit: '笔待付',
    autoDebit: '自动扣款将于今日处理',
    quickTransfer: '快捷转账',
    quickEntries: '快捷入口',
    send: '发送',
    amountPh: '0.00',
  }

  const WEEKDAY_SHORT = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

  function addDays(base, days) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 0, 0, 0)
    d.setDate(d.getDate() + days)
    return d
  }

  function pad2(n) {
    return String(n).padStart(2, '0')
  }

  function formatBillDate(date) {
    return `${pad2(date.getHours())}:${pad2(date.getMinutes())} · ${date.getMonth() + 1}月${date.getDate()}日`
  }

  function formatCurrency(n, opts) {
    const options = opts || {}
    const currency = options.currency || 'CNY'
    const noDecimals = !!options.noDecimals
    const abs = Math.abs(Number(n) || 0)
    const formatted = noDecimals
      ? Math.round(abs).toLocaleString('zh-CN')
      : abs.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const sign = n < 0 ? '-' : ''
    const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '¥'
    return `${sign}${symbol}${formatted}`
  }

  const kpiItems = [
    {
      title: '净资产',
      value: '¥128,400',
      subtext: '较上月 +¥9,800',
      badge: '+8.4%',
      up: true,
    },
    {
      title: '可用现金',
      value: '¥12,800',
      subtext: '高于 30 日均值 ¥410',
      badge: '+3.2%',
      up: true,
    },
    {
      title: '月度支出',
      value: '¥2,140',
      subtext: '较上月多 ¥124',
      badge: '+6.1%',
      up: false,
    },
    {
      title: '储蓄率',
      value: '28%',
      subtext: '上月为 25.6%',
      badge: '+2.4%',
      up: true,
    },
  ]

  const incomeSources = [
    { label: '主业薪资 · 68%', value: '¥4,560', barClass: '' },
    { label: '自由职业 · 21%', value: '¥1,412', barClass: 'fin-income-bar--mid' },
    { label: '股息与利息 · 11%', value: '¥765', barClass: 'fin-income-bar--low' },
  ]

  // 收支概览：双序列均给连续数值，避免 null→0 造成「掉零」尖刺
  const chartRaw = [
    { date: '2026-01-05T02:00:00Z', expense: 28, income: 42 },
    { date: '2026-01-05T08:00:00Z', expense: 34, income: 46 },
    { date: '2026-01-05T14:00:00Z', expense: 31, income: 40 },
    { date: '2026-01-05T20:00:00Z', expense: 38, income: 48 },
    { date: '2026-01-06T02:00:00Z', expense: 36, income: 44 },
    { date: '2026-01-06T08:00:00Z', expense: 48, income: 52 },
    { date: '2026-01-06T14:00:00Z', expense: 41, income: 49 },
    { date: '2026-01-06T20:00:00Z', expense: 45, income: 55 },
    { date: '2026-01-07T02:00:00Z', expense: 33, income: 47 },
    { date: '2026-01-07T08:00:00Z', expense: 42, income: 51 },
    { date: '2026-01-07T14:00:00Z', expense: 50, income: 58 },
    { date: '2026-01-07T20:00:00Z', expense: 39, income: 53 },
    { date: '2026-01-08T02:00:00Z', expense: 29, income: 45 },
    { date: '2026-01-08T08:00:00Z', expense: 40, income: 50 },
    { date: '2026-01-08T14:00:00Z', expense: 46, income: 56 },
    { date: '2026-01-08T20:00:00Z', expense: 52, income: 61 },
    { date: '2026-01-09T02:00:00Z', expense: 37, income: 48 },
    { date: '2026-01-09T08:00:00Z', expense: 49, income: 57 },
    { date: '2026-01-09T14:00:00Z', expense: 55, income: 64 },
    { date: '2026-01-09T20:00:00Z', expense: 58, income: 62 },
    { date: '2026-01-10T02:00:00Z', expense: 35, income: 46 },
    { date: '2026-01-10T08:00:00Z', expense: 44, income: 54 },
    { date: '2026-01-10T14:00:00Z', expense: 41, income: 59 },
    { date: '2026-01-10T20:00:00Z', expense: 36, income: 52 },
    { date: '2026-01-11T02:00:00Z', expense: 32, income: 43 },
    { date: '2026-01-11T08:00:00Z', expense: 47, income: 55 },
    { date: '2026-01-11T14:00:00Z', expense: 54, income: 63 },
    { date: '2026-01-11T20:00:00Z', expense: 43, income: 58 },
  ]

  const txChartData = chartRaw.map((item) => {
    const d = new Date(Date.parse(item.date))
    return {
      label: WEEKDAY_SHORT[d.getUTCDay()],
      expense: item.expense,
      income: item.income,
    }
  })

  const balanceData = [
    { account: '主钱包', amount: 122540, key: 'main', percentage: 52.2, color: 'var(--chart-1)' },
    { account: '储蓄账户', amount: 48320, key: 'savings', percentage: 20.6, color: 'var(--chart-2)' },
    { account: '投资账户', amount: 36780, key: 'investment', percentage: 15.7, color: 'var(--chart-3)' },
    { account: '备用金', amount: 27256, key: 'reserve', percentage: 11.5, color: 'var(--chart-4)' },
  ]

  const totalBalance = balanceData.reduce((sum, item) => sum + item.amount, 0)

  const walletCards = [
    { id: 1, bank: '招商银行', last4: '4182', balance: '¥12,450.60', icon: 'fa-building-columns' },
    { id: 2, bank: '中国工商银行', last4: '1004', balance: '¥3,200.11', icon: 'fa-building-columns' },
    { id: 4, bank: '中信银行', last4: '9912', balance: '¥1,450.00', icon: 'fa-building-columns' },
  ]

  const cryptoAssets = [
    {
      id: 1,
      name: '比特币',
      vault: '币安',
      balance: '0.42 比特币',
      usdValue: '¥24,150.00',
      iconClass: 'fa-brands fa-bitcoin',
    },
    {
      id: 2,
      name: '以太坊',
      vault: '小狐狸钱包',
      balance: '4.85 以太坊',
      usdValue: '¥12,420.10',
      iconClass: 'fa-brands fa-ethereum',
    },
  ]

  const now = new Date()

  function billAt(offsetDays, hours, minutes) {
    const d = addDays(now, offsetDays)
    d.setHours(hours, minutes, 0, 0)
    return formatBillDate(d)
  }

  const upcomingBills = [
    { id: 1, title: '智能助手专业版订阅', date: billAt(2, 14, 45), icon: 'fa-robot' },
    { id: 2, title: '邮件服务团队版', date: billAt(4, 7, 0), icon: 'fa-envelope' },
    { id: 3, title: '项目管理 Plus 套餐', date: billAt(10, 7, 0), icon: 'fa-diagram-project' },
  ]

  const contacts = [
    { id: 1, name: '王芳', initial: '王' },
    { id: 2, name: '李娜', initial: '李' },
    { id: 3, name: '张伟', initial: '张' },
    { id: 4, name: '陈静', initial: '陈' },
  ]

  const shortcuts = [
    { id: 1, label: '扫码', icon: 'fa-qrcode' },
    { id: 2, label: '转账', icon: 'fa-paper-plane' },
    { id: 3, label: '缴费', icon: 'fa-money-bill' },
    { id: 4, label: '记录', icon: 'fa-clock-rotate-left' },
    { id: 5, label: '话费', icon: 'fa-mobile-screen-button' },
    { id: 6, label: '电费', icon: 'fa-lightbulb' },
    { id: 7, label: '水费', icon: 'fa-droplet' },
    { id: 8, label: '更多', icon: 'fa-ellipsis' },
  ]

  const txLegend = [
    { key: 'income', label: t.income, color: 'var(--chart-1)' },
    { key: 'expense', label: t.expense, color: 'var(--chart-2)' },
  ]

  const FinancePage = {
    name: 'FinanceDashboardPage',
    data() {
      return {
        t,
        activeTab: 'overview',
        txRange: 'weekly',
        currency: 'CNY',
        transferAmount: '',
        kpiItems,
        incomeSources,
        balanceData,
        totalBalance,
        walletCards,
        cryptoAssets,
        upcomingBills,
        contacts,
        shortcuts,
        txLegend,
        refreshing: false,
        lastUpdatedAt: Date.now(),
        nowTick: Date.now(),
      }
    },
    computed: {
      updatedAgoText() {
        const diffMs = Math.max(0, this.nowTick - this.lastUpdatedAt)
        const mins = Math.floor(diffMs / 60000)
        if (mins < 1) return t.updatedJustNow
        if (mins < 60) return t.updatedMinutesAgo.replace('{n}', String(mins))
        const hours = Math.floor(mins / 60)
        if (hours < 24) return t.updatedHoursAgo.replace('{n}', String(hours))
        const days = Math.floor(hours / 24)
        return t.updatedDaysAgo.replace('{n}', String(days))
      },
    },
    methods: {
      formatCurrency,
      onTip(msg) {
        ArcoVue.Message.info(msg)
      },
      tickUpdatedAgo() {
        this.nowTick = Date.now()
      },
      initCharts() {
        if (!window.ProShadcnCharts) return
        if (this.$refs.txChart) {
          this._txChart = ProShadcnCharts.mountAreaChart(this.$refs.txChart, {
            data: txChartData,
            height: 280,
            x: (d) => d.label,
            xLabel: (d) => d.label,
            stacked: false,
            curveType: 'monotoneX',
            lineWidth: 2,
            series: [
              { key: 'income', label: t.income, color: 'var(--chart-1)', opacity: 0.22 },
              { key: 'expense', label: t.expense, color: 'var(--chart-2)', opacity: 0.16 },
            ],
            // 关闭 autoMargin；left 留给纵轴刻度（见 charts.md）
            margin: { top: 6, bottom: 22, right: 8, left: 28 },
            autoMargin: false,
          })
        }
        if (this.$refs.balanceChart) {
          this._balanceChart = ProShadcnCharts.mountDonutChart(this.$refs.balanceChart, {
            data: balanceData.map((item) => ({
              label: item.account,
              value: item.amount,
            })),
            // 尺寸对齐工作台渠道圆环（dashboard.html）
            height: 200,
            radius: 100,
            arcWidth: 28,
            padAngle: 0,
            centralLabel: formatCurrency(totalBalance, { currency: this.currency, noDecimals: true }),
            centralSubLabel: t.total,
            colors: balanceData.map((item) => item.color),
          })
        }
      },
      destroyCharts() {
        if (!window.ProShadcnCharts) return
        ProShadcnCharts.destroy(this._txChart)
        ProShadcnCharts.destroy(this._balanceChart)
        this._txChart = null
        this._balanceChart = null
      },
      refreshCharts() {
        this.destroyCharts()
        this.$nextTick(() => this.initCharts())
      },
      onRefresh() {
        if (this.refreshing) return
        this.refreshing = true
        this.lastUpdatedAt = Date.now()
        this.nowTick = Date.now()
        if (this.activeTab === 'overview') this.refreshCharts()
        ArcoVue.Message.success(t.refreshTip)
        window.setTimeout(() => {
          this.refreshing = false
        }, 600)
      },
    },
    watch: {
      activeTab(val) {
        if (val === 'overview') this.refreshCharts()
        else this.destroyCharts()
      },
      currency() {
        if (this.activeTab === 'overview') this.refreshCharts()
      },
      txRange() {
        if (this.activeTab === 'overview') this.refreshCharts()
      },
    },
    mounted() {
      this.$nextTick(() => this.initCharts())
      this._updatedTimer = window.setInterval(() => this.tickUpdatedAgo(), 30000)
    },
    beforeUnmount() {
      this.destroyCharts()
      if (this._updatedTimer) {
        window.clearInterval(this._updatedTimer)
        this._updatedTimer = null
      }
    },
    template: `
      <div class="fin-page">
        <div class="fin-tabs-bar">
          <a-tabs
            v-model:active-key="activeTab"
            type="rounded"
            size="medium"
            class="fin-tabs"
            :header-padding="false"
          >
            <a-tab-pane key="overview" :title="t.tabOverview" />
            <a-tab-pane key="accounts" :title="t.tabAccounts" />
            <a-tab-pane key="transactions" :title="t.tabTransactions" />
          </a-tabs>
          <div class="fin-toolbar">
            <button
              type="button"
              class="fin-updated"
              :class="{ 'pro-refresh-spinning': refreshing }"
              :aria-label="updatedAgoText"
              :disabled="refreshing"
              @click="onRefresh"
            >
              <icon-refresh />
              <span>{{ updatedAgoText }}</span>
            </button>
            <a-button size="small" @click="onTip(t.settings)">
              <template #icon><icon-settings /></template>
              {{ t.settings }}
            </a-button>
            <a-button size="small" @click="onTip(t.export)">
              <template #icon><icon-download /></template>
              {{ t.export }}
            </a-button>
          </div>
        </div>

        <template v-if="activeTab === 'overview'">
          <a-row :gutter="[16, 16]" align="stretch">
            <a-col :xs="24" :xl="12">
              <div class="fin-kpi-grid">
                <div v-for="item in kpiItems" :key="item.title" class="fin-kpi-cell">
                  <div class="fin-kpi-head">
                    <span class="fin-kpi-title">{{ item.title }}</span>
                    <span class="fin-badge" :class="item.up ? 'fin-badge--up' : 'fin-badge--down'">{{ item.badge }}</span>
                  </div>
                  <div class="fin-kpi-body">
                    <div class="fin-kpi-value">{{ item.value }}</div>
                    <p class="fin-kpi-sub">{{ item.subtext }}</p>
                  </div>
                </div>
              </div>
            </a-col>
            <a-col :xs="24" :xl="12">
              <div class="fin-stack">
                <a-card class="fin-card fin-card--income general-card">
                  <a-typography-title :heading="6" class="fin-section-title">{{ t.incomeTitle }}</a-typography-title>
                  <div class="fin-income-grid">
                    <section v-for="(src, idx) in incomeSources" :key="idx" class="fin-income-item">
                      <div class="fin-income-rail"></div>
                      <div class="fin-income-body">
                        <div>
                          <p class="fin-income-label">{{ src.label }}</p>
                          <div class="fin-income-value">{{ src.value }}</div>
                        </div>
                        <div class="fin-income-bar" :class="src.barClass"></div>
                      </div>
                    </section>
                  </div>
                </a-card>
                <div class="fin-notice">
                  <div class="fin-notice-icon"><icon-trending-up /></div>
                  <div class="fin-notice-body">
                    <p class="fin-notice-title">{{ t.noticeTitle }}</p>
                    <p class="fin-notice-desc">{{ t.noticeDesc }}</p>
                  </div>
                  <div class="fin-notice-action">
                    <a-button size="small" @click="onTip(t.viewDetail)">{{ t.viewDetail }}</a-button>
                  </div>
                </div>
              </div>
            </a-col>
          </a-row>

          <a-row class="fin-equal-row" :gutter="[16, 16]">
            <a-col :xs="24" :lg="12">
              <a-card class="fin-card general-card">
                <div class="fin-section-head">
                  <a-typography-title :heading="6" class="fin-section-title">{{ t.txOverview }}</a-typography-title>
                  <a-select v-model="txRange" size="small" :style="{ width: '112px' }">
                    <a-option value="weekly">{{ t.rangeWeekly }}</a-option>
                    <a-option value="monthly">{{ t.rangeMonthly }}</a-option>
                    <a-option value="yearly">{{ t.rangeYearly }}</a-option>
                  </a-select>
                </div>
                <div ref="txChart" class="shadcn-chart-host fin-line-chart"></div>
                <div class="shadcn-chart-legend">
                  <span v-for="item in txLegend" :key="item.key" class="shadcn-chart-legend-item">
                    <span class="shadcn-chart-legend-dot" :style="{ '--legend-color': item.color }"></span>{{ item.label }}
                  </span>
                </div>
              </a-card>
            </a-col>
            <a-col :xs="24" :lg="12">
              <a-card class="fin-card fin-balance-card shadcn-donut-card general-card">
                <div class="fin-section-head">
                  <a-typography-title :heading="6" class="fin-section-title">{{ t.balanceTitle }}</a-typography-title>
                  <a-select v-model="currency" size="small" :style="{ width: '144px' }">
                    <a-option value="CNY">{{ t.currencyCny }}</a-option>
                    <a-option value="USD">{{ t.currencyUsd }}</a-option>
                    <a-option value="EUR">{{ t.currencyEur }}</a-option>
                  </a-select>
                </div>
                <div class="shadcn-donut-layout">
                  <div class="shadcn-donut-chart">
                    <div ref="balanceChart" class="shadcn-chart-host shadcn-chart-host--donut shadcn-donut-host"></div>
                  </div>
                  <div class="shadcn-donut-legend-wrap">
                    <ul class="shadcn-donut-legend">
                      <li v-for="item in balanceData" :key="item.key" class="shadcn-donut-legend-item">
                        <div class="shadcn-donut-legend-main">
                          <div class="shadcn-donut-legend-name-row">
                            <i class="shadcn-donut-legend-dot" :style="{ background: item.color }"></i>
                            <span class="shadcn-donut-legend-label">{{ item.account }}</span>
                          </div>
                          <span class="shadcn-donut-legend-value">{{ formatCurrency(item.amount, { currency, noDecimals: true }) }}</span>
                        </div>
                        <span class="shadcn-donut-legend-pct">{{ item.percentage }}%</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </a-card>
            </a-col>
          </a-row>

          <a-row class="fin-bottom-row" :gutter="[16, 16]">
            <a-col :xs="24" :lg="8">
              <a-card class="fin-card fin-card--tall fin-card--wallet general-card">
                <a-typography-title :heading="6" class="fin-section-title">{{ t.wallet }}</a-typography-title>
                <div class="fin-wallet-main">
                  <div class="fin-wallet-list">
                    <div v-for="card in walletCards" :key="card.id" class="fin-wallet-row">
                      <div class="fin-wallet-meta">
                        <span class="fin-wallet-name">{{ card.bank }} · **** {{ card.last4 }}</span>
                        <span class="fin-wallet-sub">{{ card.balance }}</span>
                      </div>
                      <div class="fin-wallet-icon">
                        <i class="pro-fa-icon fa-sharp fa-light" :class="card.icon"></i>
                      </div>
                    </div>
                  </div>
                  <hr class="fin-divider" />
                  <div class="fin-crypto-list">
                    <div v-for="asset in cryptoAssets" :key="asset.id" class="fin-wallet-row">
                      <div class="fin-wallet-meta">
                        <span class="fin-wallet-name">{{ asset.name }} · {{ asset.vault }}</span>
                        <span class="fin-wallet-sub">{{ asset.balance }} · {{ asset.usdValue }}</span>
                      </div>
                      <div class="fin-wallet-icon">
                        <i :class="asset.iconClass" aria-hidden="true"></i>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="fin-wallet-foot">
                  <span class="fin-wallet-device">{{ t.hardwareWallet }}<strong>冷钱包 Nano X</strong></span>
                  <span class="fin-wallet-status"><i></i>{{ t.offline }}</span>
                </div>
              </a-card>
            </a-col>

            <a-col :xs="24" :lg="8">
              <a-card class="fin-card fin-card--tall fin-card--bills general-card">
                <a-typography-title :heading="6" class="fin-section-title">{{ t.billsTitle }}</a-typography-title>
                <div class="fin-bills-main">
                  <div class="fin-bill-total">¥1,245<span>.00</span></div>
                  <p class="fin-bill-meta">{{ t.billsMeta }} <strong>3</strong> {{ t.billsMetaUnit }}</p>
                  <div class="fin-bill-alert">
                    <i class="pro-fa-icon fa-sharp fa-light fa-bolt"></i>
                    <span>{{ t.autoDebit }} <strong>¥145.00</strong></span>
                  </div>
                  <div class="fin-bill-list">
                    <div
                      v-for="bill in upcomingBills"
                      :key="bill.id"
                      class="fin-bill-item"
                      @click="onTip(bill.title)"
                    >
                      <div class="fin-bill-icon">
                        <i class="pro-fa-icon fa-sharp fa-light" :class="bill.icon"></i>
                      </div>
                      <div class="fin-bill-body">
                        <p class="fin-bill-name">{{ bill.title }}</p>
                        <p class="fin-bill-date">{{ bill.date }}</p>
                      </div>
                      <icon-right class="fin-bill-chevron" />
                    </div>
                  </div>
                </div>
              </a-card>
            </a-col>

            <a-col :xs="24" :lg="8">
              <div class="fin-quick-col">
                <a-card class="fin-card fin-card--transfer general-card">
                  <div class="fin-transfer-head">
                    <a-typography-title :heading="6" class="fin-section-title">{{ t.quickTransfer }}</a-typography-title>
                    <button type="button" class="fin-avatars" @click="onTip(t.quickTransfer)">
                      <div class="fin-avatars-stack">
                        <a-avatar
                          v-for="c in contacts"
                          :key="c.id"
                          :size="28"
                          class="pro-avatar-brand"
                        >{{ c.initial }}</a-avatar>
                      </div>
                      <icon-right class="fin-avatars-more" />
                    </button>
                  </div>
                  <div class="fin-transfer-row">
                    <div class="fin-amount-box">
                      <span class="fin-amount-prefix">¥</span>
                      <a-input v-model="transferAmount" :placeholder="t.amountPh" />
                      <span class="fin-amount-suffix">人民币</span>
                    </div>
                    <a-button type="primary" class="fin-transfer-send" @click="onTip(t.send)">{{ t.send }}</a-button>
                  </div>
                </a-card>

                <a-card class="fin-card fin-card--shortcuts general-card">
                  <a-typography-title :heading="6" class="fin-section-title">{{ t.quickEntries }}</a-typography-title>
                  <div class="fin-shortcuts">
                    <div
                      v-for="item in shortcuts"
                      :key="item.id"
                      class="fin-shortcut"
                      @click="onTip(item.label)"
                    >
                      <a-button class="fin-shortcut-btn">
                        <i class="pro-fa-icon fa-sharp fa-light" :class="item.icon"></i>
                      </a-button>
                      <span class="fin-shortcut-label">{{ item.label }}</span>
                    </div>
                  </div>
                </a-card>
              </div>
            </a-col>
          </a-row>
        </template>

        <div v-else-if="activeTab === 'accounts'" class="fin-placeholder">{{ t.accountsSoon }}</div>
        <div v-else class="fin-placeholder">{{ t.transactionsSoon }}</div>
      </div>
    `,
  }

  mountProPage({
    pageKey: 'dashboard/finance',
    title: t.pageTitle,
    pageComponent: FinancePage,
  })
})()
