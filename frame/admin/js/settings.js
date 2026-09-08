/** Arco Design Pro settings.json */
;(function () {
  /** Vibe Pack / Gallery iframe 预览：主题与布局写入带前缀的 localStorage，与交付母版隔离 */
  const inVibePackPreview =
    window.__GALLERY_ADMIN_PREVIEW__ === 1 ||
    window.self !== window.top ||
    /[?&](?:vibepack|vibe-pack|galleryPreview)=1(?:&|$)/i.test(location.search)

  const PREVIEW_STORAGE_PREFIX = 'vibepack-preview:'

  const LEGACY_ARCO_KEYS = [
    'arco-pro-theme-mode',
    'arco-pro-theme-color',
    'arco-pro-chart-palette',
    'arco-pro-layout-mode',
    'arco-pro-menu-collapsed',
    'arco-pro-table-density',
  ]

  function migrateLegacyPreviewStorage() {
    if (!inVibePackPreview) return
    LEGACY_ARCO_KEYS.forEach((key) => {
      try {
        const prefixed = PREVIEW_STORAGE_PREFIX + key
        if (localStorage.getItem(prefixed) !== null) return
        const legacy = localStorage.getItem(key)
        if (legacy !== null) localStorage.setItem(prefixed, legacy)
      } catch {
        /* ignore */
      }
    })
  }

  window.ArcoProPreviewContext = {
    isVibePackPreview: inVibePackPreview,
    storageKey(key) {
      return inVibePackPreview ? PREVIEW_STORAGE_PREFIX + key : key
    },
  }

  window.ArcoProSettings = {
    colorWeek: false,
    navbar: true,
    menu: true,
    footer: true,
    /** 多标签通栏（仅上下布局 / 窄屏显示）；暂隐藏 */
    tabBar: false,
    /** @deprecated 请用 themeColorPreset；hex 由 arco-theme.js 预设提供 */
    themeColor: '#6C5CE7',
    /** 默认主题色预设 id，见 js/arco-theme.js PRESETS */
    themeColorPreset: 'indigo',
    /** 明暗主题与主题色是否写入 localStorage（跨页保持） */
    themePersist: true,
    menuWidth: 220,
    menuCollapsedWidth: 58,
    navbarHeight: 60,
    /** 布局：top = 顶栏通栏 + 侧栏在下；side = 侧栏通顶（含 Logo）+ 右侧顶栏与内容 */
    layoutMode: 'top',
    /** 顶栏「布局切换」与侧栏折叠状态是否写入 localStorage */
    layoutPersist: true,
  }

  const TABLE_DENSITY_KEY = 'arco-pro-table-density'
  const TABLE_DENSITY_VALUES = ['medium', 'small', 'mini']

  function resolveStorageKey(key) {
    return window.ArcoProPreviewContext.storageKey(key)
  }

  window.ArcoProTablePrefs = {
    densityKey: TABLE_DENSITY_KEY,
    densityValues: TABLE_DENSITY_VALUES.slice(),
    keepOneDataColumnTip: '\u81f3\u5c11\u4fdd\u7559\u4e00\u5217',
    getDensity(fallback) {
      const def = fallback || 'medium'
      try {
        const raw = localStorage.getItem(resolveStorageKey(TABLE_DENSITY_KEY))
        if (TABLE_DENSITY_VALUES.indexOf(raw) >= 0) return raw
      } catch {
        /* ignore */
      }
      return def
    },
    setDensity(size) {
      if (TABLE_DENSITY_VALUES.indexOf(size) < 0) return false
      try {
        localStorage.setItem(resolveStorageKey(TABLE_DENSITY_KEY), size)
        return true
      } catch {
        return false
      }
    },
    /** 表格密度 → 操作列按钮：默认/中等用 small（与单元格字号一致），紧凑用 mini */
    opsButtonSize(tableSize) {
      return tableSize === 'mini' ? 'mini' : 'small'
    },
    /**
     * 在数据列之间按初始权重分配宽度；勾选列(48)与操作列固定不参与。
     * preferredWidths 必须来自列初始定义，避免多次分配漂移。
     * @returns {{ columns: Array, scroll: { x: number } }}
     */
    layoutTableColumns(visibleColumns, options) {
      const opts = options || {}
      const opsKey = opts.operationsKey || 'operations'
      const selectionWidth = opts.selectionWidth != null ? Number(opts.selectionWidth) : 48
      const containerWidth = opts.containerWidth != null ? Number(opts.containerWidth) : 0
      const preferredWidths = opts.preferredWidths || {}
      const sel = Number.isFinite(selectionWidth) && selectionWidth > 0 ? selectionWidth : 48

      const list = (visibleColumns || []).map((col) => (col ? { ...col } : col)).filter(Boolean)

      let opsWidth = 0
      const opsIdx = list.findIndex((col) => col.dataIndex === opsKey)
      if (opsIdx >= 0) {
        const raw = preferredWidths[opsKey]
        const fromCol = list[opsIdx].width != null ? list[opsIdx].width : list[opsIdx].minWidth
        opsWidth = Number(raw != null ? raw : fromCol)
        if (!Number.isFinite(opsWidth) || opsWidth <= 0) opsWidth = 160
        const ops = { ...list[opsIdx] }
        delete ops.minWidth
        ops.width = opsWidth
        if (!ops.fixed) ops.fixed = 'right'
        ops.className = [ops.className, 'pro-table-ops-col'].filter(Boolean).join(' ')
        ops.headerCellClass = [ops.headerCellClass, 'pro-table-ops-col'].filter(Boolean).join(' ')
        ops.bodyCellClass = [ops.bodyCellClass, 'pro-table-ops-col'].filter(Boolean).join(' ')
        list[opsIdx] = ops
      }

      const dataCols = list.filter((col) => col.dataIndex !== opsKey)
      if (!dataCols.length) {
        return { columns: list, scroll: { x: sel + opsWidth } }
      }

      const weights = dataCols.map((col) => {
        const pref = Number(preferredWidths[col.dataIndex])
        if (Number.isFinite(pref) && pref > 0) return pref
        const fallback = Number(col.width != null ? col.width : col.minWidth)
        return Number.isFinite(fallback) && fallback > 0 ? fallback : 120
      })
      const weightSum = weights.reduce((a, b) => a + b, 0) || 1
      const preferredTotal = sel + weightSum + opsWidth
      const fill = Number.isFinite(containerWidth) && containerWidth > preferredTotal
      const targetDataWidth = fill ? containerWidth - sel - opsWidth : weightSum

      let used = 0
      dataCols.forEach((col, i) => {
        const idx = list.findIndex((c) => c.dataIndex === col.dataIndex)
        if (idx < 0) return
        const isLast = i === dataCols.length - 1
        const w = isLast
          ? Math.max(40, Math.round(targetDataWidth - used))
          : Math.max(40, Math.floor((targetDataWidth * weights[i]) / weightSum))
        if (!isLast) used += w
        const next = { ...list[idx] }
        delete next.minWidth
        next.width = w
        list[idx] = next
      })

      const dataWidth = list
        .filter((col) => col.dataIndex !== opsKey)
        .reduce((sum, col) => sum + (Number(col.width) || 0), 0)
      return { columns: list, scroll: { x: Math.max(sel + dataWidth + opsWidth, 1) } }
    },
    /** @deprecated 使用 layoutTableColumns */
    prepareTableColumns(columns, options) {
      return this.layoutTableColumns(columns, options).columns
    },
    /** @deprecated 使用 layoutTableColumns */
    calcTableScrollX(columns, options) {
      return this.layoutTableColumns(columns, options).scroll
    },
    /** 测量表格容器宽度；返回 measure 函数，页面卸载时调用 disconnect */
    createTableHostMeasurer(vm, options) {
      const opts = options || {}
      const selector = opts.selector || '.arco-table-container'
      let ro = null
      let retryTimer = null
      const measure = () => {
        try {
          const root = vm && vm.$el
          if (!root || typeof root.querySelector !== 'function') return
          const el = root.querySelector(selector)
          if (!el) {
            if (retryTimer) clearTimeout(retryTimer)
            retryTimer = setTimeout(measure, 80)
            return
          }
          const w = Math.floor(el.clientWidth)
          const prev = Number(vm.tableHostWidth) || 0
          if (w > 0 && Math.abs(prev - w) >= 2) vm.tableHostWidth = w
          if (typeof ResizeObserver !== 'undefined' && !ro) {
            ro = new ResizeObserver(() => measure())
            ro.observe(el)
            vm._tableHostRO = ro
          }
        } catch {
          /* ignore */
        }
      }
      measure.disconnect = () => {
        try {
          if (retryTimer) clearTimeout(retryTimer)
          if (ro) ro.disconnect()
        } catch {
          /* ignore */
        }
        retryTimer = null
        ro = null
        if (vm) vm._tableHostRO = null
      }
      return measure
    },
  }

  migrateLegacyPreviewStorage()
})()
