/**
 * Font Awesome 7 Pro 图标适配层（替换 @arco-design/web-vue/icon）
 * 全站 Sharp Light：fa-sharp + fa-light（weight 300）
 * 侧栏折叠按钮（icon-menu-fold / icon-menu-unfold）单独使用 Sharp Regular（400）
 * Logo 单独使用 Classic Solid（900）统计图标
 */
;(function () {
  const FA_STYLE = 'fa-sharp fa-light'
  const FA_STYLE_MENU_TOGGLE = 'fa-sharp fa-regular'
  const FA_STYLE_LOGO = 'fa-solid'

  const FA_ICON_MAP = {
    'icon-dashboard': `${FA_STYLE} fa-chart-column`,
    'icon-home': `${FA_STYLE} fa-house`,
    'icon-apps': `${FA_STYLE} fa-table-cells-large`,
    'icon-list': `${FA_STYLE} fa-list`,
    'icon-settings': `${FA_STYLE} fa-gear`,
    'icon-drag-dot-vertical': `${FA_STYLE_LOGO} fa-grip-dots-vertical`,
    'icon-file': `${FA_STYLE} fa-file-lines`,
    'icon-check': `${FA_STYLE} fa-check`,
    'icon-check-circle': `${FA_STYLE} fa-circle-check`,
    'icon-exclamation-circle': `${FA_STYLE} fa-circle-exclamation`,
    'icon-user': `${FA_STYLE} fa-user`,
    'icon-user-group': `${FA_STYLE} fa-users`,
    'icon-user-circle': `${FA_STYLE} fa-user-circle`,
    'icon-user-large': `${FA_STYLE} fa-user-large`,
    'icon-credit-card': `${FA_STYLE} fa-credit-card`,
    'icon-activity': `${FA_STYLE} fa-chart-line`,
    'icon-chart-area': `${FA_STYLE} fa-chart-area`,
    'icon-chart-column': `${FA_STYLE} fa-chart-column`,
    'icon-briefcase': `${FA_STYLE} fa-briefcase`,
    'icon-handshake': `${FA_STYLE} fa-handshake`,
    'icon-bounce': `${FA_STYLE} fa-arrow-trend-down`,
    'icon-percent': `${FA_STYLE} fa-percent`,
    /* 数据概览 KPI：Classic Solid 实心 */
    'icon-yen-solid': `${FA_STYLE_LOGO} fa-yen-sign`,
    'icon-user-solid': `${FA_STYLE_LOGO} fa-user`,
    'icon-user-group-solid': `${FA_STYLE_LOGO} fa-users`,
    'icon-credit-card-solid': `${FA_STYLE_LOGO} fa-credit-card`,
    'icon-activity-solid': `${FA_STYLE_LOGO} fa-chart-line`,
    'icon-chart-area-solid': `${FA_STYLE_LOGO} fa-chart-area`,
    'icon-chart-column-solid': `${FA_STYLE_LOGO} fa-chart-column`,
    'icon-percent-solid': `${FA_STYLE_LOGO} fa-percent`,
    'icon-briefcase-solid': `${FA_STYLE_LOGO} fa-briefcase`,
    'icon-handshake-solid': `${FA_STYLE_LOGO} fa-handshake`,
    'icon-bounce-solid': `${FA_STYLE_LOGO} fa-right-from-bracket`,
    'icon-clock-solid': `${FA_STYLE_LOGO} fa-clock`,
    /* 头像展示：Classic Solid，与全站 Sharp Light 细线区分更明显 */
    'icon-avatar': `${FA_STYLE_LOGO} fa-user`,
    'icon-search': `${FA_STYLE} fa-magnifying-glass`,
    'icon-palette': `${FA_STYLE} fa-palette`,
    'icon-moon-fill': `${FA_STYLE} fa-moon`,
    'icon-sun-fill': `${FA_STYLE} fa-sun-bright`,
    'icon-notification': `${FA_STYLE} fa-bell`,
    'icon-poweroff': `${FA_STYLE} fa-power-off`,
    'icon-storage': `${FA_STYLE} fa-database`,
    'icon-fire': `${FA_STYLE} fa-fire`,
    'icon-mobile': `${FA_STYLE} fa-mobile-screen-button`,
    'icon-desktop': `${FA_STYLE} fa-desktop`,
    'icon-tablet': `${FA_STYLE} fa-tablet-screen-button`,
    'icon-tv': `${FA_STYLE} fa-tv`,
    'icon-ellipsis': `${FA_STYLE} fa-ellipsis`,
    'icon-email': `${FA_STYLE} fa-envelope`,
    'icon-safe': `${FA_STYLE} fa-shield-halved`,
    'icon-tool': `${FA_STYLE} fa-screwdriver-wrench`,
    'icon-caret-up': `${FA_STYLE} fa-caret-up`,
    'icon-caret-down': `${FA_STYLE} fa-caret-down`,
    'icon-caret-up-fill': `${FA_STYLE_LOGO} fa-caret-up`,
    'icon-caret-down-fill': `${FA_STYLE_LOGO} fa-caret-down`,
    'icon-down': `${FA_STYLE} fa-chevron-down`,
    'icon-up': `${FA_STYLE} fa-chevron-up`,
    'icon-arrow-up-right': `${FA_STYLE} fa-arrow-up-right`,
    'icon-arrow-down-right': `${FA_STYLE} fa-arrow-down-right`,
    'icon-trending-up': `${FA_STYLE} fa-arrow-trend-up`,
    'icon-trending-down': `${FA_STYLE} fa-arrow-trend-down`,
    'icon-filter': `${FA_STYLE} fa-filter`,
    'icon-close': `${FA_STYLE} fa-xmark`,
    'icon-menu': `${FA_STYLE} fa-bars`,
    'icon-menu-fold': `${FA_STYLE_MENU_TOGGLE} fa-outdent`,
    'icon-menu-unfold': `${FA_STYLE_MENU_TOGGLE} fa-indent`,
    'icon-refresh': `${FA_STYLE} fa-arrows-rotate`,
    'icon-line-height': `${FA_STYLE} fa-text-height`,
    'icon-plus': `${FA_STYLE} fa-plus`,
    'icon-plus-circle': `${FA_STYLE} fa-plus-circle`,
    'icon-minus': `${FA_STYLE} fa-minus`,
    'icon-edit': `${FA_STYLE} fa-pen`,
    'icon-delete': `${FA_STYLE} fa-trash`,
    'icon-drag-dot': `${FA_STYLE} fa-bars`,
    'icon-download': `${FA_STYLE} fa-download`,
    'icon-upload': `${FA_STYLE} fa-upload`,
    'icon-camera': `${FA_STYLE} fa-camera`,
    'icon-info-circle': `${FA_STYLE_LOGO} fa-circle-info`,
    'icon-eye': `${FA_STYLE} fa-eye`,
    'icon-lock': `${FA_STYLE} fa-lock`,
    'icon-layout-top': `${FA_STYLE} fa-table-layout`,
    'icon-layout-side': `${FA_STYLE} fa-sidebar`,
    'icon-logo': `${FA_STYLE_LOGO} fa-bolt`,
    'icon-message': `${FA_STYLE} fa-message`,
    'icon-bold': `${FA_STYLE} fa-bold`,
    'icon-italic': `${FA_STYLE} fa-italic`,
    'icon-underline': `${FA_STYLE} fa-underline`,
    'icon-strikethrough': `${FA_STYLE} fa-strikethrough`,
    'icon-align-left': `${FA_STYLE} fa-align-left`,
    'icon-align-center': `${FA_STYLE} fa-align-center`,
    'icon-align-right': `${FA_STYLE} fa-align-right`,
    'icon-ordered-list': `${FA_STYLE} fa-list-ol`,
    'icon-link': `${FA_STYLE} fa-link`,
    'icon-undo': `${FA_STYLE} fa-rotate-left`,
    'icon-redo': `${FA_STYLE} fa-rotate-right`,
    'icon-eraser': `${FA_STYLE} fa-eraser`,
    'icon-location': `${FA_STYLE} fa-location-dot`,
    'icon-bug': `${FA_STYLE} fa-bug`,
    'icon-calendar': `${FA_STYLE} fa-calendar`,
    'icon-clock-circle': `${FA_STYLE} fa-clock`,
    'icon-folder': `${FA_STYLE} fa-folder`,
    'icon-folder-open': `${FA_STYLE} fa-folder-open`,
    'icon-image': `${FA_STYLE} fa-image`,
    'icon-video-camera': `${FA_STYLE} fa-video`,
    'icon-file-audio': `${FA_STYLE} fa-file-audio`,
    'icon-star': `${FA_STYLE} fa-star`,
    'icon-star-fill': `${FA_STYLE_LOGO} fa-star`,
    'icon-tag': `${FA_STYLE} fa-tag`,
    'icon-left': `${FA_STYLE} fa-chevron-left`,
    'icon-right': `${FA_STYLE} fa-chevron-right`,
    'icon-to-left': `${FA_STYLE} fa-arrow-left-to-line`,
    'icon-to-right': `${FA_STYLE} fa-arrow-right-to-line`,
    'icon-swap': `${FA_STYLE} fa-arrow-right-arrow-left`,
    'icon-folder-delete': `${FA_STYLE} fa-folder-minus`,
    'icon-double-left': `${FA_STYLE} fa-angles-left`,
    'icon-double-right': `${FA_STYLE} fa-angles-right`,
    'icon-enter': `${FA_STYLE} fa-arrow-turn-down-left`,
  }

  function defineFaIcon(name, faClass) {
    return {
      name,
      inheritAttrs: false,
      props: {
        size: { type: [Number, String], default: null },
      },
      computed: {
        iconClasses() {
          const extra = this.$attrs.class
          const list = ['pro-fa-icon', ...faClass.trim().split(/\s+/)]
          if (extra) {
            if (typeof extra === 'string') list.push(extra)
            else if (Array.isArray(extra)) list.push(...extra)
            else Object.keys(extra).forEach((k) => extra[k] && list.push(k))
          }
          return list
        },
        iconStyle() {
          const base = {}
          const attrStyle = this.$attrs.style
          if (attrStyle && typeof attrStyle === 'object') Object.assign(base, attrStyle)
          if (this.size != null) {
            base.fontSize = typeof this.size === 'number' ? this.size + 'px' : String(this.size)
          }
          return base
        },
      },
      template: '<i :class="iconClasses" :style="iconStyle" aria-hidden="true"></i>',
    }
  }

  const ProFaIcons = {
    style: FA_STYLE,
    map: FA_ICON_MAP,
    install(app) {
      Object.entries(FA_ICON_MAP).forEach(([name, faClass]) => {
        app.component(name, defineFaIcon(name, faClass))
      })
      app.component('icon-avatar-user', defineFaIcon('icon-avatar-user', 'fa-light fa-user'))
    },
  }

  /**
   * Arco Table 表头排序/筛选图标在组件包内写死为 SVG，无法通过 app.component 覆盖。
   * 在 DOM 中注入 FA webfont 图标并隐藏原 SVG。
   */
  function ensureFaTableIcon(svg, faClass, fontSize) {
    if (!svg || !svg.parentNode) return
    const parent = svg.parentNode
    let icon = null
    for (let i = 0; i < parent.children.length; i++) {
      const el = parent.children[i]
      if (el.classList && el.classList.contains('pro-fa-icon') && el.dataset.faTableIcon === '1') {
        icon = el
        break
      }
    }
    if (!icon) {
      icon = document.createElement('i')
      icon.className = 'pro-fa-icon ' + faClass
      icon.dataset.faTableIcon = '1'
      icon.setAttribute('aria-hidden', 'true')
      parent.insertBefore(icon, svg)
    } else {
      icon.className = 'pro-fa-icon ' + faClass
    }
    icon.style.fontSize = fontSize
    svg.dataset.faPatched = '1'
    svg.setAttribute('aria-hidden', 'true')
    svg.style.display = 'none'
  }

  function patchArcoTableHeaderIcons(root) {
    const scope = root && root.querySelectorAll ? root : document
    scope.querySelectorAll('.arco-table-sorter-icon .arco-icon-caret-up').forEach((el) => {
      ensureFaTableIcon(el, 'fa-sharp fa-solid fa-caret-up', '10px')
    })
    scope.querySelectorAll('.arco-table-sorter-icon .arco-icon-caret-down').forEach((el) => {
      ensureFaTableIcon(el, 'fa-sharp fa-solid fa-caret-down', '10px')
    })
    scope.querySelectorAll('.arco-table-filters .arco-icon-filter').forEach((el) => {
      ensureFaTableIcon(el, 'fa-sharp fa-light fa-filter', '12px')
    })
  }

  function startArcoTableHeaderIconPatcher() {
    let timer = null
    const schedule = () => {
      if (timer) return
      timer = window.setTimeout(() => {
        timer = null
        patchArcoTableHeaderIcons(document)
      }, 32)
    }
    const start = () => {
      patchArcoTableHeaderIcons(document)
      if (window.__arcoTableFaIconObserver) return
      const obs = new MutationObserver(schedule)
      obs.observe(document.documentElement, { childList: true, subtree: true })
      window.__arcoTableFaIconObserver = obs
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', start)
    } else {
      start()
    }
  }

  window.ProFaIcons = ProFaIcons
  window.ArcoVueIcon = ProFaIcons
  window.patchArcoTableHeaderIcons = patchArcoTableHeaderIcons
  startArcoTableHeaderIconPatcher()
})()
