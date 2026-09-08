;(function () {
  function arcoProStorageKey(key) {
    const ctx = window.ArcoProPreviewContext
    return ctx && typeof ctx.storageKey === 'function' ? ctx.storageKey(key) : key
  }

  const LAYOUT_STORAGE_KEY = arcoProStorageKey('arco-pro-layout-mode')
  const MENU_COLLAPSE_STORAGE_KEY = arcoProStorageKey('arco-pro-menu-collapsed')

  window.ArcoProMenuCollapse = {
    storageKey: MENU_COLLAPSE_STORAGE_KEY,
    getInitial() {
      if (ArcoProSettings.layoutPersist === false) return false
      try {
        return localStorage.getItem(MENU_COLLAPSE_STORAGE_KEY) === '1'
      } catch (e) {
        /* ignore */
      }
      return false
    },
    persist(collapsed) {
      if (ArcoProSettings.layoutPersist === false) return
      try {
        localStorage.setItem(MENU_COLLAPSE_STORAGE_KEY, collapsed ? '1' : '0')
      } catch (e) {
        /* ignore */
      }
    },
  }

  window.ArcoProLayout = {
    storageKey: LAYOUT_STORAGE_KEY,
    getInitialMode() {
      const fallback = ArcoProSettings.layoutMode === 'side' ? 'side' : 'top'
      if (ArcoProSettings.layoutPersist === false) return fallback
      try {
        const stored = localStorage.getItem(LAYOUT_STORAGE_KEY)
        if (stored === 'top' || stored === 'side') return stored
      } catch (e) {
        /* ignore */
      }
      return fallback
    },
    persist(mode) {
      if (ArcoProSettings.layoutPersist === false) return
      try {
        localStorage.setItem(LAYOUT_STORAGE_KEY, mode)
      } catch (e) {
        /* ignore */
      }
    },
    toggle(mode) {
      const next = mode === 'top' ? 'side' : 'top'
      this.persist(next)
      return next
    },
  }

  document.documentElement.style.setProperty(
    '--shell-logo-width',
    ArcoProSettings.menuWidth + 'px'
  )
  document.documentElement.style.setProperty(
    '--shell-menu-width',
    (ArcoProMenuCollapse.getInitial()
      ? ArcoProSettings.menuCollapsedWidth
      : ArcoProSettings.menuWidth) + 'px'
  )

  window.ProMenuTree = {
    name: 'ProMenuTree',
    props: {
      routes: { type: Array, required: true },
      level: { type: Number, default: 0 },
      collapsed: { type: Boolean, default: false },
    },
    methods: {
      iconFor(key) {
        return ArcoProRoutes.getIconComponent(key)
      },
      labelFor(name) {
        return ArcoProLocale.menu[name] || name
      },
    },
    template: `
      <template v-for="item in routes" :key="item.key">
        <a-sub-menu v-if="Array.isArray(item.children)" :key="item.key">
          <template v-if="level === 0" #icon><component :is="iconFor(item.key)" class="pro-menu-item-icon" :size="collapsed ? 16 : 14" /></template>
          <template #title>{{ labelFor(item.name) }}</template>
          <pro-menu-tree v-if="item.children.length" :routes="item.children" :level="level + 1" :collapsed="collapsed" />
        </a-sub-menu>
        <a-menu-item v-else :key="item.key">
          <template v-if="level === 0" #icon><component :is="iconFor(item.key)" class="pro-menu-item-icon" :size="collapsed ? 16 : 14" /></template>
          {{ labelFor(item.name) }}
        </a-menu-item>
      </template>
    `,
  }

  window.ProShellLogo = {
    name: 'ProShellLogo',
    props: {
      collapsed: { type: Boolean, default: false },
    },
    computed: {
      logoText() {
        return (window.YunshuBrand && YunshuBrand.logoText) || '云数中台'
      },
    },
    template: `
      <div class="pro-logo" :class="{ 'is-collapsed': collapsed }">
        <span class="pro-logo-mark" aria-hidden="true">
          <icon-logo class="pro-logo-mark-icon" />
        </span>
        <span v-if="!collapsed" class="pro-logo-text">{{ logoText }}</span>
      </div>
    `,
  }

  window.ProShellNavbarActions = {
    name: 'ProShellNavbarActions',
    props: {
      navbarLocale: { type: Object, required: true },
      themeColor: { type: String, required: true },
      themeColorId: { type: String, default: 'indigo' },
      themePresets: { type: Array, default: () => [] },
      userInfo: { type: Object, required: true },
      dark: { type: Boolean, default: false },
      layoutMode: { type: String, default: 'top' },
      isNarrow: { type: Boolean, default: false },
      showMenuToggle: { type: Boolean, default: false },
      mobileMenuOpen: { type: Boolean, default: false },
    },
    emits: ['toggleTheme', 'toggleLayout', 'changeThemeColor', 'userMenuClick', 'toggleMobileMenu'],
    data() {
      return {
        menuToggleTipVisible: false,
        pageSearchVisible: false,
        pageSearchQuery: '',
        pageSearchActiveIndex: 0,
        chartPaletteId: 'theme',
        chartPalettes: [],
        messageTab: 'message',
        messageItems: [
          {
            id: 'm1',
            icon: 'icon-message',
            tone: 'primary',
            title: '郑曦月 回复了你',
            content: '此处内容需要有一定长度，方便看效果。',
            time: '今天 12:30:01',
            unread: true,
          },
          {
            id: 'm2',
            icon: 'icon-message',
            tone: 'success',
            title: '宁波 关注了你',
            content: '此处内容需要有一定长度，方便看效果。',
            time: '今天 10:00:15',
            unread: true,
          },
          {
            id: 'm3',
            icon: 'icon-message',
            tone: 'warning',
            title: '内容中心 催更提醒',
            content: '你的内容还未更新，请及时更新。',
            time: '昨天 20:15:00',
            unread: true,
          },
        ],
        noticeItems: [
          {
            id: 'n1',
            icon: 'icon-notification',
            tone: 'primary',
            title: '内容发布审核通过',
            content: '你提交的《每日推荐视频集》已通过审核。',
            time: '今天 09:12:00',
            unread: true,
          },
          {
            id: 'n2',
            icon: 'icon-exclamation-circle',
            tone: 'danger',
            title: '系统维护通知',
            content: '本周六 02:00–04:00 进行例行维护。',
            time: '昨天 18:00:00',
            unread: true,
          },
          {
            id: 'n3',
            icon: 'icon-info-circle',
            tone: 'success',
            title: '新功能上线',
            content: '消息中心支持批量已读，欢迎体验。',
            time: '前天 11:20:00',
            unread: false,
          },
        ],
        todoItems: [
          {
            id: 't1',
            icon: 'icon-calendar',
            tone: 'warning',
            title: '质检工单待处理',
            content: 'WO2026080003 待你受理',
            time: '今天 08:00:00',
            unread: true,
          },
          {
            id: 't2',
            icon: 'icon-check-circle',
            tone: 'primary',
            title: '周报待提交',
            content: '本周工作周报尚未提交',
            time: '今天 07:30:00',
            unread: true,
          },
          {
            id: 't3',
            icon: 'icon-clock-circle',
            tone: 'danger',
            title: '合同即将到期',
            content: '澜海传媒合同将于 3 天后到期',
            time: '昨天 16:40:00',
            unread: true,
          },
        ],
      }
    },
    computed: {
      layoutToggleLabel() {
        return this.layoutMode === 'top'
          ? this.navbarLocale.layoutSide
          : this.navbarLocale.layoutTop
      },
      themeToggleLabel() {
        return this.dark
          ? this.navbarLocale.themeToggleLight
          : this.navbarLocale.themeToggleDark
      },
      layoutToggleIcon() {
        return this.layoutMode === 'top' ? 'icon-layout-side' : 'icon-layout-top'
      },
      menuToggleLabel() {
        return this.mobileMenuOpen
          ? this.navbarLocale.closeMenu
          : this.navbarLocale.openMenu
      },
      unreadMessageCount() {
        return this.messageItems.filter((item) => item.unread).length
      },
      unreadNoticeCount() {
        return this.noticeItems.filter((item) => item.unread).length
      },
      unreadTodoCount() {
        return this.todoItems.filter((item) => item.unread).length
      },
      unreadTotal() {
        return this.unreadMessageCount + this.unreadNoticeCount + this.unreadTodoCount
      },
      activeMessageList() {
        if (this.messageTab === 'notice') return this.noticeItems
        if (this.messageTab === 'todo') return this.todoItems
        return this.messageItems
      },
      pageSearchShortcutLabel() {
        const ua = navigator.userAgent || ''
        const platform = navigator.platform || ''
        const isMac = /Mac|iPhone|iPad|iPod/.test(platform) || /Mac OS X/.test(ua)
        return isMac ? '⌘+K' : 'Ctrl+K'
      },
      pageSearchItems() {
        const menuLocale = (window.ArcoProLocale && window.ArcoProLocale.menu) || {}
        const hrefMap = window.ArcoProPageHref || {}
        const getIcon =
          window.ArcoProRoutes && typeof window.ArcoProRoutes.getIconComponent === 'function'
            ? window.ArcoProRoutes.getIconComponent
            : () => 'icon-file'
        const flatten = (routes, parents) => {
          const list = []
          ;(routes || []).forEach((route) => {
            const label = menuLocale[route.name] || route.name
            if (Array.isArray(route.children) && route.children.length) {
              list.push(...flatten(route.children, parents.concat(label)))
              return
            }
            const href = route.href || hrefMap[route.key]
            if (!href) return
            list.push({
              key: route.key,
              href,
              title: label,
              group: parents.join(' / '),
              icon: getIcon(route.key),
            })
          })
          return list
        }
        return flatten(window.ArcoProRoutes || [], [])
      },
      filteredPageSearchItems() {
        const q = String(this.pageSearchQuery || '')
          .trim()
          .toLowerCase()
        if (!q) return this.pageSearchItems
        return this.pageSearchItems.filter((item) => {
          const hay = [item.title, item.group, item.key].join(' ').toLowerCase()
          return hay.includes(q)
        })
      },
    },
    watch: {
      mobileMenuOpen(open) {
        if (open) this.menuToggleTipVisible = false
      },
      pageSearchQuery() {
        this.pageSearchActiveIndex = 0
      },
      pageSearchVisible(visible) {
        if (!visible) {
          this.pageSearchQuery = ''
          this.pageSearchActiveIndex = 0
          this.unlockPageScroll()
          return
        }
        this.lockPageScroll()
        this.$nextTick(() => {
          window.setTimeout(() => {
            const input = this.$refs.pageSearchInput
            if (input && typeof input.focus === 'function') {
              input.focus()
              return
            }
            const el = document.querySelector('.pro-page-search-dialog .arco-input')
            if (el) el.focus()
          }, 40)
        })
      },
      filteredPageSearchItems(list) {
        if (this.pageSearchActiveIndex >= list.length) {
          this.pageSearchActiveIndex = Math.max(0, list.length - 1)
        }
      },
    },
    mounted() {
      this.syncChartPalettes()
      this._onChartPalette = () => this.syncChartPalettes()
      window.addEventListener('arco-pro-chart-palette-change', this._onChartPalette)
      window.addEventListener('arco-pro-theme-change', this._onChartPalette)
      this._onGlobalPageSearchKeydown = (event) => {
        if (!(event.metaKey || event.ctrlKey)) return
        if (String(event.key || '').toLowerCase() !== 'k') return
        event.preventDefault()
        if (this.pageSearchVisible) this.closePageSearch()
        else this.openPageSearch()
      }
      window.addEventListener('keydown', this._onGlobalPageSearchKeydown)
    },
    beforeUnmount() {
      if (this._onChartPalette) {
        window.removeEventListener('arco-pro-chart-palette-change', this._onChartPalette)
        window.removeEventListener('arco-pro-theme-change', this._onChartPalette)
        this._onChartPalette = null
      }
      if (this._onGlobalPageSearchKeydown) {
        window.removeEventListener('keydown', this._onGlobalPageSearchKeydown)
        this._onGlobalPageSearchKeydown = null
      }
      this.unlockPageScroll()
    },
    methods: {
      onMenuToggleTipChange(visible) {
        this.menuToggleTipVisible = this.mobileMenuOpen ? false : visible
      },
      onToggleMobileMenu(event) {
        this.menuToggleTipVisible = false
        const el = event && (event.currentTarget || event.target)
        if (el && typeof el.blur === 'function') el.blur()
        this.$emit('toggleMobileMenu')
      },
      syncChartPalettes() {
        const api = window.ArcoProChartPalette
        if (!api) {
          this.chartPalettes = []
          return
        }
        this.chartPaletteId = api.getCurrentId()
        this.chartPalettes = api.schemes.map((scheme) => {
          const display = api.schemeForDisplay(scheme)
          return {
            id: scheme.id,
            title: String(scheme.title || '').replace(/^方案 [A-Z] · /, ''),
            colors: (display.colors || []).slice(0, 5).map((c) => c.hex),
          }
        })
      },
      changeChartPalette(id) {
        const api = window.ArcoProChartPalette
        if (!api) return
        const result = api.set(id)
        this.syncChartPalettes()
        const title = (result && result.scheme && result.scheme.title) || id
        if (window.ArcoVue && ArcoVue.Message) {
          ArcoVue.Message.info(this.navbarLocale.chartPaletteSwitched + '：' + title)
        }
      },
      switchLayoutMode() {
        this.$emit('toggleLayout')
      },
      markItemRead(item) {
        item.unread = false
      },
      clearUnread() {
        ;[this.messageItems, this.noticeItems, this.todoItems].forEach((list) => {
          list.forEach((item) => {
            item.unread = false
          })
        })
        if (window.ArcoVue && ArcoVue.Message) {
          ArcoVue.Message.success(this.navbarLocale.messageCleared)
        }
      },
      viewMoreMessages() {
        if (window.ArcoProPageProgress) ArcoProPageProgress.navigate('message-list.html')
        else window.location.href = 'message-list.html'
      },
      lockPageScroll() {
        if (this._pageScrollLocked) return
        const api = window.ArcoProScrollbar
        const sbw = api && typeof api.measure === 'function'
          ? api.measure()
          : Math.max(0, window.innerWidth - document.documentElement.clientWidth)
        this._pageScrollPrev = {
          overflow: document.body.style.overflow,
          paddingRight: document.body.style.paddingRight,
        }
        document.body.style.overflow = 'hidden'
        if (sbw > 0) {
          document.body.style.paddingRight = `${sbw}px`
          document.documentElement.style.setProperty('--pro-scrollbar-compensation', `${sbw}px`)
        }
        document.documentElement.classList.add('is-page-search-open')
        document.documentElement.classList.add('is-scroll-locked')
        this._pageScrollLocked = true
      },
      unlockPageScroll() {
        if (!this._pageScrollLocked) return
        const prev = this._pageScrollPrev || {}
        document.body.style.overflow = prev.overflow || ''
        document.body.style.paddingRight = prev.paddingRight || ''
        document.documentElement.classList.remove('is-page-search-open')
        document.documentElement.classList.remove('is-scroll-locked')
        document.documentElement.style.removeProperty('--pro-scrollbar-compensation')
        this._pageScrollLocked = false
        this._pageScrollPrev = null
      },
      openPageSearch() {
        this.pageSearchVisible = true
        this.pageSearchQuery = ''
        this.pageSearchActiveIndex = 0
        this.lockPageScroll()
      },
      closePageSearch() {
        this.pageSearchVisible = false
        this.unlockPageScroll()
      },
      goToPage(item) {
        if (!item || !item.href) return
        this.closePageSearch()
        const current = window.location.pathname.split('/').pop() || 'dashboard.html'
        if (item.href !== current) {
          if (window.ArcoProPageProgress) ArcoProPageProgress.navigate(item.href)
          else window.location.href = item.href
        }
      },
      movePageSearchActive(delta) {
        const total = this.filteredPageSearchItems.length
        if (!total) return
        this.pageSearchActiveIndex = (this.pageSearchActiveIndex + delta + total) % total
        this.$nextTick(() => {
          const el = this.$refs.pageSearchActiveItem
          const node = Array.isArray(el) ? el[0] : el
          if (node && typeof node.scrollIntoView === 'function') {
            node.scrollIntoView({ block: 'nearest' })
          }
        })
      },
      onPageSearchKeydown(event) {
        if (event.key === 'ArrowDown') {
          event.preventDefault()
          this.movePageSearchActive(1)
          return
        }
        if (event.key === 'ArrowUp') {
          event.preventDefault()
          this.movePageSearchActive(-1)
          return
        }
        if (event.key === 'Enter') {
          event.preventDefault()
          const item = this.filteredPageSearchItems[this.pageSearchActiveIndex]
          if (item) this.goToPage(item)
          return
        }
        if (event.key === 'Escape') {
          event.preventDefault()
          this.closePageSearch()
        }
      },
    },
    template: `
      <ul class="pro-navbar-right">
        <li v-if="showMenuToggle" class="pro-navbar-item">
          <a-tooltip
            :content="menuToggleLabel"
            position="bottom"
            :popup-visible="menuToggleTipVisible"
            :disabled="mobileMenuOpen"
            @popup-visible-change="onMenuToggleTipChange"
          >
            <a-button
              type="text"
              class="pro-nav-icon-btn"
              :aria-label="menuToggleLabel"
              @click="onToggleMobileMenu"
            >
              <template #icon><icon-menu class="pro-nav-icon" /></template>
            </a-button>
          </a-tooltip>
        </li>
        <li class="pro-navbar-item">
          <button type="button" class="pro-page-search-trigger pro-page-search-trigger--full" @click="openPageSearch">
            <icon-search class="pro-nav-icon" />
            <span class="pro-page-search-trigger-text">{{ navbarLocale.searchPh }}</span>
            <kbd class="pro-page-search-kbd">{{ pageSearchShortcutLabel }}</kbd>
          </button>
          <a-button
            type="text"
            class="pro-nav-icon-btn pro-page-search-trigger--icon"
            :aria-label="navbarLocale.searchPh"
            @click="openPageSearch"
          >
            <template #icon><icon-search class="pro-nav-icon" /></template>
          </a-button>
          <Teleport to="body">
            <div
              v-if="pageSearchVisible"
              class="pro-page-search-overlay"
              @mousedown.self="closePageSearch"
            >
              <div
                class="pro-page-search-dialog"
                role="dialog"
                aria-modal="true"
                @keydown="onPageSearchKeydown"
              >
                <div class="pro-page-search-panel">
                  <a-input
                    ref="pageSearchInput"
                    v-model="pageSearchQuery"
                    class="pro-page-search-input"
                    :placeholder="navbarLocale.pageSearchPh || navbarLocale.searchPh"
                    allow-clear
                    @keydown="onPageSearchKeydown"
                  >
                    <template #prefix><icon-search class="pro-nav-icon" /></template>
                  </a-input>
                  <div class="pro-page-search-list" role="listbox">
                    <button
                      v-for="(item, index) in filteredPageSearchItems"
                      :key="item.key"
                      :ref="index === pageSearchActiveIndex ? 'pageSearchActiveItem' : undefined"
                      type="button"
                      class="pro-page-search-item"
                      :class="{ 'is-active': index === pageSearchActiveIndex }"
                      role="option"
                      :aria-selected="index === pageSearchActiveIndex"
                      @mouseenter="pageSearchActiveIndex = index"
                      @click="goToPage(item)"
                    >
                      <component :is="item.icon" class="pro-page-search-item-icon" />
                      <span class="pro-page-search-item-meta">
                        <span class="pro-page-search-item-title">{{ item.title }}</span>
                        <span v-if="item.group" class="pro-page-search-item-group">{{ item.group }}</span>
                      </span>
                      <span class="pro-page-search-item-enter" aria-hidden="true">
                        <icon-enter />
                      </span>
                    </button>
                    <div v-if="!filteredPageSearchItems.length" class="pro-page-search-empty">
                      {{ navbarLocale.pageSearchEmpty }}
                    </div>
                  </div>
                  <div class="pro-page-search-footer">
                    <span class="pro-page-search-hint">
                      <span class="pro-page-search-hint-keys">
                        <kbd class="pro-page-search-hint-key"><icon-enter /></kbd>
                      </span>
                      <span class="pro-page-search-hint-label">{{ navbarLocale.pageSearchHintSelect }}</span>
                    </span>
                    <span class="pro-page-search-hint">
                      <span class="pro-page-search-hint-keys">
                        <kbd class="pro-page-search-hint-key"><icon-caret-up /></kbd>
                        <kbd class="pro-page-search-hint-key"><icon-caret-down /></kbd>
                      </span>
                      <span class="pro-page-search-hint-label">{{ navbarLocale.pageSearchHintNavigate }}</span>
                    </span>
                    <span class="pro-page-search-hint">
                      <span class="pro-page-search-hint-keys">
                        <kbd class="pro-page-search-hint-key pro-page-search-hint-key--text">ESC</kbd>
                      </span>
                      <span class="pro-page-search-hint-label">{{ navbarLocale.pageSearchHintClose }}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Teleport>
        </li>
        <li v-if="!isNarrow" class="pro-navbar-item">
          <a-tooltip :content="layoutToggleLabel" position="bottom">
            <a-button
              type="text"
              class="pro-nav-icon-btn pro-nav-layout-toggle"
              :aria-label="layoutToggleLabel"
              @click="switchLayoutMode"
            >
              <template #icon><component :is="layoutToggleIcon" class="pro-nav-icon" /></template>
            </a-button>
          </a-tooltip>
        </li>
        <li class="pro-navbar-item">
          <a-dropdown trigger="click" position="br" content-class="pro-theme-dropdown">
            <a-tooltip :content="navbarLocale.themeColorPick" position="bottom">
              <a-button type="text" class="pro-nav-icon-btn pro-theme-color-btn" :aria-label="navbarLocale.themeColorPick">
                <template #icon>
                  <icon-palette class="pro-nav-icon pro-theme-palette-icon" :style="{ '--theme-swatch': themeColor }" />
                </template>
              </a-button>
            </a-tooltip>
            <template #content>
              <a-doption
                v-for="preset in themePresets"
                :key="preset.id"
                class="pro-theme-preset-item"
                :class="{ 'pro-theme-preset-active': preset.id === themeColorId }"
                @click="$emit('changeThemeColor', preset.id)"
              >
                <span class="pro-theme-preset-dot" :style="{ '--preset-color': preset.hex }"></span>
                <span class="pro-theme-preset-label">{{ preset.label }}</span>
              </a-doption>
            </template>
          </a-dropdown>
        </li>
        <li class="pro-navbar-item">
          <a-dropdown trigger="click" position="br" content-class="pro-theme-dropdown pro-chart-palette-dropdown">
            <a-tooltip :content="navbarLocale.chartPalettePick" position="bottom">
              <a-button type="text" class="pro-nav-icon-btn" :aria-label="navbarLocale.chartPalettePick">
                <template #icon><icon-chart-column class="pro-nav-icon" /></template>
              </a-button>
            </a-tooltip>
            <template #content>
              <a-doption
                v-for="preset in chartPalettes"
                :key="preset.id"
                class="pro-theme-preset-item"
                :class="{ 'pro-theme-preset-active': preset.id === chartPaletteId }"
                @click="changeChartPalette(preset.id)"
              >
                <span class="pro-chart-palette-swatches">
                  <span
                    v-for="(hex, i) in preset.colors"
                    :key="preset.id + '-' + i"
                    class="pro-chart-palette-swatch"
                    :style="{ '--swatch-color': hex }"
                  ></span>
                </span>
                <span class="pro-theme-preset-label">{{ preset.title }}</span>
              </a-doption>
            </template>
          </a-dropdown>
        </li>
        <li class="pro-navbar-item">
          <a-tooltip :content="themeToggleLabel" position="bottom">
            <a-button type="text" class="pro-nav-icon-btn" :aria-label="themeToggleLabel" @click="$emit('toggleTheme')">
              <template #icon>
                <icon-moon-fill v-if="dark" class="pro-nav-icon" />
                <icon-sun-fill v-else class="pro-nav-icon" />
              </template>
            </a-button>
          </a-tooltip>
        </li>
        <li class="pro-navbar-item">
          <a-popover
            trigger="hover"
            position="br"
            content-class="pro-message-popover"
            :content-style="{ padding: 0 }"
            :arrow-style="{ display: 'none' }"
          >
            <a-badge :count="unreadTotal" :offset="[2, 2]" :max-count="99">
              <a-button type="text" class="pro-nav-icon-btn" :aria-label="navbarLocale.message">
                <template #icon><icon-notification class="pro-nav-icon" /></template>
              </a-button>
            </a-badge>
            <template #content>
              <div class="pro-message-panel">
                <a-tabs v-model:active-key="messageTab" size="large" class="pro-message-tabs" :header-padding="false" :animation="false">
                  <a-tab-pane key="message">
                    <template #title>
                      <span class="pro-message-tab-title">
                        <span class="pro-message-tab-label">{{ navbarLocale.tabMessage }}</span>
                        <span class="pro-message-tab-count" :class="{ 'is-empty': !unreadMessageCount }">{{ unreadMessageCount || 0 }}</span>
                      </span>
                    </template>
                  </a-tab-pane>
                  <a-tab-pane key="notice">
                    <template #title>
                      <span class="pro-message-tab-title">
                        <span class="pro-message-tab-label">{{ navbarLocale.tabNotice }}</span>
                        <span class="pro-message-tab-count" :class="{ 'is-empty': !unreadNoticeCount }">{{ unreadNoticeCount || 0 }}</span>
                      </span>
                    </template>
                  </a-tab-pane>
                  <a-tab-pane key="todo">
                    <template #title>
                      <span class="pro-message-tab-title">
                        <span class="pro-message-tab-label">{{ navbarLocale.tabTodo }}</span>
                        <span class="pro-message-tab-count" :class="{ 'is-empty': !unreadTodoCount }">{{ unreadTodoCount || 0 }}</span>
                      </span>
                    </template>
                  </a-tab-pane>
                </a-tabs>
                <div class="pro-message-list">
                  <button
                    v-for="item in activeMessageList"
                    :key="item.id"
                    type="button"
                    class="pro-message-item"
                    :class="{ 'is-unread': item.unread }"
                    @click="markItemRead(item)"
                  >
                    <a-avatar :size="36" class="pro-message-avatar" :class="'is-' + item.tone">
                      <component :is="item.icon" />
                    </a-avatar>
                    <div class="pro-message-body">
                      <div class="pro-message-title">{{ item.title }}</div>
                      <div class="pro-message-content">{{ item.content }}</div>
                      <div class="pro-message-time">{{ item.time }}</div>
                    </div>
                    <span v-if="item.unread" class="pro-message-dot" aria-hidden="true"></span>
                  </button>
                  <div v-if="!activeMessageList.length" class="pro-message-empty">
                    {{ navbarLocale.messageEmpty }}
                  </div>
                </div>
                <div class="pro-message-footer">
                  <a-link @click="clearUnread">{{ navbarLocale.messageClear }}</a-link>
                  <a-link @click="viewMoreMessages">{{ navbarLocale.messageViewMore }}</a-link>
                </div>
              </div>
            </template>
          </a-popover>
        </li>
        <li class="pro-navbar-item pro-navbar-item--user">
          <a-dropdown :trigger="['hover', 'click']" position="br" content-class="pro-user-dropdown">
            <span class="pro-navbar-user" :aria-label="userInfo.name">
              <a-avatar :size="32" class="pro-avatar-brand pro-avatar-default" :auto-fix-font-size="false">
                <icon-avatar />
              </a-avatar>
            </span>
            <template #content>
              <div class="pro-user-panel">
                <div class="pro-user-panel-header">
                  <a-avatar :size="36" class="pro-avatar-brand pro-avatar-default pro-user-panel-avatar" :auto-fix-font-size="false">
                    <icon-avatar />
                  </a-avatar>
                  <div class="pro-user-panel-meta">
                    <div class="pro-user-panel-name">{{ userInfo.name }}</div>
                    <div class="pro-user-panel-account">{{ userInfo.email || 'wanglq@company.com' }}</div>
                  </div>
                </div>
                <div class="pro-user-panel-menu">
                  <a-doption @click="$emit('userMenuClick', 'home')">
                    <icon-home class="pro-dropdown-icon" /> {{ navbarLocale.userHome }}
                  </a-doption>
                  <a-doption @click="$emit('userMenuClick', 'setting')">
                    <icon-settings class="pro-dropdown-icon" /> {{ navbarLocale.userSetting }}
                  </a-doption>
                  <a-doption @click="$emit('userMenuClick', 'password')">
                    <icon-lock class="pro-dropdown-icon" /> {{ navbarLocale.changePassword }}
                  </a-doption>
                </div>
                <div class="pro-user-panel-footer">
                  <a-doption class="pro-user-panel-logout" @click="$emit('userMenuClick', 'logout')">
                    <icon-poweroff class="pro-dropdown-icon" /> {{ navbarLocale.logout }}
                  </a-doption>
                </div>
              </div>
            </template>
          </a-dropdown>
        </li>
      </ul>
    `,
  }

  window.ProShellSider = {
    name: 'ProShellSider',
    components: {
      ProShellLogo: window.ProShellLogo,
      ProMenuTree: window.ProMenuTree,
    },
    props: {
      showMenu: { type: Boolean, default: true },
      showBrand: { type: Boolean, default: false },
      collapsed: { type: Boolean, default: false },
      menuWidth: { type: Number, required: true },
      selectedKeys: { type: Array, required: true },
      openKeys: { type: Array, required: true },
      menuRoutes: { type: Array, required: true },
      drawerMode: { type: Boolean, default: false },
    },
    emits: ['menuClick', 'collapse', 'closeDrawer', 'update:selectedKeys', 'update:openKeys', 'update:collapsed'],
    computed: {
      menuCollapsedWidth() {
        return ArcoProSettings.menuCollapsedWidth
      },
    },
    methods: {
      onCollapsedChange(collapsed) {
        if (this.drawerMode) {
          this.$emit('closeDrawer')
          return
        }
        this.$emit('update:collapsed', collapsed)
      },
      onCollapse(collapsed) {
        if (this.drawerMode) return
        this.$emit('collapse', collapsed)
      },
    },
    template: `
      <aside
        v-if="showMenu"
        class="pro-sider"
        :class="{ 'is-collapsed': collapsed }"
        :style="{ '--sider-width': menuWidth + 'px' }"
      >
        <div v-if="showBrand" class="pro-sider-brand">
          <pro-shell-logo :collapsed="collapsed" />
        </div>
        <div class="pro-sider-inner">
          <div class="pro-menu-wrapper">
            <a-menu
              class="pro-sider-menu"
              :selected-keys="selectedKeys"
              :open-keys="openKeys"
              :collapsed="collapsed"
              :collapsed-width="menuCollapsedWidth"
              :level-indent="34"
              :show-collapse-button="!drawerMode"
              :popup-max-height="400"
              :trigger-props="{ position: 'rt', getPopupContainer: () => document.body }"
              @update:selected-keys="$emit('update:selectedKeys', $event)"
              @update:open-keys="$emit('update:openKeys', $event)"
              @update:collapsed="onCollapsedChange"
              @menu-item-click="$emit('menuClick', $event)"
              @collapse="onCollapse"
            >
              <template #expand-icon-down>
                <icon-down class="pro-menu-arrow-icon" :size="10" />
              </template>
              <template #collapse-icon="{ collapsed: menuCollapsed }">
                <icon-menu-unfold v-if="menuCollapsed" class="pro-menu-collapse-icon" :size="14" />
                <icon-menu-fold v-else class="pro-menu-collapse-icon" :size="14" />
              </template>
              <pro-menu-tree :routes="menuRoutes" :collapsed="collapsed" />
            </a-menu>
          </div>
        </div>
      </aside>
    `,
  }

  window.ProShellBreadcrumb = {
    name: 'ProShellBreadcrumb',
    props: {
      items: { type: Array, default: () => [] },
      icon: { type: String, default: '' },
      maxCount: { type: Number, default: 0 },
    },
    template: `
      <div v-if="items && items.length" class="pro-breadcrumb">
        <component
          v-if="icon"
          :is="icon"
          class="pro-breadcrumb-icon"
          :size="12"
        />
        <a-breadcrumb :max-count="maxCount">
          <a-breadcrumb-item v-for="(item, i) in items" :key="i">{{ item }}</a-breadcrumb-item>
        </a-breadcrumb>
      </div>
    `,
  }

  window.ProShellMainContent = {
    name: 'ProShellMainContent',
    components: {
      ProShellBreadcrumb: window.ProShellBreadcrumb,
    },
    props: {
      breadcrumbItems: { type: Array, default: () => [] },
      breadcrumbIcon: { type: String, default: '' },
      pageComponent: { default: null },
      showFooter: { type: Boolean, default: true },
      showBreadcrumb: { type: Boolean, default: true },
    },
    template: `
      <div class="pro-content-wrapper">
        <pro-shell-breadcrumb
          v-if="showBreadcrumb"
          :items="breadcrumbItems"
          :icon="breadcrumbIcon"
        />
        <component :is="pageComponent" v-if="pageComponent" />
        <footer v-if="showFooter" class="pro-footer">© 2026 VibePM  产品经理智能协作平台</footer>
      </div>
    `,
  }

  window.ProShellTemplate = `
    <div
      class="pro-layout-root"
      :class="{ 'is-narrow': isNarrow, 'is-mobile-menu-open': mobileMenuOpen }"
    >
      <div
        v-if="isNarrow && mobileMenuOpen"
        class="pro-mobile-mask"
        @click="mobileMenuOpen = false"
      ></div>
      <div
        class="pro-layout"
        :class="isNarrow || layoutMode === 'top' ? 'pro-layout--top' : 'pro-layout--side'"
      >
        <header v-if="showNavbar && (layoutMode === 'top' || isNarrow)" class="pro-navbar pro-navbar--global">
          <div class="pro-navbar-left">
            <pro-shell-logo :collapsed="false" />
          </div>
          <pro-shell-navbar-actions
            :navbar-locale="navbarLocale"
            :theme-color="themeColor"
            :theme-color-id="themeColorId"
            :theme-presets="themePresets"
            :user-info="userInfo"
            :dark="dark"
            :layout-mode="layoutMode"
            :is-narrow="isNarrow"
            :show-menu-toggle="isNarrow && showMenu"
            :mobile-menu-open="mobileMenuOpen"
            @toggleTheme="toggleTheme"
            @toggleLayout="toggleLayoutMode"
            @changeThemeColor="changeThemeColor"
            @userMenuClick="handleUserMenuClick"
            @toggleMobileMenu="toggleMobileMenu"
          />
        </header>
        <div class="pro-body">
          <pro-shell-sider
            :show-menu="showMenu"
            :show-brand="isNarrow || layoutMode === 'side'"
            :drawer-mode="isNarrow"
            v-model:collapsed="collapsed"
            v-model:selected-keys="selectedKeys"
            v-model:open-keys="openKeys"
            :menu-width="menuWidth"
            :menu-routes="menuRoutes"
            @menu-click="handleMenuClick"
            @collapse="handleCollapse"
            @closeDrawer="mobileMenuOpen = false"
          />
          <div
            :class="[
              isNarrow || layoutMode === 'top' ? 'pro-stage' : 'pro-main',
              {
                'pro-stage--full': (layoutMode === 'top' || isNarrow) && !showMenu,
                'pro-main--full': layoutMode === 'side' && !isNarrow && !showMenu,
              },
            ]"
          >
            <header
              v-if="showNavbar && layoutMode === 'side' && !isNarrow"
              class="pro-navbar pro-navbar--embedded"
              :class="{ 'is-scrolled': navbarScrolled }"
            >
              <div class="mt-navbar-lead">
                <a-button type="text" class="pro-nav-icon-btn" aria-label="展开或收起菜单" @click="toggleSider">
                  <template #icon><icon-menu class="pro-nav-icon" /></template>
                </a-button>
                <span class="mt-navbar-title">{{ productTitle }}</span>
              </div>
              <pro-shell-navbar-actions
                :navbar-locale="navbarLocale"
                :theme-color="themeColor"
                :theme-color-id="themeColorId"
                :theme-presets="themePresets"
                :user-info="userInfo"
                :dark="dark"
                :layout-mode="layoutMode"
                :is-narrow="isNarrow"
                :show-menu-toggle="isNarrow && showMenu"
                :mobile-menu-open="mobileMenuOpen"
                @toggleTheme="toggleTheme"
                @toggleLayout="toggleLayoutMode"
                @changeThemeColor="changeThemeColor"
                @userMenuClick="handleUserMenuClick"
                @toggleMobileMenu="toggleMobileMenu"
              />
            </header>
            <main class="pro-content">
              <pro-tab-bar
                v-if="showTabBar"
                :page-key="pageKey"
                :show-navbar="showNavbar"
              />
              <pro-shell-main-content
                :breadcrumb-items="breadcrumbItems"
                :breadcrumb-icon="breadcrumbIcon"
                :page-component="pageComponent"
                :show-footer="showFooter"
                :show-breadcrumb="!breadcrumbInNavbar"
              />
            </main>
          </div>
        </div>
      </div>
      <a-modal
        :visible="passwordModalVisible"
        :title="navbarLocale.changePassword"
        :width="480"
        :mask-closable="false"
        unmount-on-close
        modal-class="pro-password-modal"
        @ok="submitPasswordModal"
        @cancel="closePasswordModal"
      >
        <a-form :model="passwordForm" layout="vertical">
          <a-form-item :label="userSettingLocale.securityOldPassword" required>
            <a-input-password
              v-model="passwordForm.oldPassword"
              :placeholder="userSettingLocale.securityOldPasswordPlaceholder"
              allow-clear
            />
          </a-form-item>
          <a-form-item :label="userSettingLocale.securityNewPassword" required>
            <a-input-password
              v-model="passwordForm.newPassword"
              :placeholder="userSettingLocale.securityNewPasswordPlaceholder"
              allow-clear
            />
          </a-form-item>
          <a-form-item :label="userSettingLocale.securityConfirmPassword" required>
            <a-input-password
              v-model="passwordForm.confirmPassword"
              :placeholder="userSettingLocale.securityConfirmPasswordPlaceholder"
              allow-clear
            />
          </a-form-item>
        </a-form>
      </a-modal>
    </div>
  `
})()
