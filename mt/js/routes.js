/**
 * Arco Design Pro 路由树 + 静态页映射 · 云数中台 MT
 */
window.ArcoProPageHref = {
  suppliers: 'supplier-list.html',
  orgConfig: 'org-config-list.html',
  metadata: 'metadata-list.html',
  scheme: 'scheme-list.html',
  standard: 'standard-manage.html',
}

window.ArcoProRoutes = [
  { name: 'menu.suppliers', key: 'suppliers' },
  { name: 'menu.orgConfig', key: 'orgConfig' },
  {
    name: 'menu.standard',
    key: 'standardGroup',
    children: [
      { name: 'menu.standard.list', key: 'standard' },
      { name: 'menu.metadata', key: 'metadata' },
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

window.ArcoProRoutes.getIconComponent = function getIconComponent(key) {
  const map = {
    suppliers: 'icon-apps',
    orgConfig: 'icon-settings',
    standardGroup: 'icon-file',
    standard: 'icon-file',
    metadata: 'icon-storage',
    scheme: 'icon-swap',
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
  return (names || ['menu.suppliers']).map((n) => locale[n] || n)
}

window.ArcoProRoutes.getDefaultOpenKeys = function getDefaultOpenKeys(pageKey) {
  const open = []
  function walk(nodes, parents) {
    for (const node of nodes) {
      if (node.key === pageKey) {
        open.push.apply(open, parents)
        return true
      }
      if (node.children && walk(node.children, parents.concat(node.key))) return true
    }
    return false
  }
  walk(window.ArcoProRoutes, [])
  return open
}

window.VibePMProPageHref = window.VibePMProPageHref || window.ArcoProPageHref
window.VibePMProRoutes = window.VibePMProRoutes || window.ArcoProRoutes
