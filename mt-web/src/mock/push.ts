export type PushStatus = 'enabled' | 'disabled'
export type TaskRunStatus = 'running' | 'pending'

export interface PushConsumer {
  id: string
  name: string
  code: string
  reviewer: string
  status: PushStatus
  updatedAt: string
}

export interface PushTask {
  id: string
  name: string
  consumerId: string
  consumerName: string
  supplierId: string
  supplierName: string
  business?: string
  region?: string
  sourceDb: string
  sourceSchema: string
  targetHost: string
  targetPath: string
  authRemark: string
  status: TaskRunStatus
  lastProcessedAt: string
  updatedAt: string
}

const STORAGE_KEY = 'yunshu-mt-push-v2'

function nowText() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

const seed = {
  consumers: [
    {
      id: 'c1',
      name: '上级汇聚平台',
      code: 'CONS_UP',
      reviewer: '张治强',
      status: 'enabled' as PushStatus,
      updatedAt: '2026-09-01 10:00:00',
    },
    {
      id: 'c2',
      name: '区县定性系统',
      code: 'CONS_DIST',
      reviewer: '余利敏',
      status: 'disabled' as PushStatus,
      updatedAt: '2026-08-20 15:30:00',
    },
  ] as PushConsumer[],
  tasks: [
    {
      id: 't1',
      name: '上级舆情清单',
      consumerId: 'c1',
      consumerName: '上级汇聚平台',
      supplierId: 's1',
      supplierName: '清博智能',
      business: '舆情',
      region: '全市',
      sourceDb: 'yunshu_dw',
      sourceSchema: 'public',
      targetHost: 'https://upstream.example.gov',
      targetPath: '/api/v1/ingest',
      authRemark: 'Token 由使用方侧签发，Header: Authorization',
      status: 'running' as TaskRunStatus,
      lastProcessedAt: '2026-09-08 09:40:00',
      updatedAt: '2026-09-08 09:40:00',
    },
    {
      id: 't2',
      name: '区县定性同步',
      consumerId: 'c2',
      consumerName: '区县定性系统',
      supplierId: 's2',
      supplierName: '智慧星光',
      business: '定性',
      region: '某区',
      sourceDb: 'yunshu_dw',
      sourceSchema: 'district',
      targetHost: 'https://district.example.local',
      targetPath: '/api/push/articles',
      authRemark: '双向证书，联调环境暂用 IP 白名单',
      status: 'pending' as TaskRunStatus,
      lastProcessedAt: '—',
      updatedAt: '2026-09-05 11:00:00',
    },
  ] as PushTask[],
}

interface State {
  consumers: PushConsumer[]
  tasks: PushTask[]
}

function clone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data))
}

function loadState(): State {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as State
  } catch {
    /* ignore */
  }
  return clone(seed)
}

function save() {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

const state = loadState()

export function paginate<T>(list: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize
  return { list: list.slice(start, start + pageSize), total: list.length }
}

export const pushMock = {
  listConsumers(keyword = '') {
    const q = keyword.trim()
    let list = state.consumers.slice()
    if (q) list = list.filter((c) => c.name.includes(q) || c.code.includes(q))
    return list
  },
  saveConsumer(payload: Partial<PushConsumer> & { name: string; code: string; reviewer: string }) {
    const now = nowText()
    if (payload.id) {
      const item = state.consumers.find((c) => c.id === payload.id)
      if (!item) return null
      Object.assign(item, {
        name: payload.name.trim(),
        code: payload.code.trim(),
        reviewer: payload.reviewer.trim(),
        status: payload.status || item.status,
        updatedAt: now,
      })
      save()
      return item
    }
    if (state.consumers.some((c) => c.code === payload.code.trim())) {
      return { ok: false as const, reason: 'dup' as const }
    }
    const item: PushConsumer = {
      id: 'c' + Date.now(),
      name: payload.name.trim(),
      code: payload.code.trim(),
      reviewer: payload.reviewer.trim(),
      status: payload.status || 'enabled',
      updatedAt: now,
    }
    state.consumers.unshift(item)
    save()
    return { ok: true as const, item }
  },
  setConsumerStatus(id: string, status: PushStatus) {
    const item = state.consumers.find((c) => c.id === id)
    if (!item) return null
    item.status = status
    item.updatedAt = nowText()
    save()
    return item
  },
  enabledConsumers() {
    return state.consumers.filter((c) => c.status === 'enabled')
  },
  listTasks(keyword = '') {
    const q = keyword.trim()
    let list = state.tasks.slice()
    if (q) {
      list = list.filter((t) => t.name.includes(q) || t.consumerName.includes(q))
    }
    return list
  },
  saveTask(
    payload: Omit<PushTask, 'id' | 'updatedAt' | 'lastProcessedAt' | 'consumerName' | 'supplierName' | 'status'> & {
      id?: string
      status?: TaskRunStatus
      supplierName?: string
      consumerName?: string
    },
  ) {
    const consumer = state.consumers.find((c) => c.id === payload.consumerId)
    if (!consumer) return { ok: false as const, reason: 'consumer' as const }
    const now = nowText()
    const base = {
      name: payload.name.trim(),
      consumerId: payload.consumerId,
      consumerName: consumer.name,
      supplierId: payload.supplierId,
      supplierName: payload.supplierName || '—',
      business: payload.business || '',
      region: payload.region || '',
      sourceDb: payload.sourceDb.trim(),
      sourceSchema: payload.sourceSchema.trim(),
      targetHost: payload.targetHost.trim(),
      targetPath: payload.targetPath.trim(),
      authRemark: (payload.authRemark || '').trim(),
      updatedAt: now,
    }
    if (payload.id) {
      const item = state.tasks.find((t) => t.id === payload.id)
      if (!item) return { ok: false as const, reason: 'missing' as const }
      Object.assign(item, base)
      save()
      return { ok: true as const, item }
    }
    const item: PushTask = {
      id: 't' + Date.now(),
      ...base,
      status: 'pending',
      lastProcessedAt: '—',
    }
    state.tasks.unshift(item)
    save()
    return { ok: true as const, item }
  },
  setTaskStatus(id: string, status: TaskRunStatus) {
    const item = state.tasks.find((t) => t.id === id)
    if (!item) return null
    item.status = status
    item.updatedAt = nowText()
    if (status === 'running' && item.lastProcessedAt === '—') {
      item.lastProcessedAt = nowText()
    }
    save()
    return item
  },
}

export function delay(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
