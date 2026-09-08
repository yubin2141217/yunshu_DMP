/**
 * 页面切换顶部进度条（对齐 admin NProgress）
 * - 点击跳转前 start，跨页用 sessionStorage 续接，避免白屏无反馈
 * - 新页就绪后 done，并做短淡入减轻闪动
 */
;(function () {
  const FLAG = 'arco-pro-nav-progress'
  const EARLY_ID = 'arco-pro-nprogress-early'

  function flagKeys() {
    const keys = [FLAG]
    try {
      const ctx = window.ArcoProPreviewContext
      if (ctx && typeof ctx.storageKey === 'function') {
        const k = ctx.storageKey(FLAG)
        if (k && keys.indexOf(k) < 0) keys.push(k)
      } else {
        keys.push('vibepack-preview:' + FLAG)
      }
    } catch {
      keys.push('vibepack-preview:' + FLAG)
    }
    return keys
  }

  function hasFlag() {
    try {
      return flagKeys().some((k) => sessionStorage.getItem(k) === '1')
    } catch {
      return false
    }
  }

  function setFlag(on) {
    try {
      flagKeys().forEach((k) => {
        if (on) sessionStorage.setItem(k, '1')
        else sessionStorage.removeItem(k)
      })
    } catch {
      /* ignore */
    }
  }

  function removeEarlyBar() {
    const el = document.getElementById(EARLY_ID)
    if (el && el.parentNode) el.parentNode.removeChild(el)
  }

  function currentFile() {
    return window.location.pathname.split('/').pop() || ''
  }

  function samePage(href) {
    if (!href) return true
    const file = String(href).split('?')[0].split('#')[0].split('/').pop()
    return file === currentFile()
  }

  function configure() {
    if (!window.NProgress) return
    NProgress.configure({
      showSpinner: false,
      minimum: 0.12,
      trickleSpeed: 400,
      speed: 280,
    })
  }

  function start() {
    setFlag(true)
    if (window.NProgress) {
      removeEarlyBar()
      configure()
      NProgress.start()
    }
  }

  function done() {
    setFlag(false)
    removeEarlyBar()
    if (window.NProgress) {
      configure()
      NProgress.done()
    }
    document.documentElement.classList.remove('is-page-loading')
  }

  /**
   * 站内页面跳转：先出进度条再换页
   * @param {string} href
   */
  function navigate(href) {
    if (!href || samePage(href)) return
    start()
    // 让进度条先绘制一帧再卸载当前文档
    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        window.location.href = href
      }, 30)
    })
  }

  function resumeIfNeeded() {
    if (!hasFlag()) return
    document.documentElement.classList.add('is-page-loading')
    if (window.NProgress) {
      removeEarlyBar()
      configure()
      NProgress.set(0.45)
    }
  }

  function finishWhenReady() {
    if (!hasFlag() && !document.documentElement.classList.contains('is-page-loading')) {
      return
    }
    const finish = () => done()
    if (document.readyState === 'complete') {
      window.setTimeout(finish, 80)
    } else {
      window.addEventListener('load', () => window.setTimeout(finish, 80), { once: true })
    }
  }

  function bindLinkCapture() {
    document.addEventListener(
      'click',
      (e) => {
        if (e.defaultPrevented) return
        if (e.button !== 0) return
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
        const a = e.target && e.target.closest ? e.target.closest('a[href]') : null
        if (!a) return
        const href = a.getAttribute('href')
        if (!href || href.startsWith('#') || href.startsWith('javascript:')) return
        if (/^(https?:|mailto:|tel:)/i.test(href) && !href.includes(location.host)) return
        if (!/\.html(\?|#|$)/i.test(href) && !/^\.?\/?[\w-]+\.html/i.test(href)) return
        if (a.target && a.target !== '_self') return
        if (samePage(href)) return
        e.preventDefault()
        navigate(href)
      },
      true
    )
  }

  window.ArcoProPageProgress = {
    start,
    done,
    navigate,
    samePage,
  }

  configure()
  resumeIfNeeded()
  bindLinkCapture()

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', finishWhenReady, { once: true })
  } else {
    finishWhenReady()
  }
})()
