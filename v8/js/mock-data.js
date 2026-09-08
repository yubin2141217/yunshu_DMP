/**
 * 云数中台 · V8 原型 mock
 * 口径对齐 SRS：已配置供数方（含停用）出现在列表；入库条数按到达中台时间。
 * 接入规范含完整数据标准 / 接入方案对象（与 MT 启用桥接）。
 */
;(function () {
  const suppliers = [
    { id: 's1', name: '清博智能', code: 'QB001', status: 'enabled', updatedAt: '2026-09-01 14:20:00' },
    { id: 's2', name: '智慧星光', code: 'ZX001', status: 'enabled', updatedAt: '2026-08-28 09:10:00' },
    { id: 's3', name: '数美科技', code: 'SM001', status: 'disabled', updatedAt: '2026-09-02 18:06:00' },
    { id: 's4', name: '百度舆情', code: 'BD001', status: 'enabled', updatedAt: '2026-08-15 11:00:00' },
  ]

  const configuredIds = ['s1', 's2', 's3']

  const inbound = {
    all: { s1: 12840, s2: 5620, s3: 2100, s4: 880 },
    d7: { s1: 320, s2: 96, s3: 0, s4: 40 },
    d30: { s1: 1860, s2: 540, s3: 0, s4: 210 },
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

  const defaultMetadata = {
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
  }

  const defaultScheme = {
    id: 'p1',
    name: '厂商实时推送',
    supplierId: 's2',
    supplierName: '智慧星光',
    frontHost: '10.0.1.12',
    frontPort: '8443',
    protocol: 'HTTPS',
    path: '/api/v1/articles',
    frequency: 'realtime',
    frequencyLabel: '实时',
    updateMode: 'incremental',
    updateModeLabel: '增量',
    incrementField: 'content_time',
    retry: 3,
    remark: '供数方推送到机构侧前置机，中台按增量字段收数',
    status: 'enabled',
    updatedAt: '2026-09-01 14:20:00',
  }

  const defaultStandard = {
    id: 'st1',
    name: '云数中台接入标准',
    fileName: '云数中台接入标准.docx',
    type: 'Word',
    size: '31 KB',
    fileSize: '31 KB',
    publishedAt: '2026-09-03 11:00:00',
    uploadedAt: '2026-09-03 11:00:00',
    fileUrl: './files/yunshu-access-standard-example.docx',
    metadataId: 'm1',
    schemeId: 'p1',
    metadataName: defaultMetadata.name,
    schemeName: defaultScheme.name,
    status: 'enabled',
    metadata: defaultMetadata,
    scheme: defaultScheme,
  }

  function paginate(list, page, pageSize) {
    const total = list.length
    const start = (page - 1) * pageSize
    return { list: list.slice(start, start + pageSize), total }
  }

  function configuredSuppliers() {
    return configuredIds
      .map((id) => suppliers.find((s) => s.id === id))
      .filter(Boolean)
  }

  function statsRows(range) {
    const bag = inbound[range] || inbound.all
    return configuredSuppliers().map((s) => ({
      id: s.id,
      name: s.name,
      count: bag[s.id] != null ? bag[s.id] : 0,
    }))
  }

  function overview() {
    const rows = statsRows('all')
    const total = rows.reduce((sum, row) => sum + row.count, 0)
    return {
      supplierCount: configuredIds.length,
      inboundTotal: total,
      lastInboundAt: total ? '2026-09-03 08:12:00' : '',
    }
  }

  function enrichScheme(scheme) {
    if (!scheme) return null
    const supplier = suppliers.find((s) => s.id === scheme.supplierId)
    return Object.assign({}, scheme, {
      supplierName: scheme.supplierName || (supplier && supplier.name) || '—',
      frequencyLabel: scheme.frequencyLabel || frequencyLabels[scheme.frequency] || scheme.frequency,
      updateModeLabel: scheme.updateModeLabel || updateModeLabels[scheme.updateMode] || scheme.updateMode,
    })
  }

  function hydrateEnabled(raw) {
    if (!raw) return null
    const metadata = raw.metadata || defaultMetadata
    const scheme = enrichScheme(raw.scheme || defaultScheme)
    return Object.assign({}, defaultStandard, raw, {
      metadataName: raw.metadataName || metadata.name,
      schemeName: raw.schemeName || (scheme && scheme.name) || '—',
      type: raw.type || 'Word',
      publishedAt: raw.publishedAt || raw.uploadedAt || defaultStandard.publishedAt,
      fileSize: raw.fileSize || raw.size || defaultStandard.fileSize,
      metadata: metadata,
      scheme: scheme,
    })
  }

  const BRIDGE_KEY = 'yunshu-enabled-standard-v1'

  function getEnabledStandard() {
    try {
      const raw = localStorage.getItem(BRIDGE_KEY)
      if (raw !== null) return hydrateEnabled(JSON.parse(raw))
    } catch (_) {
      /* ignore */
    }
    return hydrateEnabled(Object.assign({}, defaultStandard))
  }

  window.YunshuMock = {
    orgName: '某市网信办',
    suppliers,
    configuredIds,
    inbound,
    categoryLabels,
    requiredLabels,
    frequencyLabels,
    updateModeLabels,
    paginate,
    configuredSuppliers,
    statsRows,
    overview,
    getEnabledStandard,
    get standard() {
      return getEnabledStandard()
    },
  }

  window.ArcoProMock = window.YunshuMock
})()
