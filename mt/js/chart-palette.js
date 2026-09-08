/**
 * 图表配色方案：默认主题单色，可切换多色板（跨页 localStorage）
 * 写入 --chart-1 … --chart-10，供图表与指标卡共用
 * 由 arco-theme.js 在主题 init 后自动注入；HTML 可省略显式 <script>
 */
;(function () {
  if (window.ArcoProChartPalette) return

  function storageKey(key) {
    const ctx = window.ArcoProPreviewContext
    return ctx && typeof ctx.storageKey === 'function' ? ctx.storageKey(key) : key
  }

  const STORAGE_KEY = storageKey('arco-pro-chart-palette')
  const DEFAULT_ID = 'theme'

  const SCHEMES = [
    {
      id: 'theme',
      title: '主题单色',
      badge: '默认',
      why: '跟随系统主题色：组合图表用主色深浅阶梯区分系列；同组指标卡统一为主题色。',
      cols: 10,
      mode: 'theme',
      softAlpha: 0.14,
    },
    {
      id: 'a',
      title: '方案 A · 多彩分类',
      badge: '推荐',
      why: '色相跨度大、辨识度高，适合环形图、饼图等多分类对比。',
      cols: 10,
      softAlpha: 0.14,
      colors: [
        { id: 'C1', name: '电器蓝', hex: '#5482FF' },
        { id: 'C2', name: '美妆绿', hex: '#41D59E' },
        { id: 'C3', name: '雾钢蓝', hex: '#5F77AB' },
        { id: 'C4', name: '食品黄', hex: '#FFBC00' },
        { id: 'C5', name: '箱包红', hex: '#E15547' },
        { id: 'C6', name: '晴空青', hex: '#64C1E8' },
        { id: 'C7', name: '礼品紫', hex: '#9555B6' },
        { id: 'C8', name: '文娱橙', hex: '#F08947' },
        { id: 'C9', name: '嫩粉', hex: '#F472B6' },
        { id: 'C10', name: '草绿', hex: '#84CC16' },
      ],
    },
    {
      id: 'b',
      title: '方案 B · 柔和品牌',
      badge: '品牌向',
      why: '以紫蓝为主轴，辅以品红、玫粉等差异色，适合仪表盘与指标卡成套使用。',
      cols: 10,
      softAlpha: 0.14,
      colors: [
        { id: 'C1', name: '主紫', hex: '#8D51F5' },
        { id: 'C2', name: '亮蓝', hex: '#4CB0FF' },
        { id: 'C3', name: '青', hex: '#3BC2C2' },
        { id: 'C4', name: '浅紫', hex: '#8B7CF1' },
        { id: 'C5', name: '天蓝', hex: '#5BA4E5' },
        { id: 'C6', name: '品红', hex: '#D946EF' },
        { id: 'C7', name: '雾靛', hex: '#818CF8' },
        { id: 'C8', name: '晴空', hex: '#0EA5E9' },
        { id: 'C9', name: '玫粉', hex: '#EC4899' },
        { id: 'C10', name: '雾灰蓝', hex: '#64748B' },
      ],
    },
    {
      id: 'c',
      title: '方案 C · 莫兰迪柔彩',
      badge: '低饱和',
      why: '偏低饱和、偏灰的柔和色板，适合信息密集或偏克制的页面。',
      cols: 10,
      softAlpha: 0.16,
      colors: [
        { id: 'C1', name: '雾蓝紫', hex: '#7B8CDE' },
        { id: 'C2', name: '烟灰蓝', hex: '#6BA3C7' },
        { id: 'C3', name: '豆青', hex: '#7EB8A8' },
        { id: 'C4', name: '灰丁香', hex: '#9A8FD4' },
        { id: 'C5', name: '雾青', hex: '#5A9BB8' },
        { id: 'C6', name: '藕荷', hex: '#A89BC8' },
        { id: 'C7', name: '雾靛', hex: '#8B95C9' },
        { id: 'C8', name: '灰湖绿', hex: '#6FA8B8' },
        { id: 'C9', name: '灰玫', hex: '#C49AAA' },
        { id: 'C10', name: '雾灰', hex: '#8A96A5' },
      ],
    },
  ]

  function canPersist() {
    return !window.ArcoProSettings || ArcoProSettings.themePersist !== false
  }

  function soft(hex, alpha) {
    const h = String(hex || '').replace('#', '')
    if (h.length < 6) return 'rgba(0,0,0,' + alpha + ')'
    const r = parseInt(h.slice(0, 2), 16)
    const g = parseInt(h.slice(2, 4), 16)
    const b = parseInt(h.slice(4, 6), 16)
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')'
  }

  function roots() {
    const list = [document.documentElement]
    if (document.body) list.push(document.body)
    return list
  }

  function readCssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  }

  function parseRgbParts(rgb) {
    if (!rgb) return null
    const parts = String(rgb)
      .split(',')
      .map((n) => parseInt(n.trim(), 10))
    if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return null
    return parts.slice(0, 3)
  }

  function mixRgb(a, b, t) {
    return [
      Math.round(a[0] + (b[0] - a[0]) * t),
      Math.round(a[1] + (b[1] - a[1]) * t),
      Math.round(a[2] + (b[2] - a[2]) * t),
    ]
  }

  function readThemeStep(step) {
    return readCssVar('--primary-' + step) || readCssVar('--arcoblue-' + step)
  }

  function themeColorEntry(id, name, rgb) {
    const css = rgb ? (Array.isArray(rgb) ? rgb.join(', ') : String(rgb).trim()) : ''
    return {
      id: id,
      name: name,
      hex: rgbToApproxHex(css),
      css: css ? 'rgb(' + css + ')' : 'rgb(var(--primary-6))',
    }
  }

  function buildThemeColors() {
    // 深 → 浅：C1 为主题色（最深档），其后逐级变浅
    const light = parseRgbParts(readThemeStep(1)) || [190, 218, 255]
    const sequence = [
      { name: '主题色', rgb: readThemeStep(6) },
      { name: '主题阶梯 2', rgb: readThemeStep(5) },
      { name: '主题阶梯 3', rgb: readThemeStep(4) },
      { name: '主题阶梯 4', rgb: readThemeStep(3) },
      { name: '主题阶梯 5', rgb: readThemeStep(2) },
      { name: '主题阶梯 6', rgb: readThemeStep(1) },
      { name: '主题阶梯 7', rgb: mixRgb(light, [255, 255, 255], 0.28) },
      { name: '主题阶梯 8', rgb: mixRgb(light, [255, 255, 255], 0.48) },
      { name: '主题阶梯 9', rgb: mixRgb(light, [255, 255, 255], 0.66) },
      { name: '主题阶梯 10', rgb: mixRgb(light, [255, 255, 255], 0.82) },
    ]
    return sequence.map((item, i) => themeColorEntry('C' + (i + 1), item.name, item.rgb))
  }

  function rgbToApproxHex(rgb) {
    if (!rgb) return '#6C5CE7'
    const parts = rgb.split(',').map((n) => parseInt(n.trim(), 10))
    if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return '#6C5CE7'
    return (
      '#' +
      parts
        .slice(0, 3)
        .map((n) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0'))
        .join('')
    )
  }

  function getScheme(id) {
    return SCHEMES.find((s) => s.id === id) || SCHEMES[0]
  }

  function getInitialId() {
    if (!canPersist()) return DEFAULT_ID
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored && SCHEMES.some((s) => s.id === stored)) return stored
    } catch (e) {
      /* ignore */
    }
    return DEFAULT_ID
  }

  function persistId(id) {
    if (!canPersist()) return
    try {
      localStorage.setItem(STORAGE_KEY, id)
    } catch (e) {
      /* ignore */
    }
  }

  function resolveColors(scheme) {
    if (scheme.mode === 'theme') return buildThemeColors()
    return (scheme.colors || []).map((c) => ({
      id: c.id,
      name: c.name,
      hex: c.hex,
      css: c.hex,
    }))
  }

  function applyColors(colors) {
    roots().forEach((root) => {
      for (let i = 1; i <= 10; i += 1) {
        const c = colors[i - 1] || colors[0]
        if (c) root.style.setProperty('--chart-' + i, c.css)
        else root.style.removeProperty('--chart-' + i)
      }
      root.setAttribute('data-chart-palette', currentId)
    })
  }

  let currentId = DEFAULT_ID

  function apply(id, options) {
    const scheme = getScheme(id || currentId)
    currentId = scheme.id
    const colors = resolveColors(scheme)
    applyColors(colors)
    if (!options || options.persist !== false) persistId(currentId)
    window.dispatchEvent(
      new CustomEvent('arco-pro-chart-palette-change', {
        detail: { id: currentId, scheme: scheme, colors: colors },
      })
    )
    // 复用图表主题刷新
    window.dispatchEvent(
      new CustomEvent('arco-pro-theme-change', {
        detail: { type: 'chart-palette', paletteId: currentId },
      })
    )
    return { scheme: scheme, colors: colors }
  }

  function schemeForDisplay(scheme) {
    if (scheme.mode === 'theme') {
      return Object.assign({}, scheme, { colors: resolveColors(scheme) })
    }
    return scheme
  }

  window.ArcoProChartPalette = {
    storageKey: STORAGE_KEY,
    defaultId: DEFAULT_ID,
    schemes: SCHEMES,
    soft: soft,
    getCurrentId() {
      return currentId
    },
    getScheme: getScheme,
    schemeForDisplay: schemeForDisplay,
    getColors() {
      return resolveColors(getScheme(currentId))
    },
    apply: apply,
    set(id) {
      return apply(id, { persist: true })
    },
    init() {
      currentId = getInitialId()
      apply(currentId, { persist: false })
      window.addEventListener('arco-pro-theme-change', (ev) => {
        const detail = (ev && ev.detail) || {}
        if (detail.type === 'chart-palette') return
        if (getScheme(currentId).mode === 'theme') {
          apply('theme', { persist: false })
        }
      })
    },
  }

  function boot() {
    // 等主题色写入后再套单色阶梯
    if (window.ArcoProTheme) {
      ArcoProChartPalette.init()
    } else {
      ArcoProChartPalette.init()
    }
  }

  if (document.body) boot()
  else document.addEventListener('DOMContentLoaded', boot)
})()
