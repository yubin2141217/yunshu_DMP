/**
 * 产品方案管理模块类型定义
 */

/** 方案附加配置控件类型 */
export type CustomConfigControl = 'input' | 'radio' | 'checkbox'

/** 方案附加配置项（申请方选择方案后带出） */
export interface CustomConfigItem {
  /** 选项名称，最长 20 */
  name: string
  /** 控件：文本框 / 单选 / 多选 */
  control: CustomConfigControl
  /** 选项内容（仅单选/多选），最多 6 项 */
  options: string[]
  /** 提示信息，最长 20 */
  tip: string
  /** 是否必填，默认否 */
  required: boolean
  /** 默认选中项下标（单选至多 1 个；多选可多个；仅 required 且单选/多选时生效） */
  defaultIndexes: number[]
}

/** 产品 */
export interface Product {
  id: number
  name: string
  logo: string
  /** 产品介绍（原产品描述） */
  intro: string
  owner: string
  displayStatus: number
  orgTypes: string[]
  regions: string[]
  planCount: number
  /** 被申请试用的机构总数（去重） */
  trialOrgCount: number
  /** 展示位置（整数≥0；数值越小展示越靠前，可重复） */
  sortOrder: number
  hasTrial: boolean
  createTime: string
}

/** 产品维度 · 试用机构统计状态 */
export type ProductTrialOrgStatus = '申请中' | '试用中' | '已过期'

/** 产品维度 · 试用机构统计明细 */
export interface ProductTrialOrgItem {
  id: number
  productId: number
  orgName: string
  status: ProductTrialOrgStatus
  startTime: string
  endTime: string
}

export interface ProductTrialOrgQuery {
  page?: number | string | null
  pageSize?: number | string | null
  productId?: number | string | null
  orgName?: string | null
}

/** 方案 */
export interface Plan {
  id: number
  productId: number
  productName: string
  name: string
  intro: string
  displayStatus: number
  trialTimeType: 'none' | '1m' | '2m' | '3m' | 'custom'
  trialDays: number | null
  trialTimeLabel: string
  extensionType: '0' | '1' | '2' | '3' | 'custom'
  extensionCount: number
  freezeDays: number[]
  auditLeaders: string[]
  auditProvince: string
  auditChairman: string
  handler: string
  /** 方案接入 API */
  accessApi: string
  /** @deprecated 已废弃，保留兼容历史数据 */
  validationConfig: string
  extendConfig: string
  stopConfig: string
  /** 自定义配置项，申请时带出（附加配置） */
  customConfigs: CustomConfigItem[]
  /** 同机构是否可重复申请（默认可发起 1 次） */
  allowRepeatApply: boolean
  useOrgCount: number
  trialOrgCount: number
  expireOrgCount: number
  freezeOrgCount: number
  stopOrgCount: number
  hasTrial: boolean
  createTime: string
}

/** 机构试用统计明细 */
export interface OrgStatItem {
  id: number
  planId: number
  productName: string
  planName: string
  orgName: string
  unit: string
  sales: string
  status: 'trialing' | 'expired' | 'frozen' | 'stopped'
  startDate: string
  trialTimeLabel: string
  endDate: string
  expireDesc: string
  extendedCount: number
  totalExtension: number
}

/** 列表查询参数 */
export interface ProductQuery {
  page?: number | string | null
  pageSize?: number | string | null
  name?: string | null
  /** 机构类型可用（多选，与产品配置精确匹配） */
  orgTypes?: string[] | string | null
  intro?: string | null
  owner?: string | null
  /** 显示状态：1 显示 / 0 隐藏 */
  displayStatus?: number | string | null
  /** 方案数量下限 */
  planCountMin?: number | string | null
  /** 方案数量上限 */
  planCountMax?: number | string | null
  startDate?: string | null
  endDate?: string | null
}

export interface PlanStatsQuery {
  page?: number | string | null
  pageSize?: number | string | null
  planName?: string | null
  productName?: string | null
  /** 试用时间类型 */
  trialTimeType?: string | null
  /** 可延期次数 */
  extensionCount?: number | string | null
  /** 显示状态：1 显示 / 0 隐藏 */
  displayStatus?: number | string | null
  /** 是否有试用机构：yes / no */
  hasTrialOrg?: string | null
  /** 方案处理人 */
  handler?: string | null
}

export interface OrgStatsQuery {
  page?: number | string | null
  pageSize?: number | string | null
  planId?: number | string | null
  statusType?: string | null
  orgName?: string | null
}
