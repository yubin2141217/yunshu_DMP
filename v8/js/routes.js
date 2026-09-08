/**
 * Arco Design Pro 路由树 + 静态页映射 · 云数中台 V8
 */
window.ArcoProPageHref = {
  overview: 'dashboard.html',
  stats: 'stats-list.html',
  suppliers: 'supplier-view-list.html',
  spec: 'access-spec.html',
}

window.ArcoProRoutes = [
  { name: 'menu.overview', key: 'overview' },
  { name: 'menu.stats', key: 'stats' },
  { name: 'menu.suppliers', key: 'suppliers' },
  { name: 'menu.spec', key: 'spec' },
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

window.ArcoProRoutes.getIconComponent = function getIconComponent(key) {
  const map = {
    overview: 'icon-dashboard',
    stats: 'icon-chart-column',
    suppliers: 'icon-apps',
    spec: 'icon-file',
  }
  return map[key] || 'icon-file'
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
  const pageNames = (names || ['menu.overview']).map((n) => locale[n] || n)
  const root =
    (window.ArcoProLocale.navbar && window.ArcoProLocale.navbar.workspace) || '我的工作台'
  return [root].concat(pageNames)
}

window.ArcoProRoutes.getDefaultOpenKeys = function getDefaultOpenKeys(pageKey) {
  const parts = pageKey.split('/')
  if (parts.length > 1) return [parts[0]]
  return []
}

window.VibePMProPageHref = window.VibePMProPageHref || window.ArcoProPageHref
window.VibePMProRoutes = window.VibePMProRoutes || window.ArcoProRoutes
