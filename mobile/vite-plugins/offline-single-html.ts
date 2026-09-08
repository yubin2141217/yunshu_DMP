import type { Plugin } from 'vite'
import fs from 'fs'
import path from 'path'

/**
 * 将构建产物内联进 index.html，并把 CSS 中的相对资源转为 data URI，
 * 保证解压后双击 file:// 时字体、背景图、图标均可加载。
 */
export function offlineSingleHtmlPlugin(): Plugin {
  return {
    name: 'offline-single-html',
    apply: 'build',
    enforce: 'post',
    writeBundle(options) {
      const outDir = options.dir
      if (!outDir) return

      const htmlPath = path.join(outDir, 'index.html')
      if (!fs.existsSync(htmlPath)) return

      let html = fs.readFileSync(htmlPath, 'utf-8')

      html = html.replace(/<link[^>]*rel="modulepreload"[^>]*>/gi, '')

      html = html.replace(
        /<link([^>]*rel="stylesheet"[^>]*)>/gi,
        (full, attrs: string) => {
          const href = /href="([^"]+)"/i.exec(attrs)?.[1]
          if (!href || href.startsWith('http') || href.startsWith('data:')) return full
          const file = resolveAsset(outDir, href)
          if (!file) return full
          let css = fs.readFileSync(file, 'utf-8')
          css = inlineCssUrls(css, file, outDir)
          css = stripExternalFontFallbacks(css)
          safeUnlink(file)
          return `<style>${css}</style>`
        }
      )

      html = html.replace(
        /<script([^>]*type="module"[^>]*)><\/script>/gi,
        (full, attrs: string) => {
          const src = /src="([^"]+)"/i.exec(attrs)?.[1]
          if (!src || src.startsWith('http') || src.startsWith('data:')) return full
          const file = resolveAsset(outDir, src)
          if (!file) return full
          const js = fs.readFileSync(file, 'utf-8')
          safeUnlink(file)
          return `<script type="module">${js}</script>`
        }
      )

      html = html.replace(/\s+crossorigin(?:="[^"]*")?/gi, '')
      html = inlineHtmlLocalAssets(html, outDir)

      fs.writeFileSync(htmlPath, html, 'utf-8')

      const tipPath = path.join(outDir, '请双击 index.html 打开.txt')
      fs.writeFileSync(
        tipPath,
        [
          '本目录可直接分享给他人：',
          '1. 将整个文件夹打包成 zip',
          '2. 对方解压后双击「index.html」即可用浏览器预览',
          '3. 请使用 Chrome 或 Edge 打开',
          '4. 字体与主要图片已内联，建议仍保留整个解压目录'
        ].join('\r\n'),
        'utf-8'
      )
    }
  }
}

function resolveAsset(outDir: string, href: string): string | null {
  const cleaned = href.replace(/^\.\//, '').replace(/^\//, '')
  const file = path.join(outDir, cleaned)
  return fs.existsSync(file) ? file : null
}

function safeUnlink(file: string) {
  try {
    if (fs.existsSync(file)) fs.unlinkSync(file)
  } catch {
    // ignore
  }
}

function stripExternalFontFallbacks(css: string): string {
  return css.replace(/url\(\s*['"]?\/\/[^'")\s]+['"]?\s*\)/gi, 'url()')
}

function inlineCssUrls(css: string, cssFilePath: string, outDir: string): string {
  return css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (match, _q: string, rawUrl: string) => {
    const url = String(rawUrl || '').trim()
    if (!url || url.startsWith('data:') || /^https?:/i.test(url) || url.startsWith('//') || url.startsWith('#')) {
      return match
    }

    const clean = url.split('?')[0].split('#')[0]
    const cssDir = path.dirname(cssFilePath)
    const candidates = [
      path.resolve(cssDir, clean),
      path.join(outDir, clean.replace(/^\.\//, '')),
      path.join(outDir, 'assets', path.basename(clean))
    ]

    const file = candidates.find((p) => fs.existsSync(p))
    if (!file) {
      if (/^\.\/[^/]+/.test(clean) || /^[^./][^:]*\.[a-z0-9]+$/i.test(clean)) {
        const name = path.basename(clean)
        return `url("./assets/${name}")`
      }
      return match
    }

    return `url(${toDataUri(file)})`
  })
}

function inlineHtmlLocalAssets(html: string, outDir: string): string {
  return html.replace(
    /(href|src)=["'](\.\/[^"']+\.(?:ico|png|jpg|jpeg|webp|svg|gif|woff2?|ttf))["']/gi,
    (full, attr: string, href: string) => {
      const file = resolveAsset(outDir, href)
      if (!file) return full
      return `${attr}=${toDataUri(file)}`
    }
  )
}

function toDataUri(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase()
  const mimeMap: Record<string, string> = {
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  }
  const mime = mimeMap[ext] || 'application/octet-stream'
  if (ext === '.svg') {
    const text = fs.readFileSync(filePath, 'utf-8')
    return `"data:${mime};charset=utf-8,${encodeURIComponent(text)}"`
  }
  const b64 = fs.readFileSync(filePath).toString('base64')
  return `"data:${mime};base64,${b64}"`
}
