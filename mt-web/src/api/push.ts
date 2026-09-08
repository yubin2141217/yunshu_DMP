import { delay, paginate, pushMock, type PushConsumer, type PushStatus, type PushTask, type TaskRunStatus } from '@/mock/push'
import { mtMock } from '@/mock/mt'

export async function listPushConsumers(params: { keyword: string; page: number; pageSize: number }) {
  await delay()
  const list = pushMock.listConsumers(params.keyword)
  return paginate(list, params.page, params.pageSize)
}

export async function savePushConsumer(payload: {
  id?: string
  name: string
  code: string
  reviewer: string
  status?: PushStatus
}) {
  await delay()
  const res = pushMock.saveConsumer(payload)
  if (!res) throw new Error('保存失败')
  if ('ok' in res) {
    if (!res.ok) throw new Error(res.reason === 'dup' ? '编码已存在' : '保存失败')
    return res.item
  }
  return res
}

export async function togglePushConsumer(id: string, status: PushStatus) {
  await delay()
  const item = pushMock.setConsumerStatus(id, status)
  if (!item) throw new Error('使用方不存在')
  return item
}

export async function listPushTasks(params: { keyword: string; page: number; pageSize: number }) {
  await delay()
  const list = pushMock.listTasks(params.keyword)
  return paginate(list, params.page, params.pageSize)
}

export async function savePushTask(payload: {
  name: string
  consumerId: string
  supplierId: string
  business?: string
  region?: string
  sourceDb: string
  sourceSchema: string
  targetHost: string
  targetPath: string
  authRemark?: string
}) {
  await delay()
  const supplier = mtMock.getSuppliers().find((s) => s.id === payload.supplierId)
  const res = pushMock.saveTask({
    ...payload,
    authRemark: payload.authRemark || '',
    supplierName: supplier?.name || '—',
  })
  if (!res.ok) {
    if (res.reason === 'consumer') throw new Error('请选择有效使用方')
    throw new Error('保存失败')
  }
  return res.item
}

export async function togglePushTask(id: string, status: TaskRunStatus) {
  await delay()
  const item = pushMock.setTaskStatus(id, status)
  if (!item) throw new Error('任务不存在')
  return item
}

export function pushConsumerOptions() {
  return pushMock.enabledConsumers().map((c) => ({ label: c.name, value: c.id }))
}

export function pushSupplierOptions() {
  return mtMock
    .getSuppliers()
    .filter((s) => s.status === 'enabled')
    .map((s) => ({ label: s.name, value: s.id }))
}

export type { PushConsumer, PushTask, PushStatus, TaskRunStatus }
