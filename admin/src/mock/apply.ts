/**
 * 申请管理 Mock 数据与函数
 */

import type {
  ApplyAuditPayload,
  ApplyListQuery,
  ApplyManualPayload,
  ApplyOrder,
  ApplyStatus
} from '@/types/apply'
import { matchAuditCompletedFilter } from '@/utils/apply-status'

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

const STATUS_ORDER: Record<ApplyStatus, number> = {
  审核中: 0,
  已驳回: 1,
  已撤回: 2,
  待人工处理: 3,
  已完结: 4,
  已归档: 5,
  已拒绝: 6
}

const defaultFeatureFields = [
  { key: 'pushGroup', label: '推送群数量', required: true },
  { key: 'keywords', label: '监测关键词数', required: false }
]

/** 工单详情演示用附加配置（挂在审核管理 / 人工处理列表首条） */
const demoCustomConfigs = [
  {
    name: '推送渠道',
    control: 'radio' as const,
    options: ['微信群', '企业微信', '邮件'],
    tip: '请选择推送渠道',
    required: true,
    value: '微信群'
  },
  {
    name: '监测渠道偏好',
    control: 'checkbox' as const,
    options: ['微信', '微博', '客户端', '网站', '短视频', '论坛'],
    tip: '可多选关注渠道，最多 6 项',
    required: true,
    value: '微信、微博、短视频'
  },
  {
    name: '是否需要微信群协助',
    control: 'radio' as const,
    options: ['是', '否'],
    tip: '如需协助建群请选择「是」',
    required: true,
    value: '否'
  },
  {
    name: '个性化研判',
    control: 'input' as const,
    options: [] as string[],
    tip: '请填写个性化研判需求',
    required: false,
    value: '需支持本地热点专题推送'
  },
  {
    name: '备注说明',
    control: 'input' as const,
    options: [] as string[],
    tip: '可选填写申请备注',
    required: false,
    value: '演示客户优先开通'
  }
]

let orders: ApplyOrder[] = [
  {
    id: 1,
    orderNo: 'SY202605010001',
    applicant: '王兴',
    applyTime: '2026-05-04 10:00:00',
    applyType: '申请试用',
    orgName: '陕西省网信办',
    productName: '数解舆情',
    productIntro: '舆情监测与分析产品',
    planName: '三类机构-微信群-舆情推送试用',
    planIntro: '面向三类机构的微信群舆情推送试用方案',
    trialTimeLabel: '1个月',
    freezeRule: '第7天、第15天',
    freezeDays: [7, 15],
    sales: '王兴',
    currentAuditor: '超级管理员',
    status: '审核中',
    handler: '张伟',
    applyRemark: '客户希望尽快开通试用，用于舆情监测演示。',
    customConfigs: demoCustomConfigs.map((item) => ({ ...item, options: [...item.options] })),
    auditNodes: [
      { operator: '王兴', role: '销售', action: '提交申请', time: '2026-05-04 10:00:00' },
      {
        operator: '王兴',
        role: '雁塔区负责人',
        action: '自动跳过',
        time: '2026-05-04 10:00:01',
        remark: '审核人和申请人相同，自动跳过'
      },
      { operator: '超级管理员', role: '陕西大区负责人', action: '审核中' }
    ],
    productFeatureFields: [...defaultFeatureFields]
  },
  {
    id: 2,
    orderNo: 'SY202605010002',
    applicant: '刘洋',
    applyTime: '2026-05-02 10:15:00',
    applyType: '申请关停',
    orgName: '铜川市公安局',
    productName: '数解舆情',
    productIntro: '舆情监测与分析产品',
    planName: '三类机构-微信群-舆情推送试用',
    planIntro: '面向三类机构的微信群舆情推送试用方案',
    trialTimeLabel: '1个月',
    freezeRule: '第7天、第15天',
    sales: '刘洋',
    currentAuditor: '李娜',
    status: '审核中',
    handler: '张伟',
    applyRemark: '试用期满，客户不再续用，申请关停。',
    auditNodes: [
      { operator: '刘洋', role: '销售', action: '提交申请', time: '2026-05-02 10:15:00' },
      { operator: '李娜', role: '直属领导', action: '审核中' }
    ]
  },
  {
    id: 3,
    orderNo: 'SY202605010003',
    applicant: '陈晨',
    applyTime: '2026-05-03 14:20:00',
    applyType: '申请重置',
    orgName: '杭州市某单位',
    productName: '数解舆情',
    productIntro: '舆情监测与分析产品',
    planName: '一二类机构推送试用',
    planIntro: '面向一二类机构的舆情推送试用',
    trialTimeLabel: '45天',
    freezeRule: '第10天',
    sales: '陈晨',
    currentAuditor: '王强',
    status: '审核中',
    handler: '张伟',
    applyRemark: '方案配置有误，需重置后重新开通。',
    auditNodes: [
      { operator: '陈晨', role: '销售', action: '提交申请', time: '2026-05-03 14:20:00' },
      { operator: '王强', role: '省区域负责人', action: '审核中' }
    ],
    extendRecords: [
      { applyTime: '2026-04-10 11:00:00', extendDays: 15, status: '已生效' },
      { applyTime: '2026-04-25 16:30:00', extendDays: 7, status: '待生效' }
    ]
  },
  {
    id: 4,
    orderNo: 'SY202605010004',
    applicant: '王兴',
    applyTime: '2026-04-28 08:45:00',
    applyType: '申请试用',
    orgName: '西安市某单位',
    productName: '数解舆情',
    productIntro: '舆情监测与分析产品',
    planName: '一二类机构推送试用',
    planIntro: '面向一二类机构的舆情推送试用',
    trialTimeLabel: '45天',
    freezeRule: '第10天',
    sales: '王兴',
    currentAuditor: '',
    status: '已驳回',
    handler: '张伟',
    applyRemark: '申请一二类机构推送试用方案。',
    auditNodes: [
      { operator: '王兴', role: '销售', action: '提交申请', time: '2026-04-28 08:45:00' },
      {
        operator: '李娜',
        role: '直属领导',
        action: '审核驳回',
        time: '2026-04-28 15:00:00',
        remark: '机构资质材料不完整，请补充后重新提交。'
      }
    ],
    planUsage: {
      planName: '三类机构-微信群-舆情推送试用',
      startDate: '2026-03-01',
      endDate: '2026-04-01',
      planStatus: '已到期',
      remainTime: '已过期 20 天',
      extendedCount: 1,
      pendingExtendCount: 0
    }
  },
  {
    id: 5,
    orderNo: 'SY202605010005',
    applicant: '刘洋',
    applyTime: '2026-04-20 11:00:00',
    applyType: '申请试用',
    orgName: '苏州市某单位',
    productName: '数解舆情',
    productIntro: '舆情监测与分析产品',
    planName: '三类机构-微信群-舆情推送试用',
    planIntro: '面向三类机构的微信群舆情推送试用方案',
    trialTimeLabel: '1个月',
    freezeRule: '第7天、第15天',
    freezeDays: [7, 15],
    sales: '刘洋',
    currentAuditor: '',
    status: '待人工处理',
    handler: '超级管理员',
    applyRemark: '新客户试用申请，已通过全部审核节点。',
    customConfigs: demoCustomConfigs.map((item) => ({ ...item, options: [...item.options] })),
    auditNodes: [
      { operator: '刘洋', role: '销售', action: '提交申请', time: '2026-04-20 11:00:00' },
      {
        operator: '张三',
        role: '雁塔区负责人',
        action: '审核通过',
        time: '2026-04-20 14:00:00',
        remark: '（雁塔区负责人）'
      },
      {
        operator: '李娜',
        role: '西安市负责人',
        action: '审核通过',
        time: '2026-04-20 16:30:00',
        remark: '（西安市负责人）'
      },
      {
        operator: '张三',
        role: '陕西大区负责人',
        action: '自动跳过',
        time: '2026-04-20 16:30:01',
        remark: '该工单在之前审核环节已处理过，无需重复审核！'
      },
      {
        operator: '赵敏',
        role: '董事长',
        action: '审核通过',
        time: '2026-04-21 09:00:00',
        remark: '（董事长）'
      },
      { operator: '超级管理员', role: '方案处理人', action: '待人工处理' }
    ],
    productFeatureFields: [...defaultFeatureFields]
  },
  {
    id: 6,
    orderNo: 'SY202605010006',
    applicant: '陈晨',
    applyTime: '2026-04-15 16:30:00',
    applyType: '申请重置',
    orgName: '南京市某单位',
    productName: '河图融媒体',
    productIntro: '融媒体内容生产与传播协同平台',
    planName: '河图融媒体基础版方案',
    planIntro: '河图融媒体基础版试用方案',
    trialTimeLabel: '2个月',
    freezeRule: '无',
    sales: '陈晨',
    currentAuditor: '',
    status: '待人工处理',
    handler: '超级管理员',
    applyRemark: '重置试用方案，更换处理参数。',
    auditNodes: [
      { operator: '陈晨', role: '销售', action: '提交申请', time: '2026-04-15 16:30:00' },
      { operator: '赵敏', role: '直属领导', action: '审核通过', time: '2026-04-16 10:00:00' },
      { operator: '超级管理员', role: '方案处理人', action: '待人工处理' }
    ],
    extendRecords: [{ applyTime: '2026-04-01 09:00:00', extendDays: 30, status: '已生效' }],
    productFeatureFields: [{ key: 'columnCount', label: '栏目数量', required: true }]
  },
  {
    id: 7,
    orderNo: 'SY202605010007',
    applicant: '王兴',
    applyTime: '2026-04-10 09:00:00',
    applyType: '申请试用',
    orgName: '上海市某单位',
    productName: '数解舆情',
    productIntro: '舆情监测与分析产品',
    planName: '三类机构-微信群-舆情推送试用',
    planIntro: '面向三类机构的微信群舆情推送试用方案',
    trialTimeLabel: '1个月',
    freezeRule: '第7天、第15天',
    sales: '王兴',
    currentAuditor: '',
    status: '已归档',
    handler: '超级管理员',
    applyRemark: '已完成人工处理并开通试用。',
    auditNodes: [
      { operator: '王兴', role: '销售', action: '提交申请', time: '2026-04-10 09:00:00' },
      {
        operator: '王兴',
        role: '雁塔区负责人',
        action: '自动跳过',
        time: '2026-04-10 09:00:01',
        remark: '审核人和申请人相同，自动跳过'
      },
      {
        operator: '张三',
        role: '西安市负责人',
        action: '审核通过',
        time: '2026-04-10 11:00:00',
        remark: '（西安市负责人）'
      },
      {
        operator: '张三',
        role: '陕西大区负责人',
        action: '自动跳过',
        time: '2026-04-10 11:00:01',
        remark: '该工单在之前审核环节已处理过，无需重复审核！'
      },
      { operator: '张伟', role: '方案处理人', action: '人工处理完成', time: '2026-04-11 10:30:00' }
    ],
    planId: 'PLAN-SY-001',
    expireTime: '2026-05-11 23:59:59',
    productFeatures: { pushGroup: '5', keywords: '100' },
    processResult: '处理成功',
    processTime: '2026-04-11 10:30:00',
    productFeatureFields: [...defaultFeatureFields]
  },
  {
    id: 9,
    orderNo: 'SY202605010009',
    applicant: '李娜',
    applyTime: '2026-04-08 14:00:00',
    applyType: '申请试用',
    orgName: '杭州市某单位',
    productName: '河图融媒体',
    productIntro: '融媒体内容生产与传播协同平台',
    planName: '河图融媒体基础版方案',
    planIntro: '河图融媒体基础版试用方案',
    trialTimeLabel: '2个月',
    freezeRule: '无',
    sales: '李娜',
    currentAuditor: '',
    status: '已拒绝',
    handler: '超级管理员',
    applyRemark: '申请试用，人工处理时因方案参数不匹配被拒绝。',
    auditNodes: [
      { operator: '李娜', role: '销售', action: '提交申请', time: '2026-04-08 14:00:00' },
      { operator: '赵敏', role: '直属领导', action: '审核通过', time: '2026-04-08 16:00:00' },
      {
        operator: '超级管理员',
        role: '方案处理人',
        action: '人工处理驳回',
        time: '2026-04-09 10:00:00',
        remark: '方案ID与机构类型不匹配，请调整后重新提交。'
      }
    ],
    processResult: '已拒绝',
    processTime: '2026-04-09 10:00:00',
    productFeatureFields: [{ key: 'columnCount', label: '栏目数量', required: true }]
  },
  {
    id: 8,
    orderNo: 'SY202605010008',
    applicant: '刘洋',
    applyTime: '2026-04-05 13:20:00',
    applyType: '申请关停',
    orgName: '北京市某单位',
    productName: '数解舆情',
    productIntro: '舆情监测与分析产品',
    planName: '一二类机构推送试用',
    planIntro: '面向一二类机构的舆情推送试用',
    trialTimeLabel: '45天',
    freezeRule: '第10天',
    sales: '刘洋',
    currentAuditor: '',
    status: '已完结',
    handler: '张伟',
    applyRemark: '客户主动申请关停试用。',
    auditNodes: [
      { operator: '刘洋', role: '销售', action: '提交申请', time: '2026-04-05 13:20:00' },
      { operator: '李娜', role: '直属领导', action: '审核通过', time: '2026-04-05 15:00:00' }
    ],
    processResult: '处理成功',
    processTime: '2026-04-05 15:00:00'
  },
  {
    id: 9,
    orderNo: 'SY202605010009',
    applicant: '陈晨',
    applyTime: '2026-04-08 10:00:00',
    applyType: '申请试用',
    orgName: '成都市某单位',
    productName: '数解舆情',
    productIntro: '舆情监测与分析产品',
    planName: '三类机构-微信群-舆情推送试用',
    planIntro: '面向三类机构的微信群舆情推送试用方案',
    trialTimeLabel: '1个月',
    freezeRule: '第7天、第15天',
    sales: '陈晨',
    currentAuditor: '',
    status: '已撤回',
    handler: '张伟',
    applyRemark: '申请人主动撤回试用申请。',
    auditNodes: [
      { operator: '陈晨', role: '销售', action: '提交申请', time: '2026-04-08 10:00:00' },
      {
        operator: '陈晨',
        role: '销售',
        action: '已撤回',
        time: '2026-04-08 11:20:00',
        remark: '客户暂缓开通，主动撤回。'
      }
    ]
  }
]

function nowStr() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
}

function filterList(list: ApplyOrder[], params: ApplyListQuery) {
  let result = [...list]
  if (params.orderNo) {
    const kw = String(params.orderNo)
    result = result.filter((item) => item.orderNo.includes(kw))
  }
  if (params.orgName) {
    const kw = String(params.orgName)
    result = result.filter((item) => item.orgName.includes(kw))
  }
  if (params.keyword) {
    const kw = String(params.keyword)
    result = result.filter((item) => item.orderNo.includes(kw) || item.orgName.includes(kw))
  }
  if (params.startDate) {
    result = result.filter((item) => item.applyTime.slice(0, 10) >= String(params.startDate))
  }
  if (params.endDate) {
    result = result.filter((item) => item.applyTime.slice(0, 10) <= String(params.endDate))
  }
  if (params.applyType) {
    result = result.filter((item) => item.applyType === params.applyType)
  }
  if (params.sales) {
    const kw = String(params.sales)
    result = result.filter((item) => item.sales.includes(kw))
  }
  if (params.productName) {
    const kw = String(params.productName)
    result = result.filter((item) => item.productName.includes(kw))
  }
  if (params.planName) {
    const kw = String(params.planName)
    result = result.filter((item) => item.planName.includes(kw))
  }
  if (params.handler) {
    const kw = String(params.handler)
    result = result.filter((item) => item.handler.includes(kw))
  }
  if (params.currentAuditor) {
    const kw = String(params.currentAuditor)
    result = result.filter((item) => item.currentAuditor.includes(kw))
  }
  if (params.status) {
    if (params.status === '已完结') {
      result = result.filter((item) => matchAuditCompletedFilter(item.status))
    } else {
      result = result.filter((item) => item.status === params.status)
    }
  }
  return result
}

function sortAuditList(list: ApplyOrder[]) {
  list.sort((a, b) => {
    const sa = STATUS_ORDER[a.status] ?? 99
    const sb = STATUS_ORDER[b.status] ?? 99
    if (sa !== sb) return sa - sb
    return a.applyTime < b.applyTime ? 1 : -1
  })
}

/** 审核管理列表 */
export async function getApplyAuditListMock(params: ApplyListQuery = {}) {
  await delay()
  let list = filterList(orders, params)
  if (params.pendingMine && params.currentUser) {
    const user = String(params.currentUser)
    list = list.filter((item) => item.status === '审核中' && item.currentAuditor === user)
  }
  sortAuditList(list)
  const page = Number(params.page) || 1
  const pageSize = Number(params.pageSize) || 10
  const total = list.length
  const start = (page - 1) * pageSize
  return {
    code: 200,
    data: { list: list.slice(start, start + pageSize), total },
    message: '获取成功'
  }
}

/**
 * 人工处理统一列表
 * - all：待人工处理 + 已归档 + 已拒绝
 * - todo / pendingMine：仅待人工处理（可限定处理人=当前用户）
 * - records：已归档 + 已拒绝
 */
export async function getApplyTodoListMock(params: ApplyListQuery = {}) {
  await delay()
  const scope = params.listScope || (params.pendingMine ? 'todo' : 'all')
  const statusPool =
    scope === 'records'
      ? (['已归档', '已拒绝'] as const)
      : scope === 'todo'
        ? (['待人工处理'] as const)
        : (['待人工处理', '已归档', '已拒绝'] as const)

  let list = filterList(
    orders.filter((item) => (statusPool as readonly string[]).includes(item.status)),
    params
  )
  if (params.pendingMine && params.currentUser) {
    const user = String(params.currentUser)
    list = list.filter((item) => item.handler === user)
  }
  list.sort((a, b) => {
    if (a.status === '待人工处理' && b.status !== '待人工处理') return -1
    if (a.status !== '待人工处理' && b.status === '待人工处理') return 1
    const ta = a.processTime || a.applyTime
    const tb = b.processTime || b.applyTime
    return ta < tb ? 1 : -1
  })
  const page = Number(params.page) || 1
  const pageSize = Number(params.pageSize) || 10
  const total = list.length
  const start = (page - 1) * pageSize
  return {
    code: 200,
    data: { list: list.slice(start, start + pageSize), total },
    message: '获取成功'
  }
}

/**
 * 处理记录列表（已归档 + 已拒绝）
 * 展示权限范围内人工处理结果，支持按处理状态筛选
 */
export async function getApplyRecordsListMock(params: ApplyListQuery = {}) {
  return getApplyTodoListMock({ ...params, listScope: 'records', pendingMine: null })
}

/** 工单详情 */
export async function getApplyDetailMock(id: number) {
  await delay()
  const item = orders.find((o) => o.id === id)
  if (!item) return { code: 404, data: null, message: '工单不存在' }
  return { code: 200, data: { ...item, auditNodes: [...item.auditNodes] }, message: '获取成功' }
}

/** 审核通过/驳回 */
export async function auditApplyMock(payload: ApplyAuditPayload) {
  await delay()
  const item = orders.find((o) => o.id === payload.id)
  if (!item) return { code: 404, data: null, message: '工单不存在' }
  if (item.status !== '审核中') return { code: 400, data: null, message: '当前状态不可审核' }
  if (payload.operator && item.currentAuditor && payload.operator !== item.currentAuditor) {
    return { code: 403, data: null, message: '仅当前审核人可操作' }
  }

  const time = nowStr()
  if (payload.action === 'reject') {
    if (!payload.remark?.trim()) {
      return { code: 400, data: null, message: '请填写审核意见' }
    }
    if (payload.remark.length > 500) {
      return { code: 400, data: null, message: '审核意见不能超过500字' }
    }
    const auditor = item.currentAuditor || '审核人'
    item.auditNodes = item.auditNodes.filter((n) => n.action !== '审核中')
    item.auditNodes.push({
      operator: auditor,
      role: '审核人',
      action: '审核驳回',
      time,
      remark: payload.remark
    })
    item.status = '已驳回'
    item.currentAuditor = ''
    return { code: 200, data: item, message: '已驳回' }
  }

  const auditor = item.currentAuditor || '审核人'
  item.auditNodes = item.auditNodes.filter((n) => n.action !== '审核中')
  item.auditNodes.push({
    operator: auditor,
    role: '审核人',
    action: '审核通过',
    time
  })

  if (item.applyType === '申请试用') {
    item.status = '待人工处理'
    item.currentAuditor = ''
    item.auditNodes.push({
      operator: item.handler,
      role: '方案处理人',
      action: '待人工处理'
    })
  } else {
    item.status = '已完结'
    item.currentAuditor = ''
    item.processResult = '处理成功'
    item.processTime = time
  }
  return { code: 200, data: item, message: '审核通过' }
}

/** 人工处理 / 已归档后修改方案设置 */
export async function manualInterveneApplyMock(payload: ApplyManualPayload) {
  await delay()
  const item = orders.find((o) => o.id === payload.id)
  if (!item) return { code: 404, data: null, message: '工单不存在' }
  if (item.status !== '待人工处理' && item.status !== '已归档') {
    return { code: 400, data: null, message: '当前状态不可处理' }
  }
  if (payload.operator && item.handler && payload.operator !== item.handler) {
    return { code: 403, data: null, message: '仅指定处理人可操作' }
  }
  const idValue = payload.setupIdValue?.trim() || ''
  if (!idValue) {
    return {
      code: 400,
      data: null,
      message: payload.setupIdType === 'orgId' ? '请填写机构ID' : '请填写方案ID'
    }
  }
  if (!payload.expireTime) return { code: 400, data: null, message: '请选择到期时间' }

  if (idValue.includes('fail')) {
    return {
      code: 400,
      data: null,
      message:
        payload.setupIdType === 'orgId'
          ? '返回错误，请检查机构ID是否匹配'
          : '返回错误，请检查方案ID是否匹配'
    }
  }

  const time = nowStr()
  const isArchivedEdit = item.status === '已归档'
  item.setupIdType = payload.setupIdType
  if (payload.setupIdType === 'orgId') {
    item.orgId = idValue
    item.planId = item.planId || ''
  } else {
    item.planId = idValue
    item.orgId = ''
  }
  item.expireTime = payload.expireTime
  item.productFeatures = payload.productFeatures ? { ...payload.productFeatures } : {}

  if (isArchivedEdit) {
    item.auditNodes.push({
      operator: item.handler,
      role: '方案处理人',
      action: '修改产品方案设置',
      time
    })
    return { code: 200, data: item, message: '修改成功' }
  }

  item.status = '已归档'
  item.processResult = '处理成功'
  item.processTime = time
  item.auditNodes = item.auditNodes.filter((n) => n.action !== '待人工处理')
  item.auditNodes.push({
    operator: item.handler,
    role: '方案处理人',
    action: '人工处理完成',
    time
  })
  return { code: 200, data: item, message: '处理成功' }
}

/** 人工处理驳回 */
export async function manualRejectApplyMock(payload: {
  id: number
  remark: string
  operator?: string
}) {
  await delay()
  const item = orders.find((o) => o.id === payload.id)
  if (!item) return { code: 404, data: null, message: '工单不存在' }
  if (item.status !== '待人工处理') {
    return { code: 400, data: null, message: '当前状态不可驳回' }
  }
  if (payload.operator && item.handler && payload.operator !== item.handler) {
    return { code: 403, data: null, message: '仅指定处理人可操作' }
  }
  const remark = String(payload.remark || '').trim()
  if (!remark) return { code: 400, data: null, message: '请填写驳回意见' }
  if (remark.length > 500) return { code: 400, data: null, message: '驳回意见不超过500字' }

  const time = nowStr()
  item.status = '已拒绝'
  item.processResult = '已拒绝'
  item.processTime = time
  item.auditNodes = item.auditNodes.filter((n) => n.action !== '待人工处理')
  item.auditNodes.push({
    operator: item.handler,
    role: '方案处理人',
    action: '人工处理驳回',
    time,
    remark
  })
  return { code: 200, data: item, message: '已拒绝' }
}
