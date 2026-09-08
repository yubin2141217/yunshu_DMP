/**
 * 试用管理 Mock 数据与函数
 */

import { getAllPlansData } from '@/mock/product'
import type {
  TrialApplyAuditNode,
  TrialApplyRecord,
  TrialHistoryRecord,
  TrialOrgDetail,
  TrialOrgItem,
  TrialOrgQuery,
  TrialPlanDetail,
  TrialPlanItem,
  TrialPlanQuery,
  TrialPlanStats,
  TrialPlanStatus
} from '@/types/trial'

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

export const unitOptions = ['西北-陕西', '华东-上海', '华南-广东', '华北-北京', '西南-四川']

function buildAuditNodes(
  applicant: string,
  applyTime: string,
  applyType: string,
  status: TrialApplyRecord['status'],
  remark?: string
): TrialApplyAuditNode[] {
  const day = applyTime.slice(0, 10)
  const nodes: TrialApplyAuditNode[] = [
    {
      operator: applicant,
      role: '销售',
      status: '已提交',
      time: applyTime,
      remark: remark ? `申请说明：${remark}` : undefined
    }
  ]
  if (status === 'reviewing') {
    nodes.push({
      operator: applicant,
      role: '雁塔区负责人',
      status: '自动跳过',
      time: applyTime,
      remark: '审核人和申请人相同，自动跳过'
    })
    nodes.push({ operator: '待审核', role: '陕西大区负责人', status: '审核中', time: '' })
    return nodes
  }
  nodes.push(
    {
      operator: '张三',
      role: '雁塔区负责人',
      status: '已通过',
      time: `${day} 17:55:55`,
      remark: '（雁塔区负责人）'
    },
    {
      operator: '祝亚林',
      role: '西安市负责人',
      status: '已通过',
      time: `${day} 17:56:22`,
      remark: '（西安市负责人）'
    },
    {
      operator: '张三',
      role: '陕西大区负责人',
      status: '自动跳过',
      time: `${day} 17:56:23`,
      remark: '该工单在之前审核环节已处理过，无需重复审核！'
    }
  )
  if (status === 'rejected') {
    nodes.push({
      operator: '张华',
      role: '董事长',
      status: '已驳回',
      time: `${day} 17:56:43`,
      remark: '不符合试用条件'
    })
    return nodes
  }
  nodes.push({
    operator: '张华',
    role: '董事长',
    status: '已通过',
    time: `${day} 17:56:43`,
    remark: '（董事长）'
  })
  if (status === 'processing') {
    nodes.push({
      operator: applicant,
      role: '方案处理人',
      status: '处理中',
      time: ''
    })
  } else if (status === 'archived') {
    nodes.push({
      operator: applicant,
      role: '方案处理人',
      status: '已通过',
      time: `${day} 17:57:51`,
      remark: applyType === '申请延期' ? '延期执行成功' : '人工处理执行成功'
    })
  }
  return nodes
}

function enrichApply(
  record: TrialApplyRecord,
  ctx: { orgName: string; productName: string; planName: string; remark?: string }
): TrialApplyRecord {
  return {
    ...record,
    orgName: ctx.orgName,
    productName: ctx.productName,
    planName: ctx.planName,
    auditNodes:
      record.auditNodes ||
      buildAuditNodes(record.applicant, record.applyTime, record.applyType, record.status, ctx.remark)
  }
}

const applyRecordsMap: Record<number, TrialApplyRecord[]> = {
  1: [
    {
      id: 101,
      ticketId: 'WO20260520001',
      applicant: '王兴',
      applyType: '申请试用',
      applyTime: '2026-05-15 10:30:00',
      status: 'archived'
    },
    {
      id: 102,
      ticketId: 'WO20260610002',
      applicant: '王兴',
      applyType: '申请延期',
      applyTime: '2026-06-10 14:20:00',
      status: 'archived'
    }
  ],
  2: [
    {
      id: 201,
      ticketId: 'WO20260401001',
      applicant: '刘洋',
      applyType: '申请试用',
      applyTime: '2026-03-28 09:15:00',
      status: 'archived'
    }
  ],
  3: [
    {
      id: 301,
      ticketId: 'WO20260525001',
      applicant: '陈静',
      applyType: '申请试用',
      applyTime: '2026-05-22 16:40:00',
      status: 'archived'
    },
    {
      id: 302,
      ticketId: 'WO20260715001',
      applicant: '陈静',
      applyType: '申请关停',
      applyTime: '2026-07-15 11:00:00',
      status: 'processing'
    }
  ],
  4: [
    {
      id: 401,
      ticketId: 'WO20260605001',
      applicant: '赵磊',
      applyType: '申请试用',
      applyTime: '2026-06-01 08:50:00',
      status: 'archived'
    }
  ],
  5: [
    {
      id: 501,
      ticketId: 'WO20260701001',
      applicant: '孙婷',
      applyType: '申请试用',
      applyTime: '2026-06-28 13:25:00',
      status: 'reviewing'
    },
    {
      id: 502,
      ticketId: 'WO20260804001',
      applicant: '孙婷',
      applyType: '手动关停',
      applyTime: '2026-08-04 10:15:00',
      status: 'archived'
    }
  ],
  6: [
    {
      id: 601,
      ticketId: 'WO20260518001',
      applicant: '周明',
      applyType: '申请试用',
      applyTime: '2026-05-16 10:00:00',
      status: 'archived'
    },
    {
      id: 602,
      ticketId: 'WO20260720001',
      applicant: '周明',
      applyType: '申请重置',
      applyTime: '2026-07-20 09:30:00',
      status: 'rejected'
    }
  ],
  7: [
    {
      id: 701,
      ticketId: 'WO20260420001',
      applicant: '吴华',
      applyType: '申请试用',
      applyTime: '2026-04-18 15:10:00',
      status: 'archived'
    }
  ],
  8: [
    {
      id: 801,
      ticketId: 'WO20260622001',
      applicant: '郑强',
      applyType: '申请试用',
      applyTime: '2026-06-20 11:45:00',
      status: 'archived'
    }
  ]
}

const historyRecordsMap: Record<string, TrialHistoryRecord[]> = {
  '1-1': [
    {
      id: 1001,
      productName: '数解舆情',
      planName: '三类机构-微信群-舆情推送试用',
      startTime: '2025-11-01',
      totalTrialDays: 30,
      endTime: '2025-12-01',
      extensionCount: 1,
      planId: 'YQ-SX-20251101',
      status: 'expired'
    }
  ],
  '2-1': [
    {
      id: 2001,
      productName: '数解舆情',
      planName: '三类机构-微信群-舆情推送试用',
      startTime: '2025-08-01',
      totalTrialDays: 30,
      endTime: '2025-09-01',
      extensionCount: 0,
      planId: 'YQ-TC-20250801',
      status: 'disabled'
    }
  ],
  '4-2': [
    {
      id: 4001,
      productName: '河图融媒体',
      planName: '河图融媒体基础版方案',
      startTime: '2026-01-10',
      totalTrialDays: 60,
      endTime: '2026-03-11',
      extensionCount: 0,
      planId: 'HT-SH-20260110',
      status: 'expired'
    }
  ]
}

const planDetails: TrialPlanDetail[] = [
  {
    id: 1,
    orgId: 1,
    orgName: '陕西省网信办',
    usageStatus: '正常使用',
    unit: '西北-陕西',
    sales: '王兴',
    productName: '数解舆情',
    planName: '三类机构-微信群-舆情推送试用',
    trialTimeLabel: '1个月',
    totalExtension: 2,
    freezeRule:
      '试用到期后进入7天冷冻期，冷冻期内不可再次申请试用；冷冻期结束后可申请重置试用。若15天内未续期则自动关停。',
    intro:
      '面向三类机构的微信群舆情推送试用方案，支持关键词监测、舆情预警推送、日报周报生成等核心功能，帮助机构快速体验舆情监测能力。',
    productFeatures: '微信群推送、关键词监测、舆情预警、日报生成',
    planId: 'YQ-SX-20260520',
    startDate: '2026-05-20',
    endDate: '2026-06-20',
    status: 'trialing',
    statusRemainTime: '剩余 12 天',
    extendedCount: 0,
    pendingExtensionCount: 0,
    applyRecords: applyRecordsMap[1],
    historyRecords: historyRecordsMap['1-1']
  },
  {
    id: 2,
    orgId: 2,
    orgName: '铜川市公安局',
    usageStatus: '已到期',
    unit: '西北-陕西',
    sales: '刘洋',
    productName: '数解舆情',
    planName: '三类机构-微信群-舆情推送试用',
    trialTimeLabel: '1个月',
    totalExtension: 2,
    freezeRule: '试用到期后进入7天冷冻期，冷冻期内不可再次申请试用。',
    intro: '面向三类机构的微信群舆情推送试用方案。',
    productFeatures: '微信群推送、关键词监测、舆情预警',
    planId: 'YQ-TC-20260401',
    startDate: '2026-04-01',
    endDate: '2026-05-01',
    status: 'expired',
    statusRemainTime: '已过期 87 天',
    extendedCount: 0,
    pendingExtensionCount: 0,
    applyRecords: applyRecordsMap[2],
    historyRecords: historyRecordsMap['2-1']
  },
  {
    id: 3,
    orgId: 3,
    orgName: '上海市网信办',
    usageStatus: '冻结中',
    unit: '华东-上海',
    sales: '陈静',
    productName: '数解舆情',
    planName: '一二类机构推送试用',
    trialTimeLabel: '45天',
    totalExtension: 1,
    freezeRule: '试用到期后进入10天冷冻期。',
    intro: '面向一二类机构的舆情推送试用，支持多维度舆情分析与专题追踪。',
    productFeatures: '精准推送、专题分析、舆情报告',
    planId: 'YQ-SH-20260525',
    startDate: '2026-05-25',
    endDate: '2026-07-09',
    status: 'frozen',
    statusRemainTime: '冷冻期剩余 5 天',
    extendedCount: 0,
    pendingExtensionCount: 0,
    applyRecords: applyRecordsMap[3],
    historyRecords: []
  },
  {
    id: 4,
    orgId: 4,
    orgName: '广东省应急管理厅',
    usageStatus: '正常使用',
    unit: '华南-广东',
    sales: '赵磊',
    productName: '河图融媒体',
    planName: '河图融媒体基础版方案',
    trialTimeLabel: '2个月',
    totalExtension: 0,
    freezeRule: '无冷冻期规则。',
    intro: '河图融媒体基础版试用方案，覆盖内容生产与基础传播能力。',
    productFeatures: '内容生产、栏目编排、基础传播、数据统计',
    planId: 'HT-GD-20260605',
    startDate: '2026-06-05',
    endDate: '2026-08-05',
    status: 'trialing',
    statusRemainTime: '剩余 9 天',
    extendedCount: 0,
    pendingExtensionCount: 0,
    applyRecords: applyRecordsMap[4],
    historyRecords: historyRecordsMap['4-2']
  },
  {
    id: 5,
    orgId: 5,
    orgName: '北京市网信办',
    usageStatus: '审核中',
    unit: '华北-北京',
    sales: '孙婷',
    productName: '数解舆情',
    planName: '三类机构-微信群-舆情推送试用',
    trialTimeLabel: '1个月',
    totalExtension: 2,
    freezeRule: '试用到期后进入7天冷冻期。',
    intro: '面向三类机构的微信群舆情推送试用方案。',
    productFeatures: '微信群推送、关键词监测',
    planId: 'YQ-BJ-20260701',
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    status: 'trialing',
    statusRemainTime: '剩余 4 天',
    extendedCount: 0,
    pendingExtensionCount: 1,
    applyRecords: applyRecordsMap[5],
    historyRecords: []
  },
  {
    id: 6,
    orgId: 6,
    orgName: '四川省公安厅',
    usageStatus: '手动关停',
    unit: '西南-四川',
    sales: '周明',
    productName: '数解舆情',
    planName: '一二类机构推送试用',
    trialTimeLabel: '45天',
    totalExtension: 1,
    freezeRule: '试用到期后进入10天冷冻期。',
    intro: '一二类机构推送试用方案。',
    productFeatures: '精准推送、专题分析',
    planId: 'YQ-SC-20260518',
    startDate: '2026-05-18',
    endDate: '2026-07-02',
    status: 'stopped',
    statusRemainTime: '已关停',
    extendedCount: 1,
    pendingExtensionCount: 0,
    applyRecords: applyRecordsMap[6],
    historyRecords: []
  },
  {
    id: 7,
    orgId: 7,
    orgName: '西安市教育局',
    usageStatus: '已到期',
    unit: '西北-陕西',
    sales: '吴华',
    productName: '全球眼',
    planName: '全球眼一二类机构试用',
    trialTimeLabel: '1个月',
    totalExtension: 1,
    freezeRule: '试用到期后进入7天冷冻期。',
    intro: '全球眼一二类机构试用方案。',
    productFeatures: '态势感知、可视化监测',
    planId: 'QQY-XA-20260420',
    startDate: '2026-04-20',
    endDate: '2026-05-20',
    status: 'expired',
    statusRemainTime: '已过期 37 天',
    extendedCount: 0,
    pendingExtensionCount: 0,
    applyRecords: applyRecordsMap[7],
    historyRecords: []
  },
  {
    id: 8,
    orgId: 8,
    orgName: '深圳市应急管理局',
    usageStatus: '正常使用',
    unit: '华南-广东',
    sales: '郑强',
    productName: '点点密信',
    planName: '点点密信一二类机构试用',
    trialTimeLabel: '1个月',
    totalExtension: 1,
    freezeRule: '无冷冻期规则。',
    intro: '点点密信一二类机构试用方案。',
    productFeatures: '密信通讯、安全协作',
    planId: 'DDMX-SZ-20260622',
    startDate: '2026-06-22',
    endDate: '2026-07-22',
    status: 'trialing',
    statusRemainTime: '剩余 26 天',
    extendedCount: 0,
    pendingExtensionCount: 0,
    applyRecords: applyRecordsMap[8],
    historyRecords: []
  }
]

function toPlanItem(d: TrialPlanDetail): TrialPlanItem {
  const trialDays =
    d.trialTimeLabel === '1个月' ? 30 : d.trialTimeLabel === '2个月' ? 60 : 45
  const expireDays = d.statusRemainTime.includes('剩余')
    ? parseInt(d.statusRemainTime.replace(/\D/g, ''), 10) || 0
    : -Math.abs(parseInt(d.statusRemainTime.replace(/\D/g, ''), 10) || 0)
  return {
    id: d.id,
    orgId: d.orgId,
    orgName: d.orgName,
    unit: d.unit,
    sales: d.sales,
    productName: d.productName,
    planName: d.planName,
    startDate: d.startDate,
    trialDays,
    endDate: d.endDate,
    expireDays,
    expireDesc: d.statusRemainTime,
    status: d.status,
    extendedCount: d.extendedCount,
    totalExtension: d.totalExtension,
    storeTime: `${d.startDate} 10:00:00`
  }
}

let trialPlans: TrialPlanItem[] = planDetails.map(toPlanItem).sort((a, b) =>
  b.storeTime.localeCompare(a.storeTime)
)

function calcStats(list: TrialPlanItem[]): TrialPlanStats {
  return {
    total: list.length,
    trialing: list.filter((i) => i.status === 'trialing').length,
    expired: list.filter((i) => i.status === 'expired').length,
    frozen: list.filter((i) => i.status === 'frozen').length,
    stopped: list.filter((i) => i.status === 'stopped').length
  }
}

function filterPlans(params: TrialPlanQuery): TrialPlanItem[] {
  let list = [...trialPlans]
  if (params.orgName) {
    const kw = String(params.orgName).trim()
    list = list.filter((i) => i.orgName.includes(kw))
  }
  if (params.unit) list = list.filter((i) => i.unit === params.unit)
  if (params.sales) {
    const kw = String(params.sales).trim()
    list = list.filter((i) => i.sales.includes(kw))
  }
  if (params.productName) {
    const kw = String(params.productName).trim()
    list = list.filter((i) => i.productName.includes(kw))
  }
  if (params.planName) {
    const kw = String(params.planName).trim()
    list = list.filter((i) => i.planName.includes(kw))
  }
  if (params.status) list = list.filter((i) => i.status === params.status)
  if (params.startDateBegin) {
    list = list.filter((i) => i.startDate >= String(params.startDateBegin))
  }
  if (params.startDateEnd) {
    list = list.filter((i) => i.startDate <= String(params.startDateEnd))
  }
  if (params.endDateBegin) {
    list = list.filter((i) => i.endDate >= String(params.endDateBegin))
  }
  if (params.endDateEnd) {
    list = list.filter((i) => i.endDate <= String(params.endDateEnd))
  }
  return list.sort((a, b) => b.storeTime.localeCompare(a.storeTime))
}

function buildOrgList(): TrialOrgItem[] {
  const map = new Map<number, TrialOrgItem>()
  trialPlans.forEach((p) => {
    const existing = map.get(p.orgId)
    const isNormal = p.status === 'trialing' ? 1 : 0
    if (existing) {
      existing.normalTrialCount += isNormal
      existing.totalTrialCount += 1
      if (p.storeTime < existing.firstJoinTime) existing.firstJoinTime = p.storeTime
    } else {
      map.set(p.orgId, {
        id: p.orgId,
        orgName: p.orgName,
        unit: p.unit,
        sales: p.sales,
        normalTrialCount: isNormal,
        totalTrialCount: 1,
        firstJoinTime: p.storeTime
      })
    }
  })
  return [...map.values()].sort((a, b) => b.firstJoinTime.localeCompare(a.firstJoinTime))
}

function filterOrgs(params: TrialOrgQuery): TrialOrgItem[] {
  let list = buildOrgList()
  if (params.orgName) {
    const kw = String(params.orgName).trim()
    list = list.filter((i) => i.orgName.includes(kw))
  }
  if (params.unit) list = list.filter((i) => i.unit === params.unit)
  if (params.sales) {
    const kw = String(params.sales).trim()
    list = list.filter((i) => i.sales.includes(kw))
  }
  return list
}

/** 获取统计单元选项 */
export async function getTrialUnitsMock() {
  await delay()
  return { code: 200, data: [...unitOptions], message: '获取成功' }
}

/** 分页查询全部方案列表 */
export async function getTrialPlanListMock(params: TrialPlanQuery = {}) {
  await delay()
  const filtered = filterPlans(params)
  const page = Number(params.page) || 1
  const pageSize = Number(params.pageSize) || 10
  const start = (page - 1) * pageSize
  const list = filtered.slice(start, start + pageSize)
  return {
    code: 200,
    data: {
      list,
      total: filtered.length,
      stats: calcStats(filtered)
    },
    message: '获取成功'
  }
}

/** 获取方案详情 */
export async function getTrialPlanDetailMock(id: number) {
  await delay()
  const item = planDetails.find((d) => d.id === id)
  if (!item) return { code: 404, data: null, message: '方案不存在' }
  const applyRecords = (item.applyRecords || []).map((r) =>
    enrichApply(r, {
      orgName: item.orgName,
      productName: item.productName,
      planName: item.planName,
      remark: r.applyType === '申请试用' ? `申请${item.planName}` : undefined
    })
  )
  return {
    code: 200,
    data: { ...item, applyRecords },
    message: '获取成功'
  }
}

/** 分页查询机构维度列表 */
export async function getTrialOrgListMock(params: TrialOrgQuery = {}) {
  await delay()
  const filtered = filterOrgs(params)
  const page = Number(params.page) || 1
  const pageSize = Number(params.pageSize) || 10
  const start = (page - 1) * pageSize
  const list = filtered.slice(start, start + pageSize)
  return {
    code: 200,
    data: { list, total: filtered.length },
    message: '获取成功'
  }
}

/** 获取机构详情 */
export async function getTrialOrgDetailMock(id: number) {
  await delay()
  const orgPlans = trialPlans.filter((p) => p.orgId === id)
  if (!orgPlans.length) return { code: 404, data: null, message: '机构不存在' }
  const first = orgPlans[0]
  const allApplyIds = orgPlans.map((p) => p.id)
  const applyRecords: TrialApplyRecord[] = []
  allApplyIds.forEach((pid) => {
    const records = applyRecordsMap[pid] || []
    records.forEach((r) => {
      if (!applyRecords.some((a) => a.id === r.id)) applyRecords.push(r)
    })
  })
  applyRecords.sort((a, b) => b.applyTime.localeCompare(a.applyTime))
  const enrichedRecords = applyRecords.map((r) => {
    const related = orgPlans.find((p) => (applyRecordsMap[p.id] || []).some((x) => x.id === r.id))
    return enrichApply(r, {
      orgName: first.orgName,
      productName: related?.productName || '',
      planName: related?.planName || ''
    })
  })
  const detail: TrialOrgDetail = {
    id,
    orgName: first.orgName,
    unit: first.unit,
    sales: first.sales,
    activePlanCount: orgPlans.filter((p) => p.status === 'trialing').length,
    totalPlanCount: orgPlans.length,
    plans: orgPlans.map((p) => {
      const productPlan = getAllPlansData().find((pl) => pl.name === p.planName)
      return {
        id: p.id,
        productPlanId: productPlan?.id ?? p.id,
        productName: p.productName,
        planName: p.planName,
        startDate: p.startDate,
        endDate: p.endDate,
        status: p.status,
        extendedCount: p.extendedCount,
        totalExtension: p.totalExtension
      }
    }),
    applyRecords: enrichedRecords
  }
  return { code: 200, data: detail, message: '获取成功' }
}

function markPlanStopped(planId: number): boolean {
  const listItem = trialPlans.find((p) => p.id === planId)
  const detailItem = planDetails.find((d) => d.id === planId)
  if (!listItem && !detailItem) return false
  if (listItem) {
    listItem.status = 'stopped'
    listItem.expireDesc = '已关停'
  }
  if (detailItem) {
    detailItem.status = 'stopped'
    detailItem.statusRemainTime = '已关停'
  }
  return true
}

/** 关停单个机构下的试用方案 */
export async function stopTrialPlanMock(planId: number) {
  await delay()
  const item = trialPlans.find((p) => p.id === planId)
  if (!item) return { code: 404, data: null, message: '方案不存在' }
  if (item.status === 'stopped') {
    return { code: 400, data: null, message: '该方案已关停' }
  }
  markPlanStopped(planId)
  return { code: 200, data: true, message: '关停成功' }
}

/** 关停机构下全部未关停的试用方案 */
export async function stopAllTrialPlansByOrgMock(orgId: number) {
  await delay()
  const orgPlans = trialPlans.filter((p) => p.orgId === orgId)
  if (!orgPlans.length) return { code: 404, data: null, message: '机构不存在' }
  const targets = orgPlans.filter((p) => p.status !== 'stopped')
  if (!targets.length) {
    return { code: 400, data: null, message: '当前无可关停的产品方案' }
  }
  targets.forEach((p) => markPlanStopped(p.id))
  return { code: 200, data: { count: targets.length }, message: '关停成功' }
}

/** 方案状态中文标签 */
export function trialStatusLabel(status: TrialPlanStatus): string {
  const map: Record<TrialPlanStatus, string> = {
    trialing: '试用中',
    expired: '已到期',
    frozen: '冻结中',
    stopped: '手动关停'
  }
  return map[status]
}

/** 方案状态 Tag 类型 */
export function trialStatusTagType(
  status: TrialPlanStatus
): 'success' | 'warning' | 'info' | 'danger' {
  const map: Record<TrialPlanStatus, 'success' | 'warning' | 'info' | 'danger'> = {
    trialing: 'success',
    expired: 'info',
    frozen: 'warning',
    stopped: 'danger'
  }
  return map[status]
}

/** 申请工单状态中文标签 */
export function applyStatusLabel(status: TrialApplyRecord['status']): string {
  const map: Record<TrialApplyRecord['status'], string> = {
    reviewing: '审核中',
    processing: '处理中',
    rejected: '未通过',
    archived: '已归档'
  }
  return map[status]
}

/** 历史方案状态中文标签 */
export function historyStatusLabel(status: TrialHistoryRecord['status']): string {
  return status === 'expired' ? '已到期' : '已关停'
}

export { trialPlans, planDetails }
