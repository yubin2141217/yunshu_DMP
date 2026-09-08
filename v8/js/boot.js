/**
 * Vue 3 静态多页：鉴权 + ProShell + 页面组件
 */

/**
 * TimeRange：下拉对齐到当前聚焦的起/止输入框。
 * 不改写 Arco 的 left，只用 translateX；首开先隐藏再显示。
 * 注意：
 * 1) 页面会残留多个 z-index:0 的 trigger 弹层，必须优先选真正可见/已定位的那一个。
 * 2) 单列 TimePicker 与 TimeRange 弹层都带 .arco-timepicker-container，禁止把
 *    TimeRange 的 translateX 套到其它时间弹层上（否则会飞到左侧 DatePicker 下）。
 */
;(function initTimeRangePopupAlign() {
  let raf = 0
  let lockInput = null
  let pendingFirstOpen = false
  let styleMo = null
  let watchedPopup = null
  let applying = false

  function isTimeRangePicker(rangeEl) {
    return !!(
      rangeEl &&
      rangeEl.classList &&
      rangeEl.classList.contains('arco-picker-range') &&
      rangeEl.querySelector('.arco-icon-clock-circle')
    )
  }

  function isTimePanelPopup(popup) {
    if (!popup || !popup.classList || !popup.classList.contains('arco-trigger-popup')) return false
    if (popup.querySelector('.arco-picker-range-container, .arco-picker-container, .arco-panel-date')) {
      return false
    }
    return !!popup.querySelector('.arco-timepicker-container')
  }

  function listTimePopups() {
    return [...document.querySelectorAll('.arco-trigger-popup')].filter(isTimePanelPopup)
  }

  function isLivePopup(popup) {
    if (!popup) return false
    const rect = popup.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) return true
    const z = Number(getComputedStyle(popup).zIndex)
    return Number.isFinite(z) && z > 0 && !!popup.style.left
  }

  /** Arco 算出的 left 必须落在该 TimeRange 触发器附近，否则是别的 TimePicker */
  function popupBelongsToRange(popup, rangeEl) {
    if (!popup || !rangeEl) return false
    const baseLeft = parseFloat(popup.style.left)
    if (!Number.isFinite(baseLeft)) return false
    const rect = rangeEl.getBoundingClientRect()
    const left = rect.left + window.pageXOffset
    const right = rect.right + window.pageXOffset
    const slack = Math.max(48, rect.width * 0.35)
    return baseLeft >= left - slack && baseLeft <= right + slack
  }

  function findTimePopupForRange(rangeEl, includePending) {
    const all = listTimePopups()
    if (!all.length || !rangeEl) return null
    const matched = all.filter((p) => popupBelongsToRange(p, rangeEl))
    const visible = matched.filter((p) => {
      const rect = p.getBoundingClientRect()
      return rect.width > 0 && rect.height > 0
    })
    if (visible.length) return visible[visible.length - 1]
    if (!includePending) return null
    const live = matched.filter(isLivePopup)
    if (live.length) return live[live.length - 1]
    // 首开瞬间 left 可能尚未写入，仅在 pending 时回退到「尚未被其它 range 认领」的候选
    if (pendingFirstOpen) {
      const pending = all.filter((p) => {
        if (!isLivePopup(p)) return false
        if (p.getAttribute('data-time-range-owned') === '1') return false
        const left = parseFloat(p.style.left)
        return !Number.isFinite(left) || popupBelongsToRange(p, rangeEl)
      })
      if (pending.length) return pending[pending.length - 1]
    }
    return null
  }

  function resolveInput(preferred) {
    if (preferred && preferred.isConnected && preferred.tagName === 'INPUT') {
      const range = preferred.closest('.arco-picker.arco-picker-range')
      if (isTimeRangePicker(range)) return preferred
    }
    const active = document.activeElement
    if (!active || active.tagName !== 'INPUT') return null
    const range = active.closest('.arco-picker.arco-picker-range')
    if (!isTimeRangePicker(range)) return null
    return active
  }

  function resolveRange(input) {
    const el = resolveInput(input)
    if (!el) return null
    return el.closest('.arco-picker.arco-picker-range')
  }

  function clearPopupAlign(popup) {
    if (!popup) return
    applying = true
    popup.style.removeProperty('transform')
    popup.style.removeProperty('animation')
    popup.style.removeProperty('transition')
    popup.style.removeProperty('visibility')
    popup.style.removeProperty('opacity')
    popup.removeAttribute('data-time-range-aligning')
    popup.removeAttribute('data-time-range-owned')
    queueMicrotask(() => {
      applying = false
    })
  }

  function applyAlign(popup, input) {
    const el = resolveInput(input)
    const range = el && el.closest('.arco-picker.arco-picker-range')
    if (!el || !popup || !isTimeRangePicker(range)) return false
    if (!popupBelongsToRange(popup, range) && popup.style.left) return false

    const baseLeft = parseFloat(popup.style.left)
    if (!Number.isFinite(baseLeft)) return false

    const target = el.getBoundingClientRect().left + window.pageXOffset
    const dx = target - baseLeft
    const next = Math.abs(dx) < 0.5 ? '' : `translateX(${dx}px)`
    const prev = !popup.style.transform || popup.style.transform === 'none' ? '' : popup.style.transform
    if (prev === next) return false

    applying = true
    popup.setAttribute('data-time-range-owned', '1')
    popup.style.setProperty('animation', 'none', 'important')
    popup.style.setProperty('transition', 'none', 'important')
    if (next) popup.style.transform = next
    else popup.style.removeProperty('transform')
    queueMicrotask(() => {
      applying = false
    })
    return true
  }

  function stopWatch() {
    if (styleMo) {
      styleMo.disconnect()
      styleMo = null
    }
    watchedPopup = null
  }

  function watchPopup(popup) {
    if (!popup || watchedPopup === popup) return
    stopWatch()
    watchedPopup = popup
    styleMo = new MutationObserver(() => {
      if (applying) return
      if (!popup.isConnected) {
        stopWatch()
        return
      }
      applyAlign(popup, lockInput)
    })
    styleMo.observe(popup, { attributes: true, attributeFilter: ['style'] })
  }

  function revealPopup(popup) {
    popup.style.removeProperty('visibility')
    popup.style.removeProperty('opacity')
    popup.removeAttribute('data-time-range-aligning')
  }

  function openAligned(popup, input) {
    if (!popup || !isTimePanelPopup(popup)) return
    const range = resolveRange(input)
    if (!range) return
    // left 已写出但不属于当前 TimeRange → 绝不是我们的弹层
    if (popup.style.left && !popupBelongsToRange(popup, range)) return

    pendingFirstOpen = false
    if (input) lockInput = input
    popup.setAttribute('data-time-range-aligning', '1')
    popup.setAttribute('data-time-range-owned', '1')
    popup.style.setProperty('animation', 'none', 'important')
    popup.style.setProperty('transition', 'none', 'important')
    popup.style.setProperty('visibility', 'hidden', 'important')
    popup.style.setProperty('opacity', '0', 'important')
    applyAlign(popup, input)
    watchPopup(popup)

    requestAnimationFrame(() => {
      applyAlign(popup, lockInput || input)
      revealPopup(popup)
      bumpLock(lockInput || input)
    })
  }

  function waitForLivePopup(input) {
    pendingFirstOpen = true
    lockInput = input
    const range = resolveRange(input)
    const until = performance.now() + 600
    cancelAnimationFrame(raf)
    const tick = () => {
      const popup = findTimePopupForRange(range, true)
      if (popup) {
        openAligned(popup, lockInput || input)
        return
      }
      if (pendingFirstOpen && performance.now() < until) raf = requestAnimationFrame(tick)
      else pendingFirstOpen = false
    }
    raf = requestAnimationFrame(tick)
  }

  function alignToInput(input) {
    const range = resolveRange(input)
    const popup = findTimePopupForRange(range, true)
    if (!popup) return
    if (popup.getAttribute('data-time-range-aligning') === '1') return
    watchPopup(popup)
    applyAlign(popup, input)
  }

  function bumpLock(input) {
    if (input) lockInput = input
    const until = performance.now() + 220
    cancelAnimationFrame(raf)
    const tick = () => {
      alignToInput(lockInput)
      if (performance.now() < until) raf = requestAnimationFrame(tick)
    }
    tick()
  }

  function releaseAlignState() {
    pendingFirstOpen = false
    cancelAnimationFrame(raf)
    raf = 0
    if (watchedPopup) clearPopupAlign(watchedPopup)
    stopWatch()
    lockInput = null
  }

  function onRangeInputEvent(e) {
    const input = e.target && e.target.closest && e.target.closest('.arco-picker-range .arco-picker-input input')
    if (!input) return
    const range = input.closest('.arco-picker.arco-picker-range')
    if (!isTimeRangePicker(range)) return

    lockInput = input
    const visible = findTimePopupForRange(range, false)
    if (visible) {
      pendingFirstOpen = false
      watchPopup(visible)
      bumpLock(input)
      return
    }
    waitForLivePopup(input)
  }

  /** 点到非 TimeRange 时释放锁，避免后续单列 TimePicker 被旧 lockInput 拉走 */
  function onForeignPointer(e) {
    const t = e.target
    if (!t || !t.closest) return
    if (t.closest('.arco-picker-range') && isTimeRangePicker(t.closest('.arco-picker-range'))) return
    if (t.closest('.arco-trigger-popup') && watchedPopup && watchedPopup.contains(t)) return
    if (!lockInput && !pendingFirstOpen && !watchedPopup) return
    // 延迟一帧：让 TimeRange 内部切换起/止输入框时不误清
    requestAnimationFrame(() => {
      const active = document.activeElement
      const activeRange = active && active.closest && active.closest('.arco-picker.arco-picker-range')
      if (isTimeRangePicker(activeRange)) return
      releaseAlignState()
    })
  }

  document.addEventListener('focusin', onRangeInputEvent, true)
  document.addEventListener('mousedown', onRangeInputEvent, true)
  document.addEventListener('mousedown', onForeignPointer, true)
  document.addEventListener('focusin', onForeignPointer, true)

  const mo = new MutationObserver((records) => {
    for (const rec of records) {
      for (const node of rec.removedNodes) {
        if (node === watchedPopup || (node.nodeType === 1 && watchedPopup && node.contains && node.contains(watchedPopup))) {
          stopWatch()
        }
      }
      for (const node of rec.addedNodes) {
        if (node.nodeType !== 1) continue
        let popup = null
        if (isTimePanelPopup(node)) popup = node
        else if (node.querySelector) {
          const inner = node.querySelector('.arco-timepicker-container')
          if (inner) popup = inner.closest('.arco-trigger-popup') || node
        }
        if (!popup || !isTimePanelPopup(popup)) continue
        if (!pendingFirstOpen) continue
        const range = resolveRange(lockInput)
        if (!range) {
          pendingFirstOpen = false
          continue
        }
        waitForLivePopup(lockInput)
        return
      }
    }
  })

  const start = () => {
    if (!document.body) return
    mo.observe(document.body, { childList: true, subtree: true })
  }
  if (document.body) start()
  else document.addEventListener('DOMContentLoaded', start)
})()

/**
 * Arco Modal/Drawer 锁 body 滚动后，视口变宽而 fixed 顶栏仍铺满，造成顶栏抖动。
 * 同步滚动条宽度到 --pro-scrollbar-compensation，供 layout.css 补偿。
 *
 * Firefox 注意：Arco 用 innerWidth - max(scrollWidth/…) 量滚动条，在 FF 上常得 0，
 * 只改 overflow 不缩 body；若再用 innerWidth - bodyWidth 回退也会是 0。
 * 因此需：未锁定时缓存宽度 + 探针测量，并在 body 未正确收窄时补 padding-right。
 */
;(function initOverlayScrollCompensation() {
  let locked = false
  let cachedSbw = 0
  let bodyPadApplied = false
  let prevBodyPaddingRight = ''

  function probeScrollbarWidth() {
    if (!document.body) return 0
    const outer = document.createElement('div')
    outer.style.cssText =
      'position:absolute;top:-9999px;width:100px;height:100px;overflow:scroll;visibility:hidden;pointer-events:none'
    document.body.appendChild(outer)
    const sbw = outer.offsetWidth - outer.clientWidth
    outer.remove()
    return Math.max(0, sbw)
  }

  function refreshCachedSbw() {
    if (document.body && document.body.style.overflow === 'hidden') return cachedSbw
    const live = window.innerWidth - document.documentElement.clientWidth
    if (live > 0) {
      cachedSbw = live
      return cachedSbw
    }
    const probed = probeScrollbarWidth()
    if (probed > 0) cachedSbw = probed
    return cachedSbw
  }

  function measureScrollbarWidth() {
    const live = window.innerWidth - document.documentElement.clientWidth
    if (live > 0) {
      cachedSbw = live
      return live
    }
    const widthStyle = document.body && document.body.style.width
    if (widthStyle && /px$/.test(widthStyle)) {
      const bodyWidth = parseFloat(widthStyle)
      if (bodyWidth > 0) {
        const fromBody = Math.round(window.innerWidth - bodyWidth)
        // Arco 在 Firefox 上 t3=0 时会把 width 设成接近 innerWidth，差分会是 0，不可信
        if (fromBody > 0) {
          cachedSbw = fromBody
          return fromBody
        }
      }
    }
    if (cachedSbw > 0) return cachedSbw
    // 锁定后 live/body 差分可能都是 0，探针仍能量到 classic/thin 滚动条宽度
    const probed = probeScrollbarWidth()
    if (probed > 0) cachedSbw = probed
    return cachedSbw
  }

  function reinforceBodyGutter(sbw) {
    if (!document.body || sbw <= 0 || bodyPadApplied) return
    // 页面搜索已自行 padding-right，避免叠加
    if (document.documentElement.classList.contains('is-page-search-open')) return

    const expected = window.innerWidth - sbw
    // Arco 正确缩宽时 body.offsetWidth ≈ expected；FF 失败时会接近 innerWidth
    if (document.body.offsetWidth <= expected + 1) return

    prevBodyPaddingRight = document.body.style.paddingRight || ''
    const currentPad = parseFloat(prevBodyPaddingRight) || 0
    document.body.style.paddingRight = currentPad + sbw + 'px'
    bodyPadApplied = true
  }

  function clearBodyGutter() {
    if (!bodyPadApplied || !document.body) return
    document.body.style.paddingRight = prevBodyPaddingRight
    prevBodyPaddingRight = ''
    bodyPadApplied = false
  }

  function applyCompensation(sbw) {
    document.documentElement.classList.add('is-scroll-locked')
    if (sbw > 0) {
      document.documentElement.style.setProperty('--pro-scrollbar-compensation', sbw + 'px')
      reinforceBodyGutter(sbw)
      // Firefox 下部分版本要等布局提交后 offsetWidth 才反映锁滚动后的变宽
      window.requestAnimationFrame(() => {
        if (document.body && document.body.style.overflow === 'hidden') {
          reinforceBodyGutter(sbw)
        }
      })
    }
  }

  function clearCompensation() {
    if (document.documentElement.classList.contains('is-page-search-open')) return
    clearBodyGutter()
    document.documentElement.classList.remove('is-scroll-locked')
    document.documentElement.style.removeProperty('--pro-scrollbar-compensation')
  }

  function sync() {
    if (!document.body) return
    if (document.documentElement.classList.contains('is-page-search-open')) return

    const isLocked = document.body.style.overflow === 'hidden'
    if (isLocked) {
      const sbw = measureScrollbarWidth()
      applyCompensation(sbw)
      locked = true
      return
    }
    if (locked) {
      locked = false
      clearCompensation()
      refreshCachedSbw()
    }
  }

  window.ArcoProScrollbar = {
    measure: measureScrollbarWidth,
    refresh: refreshCachedSbw,
    probe: probeScrollbarWidth,
  }

  const mo = new MutationObserver(sync)
  const start = () => {
    if (!document.body) return
    refreshCachedSbw()
    mo.observe(document.body, { attributes: true, attributeFilter: ['style'], childList: true })
    window.addEventListener('resize', refreshCachedSbw, { passive: true })
    sync()
  }
  if (document.body) start()
  else document.addEventListener('DOMContentLoaded', start)
})()

window.mountProPage = function mountProPage(config) {
  if (!AdminAuth.requireAuth()) return

  const { createApp } = Vue
  const ArcoVue = window.ArcoVue

  const app = createApp({
    components: {
      ProMenuTree: window.ProMenuTree,
      ProShellLogo: window.ProShellLogo,
      ProShellNavbarActions: window.ProShellNavbarActions,
      ProShellSider: window.ProShellSider,
      ProShellBreadcrumb: window.ProShellBreadcrumb,
      ProShellMainContent: window.ProShellMainContent,
      ProTabBar: window.ProTabBar,
      ...(config.components || {}),
    },
    data() {
      const collapsed = ArcoProMenuCollapse.getInitial()
      const themeColorId = ArcoProTheme.getInitialColorId()
      return {
        pageKey: config.pageKey,
        collapsed,
        selectedKeys: [config.pageKey],
        openKeys: collapsed ? [] : ArcoProRoutes.getDefaultOpenKeys(config.pageKey),
        dark: ArcoProTheme.getInitialDark(),
        themeColorId,
        layoutMode: ArcoProLayout.getInitialMode(),
        navbarScrolled: false,
        isNarrow: typeof window !== 'undefined' ? window.innerWidth <= 768 : false,
        mobileMenuOpen: false,
        menuRoutes: ArcoProRoutes,
        themeColor: ArcoProTheme.getThemeColor(themeColorId),
        themePresets: ArcoProTheme.presetList,
        showNavbar: ArcoProSettings.navbar,
        showMenu: ArcoProSettings.menu,
        showFooter: ArcoProSettings.footer,
        tabBarEnabled: ArcoProSettings.tabBar !== false,
        pageComponent: config.pageComponent || null,
        navbarLocale: ArcoProLocale.navbar,
        userInfo: AdminAuth.getUserInfo(),
        userSettingLocale: ArcoProLocale.userSetting,
        passwordModalVisible: false,
        passwordForm: {
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        },
        ...(typeof config.data === 'function' ? config.data() : {}),
      }
    },
    computed: {
      breadcrumbItems() {
        if (config.breadcrumb === false) return []
        return ArcoProRoutes.getBreadcrumb(this.pageKey)
      },
      breadcrumbIcon() {
        return ''
      },
      orgName() {
        return (
          (window.YunshuMock && YunshuMock.orgName) ||
          (this.userInfo && (this.userInfo.department || this.userInfo.orgName)) ||
          '本机构'
        )
      },
      breadcrumbInNavbar() {
        return (
          this.layoutMode === 'side' &&
          this.showNavbar &&
          !this.isNarrow &&
          this.breadcrumbItems.length > 0
        )
      },
      /** 多标签仅在上下布局（及窄屏顶栏壳）显示，左右布局隐藏 */
      showTabBar() {
        return this.tabBarEnabled && (this.layoutMode === 'top' || this.isNarrow)
      },
      menuWidth() {
        return this.collapsed
          ? ArcoProSettings.menuCollapsedWidth
          : ArcoProSettings.menuWidth
      },
    },
    watch: {
      menuWidth: {
        immediate: true,
        handler(w) {
          document.documentElement.style.setProperty('--shell-menu-width', w + 'px')
        },
      },
      layoutMode(mode) {
        this.syncSideNavbarScroll(mode)
        this.$nextTick(() => this.notifyLayoutChange(mode))
      },
    },
    methods: {
      syncSideNavbarScroll(mode) {
        this.teardownSideNavbarScroll()
        if (mode !== 'side') {
          this.navbarScrolled = false
          return
        }
        const onScroll = () => {
          this.navbarScrolled = window.scrollY > 0
        }
        this._sideNavbarScroll = onScroll
        window.addEventListener('scroll', onScroll, { passive: true })
        onScroll()
      },
      teardownSideNavbarScroll() {
        if (this._sideNavbarScroll) {
          window.removeEventListener('scroll', this._sideNavbarScroll)
          this._sideNavbarScroll = null
        }
      },
      menuLabel(name) {
        return (window.ArcoProLocale && ArcoProLocale.menu && ArcoProLocale.menu[name]) || name
      },
      handleMenuClick(key) {
        const href = ArcoProPageHref[key]
        if (!href) return
        this.selectedKeys = [key]
        if (this.isNarrow) this.mobileMenuOpen = false
        const current = window.location.pathname.split('/').pop() || 'dashboard.html'
        if (href !== current) {
          if (window.ArcoProPageProgress) ArcoProPageProgress.navigate(href)
          else window.location.href = href
        }
      },
      handleCollapse(collapsed) {
        this.collapsed = collapsed
        ArcoProMenuCollapse.persist(collapsed)
        if (collapsed) this.openKeys = []
      },
      syncNarrowViewport() {
        const narrow = window.innerWidth <= 768
        this.isNarrow = narrow
        if (!narrow) this.mobileMenuOpen = false
      },
      toggleMobileMenu() {
        this.mobileMenuOpen = !this.mobileMenuOpen
        if (this.mobileMenuOpen) this.collapsed = false
      },
      resetPasswordForm() {
        this.passwordForm = {
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        }
      },
      openPasswordModal() {
        this.resetPasswordForm()
        this.$nextTick(() => {
          this.passwordModalVisible = true
        })
      },
      closePasswordModal() {
        this.passwordModalVisible = false
      },
      submitPasswordModal() {
        const t = this.userSettingLocale
        const form = this.passwordForm
        if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
          ArcoVue.Message.warning(t.securityFormRequired)
          return
        }
        if (form.newPassword !== form.confirmPassword) {
          ArcoVue.Message.warning(t.securityPasswordMismatch)
          return
        }
        this.passwordModalVisible = false
        ArcoVue.Message.success(t.securitySaveSuccess)
      },
      handleUserMenuClick(key) {
        if (key === 'logout') {
          const nb = this.navbarLocale
          ArcoVue.Modal.confirm({
            simple: true,
            titleAlign: 'start',
            modalClass: 'pro-confirm-modal',
            width: 360,
            title: nb.logoutConfirmTitle,
            content: nb.logoutConfirmContent,
            okText: nb.logoutConfirmOk,
            cancelText: nb.logoutCancel,
            okButtonProps: { status: 'danger' },
            onOk: () => {
              AdminAuth.logout()
            },
          })
        } else if (key === 'home' || key === 'setting') {
          ArcoVue.Message.info('本期原型不包含个人中心')
        } else if (key === 'password') {
          this.openPasswordModal()
        } else ArcoVue.Message.info('点击了：' + key)
      },
      toggleTheme() {
        this.dark = ArcoProTheme.toggleDark(this.dark)
        ArcoVue.Message.info(
          this.dark ? this.navbarLocale.themeDark : this.navbarLocale.themeLight
        )
      },
      changeThemeColor(id) {
        const preset = ArcoProTheme.setColor(id)
        this.themeColorId = id
        this.themeColor = preset.hex
        ArcoVue.Message.info(this.navbarLocale.themeColorSwitched + '：' + preset.label)
      },
      notifyLayoutChange(mode) {
        const fire = () => {
          window.dispatchEvent(new Event('resize'))
          window.dispatchEvent(new CustomEvent('arco-pro-layout-change', { detail: { mode } }))
          if (window.ProShadcnCharts && typeof ProShadcnCharts.refreshAll === 'function') {
            ProShadcnCharts.refreshAll()
          }
        }
        requestAnimationFrame(() => requestAnimationFrame(fire))
      },
      toggleLayoutMode() {
        const next = ArcoProLayout.toggle(this.layoutMode)
        this.layoutMode = next
        ArcoVue.Message.info(
          next === 'side'
            ? this.navbarLocale.layoutSwitchedSide
            : this.navbarLocale.layoutSwitchedTop
        )
      },
      ...(config.methods || {}),
    },
    mounted() {
      this.syncSideNavbarScroll(this.layoutMode)
      this.syncNarrowViewport()
      this._onNarrowResize = () => this.syncNarrowViewport()
      window.addEventListener('resize', this._onNarrowResize)
      this._onThemeChange = (e) => {
        if (e && e.detail && e.detail.type === 'mode') this.dark = !!e.detail.dark
      }
      window.addEventListener('arco-pro-theme-change', this._onThemeChange)
      if (typeof config.mounted === 'function') config.mounted.call(this)
    },
    beforeUnmount() {
      this.teardownSideNavbarScroll()
      if (this._onNarrowResize) window.removeEventListener('resize', this._onNarrowResize)
      if (this._onThemeChange) window.removeEventListener('arco-pro-theme-change', this._onThemeChange)
    },
    template: window.ProShellTemplate,
  })

  app.use(ArcoVue)
  app.use(window.ArcoVueIcon)
  // 必填星号随标签对齐：右对齐 → 文字前(start)；左对齐 / 纵向 → 文字后(end)。
  // Arco 默认 labelAlign=right、asteriskPosition=start；左对齐表单请显式 asterisk-position="end"。
  const formItem = ArcoVue.FormItem || (ArcoVue.Form && ArcoVue.Form.Item)
  if (formItem && formItem.props && formItem.props.asteriskPosition) {
    formItem.props.asteriskPosition.default = 'start'
  }
  /** 浏览器 Tab 标题后缀（对照 admin/src/utils/page-title.ts APP_PAGE_TITLE） */
  const APP_PAGE_TITLE = (window.YunshuBrand && YunshuBrand.appTitle) || '云数中台'
  if (config.title) {
    document.title = config.title + ' - ' + APP_PAGE_TITLE
  }
  app.mount('#app')
}
