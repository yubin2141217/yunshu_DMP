/**
 * 产品方案管理 Mock 数据与函数
 */

import type {
  CustomConfigItem,
  OrgStatItem,
  OrgStatsQuery,
  Plan,
  PlanStatsQuery,
  Product,
  ProductQuery,
  ProductTrialOrgItem,
  ProductTrialOrgQuery
} from '@/types/product'
import { offlineLogo } from './offlineLogo'

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

export const orgTypeOptions = ['一类', '二类', '三类']
export const regionOptions = ['华北', '华东', '华南', '华中', '西南', '西北', '东北']
export const handlerOptions = ['张伟', '李娜', '王强', '赵敏']

let nextProductId = 6
let nextPlanId = 9
let products: Product[] = [
  {
    id: 1,
    name: '数解舆情',
    logo: offlineLogo('数解', 'shujie'),
    intro:
      '舆情监测与分析产品，面向宣传、网信及政务相关业务单位，提供全网信息汇聚、关键词监测、风险识别、热点追踪、群推送与日报周报生成能力。支持多源数据接入、敏感事件预警、传播路径分析与效果评估，帮助一线人员快速发现风险苗头并形成可落地的研判结论。产品可按机构类型与区域灵活开放试用，配套方案支持试用期配置、延期与冷冻期规则，便于销售演示核心能力并沉淀试用反馈。同时提供专题库管理、历史回溯检索与多端协同查看，满足日常值班与专项任务场景下的持续跟踪与汇报需求，并可按权限分级开放查看范围与操作能力，保障业务协同效率与信息安全可控，适合快速上手与规模化推广落地应用场景，助力业务闭环管理与持续优化。',
    owner: '张伟',
    displayStatus: 1,
    orgTypes: [...orgTypeOptions],
    regions: [...regionOptions],
    planCount: 2,
    trialOrgCount: 3,
    sortOrder: 1,
    hasTrial: true,
    createTime: '2026-05-10 10:00:00'
  },
  {
    id: 2,
    name: '河图融媒体',
    logo: offlineLogo('河图', 'hetu'),
    intro: '融媒体内容生产与传播协同平台',
    owner: '李娜',
    displayStatus: 1,
    orgTypes: ['一类', '二类', '三类'],
    regions: [...regionOptions],
    planCount: 2,
    trialOrgCount: 2,
    sortOrder: 2,
    hasTrial: true,
    createTime: '2026-05-12 14:20:00'
  },
  {
    id: 3,
    name: '数据研判标注系统',
    logo: offlineLogo('研判', 'yanpan'),
    intro: '数据采集、标注与个性化研判能力',
    owner: '王强',
    displayStatus: 1,
    orgTypes: ['一类', '二类', '三类'],
    regions: ['华北', '华东', '西北'],
    planCount: 2,
    trialOrgCount: 1,
    sortOrder: 3,
    hasTrial: true,
    createTime: '2026-05-15 09:00:00'
  },
  {
    id: 4,
    name: '全球眼',
    logo: offlineLogo('全球', 'quanqiuyan'),
    intro: '全域态势感知与可视化监测产品',
    owner: '赵敏',
    displayStatus: 1,
    orgTypes: ['一类', '二类'],
    regions: [...regionOptions],
    planCount: 1,
    trialOrgCount: 1,
    sortOrder: 4,
    hasTrial: true,
    createTime: '2026-05-18 11:00:00'
  },
  {
    id: 5,
    name: '点点密信',
    logo: offlineLogo('点点', 'diandian'),
    intro: '安全即时通讯与密信协作产品',
    owner: '张伟',
    displayStatus: 1,
    orgTypes: ['一类', '二类'],
    regions: [...regionOptions],
    planCount: 1,
    trialOrgCount: 0,
    sortOrder: 5,
    hasTrial: false,
    createTime: '2026-05-20 16:00:00'
  }
]

/** 产品维度试用机构统计（供列表「试用机构数量」下钻） */
let productTrialOrgs: ProductTrialOrgItem[] = [
  {
    id: 1,
    productId: 1,
    orgName: '陕西省网信办',
    status: '试用中',
    startTime: '2026-05-20 00:00:00',
    endTime: '2026-06-20 23:59:59'
  },
  {
    id: 2,
    productId: 1,
    orgName: '铜川市公安局',
    status: '已过期',
    startTime: '2026-03-01 00:00:00',
    endTime: '2026-04-01 23:59:59'
  },
  {
    id: 3,
    productId: 1,
    orgName: '西安市某单位',
    status: '申请中',
    startTime: '2026-08-10 09:00:00',
    endTime: '—'
  },
  {
    id: 4,
    productId: 2,
    orgName: '杭州市某单位',
    status: '试用中',
    startTime: '2026-06-01 00:00:00',
    endTime: '2026-08-01 23:59:59'
  },
  {
    id: 5,
    productId: 2,
    orgName: '成都市某单位',
    status: '已过期',
    startTime: '2026-02-01 00:00:00',
    endTime: '2026-04-01 23:59:59'
  },
  {
    id: 6,
    productId: 3,
    orgName: '南京市某单位',
    status: '试用中',
    startTime: '2026-07-01 00:00:00',
    endTime: '2026-08-01 23:59:59'
  },
  {
    id: 7,
    productId: 4,
    orgName: '苏州市某单位',
    status: '申请中',
    startTime: '2026-08-12 10:00:00',
    endTime: '—'
  }
]

let plans: Plan[] = [
  {
    id: 1,
    productId: 1,
    productName: '数解舆情',
    name: '三类机构-微信群-舆情推送试用',
    intro: '面向三类机构的微信群舆情推送试用方案',
    displayStatus: 1,
    trialTimeType: '1m',
    trialDays: null,
    trialTimeLabel: '1个月',
    extensionType: '2',
    extensionCount: 2,
    freezeDays: [7, 15],
    auditLeaders: ['直属领导'],
    auditProvince: '省区域负责人',
    auditChairman: '董事长',
    handler: '张伟',
    accessApi: 'https://api.example.com/shujie/trial',
    validationConfig: '',
    extendConfig: 'https://product.example.com/extend',
    stopConfig: 'https://product.example.com/stop',
    customConfigs: [
      {
        name: '推送渠道',
        control: 'radio',
        options: ['微信群', '企业微信', '邮件'],
        tip: '请选择推送渠道',
        required: true,
        defaultIndexes: [0]
      },
      {
        name: '备注说明',
        control: 'input',
        options: [],
        tip: '可选填写申请备注',
        required: false,
        defaultIndexes: []
      }
    ],
    allowRepeatApply: false,
    useOrgCount: 5,
    trialOrgCount: 2,
    expireOrgCount: 2,
    freezeOrgCount: 1,
    stopOrgCount: 0,
    hasTrial: true,
    createTime: '2026-05-10 11:00:00'
  },
  {
    id: 2,
    productId: 1,
    productName: '数解舆情',
    name: '一二类机构推送试用',
    intro: '面向一二类机构的舆情推送试用',
    displayStatus: 1,
    trialTimeType: 'custom',
    trialDays: 45,
    trialTimeLabel: '45天',
    extensionType: '1',
    extensionCount: 1,
    freezeDays: [10],
    auditLeaders: ['直属领导'],
    auditProvince: '省区域负责人',
    auditChairman: '董事长',
    handler: '张伟',
    accessApi: 'https://api.example.com/shujie/trial',
    validationConfig: '',
    extendConfig: 'https://product.example.com/extend2',
    stopConfig: 'https://product.example.com/stop2',
    customConfigs: [],
    allowRepeatApply: true,
    useOrgCount: 3,
    trialOrgCount: 1,
    expireOrgCount: 1,
    freezeOrgCount: 0,
    stopOrgCount: 1,
    hasTrial: true,
    createTime: '2026-05-11 09:30:00'
  },
  {
    id: 3,
    productId: 2,
    productName: '河图融媒体',
    name: '河图融媒体基础版方案',
    intro: '河图融媒体基础版试用方案',
    displayStatus: 1,
    trialTimeType: '2m',
    trialDays: null,
    trialTimeLabel: '2个月',
    extensionType: '1',
    extensionCount: 1,
    freezeDays: [0],
    auditLeaders: ['直属领导'],
    auditProvince: '省区域负责人',
    auditChairman: '董事长',
    handler: '李娜',
    accessApi: 'https://api.example.com/hetu/trial',
    validationConfig: '',
    extendConfig: 'https://hetu.example.com/extend',
    stopConfig: 'https://hetu.example.com/stop',
    customConfigs: [],
    allowRepeatApply: false,
    useOrgCount: 3,
    trialOrgCount: 2,
    expireOrgCount: 0,
    freezeOrgCount: 0,
    stopOrgCount: 1,
    hasTrial: true,
    createTime: '2026-05-12 15:00:00'
  },
  {
    id: 4,
    productId: 2,
    productName: '河图融媒体',
    name: '河图融媒体VIP版方案',
    intro: '河图融媒体VIP版试用方案',
    displayStatus: 1,
    trialTimeType: '3m',
    trialDays: null,
    trialTimeLabel: '3个月',
    extensionType: '2',
    extensionCount: 2,
    freezeDays: [7, 15],
    auditLeaders: ['直属领导'],
    auditProvince: '省区域负责人',
    auditChairman: '董事长',
    handler: '李娜',
    accessApi: 'https://api.example.com/hetu/trial',
    validationConfig: '',
    extendConfig: 'https://hetu.example.com/vip/extend',
    stopConfig: 'https://hetu.example.com/vip/stop',
    customConfigs: [],
    allowRepeatApply: false,
    useOrgCount: 1,
    trialOrgCount: 1,
    expireOrgCount: 0,
    freezeOrgCount: 0,
    stopOrgCount: 0,
    hasTrial: true,
    createTime: '2026-05-13 10:00:00'
  },
  {
    id: 5,
    productId: 3,
    productName: '数据研判标注系统',
    name: '个性化研判',
    intro: '个性化研判试用方案',
    displayStatus: 1,
    trialTimeType: '1m',
    trialDays: null,
    trialTimeLabel: '1个月',
    extensionType: '1',
    extensionCount: 1,
    freezeDays: [5],
    auditLeaders: ['直属领导'],
    auditProvince: '省区域负责人',
    auditChairman: '董事长',
    handler: '王强',
    accessApi: 'https://api.example.com/yanpan/trial',
    validationConfig: '',
    extendConfig: 'https://yanpan.example.com/extend',
    stopConfig: 'https://yanpan.example.com/stop',
    customConfigs: [],
    allowRepeatApply: false,
    useOrgCount: 1,
    trialOrgCount: 1,
    expireOrgCount: 0,
    freezeOrgCount: 0,
    stopOrgCount: 0,
    hasTrial: true,
    createTime: '2026-05-15 10:30:00'
  },
  {
    id: 6,
    productId: 3,
    productName: '数据研判标注系统',
    name: '一二类机构个性化研判',
    intro: '面向一二类机构的个性化研判试用方案',
    displayStatus: 1,
    trialTimeType: 'custom',
    trialDays: 45,
    trialTimeLabel: '45天',
    extensionType: '1',
    extensionCount: 1,
    freezeDays: [7],
    auditLeaders: ['直属领导'],
    auditProvince: '省区域负责人',
    auditChairman: '董事长',
    handler: '王强',
    accessApi: 'https://api.example.com/yanpan/trial',
    validationConfig: '',
    extendConfig: 'https://yanpan.example.com/extend2',
    stopConfig: 'https://yanpan.example.com/stop2',
    customConfigs: [],
    allowRepeatApply: false,
    useOrgCount: 0,
    trialOrgCount: 0,
    expireOrgCount: 0,
    freezeOrgCount: 0,
    stopOrgCount: 0,
    hasTrial: false,
    createTime: '2026-05-16 11:00:00'
  },
  {
    id: 7,
    productId: 4,
    productName: '全球眼',
    name: '全球眼一二类机构试用',
    intro: '全球眼一二类机构试用方案',
    displayStatus: 1,
    trialTimeType: '1m',
    trialDays: null,
    trialTimeLabel: '1个月',
    extensionType: '1',
    extensionCount: 1,
    freezeDays: [7],
    auditLeaders: ['直属领导'],
    auditProvince: '省区域负责人',
    auditChairman: '董事长',
    handler: '赵敏',
    accessApi: 'https://api.example.com/quanqiuyan/trial',
    validationConfig: '',
    extendConfig: 'https://quanqiuyan.example.com/extend',
    stopConfig: 'https://quanqiuyan.example.com/stop',
    customConfigs: [],
    allowRepeatApply: false,
    useOrgCount: 1,
    trialOrgCount: 0,
    expireOrgCount: 1,
    freezeOrgCount: 0,
    stopOrgCount: 0,
    hasTrial: true,
    createTime: '2026-05-18 11:30:00'
  },
  {
    id: 8,
    productId: 5,
    productName: '点点密信',
    name: '点点密信一二类机构试用',
    intro: '点点密信一二类机构试用方案',
    displayStatus: 1,
    trialTimeType: '1m',
    trialDays: null,
    trialTimeLabel: '1个月',
    extensionType: '1',
    extensionCount: 1,
    freezeDays: [0],
    auditLeaders: ['直属领导'],
    auditProvince: '省区域负责人',
    auditChairman: '董事长',
    handler: '张伟',
    accessApi: 'https://api.example.com/diandian/trial',
    validationConfig: '',
    extendConfig: 'https://diandian.example.com/extend',
    stopConfig: 'https://diandian.example.com/stop',
    customConfigs: [],
    allowRepeatApply: false,
    useOrgCount: 1,
    trialOrgCount: 1,
    expireOrgCount: 0,
    freezeOrgCount: 0,
    stopOrgCount: 0,
    hasTrial: true,
    createTime: '2026-05-20 16:30:00'
  }
]

let orgStats: OrgStatItem[] = [
  {
    id: 1,
    planId: 1,
    productName: '数解舆情',
    planName: '三类机构-微信群-舆情推送试用',
    orgName: '陕西省网信办',
    unit: '西北-陕西',
    sales: '王兴',
    status: 'trialing',
    startDate: '2026-05-20',
    trialTimeLabel: '1个月',
    endDate: '2026-06-20',
    expireDesc: '剩余 12 天',
    extendedCount: 0,
    totalExtension: 2
  },
  {
    id: 2,
    planId: 1,
    productName: '数解舆情',
    planName: '三类机构-微信群-舆情推送试用',
    orgName: '铜川市公安局',
    unit: '西北-陕西',
    sales: '刘洋',
    status: 'expired',
    startDate: '2026-04-01',
    trialTimeLabel: '1个月',
    endDate: '2026-05-01',
    expireDesc: '已过期 20 天',
    extendedCount: 1,
    totalExtension: 2
  },
  {
    id: 3,
    planId: 1,
    productName: '数解舆情',
    planName: '三类机构-微信群-舆情推送试用',
    orgName: '西安市某单位',
    unit: '西北-陕西',
    sales: '王兴',
    status: 'frozen',
    startDate: '2026-03-01',
    trialTimeLabel: '1个月',
    endDate: '2026-04-01',
    expireDesc: '冷冻期中',
    extendedCount: 2,
    totalExtension: 2
  },
  {
    id: 4,
    planId: 2,
    productName: '数解舆情',
    planName: '一二类机构推送试用',
    orgName: '杭州市某单位',
    unit: '华东-浙江',
    sales: '陈晨',
    status: 'trialing',
    startDate: '2026-06-01',
    trialTimeLabel: '45天',
    endDate: '2026-07-16',
    expireDesc: '剩余 30 天',
    extendedCount: 0,
    totalExtension: 1
  },
  {
    id: 5,
    planId: 2,
    productName: '数解舆情',
    planName: '一二类机构推送试用',
    orgName: '苏州市某单位',
    unit: '华东-江苏',
    sales: '陈晨',
    status: 'stopped',
    startDate: '2026-03-10',
    trialTimeLabel: '45天',
    endDate: '2026-04-24',
    expireDesc: '已关停',
    extendedCount: 0,
    totalExtension: 1
  },
  {
    id: 6,
    planId: 3,
    productName: '河图融媒体',
    planName: '河图融媒体基础版方案',
    orgName: '成都市某单位',
    unit: '西南-四川',
    sales: '周杰',
    status: 'stopped',
    startDate: '2026-02-01',
    trialTimeLabel: '2个月',
    endDate: '2026-04-01',
    expireDesc: '已关停',
    extendedCount: 0,
    totalExtension: 1
  }
]

function normalizeCustomConfigs(list?: CustomConfigItem[]): CustomConfigItem[] {
  if (!list?.length) return []
  return list
    .filter((item) => item.name?.trim())
    .map((item) => {
      const control =
        item.control === 'radio' || item.control === 'checkbox' ? item.control : 'input'
      const options =
        control === 'input'
          ? []
          : (item.options || [])
              .map((o) => String(o).trim())
              .filter(Boolean)
              .slice(0, 6)
      const required = Boolean(item.required)
      let defaultIndexes = Array.isArray(item.defaultIndexes)
        ? item.defaultIndexes.filter((i) => Number.isInteger(i) && i >= 0 && i < options.length)
        : []
      if (control === 'input' || !required) {
        defaultIndexes = []
      } else if (control === 'radio') {
        defaultIndexes = defaultIndexes.slice(0, 1)
        if (!defaultIndexes.length && options.length) defaultIndexes = [0]
      } else if (!defaultIndexes.length && options.length) {
        defaultIndexes = [0]
      }
      return {
        name: String(item.name).slice(0, 20),
        control,
        options,
        tip: String(item.tip || '').slice(0, 20),
        required,
        defaultIndexes
      }
    })
}

function refreshProductPlanCount() {
  products.forEach((p) => {
    p.planCount = plans.filter((pl) => pl.productId === p.id).length
    p.hasTrial = plans.some((pl) => pl.productId === p.id && pl.hasTrial)
    const orgNames = new Set(
      productTrialOrgs.filter((o) => o.productId === p.id).map((o) => o.orgName)
    )
    p.trialOrgCount = orgNames.size
  })
}

function buildTrialLabel(type: Plan['trialTimeType'], days: number | null) {
  if (type === '1m') return '1个月'
  if (type === '2m') return '2个月'
  if (type === '3m') return '3个月'
  if (type === 'custom') return `${days ?? 1}天`
  return '未设置'
}

function normalizePlan(plan: Plan): Plan {
  return { ...plan, allowRepeatApply: plan.allowRepeatApply ?? false }
}

/** 获取机构类型/区域/处理人选项 */
export async function getProductMetaMock() {
  await delay()
  return {
    code: 200,
    data: {
      orgTypes: [...orgTypeOptions],
      regions: [...regionOptions],
      handlers: [...handlerOptions]
    },
    message: '获取成功'
  }
}

/** 产品列表 */
export async function getProductListMock(params: ProductQuery = {}) {
  await delay()
  refreshProductPlanCount()
  const page = Number(params.page) || 1
  const pageSize = Number(params.pageSize) || 10
  let list = [...products]
  if (params.name) {
    const kw = String(params.name)
    list = list.filter((item) => item.name.includes(kw))
  }
  const orgTypeFilters = Array.isArray(params.orgTypes)
    ? params.orgTypes.filter(Boolean)
    : String(params.orgTypes || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
  if (orgTypeFilters.length) {
    const selected = [...orgTypeFilters].sort()
    list = list.filter((item) => {
      if (item.orgTypes.length !== selected.length) return false
      const current = [...item.orgTypes].sort()
      return current.every((t, i) => t === selected[i])
    })
  }
  if (params.intro) {
    const kw = String(params.intro)
    list = list.filter((item) => item.intro.includes(kw))
  }
  if (params.owner) {
    const kw = String(params.owner)
    list = list.filter((item) => item.owner.includes(kw))
  }
  if (params.displayStatus !== undefined && params.displayStatus !== null && params.displayStatus !== '') {
    const status = Number(params.displayStatus)
    list = list.filter((item) => item.displayStatus === status)
  }
  if (params.planCountMin !== undefined && params.planCountMin !== null && params.planCountMin !== '') {
    const min = Number(params.planCountMin)
    list = list.filter((item) => item.planCount >= min)
  }
  if (params.planCountMax !== undefined && params.planCountMax !== null && params.planCountMax !== '') {
    const max = Number(params.planCountMax)
    list = list.filter((item) => item.planCount <= max)
  }
  if (params.startDate) {
    list = list.filter((item) => item.createTime.slice(0, 10) >= String(params.startDate))
  }
  if (params.endDate) {
    list = list.filter((item) => item.createTime.slice(0, 10) <= String(params.endDate))
  }
  list.sort((a, b) => {
    const sa = Number(a.sortOrder) || 0
    const sb = Number(b.sortOrder) || 0
    if (sa !== sb) return sa - sb
    return a.createTime < b.createTime ? 1 : -1
  })
  const total = list.length
  const start = (page - 1) * pageSize
  return {
    code: 200,
    data: { list: list.slice(start, start + pageSize), total },
    message: '获取成功'
  }
}

/** 产品详情 */
export async function getProductDetailMock(id: number) {
  await delay()
  refreshProductPlanCount()
  const item = products.find((p) => p.id === id)
  if (!item) return { code: 404, data: null, message: '产品不存在' }
  return { code: 200, data: { ...item }, message: '获取成功' }
}

/** 新建产品 */
export async function createProductMock(data: Partial<Product>) {
  await delay()
  const name = String(data.name || '').trim()
  const intro = String(data.intro || '').trim()
  const sortOrder = Number(data.sortOrder)
  if (!name) return { code: 400, data: null, message: '请输入产品名称' }
  if (!String(data.logo || '').trim()) return { code: 400, data: null, message: '请上传产品 Logo' }
  if (!intro) return { code: 400, data: null, message: '请输入产品介绍' }
  if (name.length > 100) return { code: 400, data: null, message: '产品名称不超过100字' }
  if (intro.length > 1000) return { code: 400, data: null, message: '产品介绍不超过1000字' }
  if (!Number.isInteger(sortOrder) || sortOrder < 0) {
    return { code: 400, data: null, message: '展示位置须为大于等于 0 的整数' }
  }
  const now = new Date()
  const createTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`
  const item: Product = {
    id: nextProductId++,
    name: name.slice(0, 100),
    logo: String(data.logo),
    intro: intro.slice(0, 1000),
    owner: data.owner || '产品处理人',
    displayStatus: data.displayStatus ?? 1,
    orgTypes: data.orgTypes?.length ? [...data.orgTypes] : [...orgTypeOptions],
    regions: data.regions?.length ? [...data.regions] : [...regionOptions],
    planCount: 0,
    trialOrgCount: 0,
    sortOrder,
    hasTrial: false,
    createTime
  }
  products.unshift(item)
  return { code: 200, data: item, message: '产品创建成功' }
}

/** 更新产品 */
export async function updateProductMock(data: Partial<Product> & { id: number }) {
  await delay()
  const idx = products.findIndex((p) => p.id === data.id)
  if (idx < 0) return { code: 404, data: null, message: '产品不存在' }
  const name = data.name !== undefined ? String(data.name).trim() : products[idx].name
  const intro = data.intro !== undefined ? String(data.intro).trim() : products[idx].intro
  const sortOrder =
    data.sortOrder !== undefined ? Number(data.sortOrder) : products[idx].sortOrder
  if (!name) return { code: 400, data: null, message: '请输入产品名称' }
  if (data.logo !== undefined && !String(data.logo || '').trim()) {
    return { code: 400, data: null, message: '请上传产品 Logo' }
  }
  if (!intro) return { code: 400, data: null, message: '请输入产品介绍' }
  if (intro.length > 1000) return { code: 400, data: null, message: '产品介绍不超过1000字' }
  if (!Number.isInteger(sortOrder) || sortOrder < 0) {
    return { code: 400, data: null, message: '展示位置须为大于等于 0 的整数' }
  }
  products[idx] = {
    ...products[idx],
    name: name.slice(0, 100),
    logo: data.logo !== undefined ? data.logo : products[idx].logo,
    intro: intro.slice(0, 1000),
    displayStatus: data.displayStatus ?? products[idx].displayStatus,
    orgTypes: data.orgTypes ? [...data.orgTypes] : products[idx].orgTypes,
    regions: data.regions ? [...data.regions] : products[idx].regions,
    owner: data.owner || products[idx].owner,
    sortOrder
  }
  return { code: 200, data: products[idx], message: '产品更新成功' }
}

/** 删除产品 */
export async function deleteProductMock(id: number) {
  await delay()
  const item = products.find((p) => p.id === id)
  if (!item) return { code: 404, data: null, message: '产品不存在' }
  if (item.hasTrial || plans.some((p) => p.productId === id && p.hasTrial)) {
    return { code: 400, data: null, message: '存在机构试用该产品，无法删除' }
  }
  products = products.filter((p) => p.id !== id)
  plans = plans.filter((p) => p.productId !== id)
  return { code: 200, data: null, message: '删除成功' }
}

/** 切换产品显示状态 */
export async function updateProductStatusMock(id: number, displayStatus: number) {
  await delay()
  const item = products.find((p) => p.id === id)
  if (!item) return { code: 404, data: null, message: '产品不存在' }
  item.displayStatus = displayStatus
  return { code: 200, data: item, message: '状态已更新' }
}

/** 产品下方案列表 */
export async function getPlansByProductMock(productId: number) {
  await delay()
  const list = plans.filter((p) => p.productId === productId).map(normalizePlan)
  return { code: 200, data: list, message: '获取成功' }
}

/** 方案详情 */
export async function getPlanDetailMock(id: number) {
  await delay()
  const item = plans.find((p) => p.id === id)
  if (!item) return { code: 404, data: null, message: '方案不存在' }
  return { code: 200, data: normalizePlan(item), message: '获取成功' }
}

/** 创建方案 */
export async function createPlanMock(data: Partial<Plan>) {
  await delay()
  if (!data.productId || !data.name || !data.intro || !data.handler) {
    return { code: 400, data: null, message: '请完善必填信息' }
  }
  const accessApi = String(data.accessApi || '').trim()
  if (!accessApi) return { code: 400, data: null, message: '请输入方案接入API' }
  if (accessApi.length > 1000) return { code: 400, data: null, message: '方案接入API不超过1000字' }
  const product = products.find((p) => p.id === data.productId)
  if (!product) return { code: 404, data: null, message: '产品不存在' }
  const extensionCount =
    data.extensionType === 'custom'
      ? Number(data.extensionCount) || 4
      : Number(data.extensionType || 0)
  const freezeDays = (data.freezeDays || []).slice(0, extensionCount)
  while (freezeDays.length < extensionCount) freezeDays.push(0)
  const now = new Date()
  const createTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`
  const item: Plan = {
    id: nextPlanId++,
    productId: data.productId,
    productName: product.name,
    name: String(data.name).slice(0, 20),
    intro: String(data.intro).slice(0, 200),
    displayStatus: data.displayStatus ?? 1,
    trialTimeType: data.trialTimeType || 'none',
    trialDays: data.trialDays ?? null,
    trialTimeLabel: buildTrialLabel(data.trialTimeType || 'none', data.trialDays ?? null),
    extensionType: data.extensionType || '0',
    extensionCount,
    freezeDays,
    auditLeaders: data.auditLeaders || ['直属领导'],
    auditProvince: data.auditProvince || '省区域负责人',
    auditChairman: data.auditChairman || '董事长',
    handler: data.handler,
    accessApi: 'https://api.example.com/diandian/trial',
    validationConfig: '',
    extendConfig: data.extendConfig || '',
    stopConfig: data.stopConfig || '',
    customConfigs: normalizeCustomConfigs(data.customConfigs),
    allowRepeatApply: Boolean(data.allowRepeatApply),
    useOrgCount: 0,
    trialOrgCount: 0,
    expireOrgCount: 0,
    freezeOrgCount: 0,
    stopOrgCount: 0,
    hasTrial: false,
    createTime
  }
  plans.unshift(item)
  refreshProductPlanCount()
  return { code: 200, data: item, message: '方案创建成功' }
}

/** 更新方案 */
export async function updatePlanMock(data: Partial<Plan> & { id: number }) {
  await delay()
  const idx = plans.findIndex((p) => p.id === data.id)
  if (idx < 0) return { code: 404, data: null, message: '方案不存在' }
  const accessApi =
    data.accessApi !== undefined ? String(data.accessApi).trim() : plans[idx].accessApi
  if (!accessApi) return { code: 400, data: null, message: '请输入方案接入API' }
  if (accessApi.length > 1000) return { code: 400, data: null, message: '方案接入API不超过1000字' }
  const extensionCount =
    data.extensionType === 'custom'
      ? Number(data.extensionCount) || plans[idx].extensionCount
      : Number(data.extensionType ?? plans[idx].extensionType)
  const freezeDays = (data.freezeDays || plans[idx].freezeDays).slice(0, extensionCount)
  while (freezeDays.length < extensionCount) freezeDays.push(0)
  plans[idx] = {
    ...plans[idx],
    ...data,
    name: data.name ? String(data.name).slice(0, 20) : plans[idx].name,
    intro: data.intro ? String(data.intro).slice(0, 200) : plans[idx].intro,
    accessApi: 'https://api.example.com/diandian/trial',
    validationConfig: '',
    customConfigs:
      data.customConfigs !== undefined
        ? normalizeCustomConfigs(data.customConfigs)
        : plans[idx].customConfigs || [],
    extensionCount,
    freezeDays,
    allowRepeatApply:
      data.allowRepeatApply !== undefined ? Boolean(data.allowRepeatApply) : plans[idx].allowRepeatApply,
    trialTimeLabel: buildTrialLabel(
      data.trialTimeType || plans[idx].trialTimeType,
      data.trialDays ?? plans[idx].trialDays
    )
  }
  return { code: 200, data: plans[idx], message: '方案更新成功' }
}

/** 删除方案 */
export async function deletePlanMock(id: number) {
  await delay()
  const item = plans.find((p) => p.id === id)
  if (!item) return { code: 404, data: null, message: '方案不存在' }
  if (item.hasTrial) return { code: 400, data: null, message: '方案已被机构试用，无法删除' }
  plans = plans.filter((p) => p.id !== id)
  refreshProductPlanCount()
  return { code: 200, data: null, message: '删除成功' }
}

/** 切换方案显示状态 */
export async function updatePlanStatusMock(id: number, displayStatus: number) {
  await delay()
  const item = plans.find((p) => p.id === id)
  if (!item) return { code: 404, data: null, message: '方案不存在' }
  item.displayStatus = displayStatus
  return { code: 200, data: item, message: '状态已更新' }
}

/** 方案统计列表 */
export async function getPlanStatsMock(params: PlanStatsQuery = {}) {
  await delay()
  const page = Number(params.page) || 1
  const pageSize = Number(params.pageSize) || 10
  let list = [...plans]
  if (params.planName) {
    const kw = String(params.planName)
    list = list.filter((item) => item.name.includes(kw))
  }
  if (params.productName) {
    const kw = String(params.productName)
    list = list.filter((item) => item.productName.includes(kw))
  }
  if (params.trialTimeType) {
    list = list.filter((item) => item.trialTimeType === params.trialTimeType)
  }
  if (params.extensionCount !== undefined && params.extensionCount !== null && params.extensionCount !== '') {
    const count = Number(params.extensionCount)
    list = list.filter((item) => item.extensionCount === count)
  }
  if (params.displayStatus !== undefined && params.displayStatus !== null && params.displayStatus !== '') {
    const status = Number(params.displayStatus)
    list = list.filter((item) => item.displayStatus === status)
  }
  if (params.handler) {
    const kw = String(params.handler)
    list = list.filter((item) => item.handler.includes(kw))
  }
  if (params.hasTrialOrg === 'yes') {
    list = list.filter((item) => item.trialOrgCount > 0)
  } else if (params.hasTrialOrg === 'no') {
    list = list.filter((item) => item.trialOrgCount <= 0)
  }
  const total = list.length
  const start = (page - 1) * pageSize
  return {
    code: 200,
    data: { list: list.slice(start, start + pageSize), total },
    message: '获取成功'
  }
}

/** 机构统计（方案维度） */
export async function getOrgStatsMock(params: OrgStatsQuery = {}) {
  await delay()
  const page = Number(params.page) || 1
  const pageSize = Number(params.pageSize) || 10
  let list = [...orgStats]
  if (params.planId) {
    list = list.filter((item) => item.planId === Number(params.planId))
  }
  if (params.statusType && params.statusType !== 'all' && params.statusType !== 'use') {
    const map: Record<string, OrgStatItem['status']> = {
      trial: 'trialing',
      expire: 'expired',
      freeze: 'frozen',
      stop: 'stopped',
      stopped: 'stopped'
    }
    const status = map[String(params.statusType)]
    if (status) list = list.filter((item) => item.status === status)
  }
  if (params.orgName) {
    const kw = String(params.orgName)
    list = list.filter((item) => item.orgName.includes(kw))
  }
  const total = list.length
  const start = (page - 1) * pageSize
  return {
    code: 200,
    data: { list: list.slice(start, start + pageSize), total },
    message: '获取成功'
  }
}

/** 产品维度 · 试用机构统计 */
export async function getProductTrialOrgsMock(params: ProductTrialOrgQuery = {}) {
  await delay()
  const page = Number(params.page) || 1
  const pageSize = Number(params.pageSize) || 10
  let list = [...productTrialOrgs]
  if (params.productId) {
    list = list.filter((item) => item.productId === Number(params.productId))
  }
  if (params.orgName) {
    const kw = String(params.orgName).trim()
    if (kw) list = list.filter((item) => item.orgName.includes(kw))
  }
  const total = list.length
  const start = (page - 1) * pageSize
  return {
    code: 200,
    data: { list: list.slice(start, start + pageSize), total },
    message: '获取成功'
  }
}

/** 测试有效性检验配置 */
export async function testValidationConfigMock(config: string) {
  await delay(500)
  if (!config || config.includes('fail')) {
    return { code: 200, data: { result: '失败' }, message: '失败' }
  }
  return { code: 200, data: { result: '成功' }, message: '成功' }
}

/** 导出全部方案（供申请/试用模块复用） */
export function getAllPlansData() {
  return plans
}

/** 导出全部产品（供申请/试用模块复用） */
export function getAllProductsData() {
  return products
}
