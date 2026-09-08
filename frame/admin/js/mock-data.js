/**
 * Arco Pro 演示 Mock 数据
 */
;(function () {
  const CARD_TITLES = [
    '每日推荐视频集',
    '抖音短视频候选集',
    '国际新闻集合',
    '财经早报精选',
    '科技前沿速递',
    '生活好物分享',
  ]

  const TICKET_TITLES = [
    '无法登录账号，提示密码错误',
    '订单支付成功但未到账',
    'APP 闪退（iOS 17）',
    '发票开具信息有误',
    '希望增加批量导出功能',
    '物流信息长时间未更新',
    '会员权益未生效',
    '短信验证码收不到',
    '退款申请超过时效',
    '页面加载缓慢影响下单',
  ]

  const ASSIGNEES = ['王立群', '李晓雯', '陈思远', '赵敏', '周杰', '未分配']
  const CUSTOMERS = ['星河科技', '云启商贸', '北辰零售', '青禾生鲜', '澜海传媒', '个人用户']

  const ticketTypes = ['咨询', '故障', '投诉', '建议']
  const priorities = ['低', '中', '高', '紧急']
  const statusLabels = ['待受理', '处理中', '已解决', '已关闭']

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  function pad(n, len) {
    return String(n).padStart(len, '0')
  }

  function ticketId(n) {
    return 'WO2026' + pad((n % 12) + 1, 2) + pad(n, 4)
  }

  function daysAgoDate(days) {
    const d = new Date()
    d.setDate(d.getDate() - days)
    d.setHours(rand(9, 18), rand(0, 59), rand(0, 59), 0)
    return d.toISOString()
  }

  function createTicket(i) {
    return {
      id: ticketId(i + 1),
      title: TICKET_TITLES[i % TICKET_TITLES.length],
      ticketType: i % 4,
      priority: i % 4,
      assignee: ASSIGNEES[i % ASSIGNEES.length],
      customer: CUSTOMERS[i % CUSTOMERS.length],
      createdAt: daysAgoDate(rand(0, 45)),
      status: i % 4,
      description:
        '客户反馈：' +
        TICKET_TITLES[i % TICKET_TITLES.length] +
        '。已登记相关环境信息，等待处理。',
    }
  }

  let listTableAll = Array.from({ length: 68 }, (_, i) => createTicket(i))
  let ticketSeq = listTableAll.length

  function hasSelectFilter(value) {
    if (value === '' || value == null) return false
    if (Array.isArray(value)) return value.length > 0
    return true
  }

  function matchSelect(value, target) {
    if (Array.isArray(value)) return value.includes(target)
    return value === target
  }

  function toDayStart(v) {
    const d = v instanceof Date ? new Date(v) : new Date(v)
    d.setHours(0, 0, 0, 0)
    return d.getTime()
  }

  function toDayEnd(v) {
    const d = v instanceof Date ? new Date(v) : new Date(v)
    d.setHours(23, 59, 59, 999)
    return d.getTime()
  }

  function filterListTable(params) {
    let rows = listTableAll.slice()
    if (!params) return rows
    if (params.id)
      rows = rows.filter((r) =>
        r.id.toLowerCase().includes(String(params.id).toLowerCase())
      )
    if (params.title)
      rows = rows.filter((r) =>
        r.title.toLowerCase().includes(String(params.title).toLowerCase())
      )
    if (hasSelectFilter(params.ticketType))
      rows = rows.filter((r) => matchSelect(params.ticketType, r.ticketType))
    if (hasSelectFilter(params.priority))
      rows = rows.filter((r) => matchSelect(params.priority, r.priority))
    if (hasSelectFilter(params.status))
      rows = rows.filter((r) => matchSelect(params.status, r.status))
    if (params.assignee)
      rows = rows.filter((r) => r.assignee === params.assignee)
    if (params.customer)
      rows = rows.filter((r) => r.customer === params.customer)
    if (params.keyword) {
      const kw = String(params.keyword).toLowerCase()
      rows = rows.filter(
        (r) =>
          String(r.title || '').toLowerCase().includes(kw) ||
          String(r.description || '').toLowerCase().includes(kw)
      )
    }
    if (params.createdTime && params.createdTime.length === 2) {
      const start = toDayStart(params.createdTime[0])
      const end = toDayEnd(params.createdTime[1])
      rows = rows.filter((r) => {
        const t = new Date(r.createdAt).getTime()
        return t >= start && t <= end
      })
    }
    return rows
  }

  function paginate(rows, page, pageSize) {
    const start = (page - 1) * pageSize
    return {
      list: rows.slice(start, start + pageSize),
      total: rows.length,
    }
  }

  function formatDateTime(iso) {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return '-'
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

  function getTicketById(id) {
    return listTableAll.find((r) => r.id === id) || null
  }

  function addTicket(payload) {
    ticketSeq += 1
    const row = {
      id: ticketId(ticketSeq),
      title: payload.title || '未命名工单',
      ticketType: payload.ticketType ?? 0,
      priority: payload.priority ?? 1,
      assignee: payload.assignee || '未分配',
      customer: payload.customer || '个人用户',
      createdAt: new Date().toISOString(),
      status: payload.status ?? 0,
      description: payload.description || '',
    }
    listTableAll.unshift(row)
    return row
  }

  function updateTicket(id, payload) {
    const idx = listTableAll.findIndex((r) => r.id === id)
    if (idx < 0) return null
    listTableAll[idx] = { ...listTableAll[idx], ...payload, id }
    return listTableAll[idx]
  }

  function removeTicket(id) {
    const before = listTableAll.length
    listTableAll = listTableAll.filter((r) => r.id !== id)
    return listTableAll.length < before
  }

  function removeTickets(ids) {
    const set = new Set(ids || [])
    const before = listTableAll.length
    listTableAll = listTableAll.filter((r) => !set.has(r.id))
    return before - listTableAll.length
  }

  function closeTickets(ids) {
    const set = new Set(ids || [])
    let count = 0
    listTableAll = listTableAll.map((r) => {
      if (!set.has(r.id)) return r
      count += 1
      return { ...r, status: 3 }
    })
    return count
  }

  const DEPARTMENT_TREE = [
    {
      key: 'hq',
      title: '平台总部',
      children: [
        {
          key: 'product-center',
          title: '商品中心',
          children: [
            { key: 'product-ops', title: '商品运营' },
            { key: 'category-mgmt', title: '类目管理' },
            { key: 'product-design', title: '商品设计' },
          ],
        },
        {
          key: 'order-center',
          title: '订单中心',
          children: [
            { key: 'order-fulfill', title: '履约运营' },
            { key: 'order-aftersale', title: '售后处理' },
          ],
        },
        {
          key: 'marketing-center',
          title: '营销中心',
          children: [
            { key: 'growth-ops', title: '增长运营' },
            { key: 'brand-ops', title: '品牌运营' },
          ],
        },
        {
          key: 'cs-center',
          title: '客服中心',
          children: [
            { key: 'cs-online', title: '在线客服' },
            { key: 'cs-hotline', title: '热线客服' },
          ],
        },
        {
          key: 'warehouse-center',
          title: '仓配中心',
          children: [
            { key: 'warehouse-ops', title: '仓储运营' },
            { key: 'logistics-ops', title: '物流调度' },
          ],
        },
      ],
    },
  ]

  const DEPARTMENT_LABELS = {
    hq: '平台总部',
    'product-center': '商品中心',
    'product-ops': '商品运营',
    'category-mgmt': '类目管理',
    'product-design': '商品设计',
    'order-center': '订单中心',
    'order-fulfill': '履约运营',
    'order-aftersale': '售后处理',
    'marketing-center': '营销中心',
    'growth-ops': '增长运营',
    'brand-ops': '品牌运营',
    'cs-center': '客服中心',
    'cs-online': '在线客服',
    'cs-hotline': '热线客服',
    'warehouse-center': '仓配中心',
    'warehouse-ops': '仓储运营',
    'logistics-ops': '物流调度',
  }

  const EMPLOYEE_ROLES = [
    '运营经理',
    '客服专员',
    '数据分析师',
    '产品经理',
    '开发工程师',
    '测试工程师',
    'UI 设计师',
    '仓储主管',
  ]

  const EMPLOYEE_SEEDS = [
    { name: '林晓峰', account: 'linxiaofeng', departmentKey: 'order-fulfill', role: '运营经理', phone: '13800000003' },
    { name: '周静怡', account: 'zhoujingyi', departmentKey: 'order-aftersale', role: '客服专员', phone: '13800000004' },
    { name: '马腾', account: 'mateng', departmentKey: 'order-center', role: '数据分析师', phone: '13800000005' },
    { name: '陈雨桐', account: 'chenyutong', departmentKey: 'product-center', role: '产品经理', phone: '13800000006' },
    { name: '张明远', account: 'zhangmingyuan', departmentKey: 'product-ops', role: '运营经理', phone: '13800000007' },
    { name: '刘思琪', account: 'liusiqi', departmentKey: 'category-mgmt', role: '数据分析师', phone: '13800000008' },
    { name: '赵晓彤', account: 'zhaoxiaotong', departmentKey: 'growth-ops', role: '运营经理', phone: '13800000009' },
    { name: '王浩然', account: 'wanghaoran', departmentKey: 'cs-online', role: '客服专员', phone: '13800000010' },
    { name: '李若溪', account: 'liruoxi', departmentKey: 'warehouse-ops', role: '仓储主管', phone: '13800000011' },
    { name: '孙嘉怡', account: 'sunjiayi', departmentKey: 'product-design', role: 'UI 设计师', phone: '13800000012' },
    { name: '吴承泽', account: 'wuchengze', departmentKey: 'brand-ops', role: '数据分析师', phone: '13800000013' },
    { name: '郑雅文', account: 'zhengyawen', departmentKey: 'cs-hotline', role: '客服专员', phone: '13800000014' },
    { name: '黄俊豪', account: 'huangjunhao', departmentKey: 'logistics-ops', role: '开发工程师', phone: '13800000015' },
    { name: '许梦琪', account: 'xumengqi', departmentKey: 'product-ops', role: '测试工程师', phone: '13800000016' },
    { name: '何子涵', account: 'heziihan', departmentKey: 'order-fulfill', role: '开发工程师', phone: '13800000017' },
    { name: '高一凡', account: 'gaoyifan', departmentKey: 'marketing-center', role: '运营经理', phone: '13800000018' },
    { name: '宋佳宁', account: 'songjianing', departmentKey: 'cs-center', role: '产品经理', phone: '13800000019' },
    { name: '邓启航', account: 'dengqihang', departmentKey: 'warehouse-center', role: '开发工程师', phone: '13800000020' },
  ]

  function employeeId(n) {
    return 'EMP' + pad(n, 5)
  }

  function createEmployee(i, seed) {
    const base = seed || {
      name: '员工' + (i + 1),
      account: 'user' + (i + 1),
      departmentKey: 'product-ops',
      role: EMPLOYEE_ROLES[i % EMPLOYEE_ROLES.length],
      phone: '138' + pad(rand(10000000, 99999999), 8),
    }
    return {
      id: employeeId(i + 1),
      name: base.name,
      account: base.account,
      departmentKey: base.departmentKey,
      department: DEPARTMENT_LABELS[base.departmentKey] || base.departmentKey,
      role: base.role,
      phone: base.phone,
      enabled: i % 7 !== 0,
      createdAt: daysAgoDate(rand(0, 365)),
    }
  }

  let employeeListAll = EMPLOYEE_SEEDS.map((seed, i) => createEmployee(i, seed))
  let employeeSeq = employeeListAll.length

  function collectDepartmentKeys(nodes, targetKey) {
    for (const node of nodes || []) {
      if (node.key === targetKey) {
        const keys = []
        const walk = (list) => {
          list.forEach((n) => {
            keys.push(n.key)
            if (n.children) walk(n.children)
          })
        }
        walk([node])
        return keys
      }
      const found = collectDepartmentKeys(node.children, targetKey)
      if (found) return found
    }
    return null
  }

  function filterEmployees(params) {
    let rows = employeeListAll.slice()
    if (!params) return rows
    if (params.departmentKeys && params.departmentKeys.length) {
      const set = new Set(params.departmentKeys)
      rows = rows.filter((r) => set.has(r.departmentKey))
    }
    if (params.name) {
      const kw = String(params.name).toLowerCase()
      rows = rows.filter((r) => String(r.name || '').toLowerCase().includes(kw))
    }
    if (params.account) {
      const kw = String(params.account).toLowerCase()
      rows = rows.filter((r) => String(r.account || '').toLowerCase().includes(kw))
    }
    if (params.phone) {
      rows = rows.filter((r) => String(r.phone || '').includes(String(params.phone)))
    }
    if (params.enabled === true || params.enabled === false) {
      rows = rows.filter((r) => r.enabled === params.enabled)
    }
    if (params.role) rows = rows.filter((r) => r.role === params.role)
    if (params.departmentKey) {
      const keys = collectDepartmentKeys(DEPARTMENT_TREE, params.departmentKey)
      if (keys) {
        const set = new Set(keys)
        rows = rows.filter((r) => set.has(r.departmentKey))
      }
    }
    if (params.keyword) {
      const kw = String(params.keyword).toLowerCase()
      rows = rows.filter(
        (r) =>
          String(r.name || '').toLowerCase().includes(kw) ||
          String(r.account || '').toLowerCase().includes(kw) ||
          String(r.phone || '').includes(kw) ||
          String(r.role || '').toLowerCase().includes(kw)
      )
    }
    if (params.createdTime && params.createdTime.length === 2) {
      const start = toDayStart(params.createdTime[0])
      const end = toDayEnd(params.createdTime[1])
      rows = rows.filter((r) => {
        const t = new Date(r.createdAt).getTime()
        return t >= start && t <= end
      })
    }
    return rows
  }

  function flattenDepartmentOptions(nodes, result) {
    const out = result || []
    ;(nodes || []).forEach((node) => {
      if (node.key !== 'hq') out.push({ label: node.title, value: node.key })
      if (node.children) flattenDepartmentOptions(node.children, out)
    })
    return out
  }

  function disableEmployees(ids) {
    const set = new Set(ids || [])
    let count = 0
    employeeListAll = employeeListAll.map((r) => {
      if (!set.has(r.id) || !r.enabled) return r
      count += 1
      return { ...r, enabled: false }
    })
    return count
  }

  function getEmployeeById(id) {
    return employeeListAll.find((r) => r.id === id) || null
  }

  function addEmployee(payload) {
    employeeSeq += 1
    const departmentKey = payload.departmentKey || 'order-center'
    const row = {
      id: employeeId(employeeSeq),
      name: payload.name || '新员工',
      account: payload.account || 'user' + employeeSeq,
      departmentKey,
      department: DEPARTMENT_LABELS[departmentKey] || departmentKey,
      role: payload.role || EMPLOYEE_ROLES[0],
      phone: payload.phone || '13800000000',
      enabled: payload.enabled !== false,
      createdAt: new Date().toISOString(),
    }
    employeeListAll.unshift(row)
    return row
  }

  function updateEmployee(id, payload) {
    const idx = employeeListAll.findIndex((r) => r.id === id)
    if (idx < 0) return null
    const next = { ...employeeListAll[idx], ...payload, id }
    if (payload.departmentKey) {
      next.department = DEPARTMENT_LABELS[payload.departmentKey] || payload.departmentKey
    }
    employeeListAll[idx] = next
    return next
  }

  function removeEmployee(id) {
    const before = employeeListAll.length
    employeeListAll = employeeListAll.filter((r) => r.id !== id)
    return employeeListAll.length < before
  }

  function removeEmployees(ids) {
    const set = new Set(ids || [])
    const before = employeeListAll.length
    employeeListAll = employeeListAll.filter((r) => !set.has(r.id))
    return before - employeeListAll.length
  }

  function toggleEmployeeEnabled(id, enabled) {
    const row = employeeListAll.find((r) => r.id === id)
    if (!row) return null
    row.enabled = enabled
    return row
  }

  const CONTRACT_TITLES = [
    '年度办公用品采购框架协议',
    '华东区数据中心托管服务合同',
    '品牌联合营销推广合作协议',
    '企业级 SaaS 订阅服务合同',
    '物流仓储外包服务协议',
    '知识产权许可使用合同',
    '设备维保年度服务合同',
    '云资源扩容采购合同',
    '员工商业保险团购协议',
    '展厅设计与搭建项目合同',
  ]

  const CONTRACT_PARTNERS = [
    '远景智联',
    '海纳供应链',
    '星澜传媒',
    '云栈科技',
    '速达物流',
    '智权法务',
    '鼎新设备',
    '极光云',
  ]

  const CONTRACT_OWNERS = ['林婉清', '张明远', '刘思琪', '陈浩然', '赵晓彤', '未指定']
  const CONTRACT_DEPARTMENTS = ['法务部', '采购部', '销售部', '财务部']
  const CONTRACT_LEGAL_REVIEWERS = ['周法务', '吴合规', '郑律师', '孙审计']
  const contractTypes = ['采购合同', '销售合同', '服务合同', '框架合同']
  const contractStatuses = ['草稿', '审批中', '已生效', '已到期']
  const contractPaymentMethods = ['一次性付款', '分期付款', '按月结算', '按里程碑']
  const contractRenewalTypes = ['不续签', '自动续签', '协商续签']

  function contractId(n) {
    return 'CT2026' + pad(n, 4)
  }

  function createContract(i) {
    const signedDays = rand(30, 400)
    return {
      id: contractId(i + 1),
      title: CONTRACT_TITLES[i % CONTRACT_TITLES.length],
      contractType: i % 4,
      amount: rand(8, 280) * 10000,
      department: CONTRACT_DEPARTMENTS[i % CONTRACT_DEPARTMENTS.length],
      partner: CONTRACT_PARTNERS[i % CONTRACT_PARTNERS.length],
      owner: CONTRACT_OWNERS[i % CONTRACT_OWNERS.length],
      signedAt: daysAgoDate(signedDays),
      expiryAt: daysAgoDate(signedDays - rand(180, 720)),
      status: i % 4,
      paymentMethod: i % 4,
      renewalType: i % 3,
      legalReviewer: CONTRACT_LEGAL_REVIEWERS[i % CONTRACT_LEGAL_REVIEWERS.length],
      projectCode: 'PRJ2026' + pad((i % 20) + 1, 3),
      archiveNo: 'ARC2026' + pad((i % 30) + 1, 4),
      description:
        '合同摘要：' +
        CONTRACT_TITLES[i % CONTRACT_TITLES.length] +
        '，约定交付周期与付款节点，待法务复核归档。',
    }
  }

  let contractListAll = Array.from({ length: 56 }, (_, i) => createContract(i))
  let contractSeq = contractListAll.length

  const CUSTOMER_NAMES = [
    '星河科技有限公司',
    '云启商贸集团',
    '北辰零售连锁',
    '青禾生鲜供应链',
    '澜海传媒工作室',
    '远景智联科技',
    '海纳供应链',
    '智权法务咨询',
    '鼎新设备制造',
    '极光云计算',
    '速达物流股份',
    '星澜数字营销',
  ]
  const CUSTOMER_CONTACTS = ['陈明', '林芳', '王磊', '赵雪', '周凯', '孙婷', '刘洋', '黄倩']
  const CUSTOMER_OWNERS = [
    '销售-张敏',
    '销售-李强',
    '销售-王芳',
    '销售-赵磊',
    '销售-陈晨',
    '销售-周宁',
    '未分配',
  ]
  const customerLevels = ['战略', '核心', '重点', '普通', '潜在', '观察']
  const customerIndustries = [
    '互联网',
    '制造',
    '零售',
    '金融',
    '物流',
    '传媒',
    '教育',
    '医疗',
    '地产',
    '能源',
  ]
  const customerStatuses = ['跟进中', '已成交', '已流失', '待分配', '公海', '无效']
  const customerSources = [
    '官网注册',
    '转介绍',
    '展会',
    '电销',
    '渠道合作',
    '广告投放',
    '社媒获客',
    '合作伙伴',
    '老客复购',
  ]
  const customerRegions = ['华东', '华南', '华北', '华中', '西南', '西北', '海外']
  const customerDealScales = [
    { label: '10 万以下', value: 'lt10' },
    { label: '10-50 万', value: '10-50' },
    { label: '50-100 万', value: '50-100' },
    { label: '100 万以上', value: 'gte100' },
  ]
  const customerFollowWindows = [
    { label: '近 7 天', value: '7' },
    { label: '近 30 天', value: '30' },
    { label: '近 90 天', value: '90' },
    { label: '超 90 天未跟进', value: 'over90' },
  ]

  function customerCrmId(n) {
    return 'CU2026' + pad(n, 4)
  }

  function createCustomerCrm(i) {
    return {
      id: customerCrmId(i + 1),
      name: CUSTOMER_NAMES[i % CUSTOMER_NAMES.length],
      shortName: CUSTOMER_NAMES[i % CUSTOMER_NAMES.length].replace(/(有限公司|集团|连锁|股份|工作室)$/, ''),
      level: i % customerLevels.length,
      industry: i % customerIndustries.length,
      status: i % customerStatuses.length,
      source: i % customerSources.length,
      region: i % customerRegions.length,
      contact: CUSTOMER_CONTACTS[i % CUSTOMER_CONTACTS.length],
      phone: '138' + pad((10000000 + i * 137) % 100000000, 8),
      owner: CUSTOMER_OWNERS[i % CUSTOMER_OWNERS.length],
      dealAmount: rand(3, 520) * 10000,
      lastFollowAt: daysAgoDate(rand(0, 120)),
      createdAt: daysAgoDate(rand(30, 400)),
      remark:
        '客户备注：' +
        CUSTOMER_NAMES[i % CUSTOMER_NAMES.length] +
        '，关注产品方案与商务条款，需持续跟进。',
    }
  }

  let customerCrmListAll = Array.from({ length: 64 }, (_, i) => createCustomerCrm(i))
  let customerCrmSeq = customerCrmListAll.length

  function matchDealScale(amount, scale) {
    const n = Number(amount) || 0
    if (scale === 'lt10') return n < 100000
    if (scale === '10-50') return n >= 100000 && n < 500000
    if (scale === '50-100') return n >= 500000 && n < 1000000
    if (scale === 'gte100') return n >= 1000000
    return true
  }

  function matchFollowWindow(iso, windowKey) {
    if (!iso || !windowKey) return true
    const days = (Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000)
    if (windowKey === '7') return days <= 7
    if (windowKey === '30') return days <= 30
    if (windowKey === '90') return days <= 90
    if (windowKey === 'over90') return days > 90
    return true
  }

  function filterCustomerCrmList(params) {
    let rows = customerCrmListAll.slice()
    if (!params) return rows
    if (hasSelectFilter(params.level))
      rows = rows.filter((r) => matchSelect(params.level, r.level))
    if (hasSelectFilter(params.industry))
      rows = rows.filter((r) => matchSelect(params.industry, r.industry))
    if (hasSelectFilter(params.status))
      rows = rows.filter((r) => matchSelect(params.status, r.status))
    if (hasSelectFilter(params.source))
      rows = rows.filter((r) => matchSelect(params.source, r.source))
    if (hasSelectFilter(params.region))
      rows = rows.filter((r) => matchSelect(params.region, r.region))
    if (params.owner) rows = rows.filter((r) => r.owner === params.owner)
    if (hasSelectFilter(params.dealScale))
      rows = rows.filter((r) => matchDealScale(r.dealAmount, params.dealScale))
    if (hasSelectFilter(params.followWindow))
      rows = rows.filter((r) => matchFollowWindow(r.lastFollowAt, params.followWindow))
    if (params.keyword) {
      const kw = String(params.keyword).toLowerCase()
      rows = rows.filter(
        (r) =>
          r.id.toLowerCase().includes(kw) ||
          r.name.toLowerCase().includes(kw) ||
          String(r.shortName || '')
            .toLowerCase()
            .includes(kw) ||
          String(r.contact || '')
            .toLowerCase()
            .includes(kw) ||
          String(r.phone || '').includes(kw) ||
          String(r.remark || '')
            .toLowerCase()
            .includes(kw)
      )
    }
    return rows
  }

  function getCustomerCrmById(id) {
    return customerCrmListAll.find((r) => r.id === id) || null
  }

  function addCustomerCrm(payload) {
    customerCrmSeq += 1
    const row = {
      id: customerCrmId(customerCrmSeq),
      name: payload.name || '新客户',
      shortName: payload.shortName || payload.name || '新客户',
      level: payload.level != null ? payload.level : 3,
      industry: payload.industry != null ? payload.industry : 0,
      status: payload.status != null ? payload.status : 0,
      source: payload.source != null ? payload.source : 0,
      region: payload.region != null ? payload.region : 0,
      contact: payload.contact || CUSTOMER_CONTACTS[0],
      phone: payload.phone || '13800000000',
      owner: payload.owner || CUSTOMER_OWNERS[CUSTOMER_OWNERS.length - 1],
      dealAmount: Number(payload.dealAmount) || 0,
      lastFollowAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      remark: payload.remark || '',
    }
    customerCrmListAll.unshift(row)
    return row
  }

  function updateCustomerCrm(id, payload) {
    const idx = customerCrmListAll.findIndex((r) => r.id === id)
    if (idx < 0) return null
    customerCrmListAll[idx] = { ...customerCrmListAll[idx], ...payload, id }
    return customerCrmListAll[idx]
  }

  function removeCustomerCrm(id) {
    const before = customerCrmListAll.length
    customerCrmListAll = customerCrmListAll.filter((r) => r.id !== id)
    return customerCrmListAll.length < before
  }

  function removeCustomerCrms(ids) {
    const set = new Set(ids || [])
    const before = customerCrmListAll.length
    customerCrmListAll = customerCrmListAll.filter((r) => !set.has(r.id))
    return before - customerCrmListAll.length
  }

  function filterContractList(params) {
    let rows = contractListAll.slice()
    if (!params) return rows
    if (params.id)
      rows = rows.filter((r) =>
        r.id.toLowerCase().includes(String(params.id).toLowerCase())
      )
    if (params.title)
      rows = rows.filter((r) =>
        r.title.toLowerCase().includes(String(params.title).toLowerCase())
      )
    if (hasSelectFilter(params.contractType))
      rows = rows.filter((r) => matchSelect(params.contractType, r.contractType))
    if (hasSelectFilter(params.status))
      rows = rows.filter((r) => matchSelect(params.status, r.status))
    if (params.department)
      rows = rows.filter((r) => r.department === params.department)
    if (params.partner)
      rows = rows.filter((r) => r.partner === params.partner)
    if (params.owner) rows = rows.filter((r) => r.owner === params.owner)
    if (params.keyword) {
      const kw = String(params.keyword).toLowerCase()
      rows = rows.filter(
        (r) =>
          String(r.title || '').toLowerCase().includes(kw) ||
          String(r.description || '').toLowerCase().includes(kw) ||
          String(r.partner || '').toLowerCase().includes(kw)
      )
    }
    if (params.signedTime && params.signedTime.length === 2) {
      const start = toDayStart(params.signedTime[0])
      const end = toDayEnd(params.signedTime[1])
      rows = rows.filter((r) => {
        const t = new Date(r.signedAt).getTime()
        return t >= start && t <= end
      })
    }
    if (params.expiryTime && params.expiryTime.length === 2) {
      const start = toDayStart(params.expiryTime[0])
      const end = toDayEnd(params.expiryTime[1])
      rows = rows.filter((r) => {
        const t = new Date(r.expiryAt).getTime()
        return t >= start && t <= end
      })
    }
    if (params.amountMin != null && params.amountMin !== '') {
      rows = rows.filter((r) => r.amount >= Number(params.amountMin))
    }
    if (params.amountMax != null && params.amountMax !== '') {
      rows = rows.filter((r) => r.amount <= Number(params.amountMax))
    }
    if (hasSelectFilter(params.paymentMethod))
      rows = rows.filter((r) => matchSelect(params.paymentMethod, r.paymentMethod))
    if (hasSelectFilter(params.renewalType))
      rows = rows.filter((r) => matchSelect(params.renewalType, r.renewalType))
    if (params.legalReviewer)
      rows = rows.filter((r) => r.legalReviewer === params.legalReviewer)
    if (params.projectCode)
      rows = rows.filter((r) =>
        String(r.projectCode || '')
          .toLowerCase()
          .includes(String(params.projectCode).toLowerCase())
      )
    if (params.archiveNo)
      rows = rows.filter((r) =>
        String(r.archiveNo || '')
          .toLowerCase()
          .includes(String(params.archiveNo).toLowerCase())
      )
    return rows
  }

  function getContractById(id) {
    return contractListAll.find((r) => r.id === id) || null
  }

  function addContract(payload) {
    contractSeq += 1
    const row = {
      id: contractId(contractSeq),
      title: payload.title || '未命名合同',
      contractType: payload.contractType ?? 0,
      amount: Number(payload.amount) || 0,
      department: payload.department || CONTRACT_DEPARTMENTS[0],
      partner: payload.partner || CONTRACT_PARTNERS[0],
      owner: payload.owner || '未指定',
      signedAt: payload.signedAt || new Date().toISOString(),
      expiryAt: payload.expiryAt || daysAgoDate(-365),
      status: payload.status ?? 0,
      description: payload.description || '',
    }
    contractListAll.unshift(row)
    return row
  }

  function updateContract(id, payload) {
    const idx = contractListAll.findIndex((r) => r.id === id)
    if (idx < 0) return null
    contractListAll[idx] = { ...contractListAll[idx], ...payload, id }
    return contractListAll[idx]
  }

  function removeContract(id) {
    const before = contractListAll.length
    contractListAll = contractListAll.filter((r) => r.id !== id)
    return contractListAll.length < before
  }

  function removeContracts(ids) {
    const set = new Set(ids || [])
    const before = contractListAll.length
    contractListAll = contractListAll.filter((r) => !set.has(r.id))
    return before - contractListAll.length
  }

  function expireContracts(ids) {
    const set = new Set(ids || [])
    let count = 0
    contractListAll = contractListAll.map((r) => {
      if (!set.has(r.id)) return r
      count += 1
      return { ...r, status: 3 }
    })
    return count
  }

  const cardListItems = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    title: CARD_TITLES[i % CARD_TITLES.length],
    desc: '这是一段描述文字，用于展示卡片列表的内容摘要。',
    tag: ['图文', '视频'][i % 2],
    count: rand(100, 9999),
    author: 'Admin',
    updatedAt: '2026-06-' + String(10 + (i % 18)).padStart(2, '0'),
  }))

  window.ArcoProMock = {
    get listTableAll() {
      return listTableAll
    },
    filterListTable,
    paginate,
    cardListItems,
    ticketTypes,
    priorities,
    statusLabels,
    assignees: ASSIGNEES,
    customers: CUSTOMERS,
    formatDateTime,
    /** @deprecated 兼容旧调用，等价 formatDateTime */
    formatCreatedTime(isoOrDays) {
      if (typeof isoOrDays === 'number') {
        const d = new Date()
        d.setDate(d.getDate() - isoOrDays)
        return formatDateTime(d.toISOString())
      }
      return formatDateTime(isoOrDays)
    },
    getTicketById,
    addTicket,
    updateTicket,
    removeTicket,
    removeTickets,
    closeTickets,
    departmentTree: DEPARTMENT_TREE,
    departmentLabels: DEPARTMENT_LABELS,
    employeeRoles: EMPLOYEE_ROLES,
    get employeeListAll() {
      return employeeListAll
    },
    filterEmployees,
    collectDepartmentKeys,
    getEmployeeById,
    addEmployee,
    updateEmployee,
    removeEmployee,
    removeEmployees,
    toggleEmployeeEnabled,
    disableEmployees,
    flattenDepartmentOptions,
    get contractListAll() {
      return contractListAll
    },
    contractTypes,
    contractStatuses,
    contractDepartments: CONTRACT_DEPARTMENTS,
    contractOwners: CONTRACT_OWNERS,
    contractPartners: CONTRACT_PARTNERS,
    contractPaymentMethods,
    contractRenewalTypes,
    contractLegalReviewers: CONTRACT_LEGAL_REVIEWERS,
    filterContractList,
    getContractById,
    addContract,
    updateContract,
    removeContract,
    removeContracts,
    expireContracts,
    get customerCrmListAll() {
      return customerCrmListAll
    },
    customerLevels,
    customerIndustries,
    customerStatuses,
    customerSources,
    customerRegions,
    customerDealScales,
    customerFollowWindows,
    customerOwners: CUSTOMER_OWNERS,
    filterCustomerCrmList,
    getCustomerCrmById,
    addCustomerCrm,
    updateCustomerCrm,
    removeCustomerCrm,
    removeCustomerCrms,
  }
})()
