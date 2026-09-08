/**
 * Arco Design Pro 路由树 + 静态页映射
 */
window.ArcoProPageHref = {
  'dashboard/workplace': 'dashboard.html',
  'dashboard/ecommerce': 'dashboard-ecommerce.html',
  'dashboard/crm': 'dashboard-crm.html',
  'dashboard/academy': 'dashboard-academy.html',
  'dashboard/finance': 'dashboard-finance.html',
  'dashboard/analytics': 'dashboard-analytics.html',
  'dashboard/customer': 'dashboard-customer.html',
  'dashboard/productivity': 'dashboard-productivity.html',
  'dashboard/banking': 'dashboard-banking.html',
  'list/search-table': 'list-search-table.html',
  'list/card': 'list-card.html',
  'list/kanban': 'list-kanban.html',
  'list/tree-table': 'list-tree-table.html',
  'list/filter-table': 'list-filter-table.html',
  'list/tag-filter': 'list-tag-filter.html',
  'list/master-detail': 'list-master-detail.html',
  'list/editable': 'list-editable.html',
  'list/calendar': 'list-calendar.html',
  'list/media': 'list-media.html',
  'list/import': 'list-import.html',
  'form/basic': 'form-basic.html',
  'form/group': 'form-group.html',
  'form/step': 'form-step.html',
  'form/step-vertical': 'form-step-vertical.html',
  'profile/basic': 'profile-basic.html',
  'profile/advanced': 'profile-advanced.html',
  'result/success': 'result-success.html',
  'result/waiting': 'result-waiting.html',
  'result/warning': 'result-warning.html',
  'result/error': 'result-error.html',
  'exception/403': 'exception-403.html',
  'exception/404': 'exception-404.html',
  'exception/500': 'exception-500.html',
  'component/basic': 'component-basic.html',
  'component/extended': 'component-extended.html',
  'component/rich-text': 'component-rich-text.html',
  'component/form': 'component-form.html',
  'component/form-extended': 'component-form-extended.html',
  'component/table-extended': 'component-table-extended.html',
  'component/list': 'component-list.html',
  'chart/component': 'component-chart.html',
  'chart/extended': 'component-chart-extended.html',
  'chart/metric-card': 'component-metric-card.html',
  'chart/palette': 'component-chart-palette.html',
  'user/home': 'user-home.html',
  'user/setting': 'user-setting.html',
  'user/message': 'message-list.html',
}

window.ArcoProRoutes = [
  {
    name: 'menu.dashboard',
    key: 'dashboard',
    children: [
      { name: 'menu.dashboard.workplace', key: 'dashboard/workplace' },
      { name: 'menu.dashboard.ecommerce', key: 'dashboard/ecommerce' },
      { name: 'menu.dashboard.crm', key: 'dashboard/crm' },
      { name: 'menu.dashboard.academy', key: 'dashboard/academy' },
      { name: 'menu.dashboard.finance', key: 'dashboard/finance' },
      { name: 'menu.dashboard.analytics', key: 'dashboard/analytics' },
      { name: 'menu.dashboard.customer', key: 'dashboard/customer' },
      { name: 'menu.dashboard.productivity', key: 'dashboard/productivity' },
      { name: 'menu.dashboard.banking', key: 'dashboard/banking' },
    ],
  },
  {
    name: 'menu.component',
    key: 'component',
    children: [
      { name: 'menu.component.form', key: 'component/form' },
      { name: 'menu.component.basic', key: 'component/basic' },
      { name: 'menu.component.formExtended', key: 'component/form-extended' },
      { name: 'menu.component.extended', key: 'component/extended' },
      { name: 'menu.component.tableExtended', key: 'component/table-extended' },
      { name: 'menu.component.list', key: 'component/list' },
      { name: 'menu.component.richText', key: 'component/rich-text' },
    ],
  },
  {
    name: 'menu.chart',
    key: 'chart',
    children: [
      { name: 'menu.chart.palette', key: 'chart/palette' },
      { name: 'menu.chart.metricCard', key: 'chart/metric-card' },
      { name: 'menu.chart.component', key: 'chart/component' },
      { name: 'menu.chart.extended', key: 'chart/extended' },
    ],
  },
  {
    name: 'menu.list',
    key: 'list',
    children: [
      { name: 'menu.list.searchTable', key: 'list/search-table' },
      { name: 'menu.list.cardList', key: 'list/card' },
      { name: 'menu.list.kanban', key: 'list/kanban' },
      { name: 'menu.list.calendar', key: 'list/calendar' },
      { name: 'menu.list.treeTable', key: 'list/tree-table' },
      { name: 'menu.list.filterTable', key: 'list/filter-table' },
      { name: 'menu.list.tagFilter', key: 'list/tag-filter' },
      { name: 'menu.list.editable', key: 'list/editable' },
      { name: 'menu.list.media', key: 'list/media' },
      { name: 'menu.list.import', key: 'list/import' },
    ],
  },
  {
    name: 'menu.form',
    key: 'form',
    children: [
      { name: 'menu.form.basic', key: 'form/basic' },
      { name: 'menu.form.group', key: 'form/group' },
      { name: 'menu.form.step', key: 'form/step' },
      { name: 'menu.form.stepVertical', key: 'form/step-vertical' },
    ],
  },
  {
    name: 'menu.profile',
    key: 'profile',
    children: [
      { name: 'menu.profile.basic', key: 'profile/basic' },
      { name: 'menu.profile.advanced', key: 'profile/advanced' },
      { name: 'menu.profile.masterDetail', key: 'list/master-detail' },
    ],
  },
  {
    name: 'menu.result',
    key: 'result',
    children: [
      { name: 'menu.result.success', key: 'result/success', breadcrumb: false },
      { name: 'menu.result.waiting', key: 'result/waiting', breadcrumb: false },
      { name: 'menu.result.warning', key: 'result/warning', breadcrumb: false },
      { name: 'menu.result.error', key: 'result/error', breadcrumb: false },
    ],
  },
  {
    name: 'menu.exception',
    key: 'exception',
    children: [
      { name: 'menu.exception.403', key: 'exception/403' },
      { name: 'menu.exception.404', key: 'exception/404' },
      { name: 'menu.exception.500', key: 'exception/500' },
    ],
  },
  {
    name: 'menu.user',
    key: 'user',
    children: [
      { name: 'menu.user.home', key: 'user/home' },
      { name: 'menu.user.setting', key: 'user/setting' },
      { name: 'menu.user.message', key: 'user/message' },
    ],
  },
]

;(function attachHref(routes) {
  routes.forEach((route) => {
    if (route.children) {
      attachHref(route.children)
      return
    }
    const href = window.ArcoProPageHref[route.key]
    if (href) route.href = href
  })
})(window.ArcoProRoutes)

/** 菜单图标组件名（Font Awesome，见 js/fa-icons.js） */
window.ArcoProRoutes.getIconComponent = function getIconComponent(key) {
  const root = key.split('/')[0]
  const map = {
    dashboard: 'icon-dashboard',
    list: 'icon-list',
    form: 'icon-settings',
    profile: 'icon-file',
    result: 'icon-check-circle',
    exception: 'icon-exclamation-circle',
    component: 'icon-tool',
    chart: 'icon-chart-area',
    user: 'icon-avatar-user',
  }
  return map[root] || 'icon-file'
}

window.ArcoProRoutes.getBreadcrumb = function getBreadcrumb(pageKey) {
  const locale = window.ArcoProLocale.menu
  function walk(nodes, trail) {
    for (const node of nodes) {
      const next = trail.concat(node.name)
      if (node.key === pageKey) return next
      if (node.children) {
        const found = walk(node.children, next)
        if (found) return found
      }
    }
    return null
  }
  const names = walk(window.ArcoProRoutes, [])
  return (names || ['menu.dashboard']).map((n) => locale[n] || n)
}

window.ArcoProRoutes.getDefaultOpenKeys = function getDefaultOpenKeys(pageKey) {
  const parts = pageKey.split('/')
  if (parts.length > 1) return [parts[0]]
  return []
}

/** VibePM Pro 统一契约导出（跨 Theme / Vibe Pack 扫描；Arco 运行时仍用 ArcoPro*） */
window.VibePMProPageHref = window.VibePMProPageHref || window.ArcoProPageHref
window.VibePMProRoutes = window.VibePMProRoutes || window.ArcoProRoutes
