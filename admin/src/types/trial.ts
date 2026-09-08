/**
 * 试用管理模块类型定义
 */

/** 方案状态 */
export type TrialPlanStatus = 'trialing' | 'expired' | 'frozen' | 'stopped'

/** 历史方案状态 */
export type TrialHistoryStatus = 'expired' | 'disabled'

/** 工单状态 */
export type TrialApplyStatus = 'reviewing' | 'processing' | 'rejected' | 'archived'

/** 全部方案列表项 */
export interface TrialPlanItem {
  id: number
  orgId: number
  orgName: string
  unit: string
  sales: string
  productName: string
  planName: string
  startDate: string
  trialDays: number
  endDate: string
  expireDays: number
  expireDesc: string
  status: TrialPlanStatus
  extendedCount: number
  totalExtension: number
  storeTime: string
}

/** 统计汇总 */
export interface TrialPlanStats {
  total: number
  trialing: number
  expired: number
  frozen: number
  stopped: number
}

/** 全部方案列表查询 */
export interface TrialPlanQuery {
  page?: number | string | null
  pageSize?: number | string | null
  orgName?: string | null
  unit?: string | null
  sales?: string | null
  productName?: string | null
  planName?: string | null
  status?: TrialPlanStatus | null
  startDateBegin?: string | null
  startDateEnd?: string | null
  endDateBegin?: string | null
  endDateEnd?: string | null
}

/** 机构维度列表项 */
export interface TrialOrgItem {
  id: number
  orgName: string
  unit: string
  sales: string
  normalTrialCount: number
  totalTrialCount: number
  firstJoinTime: string
}

/** 机构维度查询 */
export interface TrialOrgQuery {
  page?: number | string | null
  pageSize?: number | string | null
  orgName?: string | null
  unit?: string | null
  sales?: string | null
}

/** 申请记录审核节点 */
export interface TrialApplyAuditNode {
  operator: string
  role: string
  /** 已提交 / 已通过 / 已驳回 等 */
  status: string
  time: string
  remark?: string
}

/** 申请记录（操作记录） */
export interface TrialApplyRecord {
  id: number
  ticketId: string
  applicant: string
  applyType: string
  applyTime: string
  status: TrialApplyStatus
  /** 弹窗摘要用，缺省时回退到方案详情字段 */
  orgName?: string
  productName?: string
  planName?: string
  /** 审核信息时间线 */
  auditNodes?: TrialApplyAuditNode[]
}

/** 历史方案记录 */
export interface TrialHistoryRecord {
  id: number
  productName: string
  planName: string
  startTime: string
  totalTrialDays: number
  endTime: string
  extensionCount: number
  planId: string
  status: TrialHistoryStatus
}

/** 机构下试用方案（机构详情） */
export interface TrialOrgPlanItem {
  id: number
  /** 产品方案管理中的方案 ID，用于跳转方案详情 */
  productPlanId: number
  productName: string
  planName: string
  startDate: string
  endDate: string
  status: TrialPlanStatus
  extendedCount: number
  totalExtension: number
}

/** 全部方案详情 */
export interface TrialPlanDetail {
  id: number
  orgId: number
  orgName: string
  usageStatus: string
  unit: string
  sales: string
  productName: string
  planName: string
  trialTimeLabel: string
  totalExtension: number
  freezeRule: string
  intro: string
  productFeatures: string
  planId: string
  startDate: string
  endDate: string
  status: TrialPlanStatus
  statusRemainTime: string
  extendedCount: number
  pendingExtensionCount: number
  applyRecords: TrialApplyRecord[]
  historyRecords: TrialHistoryRecord[]
}

/** 机构详情 */
export interface TrialOrgDetail {
  id: number
  orgName: string
  unit: string
  sales: string
  /** 开通中（试用中）方案数 */
  activePlanCount: number
  /** 全部试用方案数 */
  totalPlanCount: number
  plans: TrialOrgPlanItem[]
  applyRecords: TrialApplyRecord[]
}
