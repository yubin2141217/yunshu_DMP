/**
 * H5 申请 / 机构统计相关类型
 */

export type PlanUseStatus =
  | '试用中'
  | '即将到期'
  | '已到期'
  | '冷冻期'
  | '停用'
  | '申请中'

export type OrgListFilter =
  | 'all'
  | '试用中'
  | '即将到期'
  | '已到期'
  | '冷冻期'
  | '申请中'

export type ApplyType = '申请试用' | '申请关停' | '申请重置' | '更换产品方案'

export type H5ApplyStatus = '审核中' | '处理中' | '草稿' | '未通过' | '已归档'

export type CustomConfigControl = 'input' | 'radio' | 'checkbox'

/** 方案附加配置（Web 方案管理配置） */
export interface CustomConfigItem {
  name: string
  control: CustomConfigControl
  options: string[]
  tip: string
  /** 是否必填，默认否 */
  required?: boolean
  /** 默认选中项下标 */
  defaultIndexes?: number[]
}

export interface OrgItem {
  id: number
  name: string
  logo: string
  sales: string
  region: string
  orgType: string
  /** 统计单元 */
  unit: string
}

export interface OrgTrialRecord {
  productName: string
  planName: string
  planId: string
  startDate: string
  endDate: string
  remainExtend?: number
  totalDays?: string
  extendCount?: number
}

export interface ProductItem {
  id: number
  name: string
  intro: string
  logo: string
  orgTypes: string[]
  regions: string[]
  /** 展示位置（正整数 >0，越小越靠前） */
  sortOrder: number
  createTime: string
}

export interface PlanOption {
  id: number
  productId: number
  name: string
  trialTimeLabel: string
  totalExtend: number
  /** 冷冻期天数，>0 时延期须在到期且冷冻期结束后 */
  freezeDays: number
  freezeRule: string
  intro: string
  /** 方案处理人 */
  handler: string
  /** @deprecated 已由 handler 替代，保留兼容旧数据 */
  auditFlowLabel?: string
  customConfigs: CustomConfigItem[]
  createTime: string
  /** @deprecated 请用 occupyStatus；true 表示占用中不可选 */
  inTrial: boolean
  /**
   * 当前机构对该方案的占用状态；有值则不可再选
   * - 试用中：提示去申请管理
   * - 已到期 / 停用：提示去机构统计
   */
  occupyStatus?: '试用中' | '已到期' | '停用'
  /** 各次延期对应冷冻期天数（第 n 次对应 freezeDaysList[n-1]） */
  freezeDaysList?: number[]
  /** 同机构是否可重复申请 */
  allowRepeatApply?: boolean
}

/** 产品详情（含下属方案，对齐 Web 产品详情） */
export interface ProductDetail extends ProductItem {
  plans: PlanOption[]
}

export interface TrialPlanRow {
  id: number
  orgId: number
  orgName: string
  orgLogo: string
  productName: string
  planName: string
  expireTime: string
  status: PlanUseStatus
  sales: string
  unit: string
  startDate: string
  endDate: string
  remainTime: string
  extendedCount: number
  pendingExtendCount: number
  remainExtendCount: number
  totalExtend: number
  trialTimeLabel: string
  /** 当前冷冻期配置（兼容；优先用 freezeDaysList） */
  freezeDays: number
  /** 各次延期对应冷冻期天数 */
  freezeDaysList?: number[]
  freezeRule: string
  planIntro: string
  auditFlowLabel: string
  /** 审核流程节点（含审核结果标识） */
  auditFlowNodes?: { role: string; result: string }[]
  /** 冷冻期剩余天数（兼容展示，>0 表示仍在冷冻期） */
  freezeDaysLeft?: number
  /** 冷冻期结束日期（兼容） */
  freezeEndDate?: string
  /** 冷冻期结束时间（精确到秒，用于倒计时） */
  freezeEndTime?: string
  resetPending?: boolean
  /** 申请中记录关联的工单 ID（下钻至申请详情） */
  applyOrderId?: number
  /** 申请工单当前状态文案（审核中/处理中/未通过等） */
  applyStatus?: H5ApplyStatus
  /** 方案附加配置（详情「方案信息」展示） */
  customConfigs?: CustomConfigItem[]
  /** 附加配置已填答案 */
  customAnswers?: Record<string, string>
}

export interface OrgStatCard {
  totalOrgs: number
  trialingOrgs: number
  soonExpireOrgs: number
  expiredOrgs: number
  freezeOrgs: number
  /** 已提交试用申请且未归档的机构数 */
  applyingOrgs: number
}

/** 统计单元（用户可负责多个） */
export interface StatUnitItem {
  /** 单元名称；空字符串表示「全部」聚合 */
  name: string
  orgCount: number
}

export interface OrgListItem {
  id: number
  name: string
  logo: string
  sales: string
  productName: string
  planName: string
  /** 机构主状态（用于角标） */
  status: PlanUseStatus
  freezeDaysLeft?: number
  freezeEndTime?: string
}

export interface ApplyOrderRow {
  id: number
  orderNo: string
  applicant: string
  applyTime: string
  applyType: ApplyType
  orgName: string
  orgUnit: string
  /** 编辑回填用 */
  orgId?: number
  productId?: number
  planId?: number
  productName: string
  planName: string
  /** 方案介绍 */
  planIntro?: string
  trialTimeLabel: string
  applyRemark: string
  currentAuditor: string
  status: H5ApplyStatus
  /** 方案附加配置快照（申请时） */
  customConfigs?: CustomConfigItem[]
  /** 附加配置已填答案 */
  customAnswers?: Record<string, string>
  auditNodes: { operator: string; role: string; action: string; time?: string; remark?: string }[]
  planUsage?: {
    planName: string
    startDate: string
    endDate: string
    planStatus: string
    remainTime: string
    extendedCount: number
    pendingExtendCount: number
  }
  extendRecords?: { applyTime: string; extendDays: number; status: string }[]
}

export interface ApiResult<T> {
  code: number
  data: T
  message: string
}

/** 冷冻期延期拦截提示 */
export const FREEZE_EXTEND_TIP =
  '试用的产品方案设有冷冻期，请在试用到期且冷冻期结束后再发起延期！'

/** 方案已占用不可再选（试用中 / 已到期 / 停用等） */
export const PLAN_ALREADY_APPLIED_TIP =
  '该机构已试用此方案，请前往机构统计页面确认！'

/** @deprecated 与 PLAN_ALREADY_APPLIED_TIP 相同，保留兼容 */
export const PLAN_OCCUPIED_ORG_STATS_TIP = PLAN_ALREADY_APPLIED_TIP

/** 消息通知类型 */
export type MessageNoticeKind = 'expire_soon' | 'todo_audit' | 'todo_process'

/** 消息通知列表项 */
export interface MessageNotification {
  id: number
  kind: MessageNoticeKind
  /** 如【待办通知】 */
  title: string
  /** 推送时间 */
  pushTime: string
  /** 关联工单 ID（待办/待处理） */
  orderId?: number
  /** 关联试用方案 ID（即将到期） */
  trialPlanId?: number
  orgName?: string
  planName?: string
  productName?: string
  applicant?: string
  applyTime?: string
  orderNo?: string
  applyType?: string
  remainTime?: string
  expireTime?: string
}
