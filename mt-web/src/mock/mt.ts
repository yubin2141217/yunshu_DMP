export type Status = 'enabled' | 'disabled'
export type StandardScope = 'global' | 'org'

export interface Supplier {
  id: string
  name: string
  code: string
  status: Status
  appkey: string
  updatedAt: string
}

export interface Org {
  id: string
  name: string
  /** 机构编码：供数方送数时 org_id 字段须填此值 */
  code: string
  status: Status
  supplierIds: string[]
  /** 可绑定多个接入方案（原标准） */
  standardIds: string[]
  /** @deprecated 兼容旧单选 */
  standardId?: string
  supplierNames?: string[]
  standardName?: string
  standardNames?: string[]
}

/** 业务分类（数据标准字段） */
export type BizCategory = '文章' | '作者' | '平台' | '标注' | '其它' | '运维管理'

/** 数据标准条目 */
export interface Metadata {
  id: string
  /** 字段名（唯一） */
  name: string
  /** 与 name 同步，供唯一校验兼容 */
  code: string
  /** 描述 */
  description: string
  /** 兼容旧桥接字段：等同 description */
  bizCaliber: string
  dataType: string
  /** 是否必填；未设置表示未填 */
  required?: boolean | null
  length?: string
  defaultValue?: string
  /** 业务分类 */
  bizCategory?: BizCategory | ''
  remark: string
  status: Status
  updatedAt: string
  /** 列表扩展：被多少接入方案引用 */
  refSchemeCount?: number
}

export type DataSourceType = 'table' | 'api' | 'unstructured' | 'queue'
export type JdbcDbType = 'mysql' | 'postgresql' | 'oracle' | 'dm' | 'sqlserver'

export interface Scheme {
  id: string
  name: string
  /** 数据源类型 */
  dataSourceType: DataSourceType
  /** 兼容旧字段，表单已移除 */
  supplierId?: string
  supplierName?: string
  /** JDBC：数据库类型 */
  jdbcDbType: JdbcDbType | string
  /** JDBC：主机 */
  jdbcHost: string
  /** JDBC：端口 */
  jdbcPort: string
  /** JDBC：库名 */
  jdbcDatabase: string
  /** JDBC：Schema / 模式（可选） */
  jdbcSchema: string
  /** JDBC：用户名 */
  jdbcUsername: string
  /** JDBC：密码（演示脱敏存储） */
  jdbcPassword: string
  /** 兼容旧桥接字段：映射自 JDBC 主机等 */
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
  requireIpWhitelist: boolean
  remark: string
  status: Status
  updatedAt: string
  dataSourceTypeLabel?: string
  jdbcDbTypeLabel?: string
  jdbcUrlPreview?: string
}

export interface Standard {
  id: string
  name: string
  scope: StandardScope
  orgId?: string
  orgName?: string
  /** 勾选的字段库 id 列表 */
  fieldIds: string[]
  /** 兼容旧字段：取 fieldIds[0] */
  metadataId: string
  /** @deprecated 已内嵌 apiAccess，保留兼容 */
  schemeId?: string
  metadataName?: string
  fieldNames?: string
  fieldSummary?: string
  schemeName?: string
  fields?: Metadata[]
  scheme?: Scheme | null
  metadata?: Metadata | null
  /** IP 白名单管控 */
  requireIpWhitelist: boolean
  remark: string
  /** 接口接入方式配置 */
  apiAccess: ApiAccessConfig
  /** 提交后生成的接口文档（Markdown） */
  apiDocMarkdown: string
  fileName: string
  fileSize: string
  fileUrl: string
  status: Status
  uploader: string
  uploadedAt: string
  type?: string
  publishedAt?: string
}

export type ApiAuthType = 'appkey_header' | 'bearer' | 'signature'

/** 接口类型接入方式（不再区分库表等数据源） */
export interface ApiAccessConfig {
  protocol: 'HTTPS' | 'HTTP'
  method: 'POST' | 'PUT' | 'PATCH'
  baseUrl: string
  path: string
  contentType: string
  charset: string
  authType: ApiAuthType
  authHeaderName: string
  timeoutSec: number
  retry: number
  rateLimitQps: number
  idempotencyHeader: string
  batchMaxSize: number
  successCodePath: string
  successCodeValue: string
}

export function defaultApiAccess(): ApiAccessConfig {
  return {
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
  }
}

export const apiAuthTypeOptions = [
  { label: 'Header AppKey（推荐）', value: 'appkey_header' },
  { label: 'Bearer Token', value: 'bearer' },
  { label: '请求签名', value: 'signature' },
]

export function buildApiEndpoint(api: ApiAccessConfig) {
  const base = (api.baseUrl || '').replace(/\/$/, '')
  const path = api.path?.startsWith('/') ? api.path : `/${api.path || ''}`
  return `${api.protocol.toLowerCase() === 'http' ? 'http' : 'https'}://${base.replace(/^https?:\/\//, '')}${path}`
}

type DocField = {
  name: string
  description?: string
  dataType?: string
  required?: boolean | null
  length?: string
  bizCategory?: string
}

/** 按已选字段与接入参数生成请求报文示例（HTTP + JSON） */
export function buildRequestExample(api: ApiAccessConfig, fields: DocField[]): string {
  const host = (api.baseUrl || '').replace(/^https?:\/\//, '').replace(/\/$/, '')
  const path = api.path?.startsWith('/') ? api.path : `/${api.path || ''}`
  const authLine =
    api.authType === 'bearer'
      ? 'Authorization: Bearer <token>'
      : api.authType === 'signature'
        ? `${api.authHeaderName || 'X-Signature'}: <signature>`
        : `${api.authHeaderName || 'X-App-Key'}: <your-appkey>`
  const bodyFields = fields.length ? fields : [{ name: 'field', dataType: 'string' }]
  const sampleBody = `{\n${bodyFields
    .map((f) => `  "${f.name}": "<${f.dataType || 'string'}>"`)
    .join(',\n')}\n}`
  const headers = [
    `${api.method} ${path} HTTP/1.1`,
    `Host: ${host || 'api.example.com'}`,
    `Content-Type: ${api.contentType || 'application/json'}; charset=${api.charset || 'UTF-8'}`,
    authLine,
  ]
  if (api.idempotencyHeader) headers.push(`${api.idempotencyHeader}: <uuid>`)
  return `${headers.join('\n')}\n\n${sampleBody}`
}

export function buildApiDocMarkdown(input: {
  name: string
  scope: StandardScope
  orgName?: string
  requireIpWhitelist: boolean
  remark: string
  fields: DocField[]
  api: ApiAccessConfig
}): string {
  const scopeLabel = input.scope === 'org' ? `机构${input.orgName ? `（${input.orgName}）` : ''}` : '全局'
  const authDesc =
    input.api.authType === 'bearer'
      ? `Authorization: Bearer <token>`
      : input.api.authType === 'signature'
        ? `签名头（按联调约定计算）`
        : `${input.api.authHeaderName}: <appkey>`
  const requestExample = buildRequestExample(input.api, input.fields)
  const securityNotice =
    input.scope === 'org'
      ? `本方案适用范围为机构${input.orgName ? `（${input.orgName}）` : ''}：接口鉴权所需的 appkey 请联系机构负责人获取，请勿通过公开渠道传播。`
      : `本方案适用范围为全局（未选择机构）：接口鉴权所需的 appkey 请联系康奈公司对接人获取，请勿通过公开渠道传播。`
  return `# ${input.name} · 接口接入文档

## 1. 概要
- 生效范围：${scopeLabel}
- 接入方式：HTTPS 接口推送
- IP 白名单管控：${input.requireIpWhitelist ? '是' : '否'}
- 备注：${input.remark || '—'}

## 2. 安全说明
${securityNotice}

## 3. 接口信息
| 项 | 说明 |
| --- | --- |
| 协议 | ${input.api.protocol} |
| 方法 | ${input.api.method} |
| Base URL | ${input.api.baseUrl} |
| Path | ${input.api.path} |
| 完整地址 | \`${buildApiEndpoint(input.api)}\` |
| Content-Type | ${input.api.contentType} |
| 字符集 | ${input.api.charset} |
| 鉴权 | ${authDesc} |
| 超时 | ${input.api.timeoutSec}s |
| 失败重试 | ${input.api.retry} 次 |
| 限流 | ${input.api.rateLimitQps} QPS |
| 幂等头 | ${input.api.idempotencyHeader || '—'} |
| 单批最大条数 | ${input.api.batchMaxSize} |
| 成功判定 | \`${input.api.successCodePath}\` = \`${input.api.successCodeValue}\` |

## 4. 请求体字段
| 序号 | 字段名 | 描述 | 类型 | 长度 | 业务分类 |
| --- | --- | --- | --- | --- | --- |
${
  input.fields
    .map(
      (f, i) =>
        `| ${i + 1} | \`${f.name}\` | ${f.description || '—'} | ${f.dataType || '—'} | ${f.length || '—'} | ${f.bizCategory || '—'} |`,
    )
    .join('\n') || '| — | — | — | — | — | — |'
}

## 5. 请求示例
\`\`\`http
${requestExample}
\`\`\`

## 6. 响应约定
成功时 HTTP 200，且业务码字段 \`${input.api.successCodePath}\` 等于 \`${input.api.successCodeValue}\`。
失败时返回可读错误信息；需白名单时来源 IP 未登记将拒收。

## 7. 来源识别说明
- 接口路径：凭 appkey 识别供数方
- 报文建议同时携带 \`supplier_code\`、\`org_id\`，与主数据编码一致
`
}

/** 由接入方案对象生成最新接口文档（含安全说明） */
export function resolveStandardApiDoc(item: {
  name: string
  scope?: StandardScope
  orgName?: string
  requireIpWhitelist?: boolean
  remark?: string
  fields?: DocField[]
  apiAccess?: ApiAccessConfig | null
  apiDocMarkdown?: string
}): string {
  return buildApiDocMarkdown({
    name: item.name,
    scope: item.scope || 'global',
    orgName: item.orgName || '',
    requireIpWhitelist: !!item.requireIpWhitelist,
    remark: item.remark || '',
    fields: item.fields || [],
    api: { ...defaultApiAccess(), ...(item.apiAccess || {}) },
  })
}

/** 接口文档 HTML（用于导出 PDF） */
export function buildApiDocHtml(input: {
  name: string
  scope: StandardScope
  orgName?: string
  requireIpWhitelist: boolean
  remark: string
  fields: DocField[]
  api: ApiAccessConfig
}): string {
  const scopeLabel = input.scope === 'org' ? `机构${input.orgName ? `（${input.orgName}）` : ''}` : '全局'
  const authDesc =
    input.api.authType === 'bearer'
      ? `Authorization: Bearer &lt;token&gt;`
      : input.api.authType === 'signature'
        ? `签名头（按联调约定计算）`
        : `${escapeHtml(input.api.authHeaderName)}: &lt;appkey&gt;`
  const securityNotice =
    input.scope === 'org'
      ? `本方案适用范围为机构${input.orgName ? `（${escapeHtml(input.orgName)}）` : ''}：接口鉴权所需的 <strong>appkey</strong> 请联系<strong>机构负责人</strong>获取，请勿通过公开渠道传播。`
      : `本方案适用范围为全局（未选择机构）：接口鉴权所需的 <strong>appkey</strong> 请联系<strong>康奈公司对接人</strong>获取，请勿通过公开渠道传播。`
  const fieldRows = input.fields
    .map(
      (f, i) =>
        `<tr><td>${i + 1}</td><td><code>${escapeHtml(f.name)}</code></td><td>${escapeHtml(f.description || '—')}</td><td>${escapeHtml(f.dataType || '—')}</td><td>${escapeHtml(f.length || '—')}</td><td>${escapeHtml(f.bizCategory || '—')}</td></tr>`,
    )
    .join('')
  const example = escapeHtml(buildRequestExample(input.api, input.fields))
  return `<div class="api-doc-pdf">
  <h1>${escapeHtml(input.name)} · 接口接入文档</h1>
  <h2>1. 概要</h2>
  <ul>
    <li>生效范围：${escapeHtml(scopeLabel)}</li>
    <li>接入方式：HTTPS 接口推送</li>
    <li>IP 白名单管控：${input.requireIpWhitelist ? '是' : '否'}</li>
    <li>备注：${escapeHtml(input.remark || '—')}</li>
  </ul>
  <h2>2. 安全说明</h2>
  <p class="security">${securityNotice}</p>
  <h2>3. 接口信息</h2>
  <table>
    <tbody>
      <tr><th>协议</th><td>${escapeHtml(input.api.protocol)}</td></tr>
      <tr><th>方法</th><td>${escapeHtml(input.api.method)}</td></tr>
      <tr><th>Base URL</th><td>${escapeHtml(input.api.baseUrl)}</td></tr>
      <tr><th>Path</th><td>${escapeHtml(input.api.path)}</td></tr>
      <tr><th>完整地址</th><td><code>${escapeHtml(buildApiEndpoint(input.api))}</code></td></tr>
      <tr><th>Content-Type</th><td>${escapeHtml(input.api.contentType)}</td></tr>
      <tr><th>字符集</th><td>${escapeHtml(input.api.charset)}</td></tr>
      <tr><th>鉴权</th><td>${authDesc}</td></tr>
      <tr><th>超时</th><td>${input.api.timeoutSec}s</td></tr>
      <tr><th>失败重试</th><td>${input.api.retry} 次</td></tr>
      <tr><th>限流</th><td>${input.api.rateLimitQps} QPS</td></tr>
      <tr><th>幂等头</th><td>${escapeHtml(input.api.idempotencyHeader || '—')}</td></tr>
      <tr><th>单批最大条数</th><td>${input.api.batchMaxSize}</td></tr>
      <tr><th>成功判定</th><td><code>${escapeHtml(input.api.successCodePath)}</code> = <code>${escapeHtml(input.api.successCodeValue)}</code></td></tr>
    </tbody>
  </table>
  <h2>4. 请求体字段</h2>
  <table>
    <thead><tr><th>序号</th><th>字段名</th><th>描述</th><th>类型</th><th>长度</th><th>业务分类</th></tr></thead>
    <tbody>${fieldRows || '<tr><td colspan="6">—</td></tr>'}</tbody>
  </table>
  <h2>5. 请求示例</h2>
  <pre>${example}</pre>
  <h2>6. 响应约定</h2>
  <p>成功时 HTTP 200，且业务码字段 <code>${escapeHtml(input.api.successCodePath)}</code> 等于 <code>${escapeHtml(input.api.successCodeValue)}</code>。失败时返回可读错误信息；需白名单时来源 IP 未登记将拒收。</p>
  <h2>7. 来源识别说明</h2>
  <ul>
    <li>接口路径：凭 appkey 识别供数方</li>
    <li>报文建议同时携带 <code>supplier_code</code>、<code>org_id</code>，与主数据编码一致</li>
  </ul>
</div>`
}

function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function resolveStandardApiDocHtml(item: {
  name: string
  scope?: StandardScope
  orgName?: string
  requireIpWhitelist?: boolean
  remark?: string
  fields?: DocField[]
  apiAccess?: ApiAccessConfig | null
}): string {
  return buildApiDocHtml({
    name: item.name,
    scope: item.scope || 'global',
    orgName: item.orgName || '',
    requireIpWhitelist: !!item.requireIpWhitelist,
    remark: item.remark || '',
    fields: item.fields || [],
    api: { ...defaultApiAccess(), ...(item.apiAccess || {}) },
  })
}

export interface IpWhitelistItem {
  id: string
  ip: string
  /** 所属供数方（厂商） */
  supplierId: string
  supplierName?: string
  remark: string
  createdAt: string
}

const STORAGE_KEY = 'yunshu-mt-mock-v18'
const BRIDGE_KEY = 'yunshu-enabled-standard-v1'
const BRIDGE_LIST_KEY = 'yunshu-enabled-standards-v2'

/** 去掉方案名称中括号及括号内文字（含全角/半角） */
function stripParenInName(name: string) {
  const cleaned = String(name || '')
    .replace(/\s*[（(][^）)]*[）)]\s*/g, '')
    .trim()
  return cleaned || String(name || '').trim()
}
/** V8 演示机构 */
export const DEMO_ORG_ID = 'o1'

export const bizCategoryOptions: { label: string; value: BizCategory }[] = [
  { label: '运维管理', value: '运维管理' },
  { label: '文章', value: '文章' },
  { label: '作者', value: '作者' },
  { label: '平台', value: '平台' },
  { label: '标注', value: '标注' },
  { label: '其它', value: '其它' },
]

/** @deprecated 运维管理字段已改为可选手动勾选，不再强制锁定 */
export const LOCKED_BIZ_CATEGORY: BizCategory = '运维管理'
export const LOCKED_FIELD_IDS = ['supplier_code', 'org_id'] as const

export function ensureLockedFieldIds(fieldIds: string[]): string[] {
  return [...new Set(fieldIds)]
}

export function isLockedFieldId(_id: string) {
  return false
}

/** 字段库快速模板 */
export type FieldTemplateType = 'system' | 'custom'

export interface FieldTemplate {
  id: string
  name: string
  /** 模板说明 */
  desc: string
  fieldIds: string[]
  /** 系统内置 / 用户自定义 */
  type: FieldTemplateType
  updatedAt: string
}

/** 系统内置快速模板种子 */
export const builtinFieldTemplates: FieldTemplate[] = [
  {
    id: 'tpl_qb_push',
    name: '清博智能推送字段模板',
    desc: '清博推送常用字段：运维标识 + 平台 + 文章核心 + 情感标注',
    type: 'system',
    updatedAt: '2026-09-01 10:00:00',
    fieldIds: [
      'supplier_code',
      'org_id',
      'platform',
      'platform_name',
      'news_uuid',
      'news_url',
      'news_title',
      'news_posttime',
      'news_content',
      'news_origin',
      'news_is_origin',
      'news_emotion',
    ],
  },
  {
    id: 'tpl_zx_wxb',
    name: '智慧星光推送网信办字段模板',
    desc: '面向网信办报送：地域平台信息 + 作者账号 + 文章全文与互动量',
    type: 'system',
    updatedAt: '2026-09-01 10:00:00',
    fieldIds: [
      'supplier_code',
      'org_id',
      'platform',
      'platform_name',
      'platform_province',
      'platform_city',
      'platform_county',
      'media_name',
      'media_id',
      'media_is_verified',
      'news_uuid',
      'news_title',
      'news_url',
      'news_posttime',
      'news_digest',
      'news_content',
      'news_keywords',
      'news_read_count',
      'news_like_count',
      'news_comment_count',
      'news_emotion',
      'news_content_ip_location',
    ],
  },
  {
    id: 'tpl_qb_common',
    name: '清博智能通用模板',
    desc: '通用轻量集：标识字段 + 平台基础 + 文章标题链接',
    type: 'system',
    updatedAt: '2026-09-01 10:00:00',
    fieldIds: [
      'supplier_code',
      'org_id',
      'platform',
      'platform_name',
      'news_uuid',
      'news_title',
      'news_url',
      'news_posttime',
      'media_name',
    ],
  },
]

/** @deprecated 请用 mtMock.getFieldTemplates() / listFieldTemplates */
export const fieldTemplates = builtinFieldTemplates

export type FieldTemplateId = string

export function sameFieldIdSet(a: string[], b: string[]) {
  if (a.length !== b.length) return false
  const set = new Set(a)
  return b.every((id) => set.has(id))
}

export const dataTypeOptions = [
  { label: 'String', value: 'String' },
  { label: 'Int', value: 'Int' },
]

export const dataSourceTypeLabels: Record<DataSourceType, string> = {
  table: '库表数据集',
  api: '接口',
  unstructured: '非结构化',
  queue: '实时队列',
}

export const dataSourceTypeOptions = [
  { label: '库表数据集', value: 'table' },
  { label: '接口', value: 'api' },
  { label: '非结构化', value: 'unstructured' },
  { label: '实时队列', value: 'queue' },
]

export const jdbcDbTypeLabels: Record<string, string> = {
  mysql: 'MySQL',
  postgresql: 'PostgreSQL',
  oracle: 'Oracle',
  dm: '达梦 DM',
  sqlserver: 'SQL Server',
}

export const jdbcDbTypeOptions = [
  { label: 'MySQL', value: 'mysql' },
  { label: 'PostgreSQL', value: 'postgresql' },
  { label: 'Oracle', value: 'oracle' },
  { label: '达梦 DM', value: 'dm' },
  { label: 'SQL Server', value: 'sqlserver' },
]

export const jdbcDefaultPorts: Record<string, string> = {
  mysql: '3306',
  postgresql: '5432',
  oracle: '1521',
  dm: '5236',
  sqlserver: '1433',
}

export function buildJdbcUrlPreview(s: Partial<Scheme>) {
  const type = s.jdbcDbType || 'mysql'
  const host = s.jdbcHost || 'host'
  const port = s.jdbcPort || jdbcDefaultPorts[type] || '3306'
  const db = s.jdbcDatabase || 'database'
  const schema = s.jdbcSchema || ''
  if (type === 'postgresql') {
    return schema
      ? `jdbc:postgresql://${host}:${port}/${db}?currentSchema=${schema}`
      : `jdbc:postgresql://${host}:${port}/${db}`
  }
  if (type === 'oracle') return `jdbc:oracle:thin:@${host}:${port}:${db}`
  if (type === 'dm') return `jdbc:dm://${host}:${port}/${db}`
  if (type === 'sqlserver') return `jdbc:sqlserver://${host}:${port};databaseName=${db}`
  return `jdbc:mysql://${host}:${port}/${db}?useSSL=false&serverTimezone=Asia/Shanghai`
}

function fieldSeed(
  name: string,
  dataType: string,
  description: string,
  bizCategory: BizCategory,
  required: boolean | null = null,
  length = '',
): Metadata {
  return {
    id: name,
    name,
    code: name,
    description,
    bizCaliber: description,
    dataType,
    required,
    length,
    defaultValue: '',
    bizCategory,
    remark: '',
    status: 'enabled',
    updatedAt: '2026-09-08 10:00:00',
  }
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

function genAppkey(code: string) {
  return `ak_${code}_${Math.random().toString(36).slice(2, 10)}`
}

const seed = {
  suppliers: [
    { id: 's1', name: '清博智能', code: 'QB001', status: 'enabled' as Status, appkey: 'ak_QB001_demo01', updatedAt: '2026-09-01 14:20:00' },
    { id: 's2', name: '智慧星光', code: 'ZX001', status: 'enabled' as Status, appkey: 'ak_ZX001_demo02', updatedAt: '2026-08-28 09:10:00' },
    { id: 's3', name: '数美科技', code: 'SM001', status: 'disabled' as Status, appkey: 'ak_SM001_demo03', updatedAt: '2026-09-02 18:06:00' },
    { id: 's4', name: '百度舆情', code: 'BD001', status: 'enabled' as Status, appkey: 'ak_BD001_demo04', updatedAt: '2026-08-15 11:00:00' },
  ] as Supplier[],
  orgs: [
    { id: 'o1', name: '某市网信办', code: 'ORG_WXB_001', status: 'enabled' as Status, supplierIds: ['s1', 's2', 's3'], standardIds: ['st1'], standardId: 'st1' },
    { id: 'o2', name: '某省宣传部', code: 'ORG_XCB_002', status: 'enabled' as Status, supplierIds: ['s1'], standardIds: ['st1'], standardId: 'st1' },
    { id: 'o3', name: '某区融媒体中心', code: 'ORG_RMT_003', status: 'disabled' as Status, supplierIds: [], standardIds: [], standardId: '' },
  ] as Org[],
  metadata: [
    fieldSeed('supplier_code', 'String', '供数方编码，对应供数方管理中的编码；库表路径据此识别来源厂商', '运维管理', true, '32'),
    fieldSeed('org_id', 'String', '归属机构编码；对应「机构供数配置」中的机构编码，一条只归属一个机构', '运维管理', true, '64'),
    fieldSeed('platform', 'String', '平台类型', '平台', true),
    fieldSeed('platform_name', 'String', '平台名称', '平台', true),
    fieldSeed('platform_domain_pri', 'String', '一级域名', '平台'),
    fieldSeed('platform_domain_sec', 'String', '二级域名', '平台'),
    fieldSeed('platform_province', 'String', '平台所属省份', '平台'),
    fieldSeed('platform_county', 'String', '平台所属县区', '平台'),
    fieldSeed('platform_city', 'String', '平台所属城市', '平台'),
    fieldSeed('media_name', 'String', '发布者昵称', '作者', false),
    fieldSeed('media_id', 'String', '发布者id', '作者'),
    fieldSeed('media_followers_count', 'Int', '发布者粉丝数', '作者'),
    fieldSeed('media_friends_count', 'Int', '发布者关注数', '作者'),
    fieldSeed('media_statues_count', 'Int', '发布者作品数', '作者'),
    fieldSeed('media_is_verified', 'String', '是否认证', '作者'),
    fieldSeed('media_verifiedtype', 'String', '认证类型', '作者'),
    fieldSeed('news_uuid', 'String', '文章唯一的标识', '文章', true, '64'),
    fieldSeed('news_url', 'String', '信息链接', '文章'),
    fieldSeed('news_title', 'String', '信息标题', '文章', false, '512'),
    fieldSeed('news_posttime', 'String', '信息发布时间', '文章'),
    fieldSeed('news_digest', 'String', '信息摘要', '文章'),
    fieldSeed('news_content', 'String', '信息正文', '文章'),
    fieldSeed('news_keywords', 'String', '文章关键词', '文章'),
    fieldSeed('news_author', 'String', '作者(唯一)', '文章'),
    fieldSeed('news_origin', 'String', '来源', '文章'),
    fieldSeed('news_origin_url', 'String', '来源url', '文章'),
    fieldSeed('news_is_origin', 'String', '是否原创', '标注', false),
    fieldSeed('news_read_count', 'Int', '信息阅读数', '标注'),
    fieldSeed('news_like_count', 'Int', '信息点赞数', '标注'),
    fieldSeed('news_comment_count', 'Int', '信息评论数', '标注'),
    fieldSeed('news_reposts_count', 'Int', '信息转发数', '标注'),
    fieldSeed('news_fetch_time', 'String', '文章抓取时间', '标注'),
    fieldSeed('news_headimg_url', 'String', '信息头图', '标注'),
    fieldSeed('news_emotion', 'String', '文章情感属性：中性、负面、正面', '标注'),
    fieldSeed('news_postdate', 'String', '文章发布日期', '文章'),
    fieldSeed('news_origin_content', 'String', '原文内容', '文章'),
    fieldSeed('news_origin_title', 'String', '原文标题', '文章'),
    fieldSeed('news_content_ip_location', 'String', '文章ip属地', '文章'),
    fieldSeed('solr_create_time', 'String', '入库时间', '文章'),
    fieldSeed('news_ocr', 'String', 'ocr识别内容', '文章'),
  ] as Metadata[],
  schemes: [
    {
      id: 'p1',
      name: '舆情库表增量接入',
      dataSourceType: 'table' as DataSourceType,
      jdbcDbType: 'mysql',
      jdbcHost: '10.0.1.12',
      jdbcPort: '3306',
      jdbcDatabase: 'yunshu_ods',
      jdbcSchema: '',
      jdbcUsername: 'yunshu_rw',
      jdbcPassword: 'Demo@123456',
      frequency: 'hourly',
      updateMode: 'incremental',
      incrementField: 'content_time',
      retry: 3,
      requireIpWhitelist: true,
      remark: 'MySQL JDBC 增量抽取，开启 IP 白名单',
      status: 'enabled' as Status,
      updatedAt: '2026-09-01 14:20:00',
    },
    {
      id: 'p2',
      name: '日终全量库表接入',
      dataSourceType: 'table' as DataSourceType,
      jdbcDbType: 'postgresql',
      jdbcHost: 'db.example.local',
      jdbcPort: '5432',
      jdbcDatabase: 'yunshu_dw',
      jdbcSchema: 'public',
      jdbcUsername: 'etl_reader',
      jdbcPassword: 'Demo@123456',
      frequency: 'daily',
      updateMode: 'full',
      incrementField: '',
      retry: 1,
      requireIpWhitelist: false,
      remark: 'PostgreSQL 日终全量抽取',
      status: 'enabled' as Status,
      updatedAt: '2026-08-28 09:10:00',
    },
  ] as Scheme[],
  standards: [
    {
      id: 'st1',
      name: '云数中台全局接入方案',
      scope: 'global' as StandardScope,
      fieldIds: ['supplier_code', 'org_id', 'platform', 'platform_name', 'news_uuid', 'news_title', 'media_name', 'news_is_origin'],
      metadataId: 'supplier_code',
      requireIpWhitelist: true,
      remark: '全局默认接口推送方案',
      apiAccess: defaultApiAccess(),
      apiDocMarkdown: '',
      fileName: '云数中台全局接入方案-接口文档.pdf',
      fileSize: '12 KB',
      fileUrl: '#',
      status: 'enabled' as Status,
      uploader: '平台运营',
      uploadedAt: '2026-09-03 11:00:00',
    },
    {
      id: 'st2',
      name: '某市网信办机构接入方案',
      scope: 'org' as StandardScope,
      orgId: 'o1',
      fieldIds: ['supplier_code', 'org_id', 'platform', 'news_uuid', 'news_title'],
      metadataId: 'supplier_code',
      requireIpWhitelist: false,
      remark: '',
      apiAccess: {
        ...defaultApiAccess(),
        path: '/api/v1/org/o1/articles/push',
        rateLimitQps: 20,
      },
      apiDocMarkdown: '',
      fileName: '某市网信办机构接入方案-接口文档.pdf',
      fileSize: '10 KB',
      fileUrl: '#',
      status: 'disabled' as Status,
      uploader: '平台运营',
      uploadedAt: '2026-08-15 10:00:00',
    },
  ] as Standard[],
  ipWhitelist: [
    {
      id: 'ip1',
      ip: '10.0.1.12',
      supplierId: 's2',
      remark: '前置机出口',
      createdAt: '2026-09-01 10:00:00',
    },
    {
      id: 'ip2',
      ip: '203.0.113.8',
      supplierId: 's2',
      remark: '联调出口',
      createdAt: '2026-09-02 09:00:00',
    },
    {
      id: 'ip3',
      ip: '10.0.2.20',
      supplierId: 's1',
      remark: '库表推送节点',
      createdAt: '2026-09-03 11:00:00',
    },
  ] as IpWhitelistItem[],
  fieldTemplates: JSON.parse(JSON.stringify(builtinFieldTemplates)) as FieldTemplate[],
}

interface State {
  suppliers: Supplier[]
  orgs: Org[]
  metadata: Metadata[]
  schemes: Scheme[]
  standards: Standard[]
  ipWhitelist: IpWhitelistItem[]
  fieldTemplates: FieldTemplate[]
}

function clone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data))
}

function loadState(): State {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as State
      parsed.suppliers = (parsed.suppliers || []).map((s) => ({
        ...s,
        appkey: s.appkey || genAppkey(s.code || 'x'),
      }))
      parsed.orgs = (parsed.orgs || []).map((o, idx) => {
        const standardIds =
          Array.isArray(o.standardIds) && o.standardIds.length
            ? o.standardIds
            : o.standardId
              ? [o.standardId]
              : []
        return {
          ...o,
          code: o.code || `ORG_${String(o.id || idx).toUpperCase()}`,
          status: (o.status === 'disabled' ? 'disabled' : 'enabled') as Status,
          standardIds,
          standardId: standardIds[0] || '',
        }
      })
      parsed.schemes = (parsed.schemes || []).map((s) => {
        const jdbcDbType = s.jdbcDbType || 'mysql'
        const jdbcHost = s.jdbcHost || s.frontHost || ''
        const jdbcPort = s.jdbcPort || s.frontPort || jdbcDefaultPorts[jdbcDbType] || '3306'
        return {
          ...s,
          dataSourceType: (s.dataSourceType || 'table') as DataSourceType,
          jdbcDbType,
          jdbcHost,
          jdbcPort,
          jdbcDatabase: s.jdbcDatabase || s.path || '',
          jdbcSchema: s.jdbcSchema || '',
          jdbcUsername: s.jdbcUsername || '',
          jdbcPassword: s.jdbcPassword || '',
          requireIpWhitelist: !!s.requireIpWhitelist,
        }
      })
      parsed.standards = (parsed.standards || []).map((st) => {
        const fieldIds = st.fieldIds?.length ? st.fieldIds : st.metadataId ? [st.metadataId] : []
        const apiAccess = { ...defaultApiAccess(), ...(st.apiAccess || {}) }
        return {
          ...st,
          name: stripParenInName(st.name),
          scope: st.scope || 'global',
          fieldIds,
          metadataId: st.metadataId || fieldIds[0] || '',
          requireIpWhitelist: !!st.requireIpWhitelist,
          remark: st.remark || '',
          apiAccess,
          apiDocMarkdown: st.apiDocMarkdown || '',
          fileName: st.fileName?.replace(/\.md$/i, '.pdf') || `${stripParenInName(st.name)}-接口文档.pdf`,
        }
      })
      parsed.ipWhitelist = parsed.ipWhitelist || []
      const savedTpls = Array.isArray(parsed.fieldTemplates) ? parsed.fieldTemplates : []
      const customTpls = savedTpls.filter((t) => t.type === 'custom')
      const systemFromSaved = savedTpls.filter((t) => t.type === 'system')
      parsed.fieldTemplates = [
        ...builtinFieldTemplates.map((b) => {
          const hit = systemFromSaved.find((s) => s.id === b.id)
          return hit ? { ...b, ...hit, type: 'system' as const, fieldIds: b.fieldIds } : { ...b }
        }),
        ...customTpls.map((t) => ({
          ...t,
          type: 'custom' as const,
          fieldIds: Array.isArray(t.fieldIds) ? t.fieldIds : [],
          desc: t.desc || '',
          updatedAt: t.updatedAt || '2026-09-08 10:00:00',
        })),
      ]
      return parsed
    }
  } catch {
    /* ignore */
  }
  return clone(seed)
}

let state = loadState()

function nowText() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

function save() {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  syncEnabledBridge()
}

function findMeta(id: string) {
  return state.metadata.find((m) => m.id === id) || null
}
function findScheme(id: string) {
  return state.schemes.find((s) => s.id === id) || null
}

function supplierNameMap() {
  const map: Record<string, string> = {}
  state.suppliers.forEach((s) => {
    map[s.id] = s.name
  })
  return map
}

function orgName(id?: string) {
  if (!id) return ''
  return state.orgs.find((o) => o.id === id)?.name || ''
}

function hydrateScheme(scheme: Scheme | null) {
  if (!scheme) return null
  const type = (scheme.dataSourceType || 'table') as DataSourceType
  const jdbcDbType = scheme.jdbcDbType || 'mysql'
  const enriched = {
    ...scheme,
    dataSourceType: type,
    dataSourceTypeLabel: dataSourceTypeLabels[type] || type,
    jdbcDbType,
    jdbcDbTypeLabel: jdbcDbTypeLabels[jdbcDbType] || jdbcDbType,
    jdbcHost: scheme.jdbcHost || '',
    jdbcPort: scheme.jdbcPort || '',
    jdbcDatabase: scheme.jdbcDatabase || '',
    jdbcSchema: scheme.jdbcSchema || '',
    jdbcUsername: scheme.jdbcUsername || '',
    jdbcPassword: scheme.jdbcPassword || '',
    jdbcUrlPreview: buildJdbcUrlPreview(scheme),
    frequencyLabel: frequencyLabels[scheme.frequency] || scheme.frequency,
    updateModeLabel: updateModeLabels[scheme.updateMode] || scheme.updateMode,
    requireIpWhitelist: !!scheme.requireIpWhitelist,
    // 桥接兼容：供 V8 旧字段读取
    frontHost: scheme.jdbcHost || scheme.frontHost || '',
    frontPort: scheme.jdbcPort || scheme.frontPort || '',
    protocol: jdbcDbTypeLabels[jdbcDbType] || jdbcDbType,
    path: scheme.jdbcDatabase || scheme.path || '',
  }
  return enriched
}

function hydrateStandard(item: Standard | null): Standard | null {
  if (!item) return null
  const fieldIds = item.fieldIds?.length ? item.fieldIds : item.metadataId ? [item.metadataId] : []
  const fields = fieldIds.map((id) => findMeta(id)).filter(Boolean).map((f) => ({
    ...f!,
    bizCaliber: f!.description || f!.bizCaliber,
  })) as Metadata[]
  const apiAccess = { ...defaultApiAccess(), ...(item.apiAccess || {}) }
  const scheme = item.schemeId ? hydrateScheme(findScheme(item.schemeId)) : null
  const primary = fields[0] || null
  const apiDocMarkdown = buildApiDocMarkdown({
    name: stripParenInName(item.name),
    scope: item.scope || 'global',
    orgName: item.scope === 'org' ? orgName(item.orgId) : '',
    requireIpWhitelist: !!item.requireIpWhitelist,
    remark: item.remark || '',
    fields,
    api: apiAccess,
  })
  return {
    ...item,
    name: stripParenInName(item.name),
    fieldIds,
    metadataId: item.metadataId || fieldIds[0] || '',
    metadataName: fields.map((f) => f.name).join('、') || '—',
    fieldNames: fields.map((f) => f.name).join('、') || '—',
    fieldSummary: fields.map((f) => f.name).join('、') || '—',
    schemeName: '接口推送',
    orgName: item.scope === 'org' ? orgName(item.orgId) : '',
    type: 'API',
    publishedAt: item.uploadedAt,
    requireIpWhitelist: !!item.requireIpWhitelist,
    remark: item.remark || '',
    apiAccess,
    apiDocMarkdown,
    fileName: `${stripParenInName(item.name)}-接口文档.pdf`,
    fields,
    metadata: primary,
    scheme,
  }
}

function resolveOrgStandardIds(org?: Org | null): string[] {
  if (!org) return []
  if (Array.isArray(org.standardIds) && org.standardIds.length) return org.standardIds
  return org.standardId ? [org.standardId] : []
}

function resolveEffectiveList(orgId: string): Standard[] {
  const org = state.orgs.find((o) => o.id === orgId)
  const boundIds = resolveOrgStandardIds(org)
  const bound = boundIds
    .map((id) => state.standards.find((s) => s.id === id && s.status === 'enabled'))
    .filter(Boolean)
    .map((s) => hydrateStandard(s!)!)
  if (bound.length) return bound
  const orgEnabled = state.standards.filter((s) => s.status === 'enabled' && s.scope === 'org' && s.orgId === orgId)
  if (orgEnabled.length) return orgEnabled.map((s) => hydrateStandard(s)!)
  const globalEnabled = state.standards.filter((s) => s.status === 'enabled' && s.scope === 'global')
  return globalEnabled.map((s) => hydrateStandard(s)!)
}

function resolveEffective(orgId: string): Standard | null {
  return resolveEffectiveList(orgId)[0] || null
}

/** 机构生效标准列表（可多个） */
export function getEffectiveStandards(orgId: string) {
  return resolveEffectiveList(orgId)
}

/** 机构生效标准：有启用机构标准用机构，否则用启用全局 */
export function getEffectiveStandard(orgId: string) {
  return resolveEffective(orgId)
}

function syncEnabledBridge() {
  const list = resolveEffectiveList(DEMO_ORG_ID)
  localStorage.setItem(BRIDGE_LIST_KEY, JSON.stringify(list))
  localStorage.setItem(BRIDGE_KEY, JSON.stringify(list[0] || null))
}

function ensureSingleEnabled(exceptId: string, nextStatus: Status, scope: StandardScope, orgId?: string) {
  if (nextStatus !== 'enabled') return
  state.standards.forEach((s) => {
    if (s.id === exceptId) return
    if (scope === 'global' && s.scope === 'global') s.status = 'disabled'
    if (scope === 'org' && s.scope === 'org' && s.orgId === orgId) s.status = 'disabled'
  })
}

export function paginate<T>(list: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize
  return { list: list.slice(start, start + pageSize), total: list.length }
}

export const mtMock = {
  nowText,
  paginate,
  DEMO_ORG_ID,
  getSuppliers: () => state.suppliers.slice(),
  enabledSuppliers: () => state.suppliers.filter((s) => s.status === 'enabled'),
  nameExists: (name: string, exceptId?: string) =>
    state.suppliers.some((s) => s.name === name.trim() && s.id !== exceptId),
  codeExists: (code: string, exceptId?: string) =>
    state.suppliers.some((s) => s.code === code.trim() && s.id !== exceptId),
  isReferenced: (id: string) => state.orgs.some((org) => org.supplierIds.includes(id)),
  createSupplier(payload: { name: string; code: string; status: Status }) {
    const item: Supplier = {
      id: 's' + Date.now(),
      name: payload.name.trim(),
      code: payload.code.trim(),
      status: payload.status,
      appkey: genAppkey(payload.code.trim()),
      updatedAt: nowText(),
    }
    state.suppliers.unshift(item)
    save()
    return item
  },
  updateSupplier(id: string, payload: { name: string; code: string; status: Status }) {
    const item = state.suppliers.find((s) => s.id === id)
    if (!item) return null
    Object.assign(item, {
      name: payload.name.trim(),
      code: payload.code.trim(),
      status: payload.status,
      updatedAt: nowText(),
    })
    save()
    return item
  },
  setSupplierStatus(id: string, status: Status) {
    const item = state.suppliers.find((s) => s.id === id)
    if (!item) return null
    item.status = status
    item.updatedAt = nowText()
    save()
    return item
  },
  rotateAppkey(id: string) {
    const item = state.suppliers.find((s) => s.id === id)
    if (!item) return null
    item.appkey = genAppkey(item.code)
    item.updatedAt = nowText()
    save()
    return item
  },
  removeSupplier(id: string) {
    if (mtMock.isReferenced(id)) return { ok: false, reason: 'referenced' }
    const before = state.suppliers.length
    state.suppliers = state.suppliers.filter((s) => s.id !== id)
    save()
    return { ok: state.suppliers.length < before }
  },
  getOrgs() {
    const names = supplierNameMap()
    return state.orgs.map((org) => {
      const standardIds = resolveOrgStandardIds(org)
      const standards = standardIds
        .map((id) => state.standards.find((s) => s.id === id))
        .filter(Boolean)
      return {
        ...org,
        standardIds,
        standardId: standardIds[0] || '',
        supplierNames: org.supplierIds.map((id) => names[id]).filter(Boolean),
        standardName: standards.map((s) => s!.name).join('、') || '',
        standardNames: standards.map((s) => s!.name),
      }
    })
  },
  orgOptions: () => state.orgs.map((o) => ({ label: `${o.name}（${o.code}）`, value: o.id })),
  orgNameExists: (name: string, exceptId?: string) =>
    state.orgs.some((o) => o.name === name.trim() && o.id !== exceptId),
  orgCodeExists: (code: string, exceptId?: string) =>
    state.orgs.some((o) => (o.code || '').trim() === code.trim() && o.id !== exceptId),
  saveOrgConfig(
    orgId: string,
    payload: {
      supplierIds: string[]
      standardId?: string
      standardIds?: string[]
      code?: string
      name?: string
    },
  ) {
    const org = state.orgs.find((o) => o.id === orgId)
    if (!org) return null
    if (payload.code !== undefined) {
      const code = payload.code.trim()
      if (!code) return { ok: false as const, reason: 'code' as const }
      if (this.orgCodeExists(code, orgId)) return { ok: false as const, reason: 'dupCode' as const }
      org.code = code
    }
    org.supplierIds = (payload.supplierIds || []).slice()
    const standardIds =
      payload.standardIds?.length
        ? payload.standardIds.slice()
        : payload.standardId
          ? [payload.standardId]
          : []
    org.standardIds = standardIds
    org.standardId = standardIds[0] || ''
    save()
    return { ok: true as const, item: org }
  },
  /** @deprecated 兼容旧调用 */
  saveOrgSuppliers(orgId: string, supplierIds: string[]) {
    return this.saveOrgConfig(orgId, { supplierIds })
  },
  createOrg(payload: {
    name: string
    code: string
    supplierIds: string[]
    standardId?: string
    standardIds?: string[]
    status?: Status
  }) {
    const name = payload.name.trim()
    const code = payload.code.trim()
    if (!name) return { ok: false as const, reason: 'name' }
    if (!code) return { ok: false as const, reason: 'code' }
    if (this.orgNameExists(name)) return { ok: false as const, reason: 'dup' }
    if (this.orgCodeExists(code)) return { ok: false as const, reason: 'dupCode' }
    const standardIds =
      payload.standardIds?.length
        ? payload.standardIds.slice()
        : payload.standardId
          ? [payload.standardId]
          : []
    const item: Org = {
      id: 'o' + Date.now(),
      name,
      code,
      status: payload.status || 'enabled',
      supplierIds: (payload.supplierIds || []).slice(),
      standardIds,
      standardId: standardIds[0] || '',
    }
    state.orgs.unshift(item)
    save()
    return { ok: true as const, item }
  },
  setOrgStatus(id: string, status: Status) {
    const item = state.orgs.find((o) => o.id === id)
    if (!item) return null
    item.status = status
    save()
    return item
  },
  enabledStandardOptions() {
    return state.standards
      .filter((s) => s.status === 'enabled')
      .map((s) => ({
        label: `${s.name}${s.scope === 'org' ? '（机构）' : '（全局）'}`,
        value: s.id,
      }))
  },
  getMetadata: () => state.metadata.slice(),
  /** 引用指定字段的接入方案列表 */
  listStandardsByFieldId(fieldId: string) {
    return state.standards
      .filter((s) => (s.fieldIds || []).includes(fieldId) || s.metadataId === fieldId)
      .map((s) => hydrateStandard(s)!)
      .filter(Boolean)
  },
  /** 字段被接入方案引用次数 */
  countStandardsByFieldId(fieldId: string) {
    return state.standards.filter(
      (s) => (s.fieldIds || []).includes(fieldId) || s.metadataId === fieldId,
    ).length
  },
  /** 带引用计数的字段列表 */
  getMetadataWithRefCount() {
    return state.metadata.map((m) => ({
      ...m,
      refSchemeCount: this.countStandardsByFieldId(m.id),
    }))
  },
  enabledMetadata: () => state.metadata.filter((m) => m.status === 'enabled'),
  findMetadata: (id: string) => findMeta(id),
  metadataNameExists: (name: string, exceptId?: string) =>
    state.metadata.some((m) => m.name === name.trim() && m.id !== exceptId),
  metadataCodeExists: (code: string, exceptId?: string) =>
    state.metadata.some((m) => m.code === code.trim() && m.id !== exceptId),
  saveMetadata(payload: Partial<Metadata> & { name: string; description: string; dataType: string }) {
    const now = nowText()
    const name = payload.name.trim()
    const description = payload.description.trim()
    const normalized: Partial<Metadata> = {
      ...payload,
      name,
      code: name,
      description,
      bizCaliber: description,
      dataType: payload.dataType.trim(),
      length: payload.length?.trim() || '',
      defaultValue: payload.defaultValue?.trim() || '',
      bizCategory: payload.bizCategory || '',
      remark: payload.remark?.trim() || '',
      required: payload.required ?? null,
    }
    if (payload.id) {
      const item = findMeta(payload.id)
      if (!item) return null
      Object.assign(item, normalized, { updatedAt: now })
      save()
      syncEnabledBridge()
      return item
    }
    const item = {
      ...normalized,
      id: name || 'm' + Date.now(),
      status: (payload.status || 'enabled') as Status,
      updatedAt: now,
    } as Metadata
    state.metadata.unshift(item)
    save()
    syncEnabledBridge()
    return item
  },
  setMetadataStatus(id: string, status: Status) {
    const item = findMeta(id)
    if (!item) return null
    item.status = status
    item.updatedAt = nowText()
    save()
    return item
  },
  removeMetadata(id: string) {
    if (state.standards.some((s) => (s.fieldIds || []).includes(id) || s.metadataId === id)) {
      return { ok: false, reason: 'referenced' }
    }
    const before = state.metadata.length
    state.metadata = state.metadata.filter((m) => m.id !== id)
    save()
    return { ok: state.metadata.length < before }
  },
  getFieldTemplates() {
    if (!state.fieldTemplates?.length) {
      state.fieldTemplates = JSON.parse(JSON.stringify(builtinFieldTemplates)) as FieldTemplate[]
    }
    return state.fieldTemplates.map((t) => ({
      ...t,
      fieldIds: [...(t.fieldIds || [])],
      fieldCount: (t.fieldIds || []).length,
      typeLabel: t.type === 'system' ? '系统内置' : '用户自定义',
      fieldNames: (t.fieldIds || [])
        .map((id) => findMeta(id)?.name || id)
        .join('、'),
    }))
  },
  findFieldTemplate(id: string) {
    return state.fieldTemplates.find((t) => t.id === id) || null
  },
  fieldTemplateNameExists(name: string, exceptId?: string) {
    return state.fieldTemplates.some((t) => t.name.trim() === name.trim() && t.id !== exceptId)
  },
  /** 是否已存在相同字段集合的模板 */
  fieldTemplateSetExists(fieldIds: string[], exceptId?: string) {
    const ids = [...new Set(fieldIds.filter(Boolean))]
    return state.fieldTemplates.some(
      (t) => t.id !== exceptId && sameFieldIdSet(t.fieldIds || [], ids),
    )
  },
  saveFieldTemplate(payload: {
    id?: string
    name: string
    desc?: string
    fieldIds: string[]
    type?: FieldTemplateType
  }) {
    const name = payload.name.trim()
    const desc = String(payload.desc || '').trim()
    const fieldIds = [...new Set((payload.fieldIds || []).filter(Boolean))]
    if (!name) return { ok: false as const, reason: 'name' }
    if (!fieldIds.length) return { ok: false as const, reason: 'fields' }
    if (this.fieldTemplateNameExists(name, payload.id)) return { ok: false as const, reason: 'dupName' }
    if (this.fieldTemplateSetExists(fieldIds, payload.id)) return { ok: false as const, reason: 'dupSet' }
    const now = nowText()
    if (payload.id) {
      const item = state.fieldTemplates.find((t) => t.id === payload.id)
      if (!item) return { ok: false as const, reason: 'missing' }
      if (item.type === 'system') return { ok: false as const, reason: 'system' }
      item.name = name
      item.desc = desc
      item.fieldIds = fieldIds
      item.updatedAt = now
      save()
      return { ok: true as const, item: { ...item } }
    }
    const item: FieldTemplate = {
      id: `tpl_c_${Date.now()}`,
      name,
      desc,
      fieldIds,
      type: 'custom',
      updatedAt: now,
    }
    state.fieldTemplates.push(item)
    save()
    return { ok: true as const, item: { ...item } }
  },
  removeFieldTemplate(id: string) {
    const item = state.fieldTemplates.find((t) => t.id === id)
    if (!item) return { ok: false as const, reason: 'missing' }
    if (item.type === 'system') return { ok: false as const, reason: 'system' }
    state.fieldTemplates = state.fieldTemplates.filter((t) => t.id !== id)
    save()
    return { ok: true as const }
  },
  getSchemes() {
    return state.schemes.map((s) => hydrateScheme(s)!)
  },
  enabledSchemes() {
    return this.getSchemes().filter((s) => s.status === 'enabled')
  },
  findScheme(id: string) {
    return hydrateScheme(findScheme(id))
  },
  schemeNameExists: (name: string, exceptId?: string) =>
    state.schemes.some((s) => s.name === name.trim() && s.id !== exceptId),
  saveScheme(payload: Partial<Scheme> & { name: string }) {
    const now = nowText()
    const dataSourceType = (payload.dataSourceType || 'table') as DataSourceType
    const jdbcDbType = payload.jdbcDbType || 'mysql'
    const fields = {
      name: payload.name.trim(),
      dataSourceType,
      supplierId: '',
      jdbcDbType,
      jdbcHost: String(payload.jdbcHost || '').trim(),
      jdbcPort: String(payload.jdbcPort || jdbcDefaultPorts[jdbcDbType] || '').trim(),
      jdbcDatabase: String(payload.jdbcDatabase || '').trim(),
      jdbcSchema: String(payload.jdbcSchema || '').trim(),
      jdbcUsername: String(payload.jdbcUsername || '').trim(),
      jdbcPassword: String(payload.jdbcPassword || '').trim(),
      frequency: payload.frequency || 'daily',
      updateMode: payload.updateMode || 'incremental',
      incrementField: String(payload.incrementField || '').trim(),
      retry: Number(payload.retry) || 0,
      requireIpWhitelist: !!payload.requireIpWhitelist,
      remark: String(payload.remark || '').trim(),
      status: (payload.status || 'enabled') as Status,
      updatedAt: now,
    }
    if (payload.id) {
      const item = findScheme(payload.id)
      if (!item) return null
      Object.assign(item, fields)
      save()
      syncEnabledBridge()
      return item
    }
    const item = { id: 'p' + Date.now(), ...fields } as Scheme
    state.schemes.unshift(item)
    save()
    syncEnabledBridge()
    return item
  },
  setSchemeStatus(id: string, status: Status) {
    const item = findScheme(id)
    if (!item) return null
    item.status = status
    item.updatedAt = nowText()
    save()
    return item
  },
  removeScheme(id: string) {
    if (state.standards.some((s) => s.schemeId === id)) return { ok: false, reason: 'referenced' }
    const before = state.schemes.length
    state.schemes = state.schemes.filter((s) => s.id !== id)
    save()
    return { ok: state.schemes.length < before }
  },
  getStandards: () => state.standards.map((s) => hydrateStandard(s)!),
  findStandard: (id: string) => hydrateStandard(state.standards.find((s) => s.id === id) || null),
  getEffectiveStandard: (orgId = DEMO_ORG_ID) => resolveEffective(orgId),
  getEffectiveStandards: (orgId = DEMO_ORG_ID) => resolveEffectiveList(orgId),
  standardNameExists: (name: string, exceptId?: string) =>
    state.standards.some((s) => s.name === name.trim() && s.id !== exceptId),
  saveStandard(
    payload: Partial<Standard> & {
      name: string
      fieldIds?: string[]
      metadataId?: string
      scope?: StandardScope
      apiAccess?: ApiAccessConfig
      requireIpWhitelist?: boolean
      remark?: string
    },
  ) {
    const fieldIds = [
      ...new Set(
        (payload.fieldIds?.length ? payload.fieldIds : payload.metadataId ? [payload.metadataId] : []).filter(Boolean),
      ),
    ]
    if (!fieldIds.length) return { ok: false as const, reason: 'meta' }
    const enabledFields = fieldIds.map((id) => findMeta(id)).filter((m) => m && m.status === 'enabled')
    if (enabledFields.length !== fieldIds.length) return { ok: false as const, reason: 'meta' }
    const apiAccess = { ...defaultApiAccess(), ...(payload.apiAccess || {}) }
    if (!apiAccess.baseUrl?.trim() || !apiAccess.path?.trim()) {
      return { ok: false as const, reason: 'api' }
    }
    const scope: StandardScope = payload.scope || 'global'
    if (scope === 'org' && !payload.orgId) return { ok: false as const, reason: 'org' }
    const now = nowText()
    const name = stripParenInName(payload.name)
    const requireIpWhitelist = !!payload.requireIpWhitelist
    const remark = String(payload.remark || '').trim()
    const metaFields = fieldIds.map((id) => findMeta(id)!).filter(Boolean)
    const apiDocMarkdown = buildApiDocMarkdown({
      name,
      scope,
      orgName: scope === 'org' ? orgName(payload.orgId) : '',
      requireIpWhitelist,
      remark,
      fields: metaFields,
      api: apiAccess,
    })
    const fields = {
      name,
      scope,
      orgId: scope === 'org' ? payload.orgId : undefined,
      fieldIds,
      metadataId: fieldIds[0],
      schemeId: undefined as string | undefined,
      requireIpWhitelist,
      remark,
      apiAccess,
      apiDocMarkdown,
      fileName: `${name}-接口文档.pdf`,
      fileSize: `${Math.max(4, Math.round(apiDocMarkdown.length / 1024))} KB`,
      fileUrl: '#',
      status: (payload.status || 'enabled') as Status,
      uploader: '平台运营',
      uploadedAt: now,
    }
    if (payload.id) {
      const item = state.standards.find((s) => s.id === payload.id)
      if (!item) return { ok: false as const, reason: 'missing' }
      ensureSingleEnabled(item.id, fields.status, scope, fields.orgId)
      Object.assign(item, fields)
      save()
      return { ok: true as const, item: hydrateStandard(item)! }
    }
    const item = { id: 'st' + Date.now(), ...fields } as Standard
    ensureSingleEnabled(item.id, item.status, scope, item.orgId)
    state.standards.unshift(item)
    save()
    return { ok: true as const, item: hydrateStandard(item)! }
  },
  setStandardStatus(id: string, status: Status) {
    const item = state.standards.find((s) => s.id === id)
    if (!item) return { ok: false as const, reason: 'missing' }
    if (status === 'enabled') {
      const fieldIds = item.fieldIds?.length ? item.fieldIds : [item.metadataId]
      const okFields = fieldIds.every((fid) => {
        const m = findMeta(fid)
        return m && m.status === 'enabled'
      })
      if (!okFields) return { ok: false as const, reason: 'meta' }
      if (!item.apiAccess?.baseUrl || !item.apiAccess?.path) return { ok: false as const, reason: 'api' }
      ensureSingleEnabled(id, 'enabled', item.scope || 'global', item.orgId)
    }
    item.status = status
    save()
    return { ok: true as const, item: hydrateStandard(item)! }
  },
  removeStandard(id: string) {
    const before = state.standards.length
    state.standards = state.standards.filter((s) => s.id !== id)
    save()
    return { ok: state.standards.length < before }
  },
  getIpWhitelist() {
    return state.ipWhitelist.map((item) => ({
      ...item,
      supplierId: item.supplierId || '',
      supplierName: item.supplierId
        ? state.suppliers.find((s) => s.id === item.supplierId)?.name || item.supplierName || '—'
        : item.supplierName || '—',
    }))
  },
  addIpWhitelist(ip: string, remark = '', supplierId = '') {
    const value = ip.trim()
    if (!value) return { ok: false as const, reason: 'empty' as const }
    if (state.ipWhitelist.some((i) => i.ip === value)) return { ok: false as const, reason: 'dup' as const }
    const supplier = supplierId ? state.suppliers.find((s) => s.id === supplierId) : undefined
    const item: IpWhitelistItem = {
      id: 'ip' + Date.now() + Math.random().toString(36).slice(2, 6),
      ip: value,
      supplierId: supplierId || '',
      supplierName: supplier?.name,
      remark: remark.trim(),
      createdAt: nowText(),
    }
    state.ipWhitelist.unshift(item)
    save()
    return { ok: true as const, item }
  },
  /** 按厂商批量添加；返回成功数与失败明细 */
  addIpWhitelistBatch(payload: { supplierId: string; ips: string[]; remark?: string }) {
    const supplier = state.suppliers.find((s) => s.id === payload.supplierId)
    if (!supplier) return { ok: false as const, reason: 'supplier' as const }
    const remark = (payload.remark || '').trim()
    const added: IpWhitelistItem[] = []
    const skipped: { ip: string; reason: string }[] = []
    const ipv4 =
      /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/
    const seen = new Set<string>()
    payload.ips.forEach((raw) => {
      const ip = raw.trim()
      if (!ip) return
      if (!ipv4.test(ip)) {
        skipped.push({ ip, reason: '格式无效' })
        return
      }
      if (seen.has(ip) || state.ipWhitelist.some((i) => i.ip === ip)) {
        skipped.push({ ip, reason: '已存在' })
        return
      }
      seen.add(ip)
      const item: IpWhitelistItem = {
        id: 'ip' + Date.now() + Math.random().toString(36).slice(2, 8),
        ip,
        supplierId: supplier.id,
        supplierName: supplier.name,
        remark,
        createdAt: nowText(),
      }
      state.ipWhitelist.unshift(item)
      added.push(item)
    })
    if (added.length) save()
    return { ok: true as const, added, skipped, supplierName: supplier.name }
  },
  removeIpWhitelist(id: string) {
    const before = state.ipWhitelist.length
    state.ipWhitelist = state.ipWhitelist.filter((i) => i.id !== id)
    save()
    return { ok: state.ipWhitelist.length < before }
  },
}

syncEnabledBridge()

export function delay(ms = 220) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
