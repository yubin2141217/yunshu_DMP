/**
 * 申请管理 API
 */

import request from '@/utils/http'
import type {
  ApplyAuditPayload,
  ApplyListQuery,
  ApplyManualPayload,
  ApplyManualRejectPayload
} from '@/types/apply'
import {
  auditApplyMock,
  getApplyAuditListMock,
  getApplyDetailMock,
  getApplyRecordsListMock,
  getApplyTodoListMock,
  manualInterveneApplyMock,
  manualRejectApplyMock
} from '@/mock/apply'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/** 分页查询审核管理列表 */
export function fetchApplyAuditList(params: ApplyListQuery): Promise<any> {
  if (USE_MOCK) return getApplyAuditListMock(params)
  return request.get({ url: '/admin/apply/audit/list', params })
}

/** 分页查询待办工单列表 */
export function fetchApplyTodoList(params: ApplyListQuery): Promise<any> {
  if (USE_MOCK) return getApplyTodoListMock(params)
  return request.get({ url: '/admin/apply/todo/list', params })
}

/** 分页查询处理记录列表 */
export function fetchApplyRecordsList(params: ApplyListQuery): Promise<any> {
  if (USE_MOCK) return getApplyRecordsListMock(params)
  return request.get({ url: '/admin/apply/records/list', params })
}

/** 获取申请详情 */
export function fetchApplyDetail(id: number): Promise<any> {
  if (USE_MOCK) return getApplyDetailMock(id)
  return request.get({ url: `/admin/apply/${id}` })
}

/** 审核通过/驳回 */
export function auditApply(payload: ApplyAuditPayload): Promise<any> {
  if (USE_MOCK) return auditApplyMock(payload)
  return request.post({ url: `/admin/apply/${payload.id}/audit`, data: payload })
}

/** 人工处理 */
export function manualInterveneApply(payload: ApplyManualPayload): Promise<any> {
  if (USE_MOCK) return manualInterveneApplyMock(payload)
  return request.post({ url: `/admin/apply/${payload.id}/intervene`, data: payload })
}

/** 人工处理驳回 */
export function manualRejectApply(payload: ApplyManualRejectPayload): Promise<any> {
  if (USE_MOCK) return manualRejectApplyMock(payload)
  return request.post({ url: `/admin/apply/${payload.id}/intervene/reject`, data: payload })
}
