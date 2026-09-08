export type Status = 'enabled' | 'disabled'
export type TimeRange = 'all' | 'd7' | 'd30'
export type StandardScope = 'global' | 'org'

export interface Supplier {
  id: string
  name: string
  code: string
  status: Status
  updatedAt: string
}

/** 元数据字段（对齐 MT 数据标准管理） */
export interface Metadata {
  id: string
  name: string
  code?: string
  /** 描述 / 业务含义 */
  description?: string
  bizCaliber?: string
  bizMeaning?: string
  dataType?: string
  type?: string
  required?: boolean | null
  length?: string
  defaultValue?: string
  bizCategory?: string
  remark?: string
  status?: Status
  updatedAt?: string
  /** 兼容旧文档型元数据 */
  category?: string
  topic?: string
  requiredLevel?: string
  provider?: string
  charset?: string
  primaryKey?: string
  updateCycle?: string
  maxSize?: string
  owner?: string
  monitor?: string
  sla?: string
}

/** 生效标准中展示用的字段（对齐 MT 字段库） */
export interface StandardField {
  id: string
  name: string
  description: string
  /** @deprecated 同 description，兼容旧预览 */
  bizMeaning: string
  dataType: string
  required: boolean | null
  length: string
  defaultValue: string
  bizCategory: string
  remark: string
}

export interface Scheme {
  id: string
  name: string
  dataSourceType?: string
  dataSourceTypeLabel?: string
  supplierId?: string
  supplierName?: string
  jdbcDbType?: string
  jdbcDbTypeLabel?: string
  jdbcHost?: string
  jdbcPort?: string
  jdbcDatabase?: string
  jdbcSchema?: string
  jdbcUsername?: string
  jdbcPassword?: string
  jdbcUrlPreview?: string
  frontHost?: string
  frontPort?: string
  protocol?: string
  path?: string
  frequency: string
  frequencyLabel?: string
  updateMode: string
  updateModeLabel?: string
  incrementField: string
  retry: number
  remark: string
  status: Status
  updatedAt: string
  /** 是否需要 IP 白名单管控（MT V1.1） */
  requireIpWhitelist?: boolean
  needWhitelist?: boolean
  ipWhitelistRequired?: boolean
  whitelist?: boolean
}

export interface ApiAccessConfig {
  protocol?: string
  method?: string
  baseUrl?: string
  path?: string
  contentType?: string
  charset?: string
  authType?: string
  authHeaderName?: string
  timeoutSec?: number
  retry?: number
  rateLimitQps?: number
  idempotencyHeader?: string
  batchMaxSize?: number
  successCodePath?: string
  successCodeValue?: string
}

export interface Standard {
  id: string
  name: string
  fileName: string
  type: string
  fileSize: string
  publishedAt: string
  fileUrl: string
  metadataId?: string
  schemeId?: string
  metadataName?: string
  schemeName?: string
  status: Status
  /** 全局 / 机构 */
  scope?: StandardScope
  scopeLabel: string
  orgId?: string
  orgName?: string
  fieldIds?: string[]
  requireIpWhitelist?: boolean
  remark?: string
  apiAccess?: ApiAccessConfig | null
  apiDocMarkdown?: string
  /** 数据标准块：勾选字段摘要 */
  fields: StandardField[]
  metadata?: Metadata | null
  scheme?: Scheme | null
}

export interface Overview {
  supplierCount: number
  inboundTotal: number
  lastInboundAt: string
}

export interface StatsRow {
  id: string
  name: string
  count: number
}

export interface PageResult<T> {
  list: T[]
  total: number
}

export const categoryLabels: Record<string, string> = {
  table: '库表数据集',
  unstructured: '非结构化数据',
  api: '接口数据',
}

export const requiredLabels: Record<string, string> = {
  required: '必接',
  suggested: '建议',
  optional: '可选',
}

export const frequencyLabels: Record<string, string> = {
  realtime: '实时',
  hourly: '每小时',
  daily: '每日',
}

export const updateModeLabels: Record<string, string> = {
  incremental: '增量',
  full: '全量',
}

const BRIDGE_KEY = 'yunshu-enabled-standard-v1'
const BRIDGE_LIST_KEY = 'yunshu-enabled-standards-v2'

const suppliers: Supplier[] = [
  { id: 's1', name: '清博智能', code: 'QB001', status: 'enabled', updatedAt: '2026-09-01 14:20:00' },
  { id: 's2', name: '智慧星光', code: 'ZX001', status: 'enabled', updatedAt: '2026-08-28 09:10:00' },
  { id: 's3', name: '数美科技', code: 'SM001', status: 'disabled', updatedAt: '2026-09-02 18:06:00' },
  { id: 's4', name: '百度舆情', code: 'BD001', status: 'enabled', updatedAt: '2026-08-15 11:00:00' },
]

const configuredIds = ['s1', 's2', 's3']

const inbound: Record<TimeRange, Record<string, number>> = {
  all: { s1: 12840, s2: 5620, s3: 2100, s4: 880 },
  d7: { s1: 320, s2: 96, s3: 0, s4: 40 },
  d30: { s1: 1860, s2: 540, s3: 0, s4: 210 },
}

const defaultFields: Metadata[] = [
  { id: 'supplier_code', name: 'supplier_code', code: 'supplier_code', description: '供数方编码，对应供数方管理中的编码；库表路径据此识别来源厂商', bizCaliber: '供数方编码', dataType: 'String', required: true, length: '32', defaultValue: '', bizCategory: '运维管理', remark: '', status: 'enabled' },
  { id: 'org_id', name: 'org_id', code: 'org_id', description: '归属机构编码；对应机构供数配置中的机构编码，一条只归属一个机构', bizCaliber: '归属机构编码', dataType: 'String', required: true, length: '64', defaultValue: '', bizCategory: '运维管理', remark: '', status: 'enabled' },
  { id: 'platform', name: 'platform', code: 'platform', description: '平台类型', bizCaliber: '平台类型', dataType: 'String', required: true, length: '', defaultValue: '', bizCategory: '平台', remark: '', status: 'enabled' },
  { id: 'platform_name', name: 'platform_name', code: 'platform_name', description: '平台名称', bizCaliber: '平台名称', dataType: 'String', required: true, length: '', defaultValue: '', bizCategory: '平台', remark: '', status: 'enabled' },
  { id: 'news_uuid', name: 'news_uuid', code: 'news_uuid', description: '文章唯一的标识', bizCaliber: '文章唯一的标识', dataType: 'String', required: true, length: '64', defaultValue: '', bizCategory: '文章', remark: '', status: 'enabled' },
  { id: 'news_title', name: 'news_title', code: 'news_title', description: '信息标题', bizCaliber: '信息标题', dataType: 'String', required: false, length: '512', defaultValue: '', bizCategory: '文章', remark: '', status: 'enabled' },
  { id: 'media_name', name: 'media_name', code: 'media_name', description: '发布者昵称', bizCaliber: '发布者昵称', dataType: 'String', required: false, length: '', defaultValue: '', bizCategory: '作者', remark: '', status: 'enabled' },
  { id: 'news_is_origin', name: 'news_is_origin', code: 'news_is_origin', description: '是否原创', bizCaliber: '是否原创', dataType: 'String', required: false, length: '', defaultValue: '', bizCategory: '标注', remark: '', status: 'enabled' },
]

const defaultMetadata = defaultFields[0]

const defaultScheme: Scheme = {
  id: 'p1',
  name: '舆情库表增量接入',
  dataSourceType: 'table',
  dataSourceTypeLabel: '库表数据集',
  jdbcDbType: 'mysql',
  jdbcDbTypeLabel: 'MySQL',
  jdbcHost: '10.0.1.12',
  jdbcPort: '3306',
  jdbcDatabase: 'yunshu_ods',
  jdbcSchema: '',
  jdbcUsername: 'yunshu_rw',
  jdbcPassword: '******',
  jdbcUrlPreview: 'jdbc:mysql://10.0.1.12:3306/yunshu_ods?useSSL=false&serverTimezone=Asia/Shanghai',
  frontHost: '10.0.1.12',
  frontPort: '3306',
  protocol: 'MySQL',
  path: 'yunshu_ods',
  frequency: 'hourly',
  frequencyLabel: '每小时',
  updateMode: 'incremental',
  updateModeLabel: '增量',
  incrementField: 'content_time',
  retry: 3,
  remark: 'MySQL JDBC 增量抽取',
  status: 'enabled',
  updatedAt: '2026-09-01 14:20:00',
  requireIpWhitelist: true,
}

const defaultStandard: Standard = {
  id: 'st1',
  name: '云数中台全局接入标准',
  fileName: '云数中台接入标准.docx',
  type: 'Word',
  fileSize: '31 KB',
  publishedAt: '2026-09-03 11:00:00',
  fileUrl: '/files/yunshu-access-standard-example.docx',
  metadataId: 'supplier_code',
  schemeId: 'p1',
  metadataName: defaultFields.map((f) => f.name).join('、'),
  schemeName: defaultScheme.name,
  status: 'enabled',
  scope: 'global',
  scopeLabel: '全局',
  fieldIds: defaultFields.map((f) => f.id),
  fields: [],
  metadata: defaultMetadata,
  scheme: defaultScheme,
}

function paginate<T>(list: T[], page: number, pageSize: number): PageResult<T> {
  const start = (page - 1) * pageSize
  return { list: list.slice(start, start + pageSize), total: list.length }
}

function configuredSuppliers(): Supplier[] {
  return configuredIds.map((id) => suppliers.find((s) => s.id === id)).filter(Boolean) as Supplier[]
}

export function schemeRequiresWhitelist(scheme: Scheme | null | undefined): boolean {
  if (!scheme) return false
  return Boolean(
    scheme.requireIpWhitelist ??
      scheme.needWhitelist ??
      scheme.ipWhitelistRequired ??
      scheme.whitelist,
  )
}

function toStandardField(raw: Partial<Metadata> & { id?: string; name?: string }): StandardField {
  const description = String(
    raw.description || raw.bizMeaning || raw.bizCaliber || '—',
  )
  const required =
    typeof raw.required === 'boolean'
      ? raw.required
      : raw.requiredLevel === 'required'
        ? true
        : raw.requiredLevel === 'optional'
          ? false
          : null
  return {
    id: String(raw.id || raw.name || ''),
    name: String(raw.name || '—'),
    description,
    bizMeaning: description,
    dataType: String(raw.dataType || raw.type || '—'),
    required,
    length: String(raw.length || ''),
    defaultValue: String(raw.defaultValue || ''),
    bizCategory: String(raw.bizCategory || ''),
    remark: String(raw.remark || ''),
  }
}

function normalizeFields(raw: Record<string, unknown>): StandardField[] {
  const fields = raw.fields
  if (Array.isArray(fields) && fields.length) {
    return fields.map((item, index) => {
      const field = toStandardField((item || {}) as Metadata)
      if (!field.id) field.id = `f${index + 1}`
      return field
    })
  }
  const metadata = raw.metadata
  if (metadata && typeof metadata === 'object') {
    return [toStandardField(metadata as Metadata)]
  }
  return defaultFields.map(toStandardField)
}

function resolveScopeLabel(raw: Record<string, unknown>): { scope: StandardScope; scopeLabel: string } {
  const explicit = raw.scopeLabel
  if (typeof explicit === 'string' && explicit.trim()) {
    const label = explicit.trim()
    const scope: StandardScope = label.includes('机构') || raw.scope === 'org' ? 'org' : 'global'
    return { scope, scopeLabel: label.includes('机构') ? '机构' : label.includes('全局') ? '全局' : label }
  }
  const scope: StandardScope = raw.scope === 'org' ? 'org' : 'global'
  if (scope === 'org') {
    const orgName = typeof raw.orgName === 'string' && raw.orgName ? raw.orgName : ''
    return { scope, scopeLabel: orgName ? `机构（${orgName}）` : '机构' }
  }
  return { scope: 'global', scopeLabel: '全局' }
}

function enrichScheme(scheme: Scheme | null | undefined): Scheme | null {
  if (!scheme) return null
  const type = scheme.dataSourceType || 'table'
  const typeLabels: Record<string, string> = {
    table: '库表数据集',
    api: '接口',
    unstructured: '非结构化',
    queue: '实时队列',
  }
  const dbTypeLabels: Record<string, string> = {
    mysql: 'MySQL',
    postgresql: 'PostgreSQL',
    oracle: 'Oracle',
    dm: '达梦 DM',
    sqlserver: 'SQL Server',
  }
  const jdbcDbType = scheme.jdbcDbType || ''
  return {
    ...scheme,
    dataSourceType: type,
    dataSourceTypeLabel: scheme.dataSourceTypeLabel || typeLabels[type] || type,
    jdbcDbTypeLabel: scheme.jdbcDbTypeLabel || dbTypeLabels[jdbcDbType] || jdbcDbType || '—',
    frequencyLabel: scheme.frequencyLabel || frequencyLabels[scheme.frequency] || scheme.frequency,
    updateModeLabel: scheme.updateModeLabel || updateModeLabels[scheme.updateMode] || scheme.updateMode,
    requireIpWhitelist: schemeRequiresWhitelist(scheme),
  }
}

type BridgeRaw = Partial<Standard> & {
  uploadedAt?: string
  size?: string
  fields?: unknown
  metadata?: Metadata | null
  scheme?: Scheme | null
}

function hydrateEnabled(raw: BridgeRaw | null): Standard | null {
  if (!raw || typeof raw !== 'object') return null

  const bag = raw as Record<string, unknown>
  const fields = normalizeFields(bag)
  const { scope, scopeLabel } = resolveScopeLabel(bag)

  const metadata =
    (raw.metadata as Metadata | null | undefined) ||
    (fields[0]
      ? ({
          id: fields[0].id,
          name: fields[0].name,
          description: fields[0].description,
          bizCaliber: fields[0].description,
          dataType: fields[0].dataType,
          required: fields[0].required,
          length: fields[0].length,
          bizCategory: fields[0].bizCategory,
        } as Metadata)
      : null) ||
    defaultMetadata

  const published =
    raw.publishedAt ||
    (raw as BridgeRaw).uploadedAt ||
    defaultStandard.publishedAt

  const scheme = enrichScheme(
    (raw.scheme as Scheme | null | undefined) ||
      (raw.apiAccess
        ? ({
            id: 'api',
            name: '接口推送',
            dataSourceType: 'api',
            dataSourceTypeLabel: '接口',
            frequency: 'realtime',
            frequencyLabel: '实时',
            updateMode: 'incremental',
            updateModeLabel: '推送',
            incrementField: '',
            retry: Number(raw.apiAccess.retry ?? 3),
            remark: raw.remark || '',
            status: 'enabled',
            updatedAt: published || '',
            requireIpWhitelist: !!raw.requireIpWhitelist,
            protocol: raw.apiAccess.protocol,
            path: raw.apiAccess.path,
            frontHost: (raw.apiAccess.baseUrl || '').replace(/^https?:\/\//, ''),
          } as Scheme)
        : null) ||
      (raw.schemeId === defaultScheme.id ? defaultScheme : null) ||
      defaultScheme,
  )

  return {
    ...defaultStandard,
    ...raw,
    id: raw.id || defaultStandard.id,
    name: raw.name || defaultStandard.name,
    fileName: raw.fileName || `${raw.name || defaultStandard.name}-接口文档.md`,
    type: raw.type || (raw.apiAccess ? 'API' : 'Word'),
    fileSize: raw.fileSize || (raw as BridgeRaw).size || defaultStandard.fileSize,
    publishedAt: published,
    fileUrl: raw.fileUrl || defaultStandard.fileUrl,
    metadataId: raw.metadataId || metadata.id,
    schemeId: raw.schemeId || scheme?.id || 'api',
    metadataName: raw.metadataName || metadata.name || fields.map((f) => f.name).join('、') || '—',
    schemeName: raw.schemeName || (raw.apiAccess ? '接口推送' : scheme?.name) || '—',
    status: (raw.status as Status) || 'enabled',
    scope,
    scopeLabel,
    orgId: raw.orgId,
    orgName: raw.orgName,
    fieldIds: raw.fieldIds || fields.map((f) => f.id).filter(Boolean),
    fields,
    metadata,
    scheme,
    requireIpWhitelist: !!raw.requireIpWhitelist,
    remark: raw.remark || '',
    apiAccess: raw.apiAccess || null,
    apiDocMarkdown: raw.apiDocMarkdown || '',
  }
}

export const v8Mock = {
  orgName: '某市网信办',
  paginate,
  configuredSuppliers,
  statsRows(range: TimeRange): StatsRow[] {
    const bag = inbound[range] || inbound.all
    return configuredSuppliers().map((s) => ({
      id: s.id,
      name: s.name,
      count: bag[s.id] != null ? bag[s.id] : 0,
    }))
  },
  overview(): Overview {
    const rows = this.statsRows('all')
    const total = rows.reduce((sum, row) => sum + row.count, 0)
    return {
      supplierCount: configuredIds.length,
      inboundTotal: total,
      lastInboundAt: total ? '2026-09-03 08:12:00' : '',
    }
  },
  /**
   * 读取 MT 桥接的生效标准。
   * - key 不存在：使用本地 fallback 示例（便于单独演示 V8）
   * - key 存在且值为 null：无生效标准 → 返回 null（空态）
   * - 兼容旧结构（单 metadata）与新结构（fields[] + scope + scheme.requireIpWhitelist）
   */
  getEnabledStandard(): Standard | null {
    const list = this.getEnabledStandards()
    return list[0] || null
  },
  getEnabledStandards(): Standard[] {
    try {
      const listRaw = localStorage.getItem(BRIDGE_LIST_KEY)
      if (listRaw !== null) {
        const parsed = JSON.parse(listRaw) as BridgeRaw[] | null
        if (Array.isArray(parsed)) {
          return parsed.map((item) => hydrateEnabled(item)).filter(Boolean) as Standard[]
        }
      }
      const raw = localStorage.getItem(BRIDGE_KEY)
      if (raw !== null) {
        const parsed = JSON.parse(raw) as BridgeRaw | null
        const one = hydrateEnabled(parsed)
        return one ? [one] : []
      }
    } catch {
      /* ignore */
    }
    const fallback = hydrateEnabled({
      ...defaultStandard,
      fields: defaultFields,
      metadata: defaultMetadata,
      scheme: defaultScheme,
      apiAccess: {
        protocol: 'HTTPS',
        method: 'POST',
        baseUrl: 'https://api.yunshu.example.com',
        path: '/api/v1/articles/push',
        contentType: 'application/json',
        charset: 'UTF-8',
        authType: 'appkey_header',
        authHeaderName: 'X-App-Key',
        timeoutSec: 30,
        retry: 3,
        rateLimitQps: 50,
        idempotencyHeader: 'X-Idempotency-Key',
        batchMaxSize: 100,
        successCodePath: 'code',
        successCodeValue: '0',
      },
      apiDocMarkdown: '# 云数中台全局接入方案 · 接口接入文档\n\n（演示文档，请在 MT 保存接入方案后同步）\n',
      requireIpWhitelist: true,
    } as BridgeRaw)
    return fallback ? [fallback] : []
  },
}

export function delay(ms = 220): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
