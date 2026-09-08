import { delay, v8Mock, type Overview, type PageResult, type Standard, type StatsRow, type Supplier, type TimeRange } from '@/mock/v8'
import { checkLogin } from '@/utils/auth'

export async function loginApi(account: string, password: string) {
  await delay(180)
  const result = checkLogin(account, password)
  if (!result.ok) {
    throw new Error(result.userNameError || result.passwordError || '用户名或密码不正确')
  }
  return {
    token: 'v8-demo-token',
    userInfo: {
      name: '李机构',
      account,
      department: v8Mock.orgName,
      role: '机构管理员',
    },
  }
}

export async function getOverview(): Promise<Overview> {
  await delay()
  return v8Mock.overview()
}

export async function getStats(params: {
  range: TimeRange
  supplierId: string
  page: number
  pageSize: number
}): Promise<PageResult<StatsRow> & { inboundTotal: number }> {
  await delay()
  let rows = v8Mock.statsRows(params.range)
  if (params.supplierId && params.supplierId !== 'all') {
    rows = rows.filter((row) => row.id === params.supplierId)
  }
  const inboundTotal = rows.reduce((sum, row) => sum + row.count, 0)
  const page = v8Mock.paginate(rows, params.page, params.pageSize)
  return { ...page, inboundTotal }
}

export async function getConfiguredSuppliers(params: {
  keyword: string
  page: number
  pageSize: number
}): Promise<PageResult<Supplier> & { enabledCount: number; disabledCount: number }> {
  await delay()
  let list = v8Mock.configuredSuppliers()
  const enabledCount = list.filter((s) => s.status === 'enabled').length
  const disabledCount = list.filter((s) => s.status !== 'enabled').length
  const kw = params.keyword.trim().toLowerCase()
  if (kw) list = list.filter((s) => s.name.toLowerCase().includes(kw))
  return { ...v8Mock.paginate(list, params.page, params.pageSize), enabledCount, disabledCount }
}

export async function getEnabledStandard(): Promise<Standard | null> {
  await delay()
  return v8Mock.getEnabledStandard()
}

export async function getEnabledStandards(): Promise<Standard[]> {
  await delay()
  return v8Mock.getEnabledStandards()
}

export function supplierOptions() {
  return v8Mock.configuredSuppliers().map((s) => ({ label: s.name, value: s.id }))
}
