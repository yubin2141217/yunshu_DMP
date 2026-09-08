/**
 * 多标签通栏（对齐 admin TabBar）：仅上下布局 / 窄屏显示，localStorage 跨页持久化
 */
;(function () {
  const DEFAULT_PAGE_KEY = 'dashboard/workplace'
  const STORAGE_BASE_KEY = 'arco-pro-tab-bar'

  const Eaction = {
    reload: 'reload',
    current: 'current',
    left: 'left',
    right: 'right',
    others: 'others',
    all: 'all',
  }

  function storageKey() {
    const ctx = window.ArcoProPreviewContext
    return ctx && typeof ctx.storageKey === 'function'
      ? ctx.storageKey(STORAGE_BASE_KEY)
      : STORAGE_BASE_KEY
  }

  function menuLocale(key) {
    const menu = (window.ArcoProLocale && ArcoProLocale.menu) || {}
    return menu[key] || key
  }

  function getMenuLocaleKey(pageKey) {
    function walk(nodes) {
      for (let i = 0; i < (nodes || []).length; i += 1) {
        const node = nodes[i]
        if (node.key === pageKey) return node.name
        if (node.children) {
          const hit = walk(node.children)
          if (hit) return hit
        }
      }
      return null
    }
    return walk(window.ArcoProRoutes) || pageKey
  }

  function hrefOf(pageKey) {
    return (window.ArcoProPageHref && ArcoProPageHref[pageKey]) || pageKey + '.html'
  }

  function makeTag(pageKey) {
    return {
      title: getMenuLocaleKey(pageKey),
      name: pageKey,
      fullPath: pageKey,
      href: hrefOf(pageKey),
    }
  }

  const DEFAULT_TAG = makeTag(DEFAULT_PAGE_KEY)

  function isValidTag(tag) {
    return !!(tag && tag.name && tag.fullPath && tag.title)
  }

  function normalizeTagList(tags) {
    const seen = new Set()
    const rest = []
    ;(tags || []).forEach((tag) => {
      if (!isValidTag(tag)) return
      if (tag.name === DEFAULT_PAGE_KEY || tag.fullPath === DEFAULT_PAGE_KEY) return
      if (seen.has(tag.fullPath)) return
      seen.add(tag.fullPath)
      rest.push({
        title: tag.title,
        name: tag.name,
        fullPath: tag.fullPath,
        href: tag.href || hrefOf(tag.name),
      })
    })
    return [Object.assign({}, DEFAULT_TAG), ...rest]
  }

  function readStoredTagList() {
    try {
      const raw = localStorage.getItem(storageKey())
      if (!raw) return [Object.assign({}, DEFAULT_TAG)]
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return [Object.assign({}, DEFAULT_TAG)]
      return normalizeTagList(parsed)
    } catch {
      return [Object.assign({}, DEFAULT_TAG)]
    }
  }

  function persistTagList(tags) {
    try {
      localStorage.setItem(storageKey(), JSON.stringify(tags))
    } catch {
      /* ignore */
    }
  }

  function notifyChange() {
    document.dispatchEvent(new CustomEvent('arco-pro-tab-bar-change'))
  }

  const store = {
    tagList: readStoredTagList(),
    persist() {
      persistTagList(this.tagList)
    },
    getTabList() {
      return this.tagList
    },
    ensureTag(pageKey) {
      if (!pageKey) return
      if (this.tagList.some((t) => t.fullPath === pageKey)) return
      this.tagList.push(makeTag(pageKey))
      this.persist()
    },
    deleteTag(idx) {
      if (idx <= 0 || idx >= this.tagList.length) return null
      const removed = this.tagList.splice(idx, 1)[0]
      this.persist()
      notifyChange()
      return removed
    },
    freshTabList(tags) {
      this.tagList = normalizeTagList(tags)
      this.persist()
      notifyChange()
    },
    resetTabList() {
      this.tagList = [Object.assign({}, DEFAULT_TAG)]
      this.persist()
      notifyChange()
    },
  }

  window.ArcoProTabBar = {
    DEFAULT_PAGE_KEY,
    store,
    makeTag,
    menuLocale,
    go(tag) {
      if (!tag) return
      const href = tag.href || hrefOf(tag.name || tag.fullPath)
      const current = window.location.pathname.split('/').pop() || ''
      if (href !== current) {
        if (window.ArcoProPageProgress) ArcoProPageProgress.navigate(href)
        else window.location.href = href
      }
    },
    reset() {
      store.resetTabList()
    },
  }

  window.ProTabItem = {
    name: 'ProTabItem',
    props: {
      itemData: { type: Object, default: () => ({}) },
      index: { type: Number, default: 0 },
      activePath: { type: String, default: '' },
    },
    data() {
      return { Eaction }
    },
    computed: {
      t() {
        return (window.ArcoProLocale && ArcoProLocale.tabBar) || {}
      },
      tagList() {
        return store.getTabList()
      },
      label() {
        return menuLocale(this.itemData.title)
      },
      isActive() {
        return this.itemData.fullPath === this.activePath
      },
      disabledReload() {
        return this.itemData.fullPath !== this.activePath
      },
      disabledCurrent() {
        return this.index === 0
      },
      disabledLeft() {
        return this.index === 0 || this.index === 1
      },
      disabledRight() {
        return this.index === this.tagList.length - 1
      },
    },
    methods: {
      goto() {
        ArcoProTabBar.go(this.itemData)
      },
      tagClose() {
        const idx = this.index
        const wasActive = this.isActive
        store.deleteTag(idx)
        if (wasActive) {
          const latest = store.getTabList()[Math.max(0, idx - 1)]
          ArcoProTabBar.go(latest)
        }
      },
      findCurrentRouteIndex() {
        return this.tagList.findIndex((el) => el.fullPath === this.activePath)
      },
      actionSelect(value) {
        const { itemData, index } = this
        const copyTagList = store.getTabList().slice()
        if (value === Eaction.current) {
          this.tagClose()
        } else if (value === Eaction.left) {
          const currentRouteIdx = this.findCurrentRouteIndex()
          copyTagList.splice(1, index - 1)
          store.freshTabList(copyTagList)
          if (currentRouteIdx < index) ArcoProTabBar.go(itemData)
        } else if (value === Eaction.right) {
          const currentRouteIdx = this.findCurrentRouteIndex()
          copyTagList.splice(index + 1)
          store.freshTabList(copyTagList)
          if (currentRouteIdx > index) ArcoProTabBar.go(itemData)
        } else if (value === Eaction.others) {
          store.freshTabList(store.getTabList().filter((_, idx) => idx === 0 || idx === index))
          ArcoProTabBar.go(itemData)
        } else if (value === Eaction.reload) {
          window.location.reload()
        } else {
          store.resetTabList()
          ArcoProTabBar.go(store.getTabList()[0])
        }
      },
    },
    template: `
      <a-dropdown
        trigger="contextMenu"
        content-class="pro-tab-dropdown"
        :popup-max-height="false"
        :popup-style="{ minWidth: 'unset', width: 'max-content' }"
        @select="actionSelect"
      >
        <button
          type="button"
          class="pro-tab-item"
          :class="{ 'is-active': isActive, 'is-affix': index === 0 }"
          @click="goto"
        >
          <icon-dashboard v-if="index === 0" class="pro-tab-item-icon" :size="14" />
          <span class="pro-tab-item-label">{{ label }}</span>
          <span v-if="index !== 0" class="pro-tab-item-close" @click.stop="tagClose">
            <icon-close :size="10" />
          </span>
        </button>
        <template #content>
          <a-doption :disabled="disabledReload" :value="Eaction.reload">
            <icon-refresh class="pro-tab-dropdown-icon" />
            <span>{{ t.reload || '重新加载' }}</span>
          </a-doption>
          <a-doption class="pro-tab-dropdown-split" :disabled="disabledCurrent" :value="Eaction.current">
            <icon-close class="pro-tab-dropdown-icon" />
            <span>{{ t.closeCurrent || '关闭当前' }}</span>
          </a-doption>
          <a-doption :disabled="disabledLeft" :value="Eaction.left">
            <icon-to-left class="pro-tab-dropdown-icon" />
            <span>{{ t.closeLeft || '关闭左侧' }}</span>
          </a-doption>
          <a-doption class="pro-tab-dropdown-split" :disabled="disabledRight" :value="Eaction.right">
            <icon-to-right class="pro-tab-dropdown-icon" />
            <span>{{ t.closeRight || '关闭右侧' }}</span>
          </a-doption>
          <a-doption :value="Eaction.others">
            <icon-swap class="pro-tab-dropdown-icon" />
            <span>{{ t.closeOthers || '关闭其它' }}</span>
          </a-doption>
          <a-doption :value="Eaction.all">
            <icon-folder-delete class="pro-tab-dropdown-icon" />
            <span>{{ t.closeAll || '关闭全部' }}</span>
          </a-doption>
        </template>
      </a-dropdown>
    `,
  }

  window.ProTabBar = {
    name: 'ProTabBar',
    components: {
      ProTabItem: window.ProTabItem,
    },
    props: {
      pageKey: { type: String, required: true },
      showNavbar: { type: Boolean, default: true },
    },
    data() {
      return {
        tagList: store.getTabList().slice(),
        showNavArrows: false,
        canScrollLeft: false,
        canScrollRight: false,
      }
    },
    computed: {
      stickyTop() {
        return this.showNavbar ? 'var(--shell-navbar-height)' : '0px'
      },
      t() {
        return (window.ArcoProLocale && ArcoProLocale.tabBar) || {}
      },
    },
    watch: {
      pageKey: {
        immediate: true,
        handler(key) {
          store.ensureTag(key)
          this.refreshFromStore()
        },
      },
    },
    mounted() {
      this._onResize = () => this.updateArrowState()
      this._onStoreChange = () => this.refreshFromStore()
      window.addEventListener('resize', this._onResize)
      document.addEventListener('arco-pro-tab-bar-change', this._onStoreChange)
      if (typeof ResizeObserver !== 'undefined') {
        this._ro = new ResizeObserver(() => this.updateArrowState())
        this.$nextTick(() => {
          if (this.$refs.scrollRef) this._ro.observe(this.$refs.scrollRef)
          if (this.$refs.wrapRef) this._ro.observe(this.$refs.wrapRef)
          this.updateArrowState()
        })
      } else {
        this.updateArrowState()
      }
    },
    beforeUnmount() {
      window.removeEventListener('resize', this._onResize)
      document.removeEventListener('arco-pro-tab-bar-change', this._onStoreChange)
      if (this._ro) this._ro.disconnect()
    },
    methods: {
      menuLocale,
      refreshFromStore() {
        this.tagList = store.getTabList().slice()
        this.$nextTick(() => this.scrollActiveIntoView())
      },
      updateArrowState() {
        const el = this.$refs.scrollRef
        if (!el) {
          this.showNavArrows = false
          this.canScrollLeft = false
          this.canScrollRight = false
          return
        }
        const max = el.scrollWidth - el.clientWidth
        const overflow = max > 1
        this.showNavArrows = overflow
        this.canScrollLeft = overflow && el.scrollLeft > 1
        this.canScrollRight = overflow && el.scrollLeft < max - 1
      },
      scrollBy(direction) {
        const el = this.$refs.scrollRef
        if (!el) return
        if (direction < 0 && !this.canScrollLeft) return
        if (direction > 0 && !this.canScrollRight) return
        const step = Math.max(160, Math.floor(el.clientWidth * 0.6))
        el.scrollBy({ left: direction * step, behavior: 'smooth' })
      },
      scrollActiveIntoView() {
        const el = this.$refs.scrollRef
        const wrap = this.$refs.wrapRef
        if (!el || !wrap) return
        const active = wrap.querySelector('.pro-tab-item.is-active')
        if (!active) {
          this.updateArrowState()
          return
        }
        const left = active.offsetLeft
        const right = left + active.offsetWidth
        const viewLeft = el.scrollLeft
        const viewRight = viewLeft + el.clientWidth
        if (left < viewLeft) el.scrollTo({ left, behavior: 'smooth' })
        else if (right > viewRight) el.scrollTo({ left: right - el.clientWidth, behavior: 'smooth' })
        this.updateArrowState()
      },
      onSelectTab(fullPath) {
        const tag = this.tagList.find((item) => item.fullPath === fullPath)
        if (tag) ArcoProTabBar.go(tag)
      },
    },
    template: `
      <div class="tab-bar-container" :style="{ top: stickyTop }">
        <div class="tab-bar-box">
          <button
            v-show="showNavArrows"
            type="button"
            class="tab-bar-nav"
            :disabled="!canScrollLeft"
            :aria-label="t.scrollLeft || '向左滚动标签'"
            @click="scrollBy(-1)"
          >
            <icon-left :size="12" />
          </button>
          <div ref="scrollRef" class="tab-bar-scroll" @scroll="updateArrowState">
            <div ref="wrapRef" class="tags-wrap">
              <pro-tab-item
                v-for="(tag, index) in tagList"
                :key="tag.fullPath"
                :index="index"
                :item-data="tag"
                :active-path="pageKey"
              />
            </div>
          </div>
          <button
            v-show="showNavArrows"
            type="button"
            class="tab-bar-nav"
            :disabled="!canScrollRight"
            :aria-label="t.scrollRight || '向右滚动标签'"
            @click="scrollBy(1)"
          >
            <icon-right :size="12" />
          </button>
          <a-dropdown
            v-if="tagList.length > 1"
            trigger="click"
            position="br"
            :popup-max-height="320"
            @select="onSelectTab"
          >
            <button type="button" class="tab-bar-nav tab-bar-nav--more" :aria-label="t.allTabs || '全部标签'">
              <icon-down :size="12" />
            </button>
            <template #content>
              <a-doption
                v-for="tag in tagList"
                :key="tag.fullPath"
                :value="tag.fullPath"
                :class="{ 'is-active-tab': tag.fullPath === pageKey }"
              >
                {{ menuLocale(tag.title) }}
              </a-doption>
            </template>
          </a-dropdown>
        </div>
      </div>
    `,
  }
})()
