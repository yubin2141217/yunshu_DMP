;(function () {
  /* 扩展图表演示：交互柱图 + 电商组合/流量面积 + 质量双折线 */
  const t = {
    interactiveTitle: '交互式柱状图',
    interactiveDesc: '展示近 3 个月总访问量',
    desktop: '桌面端',
    mobile: '移动端',
    seriesRevenue: '收入',
    seriesProfit: '利润',
    salesTotalRevenue: '期间收入',
    salesTotalProfit: '期间利润',
    salesMargin: '利润率',
    salesPeak: '峰值区间',
    visitors: '访客',
    anomalies: '异常流量',
    traffic24h: '24 小时前',
    trafficNow: '现在',
    trafficPeak: '峰值时段',
    trafficAvg: '平均访问',
    actualQuality: '实际质量',
    baselineQuality: '基准质量',
    seriesA: '搜索广告',
    seriesB: '信息流',
    seriesC: '短视频',
    seriesD: '自然流量',
    sparkValue: '实时指标',
    candleUp: '收涨',
    candleDown: '收跌',
    scatterNormal: '正常样本',
    scatterOutlier: '异常样本',
    percentNormal: '达标占比',
    percentAnomaly: '异常偏低',
  }

  function hash01(seed) {
    const x = Math.sin((seed + 1) * 12.9898) * 43758.5453
    return x - Math.floor(x)
  }

  function withJitter(n, seed, amp = 0.07) {
    const base = Number(n) || 0
    return Math.max(0, Math.round(base * (1 + (hash01(seed) - 0.5) * 2 * amp)))
  }

  function buildRevenueOverviewData(nonce = 0) {
    const days = 100
    const end = new Date()
    end.setHours(0, 0, 0, 0)
    const rows = []
    for (let i = 0; i < days; i++) {
      const d = new Date(end)
      d.setDate(end.getDate() - (days - 1 - i))
      const progress = i / (days - 1)
      const wave =
        Math.sin(i * 1.85 + nonce * 0.35) * 620 +
        Math.cos(i * 0.73 + nonce * 0.2) * 410 +
        Math.sin(i * 0.31) * 280 +
        ((i * 47 + nonce * 13) % 860) -
        430
      const revenue = Math.max(900, Math.round(3800 + progress * 5200 + wave))
      // 与电商销售概览对齐：利润率约 48%–68%，始终低于收入
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

  /* 数值沿用 shadcn chart-bar-interactive；日期锚定今天回推约 3 个月 */
  const interactiveBarValues = [
    { desktop: 222, mobile: 150 },
    { desktop: 97, mobile: 180 },
    { desktop: 167, mobile: 120 },
    { desktop: 242, mobile: 260 },
    { desktop: 373, mobile: 290 },
    { desktop: 301, mobile: 340 },
    { desktop: 245, mobile: 180 },
    { desktop: 409, mobile: 320 },
    { desktop: 59, mobile: 110 },
    { desktop: 261, mobile: 190 },
    { desktop: 327, mobile: 350 },
    { desktop: 292, mobile: 210 },
    { desktop: 342, mobile: 380 },
    { desktop: 137, mobile: 220 },
    { desktop: 120, mobile: 170 },
    { desktop: 138, mobile: 190 },
    { desktop: 446, mobile: 360 },
    { desktop: 364, mobile: 410 },
    { desktop: 243, mobile: 180 },
    { desktop: 89, mobile: 150 },
    { desktop: 137, mobile: 200 },
    { desktop: 224, mobile: 170 },
    { desktop: 138, mobile: 230 },
    { desktop: 387, mobile: 290 },
    { desktop: 215, mobile: 250 },
    { desktop: 75, mobile: 130 },
    { desktop: 383, mobile: 420 },
    { desktop: 122, mobile: 180 },
    { desktop: 315, mobile: 240 },
    { desktop: 454, mobile: 380 },
    { desktop: 165, mobile: 220 },
    { desktop: 293, mobile: 310 },
    { desktop: 247, mobile: 190 },
    { desktop: 385, mobile: 420 },
    { desktop: 481, mobile: 390 },
    { desktop: 498, mobile: 520 },
    { desktop: 388, mobile: 300 },
    { desktop: 149, mobile: 210 },
    { desktop: 227, mobile: 180 },
    { desktop: 293, mobile: 330 },
    { desktop: 335, mobile: 270 },
    { desktop: 197, mobile: 240 },
    { desktop: 197, mobile: 160 },
    { desktop: 448, mobile: 490 },
    { desktop: 473, mobile: 380 },
    { desktop: 338, mobile: 400 },
    { desktop: 499, mobile: 420 },
    { desktop: 315, mobile: 350 },
    { desktop: 235, mobile: 180 },
    { desktop: 177, mobile: 230 },
    { desktop: 82, mobile: 140 },
    { desktop: 81, mobile: 120 },
    { desktop: 252, mobile: 290 },
    { desktop: 294, mobile: 220 },
    { desktop: 201, mobile: 250 },
    { desktop: 213, mobile: 170 },
    { desktop: 420, mobile: 460 },
    { desktop: 233, mobile: 190 },
    { desktop: 78, mobile: 130 },
    { desktop: 340, mobile: 280 },
    { desktop: 178, mobile: 230 },
    { desktop: 178, mobile: 200 },
    { desktop: 470, mobile: 410 },
    { desktop: 103, mobile: 160 },
    { desktop: 439, mobile: 380 },
    { desktop: 88, mobile: 140 },
    { desktop: 294, mobile: 250 },
    { desktop: 323, mobile: 370 },
    { desktop: 385, mobile: 320 },
    { desktop: 438, mobile: 480 },
    { desktop: 155, mobile: 200 },
    { desktop: 92, mobile: 150 },
    { desktop: 492, mobile: 420 },
    { desktop: 81, mobile: 130 },
    { desktop: 426, mobile: 380 },
    { desktop: 307, mobile: 350 },
    { desktop: 371, mobile: 310 },
    { desktop: 475, mobile: 520 },
    { desktop: 107, mobile: 170 },
    { desktop: 341, mobile: 290 },
    { desktop: 408, mobile: 450 },
    { desktop: 169, mobile: 210 },
    { desktop: 317, mobile: 270 },
    { desktop: 480, mobile: 530 },
    { desktop: 132, mobile: 180 },
    { desktop: 141, mobile: 190 },
    { desktop: 434, mobile: 380 },
    { desktop: 448, mobile: 490 },
    { desktop: 149, mobile: 200 },
    { desktop: 103, mobile: 160 },
    { desktop: 446, mobile: 400 },
  ]

  function buildInteractiveBarData() {
    const days = interactiveBarValues.length
    const end = new Date()
    end.setHours(0, 0, 0, 0)
    return interactiveBarValues.map((row, i) => {
      const d = new Date(end)
      d.setDate(end.getDate() - (days - 1 - i))
      const year = d.getFullYear()
      const month = d.getMonth() + 1
      const day = d.getDate()
      const mm = month < 10 ? '0' + month : String(month)
      const dd = day < 10 ? '0' + day : String(day)
      return {
        i,
        date: `${year}-${mm}-${dd}`,
        desktop: row.desktop,
        mobile: row.mobile,
        value: row.desktop,
        monthTick: `${month}月${day}日`,
        tooltipLabel: `${year}年${month}月${day}日`,
      }
    })
  }

  const interactiveBarData = buildInteractiveBarData()

  const interactiveBarTotals = {
    desktop: interactiveBarValues.reduce((s, r) => s + r.desktop, 0),
    mobile: interactiveBarValues.reduce((s, r) => s + r.mobile, 0),
  }

  const interactiveBarYTop = (() => {
    const peak = Math.max(
      ...interactiveBarValues.map((r) => Math.max(r.desktop || 0, r.mobile || 0)),
      1
    )
    return Math.max(100, Math.ceil((peak * 1.08) / 50) * 50)
  })()

  function interactiveBarXTicks(data) {
    const n = (data || []).length
    if (n <= 1) return [0]
    const step = Math.max(1, Math.round((n - 1) / 11))
    const ticks = []
    for (let i = 0; i < n; i += step) ticks.push(i)
    if (ticks[ticks.length - 1] !== n - 1) ticks.push(n - 1)
    return ticks
  }

  function formatLocaleCount(n) {
    return Number(n || 0).toLocaleString('zh-CN')
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

  /* 来自 dashboard-analytics：流量质量双折线（实线实际 / 虚线基准） */
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

  /** 四渠道获客量（万）：各渠道旺季错开，避免整齐递减假数据感 */
  const clusterBarData = [
    { i: 0, label: '1月', a: 86, b: 54, c: 41, d: 72 },
    { i: 1, label: '2月', a: 62, b: 48, c: 38, d: 58 },
    { i: 2, label: '3月', a: 95, b: 71, c: 56, d: 64 },
    { i: 3, label: '4月', a: 78, b: 88, c: 63, d: 69 },
    { i: 4, label: '5月', a: 84, b: 76, c: 92, d: 71 },
    { i: 5, label: '6月', a: 91, b: 69, c: 81, d: 66 },
    { i: 6, label: '7月', a: 73, b: 95, c: 74, d: 61 },
    { i: 7, label: '8月', a: 69, b: 82, c: 98, d: 75 },
    { i: 8, label: '9月', a: 88, b: 74, c: 67, d: 83 },
    { i: 9, label: '10月', a: 102, b: 91, c: 79, d: 88 },
    { i: 10, label: '11月', a: 118, b: 106, c: 94, d: 97 },
    { i: 11, label: '12月', a: 109, b: 87, c: 71, d: 112 },
  ]
  const clusterLegend = [
    { key: 'a', label: t.seriesA, color: 'var(--chart-1)' },
    { key: 'b', label: t.seriesB, color: 'var(--chart-2)' },
    { key: 'c', label: t.seriesC, color: 'var(--chart-3)' },
    { key: 'd', label: t.seriesD, color: 'var(--chart-4)' },
  ]

  /** 高频波动面积：超密采样 + 强毛刺，贴近实时指标观感 */
  function buildSparkAreaData() {
    const n = 560
    const rows = []
    let v = 46
    const end = new Date()
    end.setSeconds(0, 0)
    for (let i = 0; i < n; i += 1) {
      const d = new Date(end)
      // 约 1 分钟一点，近 9 小时超密走势
      d.setMinutes(end.getMinutes() - (n - 1 - i))
      const slow =
        Math.sin(i * 0.024) * 12 +
        Math.cos(i * 0.01) * 7.5 +
        Math.sin(i * 0.062) * 5
      const mid = Math.sin(i * 0.27) * 2.6 + Math.cos(i * 0.49) * 2
      // 高频锯齿叠多层，避免平滑波
      const jag =
        Math.sin(i * 2.05) * 2.45 +
        Math.sin(i * 3.7 + 0.4) * 1.7 +
        Math.sin(i * 6.1 + 1.1) * 1.15 +
        Math.cos(i * 9.3) * 0.85 +
        Math.sin(i * 12.7 + 0.3) * 0.55 +
        (hash01(i * 1.19) - 0.5) * 5.8 +
        (hash01(i * 2.83) - 0.5) * 3.5 +
        (hash01(i * 4.61) - 0.5) * 2.1
      const spike =
        hash01(i * 7.7) > 0.948 ? (hash01(i * 9.4) - 0.5) * 17 : 0
      // 低惯性：更跟噪声走，曲线更「抖」
      const next = v * 0.38 + (46 + slow * 0.5 + mid) * 0.62 + jag + spike
      v = Math.max(6, Math.min(98, next))
      const hh = String(d.getHours()).padStart(2, '0')
      const mm = String(d.getMinutes()).padStart(2, '0')
      rows.push({
        i,
        label: `${hh}:${mm}`,
        tooltipLabel: `${d.getMonth() + 1}月${d.getDate()}日 ${hh}:${mm}`,
        value: Math.round(v * 10) / 10,
      })
    }
    return rows
  }
  const sparkAreaData = buildSparkAreaData()
  const sparkAreaXTicks = (() => {
    const n = sparkAreaData.length
    if (n < 2) return sparkAreaData.map((d) => d.i)
    const count = 6
    const ticks = []
    for (let t = 0; t < count; t += 1) {
      const idx = Math.round((t / (count - 1)) * (n - 1))
      if (!ticks.includes(idx)) ticks.push(idx)
    }
    return ticks
  })()

  /** K 线：交易日序列 + 波动聚簇 + 跳空/十字星/长短影，更接近真实行情 */
  function buildCandleData() {
    const target = 120
    const rows = []
    let close = 126.8
    let vol = 1.2
    const end = new Date()
    end.setHours(0, 0, 0, 0)
    const tradeDays = []
    const cursor = new Date(end)
    while (tradeDays.length < target) {
      const wd = cursor.getDay()
      if (wd !== 0 && wd !== 6) tradeDays.push(new Date(cursor))
      cursor.setDate(cursor.getDate() - 1)
    }
    tradeDays.reverse()

    for (let i = 0; i < tradeDays.length; i += 1) {
      const d = tradeDays[i]
      // 绝大多数日：开盘=昨收；少数跳空
      const gap =
        hash01(i * 5.17) > 0.91 ? (hash01(i * 6.33) - 0.5) * vol * 2.1 : 0
      const open = close + gap

      vol = Math.max(
        0.45,
        Math.min(3.1, vol * 0.9 + 0.16 + Math.abs(hash01(i * 0.81) - 0.5) * 0.7)
      )
      if (hash01(i * 3.41) > 0.92) vol *= 1.65

      const trend =
        Math.sin(i * 0.065) * 0.28 +
        Math.cos(i * 0.023) * 0.18 +
        (hash01(i * 1.05) - 0.5) * 0.12
      const shock = (hash01(i * 2.19) - 0.5) * vol * 2.55
      let nextClose = open + trend + shock
      // 温和均值回归，形成波段而非直线
      nextClose += (124 - nextClose) * 0.018
      nextClose = Math.max(78, Math.min(172, nextClose))

      const bodyTop = Math.max(open, nextClose)
      const bodyBot = Math.min(open, nextClose)
      const body = Math.abs(nextClose - open)

      // 约 8% 近似十字星：实体压得很小
      const doji = hash01(i * 8.8) > 0.92
      const closeAdj = doji
        ? open + (nextClose - open) * 0.12
        : nextClose
      const bodyTop2 = Math.max(open, closeAdj)
      const bodyBot2 = Math.min(open, closeAdj)
      const body2 = Math.abs(closeAdj - open)

      let upperWick =
        Math.max(0.12, body2) * (0.2 + hash01(i * 4.5) * 1.05) +
        vol * (0.22 + hash01(i * 8.2) * 1.25)
      let lowerWick =
        Math.max(0.12, body2) * (0.18 + hash01(i * 5.8) * 1.0) +
        vol * (0.2 + hash01(i * 9.4) * 1.2)

      if (hash01(i * 11.5) > 0.87) upperWick *= 2.2
      if (hash01(i * 12.9) > 0.87) lowerWick *= 2.2
      if (doji) {
        upperWick = Math.max(upperWick, 0.85 + hash01(i) * 1.4)
        lowerWick = Math.max(lowerWick, 0.85 + hash01(i * 1.6) * 1.4)
      }

      const high = bodyTop2 + upperWick
      const low = bodyBot2 - lowerWick
      const month = d.getMonth() + 1
      const dayNum = d.getDate()
      rows.push({
        i,
        open: Math.round(open * 100) / 100,
        high: Math.round(high * 100) / 100,
        low: Math.round(low * 100) / 100,
        close: Math.round(closeAdj * 100) / 100,
        label: `${month}/${dayNum}`,
        tooltipLabel: `${d.getFullYear()}年${month}月${dayNum}日`,
      })
      close = closeAdj
    }
    return rows
  }
  const candleData = buildCandleData()
  const candleLegend = [
    { key: 'up', label: t.candleUp, color: 'rgb(var(--danger-6))' },
    { key: 'down', label: t.candleDown, color: 'rgb(var(--success-6))' },
  ]

  /** 散点：正常 / 异常两类样本，各自成云团 */
  function buildScatterRandomData() {
    const rows = []
    let i = 0
    // 正常样本：主云团，略偏左下，密度更高
    for (let k = 0; k < 52; k += 1, i += 1) {
      const u = hash01(i * 1.37)
      const v = hash01(i * 2.71)
      const w = hash01(i * 4.19)
      const x = 18 + u * 48 + (v - 0.5) * 14 + Math.sin(i * 0.55) * 2.8
      const y =
        22 +
        v * 46 +
        (w - 0.5) * 16 +
        (u - 0.5) * 8 +
        Math.cos(i * 0.41) * 3.6
      rows.push({
        i,
        x: Math.round(Math.max(4, Math.min(98, x)) * 10) / 10,
        y: Math.round(Math.max(6, Math.min(96, y)) * 10) / 10,
        group: 'normal',
        label: `正常 ${k + 1}`,
        tooltipLabel: `正常样本 ${k + 1}`,
      })
    }
    // 异常样本：右上稀疏云团 + 少量离群点
    for (let k = 0; k < 18; k += 1, i += 1) {
      const u = hash01(i * 3.11)
      const v = hash01(i * 5.73)
      const outlier = hash01(i * 8.4) > 0.78
      const x = outlier
        ? 8 + u * 88
        : 58 + u * 34 + (v - 0.5) * 10
      const y = outlier
        ? 10 + v * 82
        : 52 + v * 38 + (u - 0.5) * 12
      rows.push({
        i,
        x: Math.round(Math.max(4, Math.min(98, x)) * 10) / 10,
        y: Math.round(Math.max(6, Math.min(96, y)) * 10) / 10,
        group: 'outlier',
        label: `异常 ${k + 1}`,
        tooltipLabel: `异常样本 ${k + 1}`,
      })
    }
    return rows
  }
  const scatterRandomData = buildScatterRandomData()
  const scatterLegend = [
    { key: 'normal', label: t.scatterNormal, color: 'var(--chart-1)' },
    { key: 'outlier', label: t.scatterOutlier, color: 'rgb(var(--warning-6))' },
  ]

  /** 百分比对比柱：科室达成率降序，末 3 项异常突出（对齐参考图） */
  const percentTrackData = [
    { label: '消化科', value: 90 },
    { label: '心血管内科', value: 85 },
    { label: '肾内科', value: 78 },
    { label: '肿瘤外科', value: 70 },
    { label: '骨科', value: 65 },
    { label: '泌尿外科', value: 60 },
    { label: '口腔科', value: 50 },
    { label: '小儿外科', value: 45 },
    { label: '耳鼻喉科', value: 38 },
    { label: '眼科', value: 30 },
    { label: '普通外科', value: 25 },
    { label: '肝胆外科', value: 23 },
    { label: '心血管外科', value: 20, anomaly: true },
    { label: '神经外科', value: 20, anomaly: true },
    { label: '妇产科', value: 18, anomaly: true },
  ].map((d) => ({
    ...d,
    tooltipLabel: `${d.label}达成率`,
  }))
  const percentTrackLegend = [
    { key: 'normal', label: t.percentNormal, color: 'var(--chart-1)' },
    { key: 'anomaly', label: t.percentAnomaly, color: 'rgb(var(--warning-6))' },
  ]

  function buildSeries(nonce = 0) {
    const revenueSeries = buildRevenueOverviewData(nonce)
    const trafficSeries = buildTrafficData(nonce)
    return {
      revenueSeries,
      trafficSeries,
      salesSummary: buildSalesSummary(revenueSeries),
      trafficSummary: buildTrafficSummary(trafficSeries),
    }
  }

  const ChartExtendedPage = {
    name: 'ChartExtendedPage',
    data() {
      const series = buildSeries(0)
      return {
        t,
        chartEpoch: 0,
        activeBarKey: 'desktop',
        interactiveBarTotals,
        revenueSeries: series.revenueSeries,
        trafficSeries: series.trafficSeries,
        salesSummary: series.salesSummary,
        trafficSummary: series.trafficSummary,
        qualityLegend,
        clusterLegend,
        candleLegend,
        scatterLegend,
        percentTrackLegend,
      }
    },
    computed: {
      interactiveBarSeriesData() {
        const key = this.activeBarKey === 'mobile' ? 'mobile' : 'desktop'
        return interactiveBarData.map((row) => ({
          ...row,
          value: row[key],
        }))
      },
    },
    methods: {
      formatLocaleCount,
      setActiveBarKey(key) {
        if (this.activeBarKey === key) return
        // release 只摘注册表、不清 DOM；先摘再靠 Vue :key 换新宿主，避免叠层抖动
        if (this._interactiveBarChart && window.ProShadcnCharts) {
          if (typeof ProShadcnCharts.release === 'function') {
            ProShadcnCharts.release(this._interactiveBarChart)
          }
          this._interactiveBarChart = null
        }
        this.activeBarKey = key
        this.$nextTick(() => {
          requestAnimationFrame(() => this.mountInteractiveBarChart())
        })
      },
      releaseCharts() {
        ;[
          this._interactiveBarChart,
          this._clusterBarChart,
          this._sparkAreaChart,
          this._candleChart,
          this._scatterChart,
          this._percentTrackChart,
          this._salesChart,
          this._trafficChart,
          this._qualityChart,
        ].forEach((inst) => {
          if (!inst || !window.ProShadcnCharts) return
          if (typeof ProShadcnCharts.release === 'function') ProShadcnCharts.release(inst)
        })
        this._interactiveBarChart = null
        this._clusterBarChart = null
        this._sparkAreaChart = null
        this._candleChart = null
        this._scatterChart = null
        this._percentTrackChart = null
        this._salesChart = null
        this._trafficChart = null
        this._qualityChart = null
      },
      mountInteractiveBarChart() {
        if (!window.ProShadcnCharts || !this.$refs.interactiveBarChart) return
        const el = this.$refs.interactiveBarChart
        // 新宿主：清空残留节点，防止 remount 叠层导致高度抖动
        el.innerHTML = ''
        el.style.height = '250px'
        el.style.minHeight = '250px'
        const data = this.interactiveBarSeriesData
        const label = this.activeBarKey === 'mobile' ? t.mobile : t.desktop
        const yTicks = [0, 0.25, 0.5, 0.75, 1].map((p) => Math.round(interactiveBarYTop * p))
        this._interactiveBarChart = ProShadcnCharts.mountBarChart(el, {
          data,
          height: 250,
          x: (d) => d.i,
          xLabel: (d) => d.monthTick,
          // 对齐 shadcn chart-bar-interactive：Tooltip cursor = muted 灰带
          tooltipLabel: (d) => d.tooltipLabel,
          xTickValues: interactiveBarXTicks(data),
          yMinZero: true,
          // 双系列共用同一 Y 顶，切换时刻度不跳
          yDomain: [0, interactiveBarYTop],
          yTickValues: yTicks,
          yTickFormat: (v) => String(v),
          autoMargin: false,
          dynamicYAxisMargin: true,
          dynamicXAxisMargin: true,
          yLabelMinWidth: 28,
          yLabelMaxWidth: 44,
          margin: { top: 8, bottom: 22, right: 12 },
          barPadding: 0.06,
          groupPadding: 0.08,
          groupMaxWidth: 16,
          dataStep: 1,
          xDomainPad: 0.35,
          roundedCorners: 0,
          tooltipCursor: true,
          series: [{ key: 'value', label, color: 'var(--chart-1)' }],
        })
      },
      mountClusterBarChart() {
        if (!window.ProShadcnCharts || !this.$refs.clusterBarChart) return
        const peak = Math.max(
          ...clusterBarData.map((d) => Math.max(d.a, d.b, d.c, d.d)),
          1
        )
        const yTop = Math.ceil((peak * 1.08) / 10) * 10
        const yTicks = [0, 0.25, 0.5, 0.75, 1].map((p) => Math.round(yTop * p))
        this._clusterBarChart = ProShadcnCharts.mountBarChart(this.$refs.clusterBarChart, {
          data: clusterBarData,
          height: 280,
          x: (d) => d.i,
          xLabel: (d) => d.label,
          xTickValues: clusterBarData.map((d) => d.i),
          yMinZero: true,
          yDomain: [0, yTop],
          yTickValues: yTicks,
          roundedCorners: 0,
          barPadding: 0.12,
          groupPadding: 0.28,
          groupMaxWidth: 56,
          xDomainPad: 0.4,
          autoMargin: false,
          dynamicYAxisMargin: true,
          dynamicXAxisMargin: true,
          margin: { top: 8, bottom: 28, right: 12 },
          series: clusterLegend.map((s) => ({
            key: s.key,
            label: s.label,
            color: s.color,
          })),
        })
      },
      mountSparkAreaChart() {
        if (!window.ProShadcnCharts || !this.$refs.sparkAreaChart) return
        const peak = Math.max(...sparkAreaData.map((d) => Number(d.value) || 0), 1)
        const yTop = Math.ceil(peak * 1.08)
        const yTicks = [0, 0.25, 0.5, 0.75, 1].map((p) => Math.round(yTop * p))
        this._sparkAreaChart = ProShadcnCharts.mountAreaChart(this.$refs.sparkAreaChart, {
          data: sparkAreaData,
          height: 260,
          x: (d) => d.i,
          xLabel: (d) => d.label,
          tooltipLabel: (d) => d.tooltipLabel,
          xTickValues: sparkAreaXTicks,
          yMinZero: true,
          yDomain: [0, yTop],
          yTickValues: yTicks,
          yTickFormat: (v) => String(v),
          curveType: 'linear',
          lineWidth: 1.25,
          autoMargin: false,
          dynamicYAxisMargin: true,
          dynamicXAxisMargin: true,
          margin: { top: 10, bottom: 28, right: 12 },
          series: [
            {
              key: 'value',
              label: t.sparkValue,
              color: 'var(--chart-1)',
              opacity: 0.26,
              lineWidth: 1.25,
            },
          ],
        })
      },
      mountCandleChart() {
        if (!window.ProShadcnCharts || !this.$refs.candleChart) return
        if (typeof ProShadcnCharts.mountCandlestickChart !== 'function') return
        this._candleChart = ProShadcnCharts.mountCandlestickChart(this.$refs.candleChart, {
          data: candleData,
          height: 280,
          margin: { top: 10, right: 12, bottom: 28, left: 44 },
          bodyRadius: 2,
          gridCount: 4,
          xTickCount: 6,
          showXAxis: true,
          showYAxis: true,
          upColor: 'rgb(var(--danger-6))',
          downColor: 'rgb(var(--success-6))',
        })
      },
      mountScatterChart() {
        if (!window.ProShadcnCharts || !this.$refs.scatterChart) return
        if (typeof ProShadcnCharts.mountScatterChart !== 'function') return
        this._scatterChart = ProShadcnCharts.mountScatterChart(this.$refs.scatterChart, {
          data: scatterRandomData,
          height: 280,
          margin: { top: 10, right: 14, bottom: 28, left: 40 },
          xDomain: [0, 100],
          yDomain: [0, 100],
          xTickValues: [0, 20, 40, 60, 80, 100],
          yTickValues: [0, 20, 40, 60, 80, 100],
          xTickFormat: (v) => String(v),
          yTickFormat: (v) => String(v),
          pointRadius: 4,
          series: scatterLegend.map((s) => ({
            key: s.key,
            label: s.label,
            color: s.color,
          })),
        })
      },
      mountPercentTrackChart() {
        if (!window.ProShadcnCharts || !this.$refs.percentTrackChart) return
        if (typeof ProShadcnCharts.mountPercentTrackBarChart !== 'function') return
        this._percentTrackChart = ProShadcnCharts.mountPercentTrackBarChart(this.$refs.percentTrackChart, {
          data: percentTrackData,
          height: 280,
          margin: { top: 10, right: 12, bottom: 44, left: 44 },
          yMax: 100,
          yTickValues: [0, 20, 40, 60, 80, 100],
          showGrid: false,
          showXDomain: true,
          color: 'var(--chart-1)',
          anomalyColor: 'rgb(var(--warning-6))',
          trackColor: 'color-mix(in srgb, var(--chart-1) 14%, var(--color-fill-2, #f2f3f5))',
        })
      },
      mountQualityChart() {
        if (!window.ProShadcnCharts || !this.$refs.qualityChart) return
        this._qualityChart = ProShadcnCharts.mountLineChart(this.$refs.qualityChart, {
          data: qualityChartData,
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
      },
      mountTrafficChart() {
        if (!window.ProShadcnCharts || !this.$refs.trafficChart) return
        this._trafficChart = ProShadcnCharts.mountAreaChart(this.$refs.trafficChart, {
          data: this.trafficSeries,
          height: 280,
          x: (d) => d.i,
          xLabel: (d) => d.monthTick,
          tooltipLabel: (d) => d.tooltipLabel,
          xTickValues: trafficXTickValues(this.trafficSeries),
          stacked: false,
          yMinZero: true,
          yTickFormat: formatAxisCount,
          curveType: 'linear',
          lineWidth: 2,
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
      initCharts() {
        if (!window.ProShadcnCharts) return

        this.mountInteractiveBarChart()
        this.mountClusterBarChart()
        this.mountSparkAreaChart()
        this.mountCandleChart()
        this.mountScatterChart()
        this.mountPercentTrackChart()

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
          // 共用 Y 轴：与电商销售概览一致
          yDomain: [0, salesYTop],
          yTickValues: salesYTicks,
          yTickFormat: formatAxisWan,
          curveType: 'linear',
          lineWidth: 2,
          barPadding: 0.06,
          groupMaxWidth: 5,
          xDomainPad: 0.4,
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

        this.mountTrafficChart()
        this.mountQualityChart()
      },
      destroyCharts() {
        this.releaseCharts()
      },
    },
    mounted() {
      this.$nextTick(() => {
        requestAnimationFrame(() => this.initCharts())
      })
      // 主题色/明暗由 ProShadcnCharts.refreshAll 原地重挂；勿再 chartEpoch 双挂载
    },
    beforeUnmount() {
      this.destroyCharts()
    },
    template: `
      <div class="component-showcase-page component-chart-extended component-chart-grid">
        <a-alert
          class="component-showcase-tip"
          type="info"
          show-icon
          :closable="false"
        >
          业务图表演示：交互式柱状图、波动面积图、分组柱状图、柱线组合图、对比面积图、双系列折线图、百分比对比图、异常检测散点图、日 K 走势图。
        </a-alert>

        <a-card class="pro-page-card component-showcase-card shadcn-chart-card cce-interactive-card">
          <div class="cce-interactive-head">
            <div class="cce-interactive-head-main">
              <div class="component-showcase-group-title">{{ t.interactiveTitle }}</div>
              <p class="component-chart-card-desc">{{ t.interactiveDesc }}</p>
            </div>
            <div class="cce-metric-tabs" role="tablist" :aria-label="t.interactiveTitle">
              <button
                type="button"
                role="tab"
                class="cce-metric-tab"
                :class="{ 'is-active': activeBarKey === 'desktop' }"
                :aria-selected="activeBarKey === 'desktop' ? 'true' : 'false'"
                @click="setActiveBarKey('desktop')"
              >
                <span class="cce-metric-tab-label">{{ t.desktop }}</span>
                <span class="cce-metric-tab-value">{{ formatLocaleCount(interactiveBarTotals.desktop) }}</span>
              </button>
              <button
                type="button"
                role="tab"
                class="cce-metric-tab"
                :class="{ 'is-active': activeBarKey === 'mobile' }"
                :aria-selected="activeBarKey === 'mobile' ? 'true' : 'false'"
                @click="setActiveBarKey('mobile')"
              >
                <span class="cce-metric-tab-label">{{ t.mobile }}</span>
                <span class="cce-metric-tab-value">{{ formatLocaleCount(interactiveBarTotals.mobile) }}</span>
              </button>
            </div>
          </div>
          <div class="cce-interactive-chart-wrap">
            <div class="cce-interactive-chart-stage">
              <div
                :key="'ibar-' + chartEpoch + '-' + activeBarKey"
                ref="interactiveBarChart"
                class="shadcn-chart-host component-chart-host cce-interactive-chart"
              ></div>
            </div>
          </div>
        </a-card>

        <a-card class="pro-page-card component-showcase-card shadcn-chart-card">
          <div class="cce-card-head">
            <div class="component-showcase-group-title">波动面积图</div>
            <div class="ecom-chart-legend ecom-chart-legend--inline">
              <span class="ecom-chart-legend-item">
                <i class="ecom-chart-legend-dot" style="background: var(--chart-1)"></i>{{ t.sparkValue }}
              </span>
            </div>
          </div>
          <p class="component-chart-card-desc">高频采样走势，强调短期波动形态</p>
          <div
            :key="'spark-' + chartEpoch"
            ref="sparkAreaChart"
            class="shadcn-chart-host component-chart-host cce-spark-area ecom-chart-motion"
          ></div>
        </a-card>

        <a-card class="pro-page-card component-showcase-card shadcn-chart-card">
          <div class="cce-card-head">
            <div class="component-showcase-group-title">分组柱状图</div>
            <div class="ecom-chart-legend ecom-chart-legend--inline">
              <span v-for="item in clusterLegend" :key="item.key" class="ecom-chart-legend-item">
                <i class="ecom-chart-legend-bar" :style="{ background: item.color }"></i>{{ item.label }}
              </span>
            </div>
          </div>
          <p class="component-chart-card-desc">四系列同组对比，便于渠道量级并列阅读</p>
          <div
            :key="'cluster-' + chartEpoch"
            ref="clusterBarChart"
            class="shadcn-chart-host component-chart-host ecom-sales-chart ecom-chart-motion"
          ></div>
        </a-card>

        <a-card class="pro-page-card component-showcase-card shadcn-chart-card">
          <div class="cce-card-head">
            <div class="component-showcase-group-title">柱线组合图</div>
            <div class="ecom-chart-legend ecom-chart-legend--inline">
              <span class="ecom-chart-legend-item">
                <i class="ecom-chart-legend-dot" style="background: var(--chart-1)"></i>{{ t.seriesRevenue }}
              </span>
              <span class="ecom-chart-legend-item">
                <i class="ecom-chart-legend-bar" style="background: color-mix(in srgb, var(--chart-1) 35%, transparent)"></i>{{ t.seriesProfit }}
              </span>
            </div>
          </div>
          <p class="component-chart-card-desc">折线看收入走势，柱状同步看利润量级</p>
          <div
            :key="'sales-' + chartEpoch"
            ref="salesChart"
            class="shadcn-chart-host component-chart-host ecom-sales-chart ecom-chart-motion"
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
        </a-card>

        <a-card class="pro-page-card component-showcase-card shadcn-chart-card">
          <div class="cce-card-head">
            <div class="component-showcase-group-title">对比面积图</div>
            <div class="ecom-chart-legend ecom-chart-legend--inline">
              <span class="ecom-chart-legend-item">
                <i class="ecom-chart-legend-dot" style="background: var(--chart-1)"></i>{{ t.visitors }}
              </span>
              <span class="ecom-chart-legend-item">
                <i class="ecom-chart-legend-dot" style="background: rgb(var(--danger-6))"></i>{{ t.anomalies }}
              </span>
            </div>
          </div>
          <p class="component-chart-card-desc">双系列趋势同屏对照，便于差距阅读</p>
          <div
            :key="'traffic-' + chartEpoch"
            ref="trafficChart"
            class="shadcn-chart-host component-chart-host ecom-traffic-chart ecom-chart-motion"
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

        <a-card class="pro-page-card component-showcase-card shadcn-chart-card">
          <div class="cce-card-head">
            <div class="component-showcase-group-title">双系列折线图</div>
            <div class="ecom-chart-legend ecom-chart-legend--inline">
              <span v-for="item in qualityLegend" :key="item.key" class="ecom-chart-legend-item">
                <i class="ecom-chart-legend-dot" :style="{ background: item.color }"></i>{{ item.label }}
              </span>
            </div>
          </div>
          <p class="component-chart-card-desc">多指标随时间走势跟踪，便于找拐点</p>
          <div
            :key="'quality-' + chartEpoch"
            ref="qualityChart"
            class="shadcn-chart-host component-chart-host anl-quality-chart ecom-chart-motion"
          ></div>
        </a-card>

        <a-card class="pro-page-card component-showcase-card shadcn-chart-card">
          <div class="cce-card-head">
            <div class="component-showcase-group-title">百分比对比图</div>
            <div class="ecom-chart-legend ecom-chart-legend--inline">
              <span v-for="item in percentTrackLegend" :key="item.key" class="ecom-chart-legend-item">
                <i class="ecom-chart-legend-bar" :style="{ background: item.color }"></i>{{ item.label }}
              </span>
            </div>
          </div>
          <p class="component-chart-card-desc">满轨背景对照目标，无网格仅保留底轴；偏低项警示色突出</p>
          <div
            :key="'pct-' + chartEpoch"
            ref="percentTrackChart"
            class="shadcn-chart-host component-chart-host cce-percent-track-chart ecom-chart-motion"
          ></div>
        </a-card>

        <a-card class="pro-page-card component-showcase-card shadcn-chart-card">
          <div class="cce-card-head">
            <div class="component-showcase-group-title">异常检测散点图</div>
            <div class="ecom-chart-legend ecom-chart-legend--inline">
              <span v-for="item in scatterLegend" :key="item.key" class="ecom-chart-legend-item">
                <i class="ecom-chart-legend-dot" :style="{ background: item.color }"></i>{{ item.label }}
              </span>
            </div>
          </div>
          <p class="component-chart-card-desc">正常与异常两类样本在坐标平面上的分布对比</p>
          <div
            :key="'scatter-' + chartEpoch"
            ref="scatterChart"
            class="shadcn-chart-host component-chart-host cce-scatter-chart ecom-chart-motion"
          ></div>
        </a-card>

        <a-card class="pro-page-card component-showcase-card shadcn-chart-card">
          <div class="cce-card-head">
            <div class="component-showcase-group-title">日 K 走势图</div>
            <div class="ecom-chart-legend ecom-chart-legend--inline">
              <span v-for="item in candleLegend" :key="item.key" class="ecom-chart-legend-item">
                <i class="ecom-chart-legend-bar" :style="{ background: item.color }"></i>{{ item.label }}
              </span>
            </div>
          </div>
          <p class="component-chart-card-desc">开高低收形态，快速识别涨跌区间</p>
          <div
            :key="'candle-' + chartEpoch"
            ref="candleChart"
            class="shadcn-chart-host component-chart-host cce-candle-chart ecom-chart-motion"
          ></div>
        </a-card>
      </div>
    `,
  }

  mountProPage({
    pageKey: 'chart/extended',
    title: ArcoProLocale.menu['menu.chart.extended'] || '扩展图表',
    pageComponent: ChartExtendedPage,
  })
})()
