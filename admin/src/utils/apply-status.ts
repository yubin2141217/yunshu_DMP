/**
 * 申请管理状态展示
 * - 审核管理：审核中 / 已驳回 / 已完结 / 已撤回
 * - 人工处理（待办）：待人工处理
 * - 处理记录：已归档 / 已拒绝
 */

import type { ApplyStatus } from '@/types/apply'

/** 审核侧视为「已完结」的底层状态 */
const AUDIT_DONE_STATUSES: ApplyStatus[] = ['已完结', '待人工处理', '已归档']

/** 是否匹配审核管理「已完结」筛选 */
export function matchAuditCompletedFilter(status: ApplyStatus): boolean {
  return AUDIT_DONE_STATUSES.includes(status)
}

/** 审核管理列表 / 详情状态文案 */
export function auditStatusLabel(status: ApplyStatus): string {
  if (status === '待人工处理' || status === '已归档') return '已完结'
  return status
}

/** 人工处理列表 / 详情状态文案 */
export function todoStatusLabel(status: ApplyStatus): string {
  return status
}

/** @deprecated 请按页面使用 auditStatusLabel / todoStatusLabel */
export function detailStatusLabel(status: ApplyStatus): string {
  return auditStatusLabel(status)
}

export function applyStatusTagType(
  status: ApplyStatus
): 'success' | 'warning' | 'danger' | 'info' | 'primary' {
  const map: Record<ApplyStatus, 'success' | 'warning' | 'danger' | 'info' | 'primary'> = {
    审核中: 'info',
    已驳回: 'danger',
    已撤回: 'warning',
    已完结: 'success',
    待人工处理: 'primary',
    已归档: 'success',
    已拒绝: 'danger'
  }
  return map[status] || 'info'
}

/** 处理记录状态文案 */
export function recordStatusLabel(status: ApplyStatus): string {
  if (status === '已拒绝') return '已拒绝'
  if (status === '已归档') return '已归档'
  return status
}

/** 审核管理标签色（待人工处理/已归档按已完结展示） */
export function auditStatusTagType(
  status: ApplyStatus
): 'success' | 'warning' | 'danger' | 'info' | 'primary' {
  if (matchAuditCompletedFilter(status)) return 'success'
  return applyStatusTagType(status)
}

export function auditNodeStatusType(
  action: string
): 'success' | 'warning' | 'danger' | 'primary' | 'info' {
  if (action.includes('驳回') || action.includes('未通过')) return 'danger'
  if (action.includes('撤回')) return 'warning'
  if (action.includes('自动跳过')) return 'info'
  if (action.includes('审核中') || action.includes('待') || action.includes('处理中')) return 'warning'
  if (action.includes('通过') || action.includes('提交') || action.includes('成功')) return 'success'
  return 'primary'
}
