;(function () {
  const t = ArcoProLocale.workplace
  const SALE_NAMES = ['王雅琳', '陈美玲', '张伟', '李俊杰', '刘思雨', '赵一凡', '周敏', '吴昊']
  const SALE_PRODUCTS = [
    '企业版 · 年付',
    '专业版 · 季付',
    '专业版 · 月付',
    '基础版 · 月付',
    '基础版 · 年付',
  ]
  const SALE_AMOUNTS = [1999, 1680, 1420, 1160, 920]

  function toNativeDate(value) {
    if (!value) return null
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value
    }
    if (typeof value === 'number' || typeof value === 'string') {
      const d = new Date(value)
      return Number.isNaN(d.getTime()) ? null : d
    }
    // Arco RangePicker 常见：Dayjs
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

  function formatMoney(n) {
    return (
      '¥' +
      Number(n).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    )
  }

  function formatInt(n) {
    return Math.round(n).toLocaleString('en-US')
  }

  function mdPadLabel(d) {
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${m}-${day}`
  }

  function mdTimeLabel(d) {
    const h = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    return `${mdPadLabel(d)} ${h}:${min}`
  }

  function dayKey(d) {
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
  }

  function hashSeed(from, to) {
    const a = Math.floor(from.getTime() / 86400000)
    const b = Math.floor(to.getTime() / 86400000)
    return Math.abs((a * 17 + b * 31 + (b - a) * 13) % 997)
  }

  function seededUnit(seed, salt) {
    const x = Math.sin((seed + 1) * 12.9898 + (salt + 1) * 78.233) * 43758.5453
    return x - Math.floor(x)
  }

  function signedPct(seed, salt, minAbs, maxAbs, negative) {
    const mag = minAbs + seededUnit(seed, salt) * (maxAbs - minAbs)
    const v = (negative ? -1 : 1) * mag
    return { value: v, text: `${v >= 0 ? '+' : ''}${v.toFixed(1)}%` }
  }

  function wave(i, seed, amp) {
    return Math.sin((i + 1) * 0.9 + seed * 0.07) * amp + Math.cos((i + 3) * 0.45 + seed * 0.05) * amp * 0.4
  }

  function niceCeil(v) {
    if (v <= 200) return 200
    if (v <= 500) return 500
    if (v <= 1200) return 1200
    if (v <= 2400) return 2400
    if (v <= 3600) return 3600
    if (v <= 6000) return 6000
    if (v <= 12000) return 12000
    return Math.ceil(v / 2000) * 2000
  }

  function yTicks(max) {
    return [0, max * 0.25, max * 0.5, max * 0.75, max].map((n) => Math.round(n))
  }

  function pickPoints(from, to, maxPoints) {
    const days = rangeDays(from, to)
    const count = Math.min(days, maxPoints)
    if (count <= 1) return [startOfDay(from)]
    const points = []
    for (let i = 0; i < count; i += 1) {
      const offset = Math.round((i * (days - 1)) / (count - 1))
      points.push(addDays(startOfDay(from), offset))
    }
    return points
  }

  /** 在区间内均匀取 n 个点（可密于天数，用于锋利折线） */
  function pickDensePoints(from, to, count) {
    const start = startOfDay(from)
    const end = startOfDay(to)
    if (!start || !end) return []
    const spanMs = Math.max(end.getTime() - start.getTime(), 1)
    const n = Math.max(2, count)
    const points = []
    for (let i = 0; i < n; i += 1) {
      const t = i / (n - 1)
      points.push(new Date(start.getTime() + spanMs * t))
    }
    return points
  }

  function jaggedValue(i, n, seed, base, salt) {
    const u = seededUnit(seed, i * 17 + salt)
    const u2 = seededUnit(seed, i * 29 + salt + 5)
    const u3 = seededUnit(seed, i * 41 + salt + 11)
    // 高频抖动 + 局部跳变，形成锋利折角
    let v = base * (0.82 + u * 0.16)
    v += Math.sin(i * 2.6 + seed * 0.11) * base * 0.05
    v += (u2 - 0.5) * base * 0.2
    if (u3 > 0.86) v *= 0.68
    else if (u3 < 0.1) v *= 1.16
    // 中后段一次深 V 下探
    const dip = Math.floor(n * 0.72)
    if (i === dip - 1) v = base * 1.12
    if (i === dip) v = base * 0.48
    if (i === dip + 1) v = base * 0.92
    return Math.max(Math.round(base * 0.32), Math.round(v))
  }

  /** 区间内每个自然月取一个代表日，避免横轴出现重复「N月」 */
  function pickMonths(from, to) {
    const start = startOfDay(from)
    const end = startOfDay(to)
    if (!start || !end) return []
    const points = []
    let y = start.getFullYear()
    let m = start.getMonth()
    const endY = end.getFullYear()
    const endM = end.getMonth()
    while (y < endY || (y === endY && m <= endM)) {
      const monthStart = new Date(y, m, 1)
      const monthEnd = new Date(y, m + 1, 0)
      const clipStart = monthStart < start ? start : monthStart
      const clipEnd = monthEnd > end ? end : monthEnd
      const mid = addDays(clipStart, Math.floor(rangeDays(clipStart, clipEnd) / 2))
      points.push(mid)
      m += 1
      if (m > 11) {
        m = 0
        y += 1
      }
    }
    return points
  }

  function monthLabel(d) {
    return `${d.getMonth() + 1}月`
  }

  function buildTrafficSeries(from, to, seed) {
    const days = rangeDays(from, to)
    let points
    let base
    if (days <= 14) {
      // 加密采样，折线更锋利；横轴按「天」去重标注
      const n = Math.min(56, Math.max(32, days * 5))
      points = pickDensePoints(from, to, n)
      base = 4600
    } else if (days <= 45) {
      const n = Math.min(48, Math.max(28, Math.round(days * 1.2)))
      points = pickDensePoints(from, to, n)
      base = 5200
    } else {
      points = pickMonths(from, to)
      base = 5800
    }
    const n = points.length
    const useMonth = days > 45
    let prevDay = ''
    const rows = points.map((d, i) => {
      const clicks = jaggedValue(i, n, seed, base, 3)
      const uniques = Math.min(
        clicks - 20,
        jaggedValue(i, n, seed + 11, base * 0.62, 8)
      )
      const dk = dayKey(d)
      const isNewDay = dk !== prevDay
      prevDay = dk
      const axisLabel = useMonth ? monthLabel(d) : isNewDay ? mdPadLabel(d) : ''
      const tipLabel = useMonth ? monthLabel(d) : mdTimeLabel(d)
      return {
        x: i,
        label: axisLabel,
        tipLabel: tipLabel,
        clicks,
        uniques: Math.max(40, uniques),
      }
    })

    // 近 7/14 天：每天都标；近 30 日约 10～12 个刻度；更长区间再疏化
    const dayRows = rows.filter((r) => r.label)
    let maxAxisLabels = dayRows.length
    if (!useMonth && days > 14) {
      maxAxisLabels = Math.min(12, Math.max(8, Math.ceil(days / 3)))
    }
    if (dayRows.length > maxAxisLabels) {
      const step = Math.ceil(dayRows.length / maxAxisLabels)
      dayRows.forEach((row, idx) => {
        const keep = idx % step === 0 || idx === dayRows.length - 1
        if (!keep) row.label = ''
      })
    }

    return rows
  }

  function buildRevenueSeries(from, to, seed) {
    const days = rangeDays(from, to)
    let points
    let labelOf
    let base
    if (days <= 14) {
      // 近两周内：每天一根柱，随区间长度变化
      points = pickPoints(from, to, days)
      labelOf = mdPadLabel
      base = 620
    } else if (days <= 45) {
      // 近月：约 8～12 个采样点
      points = pickPoints(from, to, Math.min(12, Math.max(8, Math.round(days / 3))))
      labelOf = mdPadLabel
      base = 1800
    } else {
      // 更长区间：按自然月去重展示
      points = pickMonths(from, to)
      labelOf = monthLabel
      base = 4200
    }
    return points.map((d, i) => ({
      label: labelOf(d),
      total: Math.max(
        120,
        Math.round(base + wave(i, seed + 5, base * 0.28) + ((seed + i * 7) % 120))
      ),
    }))
  }

  function buildWorkplaceMock(from, to, dict, salt = 0) {
    const start = startOfDay(from)
    const end = startOfDay(to)
    const days = rangeDays(start, end)
    const seed = Math.abs((hashSeed(start, end) + salt * 97) % 9973)
    const scale = days / 7
    const jitter = 0.82 + seededUnit(seed, 0) * 0.36

    const revenue = 45231.89 * scale * jitter
    const subs = 2350 * scale * (0.9 + (seed % 9) * 0.015)
    const sales = 12234 * scale * (0.88 + (seed % 7) * 0.02)
    const online = 480 + (seed % 40) * 6 + Math.round(days * 1.2)
    const clicks = 1248 * scale * (0.9 + (seed % 8) * 0.018)
    const uniques = 832 * scale * (0.9 + (seed % 6) * 0.02)
    const bounce = Math.min(58, Math.max(28, Math.round(42 + ((seed % 9) - 4) * 1.2 - days * 0.03)))
    const durationSec = Math.round(204 + ((seed % 13) - 6) * 4 + Math.min(days, 60) * 0.4)
    const durationMin = Math.floor(durationSec / 60)
    const durationRem = durationSec % 60

    const makeDelta = (label, valueText, numeric, invert = false) => {
      let trend = 'flat'
      if (numeric > 0) trend = invert ? 'down' : 'up'
      else if (numeric < 0) trend = invert ? 'up' : 'down'
      return {
        deltaLabel: label,
        deltaValue: valueText,
        deltaTrend: trend,
      }
    }

    // 按区间轮换 3 个下行指标，数值也随 seed 明显变化
    const downSlots = new Set([seed % 8, (seed + 3) % 8, (seed + 5) % 8])
    const isDown = (i) => downSlots.has(i)

    const revenueDelta = signedPct(seed, 1, 6, 24, isDown(0))
    const subsDelta = signedPct(seed, 2, 5, 22, isDown(1))
    const salesDelta = signedPct(seed, 3, 3, 16, isDown(2))
    const onlineDeltaRaw = Math.round((40 + seededUnit(seed, 4) * 220) * (isDown(3) ? -1 : 1))
    const onlineDelta = {
      value: onlineDeltaRaw,
      text: `${onlineDeltaRaw >= 0 ? '+' : ''}${onlineDeltaRaw}`,
    }
    const clicksDelta = signedPct(seed, 5, 4, 18, isDown(4))
    const uniquesDelta = signedPct(seed, 6, 2, 12, isDown(5))
    // 跳出率：正值=变差（红），负值=变好（绿）——用 invert
    const bounceMag = 0.8 + seededUnit(seed, 7) * 4.2
    const bounceNumeric = isDown(6) ? bounceMag : -bounceMag
    const bounceDeltaText = `${bounceNumeric >= 0 ? '+' : ''}${bounceNumeric.toFixed(1)}%`
    const durationMag = Math.round(6 + seededUnit(seed, 8) * 28)
    const durationDelta = isDown(7) ? -durationMag : durationMag

    const channelBase = [
      { name: '直接访问', weight: 43, color: 'var(--chart-1)' },
      { name: '搜索引擎', weight: 20, color: 'var(--chart-2)' },
      { name: '社交媒体', weight: 15, color: 'var(--chart-3)' },
      { name: '外部推荐', weight: 13, color: 'var(--chart-4)' },
      { name: '内容博客', weight: 9, color: 'var(--chart-5)' },
    ]
    const channelTotal = Math.round(1184 * scale * jitter)
    let weightSum = 0
    const channelWeights = channelBase.map((item, i) => {
      const w = Math.max(4, item.weight + ((seed + i * 5) % 7) - 3)
      weightSum += w
      return w
    })
    let assigned = 0
    const channelItems = channelBase.map((item, i) => {
      const value =
        i === channelBase.length - 1
          ? Math.max(1, channelTotal - assigned)
          : Math.max(1, Math.round((channelTotal * channelWeights[i]) / weightSum))
      assigned += value
      return { name: item.name, value, color: item.color }
    })

    const deviceShift = (seed % 5) - 2
    let desktop = Math.min(72, Math.max(48, 58 + deviceShift))
    let mobile = Math.min(40, Math.max(22, 32 - deviceShift))
    let tablet = Math.min(10, Math.max(4, 6 + ((seed % 3) - 1)))
    let tv = Math.min(5, Math.max(1, 3))
    let other = Math.max(1, 100 - desktop - mobile - tablet - tv)
    if (desktop + mobile + tablet + tv + other !== 100) {
      other = Math.max(1, 100 - desktop - mobile - tablet - tv)
    }
    const deviceItems = [
      { name: '桌面端', value: desktop, color: 'var(--chart-1)', icon: 'icon-desktop' },
      { name: '移动端', value: mobile, color: 'var(--chart-1)', icon: 'icon-mobile' },
      { name: '平板', value: tablet, color: 'var(--chart-1)', icon: 'icon-tablet' },
      { name: '智能电视', value: tv, color: 'var(--chart-1)', icon: 'icon-tv' },
      { name: '其他', value: other, color: 'var(--chart-1)', icon: 'icon-ellipsis' },
    ]

    const recentSales = Array.from({ length: 5 }, (_, i) => {
      const amount = SALE_AMOUNTS[(seed + i) % SALE_AMOUNTS.length]
      const hours = 1 + ((seed + i * 4) % (days <= 7 ? 20 : 72))
      let time
      if (hours < 1) time = '刚刚'
      else if (hours < 24) time = `${hours} 小时前`
      else time = `${Math.floor(hours / 24)} 天前`
      return {
        name: SALE_NAMES[(seed + i * 2) % SALE_NAMES.length],
        product: SALE_PRODUCTS[(seed + i) % SALE_PRODUCTS.length],
        amount,
        amountText: `+${formatMoney(amount)}`,
        time,
      }
    }).sort((a, b) => b.amount - a.amount)

    const trafficSeries = buildTrafficSeries(start, end, seed)
    const revenueSeries = buildRevenueSeries(start, end, seed)
    const trafficPeak = Math.max(...trafficSeries.map((d) => Math.max(d.clicks, d.uniques)), 1)
    const trafficMax = niceCeil(trafficPeak * 1.08)

    return {
      businessKpis: [
        {
          key: 'revenue',
          title: dict.kpiRevenue,
          value: formatMoney(revenue),
          ...makeDelta('较上周期', revenueDelta.text, revenueDelta.value),
          icon: 'icon-yen-solid',
        },
        {
          key: 'subs',
          title: dict.kpiSubs,
          value: formatInt(subs),
          ...makeDelta('较上周期', subsDelta.text, subsDelta.value),
          icon: 'icon-user-group-solid',
        },
        {
          key: 'sales',
          title: dict.kpiSales,
          value: formatInt(sales),
          ...makeDelta('较上周期', salesDelta.text, salesDelta.value),
          icon: 'icon-credit-card-solid',
        },
        {
          key: 'online',
          title: dict.kpiOnline,
          value: formatInt(online),
          ...makeDelta('较上小时', onlineDelta.text, onlineDelta.value),
          icon: 'icon-activity-solid',
        },
      ],
      trafficKpis: [
        {
          key: 'clicks',
          title: dict.kpiClicks,
          value: formatInt(clicks),
          ...makeDelta('较上周期', clicksDelta.text, clicksDelta.value),
          icon: 'icon-chart-column-solid',
        },
        {
          key: 'uniques',
          title: dict.kpiUniques,
          value: formatInt(uniques),
          ...makeDelta('较上周期', uniquesDelta.text, uniquesDelta.value),
          icon: 'icon-user-solid',
        },
        {
          key: 'bounce',
          title: dict.kpiBounce,
          value: `${bounce}%`,
          ...makeDelta('较上周期', bounceDeltaText, bounceNumeric, true),
          icon: 'icon-bounce-solid',
        },
        {
          key: 'duration',
          title: dict.kpiDuration,
          value: `${durationMin}分 ${durationRem}秒`,
          ...makeDelta(
            '较上周期',
            `${durationDelta >= 0 ? '+' : ''}${durationDelta}秒`,
            durationDelta
          ),
          icon: 'icon-clock-solid',
        },
      ],
      recentSales,
      channelItems,
      deviceItems,
      trafficSeries,
      revenueSeries,
      trafficYDomain: [0, trafficMax],
      trafficYTicks: yTicks(trafficMax),
      trafficOverviewDesc: dict.trafficOverviewDesc,
      revenueOverviewDesc: dict.revenueOverviewDesc,
    }
  }

  const quickAccessItems = [
    { key: 'overview', label: t.shortcutOverview, icon: 'icon-dashboard' },
    { key: 'traffic', label: t.shortcutTraffic, icon: 'icon-chart-area' },
    { key: 'revenue', label: t.shortcutRevenue, icon: 'icon-credit-card' },
    { key: 'sales', label: t.shortcutSales, icon: 'icon-file' },
    { key: 'users', label: t.shortcutUsers, icon: 'icon-user-group' },
    { key: 'channels', label: t.shortcutChannels, icon: 'icon-apps' },
    { key: 'devices', label: t.shortcutDevices, icon: 'icon-mobile' },
    { key: 'export', label: t.shortcutExport, icon: 'icon-download' },
    { key: 'settings', label: t.shortcutSettings, icon: 'icon-settings' },
  ]

  const todoItemsSeed = [
    { id: 1, title: '审核本周新增企业客户', tag: '高优', tagTone: 'danger', due: '今天 18:00', done: false },
    { id: 2, title: '导出上月收入明细', tag: '财务', tagTone: 'warning', due: '今天 17:30', done: false },
    { id: 3, title: '同步渠道归因报表', tag: '运营', tagTone: 'primary', due: '明天', done: true },
    { id: 4, title: '确认设备端埋点口径', tag: '数据', tagTone: 'success', due: '本周五', done: false },
    { id: 5, title: '核对流量漏斗转化异常', tag: '高优', tagTone: 'danger', due: '今天 12:00', done: false },
    { id: 6, title: '更新销售排行样本量', tag: '运营', tagTone: 'primary', due: '周三', done: false },
  ]

  const noticeItemsSeed = [
    { id: 1, title: '系统将于今晚 23:00 进行例行维护', time: '2026-08-08 14:52', tone: 'warning', tag: '维护' },
    { id: 2, title: '新版本看板组件已发布，可体验新图表', time: '2026-08-08 13:18', tone: 'primary', tag: '更新' },
    { id: 3, title: '3 条订单待人工复核', time: '2026-08-08 09:20', tone: 'danger', tag: '告警' },
    { id: 4, title: '团队周报已汇总完成', time: '2026-08-07 18:40', tone: 'success', tag: '通知' },
    { id: 5, title: '独立访客周环比下降超过 5%', time: '2026-08-07 11:05', tone: 'warning', tag: '告警' },
    { id: 6, title: '渠道「内容博客」归因规则已更新', time: '2026-08-06 16:28', tone: 'primary', tag: '更新' },
  ]

  const WorkplacePage = {
    name: 'WorkplacePage',
    data() {
      const today = startOfDay(new Date())
      const [from, to] = presetRange('7d', today)
      const mock = buildWorkplaceMock(from, to, t)
      return {
        t,
        timePreset: '7d',
        dateRange: [from, to],
        dataMax: today,
        dataMin: addDays(today, -89),
        refreshNonce: 0,
        refreshing: false,
        businessKpis: mock.businessKpis,
        trafficKpis: mock.trafficKpis,
        recentSales: mock.recentSales,
        channelItems: mock.channelItems,
        deviceItems: mock.deviceItems,
        trafficSeries: mock.trafficSeries,
        revenueSeries: mock.revenueSeries,
        trafficYDomain: mock.trafficYDomain,
        trafficYTicks: mock.trafficYTicks,
        trafficOverviewDesc: mock.trafficOverviewDesc,
        revenueOverviewDesc: mock.revenueOverviewDesc,
        quickAccessItems,
        todoItems: todoItemsSeed.map((item) => ({ ...item })),
        noticeItems: noticeItemsSeed,
        trafficLegend: [
          { label: t.legendClicks, color: 'var(--chart-1)' },
          { label: t.legendUniques, color: 'var(--chart-2)' },
        ],
      }
    },
    computed: {
      channelTotal() {
        return this.channelItems.reduce((sum, item) => sum + item.value, 0)
      },
      channelLegend() {
        const total = this.channelTotal || 1
        return this.channelItems.map((item) => ({
          ...item,
          percent: (item.value / total) * 100,
          percentText: `${((item.value / total) * 100).toFixed(2)}%`,
        }))
      },
      deviceMax() {
        return Math.max(...this.deviceItems.map((i) => i.value), 1)
      },
      saleMax() {
        return Math.max(...this.recentSales.map((i) => i.amount), 1)
      },
    },
    watch: {
      dateRange: {
        deep: true,
        handler(value) {
          if (this._rangeSilent) return
          this.commitDateRange(value)
        },
      },
    },
    methods: {
      kpiAccent(index) {
        const api = window.ArcoProChartPalette
        if (api && api.getScheme(api.getCurrentId()).mode === 'theme') {
          return 'var(--chart-1)'
        }
        return 'var(--chart-' + ((index % 10) + 1) + ')'
      },
      onExport() {
        ArcoVue.Message.success(t.exportTip)
      },
      onRefresh() {
        if (this.refreshing) return
        this.refreshing = true
        this.refreshNonce += 1
        this.refreshByRange(true)
        ArcoVue.Message.success(t.refreshTip)
        window.setTimeout(() => {
          this.refreshing = false
        }, 600)
      },
      onShortcut(item) {
        ArcoVue.Message.success(`${t.shortcutOpened}：${item.label}`)
      },
      onToggleTodo(item) {
        item.done = !item.done
        ArcoVue.Message.success(t.todoDoneTip)
      },
      onAsideMore(kind) {
        ArcoVue.Message.info(`${t.viewMore} · ${kind}`)
      },
      onNoticeClick(item) {
        ArcoVue.Message.success(`${t.noticeOpened}：${item.title}`)
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
          // 仍同步预设文案（例如手动选成了近 7 天）
          const preset = syncPreset(from, to, this.dataMax)
          if (this.timePreset !== preset) this.timePreset = preset
          return
        }
        this._rangeKey = key
        this._rangeSilent = true
        this.dateRange = [from, to]
        this.timePreset = syncPreset(from, to, this.dataMax)
        this._rangeSilent = false
        this.refreshByRange(true)
      },
      onPresetChange(value) {
        if (value === 'custom') return
        this.timePreset = value
        // 「近 N 天」始终以可查数据的最后一天为终点
        this.commitDateRange(presetRange(value, this.dataMax))
      },
      onDateRangeChange(value) {
        // Arco 可能先改 v-model 再抛 change；统一走 commit，兼容 Dayjs
        this.commitDateRange(value && value[0] ? value : this.dateRange)
      },
      disabledDate(date) {
        const day = startOfDay(date)
        if (!day) return true
        return day < this.dataMin || day > this.dataMax
      },
      barWidth(value, max) {
        return `${Math.round((value / max) * 100)}%`
      },
      refreshByRange(remountCharts) {
        if (!this.dateRange || !this.dateRange[0] || !this.dateRange[1]) return
        const from = startOfDay(this.dateRange[0])
        const to = startOfDay(this.dateRange[1])
        if (!from || !to) return
        const mock = buildWorkplaceMock(from, to, t, this.refreshNonce || 0)
        this.businessKpis = mock.businessKpis
        this.trafficKpis = mock.trafficKpis
        this.recentSales = mock.recentSales
        this.channelItems = mock.channelItems
        this.deviceItems = mock.deviceItems
        this.trafficSeries = mock.trafficSeries
        this.revenueSeries = mock.revenueSeries
        this.trafficYDomain = mock.trafficYDomain
        this.trafficYTicks = mock.trafficYTicks
        this.trafficOverviewDesc = mock.trafficOverviewDesc
        this.revenueOverviewDesc = mock.revenueOverviewDesc
        if (remountCharts) {
          this.$nextTick(() => {
            this.destroyCharts()
            this.initCharts()
          })
        }
      },
      initCharts() {
        if (!window.ProShadcnCharts) return
        this._trafficChart = ProShadcnCharts.mountAreaChart(this.$refs.trafficChart, {
          data: this.trafficSeries,
          height: 360,
          x: (d) => d.x,
          xLabel: (d) => d.label || '',
          tooltipLabel: (d) => d.tipLabel || d.label || '',
          xTickValues: this.trafficSeries.filter((d) => d.label).map((d) => d.x),
          stacked: false,
          curveType: 'linear',
          lineWidth: 2,
          yDomain: this.trafficYDomain,
          yTickValues: this.trafficYTicks,
          // 图例在标题右侧：只修底轴
          autoMargin: false,
          margin: { top: 6, bottom: 22, right: 8 },
          series: [
            { key: 'clicks', label: t.legendClicks, color: 'var(--chart-1)', opacity: 0.22 },
            { key: 'uniques', label: t.legendUniques, color: 'var(--chart-2)', opacity: 0.14 },
          ],
        })
        this._revenueChart = ProShadcnCharts.mountBarChart(this.$refs.revenueChart, {
          data: this.revenueSeries,
          height: 300,
          x: (d) => d.label,
          xLabel: (d) => d.label,
          crosshair: false,
          series: [{ key: 'total', label: t.revenueSeries, color: 'var(--chart-1)' }],
          yTickFormat: (v) => `¥${v}`,
          yTickPadding: 8,
          xDomainPad: 0.35,
          // 无底图例：只修底轴
          autoMargin: false,
          margin: { top: 6, bottom: 22, right: 8 },
        })
        this._channelChart = ProShadcnCharts.mountDonutChart(this.$refs.channelChart, {
          data: this.channelLegend.map((item) => ({
            label: item.name,
            value: Number(item.percent.toFixed(2)),
          })),
          height: 200,
          radius: 100,
          arcWidth: 28,
          padAngle: 0,
          centralLabel: String(this.channelTotal).replace(/\B(?=(\d{3})+(?!\d))/g, ','),
          centralSubLabel: t.channelsTotal,
          colors: this.channelItems.map((item) => item.color),
        })
      },
      destroyCharts() {
        ProShadcnCharts.destroy(this._trafficChart)
        ProShadcnCharts.destroy(this._revenueChart)
        ProShadcnCharts.destroy(this._channelChart)
        this._trafficChart = null
        this._revenueChart = null
        this._channelChart = null
      },
    },
    mounted() {
      this._rangeKey = this.rangeKeyOf(this.dateRange[0], this.dateRange[1])
      this.$nextTick(() => this.initCharts())
      this._onChartPalette = () => this.$forceUpdate()
      window.addEventListener('arco-pro-chart-palette-change', this._onChartPalette)
      window.addEventListener('arco-pro-theme-change', this._onChartPalette)
    },
    beforeUnmount() {
      this.destroyCharts()
      if (this._onChartPalette) {
        window.removeEventListener('arco-pro-chart-palette-change', this._onChartPalette)
        window.removeEventListener('arco-pro-theme-change', this._onChartPalette)
      }
    },
    template: `
      <div class="workplace-page">
        <div class="workplace-header">
          <div class="workplace-header-text">
            <h2 class="workplace-title">{{ t.pageTitle }}</h2>
            <p class="workplace-desc">{{ t.pageDesc }}</p>
          </div>
          <div class="workplace-filters">
            <a-button
              type="secondary"
              size="medium"
              class="workplace-refresh-btn"
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
            <a-button type="primary" size="medium" class="workplace-export-btn" @click="onExport">
              <template #icon><icon-download /></template>
              {{ t.export }}
            </a-button>
          </div>
        </div>

        <a-row :gutter="[16, 16]" class="workplace-kpi-row">
          <a-col v-for="(item, index) in businessKpis" :key="item.key" :xs="24" :sm="12" :lg="6">
            <a-card
              class="workplace-card general-card workplace-kpi-card"
              :bordered="true"
              :style="{ '--kpi-accent': kpiAccent(index) }"
            >
              <div class="workplace-kpi-body">
                <div class="workplace-kpi-main">
                  <span class="workplace-kpi-title">{{ item.title }}</span>
                  <div class="workplace-kpi-value">{{ item.value }}</div>
                  <div class="workplace-kpi-delta">
                    <span class="workplace-kpi-delta-label">{{ item.deltaLabel }}</span>
                    <span class="workplace-kpi-delta-value" :class="'is-' + item.deltaTrend">{{ item.deltaValue }}</span>
                  </div>
                </div>
                <span class="workplace-kpi-icon-wrap" aria-hidden="true">
                  <span class="workplace-kpi-icon-box">
                    <component :is="item.icon" class="workplace-kpi-icon" />
                  </span>
                </span>
              </div>
            </a-card>
          </a-col>
        </a-row>

        <a-row :gutter="[16, 16]" class="workplace-kpi-row">
          <a-col v-for="(item, index) in trafficKpis" :key="item.key" :xs="24" :sm="12" :lg="6">
            <a-card
              class="workplace-card general-card workplace-kpi-card"
              :bordered="true"
              :style="{ '--kpi-accent': kpiAccent(businessKpis.length + index) }"
            >
              <div class="workplace-kpi-body">
                <div class="workplace-kpi-main">
                  <span class="workplace-kpi-title">{{ item.title }}</span>
                  <div class="workplace-kpi-value">{{ item.value }}</div>
                  <div class="workplace-kpi-delta">
                    <span class="workplace-kpi-delta-label">{{ item.deltaLabel }}</span>
                    <span class="workplace-kpi-delta-value" :class="'is-' + item.deltaTrend">{{ item.deltaValue }}</span>
                  </div>
                </div>
                <span class="workplace-kpi-icon-wrap" aria-hidden="true">
                  <span class="workplace-kpi-icon-box">
                    <component :is="item.icon" class="workplace-kpi-icon" />
                  </span>
                </span>
              </div>
            </a-card>
          </a-col>
        </a-row>

        <a-row :gutter="[16, 16]" class="workplace-body-row">
          <a-col :xs="24" :lg="18" class="workplace-main-col">
            <a-card class="workplace-card general-card workplace-section-card">
              <div class="workplace-section-head workplace-section-head--stack">
                <a-typography-title :heading="6" class="workplace-section-title">{{ t.trafficOverview }}</a-typography-title>
                <a-typography-text type="secondary" class="workplace-section-desc">{{ trafficOverviewDesc }}</a-typography-text>
              </div>
              <div ref="trafficChart" class="shadcn-chart-host workplace-chart-host"></div>
              <div class="shadcn-chart-legend">
                <span v-for="item in trafficLegend" :key="item.label" class="shadcn-chart-legend-item">
                  <span class="shadcn-chart-legend-dot" :style="{ '--legend-color': item.color }"></span>{{ item.label }}
                </span>
              </div>
            </a-card>

            <a-row :gutter="[16, 16]" class="workplace-split-row">
              <a-col :xs="24" :lg="12">
                <a-card class="workplace-card general-card workplace-section-card workplace-section-card--fill">
                  <div class="workplace-section-head workplace-section-head--stack">
                    <a-typography-title :heading="6" class="workplace-section-title">{{ t.revenueOverview }}</a-typography-title>
                    <a-typography-text type="secondary" class="workplace-section-desc">{{ revenueOverviewDesc }}</a-typography-text>
                  </div>
                  <div ref="revenueChart" class="shadcn-chart-host workplace-chart-host workplace-chart-host--bar"></div>
                </a-card>
              </a-col>
              <a-col :xs="24" :lg="12">
                <a-card class="workplace-card general-card workplace-section-card workplace-section-card--fill">
                  <div class="workplace-section-head workplace-section-head--stack">
                    <a-typography-title :heading="6" class="workplace-section-title">{{ t.recentSales }}</a-typography-title>
                    <a-typography-text type="secondary" class="workplace-section-desc">{{ t.recentSalesDesc }}</a-typography-text>
                  </div>
                  <ul class="workplace-sales-list">
                    <li v-for="(sale, index) in recentSales" :key="sale.name + sale.time" class="workplace-sales-item">
                      <span class="workplace-sales-rank" :class="{ 'is-top': index < 3 }">{{ index + 1 }}</span>
                      <div class="workplace-sales-meta">
                        <div class="workplace-sales-row">
                          <span class="workplace-sales-name">{{ sale.name }}</span>
                          <span class="workplace-sales-amount">{{ sale.amountText }}</span>
                        </div>
                        <div class="workplace-sales-row workplace-sales-row--sub">
                          <span class="workplace-sales-product">{{ sale.product }}</span>
                          <span class="workplace-sales-time">{{ sale.time }}</span>
                        </div>
                        <div class="workplace-sales-track">
                          <div class="workplace-sales-fill" :style="{ width: barWidth(sale.amount, saleMax) }"></div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </a-card>
              </a-col>
            </a-row>

            <a-row :gutter="[16, 16]" class="workplace-split-row">
              <a-col :xs="24" :lg="12">
                <a-card class="workplace-card general-card workplace-section-card workplace-section-card--fill shadcn-donut-card">
                  <div class="workplace-section-head workplace-section-head--stack">
                    <a-typography-title :heading="6" class="workplace-section-title">{{ t.channels }}</a-typography-title>
                    <a-typography-text type="secondary" class="workplace-section-desc">{{ t.channelsDesc }}</a-typography-text>
                  </div>
                  <div class="shadcn-donut-layout">
                    <div class="shadcn-donut-chart">
                      <div ref="channelChart" class="shadcn-chart-host shadcn-chart-host--donut shadcn-donut-host"></div>
                    </div>
                    <div class="shadcn-donut-legend-wrap">
                      <ul class="shadcn-donut-legend shadcn-donut-legend--inline">
                        <li v-for="item in channelLegend" :key="item.name" class="shadcn-donut-legend-item">
                          <div class="shadcn-donut-legend-name-row">
                            <i class="shadcn-donut-legend-dot" :style="{ background: item.color }"></i>
                            <span class="shadcn-donut-legend-label">{{ item.name }}</span>
                          </div>
                          <div class="shadcn-donut-legend-meta">
                            <span class="shadcn-donut-legend-value">{{ item.value }}</span>
                            <span class="shadcn-donut-legend-pct">{{ item.percentText }}</span>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </a-card>
              </a-col>
              <a-col :xs="24" :lg="12">
                <a-card class="workplace-card general-card workplace-section-card workplace-section-card--fill">
                  <div class="workplace-section-head workplace-section-head--stack">
                    <a-typography-title :heading="6" class="workplace-section-title">{{ t.devices }}</a-typography-title>
                    <a-typography-text type="secondary" class="workplace-section-desc">{{ t.devicesDesc }}</a-typography-text>
                  </div>
                  <ul class="workplace-bar-list">
                    <li v-for="item in deviceItems" :key="item.name" class="workplace-bar-item">
                      <span class="workplace-bar-icon-wrap" aria-hidden="true">
                        <component :is="item.icon" class="workplace-bar-tag-icon" :size="14" />
                      </span>
                      <div class="workplace-bar-main">
                        <div class="workplace-bar-head">
                          <span class="workplace-bar-label">{{ item.name }}</span>
                          <span class="workplace-bar-value">{{ item.value }}%</span>
                        </div>
                        <div class="workplace-bar-track">
                          <div
                            class="workplace-bar-fill"
                            :style="{ width: barWidth(item.value, deviceMax), background: item.color }"
                          ></div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </a-card>
              </a-col>
            </a-row>
          </a-col>

          <a-col :xs="24" :lg="6" class="workplace-aside-col">
            <div class="workplace-aside">
              <a-card class="workplace-card general-card workplace-aside-card" :bordered="true">
                <div class="workplace-section-head workplace-section-head--stack workplace-aside-head">
                  <a-typography-title :heading="6" class="workplace-section-title">{{ t.quickAccess }}</a-typography-title>
                </div>
                <div class="workplace-shortcuts">
                  <button
                    v-for="item in quickAccessItems"
                    :key="item.key"
                    type="button"
                    class="workplace-shortcut"
                    @click="onShortcut(item)"
                  >
                    <span class="workplace-shortcut-icon">
                      <component :is="item.icon" />
                    </span>
                    <span class="workplace-shortcut-label">{{ item.label }}</span>
                  </button>
                </div>
              </a-card>

              <a-card class="workplace-card general-card workplace-aside-card" :bordered="true">
                <div class="workplace-aside-head-row">
                  <a-typography-title :heading="6" class="workplace-section-title">{{ t.todoList }}</a-typography-title>
                  <a-link @click="onAsideMore(t.todoList)">{{ t.viewMore }}</a-link>
                </div>
                <ul class="workplace-todo-list">
                  <li v-for="item in todoItems" :key="item.id" class="workplace-todo-item" :class="{ 'is-done': item.done }">
                    <a-checkbox :model-value="item.done" @change="() => onToggleTodo(item)" />
                    <div class="workplace-todo-body">
                      <div class="workplace-todo-main">
                        <span class="workplace-todo-title">{{ item.title }}</span>
                        <span class="workplace-todo-tag" :class="'is-' + item.tagTone">{{ item.tag }}</span>
                      </div>
                      <div class="workplace-todo-due">{{ item.due }}</div>
                    </div>
                  </li>
                </ul>
              </a-card>

              <a-card class="workplace-card general-card workplace-aside-card" :bordered="true">
                <div class="workplace-aside-head-row">
                  <a-typography-title :heading="6" class="workplace-section-title">{{ t.noticeList }}</a-typography-title>
                  <a-link @click="onAsideMore(t.noticeList)">{{ t.viewMore }}</a-link>
                </div>
                <ul class="workplace-notice-list">
                  <li
                    v-for="item in noticeItems"
                    :key="item.id"
                    class="workplace-notice-item"
                  >
                    <span class="workplace-notice-tag" :class="'is-' + item.tone">{{ item.tag }}</span>
                    <div class="workplace-notice-meta">
                      <button type="button" class="workplace-notice-title" @click="onNoticeClick(item)">
                        {{ item.title }}
                      </button>
                      <div class="workplace-notice-time">{{ item.time }}</div>
                    </div>
                    <span class="workplace-notice-arrow" aria-hidden="true">
                      <icon-right />
                    </span>
                  </li>
                </ul>
              </a-card>
            </div>
          </a-col>
        </a-row>
      </div>
    `,
  }

  mountProPage({
    pageKey: 'dashboard/workplace',
    title: t.pageTitle,
    pageComponent: WorkplacePage,
  })
})()
