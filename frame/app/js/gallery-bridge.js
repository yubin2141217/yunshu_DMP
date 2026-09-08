/** Gallery 弹窗/缩略预览桥接：仅缩小设备壳，不影响交付打开与新窗口 */
;(function () {
  try {
    var q = new URLSearchParams(window.location.search)
    // hash 兜底：部分静态服务器 cleanUrl 重定向会丢掉 ?query
    if (q.get('galleryPreview') !== '1' && window.location.hash) {
      q = new URLSearchParams(String(window.location.hash).replace(/^#/, ''))
    }
    if (q.get('galleryPreview') !== '1') return
    document.documentElement.classList.add('gallery-preview')
    var scale = q.get('galleryScale')
    // scale=1（缩略）：不套 transform，与 file 直开一致，避免亚像素圆角差异
    if (scale === '1') {
      document.documentElement.classList.add('gallery-preview-1x')
    } else if (scale) {
      document.documentElement.style.setProperty('--gallery-phone-scale', scale)
    }
  } catch (_) {
    /* ignore */
  }
})()
