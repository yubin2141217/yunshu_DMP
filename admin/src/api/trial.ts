/**
 * 试用管理 API
 */

import request from '@/utils/http'
import type { TrialOrgQuery, TrialPlanQuery } from '@/types/trial'
import {
  getTrialOrgDetailMock,
  getTrialOrgListMock,
  getTrialPlanDetailMock,
  getTrialPlanListMock,
  getTrialUnitsMock,
  stopAllTrialPlansByOrgMock,
  stopTrialPlanMock
} from '@/mock/trial'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/** 获取统计单元选项 */
export function fetchTrialUnits(): Promise<any> {
  if (USE_MOCK) return getTrialUnitsMock()
  return request.get({ url: '/admin/trial/units' })
}

/** 分页查询方案维度试用列表 */
export function fetchTrialPlanList(params: TrialPlanQuery): Promise<any> {
  if (USE_MOCK) return getTrialPlanListMock(params)
  return request.get({ url: '/admin/trial/plans', params })
}

/** 获取方案试用详情 */
export function fetchTrialPlanDetail(id: number): Promise<any> {
  if (USE_MOCK) return getTrialPlanDetailMock(id)
  return request.get({ url: `/admin/trial/plan/${id}` })
}

/** 分页查询机构维度试用列表 */
export function fetchTrialOrgList(params: TrialOrgQuery): Promise<any> {
  if (USE_MOCK) return getTrialOrgListMock(params)
  return request.get({ url: '/admin/trial/orgs', params })
}

/** 获取机构试用详情 */
export function fetchTrialOrgDetail(id: number): Promise<any> {
  if (USE_MOCK) return getTrialOrgDetailMock(id)
  return request.get({ url: `/admin/trial/org/${id}` })
}

/** 关停单个试用方案 */
export function stopTrialPlan(planId: number): Promise<any> {
  if (USE_MOCK) return stopTrialPlanMock(planId)
  return request.post({ url: `/admin/trial/plan/${planId}/stop` })
}

/** 关停机构下全部试用方案 */
export function stopAllTrialPlansByOrg(orgId: number): Promise<any> {
  if (USE_MOCK) return stopAllTrialPlansByOrgMock(orgId)
  return request.post({ url: `/admin/trial/org/${orgId}/stop-all` })
}
