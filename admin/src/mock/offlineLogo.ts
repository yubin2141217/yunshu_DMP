/**
 * 离线可用的 Mock Logo（SVG data URI，不依赖外网）
 */
const COLORS = ['#4C7DFF', '#13C2C2', '#722ED1', '#FA8C16', '#EB2F96', '#52C41A']

/** 生成带文字的本地 Logo，可用于 file:// 离线预览 */
export function offlineLogo(label: string, seed = label): string {
  const color = COLORS[Math.abs(hash(seed)) % COLORS.length]
  const text = Array.from(label).slice(0, 2).join('') || 'P'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <rect width="96" height="96" rx="16" fill="${color}"/>
  <text x="48" y="54" text-anchor="middle" font-size="28" font-family="Arial,sans-serif" font-weight="700" fill="#fff">${escapeXml(text)}</text>
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function hash(input: string): number {
  let h = 0
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 31 + input.charCodeAt(i)) | 0
  }
  return h
}

function escapeXml(text: string): string {
  return text.replace(/[<>&'"]/g, (ch) => {
    const map: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      "'": '&apos;',
      '"': '&quot;'
    }
    return map[ch] || ch
  })
}
