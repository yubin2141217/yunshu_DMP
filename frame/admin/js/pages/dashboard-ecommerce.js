;(function () {
  /* Locale strings — parent may move to ArcoProLocale.ecommerce */
  const t = {
    pageTitle: '电商运营',
    settingsAria: '仪表盘设置',
    periodThisMonth: '本月',
    periodLastMonth: '上月',
    period30d: '近 30 天',
    periodYtd: '年初至今',
    channelAll: '全部渠道',
    channelOnline: '在线商城',
    channelMarketplace: '第三方平台',
    channelSocial: '社交媒体',
    channelRetail: '线下零售',
    kpiSales: '总销售额',
    kpiSalesCompare: '与上周相比增长',
    kpiOrders: '订单总数',
    kpiOrdersCompare: '与上周相比增长',
    kpiCustomers: '客户增长',
    kpiCustomersCompare: '与上月相比增长',
    kpiAov: '客单价',
    kpiAovCompare: '与上周相比下降',
    kpiReturns: '退货申请',
    kpiReturnsCompare: '与上月相比上升',
    kpiInventory: '库存准确率',
    kpiInventoryCompare: '与上次盘点相比提升',
    salesOverview: '销售概览',
    seriesRevenue: '收入',
    seriesProfit: '利润',
    salesTotalRevenue: '期间收入',
    salesTotalProfit: '期间利润',
    salesMargin: '利润率',
    salesPeak: '峰值区间',
    storeTraffic: '店铺流量',
    storeTrafficValue: '1.29 万次访问',
    trafficPeak: '峰值时段',
    trafficPeakValue: '昨日 20:00 · 620 次',
    trafficAvg: '平均访问',
    trafficAvgValue: '142 次 / 15 分钟',
    visitors: '访客',
    anomalies: '异常流量',
    traffic24h: '24 小时前',
    trafficNow: '现在',
    trafficSources: '流量来源',
    trafficSourcesValue: '1.60 万次访问',
    visitsUnit: '次',
    sourceTopTip: '主渠道贡献',
    sourceTopDesc: '脸书占比 35%，转化率高于均值 4.2 个百分点',
    topProducts: '热销商品',
    topProductsValue: '占销售额 73%',
    colProduct: '商品',
    colShare: '占比',
    colSales: '销售额',
    productsFooter: '共 {n} 款热销商品',
    viewAllProducts: '查看全部',
    inventory: '库存状态',
    inventoryValue: '{pct}% 可售',
    inventoryCentral: '可售库存',
    inStock: '有库存',
    lowStock: '低库存',
    outOfStock: '缺货',
    reviews: '客户评价',
    reviewsValue: '平均 4.6 分',
    reviewPrev: '上一条评价',
    reviewNext: '下一条评价',
    reviewSummaryTitle: '本月 1.28 万条评价',
    reviewSummaryDesc: '客户在本月提交了商品评价',
    reviewDist: '评分分布',
    reviewPositive: '好评率',
    recentOrders: '近期订单',
    openOrders: '打开订单',
    exportOrders: '导出订单',
    moreActions: '更多操作',
    sortByDate: '按时间排序',
    filterAll: '全部',
    filterNeedsAction: '待处理',
    filterUnfulfilled: '未发货',
    filterUnpaid: '未付款',
    filterReturns: '退货',
    colOrder: '订单',
    colCustomer: '客户姓名',
    colStatus: '状态',
    colTotal: '金额',
    colDate: '时间',
    colActions: '操作',
    payPaid: '已付款',
    payPending: '待付款',
    payRefunded: '已退款',
    fulFulfilled: '已发货',
    fulReturned: '已退货',
    fulUnfulfilled: '未发货',
    emptyOrders: '暂无订单',
    showing: '显示',
    orderUnit: '笔订单',
    orderCountAll: '{n} 笔订单',
    orderCountNeeds: '{n} 笔待处理订单',
    orderCountReturns: '{n} 笔退货',
    orderCountLabel: '{n} 笔{label}订单',
    selectedCount: '已选 {n} 笔',
    viewOrder: '查看订单',
    contactCustomer: '联系客户',
    copyOrderId: '复制订单号',
    orderActions: '订单操作',
    settingsTip: '仪表盘设置（演示）',
    exportTip: '已触发导出（演示）',
    refresh: '刷新',
    refreshTip: '数据已刷新（原型演示）',
  }

  const PAYMENT_LABELS = {
    Paid: t.payPaid,
    Pending: t.payPending,
    Refunded: t.payRefunded,
  }

  const FULFILLMENT_LABELS = {
    Fulfilled: t.fulFulfilled,
    Returned: t.fulReturned,
    Unfulfilled: t.fulUnfulfilled,
  }

  const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

  function hash01(seed) {
    const x = Math.sin((seed + 1) * 12.9898) * 43758.5453
    return x - Math.floor(x)
  }

  function withJitter(n, seed, amp = 0.07) {
    const base = Number(n) || 0
    return Math.max(0, Math.round(base * (1 + (hash01(seed) - 0.5) * 2 * amp)))
  }

  /* 近约 100 日密集序列：折线收入 + 底部利润柱（同轴，利润始终 < 收入） */
  function buildRevenueOverviewData(nonce = 0) {
    const days = 100
    const end = new Date()
    end.setHours(0, 0, 0, 0)
    const rows = []
    for (let i = 0; i < days; i++) {
      const d = new Date(end)
      d.setDate(end.getDate() - (days - 1 - i))
      const t = i / (days - 1)
      const wave =
        Math.sin(i * 1.85 + nonce * 0.35) * 620 +
        Math.cos(i * 0.73 + nonce * 0.2) * 410 +
        Math.sin(i * 0.31) * 280 +
        ((i * 47 + nonce * 13) % 860) -
        430
      const revenue = Math.max(900, Math.round(3800 + t * 5200 + wave))
      // 利润率约 48%–68%，并叠加独立起伏；硬夹不超过收入的 88%
      const marginRate =
        0.56 +
        0.08 * Math.sin(i * 0.21 + nonce * 0.3) +
        0.05 * Math.cos(i * 0.87) +
        (((i * 17 + nonce * 5) % 100) / 100 - 0.5) * 0.06
      const profitNoise =
        Math.sin(i * 0.55 + nonce * 0.4) * 320 +
        Math.cos(i * 1.2) * 180 +
        ((i * 41 + nonce * 9) % 280) -
        140
      const profit = Math.max(
        320,
        Math.min(Math.round(revenue * 0.88), Math.round(revenue * marginRate + profitNoise))
      )
      const month = d.getMonth() + 1
      const day = d.getDate()
      rows.push({
        i,
        period: `${d.getFullYear()}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        monthTick: `${month}/${day}`,
        tooltipLabel: `${d.getFullYear()}年${month}月${day}日`,
        year: d.getFullYear(),
        month,
        day,
        revenue,
        profit,
      })
    }
    return rows
  }

  function salesXTickValues(data) {
    const n = (data || []).length
    if (n <= 1) return [0]
    const step = Math.max(1, Math.round((n - 1) / 5))
    const ticks = []
    for (let i = 0; i < n; i += step) ticks.push(i)
    if (ticks[ticks.length - 1] !== n - 1) ticks.push(n - 1)
    return ticks
  }

  function formatAxisWan(v) {
    const n = Number(v) || 0
    if (n >= 10000) {
      const wan = n / 10000
      const text = wan >= 10 ? wan.toFixed(0) : wan.toFixed(1).replace(/\.0$/, '')
      return `${text}万`
    }
    if (n >= 1000) return `${Math.round(n / 1000)}k`
    return String(Math.round(n))
  }

  const trafficPoints = [
    { visitors: 280, anomalies: 8 },
    { visitors: 420, anomalies: 4 },
    { visitors: 360, anomalies: 3 },
    { visitors: 140, anomalies: 2 },
    { visitors: 80, anomalies: 1 },
    { visitors: 600, anomalies: 4 },
    { visitors: 260, anomalies: 3 },
    { visitors: 70, anomalies: 2 },
    { visitors: 90, anomalies: 1 },
    { visitors: 180, anomalies: 4 },
    { visitors: 150, anomalies: 3 },
    { visitors: 60, anomalies: 2 },
    { visitors: 430, anomalies: 1 },
    { visitors: 110, anomalies: 4 },
    { visitors: 260, anomalies: 3 },
    { visitors: 120, anomalies: 2 },
    { visitors: 90, anomalies: 1 },
    { visitors: 40, anomalies: 8 },
    { visitors: 75, anomalies: 3 },
    { visitors: 0, anomalies: 2 },
    { visitors: 15, anomalies: 1 },
    { visitors: 35, anomalies: 4 },
    { visitors: 60, anomalies: 3 },
    { visitors: 95, anomalies: 2 },
    { visitors: 105, anomalies: 1 },
    { visitors: 120, anomalies: 4 },
    { visitors: 0, anomalies: 3 },
    { visitors: 25, anomalies: 2 },
    { visitors: 70, anomalies: 1 },
    { visitors: 110, anomalies: 4 },
    { visitors: 0, anomalies: 3 },
    { visitors: 140, anomalies: 2 },
    { visitors: 310, anomalies: 1 },
    { visitors: 120, anomalies: 4 },
    { visitors: 160, anomalies: 8 },
    { visitors: 30, anomalies: 2 },
    { visitors: 20, anomalies: 1 },
    { visitors: 0, anomalies: 4 },
    { visitors: 120, anomalies: 3 },
    { visitors: 210, anomalies: 2 },
    { visitors: 110, anomalies: 1 },
    { visitors: 190, anomalies: 4 },
    { visitors: 0, anomalies: 3 },
    { visitors: 85, anomalies: 2 },
    { visitors: 250, anomalies: 1 },
    { visitors: 40, anomalies: 4 },
    { visitors: 110, anomalies: 3 },
    { visitors: 0, anomalies: 2 },
    { visitors: 140, anomalies: 1 },
    { visitors: 95, anomalies: 4 },
    { visitors: 180, anomalies: 3 },
    { visitors: 620, anomalies: 18 },
    { visitors: 35, anomalies: 1 },
    { visitors: 330, anomalies: 4 },
    { visitors: 45, anomalies: 3 },
    { visitors: 0, anomalies: 2 },
    { visitors: 160, anomalies: 1 },
    { visitors: 190, anomalies: 4 },
    { visitors: 260, anomalies: 3 },
    { visitors: 90, anomalies: 2 },
    { visitors: 70, anomalies: 1 },
    { visitors: 180, anomalies: 4 },
    { visitors: 150, anomalies: 3 },
    { visitors: 280, anomalies: 2 },
    { visitors: 160, anomalies: 1 },
    { visitors: 20, anomalies: 4 },
    { visitors: 120, anomalies: 3 },
    { visitors: 200, anomalies: 2 },
    { visitors: 45, anomalies: 8 },
    { visitors: 115, anomalies: 4 },
    { visitors: 145, anomalies: 3 },
    { visitors: 40, anomalies: 2 },
    { visitors: 160, anomalies: 1 },
    { visitors: 170, anomalies: 4 },
    { visitors: 95, anomalies: 3 },
    { visitors: 140, anomalies: 2 },
    { visitors: 70, anomalies: 1 },
    { visitors: 230, anomalies: 4 },
    { visitors: 120, anomalies: 3 },
    { visitors: 65, anomalies: 2 },
    { visitors: 35, anomalies: 1 },
    { visitors: 0, anomalies: 4 },
    { visitors: 80, anomalies: 3 },
    { visitors: 180, anomalies: 2 },
    { visitors: 95, anomalies: 1 },
    { visitors: 140, anomalies: 8 },
    { visitors: 270, anomalies: 3 },
    { visitors: 110, anomalies: 2 },
    { visitors: 50, anomalies: 1 },
    { visitors: 230, anomalies: 18 },
    { visitors: 115, anomalies: 3 },
    { visitors: 80, anomalies: 2 },
    { visitors: 260, anomalies: 1 },
    { visitors: 20, anomalies: 4 },
    { visitors: 120, anomalies: 3 },
    { visitors: 5, anomalies: 2 },
  ]

  function pad2(n) {
    return String(n).padStart(2, '0')
  }

  function buildTrafficData(nonce = 0) {
    const now = Date.now()
    const intervalMs = 15 * 60 * 1000
    return trafficPoints.map((point, index) => {
      const ts = now - (trafficPoints.length - 1 - index) * intervalMs
      const d = new Date(ts)
      const clock = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
      const anomalyBoost = Math.round(
        (Number(point.anomalies) || 0) * 14 + ((index * 11 + nonce * 5) % 36)
      )
      return {
        visitors: withJitter(point.visitors, nonce * 97 + index, 0.1),
        anomalies: Math.max(20, withJitter(anomalyBoost, nonce * 53 + index, 0.12)),
        i: index,
        ts,
        monthTick: clock,
        tooltipLabel: `${d.getMonth() + 1}/${d.getDate()} ${clock}`,
        label:
          index === 0
            ? t.traffic24h
            : index === trafficPoints.length - 1
              ? t.trafficNow
              : clock,
      }
    })
  }

  function trafficXTickValues(data) {
    const n = (data || []).length
    if (n <= 1) return [0]
    const step = Math.max(1, Math.round((n - 1) / 4))
    const ticks = []
    for (let i = 0; i < n; i += step) ticks.push(i)
    if (ticks[ticks.length - 1] !== n - 1) ticks.push(n - 1)
    return ticks
  }

  function formatAxisCount(v) {
    const n = Number(v) || 0
    if (n >= 10000) {
      const wan = n / 10000
      return `${wan >= 10 ? wan.toFixed(0) : wan.toFixed(1).replace(/\.0$/, '')}万`
    }
    return String(Math.round(n))
  }

  function buildTrafficSummary(rows) {
    const trafficData = rows || []
    const total = trafficData.reduce((s, r) => s + (Number(r.visitors) || 0), 0)
    let peak = trafficData[0] || { visitors: 0, ts: Date.now() }
    trafficData.forEach((row) => {
      if (row.visitors > peak.visitors) peak = row
    })
    const avg = trafficData.length ? Math.round(total / trafficData.length) : 0
    const peakDate = new Date(peak.ts)
    const today = new Date()
    const sameDay =
      peakDate.getFullYear() === today.getFullYear() &&
      peakDate.getMonth() === today.getMonth() &&
      peakDate.getDate() === today.getDate()
    const dayTag = sameDay ? '今日' : '昨日'
    const totalText =
      total >= 10000
        ? `${(total / 10000).toFixed(2).replace(/\.?0+$/, '')} 万次访问`
        : `${total.toLocaleString('zh-CN')} 次访问`
    return {
      totalText,
      peakValue: `${dayTag} ${pad2(peakDate.getHours())}:${pad2(peakDate.getMinutes())} · ${peak.visitors} 次`,
      avgValue: `${avg} 次 / 15 分钟`,
    }
  }

  const trafficSources = [
    { name: '脸书', visits: '5,640', share: 35, change: '+18%', up: true },
    { name: '谷歌', visits: '3,740', share: 23, change: '-6%', up: false },
    { name: '品牌商城', visits: '2,960', share: 19, change: '+7%', up: true },
    { name: '抖音', visits: '1,340', share: 8, change: '+9%', up: true },
    { name: '易贝', visits: '1,080', share: 7, change: '-3%', up: false },
    { name: '小红书', visits: '720', share: 5, change: '+22%', up: true },
    { name: '邮件营销', visits: '480', share: 3, change: '+4%', up: true },
  ]

  const categories = [
    { name: '服饰', share: 44, color: 'var(--chart-1)' },
    { name: '配饰', share: 32, color: 'var(--chart-2)' },
    { name: '家居', share: 24, color: 'var(--chart-3)' },
  ]

  const products = [
    { name: '亚麻宽松衬衫', category: '服饰', share: '31%', sales: '¥14,820' },
    { name: '日常托特包', category: '配饰', share: '24%', sales: '¥11,460' },
    { name: '陶瓷花盆', category: '家居', share: '18%', sales: '¥8,930' },
    { name: '羊毛针织开衫', category: '服饰', share: '12%', sales: '¥5,760' },
    { name: '真皮卡夹', category: '配饰', share: '8%', sales: '¥3,840' },
  ]

  /* 有库存/低库存走图表色；缺货用警示色 */
  const inventoryBase = [
    { key: 'in-stock', label: t.inStock, value: 760, color: 'var(--chart-1)' },
    { key: 'low-stock', label: t.lowStock, value: 320, color: 'var(--chart-2)' },
    { key: 'out-of-stock', label: t.outOfStock, value: 160, color: 'rgb(var(--danger-6))' },
  ]

  function buildInventoryData(nonce = 0) {
    return inventoryBase.map((row, i) => ({
      ...row,
      value: withJitter(row.value, nonce * 17 + i * 9, 0.08),
    }))
  }

  function inventoryMeta(rows) {
    const total = rows.reduce((s, r) => s + r.value, 0) || 1
    const availablePercent = Math.round((rows[0].value / total) * 100)
    return {
      inventoryTotal: total,
      availablePercent,
      inventoryValueText: t.inventoryValue.replace('{pct}', String(availablePercent)),
    }
  }

  const reviews = [
    {
      name: '陈美玲',
      text: '亚麻宽松衬衫到货比预期更快，尺码也很合身，整体购物体验非常满意。',
      stars: 5,
    },
    {
      name: '王雅琳',
      text: '托特包日常通勤很好用，容量够大，做工细致，会再回购配饰系列。',
      stars: 5,
    },
    {
      name: '李俊杰',
      text: '陶瓷花盆质感不错，包装也很稳妥，没有磕碰，放在客厅很搭。',
      stars: 4,
    },
  ]

  const ratingDist = [
    { star: 5, pct: 68 },
    { star: 4, pct: 18 },
    { star: 3, pct: 8 },
    { star: 2, pct: 4 },
    { star: 1, pct: 2 },
  ]

  const avatarNames = ['王', '李', '陈', '刘']

  function formatPageDate(d) {
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${WEEKDAYS[d.getDay()]}`
  }

  function formatOrderDate(iso) {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    const pad = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  function formatCurrency(n, noDecimals) {
    const opts = noDecimals
      ? { maximumFractionDigits: 0, minimumFractionDigits: 0 }
      : { maximumFractionDigits: 2, minimumFractionDigits: 0 }
    return `¥${Number(n).toLocaleString('zh-CN', opts)}`
  }

  function buildSalesSummary(rows) {
    const revenueOverviewData = rows || []
    const totalRevenue = revenueOverviewData.reduce((s, r) => s + r.revenue, 0)
    const totalProfit = revenueOverviewData.reduce((s, r) => s + r.profit, 0)
    const margin = totalRevenue ? Math.round((totalProfit / totalRevenue) * 1000) / 10 : 0
    let peak = revenueOverviewData[0] || { revenue: 0, tooltipLabel: '—', period: '—' }
    revenueOverviewData.forEach((row) => {
      if (row.revenue > peak.revenue) peak = row
    })
    return {
      revenue: formatCurrency(totalRevenue, true),
      profit: formatCurrency(totalProfit, true),
      margin: `${margin}%`,
      peak: peak.tooltipLabel || peak.period,
    }
  }

  function buildDashboardSeries(nonce = 0) {
    const revenueSeries = buildRevenueOverviewData(nonce)
    const trafficSeries = buildTrafficData(nonce)
    const inventorySeries = buildInventoryData(nonce)
    const inv = inventoryMeta(inventorySeries)
    return {
      revenueSeries,
      trafficSeries,
      inventorySeries,
      salesSummary: buildSalesSummary(revenueSeries),
      trafficSummary: buildTrafficSummary(trafficSeries),
      availablePercent: inv.availablePercent,
      inventoryValueText: inv.inventoryValueText,
    }
  }

  function matchOrderFilter(row, filter) {
    if (!filter || filter === 'All') return true
    if (filter === 'Needs action') {
      return (
        row.payment === 'Pending' ||
        row.payment === 'Refunded' ||
        row.fulfillment === 'Unfulfilled' ||
        row.fulfillment === 'Returned'
      )
    }
    if (filter === 'Unfulfilled') return row.fulfillment === 'Unfulfilled'
    if (filter === 'Unpaid') return row.payment === 'Pending'
    if (filter === 'Returns') {
      return row.payment === 'Refunded' || row.fulfillment === 'Returned'
    }
    return true
  }

  const EcommercePage = {
    name: 'EcommerceDashboardPage',
    data() {
      const series = buildDashboardSeries(0)
      const allRows = Array.isArray(window.ProEcommerceOrders)
        ? window.ProEcommerceOrders.slice()
        : []
      return {
        t,
        pageDate: formatPageDate(new Date()),
        period: 'this-month',
        channel: 'all-channels',
        refreshNonce: 0,
        refreshing: false,
        chartEpoch: 0,
        meterEpoch: 0,
        revenueSeries: series.revenueSeries,
        trafficSeries: series.trafficSeries,
        inventoryData: series.inventorySeries,
        salesSummary: series.salesSummary,
        trafficSummary: series.trafficSummary,
        availablePercent: series.availablePercent,
        inventoryValueText: series.inventoryValueText,
        kpis: [
          {
            title: t.kpiSales,
            value: formatCurrency(48560),
            icon: 'icon-credit-card',
            compare: t.kpiSalesCompare,
            trend: '15.8%',
            up: true,
          },
          {
            title: t.kpiOrders,
            value: '379',
            icon: 'icon-list',
            compare: t.kpiOrdersCompare,
            trend: '8.3%',
            up: true,
          },
          {
            title: t.kpiCustomers,
            value: '820',
            icon: 'icon-user-group',
            compare: t.kpiCustomersCompare,
            trend: '12.5%',
            up: true,
          },
          {
            title: t.kpiAov,
            value: formatCurrency(128, true),
            icon: 'icon-file',
            compare: t.kpiAovCompare,
            trend: '¥4.20',
            up: false,
          },
          {
            title: t.kpiReturns,
            value: '18',
            icon: 'icon-refresh',
            compare: t.kpiReturnsCompare,
            trend: '0.6%',
            up: false,
          },
          {
            title: t.kpiInventory,
            value: '97%',
            icon: 'icon-check-circle',
            compare: t.kpiInventoryCompare,
            trend: '2.4 个百分点',
            up: true,
          },
        ],
        trafficSources,
        categories,
        products,
        productsFooterText: t.productsFooter.replace('{n}', String(products.length)),
        reviews,
        reviewIndex: 0,
        ratingDist,
        reviewPositivePct: '86%',
        avatarNames,
        allRows,
        orderFilter: 'All',
        dateSortAsc: false,
        selectedKeys: [],
        pagination: { current: 1, pageSize: 10 },
        filterOptions: [
          { value: 'All', label: t.filterAll },
          { value: 'Needs action', label: t.filterNeedsAction },
          { value: 'Unfulfilled', label: t.filterUnfulfilled },
          { value: 'Unpaid', label: t.filterUnpaid },
          { value: 'Returns', label: t.filterReturns },
        ],
        columns: [
          // 客户姓名列仅 minWidth：承接余宽；其余列给足固定宽
          { title: t.colOrder, dataIndex: 'id', width: 160, slotName: 'order' },
          { title: t.colCustomer, dataIndex: 'customer', minWidth: 120, ellipsis: true },
          { title: t.colStatus, dataIndex: 'status', width: 220, slotName: 'status' },
          { title: t.colTotal, dataIndex: 'total', width: 112, align: 'right' },
          { title: t.colDate, dataIndex: 'date', width: 196, slotName: 'date' },
          { title: t.colActions, dataIndex: 'actions', width: 72, slotName: 'actions', align: 'center' },
        ],
      }
    },
    computed: {
      currentReview() {
        return this.reviews[this.reviewIndex] || this.reviews[0]
      },
      filteredRows() {
        const rows = this.allRows.filter((row) => matchOrderFilter(row, this.orderFilter))
        const sorted = rows.slice().sort((a, b) => {
          const da = new Date(a.date).getTime()
          const db = new Date(b.date).getTime()
          return this.dateSortAsc ? da - db : db - da
        })
        return sorted
      },
      pagedRows() {
        const { current, pageSize } = this.pagination
        const start = (current - 1) * pageSize
        return this.filteredRows.slice(start, start + pageSize)
      },
      orderCountDescription() {
        const n = this.filteredRows.length
        const nStr = n.toLocaleString('zh-CN')
        if (this.selectedKeys.length > 0) {
          return t.selectedCount.replace('{n}', String(this.selectedKeys.length))
        }
        if (this.orderFilter === 'All') return t.orderCountAll.replace('{n}', nStr)
        if (this.orderFilter === 'Needs action') return t.orderCountNeeds.replace('{n}', nStr)
        if (this.orderFilter === 'Returns') return t.orderCountReturns.replace('{n}', nStr)
        const label =
          this.filterOptions.find((f) => f.value === this.orderFilter)?.label || this.orderFilter
        return t.orderCountLabel.replace('{n}', nStr).replace('{label}', label)
      },
    },
    watch: {
      orderFilter() {
        this.pagination.current = 1
        this.selectedKeys = []
      },
      dateSortAsc() {
        this.pagination.current = 1
      },
    },
    methods: {
      formatOrderDate,
      paymentLabel(v) {
        return PAYMENT_LABELS[v] || v
      },
      fulfillmentLabel(v) {
        return FULFILLMENT_LABELS[v] || v
      },
      paymentColor(v) {
        if (v === 'Paid') return 'green'
        if (v === 'Refunded') return 'red'
        return 'orangered'
      },
      fulfillmentColor(v) {
        if (v === 'Fulfilled') return 'green'
        return 'red'
      },
      onPageChange(page) {
        this.pagination.current = page
      },
      onSettings() {
        ArcoVue.Message.info(t.settingsTip)
      },
      onExport() {
        ArcoVue.Message.info(t.exportTip)
      },
      onRefresh() {
        if (this.refreshing) return
        this.refreshing = true
        this.releaseCharts()
        this.refreshNonce += 1
        this.chartEpoch += 1
        this.meterEpoch += 1
        const series = buildDashboardSeries(this.refreshNonce)
        this.revenueSeries = series.revenueSeries
        this.trafficSeries = series.trafficSeries
        this.inventoryData = series.inventorySeries
        this.salesSummary = series.salesSummary
        this.trafficSummary = series.trafficSummary
        this.availablePercent = series.availablePercent
        this.inventoryValueText = series.inventoryValueText
        this.$nextTick(() => {
          requestAnimationFrame(() => {
            this.initCharts()
            ArcoVue.Message.success(t.refreshTip)
          })
        })
        window.setTimeout(() => {
          this.refreshing = false
        }, 600)
      },
      releaseCharts() {
        const list = [this._salesChart, this._trafficChart, this._inventoryChart]
        list.forEach((inst) => {
          if (!inst || !window.ProShadcnCharts) return
          if (typeof ProShadcnCharts.release === 'function') ProShadcnCharts.release(inst)
        })
        this._salesChart = null
        this._trafficChart = null
        this._inventoryChart = null
        this._trafficChartHeight = null
        this._inventoryChartHeight = null
      },
      onTip(msg) {
        ArcoVue.Message.info(msg)
      },
      toggleDateSort() {
        this.dateSortAsc = !this.dateSortAsc
      },
      prevReview() {
        this.reviewIndex = (this.reviewIndex - 1 + this.reviews.length) % this.reviews.length
      },
      nextReview() {
        this.reviewIndex = (this.reviewIndex + 1) % this.reviews.length
      },
      initCharts() {
        if (!window.ProShadcnCharts) return

        const revenuePeak = Math.max(...this.revenueSeries.map((d) => Number(d.revenue) || 0), 1)
        const salesYTop = Math.max(1000, Math.ceil((revenuePeak * 1.06) / 1000) * 1000)
        const salesYTicks = [0, 0.25, 0.5, 0.75, 1].map((p) => Math.round(salesYTop * p))
        this._salesChart = ProShadcnCharts.mountComboChart(this.$refs.salesChart, {
          data: this.revenueSeries,
          height: 280,
          x: (d) => d.i,
          xLabel: (d) => d.monthTick,
          tooltipLabel: (d) => d.tooltipLabel,
          xTickValues: salesXTickValues(this.revenueSeries),
          yMinZero: true,
          // 共用 Y 轴：数值与刻度一致，利润柱始终低于收入线
          yDomain: [0, salesYTop],
          yTickValues: salesYTicks,
          yTickFormat: formatAxisWan,
          curveType: 'linear',
          lineWidth: 2,
          barPadding: 0.06,
          groupMaxWidth: 5,
          xDomainPad: 0.4,
          // 图例在右上角：只修底轴，避免 autoMargin 叠空白（见 charts.md）
          autoMargin: false,
          margin: { top: 6, bottom: 22, right: 8 },
          line: {
            key: 'revenue',
            label: t.seriesRevenue,
            color: 'var(--chart-1)',
            lineWidth: 2,
          },
          bar: {
            key: 'profit',
            label: t.seriesProfit,
            color: 'color-mix(in srgb, var(--chart-1) 28%, transparent)',
            roundedCorners: 1,
          },
        })

        const trafficH = this.measureChartHeight(this.$refs.trafficChart, 260)
        const invH = this.measureChartHeight(this.$refs.inventoryChart, 180)
        this.mountTrafficChart(trafficH)
        this.mountInventoryChart(invH)
        this._trafficChartHeight = trafficH
        this._inventoryChartHeight = invH
      },
      measureChartHeight(el, minH) {
        if (!el) return minH
        el.style.height = 'auto'
        el.style.minHeight = minH + 'px'
        el.style.flex = '1 1 auto'
        el.style.maxHeight = 'none'
        const h = Math.round(el.getBoundingClientRect().height)
        return Math.max(minH, h || minH)
      },
      mountInventoryChart(height) {
        if (!window.ProShadcnCharts || !this.$refs.inventoryChart) return
        const h = Math.max(180, Math.round(height))
        const radius = Math.round(Math.min(h * 0.42, h / 2 - 10))
        const arcWidth = Math.max(16, Math.round(radius * 0.24))
        const total = this.inventoryData.reduce((s, r) => s + r.value, 0) || 1
        this._inventoryChart = ProShadcnCharts.mountDonutChart(this.$refs.inventoryChart, {
          data: this.inventoryData.map((s) => ({
            label: s.label,
            value: s.value,
            percent: Math.round((s.value / total) * 100),
          })),
          height: h,
          radius,
          arcWidth,
          centralLabel: `${this.availablePercent}%`,
          centralSubLabel: t.inventoryCentral,
          colors: this.inventoryData.map((s) => s.color),
          formatTooltipValue: (row) => `${row.percent}%`,
        })
      },
      syncInventoryChartHeight() {
        const el = this.$refs.inventoryChart
        if (!el) return
        const nextH = this.measureChartHeight(el, 180)
        if (this._inventoryChartHeight === nextH) return
        this._inventoryChartHeight = nextH
        el.style.height = nextH + 'px'
      },
      mountTrafficChart(height) {
        if (!window.ProShadcnCharts || !this.$refs.trafficChart) return
        this._trafficChart = ProShadcnCharts.mountAreaChart(this.$refs.trafficChart, {
          data: this.trafficSeries,
          height,
          x: (d) => d.i,
          xLabel: (d) => d.monthTick,
          tooltipLabel: (d) => d.tooltipLabel,
          xTickValues: trafficXTickValues(this.trafficSeries),
          stacked: false,
          yMinZero: true,
          yTickFormat: formatAxisCount,
          curveType: 'linear',
          lineWidth: 2,
          // 图例在右上角：只修底轴
          autoMargin: false,
          margin: { top: 6, bottom: 22, right: 8 },
          series: [
            {
              key: 'visitors',
              label: t.visitors,
              color: 'var(--chart-1)',
              opacity: 0.22,
              lineWidth: 2.25,
            },
            {
              key: 'anomalies',
              label: t.anomalies,
              color: 'rgb(var(--danger-6))',
              opacity: 0.16,
              lineWidth: 2,
            },
          ],
        })
      },
      syncTrafficChartHeight() {
        const el = this.$refs.trafficChart
        if (!el) return
        const nextH = this.measureChartHeight(el, 260)
        if (this._trafficChartHeight === nextH) return
        this._trafficChartHeight = nextH
        el.style.height = nextH + 'px'
      },
      destroyCharts() {
        this.releaseCharts()
      },
    },
    mounted() {
      this.$nextTick(() => {
        requestAnimationFrame(() => this.initCharts())
      })
    },
    beforeUnmount() {
      this.destroyCharts()
    },
    template: `
      <div class="ecom-page">
        <div class="ecom-header">
          <div class="ecom-header-text">
            <h2 class="ecom-title">{{ t.pageTitle }}</h2>
            <p class="ecom-desc">{{ pageDate }}</p>
          </div>
          <div class="ecom-header-actions">
            <a-button
              size="small"
              class="ecom-refresh-btn"
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
            <a-select v-model="channel" size="small" :style="{ width: '140px' }">
              <a-option value="all-channels">{{ t.channelAll }}</a-option>
              <a-option value="online-store">{{ t.channelOnline }}</a-option>
              <a-option value="marketplace">{{ t.channelMarketplace }}</a-option>
              <a-option value="social">{{ t.channelSocial }}</a-option>
              <a-option value="retail">{{ t.channelRetail }}</a-option>
            </a-select>
            <a-button size="small" @click="onSettings" :aria-label="t.settingsAria">
              <template #icon><icon-settings /></template>
            </a-button>
          </div>
        </div>

        <div class="ecom-kpi-strip">
          <div class="ecom-kpi-strip-inner">
            <div class="ecom-kpi-grid">
              <div v-for="(item, idx) in kpis" :key="idx" class="ecom-kpi-cell">
                <div class="ecom-kpi-top">
                  <span class="ecom-kpi-label">{{ item.title }}</span>
                  <span class="ecom-kpi-icon-box">
                    <component :is="item.icon" />
                  </span>
                </div>
                <div class="ecom-kpi-value">{{ item.value }}</div>
                <p class="ecom-kpi-compare">
                  {{ item.compare }}
                  <span :class="item.up ? 'ecom-kpi-trend--up' : 'ecom-kpi-trend--down'">{{ item.trend }}</span>
                </p>
              </div>
            </div>
            <div class="ecom-sales-panel">
              <div class="ecom-sales-head">
                <span class="ecom-card-title">{{ t.salesOverview }}</span>
                <div class="ecom-sales-head-right">
                  <div class="ecom-chart-legend ecom-chart-legend--inline">
                    <span class="ecom-chart-legend-item">
                      <i class="ecom-chart-legend-dot" style="background: var(--chart-1)"></i>{{ t.seriesRevenue }}
                    </span>
                    <span class="ecom-chart-legend-item">
                      <i class="ecom-chart-legend-bar" style="background: color-mix(in srgb, var(--chart-1) 35%, transparent)"></i>{{ t.seriesProfit }}
                    </span>
                  </div>
                  <icon-arrow-up-right class="ecom-card-action" />
                </div>
              </div>
              <div
                :key="'sales-' + chartEpoch"
                ref="salesChart"
                class="shadcn-chart-host ecom-sales-chart ecom-chart-motion"
              ></div>
              <div class="ecom-sales-summary">
                <div class="ecom-sales-stat">
                  <div class="ecom-sales-stat-label">{{ t.salesTotalRevenue }}</div>
                  <div class="ecom-sales-stat-value">{{ salesSummary.revenue }}</div>
                </div>
                <div class="ecom-sales-stat">
                  <div class="ecom-sales-stat-label">{{ t.salesTotalProfit }}</div>
                  <div class="ecom-sales-stat-value">{{ salesSummary.profit }}</div>
                </div>
                <div class="ecom-sales-stat">
                  <div class="ecom-sales-stat-label">{{ t.salesMargin }}</div>
                  <div class="ecom-sales-stat-value">{{ salesSummary.margin }}</div>
                </div>
                <div class="ecom-sales-stat">
                  <div class="ecom-sales-stat-label">{{ t.salesPeak }}</div>
                  <div class="ecom-sales-stat-value ecom-sales-stat-value--sm">{{ salesSummary.peak }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <a-row :gutter="[16, 16]" class="ecom-equal-row">
          <a-col :xs="24" :xl="10">
            <a-card class="ecom-card ecom-card--stack general-card">
              <div class="ecom-card-head">
                <div class="ecom-card-head-main">
                  <div class="ecom-card-title">{{ t.storeTraffic }}</div>
                  <div class="ecom-card-metric">{{ trafficSummary.totalText }}</div>
                </div>
                <div class="ecom-card-head-right">
                  <div class="ecom-chart-legend ecom-chart-legend--inline">
                    <span class="ecom-chart-legend-item">
                      <i class="ecom-chart-legend-dot" style="background: var(--chart-1)"></i>{{ t.visitors }}
                    </span>
                    <span class="ecom-chart-legend-item">
                      <i class="ecom-chart-legend-dot" style="background: rgb(var(--danger-6))"></i>{{ t.anomalies }}
                    </span>
                  </div>
                  <icon-arrow-up-right class="ecom-card-action" />
                </div>
              </div>
              <div
                :key="'traffic-' + chartEpoch"
                ref="trafficChart"
                class="shadcn-chart-host ecom-traffic-chart ecom-chart-motion"
              ></div>
              <div class="ecom-card-foot-stats">
                <div class="ecom-foot-stat">
                  <div class="ecom-foot-stat-label">{{ t.trafficPeak }}</div>
                  <div class="ecom-foot-stat-value">{{ trafficSummary.peakValue }}</div>
                </div>
                <div class="ecom-foot-stat">
                  <div class="ecom-foot-stat-label">{{ t.trafficAvg }}</div>
                  <div class="ecom-foot-stat-value">{{ trafficSummary.avgValue }}</div>
                </div>
              </div>
            </a-card>
          </a-col>
          <a-col :xs="24" :xl="14">
            <a-card class="ecom-card ecom-card--stack general-card">
              <div class="ecom-card-head">
                <div class="ecom-card-head-main">
                  <div class="ecom-card-title">{{ t.trafficSources }}</div>
                  <div class="ecom-card-metric">{{ t.trafficSourcesValue }}</div>
                </div>
                <icon-arrow-up-right class="ecom-card-action" />
              </div>
              <ul class="ecom-source-list" :key="'sources-' + meterEpoch">
                <li v-for="src in trafficSources" :key="src.name" class="ecom-source-row">
                  <div class="ecom-source-meta">
                    <div class="ecom-source-name">{{ src.name }}</div>
                    <div class="ecom-source-visits">{{ src.visits }} {{ t.visitsUnit }}</div>
                  </div>
                  <div class="ecom-source-track">
                    <div class="ecom-source-fill" :style="{ width: src.share + '%' }"></div>
                  </div>
                  <span class="ecom-source-change" :class="src.up ? 'is-up' : 'is-down'">{{ src.change }}</span>
                </li>
              </ul>
              <div class="ecom-card-tip">
                <div class="ecom-card-tip-title">{{ t.sourceTopTip }}</div>
                <div class="ecom-card-tip-desc">{{ t.sourceTopDesc }}</div>
              </div>
            </a-card>
          </a-col>
        </a-row>

        <a-row :gutter="[16, 16]" class="ecom-equal-row ecom-insight-row">
          <a-col :xs="24" :md="12" :xl="8">
            <a-card class="ecom-card ecom-card--stack general-card">
              <div class="ecom-card-head">
                <div class="ecom-card-head-main">
                  <div class="ecom-card-title">{{ t.topProducts }}</div>
                  <div class="ecom-card-metric">{{ t.topProductsValue }}</div>
                </div>
                <icon-arrow-up-right class="ecom-card-action" />
              </div>
              <div class="ecom-cat-bar" role="img" aria-label="品类销售占比" :key="'cats-' + meterEpoch">
                <div
                  v-for="cat in categories"
                  :key="cat.name"
                  class="ecom-cat-seg"
                  :style="{ width: cat.share + '%', background: cat.color }"
                ></div>
              </div>
              <div class="ecom-cat-legend">
                <span v-for="cat in categories" :key="'l-' + cat.name" class="ecom-cat-legend-item">
                  <i class="ecom-cat-dot" :style="{ background: cat.color }"></i>{{ cat.name }}
                </span>
              </div>
              <div class="ecom-divider"></div>
              <div class="ecom-product-grid">
                <div class="ecom-product-head">{{ t.colProduct }}</div>
                <div class="ecom-product-head">{{ t.colShare }}</div>
                <div class="ecom-product-head">{{ t.colSales }}</div>
                <template v-for="p in products" :key="p.name">
                  <div>
                    <div class="ecom-product-name">{{ p.name }}</div>
                    <div class="ecom-product-cat">{{ p.category }}</div>
                  </div>
                  <div class="ecom-product-share">{{ p.share }}</div>
                  <div class="ecom-product-sales">{{ p.sales }}</div>
                </template>
              </div>
              <div class="ecom-card-footer-link">
                <span>{{ productsFooterText }}</span>
                <a-link @click="onTip(t.viewAllProducts)">{{ t.viewAllProducts }}</a-link>
              </div>
            </a-card>
          </a-col>

          <a-col :xs="24" :md="12" :xl="8">
            <a-card class="ecom-card ecom-card--stack general-card">
              <div class="ecom-card-head">
                <div class="ecom-card-head-main">
                  <div class="ecom-card-title">{{ t.inventory }}</div>
                  <div class="ecom-card-metric">{{ inventoryValueText }}</div>
                </div>
                <icon-arrow-up-right class="ecom-card-action" />
              </div>
              <div
                :key="'inv-' + chartEpoch"
                ref="inventoryChart"
                class="shadcn-chart-host ecom-inv-chart ecom-chart-motion"
              ></div>
              <div class="ecom-divider"></div>
              <div class="ecom-inv-summary">
                <div class="ecom-inv-item">
                  <div class="ecom-inv-icon ecom-inv-icon--ok"><icon-check-circle /></div>
                  <div>
                    <div class="ecom-inv-label">{{ t.inStock }}</div>
                    <div class="ecom-inv-value">{{ inventoryData[0].value.toLocaleString('zh-CN') }}</div>
                  </div>
                </div>
                <div class="ecom-inv-item">
                  <div class="ecom-inv-icon ecom-inv-icon--warn"><icon-exclamation-circle /></div>
                  <div>
                    <div class="ecom-inv-label">{{ t.lowStock }}</div>
                    <div class="ecom-inv-value">{{ inventoryData[1].value.toLocaleString('zh-CN') }}</div>
                  </div>
                </div>
                <div class="ecom-inv-item">
                  <div class="ecom-inv-icon ecom-inv-icon--danger"><icon-close /></div>
                  <div>
                    <div class="ecom-inv-label">{{ t.outOfStock }}</div>
                    <div class="ecom-inv-value">{{ inventoryData[2].value.toLocaleString('zh-CN') }}</div>
                  </div>
                </div>
              </div>
            </a-card>
          </a-col>

          <a-col :xs="24" :md="12" :xl="8">
            <a-card class="ecom-card ecom-card--stack general-card">
              <div class="ecom-card-head">
                <div class="ecom-card-head-main">
                  <div class="ecom-card-title">{{ t.reviews }}</div>
                  <div class="ecom-card-metric">{{ t.reviewsValue }}</div>
                </div>
                <icon-arrow-up-right class="ecom-card-action" />
              </div>
              <div class="ecom-review-quote">
                <div class="ecom-review-top">
                  <div>
                    <div class="ecom-stars">
                      <icon-star-fill v-for="n in currentReview.stars" :key="'s' + n" />
                    </div>
                    <div class="ecom-review-name">{{ currentReview.name }}</div>
                    <p class="ecom-review-text">{{ currentReview.text }}</p>
                  </div>
                  <div class="ecom-review-nav">
                    <a-button size="mini" @click="prevReview" :aria-label="t.reviewPrev">
                      <template #icon><icon-left /></template>
                    </a-button>
                    <a-button size="mini" @click="nextReview" :aria-label="t.reviewNext">
                      <template #icon><icon-right /></template>
                    </a-button>
                  </div>
                </div>
              </div>
              <div class="ecom-rating-block" :key="'ratings-' + meterEpoch">
                <div class="ecom-rating-head">
                  <span>{{ t.reviewDist }}</span>
                  <span class="ecom-rating-positive">{{ t.reviewPositive }} {{ reviewPositivePct }}</span>
                </div>
                <div v-for="row in ratingDist" :key="row.star" class="ecom-rating-row">
                  <span class="ecom-rating-star">{{ row.star }} 星</span>
                  <div class="ecom-rating-track">
                    <div class="ecom-rating-fill" :style="{ width: row.pct + '%' }"></div>
                  </div>
                  <span class="ecom-rating-pct">{{ row.pct }}%</span>
                </div>
              </div>
              <div class="ecom-review-summary">
                <div class="ecom-review-summary-text">
                  <div class="ecom-review-summary-title">{{ t.reviewSummaryTitle }}</div>
                  <div class="ecom-review-summary-desc">{{ t.reviewSummaryDesc }}</div>
                </div>
                <div class="ecom-avatar-group">
                  <a-avatar v-for="(name, i) in avatarNames" :key="i" :size="28">{{ name }}</a-avatar>
                  <span class="ecom-avatar-more">+42</span>
                </div>
              </div>
            </a-card>
          </a-col>
        </a-row>

        <a-card class="ecom-card general-card">
          <div class="ecom-card-head">
            <div class="ecom-card-head-main">
              <div class="ecom-card-title">{{ t.recentOrders }}</div>
              <div class="ecom-card-metric">{{ orderCountDescription }}</div>
            </div>
            <div class="ecom-orders-actions">
              <a-button size="mini" @click="onTip(t.openOrders)" :aria-label="t.openOrders">
                <template #icon><icon-arrow-up-right /></template>
              </a-button>
              <a-button size="mini" @click="onExport" :aria-label="t.exportOrders">
                <template #icon><icon-download /></template>
              </a-button>
              <a-dropdown trigger="click">
                <a-button size="mini" :aria-label="t.moreActions">
                  <template #icon><icon-drag-dot /></template>
                </a-button>
                <template #content>
                  <a-doption @click="onTip(t.viewOrder)">{{ t.viewOrder }}</a-doption>
                  <a-doption @click="onExport">{{ t.exportOrders }}</a-doption>
                </template>
              </a-dropdown>
            </div>
          </div>

          <div class="ecom-orders-toolbar">
            <a-radio-group v-model="orderFilter" type="button" size="small">
              <a-radio v-for="opt in filterOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</a-radio>
            </a-radio-group>
            <a-button size="mini" @click="toggleDateSort" :aria-label="t.sortByDate">
              <template #icon><icon-filter /></template>
            </a-button>
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
            <template #order="{ record }">
              <div class="ecom-order-id">{{ record.id }}</div>
              <div class="ecom-order-items">{{ record.items }}</div>
            </template>
            <template #status="{ record }">
              <div class="ecom-status-stack">
                <a-tag size="small" :color="paymentColor(record.payment)" class="ecom-pay-tag">
                  <i class="ecom-dot"></i>{{ paymentLabel(record.payment) }}
                </a-tag>
                <a-tag size="small" :color="fulfillmentColor(record.fulfillment)" class="ecom-ful-tag">
                  <i class="ecom-dot"></i>{{ fulfillmentLabel(record.fulfillment) }}
                </a-tag>
              </div>
            </template>
            <template #date="{ record }">
              <span style="color: var(--color-text-3)">{{ formatOrderDate(record.date) }}</span>
            </template>
            <template #actions="{ record }">
              <a-dropdown trigger="click">
                <a-button type="text" size="small" :aria-label="t.orderActions">
                  <template #icon><icon-drag-dot /></template>
                </a-button>
                <template #content>
                  <a-doption @click="onTip(t.viewOrder + ' ' + record.id)">{{ t.viewOrder }}</a-doption>
                  <a-doption @click="onTip(t.contactCustomer)">{{ t.contactCustomer }}</a-doption>
                  <a-doption @click="onTip(t.copyOrderId + ' ' + record.id)">{{ t.copyOrderId }}</a-doption>
                </template>
              </a-dropdown>
            </template>
            <template #empty>
              <div style="padding: 32px; text-align: center; color: var(--color-text-3)">{{ t.emptyOrders }}</div>
            </template>
          </a-table>

          <div class="ecom-orders-footer">
            <span class="ecom-orders-count">
              {{ t.showing }} {{ pagedRows.length }} / {{ filteredRows.length.toLocaleString('zh-CN') }} {{ t.orderUnit }}
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
    pageKey: 'dashboard/ecommerce',
    title: t.pageTitle,
    pageComponent: EcommercePage,
  })
})()
