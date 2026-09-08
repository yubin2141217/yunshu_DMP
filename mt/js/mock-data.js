/**
 * 云数中台 · MT 原型 mock（会话内可改，刷新保留）
 * v2：接入标准多条且最多一条启用；元数据 / 接入方案可 CRUD
 */
;(function () {
  const STORAGE_KEY = 'yunshu-mt-mock-v2'
  const BRIDGE_KEY = 'yunshu-enabled-standard-v1'

  const seed = {
    suppliers: [
      { id: 's1', name: '清博智能', code: 'QB001', status: 'enabled', updatedAt: '2026-09-01 14:20:00' },
      { id: 's2', name: '智慧星光', code: 'ZX001', status: 'enabled', updatedAt: '2026-08-28 09:10:00' },
      { id: 's3', name: '数美科技', code: 'SM001', status: 'disabled', updatedAt: '2026-09-02 18:06:00' },
      { id: 's4', name: '百度舆情', code: 'BD001', status: 'enabled', updatedAt: '2026-08-15 11:00:00' },
    ],
    orgs: [
      { id: 'o1', name: '某市网信办', supplierIds: ['s1', 's2', 's3'] },
      { id: 'o2', name: '某省宣传部', supplierIds: ['s1'] },
      { id: 'o3', name: '某区融媒体中心', supplierIds: [] },
    ],
    metadata: [
      {
        id: 'm1',
        name: '舆情文章主数据',
        code: 'YSZT_T_ARTICLE',
        category: 'table',
        topic: '舆情',
        bizCaliber: '一条舆情原文对应一条记录，含供数方、归属机构、标题、区域、原文地址、内容时间',
        requiredLevel: 'required',
        provider: '各供数方按中台编码报送',
        charset: 'UTF-8',
        primaryKey: 'article_id',
        dataType: '二维表 / string、datetime',
        updateCycle: '实时',
        maxSize: '单行字段合计不超过 64 KB',
        owner: '平台运营',
        monitor: '入库量按供数方对账',
        sla: '到达中台后 5 秒内可计入统计',
        remark: '启用后可供接入标准选用',
        status: 'enabled',
        updatedAt: '2026-09-03 11:00:00',
      },
      {
        id: 'm2',
        name: '舆情文章正文',
        code: 'YSZT_U_CONTENT',
        category: 'unstructured',
        topic: '舆情',
        bizCaliber: '原文正文或 HTML，须回挂主数据主键',
        requiredLevel: 'required',
        provider: '与主数据同一供数方',
        charset: 'UTF-8',
        primaryKey: 'article_id + supplier_code',
        dataType: 'txt / html',
        updateCycle: '随主数据',
        maxSize: '正文 2 MB',
        owner: '平台运营',
        monitor: '对象完整性校验（MD5）',
        sla: '与主数据同批次到达',
        remark: '不能单独计入机构统计',
        status: 'enabled',
        updatedAt: '2026-09-03 11:00:00',
      },
      {
        id: 'm3',
        name: '历史快照归档',
        code: 'YSZT_U_SNAP',
        category: 'unstructured',
        topic: '舆情',
        bizCaliber: '网页快照与附件，可选',
        requiredLevel: 'optional',
        provider: '供数方可选报送',
        charset: '二进制',
        primaryKey: 'object_id',
        dataType: 'pdf / jpg / zip',
        updateCycle: '按需',
        maxSize: '附件 20 MB',
        owner: '平台运营',
        monitor: '存储容量告警',
        sla: '不承诺计入时延',
        remark: '停用后不可被新接入标准选用',
        status: 'disabled',
        updatedAt: '2026-08-20 09:00:00',
      },
    ],
    schemes: [
      {
        id: 'p1',
        name: '厂商实时推送',
        supplierId: 's2',
        frontHost: '10.0.1.12',
        frontPort: '8443',
        protocol: 'HTTPS',
        path: '/api/v1/articles',
        frequency: 'realtime',
        updateMode: 'incremental',
        incrementField: 'content_time',
        retry: 3,
        remark: '供数方推送到机构侧前置机，中台按增量字段收数',
        status: 'enabled',
        updatedAt: '2026-09-01 14:20:00',
      },
      {
        id: 'p2',
        name: '日终全量落库',
        supplierId: 's1',
        frontHost: 'sftp.example.local',
        frontPort: '22',
        protocol: 'SFTP',
        path: '/inbox/yunshu/',
        frequency: 'daily',
        updateMode: 'full',
        incrementField: '',
        retry: 1,
        remark: '每日 02:00 全量文件交换',
        status: 'enabled',
        updatedAt: '2026-08-28 09:10:00',
      },
    ],
    standards: [
      {
        id: 'st1',
        name: '云数中台接入标准',
        metadataId: 'm1',
        schemeId: 'p1',
        fileName: '云数中台接入标准.docx',
        fileSize: '31 KB',
        fileUrl: './files/yunshu-access-standard-example.docx',
        status: 'enabled',
        uploader: '平台运营',
        uploadedAt: '2026-09-03 11:00:00',
      },
      {
        id: 'st2',
        name: '备用接入标准',
        metadataId: 'm2',
        schemeId: 'p2',
        fileName: '云数中台接入标准-备用.docx',
        fileSize: '28 KB',
        fileUrl: './files/yunshu-access-standard-example.docx',
        status: 'disabled',
        uploader: '平台运营',
        uploadedAt: '2026-08-15 10:00:00',
      },
    ],
  }

  function clone(data) {
    return JSON.parse(JSON.stringify(data))
  }

  function loadState() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw)
    } catch (_) {
      /* ignore */
    }
    return clone(seed)
  }

  let state = loadState()

  function save() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (_) {
      /* ignore */
    }
    syncEnabledBridge()
  }

  function nowText() {
    const d = new Date()
    const p = (n) => String(n).padStart(2, '0')
    return (
      d.getFullYear() +
      '-' +
      p(d.getMonth() + 1) +
      '-' +
      p(d.getDate()) +
      ' ' +
      p(d.getHours()) +
      ':' +
      p(d.getMinutes()) +
      ':' +
      p(d.getSeconds())
    )
  }

  function paginate(list, page, pageSize) {
    const total = list.length
    const start = (page - 1) * pageSize
    return { list: list.slice(start, start + pageSize), total }
  }

  function supplierNameMap() {
    const map = {}
    state.suppliers.forEach((s) => {
      map[s.id] = s.name
    })
    return map
  }

  function isReferenced(id) {
    return state.orgs.some((org) => org.supplierIds.indexOf(id) >= 0)
  }

  const categoryLabels = {
    table: '库表数据集',
    unstructured: '非结构化数据',
    api: '接口数据',
  }
  const requiredLabels = {
    required: '必接',
    suggested: '建议',
    optional: '可选',
  }
  const frequencyLabels = {
    realtime: '实时',
    hourly: '每小时',
    daily: '每日',
  }
  const updateModeLabels = {
    incremental: '增量',
    full: '全量',
  }

  function findMeta(id) {
    return (state.metadata || []).find((m) => m.id === id) || null
  }
  function findScheme(id) {
    return (state.schemes || []).find((s) => s.id === id) || null
  }

  function hydrateStandard(item) {
    if (!item) return null
    const meta = findMeta(item.metadataId)
    const scheme = findScheme(item.schemeId)
    const names = supplierNameMap()
    const schemeHydrated = scheme
      ? Object.assign({}, scheme, {
          supplierName: names[scheme.supplierId] || '—',
          frequencyLabel: frequencyLabels[scheme.frequency] || scheme.frequency,
          updateModeLabel: updateModeLabels[scheme.updateMode] || scheme.updateMode,
        })
      : null
    return {
      ...item,
      metadataName: meta ? meta.name : '—',
      schemeName: scheme ? scheme.name : '—',
      type: 'Word',
      publishedAt: item.uploadedAt,
      metadata: meta,
      scheme: schemeHydrated,
    }
  }

  function syncEnabledBridge() {
    const enabled = (state.standards || []).find((s) => s.status === 'enabled')
    const payload = enabled ? hydrateStandard(enabled) : null
    try {
      localStorage.setItem(BRIDGE_KEY, JSON.stringify(payload))
    } catch (_) {
      /* ignore */
    }
  }

  function ensureSingleEnabled(exceptId, nextStatus) {
    if (nextStatus !== 'enabled') return
    ;(state.standards || []).forEach((s) => {
      if (s.id !== exceptId) s.status = 'disabled'
    })
  }

  syncEnabledBridge()

  window.YunshuMock = {
    paginate,
    nowText,
    categoryLabels,
    requiredLabels,
    frequencyLabels,
    updateModeLabels,
    getSuppliers() {
      return state.suppliers.slice()
    },
    getOrgs() {
      const names = supplierNameMap()
      return state.orgs.map((org) => ({
        ...org,
        supplierNames: org.supplierIds.map((id) => names[id]).filter(Boolean),
      }))
    },
    enabledSuppliers() {
      return state.suppliers.filter((s) => s.status === 'enabled')
    },
    findSupplier(id) {
      return state.suppliers.find((s) => s.id === id) || null
    },
    nameExists(name, exceptId) {
      const n = String(name || '').trim()
      return state.suppliers.some((s) => s.name === n && s.id !== exceptId)
    },
    codeExists(code, exceptId) {
      const c = String(code || '').trim()
      return state.suppliers.some((s) => s.code === c && s.id !== exceptId)
    },
    createSupplier(payload) {
      const item = {
        id: 's' + Date.now(),
        name: String(payload.name || '').trim(),
        code: String(payload.code || '').trim(),
        status: payload.status || 'enabled',
        updatedAt: nowText(),
      }
      state.suppliers.unshift(item)
      save()
      return item
    },
    updateSupplier(id, payload) {
      const item = state.suppliers.find((s) => s.id === id)
      if (!item) return null
      item.name = String(payload.name || '').trim()
      item.code = String(payload.code || '').trim()
      item.status = payload.status || item.status
      item.updatedAt = nowText()
      save()
      return item
    },
    setSupplierStatus(id, status) {
      const item = state.suppliers.find((s) => s.id === id)
      if (!item) return null
      item.status = status
      item.updatedAt = nowText()
      save()
      return item
    },
    removeSupplier(id) {
      if (isReferenced(id)) return { ok: false, reason: 'referenced' }
      const before = state.suppliers.length
      state.suppliers = state.suppliers.filter((s) => s.id !== id)
      save()
      return { ok: state.suppliers.length < before }
    },
    isReferenced,
    saveOrgSuppliers(orgId, supplierIds) {
      const org = state.orgs.find((o) => o.id === orgId)
      if (!org) return null
      org.supplierIds = supplierIds.slice()
      save()
      return org
    },

    getMetadata() {
      return (state.metadata || []).slice()
    },
    enabledMetadata() {
      return (state.metadata || []).filter((m) => m.status === 'enabled')
    },
    findMetadata(id) {
      return findMeta(id)
    },
    metadataCodeExists(code, exceptId) {
      const c = String(code || '').trim()
      return (state.metadata || []).some((m) => m.code === c && m.id !== exceptId)
    },
    metadataNameExists(name, exceptId) {
      const n = String(name || '').trim()
      return (state.metadata || []).some((m) => m.name === n && m.id !== exceptId)
    },
    saveMetadata(payload) {
      const now = nowText()
      if (payload.id) {
        const item = findMeta(payload.id)
        if (!item) return null
        Object.assign(item, payload, { updatedAt: now })
        save()
        return item
      }
      const item = { ...payload, id: 'm' + Date.now(), updatedAt: now }
      state.metadata.unshift(item)
      save()
      return item
    },
    setMetadataStatus(id, status) {
      const item = findMeta(id)
      if (!item) return null
      item.status = status
      item.updatedAt = nowText()
      save()
      return item
    },
    removeMetadata(id) {
      const used = (state.standards || []).some((s) => s.metadataId === id)
      if (used) return { ok: false, reason: 'referenced' }
      const before = state.metadata.length
      state.metadata = state.metadata.filter((m) => m.id !== id)
      save()
      return { ok: state.metadata.length < before }
    },

    getSchemes() {
      const names = supplierNameMap()
      return (state.schemes || []).map((s) => ({
        ...s,
        supplierName: s.supplierId ? names[s.supplierId] || '—' : '—',
        frequencyLabel: frequencyLabels[s.frequency] || s.frequency,
        updateModeLabel: updateModeLabels[s.updateMode] || s.updateMode,
      }))
    },
    enabledSchemes() {
      return this.getSchemes().filter((s) => s.status === 'enabled')
    },
    findScheme(id) {
      const item = findScheme(id)
      if (!item) return null
      const names = supplierNameMap()
      return {
        ...item,
        supplierName: item.supplierId ? names[item.supplierId] || '—' : '—',
        frequencyLabel: frequencyLabels[item.frequency] || item.frequency,
        updateModeLabel: updateModeLabels[item.updateMode] || item.updateMode,
      }
    },
    schemeNameExists(name, exceptId) {
      const n = String(name || '').trim()
      return (state.schemes || []).some((s) => s.name === n && s.id !== exceptId)
    },
    saveScheme(payload) {
      const now = nowText()
      const fields = {
        name: String(payload.name || '').trim(),
        supplierId: payload.supplierId || '',
        frontHost: String(payload.frontHost || '').trim(),
        frontPort: String(payload.frontPort || '').trim(),
        protocol: payload.protocol || 'HTTPS',
        path: String(payload.path || '').trim(),
        frequency: payload.frequency || 'daily',
        updateMode: payload.updateMode || 'incremental',
        incrementField: String(payload.incrementField || '').trim(),
        retry: Number(payload.retry) || 0,
        remark: String(payload.remark || '').trim(),
        status: payload.status || 'enabled',
        updatedAt: now,
      }
      if (payload.id) {
        const item = findScheme(payload.id)
        if (!item) return null
        Object.assign(item, fields)
        save()
        return item
      }
      const item = { id: 'p' + Date.now(), ...fields }
      state.schemes.unshift(item)
      save()
      return item
    },
    setSchemeStatus(id, status) {
      const item = findScheme(id)
      if (!item) return null
      item.status = status
      item.updatedAt = nowText()
      save()
      return item
    },
    removeScheme(id) {
      const used = (state.standards || []).some((s) => s.schemeId === id)
      if (used) return { ok: false, reason: 'referenced' }
      const before = state.schemes.length
      state.schemes = state.schemes.filter((s) => s.id !== id)
      save()
      return { ok: state.schemes.length < before }
    },

    getStandards() {
      return (state.standards || []).map(hydrateStandard)
    },
    getEnabledStandard() {
      const item = (state.standards || []).find((s) => s.status === 'enabled')
      return item ? hydrateStandard(item) : null
    },
    findStandard(id) {
      const item = (state.standards || []).find((s) => s.id === id)
      return item ? hydrateStandard(item) : null
    },
    standardNameExists(name, exceptId) {
      const n = String(name || '').trim()
      return (state.standards || []).some((s) => s.name === n && s.id !== exceptId)
    },
    saveStandard(payload) {
      const meta = findMeta(payload.metadataId)
      const scheme = findScheme(payload.schemeId)
      if (!meta || meta.status !== 'enabled') return { ok: false, reason: 'meta' }
      if (!scheme || scheme.status !== 'enabled') return { ok: false, reason: 'scheme' }
      const now = nowText()
      const fields = {
        name: String(payload.name || '').trim(),
        metadataId: payload.metadataId,
        schemeId: payload.schemeId,
        fileName: payload.fileName || '',
        fileSize: payload.fileSize || '',
        fileUrl: payload.fileUrl || './files/yunshu-access-standard-example.docx',
        status: payload.status || 'disabled',
        uploader: '平台运营',
        uploadedAt: now,
      }
      if (payload.id) {
        const item = (state.standards || []).find((s) => s.id === payload.id)
        if (!item) return { ok: false, reason: 'missing' }
        ensureSingleEnabled(item.id, fields.status)
        Object.assign(item, fields)
        save()
        return { ok: true, item: hydrateStandard(item) }
      }
      const item = { id: 'st' + Date.now(), ...fields }
      ensureSingleEnabled(item.id, item.status)
      state.standards.unshift(item)
      save()
      return { ok: true, item: hydrateStandard(item) }
    },
    setStandardStatus(id, status) {
      const item = (state.standards || []).find((s) => s.id === id)
      if (!item) return null
      if (status === 'enabled') {
        const meta = findMeta(item.metadataId)
        const scheme = findScheme(item.schemeId)
        if (!meta || meta.status !== 'enabled') return { ok: false, reason: 'meta' }
        if (!scheme || scheme.status !== 'enabled') return { ok: false, reason: 'scheme' }
        ensureSingleEnabled(id, 'enabled')
      }
      item.status = status
      item.uploadedAt = item.uploadedAt || nowText()
      save()
      return { ok: true, item: hydrateStandard(item) }
    },
    removeStandard(id) {
      const before = (state.standards || []).length
      state.standards = (state.standards || []).filter((s) => s.id !== id)
      save()
      return { ok: state.standards.length < before }
    },
  }

  window.ArcoProMock = window.YunshuMock
})()
