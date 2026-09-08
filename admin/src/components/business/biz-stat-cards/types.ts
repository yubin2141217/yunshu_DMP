/**
 * 业务页统计卡片（对齐试用管理设计稿）
 */
export interface BizStatItem {
  key: string
  label: string
  value: number | string
  /** primary | success | warning | danger | info | amber */
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'amber'
  icon?: string
}
