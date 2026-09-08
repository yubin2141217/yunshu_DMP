/**
 * H5 Mock：机构统计 / 申请试用 / 申请管理
 */

import type {
  ApiResult,
  ApplyOrderRow,
  CustomConfigItem,
  H5ApplyStatus,
  OrgItem,
  OrgListFilter,
  OrgListItem,
  OrgStatCard,
  OrgTrialRecord,
  PlanOption,
  PlanUseStatus,
  ProductItem,
  StatUnitItem,
  TrialPlanRow,
  MessageNotification
} from '@/types/h5'
import { FREEZE_EXTEND_TIP } from '@/types/h5'
import { offlineLogo } from './offlineLogo'

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms))

/** 当前登录销售（可负责多个统计单元） */
const CURRENT_USER = '王兴'
const CURRENT_UNIT = '西北省级单元'
/** 当前用户可见的全部统计单元 */
const USER_UNITS = ['西北省级单元', '华东市级单元'] as const
const CURRENT_AUDITOR = '超级管理员'

/** Mock：结束时间 = 当前时间 + 指定天/时/分/秒 */
function endAfter(days: number, hours = 0, minutes = 0, seconds = 0) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(d.getHours() + hours)
  d.setMinutes(d.getMinutes() + minutes)
  d.setSeconds(d.getSeconds() + seconds)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const defaultCustomConfigs: CustomConfigItem[] = [
  {
    name: '是否需要微信群协助',
    control: 'radio',
    options: ['是', '否'],
    tip: '如需协助建群请选择「是」',
    required: true,
    defaultIndexes: [1]
  },
  {
    name: '监测渠道偏好',
    control: 'checkbox',
    options: ['微信', '微博', '客户端', '网站', '短视频', '论坛'],
    tip: '可多选关注渠道，最多 6 项',
    required: true,
    defaultIndexes: [0]
  },
  {
    name: '个性化研判',
    control: 'input',
    options: [],
    tip: '请填写个性化研判需求',
    required: false,
    defaultIndexes: []
  }
]

const orgs: OrgItem[] = [
  {
    id: 1,
    name: '陕西省网信办',
    logo: '',
    sales: '王兴',
    region: '西北',
    orgType: '一类',
    unit: CURRENT_UNIT
  },
  {
    id: 2,
    name: '铜川市公安局',
    logo: '',
    sales: '刘洋',
    region: '西北',
    orgType: '二类',
    unit: CURRENT_UNIT
  },
  {
    id: 3,
    name: '宝鸡市某单位',
    logo: '',
    sales: '王兴',
    region: '西北',
    orgType: '三类',
    unit: CURRENT_UNIT
  },
  {
    id: 4,
    name: '杭州市某单位',
    logo: '',
    sales: '陈晨',
    region: '华东',
    orgType: '三类',
    unit: '华东市级单元'
  },
  {
    id: 5,
    name: '西安市某单位',
    logo: '',
    sales: '李娜',
    region: '西北',
    orgType: '二类',
    unit: CURRENT_UNIT
  },
  {
    id: 6,
    name: '咸阳市某单位',
    logo: '',
    sales: '王兴',
    region: '西北',
    orgType: '一类',
    unit: CURRENT_UNIT
  }
]

const INTRO_FILLER =
  '本段为演示用扩展说明，用于验证详情弹层中介绍区域固定高度与上滑滚动体验。试用开通后可体验账号开通、权限配置、数据接入、任务处理、结果查看与导出等能力；支持按规则申请延期，到期后进入冷冻期管理。销售可据此向客户完整演示流程，并收集反馈用于后续正式采购评估。请结合实际业务场景配置监测范围、推送渠道与协作方式，确保试用效果可衡量、可复盘。'

/** 将介绍文案扩充至约 target 个字符（用于详情滚动演示） */
function padIntro(seed: string, target = 1000): string {
  let text = seed.trim()
  while (text.length < target) {
    text += INTRO_FILLER
  }
  return text.slice(0, target)
}

/** 工单详情「方案介绍」展示上限 200 字 */
function clipPlanIntro(text?: string, max = 200): string {
  const raw = String(text || '').trim()
  if (!raw) return ''
  return raw.length > max ? raw.slice(0, max) : raw
}

const products: ProductItem[] = [
  {
    id: 1,
    name: '数解舆情',
    intro: padIntro(
      '舆情监测与分析产品，支持关键词监测、群推送与日报生成。面向宣传、网信与相关业务单位，提供全网信息汇聚、风险识别、热点追踪与报告输出能力。'
    ),
    logo: offlineLogo('数解', 'shujie'),
    orgTypes: ['一类', '二类', '三类'],
    regions: ['西北', '华东', '西南', '华北'],
    sortOrder: 1,
    createTime: '2026-01-10 10:00:00'
  },
  {
    id: 2,
    name: '河图融媒体',
    intro: padIntro(
      '融媒体内容生产、传播与协同管理平台。覆盖选题策划、内容创作、审核发布、传播效果评估等环节，帮助单位提升内容生产效率与跨端分发协同能力。'
    ),
    logo: offlineLogo('河图', 'hetu'),
    orgTypes: ['一类', '二类', '三类'],
    regions: ['西北', '华东', '西南', '华北'],
    sortOrder: 2,
    createTime: '2026-02-15 11:00:00'
  },
  {
    id: 3,
    name: '数据研判标注系统',
    intro: padIntro(
      '面向研判业务的数据采集、标注与个性化研判能力。支持多源数据汇聚、任务分发、质量抽检与结果回传，满足日常研判业务全流程协同与追溯需求。'
    ),
    logo: offlineLogo('研判', 'yanpan'),
    orgTypes: ['一类', '二类', '三类'],
    regions: ['西北', '华东', '华北'],
    sortOrder: 3,
    createTime: '2026-03-01 09:00:00'
  },
  {
    id: 4,
    name: '全球眼',
    intro: padIntro(
      '全域态势感知与可视化监测产品。支持多维指标看板、区域对比、事件下钻与预警提醒，帮助管理者快速掌握整体态势并定位关键风险。'
    ),
    logo: offlineLogo('全球', 'quanqiuyan'),
    orgTypes: ['一类', '二类'],
    regions: ['西北', '华东', '华南', '华北'],
    sortOrder: 4,
    createTime: '2026-03-20 10:00:00'
  },
  {
    id: 5,
    name: '点点密信',
    intro: padIntro(
      '安全即时通讯与密信协作产品。提供加密会话、组织通讯录、文件安全传输与审批协同能力，满足高安全要求场景下的日常沟通与协作。'
    ),
    logo: offlineLogo('点点', 'diandian'),
    orgTypes: ['一类', '二类'],
    regions: ['西北', '华东', '西南', '华北'],
    sortOrder: 5,
    createTime: '2026-04-08 14:00:00'
  }
]

const planOptions: PlanOption[] = [
  {
    id: 101,
    productId: 1,
    name: '三类机构-微信群-舆情推送试用',
    trialTimeLabel: '1个月',
    totalExtend: 2,
    freezeDays: 7,
    freezeDaysList: [7, 7],
    freezeRule: '第1次延期冷冻期7天；第2次延期冷冻期7天',
    intro: padIntro(
      '面向三类机构的微信群舆情推送试用方案。支持关键词配置、群推送、日报生成与试用期内延期管理，便于销售快速演示核心能力。'
    ),
    handler: '张伟',
    auditFlowLabel: '直属领导 → 省区域负责人 → 董事长 → 方案处理人',
    customConfigs: [...defaultCustomConfigs],
    createTime: '2026-01-12 10:00:00',
    inTrial: false
  },
  {
    id: 102,
    productId: 1,
    name: '一二类机构推送试用',
    trialTimeLabel: '45天',
    totalExtend: 1,
    freezeDays: 10,
    freezeRule: '试用期结束后，可再次发起延期的间隔时长为 10 天',
    intro: padIntro(
      '面向一二类机构的舆情推送试用方案。覆盖监测配置、推送渠道、报告模板与协同处理流程，适合作为正式采购前的能力验证与效果评估。'
    ),
    handler: '张伟',
    auditFlowLabel: '直属领导 → 方案处理人',
    customConfigs: [...defaultCustomConfigs],
    createTime: '2026-01-20 14:00:00',
    inTrial: false,
    allowRepeatApply: true,
    freezeDaysList: [10]
  },
  {
    id: 103,
    productId: 1,
    name: '三类机构-日报推送试用',
    trialTimeLabel: '1个月',
    totalExtend: 1,
    freezeDays: 7,
    freezeRule: '试用期结束后，可再次发起延期的间隔时长为 7 天',
    intro: padIntro(
      '三类机构日报推送试用方案样例，用于演示已到期不可再选状态。方案曾开通试用，到期后需在机构统计中查看历史记录。'
    ),
    handler: '张伟',
    auditFlowLabel: '直属领导 → 方案处理人',
    customConfigs: [...defaultCustomConfigs],
    createTime: '2026-01-25 10:00:00',
    inTrial: false,
    occupyStatus: '已到期'
  },
  {
    id: 104,
    productId: 1,
    name: '三类机构-关键词监测试用',
    trialTimeLabel: '45天',
    totalExtend: 2,
    freezeDays: 5,
    freezeRule: '试用期结束后，可再次发起延期的间隔时长为 5 天',
    intro: padIntro(
      '三类机构关键词监测试用方案样例，用于演示停用不可再选状态。方案曾开通后已关停，需在机构统计中确认历史试用情况。'
    ),
    handler: '张伟',
    auditFlowLabel: '直属领导 → 省区域负责人 → 方案处理人',
    customConfigs: [...defaultCustomConfigs],
    createTime: '2026-01-28 11:00:00',
    inTrial: false,
    occupyStatus: '停用'
  },
  {
    id: 201,
    productId: 2,
    name: '河图融媒体基础版方案',
    trialTimeLabel: '2个月',
    totalExtend: 1,
    freezeDays: 0,
    freezeDaysList: [0],
    freezeRule: '无冷冻期',
    intro: padIntro(
      '河图融媒体基础版试用方案，覆盖内容生产与基础传播能力。包含选题、编辑、审核、发布与基础数据统计，满足基层单位融媒体业务快速试用。'
    ),
    handler: '李娜',
    auditFlowLabel: '直属领导 → 省区域负责人 → 方案处理人',
    customConfigs: [...defaultCustomConfigs],
    createTime: '2026-02-18 10:00:00',
    inTrial: false
  },
  {
    id: 202,
    productId: 2,
    name: '河图融媒体VIP版方案',
    trialTimeLabel: '3个月',
    totalExtend: 2,
    freezeDays: 7,
    freezeDaysList: [7, 7],
    freezeRule: '第1次延期冷冻期7天；第2次延期冷冻期7天',
    intro: padIntro(
      '河图融媒体VIP版试用方案，含高级协作与运营能力。支持多端协同、精细化传播分析、团队任务管理与运营复盘，适合中大型单位深度试用。'
    ),
    handler: '李娜',
    auditFlowLabel: '直属领导 → 省区域负责人 → 董事长 → 方案处理人',
    customConfigs: [...defaultCustomConfigs],
    createTime: '2026-02-25 11:00:00',
    inTrial: false
  },
  {
    id: 301,
    productId: 3,
    name: '个性化研判',
    trialTimeLabel: '1个月',
    totalExtend: 1,
    freezeDays: 5,
    freezeRule: '试用期结束后，可再次发起延期的间隔时长为 5 天',
    intro: padIntro(
      '个性化研判试用方案，覆盖数据采集、标注协作与结果输出。适用于一二三类机构试用开通场景，支持按业务需求配置研判维度与推送渠道。'
    ),
    handler: '王强',
    auditFlowLabel: '直属领导 → 方案处理人',
    customConfigs: [...defaultCustomConfigs],
    createTime: '2026-03-05 10:00:00',
    inTrial: false
  },
  {
    id: 302,
    productId: 3,
    name: '一二类机构个性化研判',
    trialTimeLabel: '45天',
    totalExtend: 1,
    freezeDays: 7,
    freezeRule: '试用期结束后，可再次发起延期的间隔时长为 7 天',
    intro: padIntro(
      '面向一二类机构的个性化研判试用方案。强调任务分发、标注质检、结果回传与权限隔离，便于验证研判业务在真实组织架构下的落地效果。'
    ),
    handler: '王强',
    auditFlowLabel: '直属领导 → 省区域负责人 → 方案处理人',
    customConfigs: [...defaultCustomConfigs],
    createTime: '2026-03-12 09:30:00',
    inTrial: false
  },
  {
    id: 401,
    productId: 4,
    name: '全球眼一二类机构试用',
    trialTimeLabel: '1个月',
    totalExtend: 1,
    freezeDays: 7,
    freezeRule: '试用期结束后，可再次发起延期的间隔时长为 7 天',
    intro: padIntro(
      '全球眼一二类机构试用方案。提供态势看板、区域对比、预警提醒与事件下钻能力，帮助管理者在试用期内快速建立可视化监测习惯。'
    ),
    handler: '赵敏',
    auditFlowLabel: '直属领导 → 方案处理人',
    customConfigs: [...defaultCustomConfigs],
    createTime: '2026-03-22 10:00:00',
    inTrial: false
  },
  {
    id: 501,
    productId: 5,
    name: '点点密信一二类机构试用',
    trialTimeLabel: '1个月',
    totalExtend: 1,
    freezeDays: 0,
    freezeDaysList: [0],
    freezeRule: '无冷冻期',
    intro: padIntro(
      '点点密信一二类机构试用方案。覆盖加密会话、组织通讯录、文件传输与审批协同，适合高安全要求场景下的沟通协作试用验证。'
    ),
    handler: '张伟',
    auditFlowLabel: '直属领导 → 方案处理人',
    customConfigs: [...defaultCustomConfigs],
    createTime: '2026-04-10 15:00:00',
    inTrial: false
  }
]

/** 由审核流程文案生成节点（已开通试用方案默认各节点审核通过） */
function buildAuditFlowNodes(
  label: string,
  options?: { lastResult?: string }
): { role: string; result: string }[] {
  const roles = label
    .split(/\s*→\s*/)
    .map((s) => s.trim())
    .filter(Boolean)
  const lastResult = options?.lastResult || '审核通过'
  return roles.map((role, idx) => ({
    role,
    result: idx === roles.length - 1 && role.includes('方案处理人') ? lastResult : '审核通过'
  }))
}

let trialPlans: TrialPlanRow[] = [
  {
    id: 1,
    orgId: 1,
    orgName: '陕西省网信办',
    orgLogo: '',
    productName: '数解舆情',
    planName: '三类机构-微信群-舆情推送试用',
    expireTime: '2026-08-20 23:59:59',
    status: '试用中',
    sales: '王兴',
    unit: CURRENT_UNIT,
    startDate: '2026-07-20',
    endDate: '2026-08-20',
    remainTime: '剩余 22 天',
    extendedCount: 0,
    pendingExtendCount: 0,
    remainExtendCount: 2,
    totalExtend: 2,
    trialTimeLabel: '1个月',
    freezeDays: 7,
    freezeDaysList: [7, 7],
    freezeRule: '第1次延期冷冻期7天；第2次延期冷冻期7天',
    planIntro: '面向三类机构的微信群舆情推送试用方案',
    auditFlowLabel: '直属领导 → 省区域负责人 → 董事长 → 方案处理人',
    auditFlowNodes: buildAuditFlowNodes(
      '直属领导 → 省区域负责人 → 董事长 → 方案处理人',
      { lastResult: '已开通' }
    ),
    customConfigs: defaultCustomConfigs,
    customAnswers: {
      是否需要微信群协助: '否',
      监测渠道偏好: '微信、微博',
      个性化研判: '需支持本地热点专题推送'
    }
  },
  {
    id: 2,
    orgId: 1,
    orgName: '陕西省网信办',
    orgLogo: '',
    productName: '河图融媒体',
    planName: '河图融媒体基础版方案',
    expireTime: endAfter(2, 5, 30, 0),
    status: '即将到期',
    sales: '王兴',
    unit: CURRENT_UNIT,
    startDate: '2026-06-01',
    endDate: '2026-07-30',
    remainTime: '即将到期',
    extendedCount: 0,
    pendingExtendCount: 0,
    remainExtendCount: 1,
    totalExtend: 1,
    trialTimeLabel: '2个月',
    freezeDays: 0,
    freezeDaysList: [0],
    freezeRule: '无冷冻期',
    planIntro: '河图融媒体基础版试用方案',
    auditFlowLabel: '直属领导 → 省区域负责人 → 方案处理人',
    auditFlowNodes: buildAuditFlowNodes('直属领导 → 省区域负责人 → 方案处理人', {
      lastResult: '已开通'
    })
  },
  {
    id: 3,
    orgId: 2,
    orgName: '铜川市公安局',
    orgLogo: '',
    productName: '数解舆情',
    planName: '一二类机构推送试用',
    expireTime: '2026-06-30 23:59:59',
    status: '已到期',
    sales: '刘洋',
    unit: CURRENT_UNIT,
    startDate: '2026-05-01',
    endDate: '2026-06-30',
    remainTime: '已过期',
    extendedCount: 1,
    pendingExtendCount: 0,
    remainExtendCount: 0,
    totalExtend: 1,
    trialTimeLabel: '45天',
    freezeDays: 10,
    freezeRule: '试用期结束后，可再次发起延期的间隔时长为 10 天',
    planIntro: '面向一二类机构的舆情推送试用',
    auditFlowLabel: '直属领导 → 方案处理人',
    auditFlowNodes: buildAuditFlowNodes('直属领导 → 方案处理人', { lastResult: '已开通' }),
    freezeDaysLeft: 0,
    freezeEndDate: '2026-07-10'
  },
  {
    id: 4,
    orgId: 3,
    orgName: '宝鸡市某单位',
    orgLogo: '',
    productName: '数解舆情',
    planName: '三类机构-微信群-舆情推送试用',
    expireTime: '2026-07-20 23:59:59',
    status: '冷冻期',
    sales: '王兴',
    unit: CURRENT_UNIT,
    startDate: '2026-06-20',
    endDate: '2026-07-20',
    remainTime: '冷冻期中',
    extendedCount: 0,
    pendingExtendCount: 0,
    remainExtendCount: 2,
    totalExtend: 2,
    trialTimeLabel: '1个月',
    freezeDays: 7,
    freezeRule: '试用期结束后，可再次发起延期的间隔时长为 7 天',
    planIntro: '面向三类机构的微信群舆情推送试用方案',
    auditFlowLabel: '直属领导 → 省区域负责人 → 董事长 → 方案处理人',
    auditFlowNodes: buildAuditFlowNodes(
      '直属领导 → 省区域负责人 → 董事长 → 方案处理人',
      { lastResult: '已开通' }
    ),
    freezeDaysLeft: 3,
    freezeEndDate: '',
    freezeEndTime: endAfter(3, 2, 15, 30)
  },
  {
    id: 5,
    orgId: 5,
    orgName: '西安市某单位',
    orgLogo: '',
    productName: '数据研判标注系统',
    planName: '个性化研判',
    expireTime: '2026-08-15 23:59:59',
    status: '试用中',
    sales: '李娜',
    unit: CURRENT_UNIT,
    startDate: '2026-07-15',
    endDate: '2026-08-15',
    remainTime: '剩余 17 天',
    extendedCount: 0,
    pendingExtendCount: 0,
    remainExtendCount: 1,
    totalExtend: 1,
    trialTimeLabel: '1个月',
    freezeDays: 5,
    freezeRule: '试用期结束后，可再次发起延期的间隔时长为 5 天',
    planIntro: '个性化研判试用方案',
    auditFlowLabel: '直属领导 → 方案处理人',
    auditFlowNodes: buildAuditFlowNodes('直属领导 → 方案处理人', { lastResult: '已开通' })
  },
  {
    id: 6,
    orgId: 4,
    orgName: '杭州市某单位',
    orgLogo: '',
    productName: '河图融媒体',
    planName: '河图融媒体基础版方案',
    expireTime: '2026-09-01 23:59:59',
    status: '试用中',
    sales: '陈晨',
    unit: '华东市级单元',
    startDate: '2026-07-01',
    endDate: '2026-09-01',
    remainTime: '剩余 34 天',
    extendedCount: 0,
    pendingExtendCount: 0,
    remainExtendCount: 1,
    totalExtend: 1,
    trialTimeLabel: '2个月',
    freezeDays: 0,
    freezeDaysList: [0],
    freezeRule: '无冷冻期',
    planIntro: '河图融媒体基础版试用方案',
    auditFlowLabel: '直属领导 → 省区域负责人 → 方案处理人',
    auditFlowNodes: buildAuditFlowNodes('直属领导 → 省区域负责人 → 方案处理人', {
      lastResult: '已开通'
    })
  },
  {
    id: 12,
    orgId: 1,
    orgName: '陕西省网信办',
    orgLogo: '',
    productName: '数据研判标注系统',
    planName: '个性化研判试用方案',
    expireTime: '2026-07-28 23:59:59',
    status: '冷冻期',
    sales: '王兴',
    unit: CURRENT_UNIT,
    startDate: '2026-06-28',
    endDate: '2026-07-28',
    remainTime: '冷冻期中',
    extendedCount: 0,
    pendingExtendCount: 0,
    remainExtendCount: 2,
    totalExtend: 2,
    trialTimeLabel: '1个月',
    freezeDays: 7,
    freezeRule: '第1次试用到期后，冷冻期时长为7天；第2次试用到期后，冷冻期时长为7天',
    planIntro: '个性化研判试用方案（冷冻期示例）',
    auditFlowLabel: '直属领导 → 方案处理人',
    auditFlowNodes: buildAuditFlowNodes('直属领导 → 方案处理人', { lastResult: '已开通' }),
    freezeDaysLeft: 3,
    freezeEndDate: '',
    freezeEndTime: endAfter(3, 2, 15, 30),
    customConfigs: defaultCustomConfigs,
    customAnswers: {
      是否需要微信群协助: '是',
      监测渠道偏好: '微信、短视频',
      个性化研判: '冷冻期内仅可查看历史任务'
    }
  },
  {
    id: 7,
    orgId: 1,
    orgName: '陕西省网信办',
    orgLogo: '',
    productName: '河图融媒体',
    planName: '河图融媒体基础版方案',
    expireTime: '2026-06-15 23:59:59',
    status: '已到期',
    sales: '王兴',
    unit: CURRENT_UNIT,
    startDate: '2026-04-15',
    endDate: '2026-06-15',
    remainTime: '已过期',
    extendedCount: 1,
    pendingExtendCount: 0,
    remainExtendCount: 0,
    totalExtend: 1,
    trialTimeLabel: '2个月',
    freezeDays: 7,
    freezeRule: '第1次试用到期后，冷冻期时长为7天',
    planIntro: '河图融媒体基础版试用方案（已到期示例）',
    auditFlowLabel: '直属领导 → 省区域负责人 → 方案处理人',
    auditFlowNodes: buildAuditFlowNodes('直属领导 → 省区域负责人 → 方案处理人', {
      lastResult: '已开通'
    }),
    customConfigs: defaultCustomConfigs,
    customAnswers: {
      是否需要微信群协助: '是',
      监测渠道偏好: '微信、客户端',
      个性化研判: ''
    }
  },
  {
    id: 8,
    orgId: 1,
    orgName: '陕西省网信办',
    orgLogo: '',
    productName: '全球眼',
    planName: '全球眼一二类机构试用',
    expireTime: '2026-05-20 23:59:59',
    status: '停用',
    sales: '王兴',
    unit: CURRENT_UNIT,
    startDate: '2026-02-20',
    endDate: '2026-05-20',
    remainTime: '已停用',
    extendedCount: 2,
    pendingExtendCount: 0,
    remainExtendCount: 0,
    totalExtend: 2,
    trialTimeLabel: '3个月',
    freezeDays: 0,
    freezeDaysList: [0],
    freezeRule: '无冷冻期',
    planIntro: '全球眼一二类机构试用方案（停用示例）',
    auditFlowLabel: '直属领导 → 方案处理人',
    auditFlowNodes: buildAuditFlowNodes('直属领导 → 方案处理人', { lastResult: '已开通' }),
    customConfigs: defaultCustomConfigs,
    customAnswers: {
      是否需要微信群协助: '否',
      监测渠道偏好: '网站、论坛',
      个性化研判: '已关停，仅作历史展示'
    }
  },
  {
    id: 9,
    orgId: 6,
    orgName: '咸阳市某单位',
    orgLogo: '',
    productName: '数解舆情',
    planName: '一二类机构推送试用',
    expireTime: '2026-10-26 23:59:59',
    status: '试用中',
    sales: '王兴',
    unit: CURRENT_UNIT,
    startDate: '2026-07-28',
    endDate: '2026-10-26',
    remainTime: '剩余 91 天',
    extendedCount: 0,
    pendingExtendCount: 0,
    remainExtendCount: 2,
    totalExtend: 2,
    trialTimeLabel: '3个月',
    freezeDays: 0,
    freezeRule: '第1次试用到期后，冷冻期时长为0天；第2次试用到期后，冷冻期时长为0天',
    planIntro: '一二类机构推送试用方案，覆盖舆情监测、推送与日报能力。',
    auditFlowLabel: '直属领导 → 方案处理人',
    auditFlowNodes: buildAuditFlowNodes('直属领导 → 方案处理人', { lastResult: '已开通' }),
    customConfigs: defaultCustomConfigs,
    customAnswers: {
      是否需要微信群协助: '否',
      监测渠道偏好: '微信、微博',
      个性化研判: '需支持本地热点专题推送'
    }
  },
  {
    id: 10,
    orgId: 6,
    orgName: '咸阳市某单位',
    orgLogo: '',
    productName: '河图融媒体',
    planName: '河图融媒体基础版方案',
    expireTime: '2026-06-15 23:59:59',
    status: '已到期',
    sales: '王兴',
    unit: CURRENT_UNIT,
    startDate: '2026-04-15',
    endDate: '2026-06-15',
    remainTime: '已过期',
    extendedCount: 1,
    pendingExtendCount: 0,
    remainExtendCount: 0,
    totalExtend: 1,
    trialTimeLabel: '2个月',
    freezeDays: 7,
    freezeRule: '第1次试用到期后，冷冻期时长为7天',
    planIntro: '河图融媒体基础版试用方案（已到期示例）',
    auditFlowLabel: '直属领导 → 省区域负责人 → 方案处理人',
    auditFlowNodes: buildAuditFlowNodes('直属领导 → 省区域负责人 → 方案处理人', {
      lastResult: '已开通'
    }),
    customConfigs: defaultCustomConfigs,
    customAnswers: {
      是否需要微信群协助: '是',
      监测渠道偏好: '微信、客户端',
      个性化研判: ''
    }
  },
  {
    id: 11,
    orgId: 6,
    orgName: '咸阳市某单位',
    orgLogo: '',
    productName: '全球眼',
    planName: '全球眼一二类机构试用',
    expireTime: '2026-05-20 23:59:59',
    status: '停用',
    sales: '王兴',
    unit: CURRENT_UNIT,
    startDate: '2026-02-20',
    endDate: '2026-05-20',
    remainTime: '已停用',
    extendedCount: 2,
    pendingExtendCount: 0,
    remainExtendCount: 0,
    totalExtend: 2,
    trialTimeLabel: '3个月',
    freezeDays: 0,
    freezeDaysList: [0],
    freezeRule: '无冷冻期',
    planIntro: '全球眼一二类机构试用方案（停用示例）',
    auditFlowLabel: '直属领导 → 方案处理人',
    auditFlowNodes: buildAuditFlowNodes('直属领导 → 方案处理人', { lastResult: '已开通' }),
    customConfigs: defaultCustomConfigs,
    customAnswers: {
      是否需要微信群协助: '否',
      监测渠道偏好: '网站、论坛',
      个性化研判: '已关停，仅作历史展示'
    }
  },
  {
    id: 13,
    orgId: 6,
    orgName: '咸阳市某单位',
    orgLogo: '',
    productName: '河图融媒体',
    planName: '河图融媒体基础版方案',
    expireTime: '—',
    status: '申请中',
    sales: '王兴',
    unit: CURRENT_UNIT,
    startDate: '2026-08-05',
    endDate: '—',
    remainTime: '申请中',
    extendedCount: 0,
    pendingExtendCount: 0,
    remainExtendCount: 0,
    totalExtend: 1,
    trialTimeLabel: '2个月',
    freezeDays: 0,
    freezeDaysList: [0],
    freezeRule: '无冷冻期',
    planIntro: '河图融媒体基础版试用方案（申请中示例）',
    auditFlowLabel: '直属领导 → 方案处理人',
    auditFlowNodes: buildAuditFlowNodes('直属领导 → 方案处理人', {
      lastResult: '审核中'
    }),
    customConfigs: defaultCustomConfigs,
    customAnswers: {
      是否需要微信群协助: '否',
      监测渠道偏好: '微信',
      个性化研判: ''
    }
  }
]

let applyOrders: ApplyOrderRow[] = [
  {
    id: 1,
    orderNo: 'SY202605010001',
    applicant: '王兴',
    applyTime: '2026-05-01 09:30:00',
    applyType: '申请试用',
    orgName: '陕西省网信办',
    orgUnit: CURRENT_UNIT,
    productName: '数解舆情',
    planName: '三类机构-微信群-舆情推送试用',
    planIntro: '面向三类机构的微信群舆情推送试用方案',
    trialTimeLabel: '1个月',
    applyRemark: '客户希望尽快开通试用。',
    currentAuditor: '',
    status: '已归档',
    auditNodes: [
      { operator: '王兴', role: '销售', action: '提交申请', time: '2026-05-01 09:30:00' },
      {
        operator: '王兴',
        role: '雁塔区负责人',
        action: '自动跳过',
        time: '2026-05-01 09:30:01',
        remark: '审核人和申请人相同，自动跳过'
      },
      {
        operator: '超级管理员',
        role: '陕西大区负责人',
        action: '审核通过',
        time: '2026-05-01 11:00:00',
        remark: '（陕西大区负责人）'
      }
    ]
  },
  {
    id: 2,
    orderNo: 'SY202604280004',
    applicant: '李娜',
    applyTime: '2026-04-28 08:45:00',
    applyType: '申请试用',
    orgName: '西安市某单位',
    orgUnit: CURRENT_UNIT,
    productName: '数据研判标注系统',
    planName: '个性化研判',
    trialTimeLabel: '1个月',
    applyRemark: '领导代发起试用申请。',
    currentAuditor: '',
    status: '已归档',
    auditNodes: [
      { operator: '李娜', role: '销售', action: '提交申请', time: '2026-04-28 08:45:00' },
      { operator: '王强', role: '直属领导', action: '审核通过', time: '2026-04-28 15:00:00' }
    ]
  },
  {
    id: 3,
    orderNo: 'SY202604200005',
    applicant: '刘洋',
    applyTime: '2026-04-20 11:00:00',
    applyType: '申请试用',
    orgName: '铜川市公安局',
    orgUnit: CURRENT_UNIT,
    productName: '数解舆情',
    planName: '一二类机构推送试用',
    trialTimeLabel: '45天',
    applyRemark: '新客户试用申请。',
    currentAuditor: '',
    status: '已归档',
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
        time: '2026-04-20 16:00:00',
        remark: '（西安市负责人）'
      },
      {
        operator: '张三',
        role: '陕西大区负责人',
        action: '自动跳过',
        time: '2026-04-20 16:00:01',
        remark: '该工单在之前审核环节已处理过，无需重复审核！'
      },
      {
        operator: '方案处理人',
        role: '方案处理人',
        action: '人工处理完成',
        time: '2026-04-21 10:00:00'
      }
    ]
  },
  {
    id: 4,
    orderNo: 'SY202604100007',
    applicant: '陈晨',
    applyTime: '2026-04-10 09:00:00',
    applyType: '申请试用',
    orgName: '杭州市某单位',
    orgUnit: '华东市级单元',
    productName: '河图融媒体',
    planName: '河图融媒体基础版方案',
    trialTimeLabel: '2个月',
    applyRemark: '华东客户开通。',
    currentAuditor: '',
    status: '已归档',
    auditNodes: [
      { operator: '陈晨', role: '销售', action: '提交申请', time: '2026-04-10 09:00:00' }
    ]
  },
  {
    id: 5,
    orderNo: 'DRAFT20260701001',
    applicant: '王兴',
    applyTime: '2026-07-01 16:00:00',
    applyType: '申请试用',
    orgName: '宝鸡市某单位',
    orgUnit: CURRENT_UNIT,
    productName: '数解舆情',
    planName: '一二类机构推送试用',
    trialTimeLabel: '45天',
    applyRemark: '草稿未提交。',
    currentAuditor: '',
    status: '草稿',
    auditNodes: [{ operator: '王兴', role: '销售', action: '保存草稿', time: '2026-07-01 16:00:00' }]
  },
  {
    id: 6,
    orderNo: 'SY202607280010',
    applicant: '王兴',
    applyTime: '2026-07-28 10:20:00',
    applyType: '申请试用',
    orgName: '咸阳市某单位',
    orgUnit: CURRENT_UNIT,
    productName: '全球眼',
    planName: '全球眼一二类机构试用',
    trialTimeLabel: '1个月',
    applyRemark: '新客户首次试用全球眼，待领导审核。',
    currentAuditor: '超级管理员',
    status: '审核中',
    orgId: 6,
    productId: 4,
    planId: 401,
    customConfigs: [...defaultCustomConfigs],
    customAnswers: {
      是否需要微信群协助: '是',
      监测渠道偏好: '微信、网站',
      个性化研判: ''
    },
    auditNodes: [
      { operator: '王兴', role: '销售', action: '提交申请', time: '2026-07-28 10:20:00' },
      { operator: '超级管理员', role: '直属领导', action: '审核中' }
    ]
  },
  {
    id: 7,
    orderNo: 'SY202607300013',
    applicant: '王兴',
    applyTime: '2026-07-30 16:05:00',
    applyType: '申请试用',
    orgName: '咸阳市某单位',
    orgUnit: CURRENT_UNIT,
    orgId: 6,
    productId: 5,
    planId: 501,
    productName: '点点密信',
    planName: '点点密信一二类机构试用',
    trialTimeLabel: '1个月',
    applyRemark: '同机构追加密信产品试用，待人工开通。',
    currentAuditor: '',
    status: '处理中',
    customConfigs: [...defaultCustomConfigs],
    customAnswers: {
      是否需要微信群协助: '否',
      监测渠道偏好: '微信、客户端',
      个性化研判: '需支持组织通讯录同步'
    },
    auditNodes: [
      { operator: '王兴', role: '销售', action: '提交申请', time: '2026-07-30 16:05:00' },
      { operator: '超级管理员', role: '直属领导', action: '审核通过', time: '2026-07-30 17:00:00' },
      { operator: '方案处理人', role: '方案处理人', action: '待人工处理' }
    ]
  },
  {
    id: 8,
    orderNo: 'SY202607250008',
    applicant: '王兴',
    applyTime: '2026-07-25 11:30:00',
    applyType: '申请试用',
    orgName: '咸阳市某单位',
    orgUnit: CURRENT_UNIT,
    orgId: 6,
    productId: 1,
    planId: 102,
    productName: '数解舆情',
    planName: '一二类机构推送试用',
    trialTimeLabel: '45天',
    applyRemark: '同机构申请舆情产品试用，审核未通过。',
    currentAuditor: '',
    status: '未通过',
    customConfigs: [...defaultCustomConfigs],
    customAnswers: {
      是否需要微信群协助: '是',
      监测渠道偏好: '微信、微博',
      个性化研判: '需支持本地热点专题推送与日报定制'
    },
    auditNodes: [
      { operator: '王兴', role: '销售', action: '提交申请', time: '2026-07-25 11:30:00' },
      {
        operator: '超级管理员',
        role: '直属领导',
        action: '审核驳回',
        time: '2026-07-26 09:15:00',
        remark: '试用范围与机构类型不匹配，请调整方案后重新提交。'
      }
    ]
  },
  {
    id: 9,
    orderNo: 'SY20260820002',
    applicant: '王兴',
    applyTime: '2026-08-20 11:46:07',
    applyType: '申请试用',
    orgName: '张华的机构',
    orgUnit: CURRENT_UNIT,
    orgId: 6,
    productId: 1,
    planId: 101,
    productName: '数解舆情',
    planName: '数解舆情-三类机构试用（王旭龙测试）',
    planIntro: '面向三类机构的试用方案',
    trialTimeLabel: '1个月',
    applyRemark: '客户申请试用，后由申请人撤销。',
    currentAuditor: '',
    status: '草稿',
    customConfigs: [...defaultCustomConfigs],
    customAnswers: {
      是否需要微信群协助: '是',
      监测渠道偏好: '微信',
      个性化研判: ''
    },
    auditNodes: [
      { operator: '王兴', role: '销售', action: '提交申请', time: '2026-08-20 11:46:07' },
      { operator: '王兴', role: '销售', action: '撤销申请', time: '2026-08-20 12:05:00' }
    ]
  }
]

function ok<T>(data: T, message = '成功'): ApiResult<T> {
  return { code: 200, data, message }
}

function fail<T = null>(message: string): ApiResult<T> {
  return { code: 400, data: null as T, message }
}

function scopePlans(unit?: string) {
  const inScope = trialPlans.filter((p) => USER_UNITS.includes(p.unit as (typeof USER_UNITS)[number]))
  if (unit && unit !== '全部') return inScope.filter((p) => p.unit === unit)
  return inScope
}

function scopeOrgs(unit?: string) {
  const inScope = orgs.filter((o) => USER_UNITS.includes(o.unit as (typeof USER_UNITS)[number]))
  if (unit && unit !== '全部') return inScope.filter((o) => o.unit === unit)
  return inScope
}

/** 已提交且未归档的试用申请（不含草稿；统计「申请中」口径） */
const PENDING_APPLY_STATUSES: H5ApplyStatus[] = ['审核中', '处理中']

function isPendingApply(order: ApplyOrderRow): boolean {
  return order.applyType === '申请试用' && PENDING_APPLY_STATUSES.includes(order.status)
}

function scopePendingApplies(unit?: string): ApplyOrderRow[] {
  return applyOrders.filter((o) => {
    if (!isPendingApply(o)) return false
    if (!USER_UNITS.includes(o.orgUnit as (typeof USER_UNITS)[number])) return false
    if (unit && unit !== '全部' && o.orgUnit !== unit) return false
    return true
  })
}

function findOrgByApply(order: ApplyOrderRow): OrgItem | undefined {
  return orgs.find((o) => o.name === order.orgName && o.unit === order.orgUnit)
}

function applyingOrgIds(unit?: string): number[] {
  const ids = new Set<number>()
  for (const order of scopePendingApplies(unit)) {
    const org = findOrgByApply(order)
    if (org) ids.add(org.id)
  }
  return [...ids]
}

function pendingAppliesForOrg(orgId: number, unit?: string): ApplyOrderRow[] {
  const org = orgs.find((o) => o.id === orgId)
  if (!org) return []
  return scopePendingApplies(unit).filter((o) => o.orgName === org.name && o.orgUnit === org.unit)
}

function toApplyingPlanRow(order: ApplyOrderRow, org: OrgItem): TrialPlanRow {
  return {
    id: 10000 + order.id,
    orgId: org.id,
    orgName: org.name,
    orgLogo: org.logo,
    productName: order.productName,
    planName: order.planName,
    expireTime: '—',
    status: '申请中',
    sales: org.sales,
    unit: org.unit,
    startDate: order.applyTime.slice(0, 10),
    endDate: '—',
    remainTime: '申请中',
    extendedCount: 0,
    pendingExtendCount: 0,
    remainExtendCount: 0,
    totalExtend: 0,
    trialTimeLabel: order.trialTimeLabel,
    freezeDays: 0,
    freezeRule: '—',
    planIntro: order.planIntro || `申请工单 ${order.orderNo}`,
    auditFlowLabel: '—',
    applyOrderId: order.id
    // 方案侧状态统一为「申请中」，不透出工单细分状态
  }
}

function orgPrimaryStatus(orgId: number, unit?: string): PlanUseStatus {
  const plans = scopePlans(unit).filter((p) => p.orgId === orgId)
  if (plans.some((p) => p.status === '冷冻期')) return '冷冻期'
  if (plans.some((p) => p.status === '即将到期')) return '即将到期'
  if (plans.some((p) => p.status === '试用中')) return '试用中'
  if (plans.some((p) => p.status === '已到期')) return '已到期'
  if (pendingAppliesForOrg(orgId, unit).length) return '申请中'
  return '停用'
}

function orgMatchesFilter(orgId: number, filter: OrgListFilter, unit?: string): boolean {
  const plans = scopePlans(unit).filter((p) => p.orgId === orgId)
  const pending = pendingAppliesForOrg(orgId, unit)
  if (!plans.length && !pending.length) return false
  if (filter === 'all') return true
  if (filter === '申请中') return pending.length > 0
  if (filter === '试用中') return plans.some((p) => p.status === '试用中' || p.status === '即将到期')
  if (filter === '即将到期') return plans.some((p) => p.status === '即将到期')
  if (filter === '已到期') return plans.some((p) => p.status === '已到期')
  if (filter === '冷冻期') return plans.some((p) => p.status === '冷冻期')
  return false
}

function toOrgListItem(
  orgId: number,
  unit?: string,
  filter?: OrgListFilter
): OrgListItem | null {
  const org = orgs.find((o) => o.id === orgId)
  if (!org) return null
  const plans = scopePlans(unit).filter((p) => p.orgId === orgId)
  const pending = pendingAppliesForOrg(orgId, unit)
  if (!plans.length && !pending.length) return null

  if (filter === '申请中' && pending.length) {
    const primary = pending[0]
    return {
      id: org.id,
      name: org.name,
      logo: org.logo,
      sales: org.sales,
      productName: primary.productName,
      planName: primary.planName,
      status: '申请中'
    }
  }

  if (!plans.length && pending.length) {
    const primary = pending[0]
    return {
      id: org.id,
      name: org.name,
      logo: org.logo,
      sales: org.sales,
      productName: primary.productName,
      planName: primary.planName,
      status: '申请中'
    }
  }

  const primary = plans[0]
  const status = orgPrimaryStatus(orgId, unit)
  const freezePlan = plans.find((p) => p.status === '冷冻期')
  return {
    id: org.id,
    name: org.name,
    logo: org.logo,
    sales: org.sales,
    productName: primary.productName,
    planName: primary.planName,
    status,
    freezeDaysLeft: freezePlan?.freezeDaysLeft,
    freezeEndTime: freezePlan?.freezeEndTime
  }
}

/** 是否允许延期：按第 n 次延期的冷冻期规则判断 */
export function getNextExtensionIndex(plan: { extendedCount: number }): number {
  return plan.extendedCount + 1
}

export function getFreezeDaysForExtension(plan: {
  extendedCount: number
  freezeDays: number
  freezeDaysList?: number[]
}): number {
  const n = getNextExtensionIndex(plan)
  const list = plan.freezeDaysList
  if (list && list.length >= n) return list[n - 1]
  return plan.freezeDays || 0
}

export function freezeExtendBlockTip(n: number, m: number): string {
  return `第${n}次延期冷冻期为${m}天，需要等待冷冻期结束才可发起！`
}

/** 是否允许延期 */
export function canExtendPlan(plan: TrialPlanRow): { ok: boolean; tip?: string } {
  if (plan.remainExtendCount <= 0) return { ok: false, tip: '无剩余延期次数' }

  const n = getNextExtensionIndex(plan)
  const m = getFreezeDaysForExtension(plan)

  if (plan.status === '即将到期') {
    if (m === 0) return { ok: true }
    return { ok: false, tip: freezeExtendBlockTip(n, m) }
  }

  if (plan.status === '试用中') {
    return { ok: false, tip: FREEZE_EXTEND_TIP }
  }

  if (plan.status === '已到期' || plan.status === '冷冻期') {
    if (m === 0) return { ok: true }
    if (plan.status === '冷冻期' || (plan.freezeDaysLeft && plan.freezeDaysLeft > 0)) {
      return { ok: false, tip: freezeExtendBlockTip(n, m) }
    }
    if (plan.status === '已到期') {
      return { ok: false, tip: freezeExtendBlockTip(n, m) }
    }
  }

  if (plan.status === '停用' || plan.status === '申请中') {
    return { ok: false, tip: '当前状态不可延期' }
  }

  return { ok: true }
}

export async function searchOrgsMock(keyword: string): Promise<ApiResult<OrgItem[]>> {
  await delay()
  const kw = keyword.trim()
  const scope = scopeOrgs(CURRENT_UNIT)
  const list = kw ? scope.filter((o) => o.name.includes(kw)) : [...scope]
  return ok(list)
}

export async function fetchOrgTrialsMock(
  orgId: number
): Promise<ApiResult<{ active: OrgTrialRecord[]; expired: OrgTrialRecord[] }>> {
  await delay()
  const plans = trialPlans.filter((p) => p.orgId === orgId)
  const active = plans
    .filter((p) => p.status === '试用中' || p.status === '即将到期')
    .map((p) => ({
      productName: p.productName,
      planName: p.planName,
      planId: `PLAN-${p.id}`,
      startDate: p.startDate,
      endDate: p.endDate,
      remainExtend: p.remainExtendCount
    }))
  const expired = plans
    .filter((p) => p.status === '已到期' || p.status === '冷冻期' || p.status === '停用')
    .map((p) => ({
      productName: p.productName,
      planName: p.planName,
      planId: `PLAN-${p.id}`,
      startDate: p.startDate,
      endDate: p.endDate,
      totalDays: '30天',
      extendCount: p.extendedCount
    }))
  return ok({ active, expired })
}

export async function fetchProductsMock(
  orgId: number,
  keyword?: string
): Promise<ApiResult<ProductItem[]>> {
  await delay()
  const org = orgs.find((o) => o.id === orgId)
  if (!org) return ok([])
  let list = products.filter(
    (p) => p.orgTypes.includes(org.orgType) && p.regions.includes(org.region)
  )
  if (keyword?.trim()) {
    list = list.filter((p) => p.name.includes(keyword.trim()))
  }
  list = [...list].sort((a, b) => {
    const sa = Number(a.sortOrder) || 0
    const sb = Number(b.sortOrder) || 0
    if (sa !== sb) return sa - sb
    return a.createTime < b.createTime ? -1 : 1
  })
  return ok(list)
}

export async function fetchPlansByProductMock(
  productId: number,
  orgId: number,
  keyword?: string
): Promise<ApiResult<PlanOption[]>> {
  await delay()
  const occupyByName = new Map<string, NonNullable<PlanOption['occupyStatus']>>()
  trialPlans
    .filter((p) => p.orgId === orgId && p.productName)
    .forEach((p) => {
      if (p.status === '试用中' || p.status === '即将到期') {
        occupyByName.set(p.planName, '试用中')
      } else if (p.status === '已到期') {
        occupyByName.set(p.planName, '已到期')
      } else if (p.status === '停用') {
        occupyByName.set(p.planName, '停用')
      }
    })

  let list = planOptions
    .filter((p) => p.productId === productId)
    .map((p) => {
      let occupyStatus = p.occupyStatus || occupyByName.get(p.name)
      if (p.allowRepeatApply) {
        occupyStatus = undefined
      }
      return {
        ...p,
        occupyStatus,
        inTrial: occupyStatus === '试用中'
      }
    })
  if (keyword?.trim()) {
    list = list.filter((p) => p.name.includes(keyword.trim()))
  }
  /** 可选方案置顶，不可选按创建时间排在后面 */
  list = [...list].sort((a, b) => {
    const aBlocked = a.occupyStatus ? 1 : 0
    const bBlocked = b.occupyStatus ? 1 : 0
    if (aBlocked !== bBlocked) return aBlocked - bBlocked
    return a.createTime < b.createTime ? -1 : 1
  })
  return ok(list)
}

export async function fetchPlanOptionDetailMock(id: number): Promise<ApiResult<PlanOption | null>> {
  await delay()
  return ok(planOptions.find((p) => p.id === id) || null)
}

/** 产品详情（含下属方案列表） */
export async function fetchProductDetailMock(
  id: number
): Promise<ApiResult<(ProductItem & { plans: PlanOption[] }) | null>> {
  await delay()
  const product = products.find((p) => p.id === id)
  if (!product) return ok(null)
  const plans = planOptions
    .filter((p) => p.productId === id)
    .sort((a, b) => (a.createTime < b.createTime ? -1 : 1))
  return ok({ ...product, plans })
}

export async function submitTrialApplyMock(payload: {
  orgId: number
  productId: number
  planId: number
  remark: string
  customAnswers?: Record<string, string>
  /** 编辑草稿 / 已驳回工单后重新提交 */
  editId?: number
}): Promise<ApiResult<{ orderNo: string }>> {
  await delay(400)
  if (!payload.remark?.trim()) return fail('请填写申请说明')
  if (payload.remark.length > 500) return fail('申请说明不能超过500字')
  const org = orgs.find((o) => o.id === payload.orgId)
  const product = products.find((p) => p.id === payload.productId)
  const plan = planOptions.find((p) => p.id === payload.planId)
  if (!org || !product || !plan) return fail('提交失败，请重试')

  const time = new Date().toISOString().slice(0, 19).replace('T', ' ')
  if (payload.editId) {
    const item = applyOrders.find((o) => o.id === payload.editId)
    if (!item) return fail('原工单不存在')
    if (item.status !== '草稿' && item.status !== '未通过') {
      return fail('当前状态不可重新提交')
    }
    if (item.applicant !== CURRENT_USER) return fail('仅申请人可编辑')
    item.orgName = org.name
    item.orgUnit = org.unit
    item.orgId = org.id
    item.productId = product.id
    item.planId = plan.id
    item.productName = product.name
    item.planName = plan.name
    item.trialTimeLabel = plan.trialTimeLabel
    item.applyRemark = payload.remark.trim()
    item.planIntro = clipPlanIntro(plan.intro)
    item.customConfigs = plan.customConfigs
    item.customAnswers = payload.customAnswers
    item.status = '审核中'
    item.currentAuditor = '超级管理员'
    item.applyTime = time
    item.auditNodes = [
      { operator: CURRENT_USER, role: '销售', action: '重新提交申请', time },
      { operator: '超级管理员', role: '直属领导', action: '审核中' }
    ]
    return ok({ orderNo: item.orderNo }, '重新提交成功')
  }

  const id = Math.max(0, ...applyOrders.map((o) => o.id)) + 1
  const orderNo = `SY20260729${String(id).padStart(4, '0')}`
  applyOrders.unshift({
    id,
    orderNo,
    applicant: CURRENT_USER,
    applyTime: time,
    applyType: '申请试用',
    orgName: org.name,
    orgUnit: org.unit,
    orgId: org.id,
    productId: product.id,
    planId: plan.id,
    productName: product.name,
    planName: plan.name,
    planIntro: clipPlanIntro(plan.intro),
    trialTimeLabel: plan.trialTimeLabel,
    applyRemark: payload.remark.trim(),
    currentAuditor: '超级管理员',
    status: '审核中',
    customConfigs: plan.customConfigs,
    customAnswers: payload.customAnswers,
    auditNodes: [
      { operator: CURRENT_USER, role: '销售', action: '提交申请', time },
      { operator: '超级管理员', role: '直属领导', action: '审核中' }
    ]
  })
  return ok({ orderNo }, '提交成功')
}

export async function fetchStatUnitsMock(): Promise<ApiResult<StatUnitItem[]>> {
  await delay()
  const units: StatUnitItem[] = USER_UNITS.map((name) => {
    const planOrgIds = scopePlans(name).map((p) => p.orgId)
    const applyIds = applyingOrgIds(name)
    const orgIds = [...new Set([...planOrgIds, ...applyIds])]
    return { name, orgCount: orgIds.length }
  })
  return ok(units)
}

function buildStatCards(unit?: string): OrgStatCard {
  const plans = scopePlans(unit)
  const planOrgIds = [...new Set(plans.map((p) => p.orgId))]
  const applyIds = applyingOrgIds(unit)
  const orgIds = [...new Set([...planOrgIds, ...applyIds])]
  const trialingOrgs = orgIds.filter((id) =>
    plans.some((p) => p.orgId === id && (p.status === '试用中' || p.status === '即将到期'))
  ).length
  const soonExpireOrgs = orgIds.filter((id) =>
    plans.some((p) => p.orgId === id && p.status === '即将到期')
  ).length
  const expiredOrgs = orgIds.filter((id) =>
    plans.some((p) => p.orgId === id && p.status === '已到期')
  ).length
  const freezeOrgs = orgIds.filter((id) =>
    plans.some((p) => p.orgId === id && p.status === '冷冻期')
  ).length
  return {
    totalOrgs: orgIds.length,
    trialingOrgs,
    soonExpireOrgs,
    expiredOrgs,
    freezeOrgs,
    applyingOrgs: applyIds.length
  }
}

export async function fetchOrgStatCardsMock(unit?: string): Promise<ApiResult<OrgStatCard>> {
  await delay()
  return ok(buildStatCards(unit))
}

export async function fetchOrgListMock(
  filter: OrgListFilter = 'all',
  keyword?: string,
  unit?: string
): Promise<ApiResult<OrgListItem[]>> {
  await delay()
  const planOrgIds = scopePlans(unit).map((p) => p.orgId)
  const applyIds = applyingOrgIds(unit)
  const orgIds = [...new Set([...planOrgIds, ...applyIds])].filter((id) =>
    orgMatchesFilter(id, filter, unit)
  )
  let list = orgIds
    .map((id) => toOrgListItem(id, unit, filter))
    .filter(Boolean) as OrgListItem[]
  if (keyword?.trim()) {
    list = list.filter((o) => o.name.includes(keyword.trim()))
  }
  return ok(list)
}

export async function fetchTrialPlanDetailMock(id: number): Promise<ApiResult<TrialPlanRow | null>> {
  await delay()
  if (id >= 10000) {
    const orderId = id - 10000
    const order = applyOrders.find((o) => o.id === orderId)
    const org = order ? findOrgByApply(order) : undefined
    if (order && org) return ok(toApplyingPlanRow(order, org))
    return ok(null)
  }
  return ok(trialPlans.find((p) => p.id === id) || null)
}

export async function fetchTrialOrgDetailMock(
  id: number
): Promise<ApiResult<{ org: OrgItem; plans: TrialPlanRow[] } | null>> {
  await delay()
  const org = orgs.find((o) => o.id === id)
  if (!org) return ok(null)
  // 产品方案列表仅展示方案状态（试用中/即将到期/已到期/冷冻期/停用/申请中），
  // 不把工单侧「审核中/处理中/未通过」映射进方案列表
  const plans = trialPlans.filter((p) => p.orgId === id)
  if (!plans.length) return ok(null)
  return ok({ org, plans })
}

export async function extendTrialMock(id: number): Promise<ApiResult<TrialPlanRow | null>> {
  await delay()
  const item = trialPlans.find((p) => p.id === id)
  if (!item) return fail('方案不存在')
  const check = canExtendPlan(item)
  if (!check.ok) return fail(check.tip || '不可延期')
  item.remainExtendCount -= 1
  item.extendedCount += 1
  item.status = '试用中'
  item.freezeDaysLeft = undefined
  item.remainTime = '剩余 30 天'
  return ok(item, '延期成功')
}

export async function applyCloseMock(
  id: number,
  remark: string
): Promise<ApiResult<{ orderNo: string }>> {
  await delay()
  const item = trialPlans.find((p) => p.id === id)
  if (!item) return fail('方案不存在')
  if (!remark.trim()) return fail('请填写申请说明')
  const orderId = applyOrders.length + 1
  const orderNo = `SY20260729${String(orderId).padStart(4, '0')}`
  applyOrders.unshift({
    id: orderId,
    orderNo,
    applicant: CURRENT_USER,
    applyTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
    applyType: '申请关停',
    orgName: item.orgName,
    orgUnit: item.unit,
    productName: item.productName,
    planName: item.planName,
    trialTimeLabel: item.trialTimeLabel,
    applyRemark: remark.trim(),
    currentAuditor: '超级管理员',
    status: '审核中',
    auditNodes: [
      {
        operator: CURRENT_USER,
        role: '销售',
        action: '提交申请',
        time: new Date().toISOString().slice(0, 19).replace('T', ' ')
      },
      { operator: '超级管理员', role: '直属领导', action: '审核中' }
    ]
  })
  return ok({ orderNo }, '提交成功')
}

export async function applyResetMock(
  id: number,
  remark: string
): Promise<ApiResult<{ orderNo: string }>> {
  await delay()
  const item = trialPlans.find((p) => p.id === id)
  if (!item) return fail('方案不存在')
  if (item.resetPending) return fail('重置工单待审核')
  if (!remark.trim()) return fail('请填写申请说明')
  item.resetPending = true
  const orderId = applyOrders.length + 1
  const orderNo = `SY20260729${String(orderId).padStart(4, '0')}`
  applyOrders.unshift({
    id: orderId,
    orderNo,
    applicant: CURRENT_USER,
    applyTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
    applyType: '申请重置',
    orgName: item.orgName,
    orgUnit: item.unit,
    productName: item.productName,
    planName: item.planName,
    trialTimeLabel: item.trialTimeLabel,
    applyRemark: remark.trim(),
    currentAuditor: '超级管理员',
    status: '审核中',
    auditNodes: [
      {
        operator: CURRENT_USER,
        role: '销售',
        action: '提交申请',
        time: new Date().toISOString().slice(0, 19).replace('T', ' ')
      },
      { operator: '超级管理员', role: '直属领导', action: '审核中' }
    ],
    extendRecords: [{ applyTime: '2026-06-01 10:00:00', extendDays: 15, status: '已生效' }]
  })
  return ok({ orderNo }, '提交成功')
}

/** 我的申请：统计单元下全部工单（含他人发起） */
export async function fetchMyAppliesMock(): Promise<ApiResult<ApplyOrderRow[]>> {
  await delay()
  const list = applyOrders
    .filter((o) => o.orgUnit === CURRENT_UNIT)
    .sort((a, b) => (a.applyTime < b.applyTime ? 1 : -1))
  return ok(list)
}

export async function fetchPendingAuditMock(): Promise<ApiResult<ApplyOrderRow[]>> {
  await delay()
  return ok(applyOrders.filter((o) => o.status === '审核中'))
}

export async function fetchAuditRecordsMock(): Promise<ApiResult<ApplyOrderRow[]>> {
  await delay()
  return ok(
    applyOrders.filter(
      (o) =>
        (o.status === '已归档' || o.status === '未通过') && o.orgUnit === CURRENT_UNIT
    )
  )
}

export async function fetchApplyDetailMock(id: number): Promise<ApiResult<ApplyOrderRow | null>> {
  await delay()
  const item = applyOrders.find((o) => o.id === id)
  if (!item) return ok(null)
  const plan =
    (item.planId ? planOptions.find((p) => p.id === item.planId) : undefined) ||
    planOptions.find((p) => p.name === item.planName && p.productId === item.productId) ||
    planOptions.find((p) => p.name === item.planName)
  return ok({
    ...item,
    planIntro: clipPlanIntro(item.planIntro || plan?.intro),
    customConfigs: item.customConfigs?.length
      ? item.customConfigs
      : plan?.customConfigs
        ? [...plan.customConfigs]
        : item.customConfigs,
    customAnswers: item.customAnswers
  })
}

const messageNotifications: MessageNotification[] = [
  {
    id: 1,
    kind: 'expire_soon',
    title: '【即将到期通知】',
    pushTime: '2026-08-20 09:00:00',
    orgName: '陕西省网信办',
    planName: '河图融媒体基础版方案',
    remainTime: '剩余 3 天',
    expireTime: '2026-08-23 23:59:59',
    trialPlanId: 2
  },
  {
    id: 2,
    kind: 'todo_audit',
    title: '【待办通知】',
    pushTime: '2026-08-20 11:50:00',
    orderId: 9,
    applyType: '申请试用',
    orgName: '张华的机构',
    planName: '数解舆情-三类机构试用（王旭龙测试）',
    applicant: '王兴',
    applyTime: '2026-08-20 11:46:07',
    orderNo: 'SY20260820002'
  },
  {
    id: 3,
    kind: 'todo_process',
    title: '【待处理通知】',
    pushTime: '2026-08-20 14:30:00',
    orderId: 7,
    orgName: '咸阳市某单位',
    planName: '点点密信一二类机构试用',
    applyType: '申请试用'
  },
  {
    id: 4,
    kind: 'todo_audit',
    title: '【待办通知】',
    pushTime: '2026-07-28 10:25:00',
    orderId: 6,
    applyType: '申请试用',
    orgName: '咸阳市某单位',
    planName: '全球眼一二类机构试用',
    applicant: '王兴',
    applyTime: '2026-07-28 10:20:00',
    orderNo: 'SY202607280010'
  }
]

/** 消息通知列表 */
export async function fetchMessageNotificationsMock(): Promise<ApiResult<MessageNotification[]>> {
  await delay()
  return ok(
    [...messageNotifications].sort((a, b) => (a.pushTime < b.pushTime ? 1 : -1))
  )
}

export async function revokeApplyMock(id: number): Promise<ApiResult<ApplyOrderRow | null>> {
  await delay()
  const item = applyOrders.find((o) => o.id === id)
  if (!item) return fail('工单不存在')
  if (item.status !== '审核中') return fail('当前状态不可撤销')
  if (item.applicant !== CURRENT_USER) return fail('仅申请人可撤销')
  item.status = '草稿'
  item.currentAuditor = ''
  item.auditNodes.push({
    operator: CURRENT_USER,
    role: '销售',
    action: '撤销申请',
    time: new Date().toISOString().slice(0, 19).replace('T', ' ')
  })
  return ok(item, '已撤销')
}

export async function deleteApplyMock(id: number): Promise<ApiResult<null>> {
  await delay()
  const idx = applyOrders.findIndex((o) => o.id === id)
  if (idx < 0) return fail('工单不存在')
  const item = applyOrders[idx]
  if (item.applicant !== CURRENT_USER) return fail('仅申请人可删除')
  if (item.status !== '草稿' && item.status !== '未通过') return fail('当前状态不可删除')
  applyOrders.splice(idx, 1)
  return ok(null, '已删除')
}

export async function auditApplyMock(
  id: number,
  action: 'pass' | 'reject',
  remark?: string
): Promise<ApiResult<ApplyOrderRow | null>> {
  await delay()
  const item = applyOrders.find((o) => o.id === id)
  if (!item) return fail('工单不存在')
  if (item.status !== '审核中') return fail('当前状态不可审核')
  const time = new Date().toISOString().slice(0, 19).replace('T', ' ')
  item.auditNodes = item.auditNodes.filter((n) => n.action !== '审核中')
  if (action === 'reject') {
    if (!remark?.trim()) return fail('请填写审核意见')
    item.status = '未通过'
    item.currentAuditor = ''
    item.auditNodes.push({
      operator: CURRENT_AUDITOR,
      role: '审核人',
      action: '审核驳回',
      time,
      remark
    })
    return ok(item, '已驳回')
  }
  item.auditNodes.push({
    operator: CURRENT_AUDITOR,
    role: '审核人',
    action: '审核通过',
    time
  })
  item.status = item.applyType === '申请试用' ? '处理中' : '已归档'
  item.currentAuditor = ''
  return ok(item, '审核通过')
}

export function shortPlanName(name: string) {
  return name.length > 10 ? `${name.slice(0, 10)}…` : name
}
