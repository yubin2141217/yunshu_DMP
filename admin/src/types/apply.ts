/**
 * 申请管理模块类型定义
 */

/** 申请类型 */
export type ApplyType = '申请试用' | '申请关停' | '申请重置'

/** 工单状态（审核管理 / 人工处理共用存储） */
export type ApplyStatus =
  | '审核中'
  | '已驳回'
  | '已完结'
  | '已撤回'
  | '待人工处理'
  | '已归档'
  /** 人工处理环节驳回（与审核「已驳回」区分） */
  | '已拒绝'

/** 审核节点 */
export interface ApplyAuditNode {
  operator: string
  role: string
  action: string
  time?: string
  remark?: string
}

/** 方案使用信息（更换产品方案类工单） */
export interface ApplyPlanUsage {
  planName: string
  startDate: string
  endDate: string
  planStatus: string
  remainTime: string
  extendedCount: number
  pendingExtendCount: number
}

/** 延期记录 */
export interface ApplyExtendRecord {
  applyTime: string
  extendDays: number
  status: string
  remark?: string
}

/** 产品功能字段定义 */
export interface ApplyFeatureField {
  key: string
  label: string
  required: boolean
}

/** 产品方案设置 · 标识类型 */
export type ApplySetupIdType = 'planId' | 'orgId'

/** 工单附加配置项（申请提交时快照 + 填写值） */
export interface ApplyCustomConfigItem {
  /** 选项名称，最长 20 */
  name: string
  /** 控件：文本框 / 单选 / 多选 */
  control: 'input' | 'radio' | 'checkbox'
  /** 选项内容（仅单选/多选） */
  options?: string[]
  /** 提示信息 */
  tip?: string
  /** 是否必填 */
  required?: boolean
  /** 申请人填写/选择的值（多选用顿号拼接） */
  value: string
}

/** 申请工单 */
export interface ApplyOrder {
  id: number
  orderNo: string
  applicant: string
  applyTime: string
  applyType: ApplyType
  orgName: string
  productName: string
  productIntro: string
  planName: string
  planIntro: string
  trialTimeLabel: string
  freezeRule: string
  /** 冷冻期天数列表（与方案配置一致，用于详情表格展示） */
  freezeDays?: number[]
  sales: string
  currentAuditor: string
  status: ApplyStatus
  handler: string
  applyRemark: string
  /** 方案附加配置（申请时快照及填写结果） */
  customConfigs?: ApplyCustomConfigItem[]
  auditNodes: ApplyAuditNode[]
  planUsage?: ApplyPlanUsage
  extendRecords?: ApplyExtendRecord[]
  productFeatureFields?: ApplyFeatureField[]
  /** 人工处理录入的标识类型 */
  setupIdType?: ApplySetupIdType
  planId?: string
  /** 人工处理录入的机构ID（与方案ID二选一） */
  orgId?: string
  expireTime?: string
  productFeatures?: Record<string, string>
  processResult?: string
  processTime?: string
}

/** 列表查询参数 */
export interface ApplyListQuery {
  page?: number | string | null
  pageSize?: number | string | null
  /** 兼容旧关键字（工单ID或机构） */
  keyword?: string | null
  /** 工单ID */
  orderNo?: string | null
  /** 机构名称 */
  orgName?: string | null
  startDate?: string | null
  endDate?: string | null
  applyType?: ApplyType | string | null
  sales?: string | null
  productName?: string | null
  planName?: string | null
  pendingMine?: boolean | null
  currentUser?: string | null
  /** 处理人（人工处理「全部」筛选） */
  handler?: string | null
  /** 当前审核人（审核管理「全部」筛选） */
  currentAuditor?: string | null
  /** 审核状态 / 处理状态筛选 */
  status?: ApplyStatus | string | null
  /**
   * 人工处理列表范围
   * - todo：仅待人工处理（待我处理）
   * - all：待人工处理 + 已归档 + 已拒绝（全部）
   * - records：已归档 + 已拒绝（处理记录）
   */
  listScope?: 'todo' | 'all' | 'records' | null
}

/** 审核提交参数 */
export interface ApplyAuditPayload {
  id: number
  action: 'pass' | 'reject'
  remark?: string
  /** 当前操作人（须与工单当前审核人一致） */
  operator?: string
}

/** 人工处理提交参数 */
export interface ApplyManualPayload {
  id: number
  /** 标识类型：方案ID / 机构ID */
  setupIdType: ApplySetupIdType
  /** 对应类型下的标识值 */
  setupIdValue: string
  expireTime: string
  productFeatures?: Record<string, string>
  /** 当前操作人（须与工单处理人一致） */
  operator?: string
}

/** 人工处理驳回参数 */
export interface ApplyManualRejectPayload {
  id: number
  remark: string
  operator?: string
}
