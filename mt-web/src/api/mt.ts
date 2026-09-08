import {
  delay,
  mtMock,
  type Metadata,
  type Scheme,
  type Standard,
  type StandardScope,
  type Status,
  type Supplier,
} from '@/mock/mt'
import { checkLogin } from '@/utils/auth'

export async function loginApi(account: string, password: string) {
  await delay(180)
  const result = checkLogin(account, password)
  if (!result.ok) throw new Error(result.userNameError || result.passwordError || '用户名或密码不正确')
  return {
    token: 'mt-demo-token',
    userInfo: { name: '王运营', account, role: '平台运营' },
  }
}

export async function listSuppliers(params: { name: string; status: string; page: number; pageSize: number }) {
  await delay()
  let list = mtMock.getSuppliers()
  if (params.name) list = list.filter((s) => s.name.includes(params.name))
  if (params.status) list = list.filter((s) => s.status === params.status)
  return mtMock.paginate(list, params.page, params.pageSize)
}

export async function saveSupplier(payload: { id?: string; name: string; code: string; status: Status }) {
  await delay()
  if (mtMock.nameExists(payload.name, payload.id)) throw new Error('供数方名称已存在')
  if (mtMock.codeExists(payload.code, payload.id)) throw new Error('编码已存在')
  return payload.id ? mtMock.updateSupplier(payload.id, payload) : mtMock.createSupplier(payload)
}

export async function toggleSupplier(id: string, status: Status) {
  await delay()
  return mtMock.setSupplierStatus(id, status)
}

export async function rotateAppkey(id: string) {
  await delay()
  const item = mtMock.rotateAppkey(id)
  if (!item) throw new Error('供数方不存在')
  return item
}

/** 供数方页别名 */
export const rotateSupplierAppkey = rotateAppkey

export async function deleteSupplier(id: string) {
  await delay()
  return mtMock.removeSupplier(id)
}

export async function listOrgs(params: { name: string; page: number; pageSize: number }) {
  await delay()
  let list = mtMock.getOrgs()
  if (params.name) {
    const q = params.name.trim()
    list = list.filter((o) => o.name.includes(q) || (o.code || '').includes(q))
  }
  return {
    ...mtMock.paginate(list, params.page, params.pageSize),
    enabledSuppliers: mtMock.enabledSuppliers(),
    enabledStandards: mtMock.enabledStandardOptions(),
  }
}

export async function saveOrg(
  orgId: string,
  payload:
    | string[]
    | { supplierIds: string[]; standardId?: string; standardIds?: string[]; code?: string },
) {
  await delay()
  const body = Array.isArray(payload) ? { supplierIds: payload } : payload
  const res = mtMock.saveOrgConfig(orgId, body)
  if (!res) throw new Error('机构不存在')
  if ('ok' in res && res.ok === false) {
    if (res.reason === 'dupCode') throw new Error('机构编码已存在')
    if (res.reason === 'code') throw new Error('请填写机构编码')
    throw new Error('保存失败')
  }
  return 'item' in res ? res.item : res
}

export async function createOrg(payload: {
  name: string
  code: string
  supplierIds: string[]
  standardId?: string
  standardIds?: string[]
}) {
  await delay()
  if (!payload.name?.trim()) throw new Error('请填写机构名称')
  if (!payload.code?.trim()) throw new Error('请填写机构编码')
  const res = mtMock.createOrg(payload)
  if (!res.ok) {
    if (res.reason === 'dup') throw new Error('机构名称已存在')
    if (res.reason === 'dupCode') throw new Error('机构编码已存在')
    if (res.reason === 'code') throw new Error('请填写机构编码')
    throw new Error('创建失败')
  }
  return res.item
}

export async function toggleOrg(id: string, status: Status) {
  await delay()
  const item = mtMock.setOrgStatus(id, status)
  if (!item) throw new Error('机构不存在')
  return item
}

export async function listMetadata(params: {
  name: string
  status: string
  page: number
  pageSize: number
  bizCategory?: string
}) {
  await delay()
  let list = mtMock.getMetadataWithRefCount()
  if (params.name) {
    const q = params.name.trim()
    list = list.filter(
      (m) =>
        m.name.includes(q) ||
        m.description?.includes(q) ||
        m.code.includes(q),
    )
  }
  if (params.bizCategory) list = list.filter((m) => (m.bizCategory || '') === params.bizCategory)
  if (params.status) list = list.filter((m) => m.status === params.status)
  return mtMock.paginate(list, params.page, params.pageSize)
}

export async function listStandardsByField(fieldId: string) {
  await delay()
  return mtMock.listStandardsByFieldId(fieldId)
}

export async function getMetadata(id: string) {
  await delay()
  return mtMock.findMetadata(id)
}

export async function saveMetadata(payload: Metadata) {
  await delay()
  if (!payload.name?.trim()) throw new Error('请填写字段名')
  if (!payload.description?.trim()) throw new Error('请填写描述')
  if (!payload.dataType?.trim()) throw new Error('请填写数据类型')
  if (mtMock.metadataNameExists(payload.name, payload.id)) throw new Error('字段名已存在')
  return mtMock.saveMetadata(payload)
}

export async function toggleMetadata(id: string, status: Status) {
  await delay()
  return mtMock.setMetadataStatus(id, status)
}

export async function deleteMetadata(id: string) {
  await delay()
  return mtMock.removeMetadata(id)
}

export async function listFieldTemplates(params?: { name?: string; type?: string }) {
  await delay()
  let list = mtMock.getFieldTemplates()
  if (params?.name?.trim()) {
    const q = params.name.trim()
    list = list.filter((t) => t.name.includes(q) || (t.desc || '').includes(q))
  }
  if (params?.type === 'system' || params?.type === 'custom') {
    list = list.filter((t) => t.type === params.type)
  }
  return list
}

export async function saveFieldTemplate(payload: {
  id?: string
  name: string
  desc?: string
  fieldIds: string[]
}) {
  await delay()
  const res = mtMock.saveFieldTemplate(payload)
  if (!res.ok) {
    if (res.reason === 'name') throw new Error('请填写模板名称')
    if (res.reason === 'fields') throw new Error('请至少选择一个字段')
    if (res.reason === 'dupName') throw new Error('模板名称已存在')
    if (res.reason === 'dupSet') throw new Error('已存在相同字段组合的模板')
    if (res.reason === 'system') throw new Error('系统内置模板不可修改')
    throw new Error('保存失败')
  }
  return res.item
}

export async function deleteFieldTemplate(id: string) {
  await delay()
  const res = mtMock.removeFieldTemplate(id)
  if (!res.ok) {
    if (res.reason === 'system') throw new Error('系统内置模板不可删除')
    throw new Error('删除失败')
  }
  return true
}

export async function listSchemes(params: {
  name: string
  status: string
  dataSourceType?: string
  page: number
  pageSize: number
}) {
  await delay()
  let list = mtMock.getSchemes()
  if (params.name) list = list.filter((s) => s.name.includes(params.name))
  if (params.status) list = list.filter((s) => s.status === params.status)
  if (params.dataSourceType) list = list.filter((s) => (s.dataSourceType || 'table') === params.dataSourceType)
  return mtMock.paginate(list, params.page, params.pageSize)
}

export async function getScheme(id: string) {
  await delay()
  return mtMock.findScheme(id)
}

export async function saveScheme(payload: Scheme) {
  await delay()
  if (mtMock.schemeNameExists(payload.name, payload.id)) throw new Error('方案名称已存在')
  return mtMock.saveScheme(payload)
}

export async function toggleScheme(id: string, status: Status) {
  await delay()
  return mtMock.setSchemeStatus(id, status)
}

export async function deleteScheme(id: string) {
  await delay()
  return mtMock.removeScheme(id)
}

export async function listStandards(params: { name: string; status: string; page: number; pageSize: number }) {
  await delay()
  let list = mtMock.getStandards()
  if (params.name) list = list.filter((s) => s.name.includes(params.name))
  if (params.status) list = list.filter((s) => s.status === params.status)
  return {
    ...mtMock.paginate(list, params.page, params.pageSize),
    metadata: mtMock.enabledMetadata(),
    schemes: mtMock.enabledSchemes(),
    orgs: mtMock.orgOptions(),
  }
}

export async function getStandard(id: string) {
  await delay()
  return mtMock.findStandard(id)
}

export async function saveStandard(
  payload: Partial<Standard> & {
    name: string
    fieldIds?: string[]
    metadataId?: string
    scope?: StandardScope
    orgId?: string
    apiAccess?: import('@/mock/mt').ApiAccessConfig
    requireIpWhitelist?: boolean
    remark?: string
  },
) {
  await delay()
  if (mtMock.standardNameExists(payload.name, payload.id)) throw new Error('方案名称已存在')
  const res = mtMock.saveStandard(payload)
  if (!res.ok) {
    if (res.reason === 'meta') throw new Error('请勾选已启用的字段库字段')
    if (res.reason === 'api') throw new Error('请完善接口接入方式（Base URL / Path）')
    if (res.reason === 'org') throw new Error('机构范围请选择机构')
    throw new Error('保存失败')
  }
  return res.item
}

export async function toggleStandard(id: string, status: Status) {
  await delay()
  const res = mtMock.setStandardStatus(id, status)
  if (!res.ok) {
    if (res.reason === 'meta') throw new Error('绑定的字段库字段未启用')
    if (res.reason === 'api') throw new Error('接口接入方式未配置完整，无法启用')
    throw new Error('操作失败')
  }
  return res.item
}

export async function deleteStandard(id: string) {
  await delay()
  return mtMock.removeStandard(id)
}

export async function listIpWhitelist(params?: {
  ip?: string
  supplierId?: string
  page?: number
  pageSize?: number
}) {
  await delay()
  let list = mtMock.getIpWhitelist()
  if (params?.ip) list = list.filter((x) => x.ip.includes(params.ip!))
  if (params?.supplierId) list = list.filter((x) => x.supplierId === params.supplierId)
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10
  return mtMock.paginate(list, page, pageSize)
}

export async function addIpWhitelist(ip: string, remark?: string, supplierId?: string) {
  await delay()
  const res = mtMock.addIpWhitelist(ip, remark, supplierId)
  if (!res.ok) {
    if (res.reason === 'dup') throw new Error('该 IP 已在白名单中')
    throw new Error('请填写 IP')
  }
  return res.item
}

/** 按厂商批量添加 IP（换行 / 逗号分隔） */
export async function addIpWhitelistBatch(payload: {
  supplierId: string
  ipsText: string
  remark?: string
}) {
  await delay()
  if (!payload.supplierId) throw new Error('请选择供数方（厂商）')
  const ips = payload.ipsText
    .split(/[\n,，;；\s]+/)
    .map((s) => s.trim())
    .filter(Boolean)
  if (!ips.length) throw new Error('请至少填写一个 IP')
  const res = mtMock.addIpWhitelistBatch({
    supplierId: payload.supplierId,
    ips,
    remark: payload.remark,
  })
  if (!res.ok) throw new Error('请选择有效的供数方')
  return res
}

export async function removeIpWhitelist(id: string) {
  await delay()
  return mtMock.removeIpWhitelist(id)
}

/** 白名单页别名 */
export const listWhitelist = listIpWhitelist
export const addWhitelist = addIpWhitelistBatch
export const deleteWhitelist = removeIpWhitelist

export function supplierSelect() {
  return mtMock.getSuppliers().map((s) => ({ label: s.name, value: s.id }))
}

export type { Supplier }
