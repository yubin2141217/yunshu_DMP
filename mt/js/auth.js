window.AdminAuth = {
  DEMO_USERNAME: (window.YunshuBrand && YunshuBrand.demoUser) || 'admin',
  DEMO_PASSWORD: (window.YunshuBrand && YunshuBrand.demoPass) || '123456',
  _prefix() {
    return (window.YunshuBrand && YunshuBrand.authPrefix) || 'arco-pro'
  },
  _statusKey() {
    return this._prefix() + '-user-status'
  },
  _paramsKey() {
    return this._prefix() + '-login-params'
  },
  _infoKey() {
    return this._prefix() + '-user-info'
  },
  isLoggedIn() {
    return (
      localStorage.getItem(this._statusKey()) === 'login' ||
      sessionStorage.getItem(this._statusKey()) === 'login'
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
      localStorage.setItem(this._paramsKey(), JSON.stringify(params))
    } else {
      localStorage.removeItem(this._paramsKey())
    }
    localStorage.setItem(this._statusKey(), 'login')
    sessionStorage.setItem(this._statusKey(), 'login')
    if (window.YunshuBrand && YunshuBrand.userInfo) {
      this.setUserInfo(YunshuBrand.userInfo)
    }
  },
  logout() {
    localStorage.removeItem(this._statusKey())
    sessionStorage.removeItem(this._statusKey())
    if (window.ArcoProTabBar && typeof ArcoProTabBar.reset === 'function') {
      ArcoProTabBar.reset()
    }
    window.location.href = 'login-cover.html'
  },
  getLoginParams() {
    try {
      return JSON.parse(localStorage.getItem(this._paramsKey()) || 'null')
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
      localStorage.removeItem(this._paramsKey())
      return { userName: '', password: '', rememberPassword: true }
    }
    return {
      userName: saved?.userName || '',
      password: saved?.password || '',
      rememberPassword: true,
    }
  },
  getUserInfo() {
    const brand = (window.YunshuBrand && YunshuBrand.userInfo) || {}
    const defaults = {
      name: brand.name || '王立群',
      account: brand.account || 'wangliqun',
      email: brand.email || 'wanglq@company.com',
      role: brand.role || '高级产品经理',
      department: brand.department || '产品设计部',
    }
    try {
      const saved = JSON.parse(localStorage.getItem(this._infoKey()) || 'null')
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
    localStorage.setItem(this._infoKey(), JSON.stringify(next))
    return next
  },
}
