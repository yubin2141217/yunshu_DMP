/**
 * 冷冻期倒计时格式化（精确到秒）
 * 示例：3天2小时14分07秒
 */

/** 将剩余毫秒格式化为「X天X小时X分XX秒」 */
export function formatFreezeCountdown(remainMs: number): string {
  if (remainMs <= 0) return '已结束'
  const totalSec = Math.floor(remainMs / 1000)
  const days = Math.floor(totalSec / 86400)
  const hours = Math.floor((totalSec % 86400) / 3600)
  const mins = Math.floor((totalSec % 3600) / 60)
  const secs = totalSec % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${days}天${hours}小时${mins}分${pad(secs)}秒`
}

/** 根据结束时间计算剩余毫秒（冷冻期 / 试用到期通用） */
export function getFreezeRemainMs(endTime?: string): number {
  if (!endTime) return 0
  const end = new Date(endTime.replace(/-/g, '/')).getTime()
  if (Number.isNaN(end)) return 0
  return end - Date.now()
}

/** 试用倒计时文案前缀 */
export function formatTrialCountdown(remainMs: number): string {
  return formatFreezeCountdown(remainMs)
}
