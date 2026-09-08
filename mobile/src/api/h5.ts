import type {
  ApplyOrderRow,
  OrgItem,
  OrgListFilter,
  OrgListItem,
  OrgStatCard,
  OrgTrialRecord,
  MessageNotification,
  PlanOption,
  ProductItem,
  ProductDetail,
  TrialPlanRow
} from '@/types/h5'
import * as mock from '@/mock/h5'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export function searchOrgs(keyword: string) {
  if (USE_MOCK) return mock.searchOrgsMock(keyword)
  return Promise.resolve({ code: 501, data: [] as OrgItem[], message: '未对接' })
}

export function fetchOrgTrials(orgId: number) {
  if (USE_MOCK) return mock.fetchOrgTrialsMock(orgId)
  return Promise.resolve({
    code: 501,
    data: { active: [] as OrgTrialRecord[], expired: [] as OrgTrialRecord[] },
    message: '未对接'
  })
}

export function fetchProducts(orgId: number, keyword?: string) {
  if (USE_MOCK) return mock.fetchProductsMock(orgId, keyword)
  return Promise.resolve({ code: 501, data: [] as ProductItem[], message: '未对接' })
}

export function fetchPlansByProduct(productId: number, orgId: number, keyword?: string) {
  if (USE_MOCK) return mock.fetchPlansByProductMock(productId, orgId, keyword)
  return Promise.resolve({ code: 501, data: [] as PlanOption[], message: '未对接' })
}

export function fetchPlanOptionDetail(id: number) {
  if (USE_MOCK) return mock.fetchPlanOptionDetailMock(id)
  return Promise.resolve({ code: 501, data: null as PlanOption | null, message: '未对接' })
}

export function fetchProductDetail(id: number) {
  if (USE_MOCK) return mock.fetchProductDetailMock(id)
  return Promise.resolve({ code: 501, data: null, message: '未对接' })
}

export function submitTrialApply(payload: {
  orgId: number
  productId: number
  planId: number
  remark: string
  customAnswers?: Record<string, string>
  editId?: number
}) {
  if (USE_MOCK) return mock.submitTrialApplyMock(payload)
  return Promise.resolve({ code: 501, data: null, message: '未对接' })
}

export function fetchOrgStatCards(unit?: string) {
  if (USE_MOCK) return mock.fetchOrgStatCardsMock(unit)
  return Promise.resolve({
    code: 501,
    data: {
      totalOrgs: 0,
      trialingOrgs: 0,
      soonExpireOrgs: 0,
      expiredOrgs: 0,
      freezeOrgs: 0,
      applyingOrgs: 0
    } as OrgStatCard,
    message: '未对接'
  })
}

export function fetchStatUnits() {
  if (USE_MOCK) return mock.fetchStatUnitsMock()
  return Promise.resolve({ code: 501, data: [], message: '未对接' })
}

export function fetchOrgList(filter: OrgListFilter = 'all', keyword?: string, unit?: string) {
  if (USE_MOCK) return mock.fetchOrgListMock(filter, keyword, unit)
  return Promise.resolve({ code: 501, data: [] as OrgListItem[], message: '未对接' })
}

export function fetchTrialPlanDetail(id: number) {
  if (USE_MOCK) return mock.fetchTrialPlanDetailMock(id)
  return Promise.resolve({ code: 501, data: null as TrialPlanRow | null, message: '未对接' })
}

export function fetchTrialOrgDetail(id: number) {
  if (USE_MOCK) return mock.fetchTrialOrgDetailMock(id)
  return Promise.resolve({ code: 501, data: null, message: '未对接' })
}

export function extendTrial(id: number) {
  if (USE_MOCK) return mock.extendTrialMock(id)
  return Promise.resolve({ code: 501, data: null, message: '未对接' })
}

export function applyClose(id: number, remark: string) {
  if (USE_MOCK) return mock.applyCloseMock(id, remark)
  return Promise.resolve({ code: 501, data: null, message: '未对接' })
}

export function applyReset(id: number, remark: string) {
  if (USE_MOCK) return mock.applyResetMock(id, remark)
  return Promise.resolve({ code: 501, data: null, message: '未对接' })
}

export function fetchMyApplies() {
  if (USE_MOCK) return mock.fetchMyAppliesMock()
  return Promise.resolve({ code: 501, data: [] as ApplyOrderRow[], message: '未对接' })
}

export function fetchPendingAudit() {
  if (USE_MOCK) return mock.fetchPendingAuditMock()
  return Promise.resolve({ code: 501, data: [] as ApplyOrderRow[], message: '未对接' })
}

export function fetchAuditRecords() {
  if (USE_MOCK) return mock.fetchAuditRecordsMock()
  return Promise.resolve({ code: 501, data: [] as ApplyOrderRow[], message: '未对接' })
}

export function fetchApplyDetail(id: number) {
  if (USE_MOCK) return mock.fetchApplyDetailMock(id)
  return Promise.resolve({ code: 501, data: null as ApplyOrderRow | null, message: '未对接' })
}

export function revokeApply(id: number) {
  if (USE_MOCK) return mock.revokeApplyMock(id)
  return Promise.resolve({ code: 501, data: null, message: '未对接' })
}

export function deleteApply(id: number) {
  if (USE_MOCK) return mock.deleteApplyMock(id)
  return Promise.resolve({ code: 501, data: null, message: '未对接' })
}

export function auditApply(id: number, action: 'pass' | 'reject', remark?: string) {
  if (USE_MOCK) return mock.auditApplyMock(id, action, remark)
  return Promise.resolve({ code: 501, data: null, message: '未对接' })
}

export function fetchMessageNotifications() {
  if (USE_MOCK) return mock.fetchMessageNotificationsMock()
  return Promise.resolve({ code: 501, data: [] as MessageNotification[], message: '未对接' })
}
