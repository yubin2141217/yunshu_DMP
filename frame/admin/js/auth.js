window.AdminAuth = {
  DEMO_USERNAME: 'admin',
  DEMO_PASSWORD: '123456',
  isLoggedIn() {
    return (
      localStorage.getItem('arco-pro-user-status') === 'login' ||
      sessionStorage.getItem('arco-pro-user-status') === 'login'
    )
  },
  requireAuth() {
    // Gallery 缩略 iframe：?galleryPreview=1 跳过登录（仅预览，非交付）
    try {
      if (new URLSearchParams(window.location.search).get('galleryPreview') === '1') {
        return true
      }
    } catch (_) {
      /* ignore */
    }
    if (!this.isLoggedIn()) {
      window.location.href = 'login-cover.html'
      return false
    }
    return true
  },
  validateCredentials(userName, password) {
    const name = String(userName || '').trim()
    const pwd = String(password || '')
    return {
      userNameOk: name === this.DEMO_USERNAME,
      passwordOk: pwd === this.DEMO_PASSWORD,
    }
  },
  login(params, remember) {
    if (remember && params) {
      localStorage.setItem('arco-pro-login-params', JSON.stringify(params))
    } else {
      localStorage.removeItem('arco-pro-login-params')
    }
    localStorage.setItem('arco-pro-user-status', 'login')
    sessionStorage.setItem('arco-pro-user-status', 'login')
  },
  logout() {
    localStorage.removeItem('arco-pro-user-status')
    sessionStorage.removeItem('arco-pro-user-status')
    if (window.ArcoProTabBar && typeof ArcoProTabBar.reset === 'function') {
      ArcoProTabBar.reset()
    }
    window.location.href = 'login-cover.html'
  },
  getLoginParams() {
    try {
      return JSON.parse(localStorage.getItem('arco-pro-login-params') || 'null')
    } catch {
      return null
    }
  },
  resolveLoginFormDefaults() {
    const saved = this.getLoginParams()
    const isDemoSaved =
      saved &&
      String(saved.userName) === this.DEMO_USERNAME &&
      String(saved.password) === this.DEMO_PASSWORD
    if (isDemoSaved) {
      localStorage.removeItem('arco-pro-login-params')
      return { userName: '', password: '', rememberPassword: true }
    }
    return {
      userName: saved?.userName || '',
      password: saved?.password || '',
      rememberPassword: true,
    }
  },
  getUserInfo() {
    const defaults = {
      name: '王立群',
      account: 'wangliqun',
      email: 'wanglq@company.com',
      role: '高级产品经理',
      department: '产品设计部',
    }
    try {
      const saved = JSON.parse(localStorage.getItem('arco-pro-user-info') || 'null')
      if (saved && typeof saved === 'object' && saved.name) {
        return { ...defaults, ...saved }
      }
    } catch (_) {
      /* ignore */
    }
    return { ...defaults }
  },
  setUserInfo(info) {
    const next = { ...this.getUserInfo(), ...(info || {}) }
    localStorage.setItem('arco-pro-user-info', JSON.stringify(next))
    return next
  },
}
