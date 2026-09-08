/**
 * 产品方案管理 API
 */

import request from '@/utils/http'
import type {
  OrgStatsQuery,
  Plan,
  PlanStatsQuery,
  Product,
  ProductQuery,
  ProductTrialOrgQuery
} from '@/types/product'
import {
  createPlanMock,
  createProductMock,
  deletePlanMock,
  deleteProductMock,
  getOrgStatsMock,
  getPlanDetailMock,
  getPlanStatsMock,
  getPlansByProductMock,
  getProductDetailMock,
  getProductListMock,
  getProductMetaMock,
  getProductTrialOrgsMock,
  testValidationConfigMock,
  updatePlanMock,
  updatePlanStatusMock,
  updateProductMock,
  updateProductStatusMock
} from '@/mock/product'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/** 获取机构类型/区域/处理人元数据 */
export function fetchProductMeta(): Promise<any> {
  if (USE_MOCK) return getProductMetaMock()
  return request.get({ url: '/admin/product/meta' })
}

/** 分页查询产品方案列表 */
export function fetchProductList(params: ProductQuery): Promise<any> {
  if (USE_MOCK) return getProductListMock(params)
  return request.get({ url: '/admin/product/list', params })
}

/** 获取产品详情 */
export function fetchProductDetail(id: number): Promise<any> {
  if (USE_MOCK) return getProductDetailMock(id)
  return request.get({ url: `/admin/product/${id}` })
}

/** 获取产品下试用方案 */
export function fetchPlansByProduct(productId: number): Promise<any> {
  if (USE_MOCK) return getPlansByProductMock(productId)
  return request.get({ url: `/admin/product/${productId}/plans` })
}

/** 新增产品方案 */
export function createProduct(data: Partial<Product>): Promise<any> {
  if (USE_MOCK) return createProductMock(data)
  return request.post({ url: '/admin/product', data })
}

/** 编辑产品方案 */
export function updateProduct(data: Partial<Product> & { id: number }): Promise<any> {
  if (USE_MOCK) return updateProductMock(data)
  return request.put({ url: `/admin/product/${data.id}`, data })
}

/** 启用/禁用产品方案 */
export function updateProductStatus(id: number, displayStatus: number): Promise<any> {
  if (USE_MOCK) return updateProductStatusMock(id, displayStatus)
  return request.put({ url: `/admin/product/${id}/status`, data: { displayStatus } })
}

/** 删除产品方案 */
export function deleteProduct(id: number): Promise<any> {
  if (USE_MOCK) return deleteProductMock(id)
  return request.del({ url: `/admin/product/${id}` })
}

/** 获取试用方案详情 */
export function fetchPlanDetail(id: number): Promise<any> {
  if (USE_MOCK) return getPlanDetailMock(id)
  return request.get({ url: `/admin/plan/${id}` })
}

/** 新增试用方案 */
export function createPlan(data: Partial<Plan>): Promise<any> {
  if (USE_MOCK) return createPlanMock(data)
  return request.post({ url: '/admin/plan', data })
}

/** 编辑试用方案 */
export function updatePlan(data: Partial<Plan> & { id: number }): Promise<any> {
  if (USE_MOCK) return updatePlanMock(data)
  return request.put({ url: `/admin/plan/${data.id}`, data })
}

/** 启用/禁用试用方案 */
export function updatePlanStatus(id: number, displayStatus: number): Promise<any> {
  if (USE_MOCK) return updatePlanStatusMock(id, displayStatus)
  return request.put({ url: `/admin/plan/${id}/status`, data: { displayStatus } })
}

/** 删除试用方案 */
export function deletePlan(id: number): Promise<any> {
  if (USE_MOCK) return deletePlanMock(id)
  return request.del({ url: `/admin/plan/${id}` })
}

/** 测试校验配置 */
export function testValidationConfig(config: string): Promise<any> {
  if (USE_MOCK) return testValidationConfigMock(config)
  return request.post({ url: '/admin/plan/test-validation', data: { config } })
}

/** 产品方案统计 */
export function fetchPlanStats(params: PlanStatsQuery): Promise<any> {
  if (USE_MOCK) return getPlanStatsMock(params)
  return request.get({ url: '/admin/product/stats/plans', params })
}

/** 机构试用统计（方案维度） */
export function fetchOrgStats(params: OrgStatsQuery): Promise<any> {
  if (USE_MOCK) return getOrgStatsMock(params)
  return request.get({ url: '/admin/product/stats/orgs', params })
}

/** 产品维度 · 试用机构统计（列表「试用机构数量」下钻） */
export function fetchProductTrialOrgs(params: ProductTrialOrgQuery): Promise<any> {
  if (USE_MOCK) return getProductTrialOrgsMock(params)
  return request.get({ url: '/admin/product/stats/trial-orgs', params })
}
