/**
 * shadcn/vue 风格图表适配层（底层 Unovis，与 shadcn-vue Chart 同源）
 * @see https://www.shadcn-vue.com/docs/components/chart
 */
;(function () {
  const { Axis, Area, Line, Donut, GroupedBar, StackedBar, XYContainer, SingleContainer, Crosshair, Tooltip, CurveType } =
    window.Unovis || {}

  if (!XYContainer) {
    console.warn('[ProShadcnCharts] Unovis 未加载，图表将不可用')
    window.ProShadcnCharts = {
      mountAreaChart() {},
      mountLineChart() {},
      mountDonutChart() {},
      mountBarChart() {},
      mountStackedBarChart() {},
      mountHorizontalBarChart() {},
      mountComboChart() {},
      mountRadarChart() {},
      mountRadialBarChart() {},
      mountGaugeChart() {},
      mountLiquidFillChart() {},
      mountCandlestickChart() {},
      mountScatterChart() {},
      mountPercentTrackBarChart() {},
      mountRoseChart() {},
      destroy() {},
      refreshAll() {},
    }
    window.ProShadcnChartData = {}
    return
  }

  const CHART_COLORS = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
  ]

  function chartTokenAt(index) {
    return 'var(--chart-' + ((index % 10) + 1) + ')'
  }

  /** 柱图默认最大柱宽（px）；类目少时避免撑满绘图区显得过粗。业务可传 groupMaxWidth / barMaxWidth / groupWidth / barWidth 覆盖 */
  const DEFAULT_BAR_MAX_WIDTH = 40

  function cssColor(el, token, fallback) {
    if (!el) return fallback
    const v = getComputedStyle(el).getPropertyValue(token).trim()
    return v || fallback
  }

  function resolveColor(el, color, fallback) {
    if (!color) return fallback
    const raw = String(color)
    if (raw.startsWith('var(')) {
      const token = raw.replace(/^var\(|\)$/g, '').trim()
      const v = cssColor(el, token, '')
      if (v) {
        // Unovis 旧式「色相 饱和度% 亮度%」通道串，勿误伤 color-mix()
        if (
          !v.includes('color-mix') &&
          !v.startsWith('rgb') &&
          !v.startsWith('hsl') &&
          /^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%/.test(v)
        ) {
          return `hsl(${v})`
        }
        // color-mix 等需落到计算色，SVG fill 属性更稳
        if (v.includes('color-mix') || v.startsWith('var(')) {
          const probe = document.createElement('span')
          probe.style.color = v.startsWith('var(') ? v : `var(${token})`
          const host = el && el.nodeType === 1 ? el : document.body
          host.appendChild(probe)
          const computed = getComputedStyle(probe).color
          host.removeChild(probe)
          if (computed && computed !== 'rgba(0, 0, 0, 0)' && computed !== 'transparent') {
            return computed
          }
        }
        return v
      }
    }
    return raw.startsWith('var(') ? fallback : color || fallback
  }

  function themeFallback(el, index) {
    const token = CHART_COLORS[index != null ? index % CHART_COLORS.length : 0]
    return resolveColor(el, token, '') || resolveColor(el, 'var(--pro-theme-color)', 'rgb(22, 93, 255)')
  }

  /**
   * 圆环中心主数字：按内径自适应字号；双行文案时轻微下移做视觉垂直居中
   * （Unovis 对主/副标签各用 ±0.55em，大字号会显得偏上）
   */
  function resolveCssValue(el, raw, depth) {
    if (!raw || depth > 4) return raw || ''
    const v = String(raw).trim()
    if (!v.startsWith('var(')) return v
    const inner = v.slice(4, -1).trim().split(',')[0].trim()
    const next = getComputedStyle(el).getPropertyValue(inner).trim()
    return resolveCssValue(el, next || '', (depth || 0) + 1)
  }

  function measureTextWidth(text, fontWeight, fontSize, fontFamily) {
    if (typeof document === 'undefined') return text.length * fontSize * 0.6
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return text.length * fontSize * 0.6
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
    return ctx.measureText(text).width
  }

  function fitDonutCentralFontSize(el, label, options) {
    const height = options.height || 280
    const radius = options.radius != null ? options.radius : Math.min(height, el.clientWidth || height) / 2
    const arcWidth = options.pie ? 0 : options.arcWidth != null ? options.arcWidth : 20
    const innerR = Math.max(20, radius - arcWidth)
    // 留白更紧：避免主数字贴环内侧
    const maxW = innerR * 2 * 0.72
    const base = options.centralLabelFontSize != null ? options.centralLabelFontSize : 26
    const min = options.centralLabelMinFontSize != null ? options.centralLabelMinFontSize : 12

    if (!label) {
      el.style.setProperty('--vis-donut-central-label-font-size', `${base}px`)
      return base
    }

    const cs = getComputedStyle(el)
    const family =
      resolveCssValue(el, cs.getPropertyValue('--vis-donut-central-label-font-family')) ||
      cs.fontFamily ||
      'sans-serif'
    const weight =
      resolveCssValue(el, cs.getPropertyValue('--vis-donut-central-label-font-weight')) || '700'

    let lo = min
    let hi = base
    let fontSize = min
    while (lo <= hi) {
      const mid = (lo + hi) >> 1
      if (measureTextWidth(label, weight, mid, family) <= maxW) {
        fontSize = mid
        lo = mid + 1
      } else {
        hi = mid - 1
      }
    }

    el.style.setProperty('--vis-donut-central-label-font-size', `${fontSize}px`)
    return fontSize
  }

  function refineDonutCentralLabelAfterMount(el, label, options, attempt) {
    if (!el || !label) return
    const tryCount = attempt || 0
    const texts = Array.from(el.querySelectorAll('text'))
    const textEl =
      texts.find((node) => (node.textContent || '').trim() === String(label).trim()) ||
      texts.find((node) => (node.textContent || '').includes(String(label).replace(/[^\d]/g, '').slice(0, 4)))
    if (!textEl || typeof textEl.getBBox !== 'function') {
      if (tryCount < 8) {
        requestAnimationFrame(() => refineDonutCentralLabelAfterMount(el, label, options, tryCount + 1))
      }
      return
    }

    const height = options.height || 280
    const radius = options.radius != null ? options.radius : Math.min(height, el.clientWidth || height) / 2
    const arcWidth = options.pie ? 0 : options.arcWidth != null ? options.arcWidth : 20
    const maxW = Math.max(20, radius - arcWidth) * 2 * 0.72
    const min = options.centralLabelMinFontSize != null ? options.centralLabelMinFontSize : 12
    let size = parseFloat(el.style.getPropertyValue('--vis-donut-central-label-font-size')) || 26

    let width = 0
    try {
      width = textEl.getBBox().width
    } catch (e) {
      width = 0
    }
    // 布局未稳定时 getBBox 可能为 0，延后重试
    if (width <= 0 && tryCount < 8) {
      requestAnimationFrame(() => refineDonutCentralLabelAfterMount(el, label, options, tryCount + 1))
      return
    }

    for (let i = 0; i < 16; i += 1) {
      try {
        width = textEl.getBBox().width
      } catch (e) {
        break
      }
      if (!(width > maxW) || size <= min) break
      size -= 1
      el.style.setProperty('--vis-donut-central-label-font-size', `${size}px`)
      textEl.setAttribute('font-size', `${size}px`)
      textEl.style.fontSize = `${size}px`
    }
  }

  function prepareDonutCentralLabel(el, options) {
    const label = options.centralLabel != null ? String(options.centralLabel) : ''
    const hasSub = !!options.centralSubLabel
    const fontSize = fitDonutCentralFontSize(el, label, options)

    let offsetY = options.centralLabelOffsetY
    if (offsetY == null && hasSub && label) {
      offsetY = Math.round(Math.max(2, (fontSize - 14) * 0.28))
    }
    return { fontSize, centralLabelOffsetY: offsetY != null ? offsetY : 0, label }
  }

  /** Area/Line 需要数值 X；字符串类目自动映射为 index，并通过 tickFormat 显示 label */
  function prepareNumericX(data, xAccessor, xLabelAccessor) {
    if (!data.length) return { data, x: xAccessor, tickFormat: undefined }

    const labelTickFormat = (tick) => {
      const i = Math.round(Number(tick))
      const d = data[i]
      return d != null ? String(xLabelAccessor(d)) : ''
    }

    const first = xAccessor(data[0])
    if (typeof first === 'number' && !Number.isNaN(first)) {
      const hasLabels = data.some((d) => {
        const lbl = xLabelAccessor(d)
        return lbl != null && lbl !== '' && lbl !== String(xAccessor(d))
      })
      return {
        data,
        x: xAccessor,
        tickFormat: hasLabels ? labelTickFormat : undefined,
      }
    }

    const normalized = data.map((d, i) => ({ ...d, __chartX: i }))
    return {
      data: normalized,
      x: (d) => d.__chartX,
      tickFormat: labelTickFormat,
    }
  }

  function niceStep(roughStep) {
    const abs = Math.abs(roughStep) || 1
    const magnitude = Math.pow(10, Math.floor(Math.log10(abs)))
    const residual = abs / magnitude
    let nice
    if (residual <= 1) nice = 1
    else if (residual <= 2) nice = 2
    else if (residual <= 2.5) nice = 2.5
    else if (residual <= 5) nice = 5
    else nice = 10
    return nice * magnitude
  }

  /** 数值轴统一 5 个数字刻度；顶格贴合数据上沿，避免过度抬高导致柱高被压扁 */
  function computeYTickValues(values, minZero = true) {
    const TICK_COUNT = 5
    if (!values.length) return [0, 250, 500, 750, 1000]
    const maxVal = Math.max(...values)
    const min = minZero ? 0 : Math.min(...values)
    const paddedMax = Math.max(maxVal * 1.02, maxVal + Number.EPSILON)

    let step = niceStep((paddedMax - min) / (TICK_COUNT - 1))
    let top = min + step * (TICK_COUNT - 1)
    if (top < paddedMax) {
      // 用当前步长向上取整盖住数据，再均分成 5 格（避免 25→50 这类翻倍把域撑到 2×）
      top = Math.ceil(paddedMax / step) * step
      step = (top - min) / (TICK_COUNT - 1)
    }

    const precision = step < 1 ? 2 : step < 10 ? 1 : Number.isInteger(step) ? 0 : 2
    const ticks = []
    for (let i = 0; i < TICK_COUNT; i++) {
      ticks.push(Number((min + step * i).toFixed(precision)))
    }
    return ticks
  }

  function collectNumericValues(data, accessors) {
    const vals = []
    data.forEach((d) => {
      accessors.forEach((acc) => {
        const v = typeof acc === 'function' ? acc(d) : d[acc]
        if (typeof v === 'number' && !Number.isNaN(v)) vals.push(v)
      })
    })
    return vals
  }

  function computeNumericXExtent(data, xAccessor, pad = 0.6) {
    if (!data.length) return undefined
    const xs = data.map((d, i) => {
      const v = xAccessor(d)
      return typeof v === 'number' && !Number.isNaN(v) ? v : i
    })
    return [Math.min(...xs) - pad, Math.max(...xs) + pad]
  }

  function xAxisTickValues(data, xAccessor) {
    return data.map((d, i) => {
      const v = xAccessor(d)
      return typeof v === 'number' && !Number.isNaN(v) ? v : i
    })
  }

  function xAxisConfig(data, tickFormat, options = {}) {
    const { tickValues, tickTextAlign = 'center' } = options
    return new Axis({
      type: 'x',
      ...axisStyle('x'),
      tickPadding: 6,
      tickTextHideOverlapping: true,
      // 底轴文案相对刻度点水平居中（Unovis: left|center|right）
      tickTextAlign,
      ...(tickValues
        ? { tickValues, ...(tickFormat ? { tickFormat } : {}) }
        : tickFormat
          ? { tickFormat, numTicks: Math.min(data.length, 8) }
          : {}),
    })
  }

  function yAxisConfig(data, options = {}) {
    const { yMinZero = true, getValues, tickFormat, tickValues: fixedTicks, yDomain: fixedDomain } = options
    const values = getValues ? getValues(data) : []
    const tickValues = fixedTicks || computeYTickValues(values, yMinZero)
    const axis = new Axis({
      type: 'y',
      ...axisStyle('y'),
      tickValues,
      tickPadding: options.tickPadding ?? 8,
      tickTextHideOverlapping: false,
      // 负值刻度（如 -6%）需足够宽度，避免 Unovis 按宽裁切掉负号
      tickTextWidth: options.tickTextWidth,
      ...(tickFormat ? { tickFormat } : {}),
    })
    return {
      axis,
      yDomain: fixedDomain || [tickValues[0], tickValues[tickValues.length - 1]],
      tickValues,
    }
  }

  function formatNumber(n) {
    if (n == null || Number.isNaN(n)) return '—'
    return typeof n === 'number' ? n.toLocaleString('zh-CN') : String(n)
  }

  /** shadcn ChartTooltipContent 风格 HTML */
  function formatShadcnTooltip(title, rows) {
    const rowHtml = (rows || [])
      .filter((r) => r.value != null)
      .map((r) => {
        const display =
          r.display != null
            ? String(r.display)
            : typeof r.format === 'function'
              ? String(r.format(r.value) ?? '')
              : formatNumber(r.value)
        return `
        <div class="shadcn-chart-tooltip-row">
          <span class="shadcn-chart-tooltip-left">
            <span class="shadcn-chart-tooltip-dot" style="--legend-color:${r.color}"></span>
            <span>${r.label}</span>
          </span>
          <span class="shadcn-chart-tooltip-value">${display}</span>
        </div>`
      })
      .join('')

    return `
        ${title ? `<div class="shadcn-chart-tooltip-title">${title}</div>` : ''}
        <div class="shadcn-chart-tooltip-rows">${rowHtml}</div>`
  }

  function createTooltipLayer() {
    return new Tooltip({
      className: 'shadcn-chart-tooltip-root',
      followCursor: false,
      horizontalPlacement: 'right',
      verticalPlacement: 'center',
      horizontalShift: 12,
    })
  }

  /** 柱体 hover tooltip（无 Crosshair 竖线/圆点）；同时覆盖分组柱与堆积柱 */
  function createBarTooltip(el, { xLabel, series, seriesColors, barSelector }) {
    const triggerFn = (d) => {
      if (!d) return ''
      const rows = series
        .map((s, i) => ({
          label: s.label,
          value: d[s.key],
          color: seriesColors[i],
        }))
        .filter((r) => r.value != null && r.value !== 0)
      return formatShadcnTooltip(xLabel(d), rows)
    }
    const selectors = barSelector
      ? [barSelector]
      : [GroupedBar && GroupedBar.selectors && GroupedBar.selectors.bar, StackedBar && StackedBar.selectors && StackedBar.selectors.bar].filter(
          Boolean
        )
    const triggers = {}
    Array.from(new Set(selectors)).forEach((sel) => {
      triggers[sel] = triggerFn
    })
    return new Tooltip({
      className: 'shadcn-chart-tooltip-root',
      followCursor: false,
      horizontalPlacement: 'right',
      verticalPlacement: 'center',
      horizontalShift: 12,
      triggers,
    })
  }

  function createCrosshair(el, config) {
    const resolveDots = (input) => {
      if (Array.isArray(input)) {
        return input.map((c, i) => resolveColor(el, c || CHART_COLORS[i % CHART_COLORS.length], themeFallback(el, i)))
      }
      return resolveColor(el, input || 'var(--chart-1)', themeFallback(el))
    }

    const dotColors = resolveDots(config.colors)

    return new Crosshair({
      x: config.x,
      y: config.y,
      color: dotColors,
      strokeColor: config.strokeColor != null ? config.strokeColor : '#ffffff',
      strokeWidth: config.strokeWidth != null ? config.strokeWidth : 2,
      duration: 0,
      tooltip: config.tooltip,
      template: config.template,
    })
  }

  /**
   * 对齐 shadcn/Recharts tooltip cursor（非 Crosshair 圆点）：
   * - DOM：path/rect.recharts-tooltip-cursor
   * - 样式：fill = muted（oklch(0.97 0 0)）
   * - 层级：cursor z=200，柱 z=300（灰带在柱后）
   *
   * Unovis Crosshair 是顶层叠层且含圆点，不能用来模拟；改在绘图 SVG 柱组内插入 rect。
   */
  function installTooltipCursorBand(el) {
    if (!el) return () => {}
    let band = null
    let lastLayout = null
    let syncing = false
    let observedSvg = null
    let observer = null

    const hide = () => {
      lastLayout = null
      if (band) band.setAttribute('visibility', 'hidden')
    }

    const screenToLocal = (svg, localEl, clientX, clientY) => {
      const ctm = localEl.getScreenCTM()
      if (!ctm) return null
      const pt = svg.createSVGPoint()
      pt.x = clientX
      pt.y = clientY
      return pt.matrixTransform(ctm.inverse())
    }

    const collectBars = (svg) => {
      const list = []
      svg.querySelectorAll('rect, path').forEach((node) => {
        if (node.classList && node.classList.contains('shadcn-tooltip-cursor-band')) return
        const r = node.getBoundingClientRect()
        // 数据柱：窄而有高度；排除网格/全宽背景
        if (r.width < 1.2 || r.width > 28 || r.height < 2) return
        list.push({ node, r })
      })
      return list
    }

    const ensureBand = (svg, barParent) => {
      let node = svg.querySelector('rect.shadcn-tooltip-cursor-band')
      if (!node) {
        node = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        node.setAttribute('class', 'shadcn-tooltip-cursor-band')
        node.setAttribute('pointer-events', 'none')
        node.setAttribute('visibility', 'hidden')
      }
      // 插到柱组最前 = 先于柱绘制（等同 Recharts cursor 200 < bar 300）
      if (node.parentNode !== barParent || barParent.firstChild !== node) {
        barParent.insertBefore(node, barParent.firstChild)
      }
      return node
    }

    const applyLayout = () => {
      if (!band || !lastLayout) return
      band.setAttribute('x', String(lastLayout.x))
      band.setAttribute('y', String(lastLayout.y))
      band.setAttribute('width', String(lastLayout.w))
      band.setAttribute('height', String(lastLayout.h))
      band.setAttribute('visibility', 'visible')
    }

    const observeSvg = (svg) => {
      if (observedSvg === svg) return
      if (observer) observer.disconnect()
      observedSvg = svg
      observer = new MutationObserver(() => {
        if (syncing || !lastLayout || !band) return
        if (observedSvg && observedSvg.contains(band)) return
        const bars = collectBars(svg)
        if (!bars.length) return
        syncing = true
        band = ensureBand(svg, bars[0].node.parentNode)
        applyLayout()
        syncing = false
      })
      observer.observe(svg, { childList: true, subtree: true })
    }

    const onMove = (e) => {
      const svg = el.querySelector('svg')
      if (!svg) {
        hide()
        return
      }
      observeSvg(svg)
      const hostRect = el.getBoundingClientRect()
      const bars = collectBars(svg)
      if (!bars.length) {
        hide()
        return
      }
      let best = null
      let bestNode = null
      let bestIdx = -1
      let bestDist = Infinity
      for (let i = 0; i < bars.length; i += 1) {
        const { node, r } = bars[i]
        const dist = Math.abs(e.clientX - (r.left + r.width / 2))
        if (dist < bestDist) {
          bestDist = dist
          best = r
          bestNode = node
          bestIdx = i
        }
      }
      if (!best || !bestNode) {
        hide()
        return
      }
      const parent = bestNode.parentNode
      if (!parent) {
        hide()
        return
      }
      band = ensureBand(svg, parent)

      // 类目槽宽 ≈ 相邻柱中心距（对齐 Recharts cursor width）
      let slot = best.width + 8
      if (bestIdx > 0) {
        const prev = bars[bestIdx - 1].r
        slot = Math.abs(best.left + best.width / 2 - (prev.left + prev.width / 2))
      } else if (bestIdx < bars.length - 1) {
        const next = bars[bestIdx + 1].r
        slot = Math.abs(next.left + next.width / 2 - (best.left + best.width / 2))
      }
      const widthPx = Math.max(best.width + 4, Math.min(slot * 0.9, 24))
      const topY = hostRect.top + 8
      const bottomY = hostRect.bottom - 22
      const cx = best.left + best.width / 2
      const p1 = screenToLocal(svg, parent, cx - widthPx / 2, topY)
      const p2 = screenToLocal(svg, parent, cx + widthPx / 2, bottomY)
      if (!p1 || !p2) {
        hide()
        return
      }
      lastLayout = {
        x: Math.min(p1.x, p2.x),
        y: Math.min(p1.y, p2.y),
        w: Math.max(1, Math.abs(p2.x - p1.x)),
        h: Math.max(1, Math.abs(p2.y - p1.y)),
      }
      applyLayout()
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', hide)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', hide)
      if (observer) observer.disconnect()
      observer = null
      hide()
      if (band && band.parentNode) band.parentNode.removeChild(band)
      band = null
    }
  }

  function axisStyle(type) {
    const base = { domainLine: false, tickLine: false }
    if (type === 'x') return { ...base, gridLine: false }
    return { ...base, gridLine: true }
  }

  /** Y 轴标签动态左边距：按文案测宽，夹在 min/max 之间（默认 max 56） */
  const DEFAULT_Y_LABEL_MIN_WIDTH = 36
  const DEFAULT_Y_LABEL_MAX_WIDTH = 56
  /** X 轴末刻度探出绘图区时的动态右边距（居中对齐取半宽） */
  const DEFAULT_X_LABEL_RIGHT_MIN_WIDTH = 8
  const DEFAULT_X_LABEL_RIGHT_MAX_WIDTH = 40
  let _axisMeasureCtx = null

  function measureAxisLabelWidth(text, el) {
    const str = String(text ?? '')
    if (!str) return 0
    if (typeof document === 'undefined') return Math.ceil(str.length * 8)
    if (!_axisMeasureCtx) {
      _axisMeasureCtx = document.createElement('canvas').getContext('2d')
    }
    if (!_axisMeasureCtx) return Math.ceil(str.length * 8)
    const cs = el && el.ownerDocument ? getComputedStyle(el) : null
    // Unovis 刻度略大于 12px 视觉宽；略放大字号避免测窄导致裁切
    const fontSize = '12px'
    const fontFamily =
      (cs && cs.fontFamily) ||
      'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    _axisMeasureCtx.font = `${fontSize} ${fontFamily}`
    // 实测常略窄于 SVG 文字，加 8% 余量
    return _axisMeasureCtx.measureText(str).width * 1.08
  }

  function formatAxisTickLabel(value, tickFormat) {
    if (typeof tickFormat === 'function') {
      try {
        return String(tickFormat(value) ?? '')
      } catch (e) {
        return String(value ?? '')
      }
    }
    return String(value ?? '')
  }

  function resolveDynamicLeftMargin(el, tickValues, tickFormat, options = {}) {
    const minW = options.yLabelMinWidth ?? DEFAULT_Y_LABEL_MIN_WIDTH
    const maxW = options.yLabelMaxWidth ?? DEFAULT_Y_LABEL_MAX_WIDTH
    // 标签右对齐贴绘图区：需 textWidth + tickPadding + 安全边
    const tickPad = options.yTickPadding ?? options.yLabelPad ?? 8
    const safety = options.yLabelSafety ?? 10
    const pad = tickPad + safety
    const labels = (tickValues || []).map((v) => formatAxisTickLabel(v, tickFormat))
    let contentW = 0
    for (let i = 0; i < labels.length; i++) {
      contentW = Math.max(contentW, measureAxisLabelWidth(labels[i], el))
    }
    // yLabelMaxWidth 是上限，不是固定占位；文案较短时 left 会小于 max
    const left = Math.min(maxW, Math.max(minW, Math.ceil(contentW + pad)))
    return {
      left,
      contentW: Math.ceil(contentW),
      minW,
      maxW,
      labels,
    }
  }

  /**
   * 柱图 xDomainPad 把末柱内收后，末刻度到绘图区右沿已有一段像素。
   * 动态右边距只需补「半字宽 − padPx」，避免和常用图表一样再空一截。
   */
  function estimateXDomainPadPx(el, xDomain, pad, margin) {
    if (!(pad > 0) || !xDomain || xDomain.length !== 2) return 0
    const span = Number(xDomain[1]) - Number(xDomain[0])
    if (!(span > 0)) return 0
    const hostW = (el && el.clientWidth) || 0
    if (hostW < 40) return 0
    const left = margin && margin.left != null ? margin.left : 0
    const rightFloor = margin && margin.right != null ? margin.right : 8
    const plotW = Math.max(40, hostW - left - rightFloor)
    return (pad / span) * plotW
  }

  /**
   * 末刻度居中时约一半字宽探出绘图区；按对齐方式算所需 margin.right
   * （等价于略压缩横轴绘图宽度，避免「08-」被裁切）
   */
  function resolveDynamicRightMargin(el, tickValues, tickFormat, options = {}) {
    const minW = options.xLabelRightMinWidth ?? DEFAULT_X_LABEL_RIGHT_MIN_WIDTH
    const maxW = options.xLabelRightMaxWidth ?? DEFAULT_X_LABEL_RIGHT_MAX_WIDTH
    const safety = options.xLabelRightSafety ?? 4
    const align = options.xTickTextAlign || 'center'
    if (!tickValues || !tickValues.length) {
      return { right: minW, contentW: 0, minW, maxW, label: '' }
    }
    const lastTick = tickValues[tickValues.length - 1]
    const label = formatAxisTickLabel(lastTick, tickFormat)
    const contentW = measureAxisLabelWidth(label, el)
    let protrude = contentW / 2
    if (align === 'right') protrude = 0
    else if (align === 'left') protrude = contentW
    const padPx = Math.max(0, Number(options.xLabelRightPadPx) || 0)
    protrude = Math.max(0, protrude - padPx)
    const right = Math.min(maxW, Math.max(minW, Math.ceil(protrude + safety)))
    return {
      right,
      contentW: Math.ceil(contentW),
      minW,
      maxW,
      label,
    }
  }

  /** 供动态右边距：优先显式 xTickValues，否则取最后一个采样点 */
  function xAxisMarginExtras(data, x, tickFormat, options = {}) {
    const ticks =
      options.xTickValues && options.xTickValues.length
        ? options.xTickValues
        : data && data.length
          ? [x(data[data.length - 1])]
          : []
    return {
      xAxisMarginTicks: ticks,
      xAxisMarginFormat: tickFormat,
    }
  }

  function xyContainerConfig(el, options, extra) {
    const restExtra = { ...(extra || {}) }
    const yAxisMarginTicks = restExtra.yAxisMarginTicks
    const yAxisMarginFormat = restExtra.yAxisMarginFormat
    const xAxisMarginTicks = restExtra.xAxisMarginTicks
    const xAxisMarginFormat = restExtra.xAxisMarginFormat
    delete restExtra.yAxisMarginTicks
    delete restExtra.yAxisMarginFormat
    delete restExtra.xAxisMarginTicks
    delete restExtra.xAxisMarginFormat

    // 与 workplace / dashboard.html 图表边距对齐，作为 XY 图默认值
    const baseMargin = { top: 8, right: 8, bottom: 8, left: 0 }
    const margin = { ...baseMargin, ...(options.margin || {}) }

    // autoMargin:false 时按刻度文案动态 left，并受 yLabelMaxWidth 上限约束
    if (
      options.dynamicYAxisMargin !== false &&
      options.autoMargin === false &&
      yAxisMarginTicks &&
      yAxisMarginTicks.length
    ) {
      const resolved = resolveDynamicLeftMargin(
        el,
        yAxisMarginTicks,
        yAxisMarginFormat !== undefined ? yAxisMarginFormat : options.yTickFormat,
        options
      )
      margin.left = resolved.left
      if (el && el.dataset) {
        el.dataset.yLabelLeft = String(resolved.left)
        el.dataset.yLabelMax = String(resolved.maxW)
        el.dataset.yLabelContent = String(resolved.contentW)
      }
    }

    // autoMargin:false 时按 X 末刻度动态 right（不小于业务已设的 right，如右侧 % 轴）
    // 柱图 xDomainPad 已内收末柱：把 pad 像素从探出量里扣掉，与常用图表右边距对齐
    if (
      options.dynamicXAxisMargin !== false &&
      options.autoMargin === false &&
      xAxisMarginTicks &&
      xAxisMarginTicks.length
    ) {
      const padPx = estimateXDomainPadPx(
        el,
        restExtra.xDomain || options.xDomain,
        options.xDomainPad,
        margin
      )
      const resolved = resolveDynamicRightMargin(
        el,
        xAxisMarginTicks,
        xAxisMarginFormat,
        padPx ? { ...options, xLabelRightPadPx: padPx } : options
      )
      margin.right = Math.max(margin.right != null ? margin.right : 0, resolved.right)
      if (el && el.dataset) {
        el.dataset.xLabelRight = String(margin.right)
        el.dataset.xLabelRightContent = String(resolved.contentW)
        el.dataset.xLabelRightMax = String(resolved.maxW)
        if (padPx) el.dataset.xLabelRightPad = String(Math.round(padPx))
      }
    }

    return {
      height: options.height || 280,
      margin,
      autoMargin: options.autoMargin !== false,
      yDomainMinConstraint: options.yMinZero ? [0, undefined] : undefined,
      ...restExtra,
    }
  }

  function mountAreaChart(el, options) {
    if (!el) return null
    const height = options.height || 280
    el.classList.add('shadcn-chart-host')
    el.style.height = height + 'px'
    el.style.minHeight = height + 'px'

    const rawData = options.data || []
    const xRaw = options.x || ((d) => d.x)
    const xLabel = options.xLabel || ((d) => d.label ?? String(xRaw(d)))
    const { data, x, tickFormat } = prepareNumericX(rawData, xRaw, xLabel)
    const series = options.series
    const curveType =
      options.curveType ||
      (CurveType && CurveType.MonotoneX) ||
      'monotoneX'
    const resolvedCurve =
      typeof curveType === 'string' && CurveType && CurveType[curveType.charAt(0).toUpperCase() + curveType.slice(1)]
        ? CurveType[curveType.charAt(0).toUpperCase() + curveType.slice(1)]
        : curveType === 'linear' && CurveType && CurveType.Linear
          ? CurveType.Linear
          : curveType
    const lineWidth = options.lineWidth != null ? options.lineWidth : 2

    // 多序列面积：默认堆叠；stacked:false 时各自从基线绘制半透明面积
    if (series && series.length) {
      const yAccessors = series.map((s) => (d) => d[s.key])
      const seriesColors = series.map((s, i) =>
        resolveColor(el, s.color || CHART_COLORS[i % CHART_COLORS.length], themeFallback(el, i))
      )
      const opacities = series.map((s, i) =>
        s.opacity != null ? s.opacity : i === 0 ? 0.4 : 0.25
      )
      const nonStacked = options.stacked === false

      const areas = nonStacked
        ? series.map(
            (s, i) =>
              new Area({
                x,
                y: (d) => d[s.key],
                color: seriesColors[i],
                opacity: opacities[i],
                curveType: resolvedCurve,
              })
          )
        : [
            new Area({
              x,
              y: yAccessors.length === 1 ? yAccessors[0] : yAccessors,
              color: seriesColors.length === 1 ? seriesColors[0] : seriesColors,
              opacity: opacities.length === 1 ? opacities[0] : opacities,
              curveType: resolvedCurve,
            }),
          ]
      const lines = series.map(
        (s, i) =>
          new Line({
            x,
            y: (d) => d[s.key],
            color: seriesColors[i],
            lineWidth: s.lineWidth != null ? s.lineWidth : lineWidth,
            curveType: resolvedCurve,
          })
      )

      const tooltip = createTooltipLayer()
      const crosshair = createCrosshair(el, {
        x,
        y: yAccessors.length === 1 ? yAccessors[0] : yAccessors,
        colors: seriesColors.length === 1 ? seriesColors[0] : seriesColors,
        tooltip,
        template: (d) => {
          if (!d) return ''
          const rows = series.map((s, i) => ({
            label: s.label,
            value: d[s.key],
            color: seriesColors[i],
          }))
          const tipTitle =
            typeof options.tooltipLabel === 'function' ? options.tooltipLabel(d) : xLabel(d)
          return formatShadcnTooltip(tipTitle, rows)
        },
      })

      const yAxis = yAxisConfig(data, {
        yMinZero: options.yMinZero !== false,
        getValues: (rows) =>
          nonStacked
            ? collectNumericValues(rows, yAccessors)
            : rows.map((d) => series.reduce((sum, s) => sum + (Number(d[s.key]) || 0), 0)),
        tickFormat: options.yTickFormat,
        tickValues: options.yTickValues,
        yDomain: options.yDomain,
      })

      const chart = new XYContainer(
        el,
        xyContainerConfig(el, { ...options, height, yMinZero: true }, {
          components: [...areas, ...lines, crosshair],
          xAxis: xAxisConfig(data, tickFormat, {
            tickValues: options.xTickValues,
            tickTextAlign: options.xTickTextAlign,
          }),
          yAxis: yAxis.axis,
          yDomain: yAxis.yDomain,
          yAxisMarginTicks: yAxis.tickValues,
          yAxisMarginFormat: options.yTickFormat,
          ...xAxisMarginExtras(data, x, tickFormat, options),
          tooltip,
          crosshair,
        }),
        data
      )

      return { chart, el, legend: series.map((s, i) => ({ label: s.label, color: seriesColors[i] })) }
    }

    const y = options.y || ((d) => d.y)
    const color = resolveColor(el, options.color || 'var(--chart-1)', themeFallback(el))
    const valueLabel = options.valueLabel || '数值'

    const area = new Area({
      x,
      y,
      color,
      opacity: 0.28,
      curveType: resolvedCurve,
    })
    const line = new Line({
      x,
      y,
      color,
      lineWidth,
      curveType: resolvedCurve,
    })

    const tooltip = createTooltipLayer()
    const crosshair = createCrosshair(el, {
      x,
      y,
      colors: color,
      tooltip,
      template: (d) => {
        if (!d) return ''
        return formatShadcnTooltip(xLabel(d), [{ label: valueLabel, value: y(d), color }])
      },
    })

    const yAxis = yAxisConfig(data, {
      yMinZero: options.yMinZero !== false,
      getValues: (rows) => rows.map(y),
      tickFormat: options.yTickFormat,
      tickValues: options.yTickValues,
      yDomain: options.yDomain,
    })

    const chart = new XYContainer(
      el,
      xyContainerConfig(el, { ...options, height, yMinZero: true }, {
        components: [area, line, crosshair],
        xAxis: xAxisConfig(data, tickFormat),
        yAxis: yAxis.axis,
        yDomain: yAxis.yDomain,
        yAxisMarginTicks: yAxis.tickValues,
        yAxisMarginFormat: options.yTickFormat,
        ...xAxisMarginExtras(data, x, tickFormat, options),
        tooltip,
        crosshair,
      }),
      data
    )

    return { chart, el }
  }

  function mountLineChart(el, options) {
    if (!el) return null
    const height = options.height || 280
    el.classList.add('shadcn-chart-host')
    el.style.height = height + 'px'
    el.style.minHeight = height + 'px'

    const rawData = options.data || []
    const series = options.series || [{ key: 'y', label: '数值', color: CHART_COLORS[0] }]
    const xRaw = options.x || ((d) => d.x)
    const xLabel = options.xLabel || ((d) => d.label ?? String(xRaw(d)))
    const { data, x, tickFormat } = prepareNumericX(rawData, xRaw, xLabel)

    const curveType =
      options.curveType ||
      (CurveType && CurveType.MonotoneX) ||
      'monotoneX'
    const resolvedCurve =
      typeof curveType === 'string' && CurveType && CurveType[curveType.charAt(0).toUpperCase() + curveType.slice(1)]
        ? CurveType[curveType.charAt(0).toUpperCase() + curveType.slice(1)]
        : curveType
    const defaultLineWidth = options.lineWidth != null ? options.lineWidth : 2

    const components = series.map((s, i) => {
      const lineOpts = {
        x,
        y: (d) => d[s.key],
        color: resolveColor(el, s.color || CHART_COLORS[i % CHART_COLORS.length], themeFallback(el, i)),
        lineWidth: s.lineWidth != null ? s.lineWidth : defaultLineWidth,
        curveType: resolvedCurve,
      }
      if (s.lineDashArray) lineOpts.lineDashArray = s.lineDashArray
      return new Line(lineOpts)
    })

    const seriesColors = series.map((s, i) =>
      resolveColor(el, s.color || CHART_COLORS[i % CHART_COLORS.length], themeFallback(el, i))
    )

    const tooltip = createTooltipLayer()
    const crosshair = createCrosshair(el, {
      x,
      y: series.map((s) => (d) => d[s.key]),
      colors: seriesColors,
      tooltip,
      template: (d) => {
        if (!d) return ''
        const tipTitle =
          typeof options.tooltipLabel === 'function' ? options.tooltipLabel(d) : xLabel(d)
        const rows = series.map((s, i) => ({
          label: s.label,
          value: d[s.key],
          color: seriesColors[i],
          format: s.valueFormat || s.format,
        }))
        return formatShadcnTooltip(tipTitle, rows)
      },
    })

    const yAxis = yAxisConfig(data, {
      yMinZero: options.yMinZero !== false,
      getValues: (rows) => collectNumericValues(rows, series.map((s) => (d) => d[s.key])),
      tickFormat: options.yTickFormat,
      tickValues: options.yTickValues,
      yDomain: options.yDomain,
    })

    const chart = new XYContainer(
      el,
      xyContainerConfig(el, { ...options, height, yMinZero: options.yMinZero !== false }, {
        components: [...components, crosshair],
        xAxis: xAxisConfig(data, tickFormat, {
          tickValues: options.xTickValues,
        }),
        yAxis: yAxis.axis,
        yDomain: yAxis.yDomain,
        yAxisMarginTicks: yAxis.tickValues,
        yAxisMarginFormat: options.yTickFormat,
        ...xAxisMarginExtras(data, x, tickFormat, options),
        tooltip,
        crosshair,
      }),
      data
    )

    return { chart, el, legend: series }
  }

  function mountBarChart(el, options) {
    if (!el) return null
    const height = options.height || 280
    el.classList.add('shadcn-chart-host')
    el.classList.remove('shadcn-chart-host--bar')
    void el.offsetWidth
    el.classList.add('shadcn-chart-host--bar')
    el.style.height = height + 'px'
    el.style.minHeight = height + 'px'

    const rawData = options.data || []
    const series = options.series || [
      { key: 'desktop', label: 'Desktop', color: CHART_COLORS[0] },
      { key: 'mobile', label: 'Mobile', color: CHART_COLORS[1] },
    ]
    const xRaw = options.x || ((d) => d.label)
    const xLabel = options.xLabel || ((d) => d.label ?? String(xRaw(d)))
    const { data, x, tickFormat } = prepareNumericX(rawData, xRaw, xLabel)

    const yAccessors = series.map((s) => (d) => d[s.key])
    const seriesColors = series.map((s, i) =>
      resolveColor(el, s.color || CHART_COLORS[i % CHART_COLORS.length], themeFallback(el, i))
    )

    const isSingleSeries = series.length === 1
    const bar = new GroupedBar({
      x,
      y: yAccessors.length === 1 ? yAccessors[0] : yAccessors,
      color: seriesColors.length === 1 ? seriesColors[0] : seriesColors,
      roundedCorners: options.roundedCorners != null ? options.roundedCorners : 4,
      barPadding: options.barPadding ?? 0.2,
      // 单序列柱间距对齐 workplace 收入概览；多序列保持组内紧凑
      groupPadding: options.groupPadding ?? (isSingleSeries ? 0.45 : 0.05),
      ...(options.groupWidth != null ? { groupWidth: options.groupWidth } : {}),
      ...(options.groupMaxWidth != null
        ? { groupMaxWidth: options.groupMaxWidth }
        : options.groupWidth == null
          ? { groupMaxWidth: DEFAULT_BAR_MAX_WIDTH }
          : {}),
      ...(options.dataStep != null ? { dataStep: options.dataStep } : {}),
    })

    const useTooltipCursor = options.tooltipCursor === true
    const useCrosshair = options.crosshair === true || useTooltipCursor
    if (useTooltipCursor) {
      // 对齐 shadcn ChartContainer：[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted
      el.classList.add('shadcn-chart-host--tooltip-cursor')
      const plotW = Math.max(120, (el.clientWidth || 640) - 56)
      const band = Math.max(8, Math.min(22, plotW / Math.max(data.length, 1)))
      el.style.setProperty('--vis-crosshair-line-stroke-width', `${band}px`)
    }

    const tooltip = useCrosshair
      ? createTooltipLayer()
      : createBarTooltip(el, { xLabel, series, seriesColors })
    const crosshairY = yAccessors.length === 1 ? yAccessors[0] : yAccessors
    const crosshairColors = seriesColors.length === 1 ? seriesColors[0] : seriesColors
    const titleOf = (d) =>
      typeof options.tooltipLabel === 'function' ? options.tooltipLabel(d) : xLabel(d)
    const crosshair = useCrosshair
      ? createCrosshair(el, {
          x,
          y: crosshairY,
          // tooltip cursor：隐藏圆点，竖线改由 CSS 渲染为 muted 灰带
          colors: useTooltipCursor ? 'transparent' : crosshairColors,
          strokeColor: useTooltipCursor ? 'transparent' : undefined,
          strokeWidth: useTooltipCursor ? 0 : undefined,
          tooltip,
          template: (d) => {
            if (!d) return ''
            const rows = series
              .map((s, i) => ({
                label: s.label,
                value: d[s.key],
                color: seriesColors[i],
              }))
              .filter((r) => r.value != null && r.value !== 0)
            return formatShadcnTooltip(titleOf(d), rows)
          },
        })
      : null

    const yAxis = yAxisConfig(data, {
      yMinZero: true,
      getValues: (rows) => collectNumericValues(rows, series.map((s) => (d) => d[s.key])),
      tickFormat: options.yTickFormat,
      tickValues: options.yTickValues,
      yDomain: options.yDomain,
      tickPadding: options.yTickPadding,
    })

    // tooltipCursor：Crosshair 只负责吸附/tooltip；灰带由下层 HTML 绘制（Crosshair DOM 在顶层盖不住柱）
    const components = crosshair ? [bar, crosshair] : [bar]
    const xTickValues = options.xTickValues != null ? options.xTickValues : xAxisTickValues(data, x)
    const xDomain =
      options.xDomain ||
      computeNumericXExtent(data, x, options.xDomainPad ?? 0.45)

    const chart = new XYContainer(
      el,
      xyContainerConfig(el, { ...options, height, yMinZero: true }, {
        components,
        xAxis: xAxisConfig(data, tickFormat, { tickValues: xTickValues }),
        yAxis: yAxis.axis,
        xDomain,
        yDomain: yAxis.yDomain,
        yAxisMarginTicks: yAxis.tickValues,
        yAxisMarginFormat: options.yTickFormat,
        ...xAxisMarginExtras(data, x, tickFormat, { ...options, xTickValues }),
        tooltip,
        ...(crosshair ? { crosshair } : {}),
      }),
      data
    )

    const cursorBandCleanup = useTooltipCursor ? installTooltipCursorBand(el) : null
    return { chart, el, legend: series, __cursorBandCleanup: cursorBandCleanup }
  }

  function mountStackedBarChart(el, options) {
    if (!el || !StackedBar) return null
    const height = options.height || 280
    el.classList.add('shadcn-chart-host')
    el.classList.remove('shadcn-chart-host--bar')
    void el.offsetWidth
    el.classList.add('shadcn-chart-host--bar')
    el.style.height = height + 'px'

    const rawData = options.data || []
    const series = options.series || [
      { key: 'desktop', label: 'Desktop', color: CHART_COLORS[0] },
      { key: 'mobile', label: 'Mobile', color: CHART_COLORS[1] },
    ]
    const xRaw = options.x || ((d) => d.label)
    const xLabel = options.xLabel || ((d) => d.label ?? String(xRaw(d)))
    const { data, x, tickFormat } = prepareNumericX(rawData, xRaw, xLabel)

    const yAccessors = series.map((s) => (d) => d[s.key])
    const seriesColors = series.map((s, i) =>
      resolveColor(el, s.color || CHART_COLORS[i % CHART_COLORS.length], themeFallback(el, i))
    )

    const bar = new StackedBar({
      x,
      y: yAccessors.length === 1 ? yAccessors[0] : yAccessors,
      color: seriesColors.length === 1 ? seriesColors[0] : seriesColors,
      roundedCorners: 4,
      barPadding: options.barPadding ?? 0.25,
      ...(options.barWidth != null ? { barWidth: options.barWidth } : {}),
      ...(options.barMaxWidth != null
        ? { barMaxWidth: options.barMaxWidth }
        : options.barWidth == null
          ? { barMaxWidth: DEFAULT_BAR_MAX_WIDTH }
          : {}),
    })

    const tooltip = createBarTooltip(el, {
      xLabel,
      series,
      seriesColors,
      barSelector: StackedBar.selectors.bar,
    })

    const yAxis = yAxisConfig(data, {
      yMinZero: true,
      getValues: (rows) =>
        rows.map((d) => series.reduce((sum, s) => sum + (Number(d[s.key]) || 0), 0)),
      tickFormat: options.yTickFormat,
      tickValues: options.yTickValues,
      yDomain: options.yDomain,
      tickPadding: options.yTickPadding,
    })

    const xTickValues = xAxisTickValues(data, x)
    const xDomain = options.xDomain || computeNumericXExtent(data, x, options.xDomainPad ?? 0.45)

    const chart = new XYContainer(
      el,
      xyContainerConfig(el, { ...options, height, yMinZero: true }, {
        components: [bar],
        xAxis: xAxisConfig(data, tickFormat, { tickValues: xTickValues }),
        yAxis: yAxis.axis,
        xDomain,
        yDomain: yAxis.yDomain,
        yAxisMarginTicks: yAxis.tickValues,
        yAxisMarginFormat: options.yTickFormat,
        ...xAxisMarginExtras(data, x, tickFormat, { ...options, xTickValues }),
        tooltip,
      }),
      data
    )

    return { chart, el, legend: series }
  }

  /**
   * 横向条形图
   * - 单系列：StackedBar + orientation=horizontal（默认单色）
   * - 多系列：GroupedBar + orientation=horizontal（分组对比）
   * 类目在 Y、数值在 X；默认 yDirection=south（索引 0 在顶部）
   *
   * options.colors：按类目着色（仅单系列）；不传则统一用 series[0].color
   */
  function mountHorizontalBarChart(el, options) {
    if (!el || !StackedBar) return null
    const height = options.height || 280
    el.classList.add('shadcn-chart-host')
    el.classList.remove('shadcn-chart-host--bar')
    void el.offsetWidth
    el.classList.add('shadcn-chart-host--bar')
    el.style.height = height + 'px'

    const rawData = options.data || []
    const series = options.series || [{ key: 'value', label: '数值', color: CHART_COLORS[0] }]
    const isGrouped = series.length > 1
    if (isGrouped && !GroupedBar) return null

    const xRaw = options.x || ((d) => d.label)
    const xLabel = options.xLabel || ((d) => d.label ?? String(xRaw(d)))
    const { data, x, tickFormat: catTickFormat } = prepareNumericX(rawData, xRaw, xLabel)

    const seriesColors = series.map((s, i) =>
      resolveColor(el, s.color || CHART_COLORS[i % CHART_COLORS.length], themeFallback(el, i))
    )
    const yAccessors = series.map((s) => (d) => Number(d[s.key]) || 0)

    // 单系列默认单色；若传 colors / 行内 color 则按类目着色
    const explicitColors = options.colors
    const useCategoryColors = !isGrouped && (explicitColors || data.some((d) => d.color))
    const categoryColors = useCategoryColors
      ? data.map((d, i) =>
          resolveColor(
            el,
            (explicitColors && explicitColors[i]) || d.color || series[0].color || CHART_COLORS[0],
            themeFallback(el, i)
          )
        )
      : null
    const monoColor = seriesColors[0]
    const color = isGrouped
      ? seriesColors
      : useCategoryColors
        ? (d) => {
            const i =
              typeof d?._index === 'number'
                ? d._index
                : typeof d?.__chartX === 'number'
                  ? d.__chartX
                  : 0
            return categoryColors[i % categoryColors.length]
          }
        : monoColor

    const barOpts = {
      x,
      y: yAccessors.length === 1 ? yAccessors[0] : yAccessors,
      color,
      orientation: 'horizontal',
      roundedCorners: options.roundedCorners ?? 4,
    }

    let bar
    if (isGrouped) {
      bar = new GroupedBar({
        ...barOpts,
        barPadding: options.barPadding ?? 0.12,
        groupPadding: options.groupPadding ?? 0.35,
        ...(options.groupWidth != null ? { groupWidth: options.groupWidth } : {}),
        ...(options.groupMaxWidth != null
          ? { groupMaxWidth: options.groupMaxWidth }
          : options.groupWidth == null
            ? { groupMaxWidth: options.barThickness ?? DEFAULT_BAR_MAX_WIDTH }
            : {}),
        ...(options.dataStep != null ? { dataStep: options.dataStep } : {}),
      })
    } else {
      bar = new StackedBar({
        ...barOpts,
        barPadding: options.barPadding ?? 0.28,
        ...(options.barWidth != null ? { barWidth: options.barWidth } : {}),
        ...(options.barMaxWidth != null
          ? { barMaxWidth: options.barMaxWidth }
          : options.barWidth == null
            ? { barMaxWidth: options.barThickness ?? DEFAULT_BAR_MAX_WIDTH }
            : {}),
      })
    }

    const barSelector = isGrouped ? GroupedBar.selectors.bar : StackedBar.selectors.bar
    const tooltip = new Tooltip({
      className: 'shadcn-chart-tooltip-root',
      followCursor: false,
      horizontalPlacement: 'right',
      verticalPlacement: 'center',
      horizontalShift: 12,
      triggers: {
        [barSelector]: (d) => {
          if (!d) return ''
          const rows = series
            .map((s, i) => ({
              label: s.label,
              value: d[s.key],
              color: seriesColors[i],
            }))
            .filter((r) => r.value != null && r.value !== 0)
          return formatShadcnTooltip(xLabel(d), rows)
        },
      },
    })

    const values = collectNumericValues(data, yAccessors)
    const valueTicks = options.xTickValues || computeYTickValues(values, true)
    const xDomain = options.xDomain || [valueTicks[0], valueTicks[valueTicks.length - 1]]
    const yTickValues = xAxisTickValues(data, x)
    const yDomain = options.yDomain || computeNumericXExtent(data, x, options.yDomainPad ?? 0.45)

    const xAxis = new Axis({
      type: 'x',
      ...axisStyle('y'),
      tickValues: valueTicks,
      tickPadding: 6,
      tickTextHideOverlapping: true,
      ...(options.xTickFormat ? { tickFormat: options.xTickFormat } : {}),
    })

    const yAxis = new Axis({
      type: 'y',
      ...axisStyle('x'),
      tickValues: yTickValues,
      tickPadding: options.yTickPadding ?? 8,
      tickTextHideOverlapping: false,
      ...(catTickFormat ? { tickFormat: catTickFormat } : {}),
    })

    const chart = new XYContainer(
      el,
      xyContainerConfig(
        el,
        { ...options, height, yMinZero: false },
        {
          components: [bar],
          xAxis,
          yAxis,
          xDomain,
          yDomain,
          yDirection: options.yDirection || 'south',
          // 类目轴在左：按标签文案动态预留，上限 yLabelMaxWidth
          yAxisMarginTicks: yTickValues,
          yAxisMarginFormat: catTickFormat,
          xAxisMarginTicks: valueTicks,
          xAxisMarginFormat: options.xTickFormat,
          tooltip,
        }
      ),
      data
    )

    const legend = series.map((s, i) => ({
      label: s.label,
      color: s.color || CHART_COLORS[i % CHART_COLORS.length],
    }))

    return { chart, el, legend }
  }

  /**
   * 柱线组合图
   * - 单柱+线（电商收支）：`bar` / `line` 各传一个对象
   * - 分组柱+线：`bars: [...]` + `line`（或 `lines`）
   * - 右侧百分比轴：`lineAxis: 'right'`（折线按 rightYDomain 映射到左轴域绘制；右侧刻度 HTML 叠层）
   * options.bar / options.bars / options.line / options.lines: { key, label, color, ... }
   */
  function mountComboChart(el, options) {
    if (!el) return null
    const height = options.height || 280
    el.classList.add('shadcn-chart-host')
    el.style.height = height + 'px'
    el.style.position = el.style.position || 'relative'

    const rawData = options.data || []
    // 兼容：bar/line 单对象（电商收支）；bars/lines 或多元素数组 = 分组柱 + 折线
    const barSeriesList = Array.isArray(options.bars)
      ? options.bars
      : Array.isArray(options.bar)
        ? options.bar
        : [options.bar || { key: 'bar', label: '柱', color: CHART_COLORS[1] }]
    const lineSeriesList = Array.isArray(options.lines)
      ? options.lines
      : Array.isArray(options.line)
        ? options.line
        : [options.line || { key: 'line', label: '线', color: CHART_COLORS[0] }]
    const xRaw = options.x || ((d) => d.x)
    const xLabel = options.xLabel || ((d) => d.label ?? String(xRaw(d)))
    const { data, x, tickFormat } = prepareNumericX(rawData, xRaw, xLabel)

    const barColors = barSeriesList.map((s, i) =>
      resolveColor(el, s.color || CHART_COLORS[(i + 1) % CHART_COLORS.length], themeFallback(el, i + 1))
    )
    const lineColors = lineSeriesList.map((s, i) =>
      resolveColor(el, s.color || CHART_COLORS[i % CHART_COLORS.length], themeFallback(el, i))
    )
    const barY = barSeriesList.map((s) => (d) => d[s.key])
    const isMultiBar = barSeriesList.length > 1
    const lineOnRight = options.lineAxis === 'right' || options.dualYAxis === true
    const rightYDomain = options.rightYDomain || [0, 100]
    const rightYTickValues = options.rightYTickValues || [0, 25, 50, 75, 100]
    const rightYTickFormat =
      options.rightYTickFormat ||
      ((v) => `${Number.isInteger(v) ? v : Math.round(v * 10) / 10}%`)

    const bar = new GroupedBar({
      x,
      y: barY.length === 1 ? barY[0] : barY,
      color: barColors.length === 1 ? barColors[0] : barColors,
      roundedCorners:
        barSeriesList[0] && barSeriesList[0].roundedCorners != null
          ? barSeriesList[0].roundedCorners
          : isMultiBar
            ? 4
            : 1,
      barPadding: options.barPadding != null ? options.barPadding : isMultiBar ? 0.2 : 0.08,
      groupPadding: options.groupPadding != null ? options.groupPadding : isMultiBar ? 0.05 : 0.02,
      ...(options.groupWidth != null ? { groupWidth: options.groupWidth } : {}),
      ...(options.groupMaxWidth != null
        ? { groupMaxWidth: options.groupMaxWidth }
        : options.groupWidth == null
          ? { groupMaxWidth: isMultiBar ? DEFAULT_BAR_MAX_WIDTH : 6 }
          : {}),
      ...(options.dataStep != null ? { dataStep: options.dataStep } : {}),
    })

    // 左轴域：双轴时仅由柱序列决定，避免百分比把柱拉扁
    const leftYAxis = yAxisConfig(data, {
      yMinZero: options.yMinZero !== false,
      getValues: (rows) =>
        collectNumericValues(
          rows,
          lineOnRight
            ? barSeriesList.map((s) => (d) => d[s.key])
            : [
                ...barSeriesList.map((s) => (d) => d[s.key]),
                ...lineSeriesList.map((s) => (d) => d[s.key]),
              ]
        ),
      tickFormat: options.yTickFormat,
      tickValues: options.yTickValues,
      yDomain: options.yDomain,
    })
    const leftDomain = leftYAxis.yDomain
    const [l0, l1] = leftDomain
    const [r0, r1] = rightYDomain
    const mapRightToLeft = (v) => {
      const t = (Number(v) - r0) / (r1 - r0 || 1)
      return l0 + t * (l1 - l0)
    }

    const curveType =
      options.curveType ||
      (CurveType && CurveType.Linear) ||
      'linear'
    const resolvedCurve =
      typeof curveType === 'string' && CurveType && CurveType[curveType.charAt(0).toUpperCase() + curveType.slice(1)]
        ? CurveType[curveType.charAt(0).toUpperCase() + curveType.slice(1)]
        : curveType === 'linear' && CurveType && CurveType.Linear
          ? CurveType.Linear
          : curveType
    const defaultLineWidth = options.lineWidth != null ? options.lineWidth : 2

    const lines = lineSeriesList.map(
      (s, i) =>
        new Line({
          x,
          y: lineOnRight ? (d) => mapRightToLeft(d[s.key]) : (d) => d[s.key],
          color: lineColors[i],
          lineWidth: s.lineWidth != null ? s.lineWidth : defaultLineWidth,
          curveType: resolvedCurve,
        })
    )

    const seriesForTip = [
      ...barSeriesList.map((s, i) => ({
        key: s.key,
        label: s.label,
        color: barColors[i],
        axis: 'left',
      })),
      ...lineSeriesList.map((s, i) => ({
        key: s.key,
        label: s.label,
        color: lineColors[i],
        axis: lineOnRight ? 'right' : 'left',
        format: lineOnRight ? rightYTickFormat : options.yTickFormat,
      })),
    ]

    const tooltip = createTooltipLayer()
    const crosshair = createCrosshair(el, {
      x,
      y: [
        ...barSeriesList.map((s) => (d) => d[s.key]),
        ...lineSeriesList.map((s) =>
          lineOnRight ? (d) => mapRightToLeft(d[s.key]) : (d) => d[s.key]
        ),
      ],
      colors: [...barColors, ...lineColors],
      tooltip,
      template: (d) => {
        if (!d) return ''
        const tipTitle =
          typeof options.tooltipLabel === 'function' ? options.tooltipLabel(d) : xLabel(d)
        const rows = seriesForTip.map((s) => ({
          label: s.label,
          value: d[s.key],
          color: s.color,
          format: s.format,
        }))
        return formatShadcnTooltip(tipTitle, rows)
      },
    })

    // 右侧百分比刻度需预留 margin.right
    const comboMargin = { ...(options.margin || {}) }
    if (lineOnRight) {
      const rightResolved = resolveDynamicLeftMargin(el, rightYTickValues, rightYTickFormat, {
        ...options,
        yLabelMinWidth: options.rightYLabelMinWidth ?? 36,
        yLabelMaxWidth: options.rightYLabelMaxWidth ?? 48,
      })
      comboMargin.right = Math.max(comboMargin.right != null ? comboMargin.right : 0, rightResolved.left)
      if (el.dataset) {
        el.dataset.yLabelRight = String(comboMargin.right)
      }
    }

    const xDomain =
      options.xDomain || computeNumericXExtent(data, x, options.xDomainPad != null ? options.xDomainPad : 0.35)

    const chart = new XYContainer(
      el,
      xyContainerConfig(
        el,
        { ...options, margin: comboMargin, height, yMinZero: true },
        {
          components: [bar, ...lines, crosshair],
          xAxis: xAxisConfig(data, tickFormat, {
            tickValues: options.xTickValues,
          }),
          yAxis: leftYAxis.axis,
          xDomain,
          yDomain: leftDomain,
          yAxisMarginTicks: leftYAxis.tickValues,
          yAxisMarginFormat: options.yTickFormat,
          ...xAxisMarginExtras(data, x, tickFormat, options),
          tooltip,
          crosshair,
        }
      ),
      data
    )

    if (lineOnRight) {
      mountRightPercentAxisOverlay(el, {
        height,
        margin: {
          top: (comboMargin.top != null ? comboMargin.top : 8),
          bottom: (comboMargin.bottom != null ? comboMargin.bottom : 8),
          right: comboMargin.right,
          left: Number((el.dataset && el.dataset.yLabelLeft) || comboMargin.left || 0),
        },
        tickValues: rightYTickValues,
        tickFormat: rightYTickFormat,
        yDomain: rightYDomain,
      })
    }

    return {
      chart,
      el,
      legend: [
        ...barSeriesList.map((s, i) => ({ label: s.label, color: barColors[i] })),
        ...lineSeriesList.map((s, i) => ({ label: s.label, color: lineColors[i] })),
      ],
    }
  }

  /** Unovis 无双轴：用 HTML 叠层画右侧百分比刻度（与左轴绘图区同高） */
  function mountRightPercentAxisOverlay(host, opts) {
    if (!host) return null
    host.querySelectorAll('.shadcn-chart-yaxis-right').forEach((n) => n.remove())
    const margin = opts.margin || {}
    const tickValues = opts.tickValues || []
    const tickFormat = opts.tickFormat || ((v) => String(v))
    const [y0, y1] = opts.yDomain || [0, 100]
    const layer = document.createElement('div')
    layer.className = 'shadcn-chart-yaxis-right'
    layer.setAttribute('aria-hidden', 'true')
    layer.style.top = (margin.top != null ? margin.top : 8) + 'px'
    layer.style.bottom = (margin.bottom != null ? margin.bottom : 8) + 'px'
    layer.style.width = (margin.right != null ? margin.right : 40) + 'px'
    tickValues.forEach((v) => {
      const t = (Number(v) - y0) / (y1 - y0 || 1)
      const span = document.createElement('span')
      span.className = 'shadcn-chart-yaxis-right-tick'
      span.textContent = tickFormat(v)
      span.style.top = (1 - t) * 100 + '%'
      layer.appendChild(span)
    })
    host.appendChild(layer)
    return layer
  }

  function applyDonutClockwiseEnter(el) {
    if (!el) return
    el.classList.remove('is-donut-cw-playing', 'shadcn-chart-host--donut-cw')
    el.querySelectorAll('.shadcn-donut-cw-veil').forEach((n) => n.remove())
    const veil = document.createElement('div')
    veil.className = 'shadcn-donut-cw-veil'
    veil.setAttribute('aria-hidden', 'true')
    el.classList.add('shadcn-chart-host--donut-cw')
    el.appendChild(veil)
    void el.offsetWidth
    el.classList.add('is-donut-cw-playing')
  }

  function mountDonutChart(el, options) {
    if (!el) return null
    const height = options.height || 280
    // 默认自顶部顺时针揭示；可传 'fade' | 'none'
    const enter = options.enterAnimation || 'clockwise'
    const clockwise = enter === 'clockwise'
    el.classList.add('shadcn-chart-host')
    el.classList.remove(
      'shadcn-chart-host--donut',
      'shadcn-chart-host--donut-cw',
      'shadcn-chart-host--donut-fade',
      'is-donut-cw-playing'
    )
    // 先清空宿主：二次 mount 不得叠加 SVG（主题切换连发时会并排成「双半圆」）
    el.innerHTML = ''
    // 强制重播入场（刷新 / 主题切换 remount 时）
    void el.offsetWidth
    el.classList.add('shadcn-chart-host--donut')
    if (enter === 'fade') el.classList.add('shadcn-chart-host--donut-fade')
    el.style.height = height + 'px'

    const data = options.data || []
    const value = options.value || ((d) => d.value)
    const label = options.label || ((d) => d.label)
    const colors = (options.colors || CHART_COLORS).map((c, i) =>
      resolveColor(el, c, themeFallback(el, i))
    )

    const centralFit = prepareDonutCentralLabel(el, options)

    const donut = new Donut({
      value,
      angleRange: [0, 2 * Math.PI],
      padAngle: options.padAngle != null ? options.padAngle : 0.02,
      color: (d, i) => colors[i % colors.length],
      centralLabel: options.centralLabel || '',
      centralSubLabel: options.centralSubLabel || '',
      centralLabelOffsetY: centralFit.centralLabelOffsetY,
      // pie: true 或不传 arcWidth 且 pieMode → 实心饼；默认环形厚度 20
      ...(options.pie
        ? {}
        : { arcWidth: options.arcWidth ?? 20 }),
      ...(options.radius != null ? { radius: options.radius } : {}),
    })

    const formatTipValue =
      typeof options.formatTooltipValue === 'function'
        ? options.formatTooltipValue
        : (row) => {
            const v = value(row)
            const suffix = options.tooltipValueSuffix != null ? options.tooltipValueSuffix : '%'
            return `${v}${suffix}`
          }

    const tooltip = new Tooltip({
      className: 'shadcn-chart-tooltip-root',
      triggers: {
        [Donut.selectors.segment]: (d) => {
          // Unovis Donut 传入的是弧段布局对象：{ data, index, value, startAngle, ... }
          const row = d && d.data != null ? d.data : d
          const idx = d && d.index != null ? d.index : Math.max(0, data.indexOf(row))
          const rowColor = resolveColor(el, colors[idx % colors.length], themeFallback(el, idx))
          return formatShadcnTooltip('', [
            { label: label(row), value: formatTipValue(row), color: rowColor },
          ])
        },
      },
    })

    const chart = new SingleContainer(
      el,
      {
        height,
        component: donut,
        tooltip,
      },
      data
    )

    // 挂载后再按真实 SVG 文本框收缩，避免 canvas 字体未解析导致测宽失败
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        refineDonutCentralLabelAfterMount(el, centralFit.label, options)
        if (clockwise) applyDonutClockwiseEnter(el)
      })
    })

    return {
      chart,
      el,
      legend: data.map((d, i) => ({
        label: label(d),
        color: colors[i % colors.length],
      })),
    }
  }

  /**
   * 雷达图（SVG，对齐 shadcn/recharts RadarChart 常用形态）
   * @param {HTMLElement} el
   * @param {object} options
   * @param {Array<object>} options.data - 行数据，含 label + 各系列字段
   * @param {Array<{key:string,label?:string,color?:string,fillOpacity?:number}>} options.series
   * @param {'polygon'|'circle'} [options.gridType='polygon']
   * @param {boolean} [options.gridFill=false] - 同心网格浅色填充（圆形填充网格）
   * @param {number} [options.gridFillOpacity=0.2]
   * @param {boolean} [options.showDots=false]
   * @param {number} [options.dotRadius=4]
   * @param {number} [options.levels=5]
   * @param {number} [options.maxValue] - 径向最大值，默认按数据推算
   * @param {number} [options.height=250]
   * @param {number} [options.strokeWidth=1.5]
   * @param {'grow'|'fade'|'none'} [options.enterAnimation='grow'] - 入场：自中心展开 / 淡入 / 无
   */
  function mountRadarChart(el, options) {
    if (!el) return null
    const opts = options || {}
    const data = Array.isArray(opts.data) ? opts.data : []
    const seriesIn = Array.isArray(opts.series) && opts.series.length
      ? opts.series
      : [{ key: 'value', label: '数值', color: 'var(--chart-1)', fillOpacity: 0.6 }]
    const n = data.length
    const height = opts.height || 250
    const levels = Math.max(1, opts.levels || 5)
    const gridType = opts.gridType === 'circle' ? 'circle' : 'polygon'
    const gridFill = !!opts.gridFill
    const gridFillOpacity = opts.gridFillOpacity != null ? opts.gridFillOpacity : 0.2
    const showDots = !!opts.showDots
    const dotRadius = opts.dotRadius != null ? opts.dotRadius : 4
    const strokeWidth = opts.strokeWidth != null ? opts.strokeWidth : 1.5
    const labelOf = (d) => (d && d.label != null ? String(d.label) : '')
    // 默认自中心展开；可传 'fade' | 'none'
    const enter = opts.enterAnimation || 'grow'

    el.classList.remove(
      'shadcn-chart-host--radar',
      'is-radar-enter',
      'is-radar-enter-fade'
    )
    void el.offsetWidth
    el.classList.add('shadcn-chart-host', 'shadcn-chart-host--radar')
    el.style.height = height + 'px'
    el.innerHTML = ''

    if (!n) {
      return { chart: null, el, legend: [] }
    }

    const series = seriesIn.map((s, i) => ({
      key: s.key,
      label: s.label || s.key,
      color: resolveColor(el, s.color || CHART_COLORS[i % CHART_COLORS.length], themeFallback(el, i)),
      fillOpacity: s.fillOpacity != null ? s.fillOpacity : i === 0 ? 0.6 : 0.45,
    }))

    let maxValue = opts.maxValue
    if (maxValue == null || !(maxValue > 0)) {
      let m = 0
      data.forEach((row) => {
        series.forEach((s) => {
          const v = Number(row[s.key])
          if (Number.isFinite(v) && v > m) m = v
        })
      })
      maxValue = m > 0 ? m : 1
      // 略放大，避免顶点贴边
      maxValue = Math.ceil(maxValue * 1.05)
    }

    const size = height
    const cx = size / 2
    const cy = size / 2
    const labelPad = 22
    const radius = Math.max(28, size / 2 - labelPad - 8)
    const angleAt = (i) => -Math.PI / 2 + (i / n) * Math.PI * 2
    const pointAt = (i, value) => {
      const r = (Math.max(0, Number(value) || 0) / maxValue) * radius
      const a = angleAt(i)
      return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]
    }
    const ringPoints = (levelFrac) => {
      const pts = []
      for (let i = 0; i < n; i++) {
        const a = angleAt(i)
        pts.push([cx + Math.cos(a) * radius * levelFrac, cy + Math.sin(a) * radius * levelFrac])
      }
      return pts
    }
    const polyAttr = (pts) => pts.map((p) => p[0].toFixed(2) + ',' + p[1].toFixed(2)).join(' ')

    const NS = 'http://www.w3.org/2000/svg'
    const svg = document.createElementNS(NS, 'svg')
    svg.setAttribute('viewBox', `0 0 ${size} ${size}`)
    svg.setAttribute('width', String(size))
    svg.setAttribute('height', String(size))
    svg.setAttribute('class', 'shadcn-radar-svg')
    svg.setAttribute('role', 'img')

    const gridStroke = cssColor(el, '--color-border-2', '#e5e6eb') || '#e5e6eb'
    const labelFill = cssColor(el, '--color-text-3', '#86909c') || '#86909c'
    const gridColor = resolveColor(el, series[0].color, themeFallback(el, 0))

    // 同心网格（自外向内画，便于填充叠色）
    for (let lv = levels; lv >= 1; lv--) {
      const frac = lv / levels
      if (gridType === 'circle') {
        const c = document.createElementNS(NS, 'circle')
        c.setAttribute('cx', String(cx))
        c.setAttribute('cy', String(cy))
        c.setAttribute('r', String(radius * frac))
        c.setAttribute('class', 'shadcn-radar-grid-ring')
        c.setAttribute('fill', gridFill ? gridColor : 'none')
        c.setAttribute('fill-opacity', gridFill ? String(gridFillOpacity) : '0')
        c.setAttribute('stroke', gridStroke)
        c.setAttribute('stroke-opacity', '0.7')
        svg.appendChild(c)
      } else {
        const p = document.createElementNS(NS, 'polygon')
        p.setAttribute('points', polyAttr(ringPoints(frac)))
        p.setAttribute('class', 'shadcn-radar-grid-ring')
        p.setAttribute('fill', gridFill ? gridColor : 'none')
        p.setAttribute('fill-opacity', gridFill ? String(gridFillOpacity) : '0')
        p.setAttribute('stroke', gridStroke)
        p.setAttribute('stroke-opacity', '0.7')
        svg.appendChild(p)
      }
    }

    // 径向轴线
    for (let i = 0; i < n; i++) {
      const a = angleAt(i)
      const line = document.createElementNS(NS, 'line')
      line.setAttribute('x1', String(cx))
      line.setAttribute('y1', String(cy))
      line.setAttribute('x2', (cx + Math.cos(a) * radius).toFixed(2))
      line.setAttribute('y2', (cy + Math.sin(a) * radius).toFixed(2))
      line.setAttribute('class', 'shadcn-radar-axis')
      line.setAttribute('stroke', gridStroke)
      line.setAttribute('stroke-opacity', '0.55')
      svg.appendChild(line)
    }

    // 系列色块层（入场动画只作用在此层）
    const plot = document.createElementNS(NS, 'g')
    plot.setAttribute('class', 'shadcn-radar-plot')
    plot.style.transformOrigin = `${cx}px ${cy}px`

    series.forEach((s) => {
      const pts = data.map((row, i) => pointAt(i, row[s.key]))
      const poly = document.createElementNS(NS, 'polygon')
      poly.setAttribute('points', polyAttr(pts))
      poly.setAttribute('class', 'shadcn-radar-series')
      poly.setAttribute('fill', s.color)
      poly.setAttribute('fill-opacity', String(s.fillOpacity))
      poly.setAttribute('stroke', s.color)
      poly.setAttribute('stroke-width', String(strokeWidth))
      poly.setAttribute('stroke-linejoin', 'round')
      plot.appendChild(poly)

      if (showDots) {
        pts.forEach((pt, i) => {
          const dot = document.createElementNS(NS, 'circle')
          dot.setAttribute('cx', pt[0].toFixed(2))
          dot.setAttribute('cy', pt[1].toFixed(2))
          dot.setAttribute('r', String(dotRadius))
          dot.setAttribute('fill', s.color)
          dot.setAttribute('fill-opacity', '1')
          dot.setAttribute('stroke', '#fff')
          dot.setAttribute('stroke-width', '1')
          dot.setAttribute('class', 'shadcn-radar-dot')
          dot.setAttribute('data-index', String(i))
          plot.appendChild(dot)
        })
      }
    })
    svg.appendChild(plot)

    // 轴标签（静止）
    for (let i = 0; i < n; i++) {
      const a = angleAt(i)
      const lx = cx + Math.cos(a) * (radius + 14)
      const ly = cy + Math.sin(a) * (radius + 14)
      const text = document.createElementNS(NS, 'text')
      text.setAttribute('x', lx.toFixed(2))
      text.setAttribute('y', ly.toFixed(2))
      text.setAttribute('class', 'shadcn-radar-label')
      text.setAttribute('fill', labelFill)
      text.setAttribute('font-size', '12')
      text.setAttribute('text-anchor', 'middle')
      text.setAttribute('dominant-baseline', 'middle')
      text.textContent = labelOf(data[i])
      svg.appendChild(text)
    }

    // 悬停热区：每轴外侧透明圆，便于点选
    const hitLayer = document.createElementNS(NS, 'g')
    hitLayer.setAttribute('class', 'shadcn-radar-hit-layer')
    for (let i = 0; i < n; i++) {
      let peak = 0
      series.forEach((s) => {
        const v = Number(data[i][s.key])
        if (Number.isFinite(v) && v > peak) peak = v
      })
      const hitPt = pointAt(i, Math.max(peak, maxValue * 0.4))
      const hit = document.createElementNS(NS, 'circle')
      hit.setAttribute('cx', hitPt[0].toFixed(2))
      hit.setAttribute('cy', hitPt[1].toFixed(2))
      hit.setAttribute('r', '20')
      hit.setAttribute('fill', 'transparent')
      hit.setAttribute('class', 'shadcn-radar-hit')
      hit.setAttribute('data-index', String(i))
      hitLayer.appendChild(hit)
    }
    svg.appendChild(hitLayer)

    el.appendChild(svg)

    // 提示框：标题=月份，下列出色块+系列+数值（对齐 XY ChartTooltip）
    // 挂到 body + fixed，避免被卡片 overflow 裁切
    const tipEl = document.createElement('div')
    tipEl.className = 'shadcn-chart-tooltip-root shadcn-radar-tooltip'
    tipEl.setAttribute('aria-hidden', 'true')
    document.body.appendChild(tipEl)

    const hideTip = () => {
      tipEl.classList.remove('is-open')
      tipEl.setAttribute('aria-hidden', 'true')
    }
    const placeTip = (clientX, clientY) => {
      const pad = 12
      const tipW = tipEl.offsetWidth || 140
      const tipH = tipEl.offsetHeight || 60
      let left = clientX + pad
      let top = clientY + pad
      const vw = window.innerWidth || document.documentElement.clientWidth
      const vh = window.innerHeight || document.documentElement.clientHeight
      if (left + tipW > vw - 8) left = clientX - tipW - pad
      if (top + tipH > vh - 8) top = clientY - tipH - pad
      if (left < 8) left = 8
      if (top < 8) top = 8
      tipEl.style.left = left + 'px'
      tipEl.style.top = top + 'px'
    }
    const showTip = (idx, clientX, clientY) => {
      if (idx < 0 || idx >= n) {
        hideTip()
        return
      }
      const row = data[idx]
      const rows = series.map((s) => ({
        label: s.label,
        value: row[s.key],
        color: s.color,
      }))
      tipEl.innerHTML = formatShadcnTooltip(labelOf(row), rows)
      tipEl.classList.add('is-open')
      tipEl.setAttribute('aria-hidden', 'false')
      placeTip(clientX, clientY)
    }
    const nearestIndex = (clientX, clientY) => {
      const rect = svg.getBoundingClientRect()
      if (!rect.width || !rect.height) return -1
      const sx = ((clientX - rect.left) / rect.width) * size
      const sy = ((clientY - rect.top) / rect.height) * size
      const dx = sx - cx
      const dy = sy - cy
      const dist = Math.hypot(dx, dy)
      if (dist < 10 || dist > radius + 18) return -1
      let a = Math.atan2(dy, dx) + Math.PI / 2
      if (a < 0) a += Math.PI * 2
      return Math.round((a / (Math.PI * 2)) * n) % n
    }

    const onMove = (e) => {
      const idx =
        e.target && e.target.classList && e.target.classList.contains('shadcn-radar-hit')
          ? Number(e.target.getAttribute('data-index'))
          : nearestIndex(e.clientX, e.clientY)
      if (idx < 0) {
        hideTip()
        return
      }
      showTip(idx, e.clientX, e.clientY)
    }
    const onLeave = () => hideTip()
    svg.addEventListener('mousemove', onMove)
    svg.addEventListener('mouseleave', onLeave)

    // 色块层挂好后再打入场类，网格/标签无动画
    if (enter === 'fade') {
      void el.offsetWidth
      el.classList.add('is-radar-enter-fade')
    } else if (enter !== 'none') {
      void el.offsetWidth
      el.classList.add('is-radar-enter')
    }

    return {
      chart: {
        type: 'radar-svg',
        dispose() {
          svg.removeEventListener('mousemove', onMove)
          svg.removeEventListener('mouseleave', onLeave)
          hideTip()
          if (tipEl.parentNode) tipEl.parentNode.removeChild(tipEl)
        },
      },
      el,
      legend: series.map((s) => ({ label: s.label, color: s.color })),
    }
  }

  /**
   * 径向条形 / 半环堆叠（SVG，对齐 shadcn/recharts RadialBarChart / 半圆 Pie）
   * @param {HTMLElement} el
   * @param {object} options
   * @param {Array<{label?:string,value:number,color?:string}>} options.data
   * @param {'bars'|'gauge'|'stacked'} [options.mode='bars']
   * @param {number} [options.height=250]
   * @param {number} [options.size] - 视口边长，默认等于 height
   * @param {number} [options.innerRadius=30]
   * @param {number} [options.outerRadius=110]
   * @param {number} [options.startAngle=0] - 度，0=三点钟，正方向逆时针（同 Recharts）
   * @param {number} [options.endAngle=360]
   * @param {number} [options.maxValue]
   * @param {boolean} [options.background=true] - bars 灰色底环（扇环填充，非描边）
   * @param {number} [options.cornerRadius=0] - 扇环角圆角（对齐 Sector cornerRadius）
   * @param {number} [options.barGap=4] - bars 环间距
   * @param {boolean} [options.polarTrack=false] - shape/text 灰环实心轨道
   * @param {boolean} [options.showLabels=false] - 弧内侧起点文字（标签径向图）
   * @param {number} [options.cyRatio=0.5] - 圆心纵向比例（堆叠半圆可 >0.5 下移）
   * @param {string} [options.centralLabel]
   * @param {string} [options.centralSubLabel]
   * @param {number} [options.centralLabelOffsetY=0]
   * @param {(value:number)=>string} [options.formatValue] - tooltip / legend 数值格式化
   * @param {'grow'|'fade'|'none'} [options.enterAnimation='grow']
   */
  function mountRadialBarChart(el, options) {
    if (!el) return null
    const opts = options || {}
    const dataIn = Array.isArray(opts.data) ? opts.data : []
    const mode = opts.mode === 'gauge' || opts.mode === 'stacked' ? opts.mode : 'bars'
    const height = opts.height || 250
    const size = opts.size || height
    const startAngle = opts.startAngle != null ? Number(opts.startAngle) : 0
    const endAngle = opts.endAngle != null ? Number(opts.endAngle) : 360
    const showBg = opts.background !== false
    const cornerRadius = opts.cornerRadius != null ? Number(opts.cornerRadius) : 0
    const polarTrack = !!opts.polarTrack
    const showLabels = !!opts.showLabels
    const cyRatio = opts.cyRatio != null ? Number(opts.cyRatio) : 0.5
    const enter = opts.enterAnimation || 'grow'
    const formatValue =
      typeof opts.formatValue === 'function'
        ? opts.formatValue
        : (v) => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    const labelOf = (d) => (d && d.label != null ? String(d.label) : '')
    const valueOf = (d) => {
      const v = Number(d && d.value)
      return Number.isFinite(v) ? Math.max(0, v) : 0
    }

    el.classList.remove(
      'shadcn-chart-host--radial',
      'shadcn-chart-host--radial-stacked',
      'is-radial-enter',
      'is-radial-enter-fade'
    )
    void el.offsetWidth
    el.classList.add('shadcn-chart-host', 'shadcn-chart-host--radial')
    if (mode === 'stacked') el.classList.add('shadcn-chart-host--radial-stacked')
    el.style.height = height + 'px'
    el.innerHTML = ''

    const rows = dataIn.map((d, i) => ({
      label: labelOf(d) || 'Item ' + (i + 1),
      value: valueOf(d),
      color: resolveColor(el, d.color || CHART_COLORS[i % CHART_COLORS.length], themeFallback(el, i)),
    }))

    if (!rows.length) {
      return { chart: null, el, legend: [] }
    }

    let maxValue = opts.maxValue
    if (maxValue == null || !(maxValue > 0)) {
      maxValue = Math.max(...rows.map((r) => r.value), 1)
    }

    const cx = size / 2
    const cy = size * cyRatio
    const NS = 'http://www.w3.org/2000/svg'
    const svg = document.createElementNS(NS, 'svg')
    svg.setAttribute('viewBox', `0 0 ${size} ${size}`)
    svg.setAttribute('width', String(size))
    svg.setAttribute('height', String(size))
    svg.setAttribute('class', 'shadcn-radial-svg')
    svg.setAttribute('role', 'img')

    // Recharts RadialBar 背景默认 #eee；主题下用 fill-2 更协调
    const trackFill = cssColor(el, '--color-fill-2', '#eeeeee') || '#eeeeee'
    const mutedFill = cssColor(el, '--color-fill-2', '#f2f3f5') || '#f2f3f5'
    const holeFill = cssColor(el, '--color-bg-2', '#ffffff') || '#ffffff'

    const DEG = Math.PI / 180
    const polar = (r, angleDeg) => {
      const rad = -angleDeg * DEG
      return { x: cx + Math.cos(rad) * r, y: cy + Math.sin(rad) * r }
    }
    const signOf = (v) => (v === 0 ? 0 : v > 0 ? 1 : -1)
    const deltaAngleOf = (a0, a1) => {
      const sign = signOf(a1 - a0)
      return sign * Math.min(Math.abs(a1 - a0), 359.999)
    }

    /** 对齐 Recharts getTangentCircle；内环须 isExternal=true */
    const tangentCircle = (radius, angle, sign, cr, isExternal) => {
      const centerRadius = cr * (isExternal ? 1 : -1) + radius
      const theta = Math.asin(cr / Math.abs(centerRadius)) / DEG
      const centerAngle = angle + sign * theta
      return {
        circleTangency: polar(radius, centerAngle),
        lineTangency: polar(Math.abs(centerRadius) * Math.cos(theta * DEG), angle),
        theta,
      }
    }

    const sectorPath = (innerR, outerR, a0, a1, crIn) => {
      const angle = deltaAngleOf(a0, a1)
      if (!angle || outerR <= 0) return ''
      const aEnd = a0 + angle
      const thickness = outerR - Math.max(0, innerR)
      let cr = Math.min(Math.max(0, crIn || 0), thickness / 2)
      if (cr > 0 && Math.abs(angle) < 0.5) cr = 0

      // 满环：画真正闭合的圆环，避免弧端点 / 圆角接合留缝
      if (Math.abs(angle) >= 359.5 && innerR > 0) {
        return [
          `M ${cx + outerR},${cy}`,
          `A ${outerR},${outerR},0,1,1,${cx - outerR},${cy}`,
          `A ${outerR},${outerR},0,1,1,${cx + outerR},${cy}`,
          `M ${cx + innerR},${cy}`,
          `A ${innerR},${innerR},0,1,0,${cx - innerR},${cy}`,
          `A ${innerR},${innerR},0,1,0,${cx + innerR},${cy}`,
          'Z',
        ].join(' ')
      }

      if (!(cr > 0) || !(innerR > 0)) {
        const os = polar(outerR, a0)
        const oe = polar(outerR, aEnd)
        const large = Math.abs(angle) > 180 ? 1 : 0
        const sweepOut = a0 > aEnd ? 1 : 0
        let d = `M ${os.x},${os.y} A ${outerR},${outerR},0,${large},${sweepOut},${oe.x},${oe.y}`
        if (innerR > 0) {
          const ie = polar(innerR, aEnd)
          const is = polar(innerR, a0)
          const sweepIn = a0 <= aEnd ? 1 : 0
          d += ` L ${ie.x},${ie.y} A ${innerR},${innerR},0,${large},${sweepIn},${is.x},${is.y} Z`
        } else {
          d += ` L ${cx},${cy} Z`
        }
        return d
      }

      // 有圆角：对齐 Recharts getSectorWithCorner（外环内切、内环外切）
      const sign = signOf(angle)
      const so = tangentCircle(outerR, a0, sign, cr, false)
      const eo = tangentCircle(outerR, aEnd, -sign, cr, false)
      const outerArcAngle = Math.abs(angle) - so.theta - eo.theta
      if (outerArcAngle < 0) {
        return sectorPath(innerR, outerR, a0, a1, 0)
      }
      const si = tangentCircle(innerR, a0, sign, cr, true)
      const ei = tangentCircle(innerR, aEnd, -sign, cr, true)
      const innerArcAngle = Math.abs(angle) - si.theta - ei.theta
      if (innerArcAngle < 0) {
        return sectorPath(innerR, outerR, a0, a1, 0)
      }
      const cornerSweep = sign < 0 ? 1 : 0
      const outerLarge = outerArcAngle > 180 ? 1 : 0
      const outerSweep = sign < 0 ? 1 : 0
      const innerLarge = innerArcAngle > 180 ? 1 : 0
      const innerSweep = sign > 0 ? 1 : 0
      return [
        `M ${so.lineTangency.x},${so.lineTangency.y}`,
        `A${cr},${cr},0,0,${cornerSweep},${so.circleTangency.x},${so.circleTangency.y}`,
        `A${outerR},${outerR},0,${outerLarge},${outerSweep},${eo.circleTangency.x},${eo.circleTangency.y}`,
        `A${cr},${cr},0,0,${cornerSweep},${eo.lineTangency.x},${eo.lineTangency.y}`,
        `L${ei.lineTangency.x},${ei.lineTangency.y}`,
        `A${cr},${cr},0,0,${cornerSweep},${ei.circleTangency.x},${ei.circleTangency.y}`,
        `A${innerR},${innerR},0,${innerLarge},${innerSweep},${si.circleTangency.x},${si.circleTangency.y}`,
        `A${cr},${cr},0,0,${cornerSweep},${si.lineTangency.x},${si.lineTangency.y}`,
        'Z',
      ].join(' ')
    }

    const appendSector = (parent, innerR, outerR, a0, a1, fill, cr) => {
      const d = sectorPath(innerR, outerR, a0, a1, cr)
      if (!d) return null
      const path = document.createElementNS(NS, 'path')
      path.setAttribute('d', d)
      path.setAttribute('fill', fill)
      path.setAttribute('stroke', 'none')
      path.setAttribute('class', 'shadcn-radial-sector')
      parent.appendChild(path)
      return path
    }

    const plot = document.createElementNS(NS, 'g')
    plot.setAttribute('class', 'shadcn-radial-plot')
    plot.style.transformOrigin = `${cx}px ${cy}px`

    // 几何缓存：供角度展开入场复用
    const n = rows.length
    let drawInnerR = opts.innerRadius != null ? Number(opts.innerRadius) : mode === 'gauge' ? 80 : mode === 'stacked' ? 94 : 30
    let drawOuterR = opts.outerRadius != null ? Number(opts.outerRadius) : mode === 'gauge' ? 110 : mode === 'stacked' ? 124 : 110
    if (polarTrack && mode === 'gauge') {
      const trackOuter = drawOuterR - 3
      const trackInner = drawInnerR + 3
      const outerC = document.createElementNS(NS, 'circle')
      outerC.setAttribute('cx', String(cx))
      outerC.setAttribute('cy', String(cy))
      outerC.setAttribute('r', String(trackOuter))
      outerC.setAttribute('fill', mutedFill)
      outerC.setAttribute('class', 'shadcn-radial-polar-track')
      svg.appendChild(outerC)
      const hole = document.createElementNS(NS, 'circle')
      hole.setAttribute('cx', String(cx))
      hole.setAttribute('cy', String(cy))
      hole.setAttribute('r', String(trackInner))
      hole.setAttribute('fill', holeFill)
      hole.setAttribute('class', 'shadcn-radial-polar-hole')
      svg.appendChild(hole)
      drawInnerR = trackInner
      drawOuterR = trackOuter
    }

    const band = mode === 'stacked' ? 0 : Math.max(4, (drawOuterR - drawInnerR) / n)
    const gap = mode === 'gauge' || mode === 'stacked' ? 0 : opts.barGap != null ? Number(opts.barGap) : 4
    const thickness = mode === 'stacked' ? drawOuterR - drawInnerR : Math.max(2, band - gap)
    const angleSpan = endAngle - startAngle
    const stackedTotal = mode === 'stacked' ? rows.reduce((s, r) => s + r.value, 0) || 1 : 1

    /** @type {{index:number,innerR:number,outerR:number,a0:number,a1:number,label:string,color:string}[]} */
    let ringMeta = []

    const paintSectors = (progress) => {
      const p = Math.max(0, Math.min(1, progress))
      while (plot.firstChild) plot.removeChild(plot.firstChild)
      ringMeta = []

      if (mode === 'stacked') {
        let cursor = startAngle
        const span = angleSpan * p
        rows.forEach((row, i) => {
          const next = cursor + (row.value / stackedTotal) * span
          const sector = appendSector(plot, drawInnerR, drawOuterR, cursor, next, row.color, cornerRadius)
          if (sector) {
            sector.setAttribute('data-index', String(i))
            ringMeta.push({
              index: i,
              innerR: drawInnerR,
              outerR: drawOuterR,
              a0: cursor,
              a1: next,
              label: row.label,
              color: row.color,
            })
          }
          cursor = next
        })
        return
      }

      rows.forEach((row, i) => {
        const r0 = drawInnerR + i * band + gap / 2
        const r1 = r0 + thickness
        if (showBg && !polarTrack) {
          appendSector(plot, r0, r1, startAngle, endAngle, trackFill, 0)
        }
        const t = Math.min(1, row.value / maxValue)
        const finalA1 = startAngle + angleSpan * t
        const a1 = startAngle + (finalA1 - startAngle) * p
        const sector = appendSector(plot, r0, r1, startAngle, a1, row.color, cornerRadius)
        if (sector) {
          sector.setAttribute('data-index', String(i))
          ringMeta.push({
            index: i,
            innerR: r0,
            outerR: r1,
            a0: startAngle,
            a1: finalA1,
            label: row.label,
            color: row.color,
          })
        }
      })
    }

    svg.appendChild(plot)

    const labelLayer = document.createElementNS(NS, 'g')
    labelLayer.setAttribute('class', 'shadcn-radial-labels')
    const defs = document.createElementNS(NS, 'defs')
    svg.appendChild(defs)
    svg.appendChild(labelLayer)

    const paintLabels = () => {
      while (defs.firstChild) defs.removeChild(defs.firstChild)
      while (labelLayer.firstChild) labelLayer.removeChild(labelLayer.firstChild)
      if (!showLabels || !ringMeta.length) return
      // 对齐 Recharts LabelList position="insideStart"（Label.js）：
      // 中线半径 + 起点角偏移 5° + 近整圆 textPath，dominant-baseline=central
      const labelOffsetDeg = 5
      const clockWise = false
      ringMeta.forEach((ring, i) => {
        const delta = deltaAngleOf(ring.a0, ring.a1)
        if (Math.abs(delta) < 12) return
        const radius = (ring.innerR + ring.outerR) / 2
        const sign = delta >= 0 ? 1 : -1
        const labelAngle = ring.a0 + sign * labelOffsetDeg
        let direction = clockWise
        direction = delta <= 0 ? direction : !direction
        const startPoint = polar(radius, labelAngle)
        const endPoint = polar(radius, labelAngle + (direction ? 1 : -1) * 359)
        const pathId = `radial-label-${Math.random().toString(36).slice(2, 9)}-${i}`
        const p = document.createElementNS(NS, 'path')
        p.setAttribute('id', pathId)
        p.setAttribute(
          'd',
          `M${startPoint.x},${startPoint.y} A${radius},${radius},0,1,${direction ? 0 : 1},${endPoint.x},${endPoint.y}`
        )
        p.setAttribute('fill', 'none')
        defs.appendChild(p)
        const text = document.createElementNS(NS, 'text')
        text.setAttribute('class', 'shadcn-radial-arc-label')
        text.setAttribute('dominant-baseline', 'central')
        text.setAttribute('fill', '#fff')
        text.setAttribute('font-size', '11')
        const tp = document.createElementNS(NS, 'textPath')
        tp.setAttribute('href', '#' + pathId)
        tp.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + pathId)
        tp.textContent = ring.label
        text.appendChild(tp)
        labelLayer.appendChild(text)
      })
    }

    const centralGroup = document.createElementNS(NS, 'g')
    centralGroup.setAttribute('class', 'shadcn-radial-central')
    let centralMainEl = null
    let centralSubEl = null
    let centralFitOpts = null
    if (opts.centralLabel) {
      const fitOpts = {
        height: size,
        radius: drawOuterR,
        arcWidth: Math.max(10, drawOuterR - drawInnerR),
        pie: false,
        centralLabel: opts.centralLabel,
        centralSubLabel: opts.centralSubLabel,
        centralLabelFontSize: opts.centralLabelFontSize != null ? opts.centralLabelFontSize : 26,
        centralLabelMinFontSize: opts.centralLabelMinFontSize != null ? opts.centralLabelMinFontSize : 12,
        centralLabelOffsetY: opts.centralLabelOffsetY,
      }
      const centralFit = prepareDonutCentralLabel(el, fitOpts)
      centralFitOpts = fitOpts
      const oy = centralFit.centralLabelOffsetY || 0
      const fontSize = centralFit.fontSize
      const csHost = getComputedStyle(el)
      const family =
        resolveCssValue(el, csHost.getPropertyValue('--vis-donut-central-label-font-family')) ||
        csHost.fontFamily ||
        'sans-serif'
      // 颜色/字重交给 CSS token（与圆环 .shadcn-chart-host--donut 一致），避免被 Unovis :root 盖掉后与属性 fill 打架
      centralMainEl = document.createElementNS(NS, 'text')
      centralMainEl.setAttribute('x', String(cx))
      centralMainEl.setAttribute('y', String(cy + oy + (opts.centralSubLabel ? -8 : 0)))
      centralMainEl.setAttribute('text-anchor', 'middle')
      centralMainEl.setAttribute('dominant-baseline', 'middle')
      centralMainEl.setAttribute('class', 'shadcn-radial-central-label')
      centralMainEl.setAttribute('font-size', String(fontSize))
      centralMainEl.setAttribute('font-family', family)
      centralMainEl.style.fontFamily = family
      centralMainEl.textContent = String(opts.centralLabel)
      centralGroup.appendChild(centralMainEl)
      if (opts.centralSubLabel) {
        centralSubEl = document.createElementNS(NS, 'text')
        centralSubEl.setAttribute('x', String(cx))
        centralSubEl.setAttribute('y', String(cy + oy + Math.max(16, fontSize * 0.62)))
        centralSubEl.setAttribute('text-anchor', 'middle')
        centralSubEl.setAttribute('dominant-baseline', 'middle')
        centralSubEl.setAttribute('class', 'shadcn-radial-central-sub')
        centralSubEl.setAttribute('font-size', '14')
        centralSubEl.textContent = String(opts.centralSubLabel)
        centralGroup.appendChild(centralSubEl)
      }
      svg.appendChild(centralGroup)
    }

    el.appendChild(svg)

    let animFrame = 0
    const prefersReduced =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
    const runAngularEnter = enter !== 'none' && enter !== 'fade' && !prefersReduced

    const finishPaint = () => {
      paintSectors(1)
      paintLabels()
      if (centralFitOpts && opts.centralLabel) {
        requestAnimationFrame(() => {
          refineDonutCentralLabelAfterMount(el, String(opts.centralLabel), centralFitOpts)
          if (centralMainEl) {
            const sz =
              parseFloat(el.style.getPropertyValue('--vis-donut-central-label-font-size')) ||
              Number(centralMainEl.getAttribute('font-size'))
            centralMainEl.setAttribute('font-size', String(sz))
          }
        })
      }
    }

    if (enter === 'fade') {
      paintSectors(1)
      paintLabels()
      void el.offsetWidth
      el.classList.add('is-radial-enter-fade')
      if (centralFitOpts && opts.centralLabel) {
        requestAnimationFrame(() => refineDonutCentralLabelAfterMount(el, String(opts.centralLabel), centralFitOpts))
      }
    } else if (runAngularEnter) {
      // 按终态角度方向展开：span>0 逆时针，span<0 顺时针（对齐 Recharts Radial/Pie）
      const duration = 850
      const t0 = performance.now()
      paintSectors(0)
      const tick = (now) => {
        const raw = Math.min(1, (now - t0) / duration)
        const eased = 1 - Math.pow(1 - raw, 3)
        paintSectors(eased)
        if (raw < 1) {
          animFrame = requestAnimationFrame(tick)
        } else {
          finishPaint()
        }
      }
      animFrame = requestAnimationFrame(tick)
    } else {
      finishPaint()
    }

    const tipEl = document.createElement('div')
    tipEl.className = 'shadcn-chart-tooltip-root shadcn-radial-tooltip'
    tipEl.setAttribute('aria-hidden', 'true')
    document.body.appendChild(tipEl)

    const hideTip = () => {
      tipEl.classList.remove('is-open')
      tipEl.setAttribute('aria-hidden', 'true')
    }
    const placeTip = (clientX, clientY) => {
      const pad = 12
      const tipW = tipEl.offsetWidth || 140
      const tipH = tipEl.offsetHeight || 60
      let left = clientX + pad
      let top = clientY + pad
      const vw = window.innerWidth || document.documentElement.clientWidth
      const vh = window.innerHeight || document.documentElement.clientHeight
      if (left + tipW > vw - 8) left = clientX - tipW - pad
      if (top + tipH > vh - 8) top = clientY - tipH - pad
      if (left < 8) left = 8
      if (top < 8) top = 8
      tipEl.style.left = left + 'px'
      tipEl.style.top = top + 'px'
    }
    const showTip = (idx, clientX, clientY) => {
      if (idx < 0 || idx >= rows.length) {
        hideTip()
        return
      }
      const row = rows[idx]
      tipEl.innerHTML = formatShadcnTooltip('', [
        { label: row.label, value: formatValue(row.value), color: row.color },
      ])
      tipEl.classList.add('is-open')
      tipEl.setAttribute('aria-hidden', 'false')
      placeTip(clientX, clientY)
    }

    const onMove = (e) => {
      const t = e.target
      if (!t || !t.getAttribute) {
        hideTip()
        return
      }
      const idx = Number(t.getAttribute('data-index'))
      if (!Number.isFinite(idx)) {
        hideTip()
        return
      }
      showTip(idx, e.clientX, e.clientY)
    }
    const onLeave = () => hideTip()
    svg.addEventListener('mousemove', onMove)
    svg.addEventListener('mouseleave', onLeave)

    return {
      chart: {
        type: 'radial-svg',
        dispose() {
          if (animFrame) cancelAnimationFrame(animFrame)
          svg.removeEventListener('mousemove', onMove)
          svg.removeEventListener('mouseleave', onLeave)
          hideTip()
          if (tipEl.parentNode) tipEl.parentNode.removeChild(tipEl)
        },
      },
      el,
      legend: rows.map((r) => ({ label: r.label, color: r.color, value: r.value })),
    }
  }

  /** 南丁格尔 / 半圆极坐标玫瑰图（SVG） */
  function mountRoseChart(el, options) {
    if (!el) return null
    const opts = options || {}
    const layout = opts.layout === 'semi' ? 'semi' : 'nightingale'
    const roseType = opts.roseType === 'area' ? 'area' : 'radius'
    const dataIn = Array.isArray(opts.data) ? opts.data : []
    const height = opts.height || 280
    const padAngle = opts.padAngle != null ? Number(opts.padAngle) : layout === 'semi' ? 2.2 : 1.2
    const showGrid = opts.showGrid !== false
    const showLabels = opts.showLabels !== false
    const showAxis = opts.showAxis !== false
    const enter = opts.skipEnter ? 'none' : opts.enterAnimation || 'grow'
    const formatValue =
      typeof opts.formatValue === 'function'
        ? opts.formatValue
        : (v) =>
            layout === 'nightingale'
              ? (Number.isInteger(v) ? v.toFixed(1) : String(Math.round(v * 10) / 10)) + '%'
              : String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ',')

    el.classList.remove(
      'shadcn-chart-host--rose',
      'shadcn-chart-host--rose-nightingale',
      'shadcn-chart-host--rose-semi',
      'is-rose-enter-fade',
      'is-hovering'
    )
    void el.offsetWidth
    el.classList.add('shadcn-chart-host', 'shadcn-chart-host--rose')
    el.classList.add(layout === 'semi' ? 'shadcn-chart-host--rose-semi' : 'shadcn-chart-host--rose-nightingale')
    el.style.height = height + 'px'
    el.innerHTML = ''

    const rows = dataIn.map((d, i) => ({
      label: d && d.label != null ? String(d.label) : 'Item ' + (i + 1),
      value: (() => {
        const v = Number(d && d.value)
        return Number.isFinite(v) ? Math.max(0, v) : 0
      })(),
      color: resolveColor(el, d && d.color ? d.color : chartTokenAt(i), themeFallback(el, i)),
    }))
    if (!rows.length) return { chart: null, el, legend: [] }

    let maxValue = opts.maxValue
    if (maxValue == null || !(maxValue > 0)) maxValue = Math.max(...rows.map((r) => r.value), 1)

    const NS = 'http://www.w3.org/2000/svg'
    const DEG = Math.PI / 180
    const n = rows.length
    const width = layout === 'semi' ? Math.max(280, el.clientWidth || opts.width || 520) : opts.size || height
    const size = layout === 'semi' ? width : opts.size || height
    const labelPad = layout === 'semi' ? 36 : 8
    const axisPad = layout === 'semi' && showAxis ? 22 : 6
    const cx = size / 2
    const cy = layout === 'semi' ? height - axisPad : size / 2
    const maxOuter =
      opts.outerRadius != null
        ? Number(opts.outerRadius)
        : layout === 'semi'
          ? Math.max(64, Math.min(cx - labelPad, cy - labelPad + 6))
          : Math.max(56, size / 2 - 8)
    const innerR =
      opts.innerRadius != null
        ? Number(opts.innerRadius)
        : layout === 'semi'
          ? Math.max(18, maxOuter * 0.16)
          : Math.max(22, maxOuter * 0.32)
    const startAngle = opts.startAngle != null ? Number(opts.startAngle) : layout === 'semi' ? 180 : 90
    const endAngle = opts.endAngle != null ? Number(opts.endAngle) : layout === 'semi' ? 0 : 90 + 360
    const angleSpan = endAngle - startAngle
    const step = n ? angleSpan / n : 0

    const polar = (r, angleDeg) => {
      const rad = -angleDeg * DEG
      return { x: cx + Math.cos(rad) * r, y: cy + Math.sin(rad) * r }
    }
    const sectorPath = (inner, outer, a0, a1) => {
      const angle = a1 - a0
      if (!angle || outer <= 0) return ''
      const os = polar(outer, a0)
      const oe = polar(outer, a1)
      const large = Math.abs(angle) > 180 ? 1 : 0
      const sweepOut = angle < 0 ? 1 : 0
      let d = `M ${os.x},${os.y} A ${outer},${outer},0,${large},${sweepOut},${oe.x},${oe.y}`
      if (inner > 0) {
        const ie = polar(inner, a1)
        const is = polar(inner, a0)
        d += ` L ${ie.x},${ie.y} A ${inner},${inner},0,${large},${angle < 0 ? 0 : 1},${is.x},${is.y} Z`
      } else d += ` L ${cx},${cy} Z`
      return d
    }
    const radiusOf = (value, progress) => {
      const t = maxValue > 0 ? Math.max(0, Math.min(1, value / maxValue)) : 0
      const ratio = roseType === 'area' ? Math.sqrt(t) : t
      const p = progress == null ? 1 : Math.max(0, Math.min(1, progress))
      return innerR + (maxOuter - innerR) * ratio * p
    }

    const svg = document.createElementNS(NS, 'svg')
    svg.setAttribute('viewBox', layout === 'semi' ? `0 0 ${size} ${height}` : `0 0 ${size} ${size}`)
    svg.setAttribute('width', layout === 'semi' ? '100%' : String(size))
    svg.setAttribute('height', String(height))
    svg.setAttribute('class', 'shadcn-rose-svg')
    svg.setAttribute('role', 'img')

    const defs = document.createElementNS(NS, 'defs')
    const uid = 'rose-' + Math.random().toString(36).slice(2, 9)
    if (layout === 'semi') {
      const grad = document.createElementNS(NS, 'radialGradient')
      grad.setAttribute('id', uid + '-fill')
      grad.setAttribute('gradientUnits', 'userSpaceOnUse')
      grad.setAttribute('cx', String(cx))
      grad.setAttribute('cy', String(cy))
      grad.setAttribute('r', String(maxOuter))
      const colorEnd = resolveColor(el, opts.color || 'var(--chart-1)', themeFallback(el, 0))
      const colorStart = resolveColor(
        el,
        opts.colorStart || 'color-mix(in srgb, var(--chart-1) 32%, #ffffff)',
        colorEnd
      )
      const s0 = document.createElementNS(NS, 'stop')
      s0.setAttribute('offset', String(Math.max(0, innerR / Math.max(maxOuter, 1))))
      s0.setAttribute('stop-color', colorStart)
      const s1 = document.createElementNS(NS, 'stop')
      s1.setAttribute('offset', '1')
      s1.setAttribute('stop-color', colorEnd)
      grad.appendChild(s0)
      grad.appendChild(s1)
      defs.appendChild(grad)
      rows.forEach((row) => {
        row.fill = 'url(#' + uid + '-fill)'
        row.stroke = colorEnd
      })
    }
    svg.appendChild(defs)

    const gridStroke = cssColor(el, '--color-border-2', '#e5e6eb') || '#e5e6eb'
    const axisText = cssColor(el, '--color-text-3', '#86909c') || '#86909c'
    const gridLayer = document.createElementNS(NS, 'g')
    gridLayer.setAttribute('class', 'shadcn-rose-grid')
    const plot = document.createElementNS(NS, 'g')
    plot.setAttribute('class', 'shadcn-rose-plot')
    const labelLayer = document.createElementNS(NS, 'g')
    labelLayer.setAttribute('class', 'shadcn-rose-labels')
    const axisLayer = document.createElementNS(NS, 'g')
    axisLayer.setAttribute('class', 'shadcn-rose-axis')

    const gridValues = Array.isArray(opts.gridValues) && opts.gridValues.length
      ? opts.gridValues
      : (() => {
          const stepV = maxValue <= 200 ? 50 : maxValue <= 1000 ? 200 : 500
          const out = []
          for (let v = stepV; v < maxValue - stepV * 0.15; v += stepV) out.push(v)
          out.push(maxValue)
          return out
        })()

    if (showGrid && layout === 'semi') {
      const a0 = startAngle
      const a1 = endAngle
      const large = Math.abs(a1 - a0) > 180 ? 1 : 0
      const sweep = a1 - a0 < 0 ? 1 : 0
      gridValues.forEach((val) => {
        const r = radiusOf(val, 1)
        const s = polar(r, a0)
        const e = polar(r, a1)
        const arc = document.createElementNS(NS, 'path')
        arc.setAttribute('d', `M ${s.x},${s.y} A ${r},${r},0,${large},${sweep},${e.x},${e.y}`)
        arc.setAttribute('class', 'shadcn-rose-grid-arc')
        arc.setAttribute('fill', 'none')
        arc.setAttribute('stroke', gridStroke)
        arc.setAttribute('stroke-width', '1')
        arc.setAttribute('stroke-dasharray', '3 3')
        gridLayer.appendChild(arc)
      })
      for (let i = 0; i <= n; i += 1) {
        const a = startAngle + i * step
        const p0 = polar(innerR, a)
        const p1 = polar(maxOuter, a)
        const line = document.createElementNS(NS, 'line')
        line.setAttribute('x1', String(p0.x))
        line.setAttribute('y1', String(p0.y))
        line.setAttribute('x2', String(p1.x))
        line.setAttribute('y2', String(p1.y))
        line.setAttribute('stroke', gridStroke)
        line.setAttribute('stroke-width', '1')
        line.setAttribute('stroke-dasharray', '3 3')
        gridLayer.appendChild(line)
      }
    }

    if (showAxis && layout === 'semi') {
      const ticks = [0].concat(gridValues.filter((v) => v > 0))
      const uniq = []
      ticks.forEach((v) => {
        if (!uniq.some((x) => Math.abs(x - v) < 1e-6)) uniq.push(v)
      })
      const leftEdge = polar(maxOuter, 180)
      const rightEdge = polar(maxOuter, 0)
      const baseline = document.createElementNS(NS, 'line')
      baseline.setAttribute('x1', String(leftEdge.x))
      baseline.setAttribute('y1', String(cy))
      baseline.setAttribute('x2', String(rightEdge.x))
      baseline.setAttribute('y2', String(cy))
      baseline.setAttribute('stroke', gridStroke)
      baseline.setAttribute('stroke-width', '1')
      axisLayer.appendChild(baseline)
      uniq.forEach((val) => {
        const r = val <= 0 ? innerR : radiusOf(val, 1)
        ;[180, 0].forEach((ang) => {
          const p = polar(r, ang)
          const tick = document.createElementNS(NS, 'line')
          tick.setAttribute('x1', String(p.x))
          tick.setAttribute('y1', String(cy))
          tick.setAttribute('x2', String(p.x))
          tick.setAttribute('y2', String(cy + 4))
          tick.setAttribute('stroke', gridStroke)
          tick.setAttribute('stroke-width', '1')
          axisLayer.appendChild(tick)
          if (val === 0) return
          const text = document.createElementNS(NS, 'text')
          text.setAttribute('x', String(p.x))
          text.setAttribute('y', String(cy + 16))
          text.setAttribute('text-anchor', 'middle')
          text.setAttribute('class', 'shadcn-rose-axis-label')
          text.setAttribute('fill', axisText)
          text.textContent = String(Math.round(val))
          axisLayer.appendChild(text)
        })
      })
      const zero = document.createElementNS(NS, 'text')
      zero.setAttribute('x', String(cx))
      zero.setAttribute('y', String(cy + 16))
      zero.setAttribute('text-anchor', 'middle')
      zero.setAttribute('class', 'shadcn-rose-axis-label')
      zero.setAttribute('fill', axisText)
      zero.textContent = '0'
      axisLayer.appendChild(zero)
    }

    if (showLabels && layout === 'semi') {
      rows.forEach((row, i) => {
        const a0 = startAngle + i * step
        const a1 = a0 + step
        const mid = (a0 + a1) / 2
        const pos = polar(maxOuter + 10, mid)
        const text = document.createElementNS(NS, 'text')
        text.setAttribute('x', String(pos.x))
        text.setAttribute('y', String(pos.y))
        text.setAttribute('class', 'shadcn-rose-cat-label')
        text.setAttribute('fill', axisText)
        text.textContent = row.label
        let rot = -mid
        let anchor = 'start'
        if (mid > 90 && mid < 270) {
          rot = -mid + 180
          anchor = 'end'
        }
        text.setAttribute('text-anchor', anchor)
        text.setAttribute('dominant-baseline', 'middle')
        text.setAttribute('transform', `rotate(${rot} ${pos.x} ${pos.y})`)
        labelLayer.appendChild(text)
      })
    }

    /** @type {{index:number,path:SVGPathElement}[]} */
    let petals = []
    const paintPetals = (progress) => {
      const p = Math.max(0, Math.min(1, progress))
      while (plot.firstChild) plot.removeChild(plot.firstChild)
      petals = []
      rows.forEach((row, i) => {
        const sign = Math.sign(step || 1)
        const a0 = startAngle + i * step + (padAngle / 2) * sign
        const a1 = startAngle + (i + 1) * step - (padAngle / 2) * sign
        const outer = radiusOf(row.value, p)
        const d = sectorPath(innerR, Math.max(innerR + 0.5, outer), a0, a1)
        if (!d) return
        const path = document.createElementNS(NS, 'path')
        path.setAttribute('d', d)
        path.setAttribute('fill', layout === 'semi' ? row.fill : row.color)
        path.setAttribute('stroke', layout === 'semi' ? 'none' : cssColor(el, '--color-bg-2', '#fff') || '#fff')
        path.setAttribute('stroke-width', layout === 'semi' ? '0' : '1')
        path.setAttribute('class', 'shadcn-rose-sector')
        path.setAttribute('data-index', String(i))
        plot.appendChild(path)
        petals.push({ index: i, path })
      })
    }

    svg.appendChild(gridLayer)
    svg.appendChild(plot)
    svg.appendChild(labelLayer)
    svg.appendChild(axisLayer)
    el.appendChild(svg)

    let animFrame = 0
    const prefersReduced =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
    if (enter === 'fade') {
      paintPetals(1)
      void el.offsetWidth
      el.classList.add('is-rose-enter-fade')
    } else if (enter !== 'none' && !prefersReduced) {
      const duration = 820
      const t0 = performance.now()
      paintPetals(0)
      const tick = (now) => {
        const raw = Math.min(1, (now - t0) / duration)
        paintPetals(1 - Math.pow(1 - raw, 3))
        if (raw < 1) animFrame = requestAnimationFrame(tick)
        else paintPetals(1)
      }
      animFrame = requestAnimationFrame(tick)
    } else paintPetals(1)

    const tip = opts.tooltip === false ? null : createSvgChartTip('shadcn-rose-tooltip')
    const hideTip = () => {
      el.classList.remove('is-hovering')
      petals.forEach((item) => item.path.classList.remove('is-active'))
      if (tip) tip.hide()
    }
    const showTip = (idx, clientX, clientY) => {
      if (idx < 0 || idx >= rows.length) return hideTip()
      el.classList.add('is-hovering')
      petals.forEach((item) => item.path.classList.toggle('is-active', item.index === idx))
      if (!tip) return
      const row = rows[idx]
      tip.show(
        formatShadcnTooltip('', [{ label: row.label, value: row.value, display: formatValue(row.value, row), color: row.color }]),
        clientX,
        clientY
      )
    }
    const onMove = (e) => {
      const idx = Number(e.target && e.target.getAttribute && e.target.getAttribute('data-index'))
      Number.isFinite(idx) ? showTip(idx, e.clientX, e.clientY) : hideTip()
    }
    svg.addEventListener('mousemove', onMove)
    svg.addEventListener('mouseleave', hideTip)

    const instance = {
      chart: {
        type: 'rose-svg',
        dispose() {
          if (animFrame) cancelAnimationFrame(animFrame)
          svg.removeEventListener('mousemove', onMove)
          svg.removeEventListener('mouseleave', hideTip)
          if (tip) tip.dispose()
        },
      },
      el,
      legend: rows.map((r) => ({
        label: r.label,
        color: r.color,
        value: r.value,
        percentText: formatValue(r.value, r),
      })),
    }
    instance.__resizeCleanup = attachSvgResizeRemount(el, instance)
    return instance
  }

  /**
   * 仪表盘图（SVG 描边弧）：蹄形 / 半环进度 + 渐变描边
   * @param {HTMLElement} el
   * @param {object} options
   * @param {number} [options.value=75]
   * @param {number} [options.maxValue=100]
   * @param {number} [options.height=250]
   * @param {number} [options.size]
   * @param {number} [options.radius=96]
   * @param {number} [options.strokeWidth=18]
   * @param {number} [options.startAngle=225] - 度，0=三点钟；默认左下开口起
   * @param {number} [options.endAngle=-45] - 顺时针至右下，约 270° 蹄形
   * @param {number} [options.cyRatio=0.5] - 圆心纵向比例（半环可下移）
   * @param {'round'|'butt'} [options.linecap='round']
   * @param {string} [options.color='var(--chart-1)'] - 渐变终点（深）
   * @param {string} [options.colorStart] - 渐变起点（浅），默认混白
   * @param {string} [options.trackColor]
   * @param {string} [options.centralLabel]
   * @param {string} [options.centralSubLabel]
   * @param {string} [options.centralFooter] - 第三行（如评估时间）
   * @param {'main-sub'|'sub-main'} [options.labelOrder='sub-main']
   * @param {boolean} [options.showTicks=false] - 内侧圆点刻度
   * @param {number} [options.tickCount=28]
   * @param {boolean} [options.showNeedle=false] - 水滴指针
   * @param {string} [options.label] - tooltip 名称
   * @param {(value:number)=>string} [options.formatValue]
   * @param {'grow'|'none'} [options.enterAnimation='grow']
   */
  function mountGaugeChart(el, options) {
    if (!el) return null
    const opts = options || {}
    const height = opts.height || 250
    const size = opts.size || height
    const startAngle = opts.startAngle != null ? Number(opts.startAngle) : 225
    const endAngle = opts.endAngle != null ? Number(opts.endAngle) : -45
    const maxValue = opts.maxValue != null && opts.maxValue > 0 ? Number(opts.maxValue) : 100
    const rawValue = Number(opts.value)
    const value = Number.isFinite(rawValue) ? Math.max(0, Math.min(maxValue, rawValue)) : 0
    const t = value / maxValue
    const strokeWidth = opts.strokeWidth != null ? Number(opts.strokeWidth) : 18
    const radius =
      opts.radius != null ? Number(opts.radius) : Math.max(40, size / 2 - strokeWidth / 2 - 10)
    const cyRatio = opts.cyRatio != null ? Number(opts.cyRatio) : 0.5
    const linecap = opts.linecap === 'butt' ? 'butt' : 'round'
    const showTicks = !!opts.showTicks
    const showNeedle = !!opts.showNeedle
    const tickCount = Math.max(2, opts.tickCount != null ? Number(opts.tickCount) : 28)
    const tipLabel = opts.label != null ? String(opts.label) : opts.centralSubLabel || '完成度'
    const formatValue =
      typeof opts.formatValue === 'function'
        ? opts.formatValue
        : (v) => (Number.isInteger(v) ? String(v) : String(Math.round(v * 10) / 10)) + '%'
    const enter = opts.skipEnter ? 'none' : opts.enterAnimation || 'grow'
    const prefersReduced =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
    const labelOrder = opts.labelOrder === 'main-sub' ? 'main-sub' : 'sub-main'

    const colorEnd = resolveColor(el, opts.color || 'var(--chart-1)', themeFallback(el, 0))
    const colorStart = resolveColor(
      el,
      opts.colorStart || 'color-mix(in srgb, var(--chart-1) 42%, #ffffff)',
      colorEnd
    )
    const trackColor = resolveColor(
      el,
      opts.trackColor || 'color-mix(in srgb, var(--chart-1) 10%, var(--color-fill-2, #f2f3f5))',
      '#e8eef8'
    )
    const tickColor = resolveColor(
      el,
      opts.tickColor || 'color-mix(in srgb, var(--chart-1) 55%, #ffffff)',
      colorStart
    )
    const hubFill = resolveColor(el, opts.hubColor || 'var(--color-fill-2, #f2f3f5)', '#f2f3f5')

    el.classList.remove('shadcn-chart-host--gauge', 'is-gauge-enter', 'shadcn-chart-host--gauge-semi')
    void el.offsetWidth
    el.classList.add('shadcn-chart-host', 'shadcn-chart-host--gauge')
    if (Math.abs(endAngle - startAngle) <= 200) el.classList.add('shadcn-chart-host--gauge-semi')
    el.style.height = height + 'px'
    el.innerHTML = ''

    const cx = size / 2
    const cy = size * cyRatio
    const NS = 'http://www.w3.org/2000/svg'
    const DEG = Math.PI / 180
    const polar = (r, angleDeg) => {
      const rad = -angleDeg * DEG
      return { x: cx + Math.cos(rad) * r, y: cy + Math.sin(rad) * r }
    }
    const signOf = (v) => (v === 0 ? 0 : v > 0 ? 1 : -1)
    const deltaAngleOf = (a0, a1) => {
      const sign = signOf(a1 - a0)
      return sign * Math.min(Math.abs(a1 - a0), 359.999)
    }
    const arcPath = (r, a0, a1) => {
      const angle = deltaAngleOf(a0, a1)
      if (!angle) return ''
      const aEnd = a0 + angle
      const p0 = polar(r, a0)
      const p1 = polar(r, aEnd)
      const large = Math.abs(angle) > 180 ? 1 : 0
      const sweep = angle < 0 ? 1 : 0
      return `M ${p0.x},${p0.y} A ${r},${r},0,${large},${sweep},${p1.x},${p1.y}`
    }

    const span = deltaAngleOf(startAngle, endAngle)
    const progressEnd = startAngle + span * t
    const trackD = arcPath(radius, startAngle, endAngle)
    const progressD = t > 0 ? arcPath(radius, startAngle, progressEnd) : ''

    const svg = document.createElementNS(NS, 'svg')
    svg.setAttribute('viewBox', `0 0 ${size} ${size}`)
    svg.setAttribute('width', String(size))
    svg.setAttribute('height', String(size))
    svg.setAttribute('class', 'shadcn-gauge-svg')
    svg.setAttribute('role', 'img')
    svg.setAttribute('aria-label', tipLabel + ' ' + formatValue(value))

    const defs = document.createElementNS(NS, 'defs')
    const gradId = 'gauge-grad-' + Math.random().toString(36).slice(2, 9)
    const grad = document.createElementNS(NS, 'linearGradient')
    grad.setAttribute('id', gradId)
    grad.setAttribute('x1', '0%')
    grad.setAttribute('y1', '50%')
    grad.setAttribute('x2', '100%')
    grad.setAttribute('y2', '50%')
    const stop0 = document.createElementNS(NS, 'stop')
    stop0.setAttribute('offset', '0%')
    stop0.setAttribute('stop-color', colorStart)
    const stop1 = document.createElementNS(NS, 'stop')
    stop1.setAttribute('offset', '100%')
    stop1.setAttribute('stop-color', colorEnd)
    grad.appendChild(stop0)
    grad.appendChild(stop1)
    defs.appendChild(grad)
    svg.appendChild(defs)

    const track = document.createElementNS(NS, 'path')
    track.setAttribute('d', trackD)
    track.setAttribute('fill', 'none')
    track.setAttribute('stroke', trackColor)
    track.setAttribute('stroke-width', String(strokeWidth))
    track.setAttribute('stroke-linecap', linecap)
    track.setAttribute('class', 'shadcn-gauge-track')
    svg.appendChild(track)

    if (showTicks) {
      const tickR = Math.max(12, radius - strokeWidth / 2 - 10)
      const ticks = document.createElementNS(NS, 'g')
      ticks.setAttribute('class', 'shadcn-gauge-ticks')
      for (let i = 0; i < tickCount; i += 1) {
        const a = startAngle + (span * i) / (tickCount - 1)
        const p = polar(tickR, a)
        const c = document.createElementNS(NS, 'circle')
        c.setAttribute('cx', String(p.x))
        c.setAttribute('cy', String(p.y))
        c.setAttribute('r', '2.2')
        c.setAttribute('fill', tickColor)
        c.setAttribute('class', 'shadcn-gauge-tick')
        ticks.appendChild(c)
      }
      svg.appendChild(ticks)
    }

    let progress = null
    if (progressD) {
      progress = document.createElementNS(NS, 'path')
      progress.setAttribute('d', progressD)
      progress.setAttribute('fill', 'none')
      progress.setAttribute('stroke', `url(#${gradId})`)
      progress.setAttribute('stroke-width', String(strokeWidth))
      progress.setAttribute('stroke-linecap', linecap)
      progress.setAttribute('class', 'shadcn-gauge-progress')
      svg.appendChild(progress)
    }

    let needle = null
    const needleStartRot = 90 - startAngle
    const needleEndRot = 90 - progressEnd
    const setNeedleRot = (rot) => {
      if (!needle) return
      needle.setAttribute('transform', `translate(${cx},${cy}) rotate(${rot})`)
    }
    if (showNeedle) {
      const needleLen = Math.max(28, radius - strokeWidth / 2 - 18)
      needle = document.createElementNS(NS, 'g')
      needle.setAttribute('class', 'shadcn-gauge-needle')
      setNeedleRot(enter !== 'none' && !prefersReduced ? needleStartRot : needleEndRot)
      const blade = document.createElementNS(NS, 'path')
      // 默认朝上（12 点），再按进度角旋转；整体比初版更细更短
      blade.setAttribute(
        'd',
        `M 0,${-needleLen} C 3.2,${-needleLen * 0.55} 4.2,-8 4.2,2 A 4.2,4.2 0 1 1 -4.2,2 C -4.2,-8 -3.2,${-needleLen * 0.55} 0,${-needleLen} Z`
      )
      blade.setAttribute('fill', colorEnd)
      blade.setAttribute('class', 'shadcn-gauge-needle-blade')
      needle.appendChild(blade)
      const hubOuter = document.createElementNS(NS, 'circle')
      hubOuter.setAttribute('cx', '0')
      hubOuter.setAttribute('cy', '0')
      hubOuter.setAttribute('r', '6')
      hubOuter.setAttribute('fill', colorEnd)
      hubOuter.setAttribute('class', 'shadcn-gauge-needle-hub')
      needle.appendChild(hubOuter)
      const hubInner = document.createElementNS(NS, 'circle')
      hubInner.setAttribute('cx', '0')
      hubInner.setAttribute('cy', '0')
      hubInner.setAttribute('r', '3')
      hubInner.setAttribute('fill', hubFill)
      hubInner.setAttribute('class', 'shadcn-gauge-needle-hub-inner')
      needle.appendChild(hubInner)
      svg.appendChild(needle)
    }

    const centralLabel = opts.centralLabel != null ? String(opts.centralLabel) : formatValue(value)
    const centralSub = opts.centralSubLabel != null ? String(opts.centralSubLabel) : ''
    const centralFooter = opts.centralFooter != null ? String(opts.centralFooter) : ''
    const hasFooter = !!centralFooter
    const mainEl = document.createElementNS(NS, 'text')
    mainEl.setAttribute('x', String(cx))
    mainEl.setAttribute('text-anchor', 'middle')
    mainEl.setAttribute('dominant-baseline', 'middle')
    mainEl.setAttribute('class', 'shadcn-gauge-central-label')
    mainEl.textContent = centralLabel
    const subEl = centralSub ? document.createElementNS(NS, 'text') : null
    if (subEl) {
      subEl.setAttribute('x', String(cx))
      subEl.setAttribute('text-anchor', 'middle')
      subEl.setAttribute('dominant-baseline', 'middle')
      subEl.setAttribute('class', 'shadcn-gauge-central-sub')
      subEl.textContent = centralSub
    }
    const footerEl = hasFooter ? document.createElementNS(NS, 'text') : null
    if (footerEl) {
      footerEl.setAttribute('x', String(cx))
      footerEl.setAttribute('text-anchor', 'middle')
      footerEl.setAttribute('dominant-baseline', 'middle')
      footerEl.setAttribute('class', 'shadcn-gauge-central-footer')
      footerEl.textContent = centralFooter
    }

    // 半环文案略下移，蹄形 / 指针图保持中部
    const labelCy = showNeedle ? cy + 38 : hasFooter ? cy + 6 : cy
    if (labelOrder === 'sub-main' && subEl) {
      if (hasFooter) {
        subEl.setAttribute('y', String(labelCy - 24))
        mainEl.setAttribute('y', String(labelCy))
        footerEl.setAttribute('y', String(labelCy + 22))
        svg.appendChild(subEl)
        svg.appendChild(mainEl)
        svg.appendChild(footerEl)
      } else {
        subEl.setAttribute('y', String(labelCy - 16))
        mainEl.setAttribute('y', String(labelCy + 14))
        svg.appendChild(subEl)
        svg.appendChild(mainEl)
      }
    } else {
      mainEl.setAttribute('y', String(labelCy + (subEl ? -8 : 0)))
      svg.appendChild(mainEl)
      if (subEl) {
        subEl.setAttribute('y', String(labelCy + 16))
        svg.appendChild(subEl)
      }
      if (footerEl) {
        footerEl.setAttribute('y', String(labelCy + 34))
        svg.appendChild(footerEl)
      }
    }

    el.appendChild(svg)

    let animFrame = 0
    let enterObserver = null
    const shouldEnter = (progress || needle) && enter !== 'none' && !prefersReduced
    if (shouldEnter) {
      const len = progress && progress.getTotalLength ? progress.getTotalLength() : 0
      if (progress && len) {
        progress.style.strokeDasharray = String(len)
        progress.style.strokeDashoffset = String(len)
      }
      setNeedleRot(needleStartRot)
      const playEnter = () => {
        el.classList.add('is-gauge-enter')
        const duration = 900
        const t0 = performance.now()
        const tick = (now) => {
          const raw = Math.min(1, (now - t0) / duration)
          const eased = 1 - Math.pow(1 - raw, 3)
          if (progress && len) progress.style.strokeDashoffset = String(len * (1 - eased))
          setNeedleRot(needleStartRot + (needleEndRot - needleStartRot) * eased)
          if (raw < 1) animFrame = requestAnimationFrame(tick)
          else {
            if (progress) progress.style.strokeDashoffset = '0'
            setNeedleRot(needleEndRot)
          }
        }
        animFrame = requestAnimationFrame(tick)
      }
      if (typeof IntersectionObserver === 'function') {
        enterObserver = new IntersectionObserver(
          (entries) => {
            const hit = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.15)
            if (!hit) return
            if (enterObserver) {
              enterObserver.disconnect()
              enterObserver = null
            }
            playEnter()
          },
          { threshold: [0, 0.15, 0.35] }
        )
        enterObserver.observe(el)
      } else {
        playEnter()
      }
    }

    const tipEl = document.createElement('div')
    tipEl.className = 'shadcn-chart-tooltip-root shadcn-gauge-tooltip'
    tipEl.setAttribute('aria-hidden', 'true')
    document.body.appendChild(tipEl)
    const hideTip = () => {
      tipEl.classList.remove('is-open')
      tipEl.setAttribute('aria-hidden', 'true')
    }
    const placeTip = (clientX, clientY) => {
      const pad = 16
      const tipW = tipEl.offsetWidth || 148
      const tipH = tipEl.offsetHeight || 44
      let left = clientX + pad
      let top = clientY - tipH / 2
      const vw = window.innerWidth || document.documentElement.clientWidth
      const vh = window.innerHeight || document.documentElement.clientHeight
      if (left + tipW > vw - 8) left = clientX - tipW - pad
      if (top + tipH > vh - 8) top = vh - tipH - 8
      if (left < 8) left = 8
      if (top < 8) top = 8
      tipEl.style.left = left + 'px'
      tipEl.style.top = top + 'px'
    }
    const showTip = (clientX, clientY) => {
      tipEl.innerHTML = formatShadcnTooltip('', [
        { label: tipLabel, value: value, display: formatValue(value), color: colorEnd },
      ])
      tipEl.classList.add('is-open')
      tipEl.setAttribute('aria-hidden', 'false')
      placeTip(clientX, clientY)
    }
    const onMove = (e) => {
      showTip(e.clientX, e.clientY)
    }
    const onLeave = () => hideTip()
    svg.addEventListener('mousemove', onMove)
    svg.addEventListener('mouseleave', onLeave)

    const instance = {
      chart: {
        type: 'gauge-svg',
        dispose() {
          if (animFrame) cancelAnimationFrame(animFrame)
          if (enterObserver) {
            enterObserver.disconnect()
            enterObserver = null
          }
          svg.removeEventListener('mousemove', onMove)
          svg.removeEventListener('mouseleave', onLeave)
          hideTip()
          if (tipEl.parentNode) tipEl.parentNode.removeChild(tipEl)
        },
      },
      el,
      legend: [{ label: tipLabel, color: colorEnd, value }],
    }
    instance.__resizeCleanup = attachSvgResizeRemount(el, instance)
    return instance
  }

  /**
   * 水球图（SVG）：圆形裁切 + 波浪液面 + 中心百分比
   * 轻微径向渐变与高光，增加球体感（不做玻璃拟态）
   * @param {HTMLElement} el
   * @param {object} options
   * @param {number} [options.value=62]
   * @param {number} [options.maxValue=100]
   * @param {number} [options.height=250]
   * @param {number} [options.size]
   * @param {number} [options.radius=92]
   * @param {string} [options.color='var(--chart-1)']
   * @param {string} [options.colorSoft] - 上层浅浪
   * @param {string} [options.trackColor]
   * @param {string} [options.centralLabel]
   * @param {string} [options.centralSubLabel]
   * @param {string} [options.label]
   * @param {(value:number)=>string} [options.formatValue]
   * @param {boolean} [options.wave=true]
   * @param {'grow'|'none'} [options.enterAnimation='grow']
   */
  function mountLiquidFillChart(el, options) {
    if (!el) return null
    const opts = options || {}
    const height = opts.height || 250
    const size = opts.size || height
    const maxValue = opts.maxValue != null && opts.maxValue > 0 ? Number(opts.maxValue) : 100
    const rawValue = Number(opts.value)
    const value = Number.isFinite(rawValue) ? Math.max(0, Math.min(maxValue, rawValue)) : 0
    const tTarget = value / maxValue
    const radius = opts.radius != null ? Number(opts.radius) : Math.max(48, size / 2 - 18)
    const waveEnabled = opts.wave !== false
    const tipLabel = opts.label != null ? String(opts.label) : opts.centralSubLabel || '指标'
    const formatValue =
      typeof opts.formatValue === 'function'
        ? opts.formatValue
        : (v) => (Number.isInteger(v) ? String(v) : String(Math.round(v * 10) / 10)) + '%'
    const enter = opts.skipEnter ? 'none' : opts.enterAnimation || 'grow'

    const color = resolveColor(el, opts.color || 'var(--chart-1)', themeFallback(el, 0))
    const colorSoft = resolveColor(
      el,
      opts.colorSoft || 'color-mix(in srgb, var(--chart-1) 55%, #ffffff)',
      color
    )
    const trackColor = resolveColor(
      el,
      opts.trackColor || 'color-mix(in srgb, var(--chart-1) 12%, var(--color-fill-2, #f2f3f5))',
      '#e8eef8'
    )
    const ringColor = resolveColor(
      el,
      opts.ringColor || 'color-mix(in srgb, var(--chart-1) 28%, transparent)',
      'rgba(22, 93, 255, 0.28)'
    )

    el.classList.remove('shadcn-chart-host--liquid', 'is-liquid-enter')
    void el.offsetWidth
    el.classList.add('shadcn-chart-host', 'shadcn-chart-host--liquid')
    el.style.height = height + 'px'
    el.innerHTML = ''

    const cx = size / 2
    const cy = size / 2
    const NS = 'http://www.w3.org/2000/svg'
    const clipId = 'liquid-clip-' + Math.random().toString(36).slice(2, 9)

    const svg = document.createElementNS(NS, 'svg')
    svg.setAttribute('viewBox', `0 0 ${size} ${size}`)
    svg.setAttribute('width', String(size))
    svg.setAttribute('height', String(size))
    svg.setAttribute('class', 'shadcn-liquid-svg')
    svg.setAttribute('role', 'img')
    svg.setAttribute('aria-label', tipLabel + ' ' + formatValue(value))

    const defs = document.createElementNS(NS, 'defs')
    const clip = document.createElementNS(NS, 'clipPath')
    clip.setAttribute('id', clipId)
    const clipCircle = document.createElementNS(NS, 'circle')
    clipCircle.setAttribute('cx', String(cx))
    clipCircle.setAttribute('cy', String(cy))
    clipCircle.setAttribute('r', String(radius))
    clip.appendChild(clipCircle)
    defs.appendChild(clip)

    const addStop = (grad, offset, stopColor, opacity) => {
      const stop = document.createElementNS(NS, 'stop')
      stop.setAttribute('offset', offset)
      stop.setAttribute('stop-color', stopColor)
      if (opacity != null) stop.setAttribute('stop-opacity', String(opacity))
      grad.appendChild(stop)
    }

    const bowlId = clipId + '-bowl'
    const bowlGrad = document.createElementNS(NS, 'radialGradient')
    bowlGrad.setAttribute('id', bowlId)
    bowlGrad.setAttribute('cx', '36%')
    bowlGrad.setAttribute('cy', '30%')
    bowlGrad.setAttribute('r', '78%')
    addStop(bowlGrad, '0%', '#ffffff', 0.28)
    addStop(bowlGrad, '42%', trackColor, 1)
    addStop(bowlGrad, '100%', color, 0.18)
    defs.appendChild(bowlGrad)

    const fillId = clipId + '-fill'
    const fillGrad = document.createElementNS(NS, 'radialGradient')
    fillGrad.setAttribute('id', fillId)
    fillGrad.setAttribute('cx', '38%')
    fillGrad.setAttribute('cy', '28%')
    fillGrad.setAttribute('r', '76%')
    addStop(fillGrad, '0%', colorSoft, 1)
    addStop(fillGrad, '55%', color, 1)
    addStop(fillGrad, '100%', color, 1)
    defs.appendChild(fillGrad)

    const shineId = clipId + '-shine'
    const shineGrad = document.createElementNS(NS, 'radialGradient')
    shineGrad.setAttribute('id', shineId)
    shineGrad.setAttribute('cx', '50%')
    shineGrad.setAttribute('cy', '50%')
    shineGrad.setAttribute('r', '50%')
    addStop(shineGrad, '0%', '#ffffff', 0.22)
    addStop(shineGrad, '55%', '#ffffff', 0.08)
    addStop(shineGrad, '100%', '#ffffff', 0)
    defs.appendChild(shineGrad)
    svg.appendChild(defs)

    const bg = document.createElementNS(NS, 'circle')
    bg.setAttribute('cx', String(cx))
    bg.setAttribute('cy', String(cy))
    bg.setAttribute('r', String(radius))
    bg.setAttribute('fill', `url(#${bowlId})`)
    bg.setAttribute('class', 'shadcn-liquid-bg')
    svg.appendChild(bg)

    const waveGroup = document.createElementNS(NS, 'g')
    waveGroup.setAttribute('clip-path', `url(#${clipId})`)
    waveGroup.setAttribute('class', 'shadcn-liquid-wave-group')
    const waveBack = document.createElementNS(NS, 'path')
    waveBack.setAttribute('fill', colorSoft)
    waveBack.setAttribute('fill-opacity', '0.5')
    waveBack.setAttribute('class', 'shadcn-liquid-wave shadcn-liquid-wave--back')
    const waveFront = document.createElementNS(NS, 'path')
    waveFront.setAttribute('fill', `url(#${fillId})`)
    waveFront.setAttribute('fill-opacity', '0.96')
    waveFront.setAttribute('class', 'shadcn-liquid-wave shadcn-liquid-wave--front')
    waveGroup.appendChild(waveBack)
    waveGroup.appendChild(waveFront)
    svg.appendChild(waveGroup)

    const highlight = document.createElementNS(NS, 'circle')
    highlight.setAttribute('cx', String(cx - radius * 0.34))
    highlight.setAttribute('cy', String(cy - radius * 0.48))
    highlight.setAttribute('r', String(radius * 0.28))
    highlight.setAttribute('fill', `url(#${shineId})`)
    highlight.setAttribute('clip-path', `url(#${clipId})`)
    highlight.setAttribute('pointer-events', 'none')
    highlight.setAttribute('class', 'shadcn-liquid-highlight')
    svg.appendChild(highlight)

    const innerRim = document.createElementNS(NS, 'circle')
    innerRim.setAttribute('cx', String(cx))
    innerRim.setAttribute('cy', String(cy))
    innerRim.setAttribute('r', String(Math.max(4, radius - 1.25)))
    innerRim.setAttribute('fill', 'none')
    innerRim.setAttribute('stroke', 'rgba(255, 255, 255, 0.22)')
    innerRim.setAttribute('stroke-width', '1')
    innerRim.setAttribute('pointer-events', 'none')
    innerRim.setAttribute('class', 'shadcn-liquid-inner-rim')
    svg.appendChild(innerRim)

    const ring = document.createElementNS(NS, 'circle')
    ring.setAttribute('cx', String(cx))
    ring.setAttribute('cy', String(cy))
    ring.setAttribute('r', String(radius))
    ring.setAttribute('fill', 'none')
    ring.setAttribute('stroke', ringColor)
    ring.setAttribute('stroke-width', '2.5')
    ring.setAttribute('class', 'shadcn-liquid-ring')
    svg.appendChild(ring)

    const centralLabel = opts.centralLabel != null ? String(opts.centralLabel) : formatValue(value)
    const centralSub = opts.centralSubLabel != null ? String(opts.centralSubLabel) : ''
    // 液面盖住中心时用白字，否则用正文色，保证对比度
    const labelOnLiquid = tTarget >= 0.42
    const labelFill = labelOnLiquid
      ? '#ffffff'
      : resolveColor(el, 'var(--color-text-1, #1d2129)', '#1d2129')
    const subFill = labelOnLiquid
      ? 'rgba(255, 255, 255, 0.92)'
      : resolveColor(el, 'var(--color-text-2, #4e5969)', '#4e5969')
    const mainEl = document.createElementNS(NS, 'text')
    mainEl.setAttribute('x', String(cx))
    mainEl.setAttribute('y', String(cy + (centralSub ? -6 : 0)))
    mainEl.setAttribute('text-anchor', 'middle')
    mainEl.setAttribute('dominant-baseline', 'middle')
    mainEl.setAttribute('class', 'shadcn-liquid-central-label')
    mainEl.setAttribute('fill', labelFill)
    mainEl.textContent = centralLabel
    svg.appendChild(mainEl)
    if (centralSub) {
      const subEl = document.createElementNS(NS, 'text')
      subEl.setAttribute('x', String(cx))
      subEl.setAttribute('y', String(cy + 18))
      subEl.setAttribute('text-anchor', 'middle')
      subEl.setAttribute('dominant-baseline', 'middle')
      subEl.setAttribute('class', 'shadcn-liquid-central-sub')
      subEl.setAttribute('fill', subFill)
      subEl.textContent = centralSub
      svg.appendChild(subEl)
    }

    el.appendChild(svg)

    const buildWave = (fillT, phase, amp, wavelength, yOffset) => {
      const surfaceY = cy + radius * (1 - 2 * fillT) + (yOffset || 0)
      const left = cx - radius - 4
      const right = cx + radius + 4
      const bottom = cy + radius + 4
      const steps = 28
      let d = `M ${left},${bottom} L ${left},${surfaceY}`
      for (let i = 0; i <= steps; i += 1) {
        const x = left + ((right - left) * i) / steps
        const y =
          surfaceY +
          (waveEnabled ? amp * Math.sin(((x - left) / wavelength) * Math.PI * 2 + phase) : 0)
        d += ` L ${x},${y}`
      }
      d += ` L ${right},${bottom} Z`
      return d
    }

    let fillT = enter === 'none' ? tTarget : 0
    let phase = 0
    let animFrame = 0
    let running = true
    const prefersReduced =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

    const paintWaves = () => {
      waveBack.setAttribute('d', buildWave(fillT, phase + 1.2, 5, radius * 1.15, -2))
      waveFront.setAttribute('d', buildWave(fillT, phase, 7, radius * 0.95, 0))
    }
    paintWaves()

    const tick = () => {
      if (!running) return
      if (!prefersReduced && waveEnabled) {
        phase += 0.045
        if (fillT < tTarget) {
          fillT = Math.min(tTarget, fillT + Math.max(0.008, (tTarget - fillT) * 0.08))
        }
        paintWaves()
        animFrame = requestAnimationFrame(tick)
      } else if (fillT < tTarget && enter !== 'none') {
        fillT = Math.min(tTarget, fillT + 0.04)
        paintWaves()
        animFrame = requestAnimationFrame(tick)
      } else {
        fillT = tTarget
        paintWaves()
      }
    }
    if (!prefersReduced || enter !== 'none') {
      el.classList.add('is-liquid-enter')
      animFrame = requestAnimationFrame(tick)
    }

    const tipEl = document.createElement('div')
    tipEl.className = 'shadcn-chart-tooltip-root shadcn-gauge-tooltip'
    tipEl.setAttribute('aria-hidden', 'true')
    document.body.appendChild(tipEl)
    const hideTip = () => {
      tipEl.classList.remove('is-open')
      tipEl.setAttribute('aria-hidden', 'true')
    }
    const placeTip = (clientX, clientY) => {
      const pad = 16
      const tipW = tipEl.offsetWidth || 148
      const tipH = tipEl.offsetHeight || 44
      let left = clientX + pad
      let top = clientY - tipH / 2
      const vw = window.innerWidth || document.documentElement.clientWidth
      const vh = window.innerHeight || document.documentElement.clientHeight
      if (left + tipW > vw - 8) left = clientX - tipW - pad
      if (top + tipH > vh - 8) top = vh - tipH - 8
      if (left < 8) left = 8
      if (top < 8) top = 8
      tipEl.style.left = left + 'px'
      tipEl.style.top = top + 'px'
    }
    const showTip = (clientX, clientY) => {
      tipEl.innerHTML = formatShadcnTooltip('', [
        { label: tipLabel, value: value, display: formatValue(value), color: color },
      ])
      tipEl.classList.add('is-open')
      tipEl.setAttribute('aria-hidden', 'false')
      placeTip(clientX, clientY)
    }
    const onMove = (e) => showTip(e.clientX, e.clientY)
    const onLeave = () => hideTip()
    svg.addEventListener('mousemove', onMove)
    svg.addEventListener('mouseleave', onLeave)

    const instance = {
      chart: {
        type: 'liquid-svg',
        dispose() {
          running = false
          if (animFrame) cancelAnimationFrame(animFrame)
          svg.removeEventListener('mousemove', onMove)
          svg.removeEventListener('mouseleave', onLeave)
          hideTip()
          if (tipEl.parentNode) tipEl.parentNode.removeChild(tipEl)
        },
      },
      el,
      legend: [{ label: tipLabel, color: color, value }],
    }
    instance.__resizeCleanup = attachSvgResizeRemount(el, instance)
    return instance
  }

  /**
   * K 线 / 蜡烛图（SVG）
   * data: [{ open, high, low, close, label?, tooltipLabel? }]
   * 涨跌色默认按 A 股习惯：红涨绿跌；可传 upColor / downColor 覆盖。
   */
  function mountCandlestickChart(el, options) {
    if (!el) return null
    const opts = options || {}
    const raw = Array.isArray(opts.data) ? opts.data : []
    const height = opts.height || 280
    const showXAxis = opts.showXAxis !== false
    const showYAxis = opts.showYAxis !== false
    const margin = Object.assign(
      {
        top: 12,
        right: 12,
        bottom: showXAxis ? 28 : 12,
        left: showYAxis ? 44 : 12,
      },
      opts.margin || {}
    )
    const upColor = resolveColor(
      el,
      opts.upColor || 'rgb(var(--danger-6))',
      '#f53f3f'
    )
    const downColor = resolveColor(
      el,
      opts.downColor || 'rgb(var(--success-6))',
      '#00b42a'
    )
    const bodyRadius = opts.bodyRadius != null ? opts.bodyRadius : 2
    const gridCount = opts.gridCount != null ? opts.gridCount : 4
    const showTooltip = opts.tooltip !== false
    const yTickFormat =
      typeof opts.yTickFormat === 'function' ? opts.yTickFormat : (v) => String(Math.round(v * 10) / 10)
    const xTickCount = opts.xTickCount != null ? opts.xTickCount : 5

    el.classList.add('shadcn-chart-host', 'shadcn-chart-host--candlestick')
    el.style.height = height + 'px'
    el.style.minHeight = height + 'px'
    el.innerHTML = ''

    if (!raw.length) {
      return { chart: null, el, legend: [] }
    }

    const width = Math.max(160, el.clientWidth || 640)
    // 按可视宽度抽稀，压缩后仍保持可辨实体宽度
    const maxCandles = Math.max(40, Math.min(raw.length, Math.floor(width / 7)))
    const sampled = downsampleRows(raw, maxCandles)
    const data = sampled.map((d, i) => {
      const open = Number(d.open)
      const high = Number(d.high)
      const low = Number(d.low)
      const close = Number(d.close)
      return {
        i,
        open,
        high,
        low,
        close,
        up: close >= open,
        label: d.label != null ? String(d.label) : String(i + 1),
        tooltipLabel:
          typeof opts.tooltipLabel === 'function'
            ? opts.tooltipLabel(d, i)
            : d.tooltipLabel || d.label || `第 ${i + 1} 根`,
      }
    })

    let yMin = Infinity
    let yMax = -Infinity
    data.forEach((d) => {
      yMin = Math.min(yMin, d.low, d.open, d.close)
      yMax = Math.max(yMax, d.high, d.open, d.close)
    })
    if (!(yMax > yMin)) {
      yMin = 0
      yMax = 1
    }
    const pad = (yMax - yMin) * 0.06
    yMin -= pad
    yMax += pad

    const plotW = Math.max(40, width - margin.left - margin.right)
    const plotH = Math.max(40, height - margin.top - margin.bottom)
    const n = data.length
    const slot = plotW / n
    const bodyW = Math.max(2.5, Math.min(12, slot * 0.62))
    const yScale = (v) => margin.top + ((yMax - v) / (yMax - yMin)) * plotH

    const svgNS = 'http://www.w3.org/2000/svg'
    const svg = document.createElementNS(svgNS, 'svg')
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
    svg.setAttribute('width', '100%')
    svg.setAttribute('height', String(height))
    svg.setAttribute('class', 'shadcn-candlestick-svg')
    svg.setAttribute('role', 'img')

    const yTicks = []
    for (let g = 0; g <= gridCount; g += 1) {
      const t = g / gridCount
      yTicks.push(yMax - (yMax - yMin) * t)
    }

    yTicks.forEach((val) => {
      const y = yScale(val)
      const line = document.createElementNS(svgNS, 'line')
      line.setAttribute('x1', String(margin.left))
      line.setAttribute('x2', String(margin.left + plotW))
      line.setAttribute('y1', String(y))
      line.setAttribute('y2', String(y))
      line.setAttribute('vector-effect', 'non-scaling-stroke')
      // 颜色由 CSS --vis-axis-grid-color 控制，与 Unovis 轴网格一致
      line.setAttribute('class', 'shadcn-candlestick-grid')
      svg.appendChild(line)

      if (showYAxis) {
        const text = document.createElementNS(svgNS, 'text')
        text.setAttribute('x', String(margin.left - 8))
        text.setAttribute('y', String(y))
        text.setAttribute('text-anchor', 'end')
        text.setAttribute('dominant-baseline', 'middle')
        text.setAttribute('class', 'shadcn-candlestick-y-tick')
        text.textContent = yTickFormat(val)
        svg.appendChild(text)
      }
    })

    if (showXAxis && n > 0) {
      const tickIdx = []
      const count = Math.max(2, Math.min(xTickCount, n))
      for (let t = 0; t < count; t += 1) {
        const idx = count === 1 ? 0 : Math.round((t / (count - 1)) * (n - 1))
        if (!tickIdx.includes(idx)) tickIdx.push(idx)
      }
      tickIdx.forEach((idx) => {
        const row = data[idx]
        const cx = margin.left + slot * (row.i + 0.5)
        const text = document.createElementNS(svgNS, 'text')
        text.setAttribute('x', String(cx))
        text.setAttribute('y', String(height - Math.max(8, margin.bottom - 12)))
        text.setAttribute('text-anchor', 'middle')
        text.setAttribute('dominant-baseline', 'hanging')
        text.setAttribute('class', 'shadcn-candlestick-x-tick')
        text.textContent = row.label
        svg.appendChild(text)
      })
    }

    const tipEl = showTooltip ? document.createElement('div') : null
    if (tipEl) {
      tipEl.className = 'shadcn-chart-tooltip-root shadcn-candlestick-tooltip'
      tipEl.setAttribute('aria-hidden', 'true')
      document.body.appendChild(tipEl)
    }
    const enterNodes = []
    const hideTip = () => {
      if (!tipEl) return
      tipEl.classList.remove('is-open')
      tipEl.setAttribute('aria-hidden', 'true')
    }
    const showTip = (row, clientX, clientY) => {
      if (!tipEl) return
      const color = row.up ? upColor : downColor
      const side = row.up ? '收涨' : '收跌'
      const sideClass = row.up ? 'is-up' : 'is-down'
      const fmt = (v) => {
        const n = Number(v)
        return Number.isFinite(n) ? n.toFixed(2) : String(v)
      }
      tipEl.innerHTML = `
        <div class="shadcn-chart-tooltip-title">
          <span>${row.tooltipLabel}</span>
          <span class="cce-candle-tip-side ${sideClass}">${side}</span>
        </div>
        <div class="shadcn-chart-tooltip-rows">
          <div class="shadcn-chart-tooltip-row">
            <span class="shadcn-chart-tooltip-left">
              <span class="shadcn-chart-tooltip-dot" style="--legend-color:${color}"></span>
              <span>开</span>
            </span>
            <span class="shadcn-chart-tooltip-value">${fmt(row.open)}</span>
          </div>
          <div class="shadcn-chart-tooltip-row">
            <span class="shadcn-chart-tooltip-left">
              <span class="shadcn-chart-tooltip-dot" style="--legend-color:${color}"></span>
              <span>高</span>
            </span>
            <span class="shadcn-chart-tooltip-value">${fmt(row.high)}</span>
          </div>
          <div class="shadcn-chart-tooltip-row">
            <span class="shadcn-chart-tooltip-left">
              <span class="shadcn-chart-tooltip-dot" style="--legend-color:${color}"></span>
              <span>低</span>
            </span>
            <span class="shadcn-chart-tooltip-value">${fmt(row.low)}</span>
          </div>
          <div class="shadcn-chart-tooltip-row">
            <span class="shadcn-chart-tooltip-left">
              <span class="shadcn-chart-tooltip-dot" style="--legend-color:${color}"></span>
              <span>收</span>
            </span>
            <span class="shadcn-chart-tooltip-value">${fmt(row.close)}</span>
          </div>
        </div>`
      tipEl.classList.add('is-open')
      tipEl.setAttribute('aria-hidden', 'false')
      const tipPad = 12
      const tw = tipEl.offsetWidth || 168
      const th = tipEl.offsetHeight || 120
      let left = clientX + tipPad
      let top = clientY - th / 2
      if (left + tw > window.innerWidth - 8) left = clientX - tw - tipPad
      if (top < 8) top = 8
      if (top + th > window.innerHeight - 8) top = window.innerHeight - th - 8
      tipEl.style.left = `${left}px`
      tipEl.style.top = `${top}px`
    }

    data.forEach((row) => {
      const cx = margin.left + slot * (row.i + 0.5)
      const color = row.up ? upColor : downColor
      const yHigh = yScale(row.high)
      const yLow = yScale(row.low)
      const yOpen = yScale(row.open)
      const yClose = yScale(row.close)
      const bodyTop = Math.min(yOpen, yClose)
      const bodyH = Math.max(2, Math.abs(yClose - yOpen))

      const wick = document.createElementNS(svgNS, 'line')
      wick.setAttribute('x1', String(cx))
      wick.setAttribute('x2', String(cx))
      wick.setAttribute('y1', String(yHigh))
      wick.setAttribute('y2', String(yLow))
      wick.setAttribute('stroke', color)
      wick.setAttribute('stroke-width', '1.25')
      wick.setAttribute('stroke-linecap', 'round')
      wick.setAttribute('vector-effect', 'non-scaling-stroke')
      wick.setAttribute('class', 'shadcn-candlestick-wick')
      svg.appendChild(wick)

      const body = document.createElementNS(svgNS, 'rect')
      body.setAttribute('x', String(cx - bodyW / 2))
      body.setAttribute('y', String(bodyTop))
      body.setAttribute('width', String(bodyW))
      body.setAttribute('height', String(bodyH))
      body.setAttribute('rx', String(bodyRadius))
      body.setAttribute('ry', String(bodyRadius))
      body.setAttribute('fill', color)
      body.setAttribute('class', 'shadcn-candlestick-body')
      body.style.cursor = 'pointer'
      body.addEventListener('pointermove', (e) => showTip(row, e.clientX, e.clientY))
      body.addEventListener('pointerleave', hideTip)
      wick.addEventListener('pointermove', (e) => showTip(row, e.clientX, e.clientY))
      wick.addEventListener('pointerleave', hideTip)
      svg.appendChild(body)
      enterNodes.push(wick, body)
    })

    el.appendChild(svg)
    armSvgChartEnter(el, enterNodes, { maxDelay: 0.42, skipEnter: !!opts.skipEnter })

    const instance = {
      chart: {
        type: 'candlestick-svg',
        dispose() {
          hideTip()
          if (tipEl && tipEl.parentNode) tipEl.parentNode.removeChild(tipEl)
        },
      },
      el,
      legend: [
        { label: '收涨', color: upColor },
        { label: '收跌', color: downColor },
      ],
    }
    instance.__resizeCleanup = attachSvgResizeRemount(el, instance)
    return instance
  }

  /** 容器尺寸变化后按新宽度重绘 SVG 图（压缩还原不再错位） */
  function attachSvgResizeRemount(el, instance) {
    if (!el || !instance || typeof ResizeObserver === 'undefined') return () => {}
    let lastW = Math.round(el.clientWidth || 0)
    let timer = null
    let dead = false
    const findEntry = () => {
      let found = null
      registry.forEach((entry) => {
        if (entry && entry.el === el) found = entry
      })
      return found
    }
    const ro = new ResizeObserver(() => {
      if (dead) return
      const w = Math.round(el.clientWidth || 0)
      if (w < 48) return
      if (Math.abs(w - lastW) < 10) return
      lastW = w
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        if (dead) return
        const entry = findEntry()
        if (!entry) return
        entry.options = Object.assign({}, entry.options || {}, { skipEnter: true })
        remountEntry(entry)
        if (entry.options && entry.options.skipEnter) {
          const cleaned = Object.assign({}, entry.options)
          delete cleaned.skipEnter
          entry.options = cleaned
        }
      }, 140)
    })
    ro.observe(el)
    return () => {
      dead = true
      window.clearTimeout(timer)
      try {
        ro.disconnect()
      } catch (_) {
        /* ignore */
      }
    }
  }

  /** SVG 业务图入场：错落入场后清理 class，避免干扰 hover */
  function armSvgChartEnter(el, nodes, options) {
    if (!el || typeof window === 'undefined') return
    if (options && options.skipEnter) return
    const list = (nodes || []).filter(Boolean)
    if (!list.length) return
    const reduced =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return
    const maxDelay = options && options.maxDelay != null ? options.maxDelay : 0.38
    el.classList.remove('is-svg-chart-enter')
    void el.offsetWidth
    list.forEach((node, i) => {
      const t = list.length <= 1 ? 0 : (i / (list.length - 1)) * maxDelay
      node.style.animationDelay = `${t.toFixed(3)}s`
    })
    el.classList.add('is-svg-chart-enter')
    window.setTimeout(() => {
      el.classList.remove('is-svg-chart-enter')
      list.forEach((node) => {
        node.style.animationDelay = ''
      })
    }, Math.ceil((maxDelay + 0.55) * 1000))
  }

  /**
   * 窄屏时抽稀序列，避免 K 线挤成一条毛线
   */
  function downsampleRows(rows, maxN) {
    const raw = Array.isArray(rows) ? rows : []
    if (!maxN || raw.length <= maxN) return raw
    const out = []
    const last = raw.length - 1
    for (let i = 0; i < maxN; i += 1) {
      const idx = Math.round((i / Math.max(1, maxN - 1)) * last)
      out.push(raw[idx])
    }
    return out.map((d, i) => ({ ...d, i }))
  }

  /** 在 body 上挂载可复用的 SVG 图 tooltip */
  function createSvgChartTip(className) {
    const tipEl = document.createElement('div')
    tipEl.className = `shadcn-chart-tooltip-root shadcn-svg-chart-tooltip ${className || ''}`.trim()
    tipEl.setAttribute('aria-hidden', 'true')
    document.body.appendChild(tipEl)
    const hide = () => {
      tipEl.classList.remove('is-open')
      tipEl.setAttribute('aria-hidden', 'true')
    }
    const show = (html, clientX, clientY) => {
      tipEl.innerHTML = html
      tipEl.classList.add('is-open')
      tipEl.setAttribute('aria-hidden', 'false')
      const tipPad = 12
      const tw = tipEl.offsetWidth || 160
      const th = tipEl.offsetHeight || 80
      let left = clientX + tipPad
      let top = clientY - th / 2
      if (left + tw > window.innerWidth - 8) left = clientX - tw - tipPad
      if (top < 8) top = 8
      if (top + th > window.innerHeight - 8) top = window.innerHeight - th - 8
      tipEl.style.left = `${left}px`
      tipEl.style.top = `${top}px`
    }
    const dispose = () => {
      hide()
      if (tipEl.parentNode) tipEl.parentNode.removeChild(tipEl)
    }
    return { tipEl, show, hide, dispose }
  }

  /**
   * 散点图（SVG）：连续 XY 随机/分布点
   * data: [{ x, y, group?, label?, tooltipLabel? }]
   * series: [{ key, label, color }] 与 group 对应；缺省时全部用第一色
   */
  function mountScatterChart(el, options) {
    if (!el) return null
    const opts = options || {}
    const raw = Array.isArray(opts.data) ? opts.data : []
    const series = Array.isArray(opts.series) && opts.series.length
      ? opts.series
      : [{ key: 'default', label: '样本', color: 'var(--chart-1)' }]
    const height = opts.height || 280
    const showXAxis = opts.showXAxis !== false
    const showYAxis = opts.showYAxis !== false
    const showGrid = opts.showGrid !== false
    const gridCount = opts.gridCount != null ? opts.gridCount : 4
    const pointR = opts.pointRadius != null ? opts.pointRadius : 4
    const groupKey = opts.groupKey || 'group'
    const margin = Object.assign(
      {
        top: 12,
        right: 16,
        bottom: showXAxis ? 28 : 12,
        left: showYAxis ? 44 : 12,
      },
      opts.margin || {}
    )
    const yTickFormat =
      typeof opts.yTickFormat === 'function' ? opts.yTickFormat : (v) => String(Math.round(v * 10) / 10)
    const xTickFormat =
      typeof opts.xTickFormat === 'function' ? opts.xTickFormat : (v) => String(Math.round(v * 10) / 10)
    const tipTitleOf = (d, i) =>
      typeof opts.tooltipLabel === 'function'
        ? opts.tooltipLabel(d, i)
        : d.tooltipLabel || d.label || `样本 ${i + 1}`

    el.classList.add('shadcn-chart-host', 'shadcn-chart-host--scatter')
    el.style.height = height + 'px'
    el.style.minHeight = height + 'px'
    el.innerHTML = ''
    if (!raw.length) return { chart: null, el, legend: [] }

    const seriesMeta = series.map((s, i) => ({
      key: s.key,
      label: s.label || s.key,
      color: resolveColor(el, s.color || CHART_COLORS[i % CHART_COLORS.length], themeFallback(el, i)),
    }))
    const colorOf = (group) => {
      const hit = seriesMeta.find((s) => s.key === group)
      return hit ? hit.color : seriesMeta[0].color
    }
    const labelOf = (group) => {
      const hit = seriesMeta.find((s) => s.key === group)
      return hit ? hit.label : seriesMeta[0].label
    }

    const points = raw
      .map((d, i) => {
        const x = Number(typeof opts.x === 'function' ? opts.x(d, i) : d.x)
        const y = Number(typeof opts.y === 'function' ? opts.y(d, i) : d.y)
        if (!Number.isFinite(x) || !Number.isFinite(y)) return null
        const group = d[groupKey] != null ? String(d[groupKey]) : seriesMeta[0].key
        return {
          i,
          x,
          y,
          group,
          color: colorOf(group),
          seriesLabel: labelOf(group),
          tip: tipTitleOf(d, i),
        }
      })
      .filter(Boolean)
    if (!points.length) return { chart: null, el, legend: [] }

    let xMin = opts.xDomain && opts.xDomain[0] != null ? Number(opts.xDomain[0]) : Infinity
    let xMax = opts.xDomain && opts.xDomain[1] != null ? Number(opts.xDomain[1]) : -Infinity
    let yMin = opts.yDomain && opts.yDomain[0] != null ? Number(opts.yDomain[0]) : Infinity
    let yMax = opts.yDomain && opts.yDomain[1] != null ? Number(opts.yDomain[1]) : -Infinity
    const autoX = !(opts.xDomain && opts.xDomain.length === 2)
    const autoY = !(opts.yDomain && opts.yDomain.length === 2)
    points.forEach((p) => {
      if (autoX) {
        xMin = Math.min(xMin, p.x)
        xMax = Math.max(xMax, p.x)
      }
      if (autoY) {
        yMin = Math.min(yMin, p.y)
        yMax = Math.max(yMax, p.y)
      }
    })
    if (!(xMax > xMin)) {
      xMin = 0
      xMax = 1
    }
    if (!(yMax > yMin)) {
      yMin = 0
      yMax = 1
    }
    if (autoX) {
      const pad = (xMax - xMin) * 0.08 || 1
      xMin -= pad
      xMax += pad
    }
    if (autoY) {
      const pad = (yMax - yMin) * 0.08 || 1
      yMin -= pad
      yMax += pad
    }

    const width = Math.max(160, el.clientWidth || 640)
    const plotW = Math.max(40, width - margin.left - margin.right)
    const plotH = Math.max(40, height - margin.top - margin.bottom)
    const xScale = (v) => margin.left + ((v - xMin) / (xMax - xMin)) * plotW
    const yScale = (v) => margin.top + ((yMax - v) / (yMax - yMin)) * plotH

    const svgNS = 'http://www.w3.org/2000/svg'
    const svg = document.createElementNS(svgNS, 'svg')
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
    svg.setAttribute('width', '100%')
    svg.setAttribute('height', String(height))
    svg.setAttribute('class', 'shadcn-scatter-svg')
    svg.setAttribute('role', 'img')

    const yTicks =
      Array.isArray(opts.yTickValues) && opts.yTickValues.length
        ? opts.yTickValues
        : Array.from({ length: gridCount + 1 }, (_, g) => yMax - ((yMax - yMin) * g) / gridCount)
    const xTicks =
      Array.isArray(opts.xTickValues) && opts.xTickValues.length
        ? opts.xTickValues
        : Array.from({ length: gridCount + 1 }, (_, g) => xMin + ((xMax - xMin) * g) / gridCount)

    yTicks.forEach((val) => {
      const y = yScale(val)
      if (showGrid) {
        const line = document.createElementNS(svgNS, 'line')
        line.setAttribute('x1', String(margin.left))
        line.setAttribute('x2', String(margin.left + plotW))
        line.setAttribute('y1', String(y))
        line.setAttribute('y2', String(y))
        line.setAttribute('class', 'shadcn-scatter-grid')
        line.setAttribute('vector-effect', 'non-scaling-stroke')
        svg.appendChild(line)
      }
      if (showYAxis) {
        const text = document.createElementNS(svgNS, 'text')
        text.setAttribute('x', String(margin.left - 8))
        text.setAttribute('y', String(y))
        text.setAttribute('text-anchor', 'end')
        text.setAttribute('dominant-baseline', 'middle')
        text.setAttribute('class', 'shadcn-scatter-y-tick')
        text.textContent = yTickFormat(val)
        svg.appendChild(text)
      }
    })

    if (showXAxis) {
      xTicks.forEach((val) => {
        const x = xScale(val)
        const text = document.createElementNS(svgNS, 'text')
        text.setAttribute('x', String(x))
        text.setAttribute('y', String(height - Math.max(8, margin.bottom - 12)))
        text.setAttribute('text-anchor', 'middle')
        text.setAttribute('dominant-baseline', 'hanging')
        text.setAttribute('class', 'shadcn-scatter-x-tick')
        text.textContent = xTickFormat(val)
        svg.appendChild(text)
      })
    }

    const tip = opts.tooltip === false ? null : createSvgChartTip('shadcn-scatter-tooltip')
    const enterNodes = []

    points.forEach((p) => {
      const dot = document.createElementNS(svgNS, 'circle')
      dot.setAttribute('cx', String(xScale(p.x)))
      dot.setAttribute('cy', String(yScale(p.y)))
      dot.setAttribute('r', String(pointR))
      dot.setAttribute('fill', p.color)
      dot.setAttribute('fill-opacity', '0.88')
      dot.setAttribute('class', 'shadcn-scatter-dot')
      if (tip) {
        dot.style.cursor = 'pointer'
        dot.addEventListener('pointermove', (e) => {
          tip.show(
            `<div class="shadcn-chart-tooltip-title">${p.tip}</div>
            <div class="shadcn-chart-tooltip-rows">
              <div class="shadcn-chart-tooltip-row">
                <span class="shadcn-chart-tooltip-left">
                  <span class="shadcn-chart-tooltip-dot" style="--legend-color:${p.color}"></span>
                  <span>${p.seriesLabel}</span>
                </span>
                <span class="shadcn-chart-tooltip-value">${xTickFormat(p.x)}, ${yTickFormat(p.y)}</span>
              </div>
            </div>`,
            e.clientX,
            e.clientY
          )
        })
        dot.addEventListener('pointerleave', tip.hide)
      }
      svg.appendChild(dot)
      enterNodes.push(dot)
    })

    el.appendChild(svg)
    armSvgChartEnter(el, enterNodes, { maxDelay: 0.4, skipEnter: !!opts.skipEnter })
    const instance = {
      chart: {
        type: 'scatter-svg',
        dispose() {
          if (tip) tip.dispose()
        },
      },
      el,
      legend: seriesMeta.map((s) => ({ label: s.label, color: s.color })),
    }
    instance.__resizeCleanup = attachSvgResizeRemount(el, instance)
    return instance
  }

  /**
   * 百分比对比柱（SVG）：满高背景轨 + 值柱；无网格；底轴有；异常色突出
   * data: [{ label, value, anomaly?, color? }]
   */
  function mountPercentTrackBarChart(el, options) {
    if (!el) return null
    const opts = options || {}
    const raw = Array.isArray(opts.data) ? opts.data : []
    const height = opts.height || 280
    const yMax = opts.yMax != null ? Number(opts.yMax) : 100
    const showXAxis = opts.showXAxis !== false
    const showYAxis = opts.showYAxis !== false
    const showXDomain = opts.showXDomain !== false
    const showGrid = opts.showGrid === true
    const trackColor = resolveColor(
      el,
      opts.trackColor || 'color-mix(in srgb, var(--chart-1) 12%, var(--color-fill-2, #f2f3f5))',
      'rgba(22, 93, 255, 0.1)'
    )
    const normalColor = resolveColor(el, opts.color || 'var(--chart-1)', themeFallback(el, 0))
    const anomalyColor = resolveColor(el, opts.anomalyColor || 'rgb(var(--warning-6))', '#ff7d00')
    const barRadiusOpt = opts.barRadius
    const margin = Object.assign(
      {
        top: 10,
        right: 12,
        bottom: showXAxis ? 36 : 14,
        left: showYAxis ? 44 : 12,
      },
      opts.margin || {}
    )
    const yTickValues =
      Array.isArray(opts.yTickValues) && opts.yTickValues.length
        ? opts.yTickValues
        : [0, 20, 40, 60, 80, 100].filter((v) => v <= yMax)
    const yTickFormat =
      typeof opts.yTickFormat === 'function' ? opts.yTickFormat : (v) => (v === 0 ? '0' : `${v}%`)

    el.classList.add('shadcn-chart-host', 'shadcn-chart-host--percent-track')
    el.style.height = height + 'px'
    el.style.minHeight = height + 'px'
    el.innerHTML = ''
    if (!raw.length) return { chart: null, el, legend: [] }

    const data = raw.map((d, i) => {
      const value = Math.max(0, Math.min(yMax, Number(d.value) || 0))
      const anomaly = !!(d.anomaly || d.isAnomaly || (opts.anomalyThreshold != null && value <= opts.anomalyThreshold))
      return {
        i,
        label: d.label != null ? String(d.label) : String(i + 1),
        value,
        anomaly,
        color: d.color
          ? resolveColor(el, d.color, anomaly ? anomalyColor : normalColor)
          : anomaly
            ? anomalyColor
            : normalColor,
        tooltipLabel:
          typeof opts.tooltipLabel === 'function'
            ? opts.tooltipLabel(d, i)
            : d.tooltipLabel || d.label || `第 ${i + 1} 项`,
      }
    })

    const width = Math.max(160, el.clientWidth || 640)
    const plotW = Math.max(40, width - margin.left - margin.right)
    const plotH = Math.max(40, height - margin.top - margin.bottom)
    const n = data.length
    const slot = plotW / n
    // 胶囊柱：偏细且随槽宽自适应，窄屏仍保持轨/柱可辨
    const barW = Math.max(5, Math.min(12, slot * 0.32))
    const cornerR = (vH) => {
      if (barRadiusOpt != null) return Math.min(Number(barRadiusOpt), barW / 2, Math.max(0, vH) / 2)
      return Math.min(barW / 2, Math.max(0, vH) / 2)
    }
    const yScale = (v) => margin.top + ((yMax - v) / yMax) * plotH
    const baselineY = yScale(0)

    const svgNS = 'http://www.w3.org/2000/svg'
    const svg = document.createElementNS(svgNS, 'svg')
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
    svg.setAttribute('width', '100%')
    svg.setAttribute('height', String(height))
    svg.setAttribute('class', 'shadcn-percent-track-svg')
    svg.setAttribute('role', 'img')

    yTickValues.forEach((val) => {
      const y = yScale(val)
      if (showGrid) {
        const line = document.createElementNS(svgNS, 'line')
        line.setAttribute('x1', String(margin.left))
        line.setAttribute('x2', String(margin.left + plotW))
        line.setAttribute('y1', String(y))
        line.setAttribute('y2', String(y))
        line.setAttribute('class', 'shadcn-percent-track-grid')
        line.setAttribute('vector-effect', 'non-scaling-stroke')
        svg.appendChild(line)
      }
      if (showYAxis) {
        const text = document.createElementNS(svgNS, 'text')
        text.setAttribute('x', String(margin.left - 8))
        text.setAttribute('y', String(y))
        text.setAttribute('text-anchor', 'end')
        text.setAttribute('dominant-baseline', 'middle')
        text.setAttribute('class', 'shadcn-percent-track-y-tick')
        text.textContent = yTickFormat(val)
        svg.appendChild(text)
      }
    })

    if (showXDomain) {
      const domain = document.createElementNS(svgNS, 'line')
      domain.setAttribute('x1', String(margin.left))
      domain.setAttribute('x2', String(margin.left + plotW))
      domain.setAttribute('y1', String(baselineY))
      domain.setAttribute('y2', String(baselineY))
      domain.setAttribute('class', 'shadcn-percent-track-domain')
      domain.setAttribute('vector-effect', 'non-scaling-stroke')
      svg.appendChild(domain)
    }

    const tip = opts.tooltip === false ? null : createSvgChartTip('shadcn-percent-track-tooltip')
    const enterNodes = []

    data.forEach((row) => {
      const cx = margin.left + slot * (row.i + 0.5)
      const x = cx - barW / 2
      const trackR = cornerR(plotH)
      const track = document.createElementNS(svgNS, 'rect')
      track.setAttribute('x', String(x))
      track.setAttribute('y', String(margin.top))
      track.setAttribute('width', String(barW))
      track.setAttribute('height', String(plotH))
      track.setAttribute('rx', String(trackR))
      track.setAttribute('ry', String(trackR))
      track.setAttribute('fill', trackColor)
      track.setAttribute('class', 'shadcn-percent-track-bg')
      svg.appendChild(track)

      // 按真实比例高度；勿强制 height>=width，否则短柱会变成椭圆
      const barH = Math.max(row.value > 0 ? 3 : 0, (row.value / yMax) * plotH)
      const barY = baselineY - barH
      const barR = cornerR(barH)
      const bar = document.createElementNS(svgNS, 'rect')
      bar.setAttribute('x', String(x))
      bar.setAttribute('y', String(barY))
      bar.setAttribute('width', String(barW))
      bar.setAttribute('height', String(barH))
      bar.setAttribute('rx', String(barR))
      bar.setAttribute('ry', String(barR))
      bar.setAttribute('fill', row.color)
      bar.setAttribute('class', row.anomaly ? 'shadcn-percent-track-bar is-anomaly' : 'shadcn-percent-track-bar')
      bar.style.cursor = 'pointer'
      if (tip) {
        const showTip = (e) => {
          tip.show(
            `<div class="shadcn-chart-tooltip-title">
              <span>${row.tooltipLabel}</span>
              ${row.anomaly ? '<span class="cce-scatter-tip-flag is-warn">异常</span>' : ''}
            </div>
            <div class="shadcn-chart-tooltip-rows">
              <div class="shadcn-chart-tooltip-row">
                <span class="shadcn-chart-tooltip-left">
                  <span class="shadcn-chart-tooltip-dot" style="--legend-color:${row.color}"></span>
                  <span>占比</span>
                </span>
                <span class="shadcn-chart-tooltip-value">${row.value.toFixed(0)}%</span>
              </div>
            </div>`,
            e.clientX,
            e.clientY
          )
        }
        bar.addEventListener('pointermove', showTip)
        bar.addEventListener('pointerleave', tip.hide)
        track.addEventListener('pointermove', showTip)
        track.addEventListener('pointerleave', tip.hide)
      }
      svg.appendChild(bar)
      enterNodes.push(track, bar)

      if (showXAxis) {
        const text = document.createElementNS(svgNS, 'text')
        text.setAttribute('x', String(cx))
        text.setAttribute('y', String(height - Math.max(6, margin.bottom - 18)))
        text.setAttribute('class', 'shadcn-percent-track-x-tick')
        text.textContent = row.label
        if (n > 8) {
          text.setAttribute('text-anchor', 'end')
          text.setAttribute('dominant-baseline', 'middle')
          text.setAttribute('transform', `rotate(-32 ${cx} ${height - Math.max(6, margin.bottom - 18)})`)
        } else {
          text.setAttribute('text-anchor', 'middle')
          text.setAttribute('dominant-baseline', 'hanging')
        }
        svg.appendChild(text)
      }
    })

    el.appendChild(svg)
    armSvgChartEnter(el, enterNodes, { maxDelay: 0.36, skipEnter: !!opts.skipEnter })
    const instance = {
      chart: {
        type: 'percent-track-svg',
        dispose() {
          if (tip) tip.dispose()
        },
      },
      el,
      legend: [
        { label: '正常', color: normalColor },
        { label: '异常', color: anomalyColor },
      ],
    }
    instance.__resizeCleanup = attachSvgResizeRemount(el, instance)
    return instance
  }

  function destroyCore(instance) {
    if (!instance) return
    if (typeof instance.__resizeCleanup === 'function') {
      try {
        instance.__resizeCleanup()
      } catch (_) {
        /* ignore */
      }
      instance.__resizeCleanup = null
    }
    if (typeof instance.__cursorBandCleanup === 'function') {
      instance.__cursorBandCleanup()
      instance.__cursorBandCleanup = null
    }
    if (instance.chart && typeof instance.chart.dispose === 'function') {
      try {
        instance.chart.dispose()
      } catch (_) {
        /* ignore */
      }
    }
    // 仅清空宿主；Unovis chart.destroy() 在本 bundle 下会导致后续 remount 空白
    if (instance.el) {
      instance.el.innerHTML = ''
    }
    instance.chart = null
  }

  const registry = new Map()
  let registrySeq = 0

  const mounters = {
    area: mountAreaChart,
    line: mountLineChart,
    bar: mountBarChart,
    stackedBar: mountStackedBarChart,
    horizontalBar: mountHorizontalBarChart,
    combo: mountComboChart,
    donut: mountDonutChart,
    radar: mountRadarChart,
    radial: mountRadialBarChart,
    gauge: mountGaugeChart,
    liquidFill: mountLiquidFillChart,
    candlestick: mountCandlestickChart,
    scatter: mountScatterChart,
    percentTrack: mountPercentTrackBarChart,
    rose: mountRoseChart,
  }

  function track(kind, el, options, instance) {
    if (!instance) return null
    const id = ++registrySeq
    registry.set(id, { id, kind, el, options, instance })
    instance.__proChartId = id
    return instance
  }

  function destroy(instance) {
    if (!instance) return
    if (instance.__proChartId != null) registry.delete(instance.__proChartId)
    destroyCore(instance)
  }

  function remountEntry(entry) {
    if (!entry || !entry.el || !entry.el.parentNode) return null
    const el = entry.el
    const prev = entry.instance

    // 原地重挂：保留 Vue $refs 指向的同一节点；并清理 tip / cursor band，避免主题切换泄漏
    if (prev) {
      if (typeof prev.__resizeCleanup === 'function') {
        try {
          prev.__resizeCleanup()
        } catch (_) {
          /* ignore */
        }
        prev.__resizeCleanup = null
      }
      if (typeof prev.__cursorBandCleanup === 'function') {
        try {
          prev.__cursorBandCleanup()
        } catch (_) {
          /* ignore */
        }
        prev.__cursorBandCleanup = null
      }
      if (prev.chart && typeof prev.chart.dispose === 'function') {
        try {
          prev.chart.dispose()
        } catch (_) {
          /* ignore */
        }
      }
      prev.chart = null
    }

    el.innerHTML = ''
    const next = mounters[entry.kind](el, entry.options)
    if (!next) {
      entry.instance = null
      return null
    }

    // 保持实例对象身份，页面侧 this._xxxChart 引用仍有效
    if (prev) {
      Object.keys(next).forEach((k) => {
        prev[k] = next[k]
      })
      if (typeof next.__cursorBandCleanup === 'function') {
        prev.__cursorBandCleanup = next.__cursorBandCleanup
      }
      if (typeof next.__resizeCleanup === 'function') {
        prev.__resizeCleanup = next.__resizeCleanup
      }
      prev.el = el
      prev.__proChartId = entry.id
      entry.instance = prev
      return prev
    }

    next.__proChartId = entry.id
    next.el = el
    entry.instance = next
    return next
  }

  function refreshAll() {
    registry.forEach((entry) => remountEntry(entry))
  }

  let refreshAllRaf = 0
  function scheduleRefreshAll() {
    if (refreshAllRaf) return
    refreshAllRaf = window.requestAnimationFrame(() => {
      refreshAllRaf = 0
      refreshAll()
    })
  }

  window.addEventListener('arco-pro-theme-change', () => {
    scheduleRefreshAll()
  })

  function destroyByElement(el) {
    if (!el) return
    const stale = []
    registry.forEach((entry) => {
      if (entry.el === el) stale.push(entry.instance)
    })
    stale.forEach((instance) => destroy(instance))
  }

  function mountTracked(kind, el, options) {
    destroyByElement(el)
    return track(kind, el, options, mounters[kind](el, options))
  }

  window.ProShadcnChartData = {
    contentTrend() {
      const year = 2026
      // 保留起伏层次：低点约一半高度，峰值贴近轴顶（约 80）
      const valuesK = [48, 54, 42, 60, 68, 50, 62, 56, 72, 66, 76, 58]
      return valuesK.map((v, i) => ({
        x: i,
        label: `${year}-${i + 1}`,
        y: v * 1000,
      }))
    },
    /** 概览页：每周点击量 / 独立访客 */
    trafficWeekly() {
      return [
        { label: '周一', clicks: 720, uniques: 480 },
        { label: '周二', clicks: 580, uniques: 390 },
        { label: '周三', clicks: 860, uniques: 620 },
        { label: '周四', clicks: 690, uniques: 470 },
        { label: '周五', clicks: 1080, uniques: 760 },
        { label: '周六', clicks: 450, uniques: 310 },
        { label: '周日', clicks: 390, uniques: 260 },
      ]
    },
    /**
     * 对比面积：近 7 日加密采样 + 高频抖动（对齐工作台「流量概览」）
     * @returns {{ x:number, label:string, tipLabel:string, clicks:number, uniques:number }[]}
     */
    trafficDenseCompare() {
      const seed = 317
      const n = 35
      const base = 4600
      const dayLabels = ['08-05', '08-06', '08-07', '08-08', '08-09', '08-10', '08-11']
      const seededUnit = (s, salt) => {
        const x = Math.sin((s + 1) * 12.9898 + (salt + 1) * 78.233) * 43758.5453
        return x - Math.floor(x)
      }
      const jaggedValue = (i, salt, b) => {
        const u = seededUnit(seed, i * 17 + salt)
        const u2 = seededUnit(seed, i * 29 + salt + 5)
        const u3 = seededUnit(seed, i * 41 + salt + 11)
        let v = b * (0.82 + u * 0.16)
        v += Math.sin(i * 2.6 + seed * 0.11) * b * 0.05
        v += (u2 - 0.5) * b * 0.2
        if (u3 > 0.86) v *= 0.68
        else if (u3 < 0.1) v *= 1.16
        const dip = Math.floor(n * 0.72)
        if (i === dip - 1) v = b * 1.12
        if (i === dip) v = b * 0.48
        if (i === dip + 1) v = b * 0.92
        return Math.max(Math.round(b * 0.32), Math.round(v))
      }
      // 轴刻度均匀落在首尾（含右端），避免折线贴边却无日期；tooltip 仍按日映射
      const axisTickAt = new Set(
        dayLabels.map((_, di) => Math.round((di / Math.max(1, dayLabels.length - 1)) * (n - 1)))
      )
      return Array.from({ length: n }, (_, i) => {
        const dayIdx = Math.min(dayLabels.length - 1, Math.floor((i / (n - 1)) * dayLabels.length))
        const clicks = jaggedValue(i, 3, base)
        const uniques = Math.min(clicks - 20, jaggedValue(i, 8, base * 0.62))
        const hour = Math.round(((i / (n - 1)) * 7 - dayIdx) * 24)
        const hh = String(Math.max(0, Math.min(23, hour))).padStart(2, '0')
        const tickDi = Math.round((i / Math.max(1, n - 1)) * (dayLabels.length - 1))
        return {
          x: i,
          label: axisTickAt.has(i) ? dayLabels[tickDi] : '',
          tipLabel: `${dayLabels[dayIdx]} ${hh}:00`,
          clicks,
          uniques: Math.max(40, uniques),
        }
      })
    },
    /** 概览页：月度收入柱状图 */
    revenueMonthly() {
      const totals = [4200, 3100, 4800, 2900, 5200, 3800, 4500, 4100, 5600, 4900, 5300, 4700]
      return totals.map((total, i) => ({
        label: `${i + 1}月`,
        total,
      }))
    },
    salesTrend() {
      return [
        { label: '1月', desktop: 186, mobile: 80 },
        { label: '2月', desktop: 305, mobile: 200 },
        { label: '3月', desktop: 237, mobile: 120 },
        { label: '4月', desktop: 273, mobile: 190 },
        { label: '5月', desktop: 209, mobile: 130 },
        { label: '6月', desktop: 214, mobile: 140 },
      ]
    },
    trafficTrend() {
      return [
        { label: '周一', visit: 420, signup: 86, pay: 32 },
        { label: '周二', visit: 380, signup: 72, pay: 28 },
        { label: '周三', visit: 510, signup: 110, pay: 45 },
        { label: '周四', visit: 460, signup: 95, pay: 38 },
        { label: '周五', visit: 580, signup: 128, pay: 52 },
        { label: '周六', visit: 320, signup: 58, pay: 22 },
        { label: '周日', visit: 290, signup: 48, pay: 18 },
      ]
    },
    categorySales() {
      return [
        { label: '电子', online: 420, offline: 180, partner: 90 },
        { label: '服饰', online: 310, offline: 260, partner: 70 },
        { label: '食品', online: 280, offline: 210, partner: 55 },
        { label: '家居', online: 190, offline: 150, partner: 40 },
        { label: '美妆', online: 240, offline: 120, partner: 65 },
      ]
    },
    funnelSteps() {
      return [
        { label: '访问', value: 1000 },
        { label: '注册', value: 620 },
        { label: '下单', value: 380 },
        { label: '支付', value: 240 },
        { label: '复购', value: 96 },
      ]
    },
    channelShare() {
      return [
        { label: '线上推广', value: 42 },
        { label: '自然流量', value: 28 },
        { label: '线下活动', value: 18 },
        { label: '其他', value: 12 },
      ]
    },
    regionShare() {
      return [
        { label: '华东', value: 35 },
        { label: '华北', value: 22 },
        { label: '华南', value: 18 },
        { label: '西部', value: 15 },
        { label: '其他', value: 10 },
      ]
    },
    /** 横向条形图：区域销量排名（降序） */
    regionRank() {
      return [
        { label: '华东', value: 420 },
        { label: '华北', value: 310 },
        { label: '华南', value: 260 },
        { label: '西部', value: 180 },
        { label: '其他', value: 120 },
      ]
    },
    /** 横向分组对比条形图：本期 / 上期 */
    regionCompare() {
      return [
        { label: '华东', current: 420, previous: 360 },
        { label: '华北', current: 310, previous: 278 },
        { label: '华南', current: 260, previous: 240 },
        { label: '西部', current: 180, previous: 165 },
        { label: '其他', current: 120, previous: 98 },
      ]
    },
    deviceShare() {
      return [
        { label: 'iOS', value: 38 },
        { label: 'Android', value: 45 },
        { label: 'Web', value: 12 },
        { label: '其他', value: 5 },
      ]
    },
    /** 雷达图：近 6 个月访问量（单系列，对齐 shadcn chart-radar-dots） */
    radarVisits() {
      return [
        { label: '1月', desktop: 186 },
        { label: '2月', desktop: 305 },
        { label: '3月', desktop: 237 },
        { label: '4月', desktop: 273 },
        { label: '5月', desktop: 209 },
        { label: '6月', desktop: 214 },
      ]
    },
    /** 雷达图：圆形填充网格示例数据 */
    radarVisitsCircle() {
      return [
        { label: '1月', desktop: 186 },
        { label: '2月', desktop: 285 },
        { label: '3月', desktop: 237 },
        { label: '4月', desktop: 203 },
        { label: '5月', desktop: 209 },
        { label: '6月', desktop: 264 },
      ]
    },
    /** 雷达图：桌面 / 移动双系列（对齐 shadcn chart-radar-legend） */
    radarVisitsCompare() {
      return [
        { label: '1月', desktop: 186, mobile: 80 },
        { label: '2月', desktop: 305, mobile: 200 },
        { label: '3月', desktop: 237, mobile: 120 },
        { label: '4月', desktop: 73, mobile: 190 },
        { label: '5月', desktop: 209, mobile: 130 },
        { label: '6月', desktop: 214, mobile: 140 },
      ]
    },
    /** 径向图：浏览器份额（标签径向图；主题单色=主色阶；非主题=多色，见 --chart-radial-*） */
    radialBrowserShare() {
      return [
        { label: 'Chrome', value: 275, color: 'var(--chart-radial-1)' },
        { label: 'Safari', value: 200, color: 'var(--chart-radial-2)' },
        { label: 'Firefox', value: 187, color: 'var(--chart-radial-3)' },
        { label: 'Edge', value: 173, color: 'var(--chart-radial-4)' },
        { label: '其他', value: 90, color: 'var(--chart-radial-5)' },
      ]
    },
    /** 径向堆叠：桌面 / 移动访客 */
    radialStackedShare() {
      return [
        { label: '桌面端', value: 1260, color: 'var(--chart-1)' },
        { label: '移动端', value: 570, color: 'var(--chart-2)' },
      ]
    },
    /** 南丁格尔玫瑰：品类销售占比 */
    roseShare() {
      return [
        { label: '手机数码', value: 34, color: 'var(--chart-1)' },
        { label: '电脑办公', value: 24, color: 'var(--chart-2)' },
        { label: '家用电器', value: 20.1, color: 'var(--chart-3)' },
        { label: '服饰鞋包', value: 18, color: 'var(--chart-4)' },
        { label: '美妆个护', value: 14.2, color: 'var(--chart-5)' },
        { label: '食品生鲜', value: 13.8, color: 'var(--chart-6)' },
        { label: '家居家装', value: 11, color: 'var(--chart-7)' },
        { label: '其他', value: 10, color: 'var(--chart-8)' },
      ]
    },
    roseCityRank() {
      return [
        { label: '南京市', value: 720 },
        { label: '扬州市', value: 410 },
        { label: '无锡市', value: 580 },
        { label: '镇江市', value: 320 },
        { label: '苏州市', value: 690 },
        { label: '南通市', value: 540 },
        { label: '常州市', value: 500 },
        { label: '淮安市', value: 280 },
        { label: '盐城市', value: 360 },
        { label: '泰州市', value: 300 },
      ]
    },
  }

  window.ProShadcnCharts = {
    mountAreaChart(el, options) {
      return mountTracked('area', el, options)
    },
    mountLineChart(el, options) {
      return mountTracked('line', el, options)
    },
    mountBarChart(el, options) {
      return mountTracked('bar', el, options)
    },
    mountStackedBarChart(el, options) {
      return mountTracked('stackedBar', el, options)
    },
    mountHorizontalBarChart(el, options) {
      return mountTracked('horizontalBar', el, options)
    },
    mountComboChart(el, options) {
      return mountTracked('combo', el, options)
    },
    mountDonutChart(el, options) {
      return mountTracked('donut', el, options)
    },
    mountRadarChart(el, options) {
      return mountTracked('radar', el, options)
    },
    mountRadialBarChart(el, options) {
      return mountTracked('radial', el, options)
    },
    mountGaugeChart(el, options) {
      return mountTracked('gauge', el, options)
    },
    mountLiquidFillChart(el, options) {
      return mountTracked('liquidFill', el, options)
    },
    mountCandlestickChart(el, options) {
      return mountTracked('candlestick', el, options)
    },
    mountScatterChart(el, options) {
      return mountTracked('scatter', el, options)
    },
    mountPercentTrackBarChart(el, options) {
      return mountTracked('percentTrack', el, options)
    },
    mountRoseChart(el, options) {
      return mountTracked('rose', el, options)
    },
    destroy,
    release(instance) {
      if (!instance) return
      if (typeof instance.__resizeCleanup === 'function') {
        try {
          instance.__resizeCleanup()
        } catch (_) {
          /* ignore */
        }
        instance.__resizeCleanup = null
      }
      if (typeof instance.__cursorBandCleanup === 'function') {
        instance.__cursorBandCleanup()
        instance.__cursorBandCleanup = null
      }
      // 仅清理自管 SVG 图（含 tip DOM）；Unovis XYContainer 勿在此 dispose，以免 remount 空白
      const kind = instance.chart && instance.chart.type
      if (
        (kind === 'candlestick-svg' ||
          kind === 'radial-svg' ||
          kind === 'gauge-svg' ||
          kind === 'liquid-svg' ||
          kind === 'radar-svg' ||
          kind === 'scatter-svg' ||
          kind === 'percent-track-svg' ||
          kind === 'rose-svg') &&
        typeof instance.chart.dispose === 'function'
      ) {
        try {
          instance.chart.dispose()
        } catch (_) {
          /* ignore */
        }
      }
      if (instance.__proChartId != null) registry.delete(instance.__proChartId)
      instance.__proChartId = null
      instance.chart = null
      instance.el = null
    },
    refreshAll,
    formatShadcnTooltip,
    CHART_COLORS,
  }
})()
