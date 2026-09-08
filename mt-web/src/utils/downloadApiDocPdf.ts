import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

const PDF_STYLES = `
.api-doc-pdf { font-family: "Microsoft YaHei", "PingFang SC", SimSun, sans-serif; color: #1d2129; font-size: 12px; line-height: 1.65; width: 720px; padding: 24px; background: #fff; box-sizing: border-box; }
.api-doc-pdf h1 { font-size: 18px; margin: 0 0 16px; }
.api-doc-pdf h2 { font-size: 14px; margin: 18px 0 8px; border-bottom: 1px solid #e5e6eb; padding-bottom: 4px; }
.api-doc-pdf ul { margin: 0; padding-left: 18px; }
.api-doc-pdf p { margin: 0 0 8px; }
.api-doc-pdf .security { padding: 10px 12px; background: #fff7e8; border: 1px solid #ffe4ba; border-radius: 4px; color: #ad6800; }
.api-doc-pdf table { width: 100%; border-collapse: collapse; margin: 8px 0 4px; table-layout: fixed; }
.api-doc-pdf th, .api-doc-pdf td { border: 1px solid #e5e6eb; padding: 6px 8px; text-align: left; vertical-align: top; word-break: break-word; }
.api-doc-pdf th { background: #f7f8fa; width: 120px; }
.api-doc-pdf thead th { width: auto; }
.api-doc-pdf pre { margin: 0; padding: 10px 12px; background: #f7f8fa; border: 1px solid #e5e6eb; border-radius: 4px; white-space: pre-wrap; word-break: break-word; font-family: Consolas, Menlo, monospace; font-size: 11px; }
.api-doc-pdf code { font-family: Consolas, Menlo, monospace; font-size: 11px; }
`

/**
 * 将接口文档 HTML 渲染为 PDF 并触发浏览器下载
 */
export async function downloadApiDocPdf(htmlBody: string, fileName: string) {
  const host = document.createElement('div')
  host.style.cssText = 'position:fixed;left:-10000px;top:0;z-index:-1;'
  host.innerHTML = `<style>${PDF_STYLES}</style>${htmlBody}`
  document.body.appendChild(host)
  const target = host.querySelector('.api-doc-pdf') as HTMLElement
  try {
    const canvas = await html2canvas(target, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    })
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 10
    const contentWidth = pageWidth - margin * 2
    const imgHeight = (canvas.height * contentWidth) / canvas.width
    let heightLeft = imgHeight
    let position = margin
    const imgData = canvas.toDataURL('image/jpeg', 0.92)
    pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, imgHeight)
    heightLeft -= pageHeight - margin * 2
    while (heightLeft > 0) {
      position = margin - (imgHeight - heightLeft)
      pdf.addPage()
      pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, imgHeight)
      heightLeft -= pageHeight - margin * 2
    }
    const name = fileName?.endsWith('.pdf') ? fileName : `${(fileName || '接口文档').replace(/\.md$/i, '')}.pdf`
    pdf.save(name)
  } finally {
    document.body.removeChild(host)
  }
}
