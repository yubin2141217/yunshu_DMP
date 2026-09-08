;(function () {
  const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

  function formatDayLabel(date) {
    return `${date.getMonth() + 1}月${date.getDate()}日 ${WEEKDAYS[date.getDay()]}`
  }

  function addDays(base, n) {
    const d = new Date(base)
    d.setDate(d.getDate() + n)
    return d
  }

  function pad2(n) {
    return String(n).padStart(2, '0')
  }

  function formatBillDate(date) {
    return `${pad2(date.getHours())}:${pad2(date.getMinutes())} · ${date.getMonth() + 1}月${date.getDate()}日`
  }

  function billAt(offsetDays, hours, minutes) {
    const d = addDays(today, offsetDays)
    d.setHours(hours, minutes, 0, 0)
    return formatBillDate(d)
  }

  const today = new Date()
  const todayLabel = formatDayLabel(today)

  const scheduleItems = [
    {
      time: '09:30 - 10:15',
      subject: '产品评审',
      location: '增长一组 · 云会议室 A',
      status: 'active',
      statusLabel: '进行中',
    },
    {
      time: '10:30 - 11:15',
      subject: '接口联调',
      location: '平台二组 · 研发区 B3',
      status: 'upcoming',
      statusLabel: '即将开始',
    },
    {
      time: '13:00 - 13:45',
      subject: '设计走查',
      location: '体验设计 · 设计工坊',
      status: 'upcoming',
      statusLabel: '即将开始',
    },
    {
      time: '14:00 - 14:45',
      subject: '安全巡检',
      location: '基础设施 · 运维值班室',
      status: 'cancelled',
      statusLabel: '已取消',
    },
    {
      time: '16:00 - 16:45',
      subject: '版本发布',
      location: '发布窗口 · 发布大厅',
      status: 'upcoming',
      statusLabel: '即将开始',
    },
  ].map((item) => ({ ...item, dateLabel: todayLabel }))

  const upcomingEvents = [
    { dayOffset: 3, title: '新功能内测开放', time: '10:00 - 12:00', type: '产品' },
    { dayOffset: 5, title: '渠道合作洽谈', time: '14:30 - 16:00', type: '商务' },
    { dayOffset: 8, title: '季度全员分享会', time: '09:00 - 11:30', type: '内部' },
    { dayOffset: 11, title: '合规审计访谈', time: '13:00 - 15:00', type: '合规' },
    { dayOffset: 14, title: '客户成功圆桌', time: '15:00 - 17:00', type: '客户' },
  ].map((event) => {
    const d = addDays(today, event.dayOffset)
    return {
      ...event,
      monthLabel: `${d.getMonth() + 1}月`,
      dayLabel: String(d.getDate()),
    }
  })

  const upcomingBills = [
    { id: 1, title: '云主机弹性扩容费用', date: billAt(1, 9, 30), icon: 'fa-server' },
    { id: 2, title: '对象存储超额流量', date: billAt(3, 11, 0), icon: 'fa-cloud' },
    { id: 3, title: '短信验证码资源包', date: billAt(7, 16, 20), icon: 'fa-comment' },
    { id: 4, title: 'CDN 加速流量结算', date: billAt(9, 10, 15), icon: 'fa-globe' },
    { id: 5, title: '日志审计服务月费', date: billAt(12, 8, 0), icon: 'fa-file-lines' },
  ]

  function sameDay(a, b) {
    return (
      a &&
      b &&
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    )
  }

  function dayKey(date) {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
  }

  function timeRangeFrom(start, durationMinutes) {
    const [h, m] = start.split(':').map(Number)
    const startTotal = h * 60 + m
    const endTotal = startTotal + (durationMinutes || 60)
    return `${pad2(h)}:${pad2(m)}-${pad2(Math.floor(endTotal / 60) % 24)}:${pad2(endTotal % 60)}`
  }

  const AGENDA_TAG_CLASS = {
    工作: 'is-work',
    设计: 'is-design',
    行政: 'is-admin',
    内容: 'is-content',
    规划: 'is-plan',
  }

  const TASK_TAG_CLASS = {
    工作: 'is-work',
    设计: 'is-design',
    行政: 'is-admin',
    内容: 'is-content',
    规划: 'is-plan',
    会议: 'is-work',
    任务: 'is-plan',
  }

  const agendaWeekdays = ['一', '二', '三', '四', '五', '六', '日']

  function mapTodoSeed(items) {
    return items.map((item) => {
      const date = addDays(today, item.dayOffset)
      return {
        ...item,
        timeRange: timeRangeFrom(item.time, 60),
        dateKey: dayKey(date),
      }
    })
  }

  const agendaTodosSeed = mapTodoSeed([
    { id: 1, title: '敲定第二季度路线图', tag: '工作', time: '17:00', due: '今天 17:00', dayOffset: 0, done: false },
    { id: 2, title: '审阅设计系统更新', tag: '设计', time: '14:30', due: '今天 14:30', dayOffset: 0, done: false },
    { id: 3, title: '回复重要邮件', tag: '行政', time: '11:00', due: '今天 11:00', dayOffset: 0, done: true },
    { id: 4, title: '规划本周内容产出', tag: '内容', time: '10:00', due: '今天 10:00', dayOffset: 0, done: false },
    { id: 5, title: '准备周会纪要', tag: '规划', time: '16:00', due: '今天 16:00', dayOffset: 0, done: false },
    { id: 6, title: '同步产品需求变更记录', tag: '工作', time: '15:00', due: '明天 15:00', dayOffset: 1, done: false },
    { id: 7, title: '验收仪表盘交互改版', tag: '设计', time: '11:30', due: '后天 11:30', dayOffset: 2, done: false },
    { id: 8, title: '归档上月报销凭证', tag: '行政', time: '12:00', due: '周五 12:00', dayOffset: 4, done: false },
    { id: 9, title: '撰写功能发布公告草案', tag: '内容', time: '09:00', due: '下周一 09:00', dayOffset: 7, done: false },
  ])

  const dayTasksSeed = mapTodoSeed([
    { id: 1, title: '敲定第二季度路线图', tag: '工作', time: '17:00', due: '今天 17:00', dayOffset: 0, done: false },
    { id: 2, title: '审阅设计系统更新', tag: '设计', time: '14:30', due: '今天 14:30', dayOffset: 0, done: false },
    { id: 3, title: '回复重要邮件', tag: '行政', time: '11:00', due: '今天 11:00', dayOffset: 0, done: true },
    { id: 4, title: '规划本周内容产出', tag: '内容', time: '10:00', due: '今天 10:00', dayOffset: 0, done: false },
    { id: 5, title: '准备周会纪要', tag: '规划', time: '16:00', due: '今天 16:00', dayOffset: 0, done: false },
    { id: 10, title: '核对接口联调进度', tag: '工作', time: '18:30', due: '今天 18:30', dayOffset: 0, done: false },
    { id: 11, title: '整理明日评审材料', tag: '规划', time: '19:00', due: '今天 19:00', dayOffset: 0, done: false },
    { id: 6, title: '同步产品需求变更记录', tag: '工作', time: '15:00', due: '明天 15:00', dayOffset: 1, done: false },
    { id: 7, title: '验收仪表盘交互改版', tag: '设计', time: '11:30', due: '后天 11:30', dayOffset: 2, done: false },
    { id: 8, title: '归档上月报销凭证', tag: '行政', time: '12:00', due: '周五 12:00', dayOffset: 4, done: false },
    { id: 9, title: '撰写功能发布公告草案', tag: '内容', time: '09:00', due: '下周一 09:00', dayOffset: 7, done: false },
  ])

  const STRIP_WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

  const stripScheduleSeed = [
    { id: 's1', category: '会议', title: '参加部门例会', timeRange: '09:30-10:30', dayOffset: 0 },
    { id: 's2', category: '任务', title: '处理客户投诉', timeRange: '10:30-11:30', dayOffset: 0 },
    { id: 's3', category: '会议', title: '产品需求评审会', timeRange: '13:00-14:00', dayOffset: 0 },
    { id: 's4', category: '任务', title: '项目进度汇报', timeRange: '14:00-15:00', dayOffset: 0 },
    { id: 's5', category: '会议', title: '团队周会讨论', timeRange: '15:00-16:00', dayOffset: 0 },
    { id: 's6', category: '任务', title: '客户需求分析', timeRange: '16:00-17:00', dayOffset: 0 },
    { id: 's7', category: '会议', title: '技术方案评审', timeRange: '17:00-18:00', dayOffset: 0 },
    { id: 's8', category: '任务', title: '跟进交付清单', timeRange: '09:00-10:00', dayOffset: -1 },
    { id: 's9', category: '会议', title: '晨会同步', timeRange: '09:30-10:00', dayOffset: 1 },
    { id: 's10', category: '任务', title: '整理周报草稿', timeRange: '14:00-15:30', dayOffset: 2 },
    { id: 's11', category: '会议', title: '设计走查', timeRange: '11:00-12:00', dayOffset: -2 },
    { id: 's12', category: '任务', title: '更新接口文档', timeRange: '16:00-17:00', dayOffset: 3 },
  ].map((item) => {
    const date = addDays(today, item.dayOffset)
    return {
      ...item,
      dateKey: dayKey(date),
    }
  })

  const ListComponentPage = {
    name: 'ListComponentPage',
    data() {
      const selected = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const taskChecked = {}
      dayTasksSeed.forEach((item) => {
        taskChecked[item.id] = !!item.done
      })
      return {
        agendaWeekdays,
        agendaMonth: new Date(today.getFullYear(), today.getMonth(), 1),
        agendaSelected: selected,
        agendaTodos: agendaTodosSeed,
        dayTasks: dayTasksSeed,
        stripSchedules: stripScheduleSeed,
        stripStart: addDays(today, -3),
        stripSelected: new Date(selected),
        taskMonth: new Date(today.getFullYear(), today.getMonth(), 1),
        taskSelected: new Date(selected),
        taskChecked,
        rankScroll: {
          contract: { offset: 0, index: 0, animating: true, resetting: false },
          category: { offset: 0, index: 0, animating: true, resetting: false },
          store: { offset: 0, index: 0, animating: true, resetting: false },
        },
        basicItems: [
          { tag: '系统', tone: 'primary', title: '系统将于今晚 23:00 进行例行维护', time: '2026-08-12 09:30' },
          { tag: '活动', tone: 'success', title: '八月会员日活动报名已开放', time: '2026-08-12 14:20' },
          { tag: '安全', tone: 'warning', title: '检测到异常登录，请及时确认', time: '2026-08-13 10:05' },
          { tag: '公告', tone: 'gray', title: '隐私政策条款已更新，请查阅', time: '2026-08-13 16:40' },
          { tag: '系统', tone: 'primary', title: '消息推送服务已恢复正常', time: '2026-08-14 11:15' },
          { tag: '告警', tone: 'danger', title: '存储容量使用率超过 85%', time: '2026-08-14 18:50' },
          { tag: '活动', tone: 'success', title: '新品体验官招募将于周五截止', time: '2026-08-15 09:10' },
          { tag: '系统', tone: 'primary', title: '账单导出任务已完成，可下载', time: '2026-08-15 13:40' },
          { tag: '安全', tone: 'warning', title: '建议开启二次验证保护账号', time: '2026-08-16 08:25' },
          { tag: '公告', tone: 'gray', title: '客服热线服务时间调整通知', time: '2026-08-16 15:00' },
          { tag: '活动', tone: 'success', title: '邀请好友可得双倍积分奖励', time: '2026-08-17 10:30' },
          { tag: '告警', tone: 'danger', title: '3 条工单即将超时，请尽快处理', time: '2026-08-17 17:20' },
        ],
        pagePagination: {
          current: 1,
          pageSize: 6,
          total: 12,
        },
        taskItems: [
          {
            title: '完成首页改版视觉验收',
            time: '2026-08-18 09:30',
            tone: 'cyan',
            user: '张小刚',
            avatar: '张',
            color: '#86909C',
          },
          {
            title: '整理本周缺陷回归清单',
            time: '2026-08-18 14:00',
            tone: 'warning',
            user: '李晓雯',
            avatar: '李',
            color: '#F77234',
          },
          {
            title: '同步渠道投放周报数据',
            time: '2026-08-19 10:15',
            tone: 'cyan',
            user: '王立群',
            avatar: '王',
            color: '#0FC6C2',
          },
          {
            title: '确认灰度放量观察指标',
            time: '2026-08-19 16:40',
            tone: 'cyan',
            user: '陈思远',
            avatar: '陈',
            color: '#165DFF',
          },
        ],
        ticketItems: [
          {
            tag: '投诉',
            tagTone: 'warning',
            title: '小区广场舞问题投诉',
            time: '01-22 11:20',
            status: '待处理',
            statusTone: 'warning',
          },
          {
            tag: '投诉',
            tagTone: 'warning',
            title: '小区噪音扰民问题投诉',
            time: '01-22 11:20',
            status: '待处理',
            statusTone: 'warning',
          },
          {
            tag: '报修',
            tagTone: 'primary',
            title: '小区北门入口门禁损坏',
            time: '01-22 11:20',
            status: '已超时',
            statusTone: 'danger',
          },
          {
            tag: '报修',
            tagTone: 'primary',
            title: '小区停车位置地面损坏',
            time: '01-22 11:20',
            status: '已超时',
            statusTone: 'danger',
          },
          {
            tag: '报修',
            tagTone: 'primary',
            title: '小区绿化带喷灌设备故障',
            time: '01-22 11:20',
            status: '已超时',
            statusTone: 'danger',
          },
          {
            tag: '登记',
            tagTone: 'cyan',
            title: '小区访客车辆临时登记',
            time: '01-22 11:20',
            status: '已完成',
            statusTone: 'cyan',
          },
          {
            tag: '登记',
            tagTone: 'cyan',
            title: '小区快递柜异常登记',
            time: '01-22 11:20',
            status: '已完成',
            statusTone: 'cyan',
          },
        ],
        tagItems: [
          { tag: '缺陷', tone: 'danger', title: '修复登录页验证码偶发失效', time: '2026-08-16 09:20' },
          { tag: '需求', tone: 'warning', title: '整理本周新增需求澄清清单', time: '2026-08-16 14:00' },
          { tag: '发布', tone: 'primary', title: '确认灰度放量至 30%', time: '2026-08-17 11:30' },
          { tag: '数据', tone: 'success', title: '核对漏斗转化异常波动', time: '2026-08-17 16:00' },
          { tag: '缺陷', tone: 'danger', title: '排查导出任务超时问题', time: '2026-08-15 21:10' },
          { tag: '协作', tone: 'gray', title: '同步设计稿标注变更说明', time: '2026-08-18 10:00' },
          { tag: '运维', tone: 'cyan', title: '更新告警值班通讯录', time: '2026-08-18 15:40' },
        ],
        scheduleItems,
        upcomingEvents,
        upcomingBills,
        metaItems: [
          {
            title: '王立群 完成了「支付结算」模块联调',
            desc: '已提交测试环境，等待验收。',
            time: '刚刚',
            icon: 'fa-credit-card',
            color: '#165DFF',
          },
          {
            title: '李晓雯 更新了用户增长看板',
            desc: '新增渠道转化漏斗与留存对比。',
            time: '12 分钟前',
            icon: 'fa-chart-line',
            color: '#0FC6C2',
          },
          {
            title: '陈思远 关闭了 3 条客服工单',
            desc: '涉及发票开具与物流查询。',
            time: '1 小时前',
            icon: 'fa-headset',
            color: '#F77234',
          },
          {
            title: '赵敏 发布了站点公告',
            desc: '本周六 02:00–04:00 系统维护。',
            time: '昨天 18:20',
            icon: 'fa-bullhorn',
            color: '#722ED1',
          },
          {
            title: '周杰 提交了灰度放量申请',
            desc: '目标流量 20%，观察窗口 48 小时。',
            time: '昨天 15:40',
            icon: 'fa-rocket',
            color: '#F7BA1E',
          },
          {
            title: '孙婷 同步了客服话术模板',
            desc: '覆盖退款协商与物流异常场景。',
            time: '前天 11:05',
            icon: 'fa-comments',
            color: '#F5319D',
          },
        ],
        splitItems: [
          {
            title: '产品设计组',
            desc: '负责交互与视觉规范',
            members: 8,
            color: '#165DFF',
          },
          {
            title: '前端研发组',
            desc: '负责中后台与组件库',
            members: 12,
            color: '#0FC6C2',
          },
          {
            title: '后端研发组',
            desc: '负责接口与数据服务',
            members: 15,
            color: '#F7BA1E',
          },
          {
            title: '质量保障组',
            desc: '负责测试与发布卡点',
            members: 6,
            color: '#F5319D',
          },
          {
            title: '数据智能组',
            desc: '负责指标口径与看板分析',
            members: 9,
            color: '#722ED1',
          },
          {
            title: '客户成功组',
            desc: '负责续约跟进与使用辅导',
            members: 11,
            color: '#3491FA',
          },
        ],
        rankContractItems: [
          { rank: 1, name: '张伟', percent: 100, amount: '12,800', share: '16.7', tone: 'gold' },
          { rank: 2, name: '李娜', percent: 91, amount: '11,600', share: '15.1', tone: 'silver' },
          { rank: 3, name: '郭建国', percent: 78, amount: '10,000', share: '13.0', tone: 'bronze' },
          { rank: 4, name: '董铭', percent: 68, amount: '8,700', share: '11.3', tone: 'normal' },
          { rank: 5, name: '吕凤杰', percent: 59, amount: '7,500', share: '9.8', tone: 'normal' },
          { rank: 6, name: '郑海波', percent: 51, amount: '6,500', share: '8.5', tone: 'normal' },
          { rank: 7, name: '陈西凡', percent: 45, amount: '5,800', share: '7.6', tone: 'normal' },
          { rank: 8, name: '王涛', percent: 41, amount: '5,200', share: '6.8', tone: 'normal' },
          { rank: 9, name: '赵敏', percent: 36, amount: '4,600', share: '6.0', tone: 'normal' },
          { rank: 10, name: '周杰', percent: 31, amount: '4,000', share: '5.2', tone: 'normal' },
        ],
        rankStoreItems: [
          { rank: 1, name: '星砺达科技有限公司', percent: 100, amount: '8,500', share: '14.7' },
          { rank: 2, name: '科思科技有限公司', percent: 88, amount: '7,500', share: '12.9' },
          { rank: 3, name: '科彤科技有限公司', percent: 82, amount: '7,000', share: '12.1' },
          { rank: 4, name: '达荣科技有限公司', percent: 76, amount: '6,500', share: '11.2' },
          { rank: 5, name: '融智兴科技有限公司', percent: 71, amount: '6,000', share: '10.3' },
          { rank: 6, name: '启航数智有限公司', percent: 65, amount: '5,500', share: '9.5' },
          { rank: 7, name: '云启互联有限公司', percent: 59, amount: '5,000', share: '8.6' },
          { rank: 8, name: '瀚海信息有限公司', percent: 53, amount: '4,500', share: '7.8' },
          { rank: 9, name: '拓新智造有限公司', percent: 47, amount: '4,000', share: '6.9' },
          { rank: 10, name: '晟达科技有限公司', percent: 41, amount: '3,500', share: '6.0' },
        ],
        rankCategoryItems: [
          { name: '食品酒类', value: '5,500', percent: 100, share: '14.1', top: 1 },
          { name: '清洁用品', value: '5,200', percent: 95, share: '13.3', top: 2 },
          { name: '家用电器', value: '5,000', percent: 91, share: '12.8', top: 3 },
          { name: '时尚箱包', value: '4,800', percent: 87, share: '12.3', top: 4 },
          { name: '服饰美妆', value: '4,500', percent: 82, share: '11.5', top: 5 },
          { name: '计生情趣', value: '3,600', percent: 65, share: '9.2', top: 6 },
          { name: '数码配件', value: '3,200', percent: 58, share: '8.2', top: 7 },
          { name: '母婴用品', value: '2,800', percent: 51, share: '7.2', top: 8 },
          { name: '运动户外', value: '2,400', percent: 44, share: '6.2', top: 9 },
          { name: '家居日用', value: '2,000', percent: 36, share: '5.1', top: 10 },
        ],
      }
    },
    computed: {
      pagedBasicItems() {
        const start = (this.pagePagination.current - 1) * this.pagePagination.pageSize
        return this.basicItems.slice(start, start + this.pagePagination.pageSize)
      },
      agendaTitle() {
        const y = this.agendaMonth.getFullYear()
        const m = pad2(this.agendaMonth.getMonth() + 1)
        return `${y}年${m}月`
      },
      agendaCells() {
        return this.buildCalendarCells(this.agendaMonth, this.agendaSelected, this.agendaTodos)
      },
      selectedAgendaTodos() {
        const key = dayKey(this.agendaSelected)
        return this.agendaTodos.filter((item) => item.dateKey === key)
      },
      taskTitle() {
        const y = this.taskMonth.getFullYear()
        const m = pad2(this.taskMonth.getMonth() + 1)
        return `${y}年${m}月`
      },
      taskCells() {
        return this.buildCalendarCells(this.taskMonth, this.taskSelected, this.dayTasks)
      },
      selectedDayTasks() {
        const key = dayKey(this.taskSelected)
        return this.dayTasks.filter((item) => item.dateKey === key)
      },
      stripDays() {
        const marked = {}
        this.stripSchedules.forEach((item) => {
          marked[item.dateKey] = true
        })
        const days = []
        for (let i = 0; i < 7; i += 1) {
          const date = addDays(this.stripStart, i)
          const key = dayKey(date)
          days.push({
            key,
            date,
            day: pad2(date.getDate()),
            weekday: STRIP_WEEKDAYS[date.getDay()],
            selected: sameDay(date, this.stripSelected),
            isToday: sameDay(date, today),
            hasEvent: !!marked[key],
          })
        }
        return days
      },
      selectedStripSchedules() {
        const key = dayKey(this.stripSelected)
        return this.stripSchedules.filter((item) => item.dateKey === key)
      },
    },
    methods: {
      buildCalendarCells(monthDate, selectedDate, items) {
        const year = monthDate.getFullYear()
        const month = monthDate.getMonth()
        const first = new Date(year, month, 1)
        const startOffset = (first.getDay() + 6) % 7
        const start = new Date(year, month, 1 - startOffset)
        const marked = {}
        ;(items || []).forEach((item) => {
          marked[item.dateKey] = true
        })
        const cells = []
        for (let i = 0; i < 42; i += 1) {
          const date = addDays(start, i)
          const key = dayKey(date)
          cells.push({
            key,
            day: pad2(date.getDate()),
            date,
            muted: date.getMonth() !== month,
            selected: sameDay(date, selectedDate),
            hasEvent: !!marked[key],
          })
        }
        return cells
      },
      agendaTagClass(tag) {
        return AGENDA_TAG_CLASS[tag] || 'is-work'
      },
      taskTagClass(tag) {
        return TASK_TAG_CLASS[tag] || 'is-work'
      },
      isTaskDone(id) {
        return !!this.taskChecked[id]
      },
      onTaskCheck(id, value) {
        this.taskChecked[id] = !!value
      },
      shiftAgendaMonth(delta) {
        const d = new Date(this.agendaMonth)
        d.setMonth(d.getMonth() + delta)
        this.agendaMonth = d
      },
      shiftAgendaYear(delta) {
        const d = new Date(this.agendaMonth)
        d.setFullYear(d.getFullYear() + delta)
        this.agendaMonth = d
      },
      selectAgendaDay(cell) {
        this.agendaSelected = new Date(
          cell.date.getFullYear(),
          cell.date.getMonth(),
          cell.date.getDate()
        )
        if (cell.muted) {
          this.agendaMonth = new Date(cell.date.getFullYear(), cell.date.getMonth(), 1)
        }
      },
      goAgendaToday() {
        const now = new Date()
        this.agendaSelected = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        this.agendaMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      },
      shiftTaskMonth(delta) {
        const d = new Date(this.taskMonth)
        d.setMonth(d.getMonth() + delta)
        this.taskMonth = d
      },
      shiftTaskYear(delta) {
        const d = new Date(this.taskMonth)
        d.setFullYear(d.getFullYear() + delta)
        this.taskMonth = d
      },
      selectTaskDay(cell) {
        this.taskSelected = new Date(
          cell.date.getFullYear(),
          cell.date.getMonth(),
          cell.date.getDate()
        )
        if (cell.muted) {
          this.taskMonth = new Date(cell.date.getFullYear(), cell.date.getMonth(), 1)
        }
      },
      goTaskToday() {
        const now = new Date()
        this.taskSelected = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        this.taskMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      },
      shiftStrip(delta) {
        this.stripStart = addDays(this.stripStart, delta)
      },
      selectStripDay(day) {
        this.stripSelected = new Date(
          day.date.getFullYear(),
          day.date.getMonth(),
          day.date.getDate()
        )
      },
      onAction(action, item) {
        if (window.ArcoVue && ArcoVue.Message) {
          ArcoVue.Message.info(action + '：' + item.title)
        }
      },
      onTip(message) {
        if (window.ArcoVue && ArcoVue.Message) {
          ArcoVue.Message.info(message)
        }
      },
      onPageChange(current) {
        this.pagePagination.current = current
      },
      startRankScroll() {
        this.stopRankScroll()
        this._rankScrollTimer = window.setInterval(() => {
          this.stepRankScroll('contract')
          this.stepRankScroll('category')
          this.stepRankScroll('store')
        }, 2200)
      },
      stopRankScroll() {
        if (this._rankScrollTimer) {
          window.clearInterval(this._rankScrollTimer)
          this._rankScrollTimer = null
        }
      },
      pauseRankScroll() {
        this.stopRankScroll()
      },
      resumeRankScroll() {
        this.startRankScroll()
      },
      getRankScrollStep(key) {
        const meta = {
          contract: { ref: 'contractRankTrack', itemSel: '.component-list-rank-table-row' },
          category: { ref: 'categoryRankTrack', itemSel: '.component-list-rank-progress-item' },
          store: { ref: 'storeRankTrack', itemSel: '.component-list-rank-store-row' },
        }[key]
        if (!meta) return 0
        const track = this.$refs[meta.ref]
        if (!track) return 0
        const first = track.querySelector(meta.itemSel)
        if (!first) return 0
        const gap = parseFloat(getComputedStyle(track).rowGap || getComputedStyle(track).gap) || 0
        return first.offsetHeight + gap
      },
      stepRankScroll(key) {
        const itemsKey = {
          contract: 'rankContractItems',
          category: 'rankCategoryItems',
          store: 'rankStoreItems',
        }[key]
        const state = this.rankScroll[key]
        const items = this[itemsKey]
        if (!state || !items) return

        const step = this.getRankScrollStep(key)
        if (!step) return

        const visibleCount = 6
        const maxIndex = Math.max(0, items.length - visibleCount)
        state.animating = true

        if (state.index >= maxIndex) {
          state.resetting = true
          state.index = 0
          state.offset = 0
          return
        }

        state.resetting = false
        state.index += 1
        state.offset = state.index * step
      },
    },
    mounted() {
      this.$nextTick(() => this.startRankScroll())
    },
    beforeUnmount() {
      this.stopRankScroll()
    },
    template: `
      <div class="component-showcase-page">
        <a-alert
          class="component-showcase-tip"
          type="info"
          show-icon
          :closable="false"
        >
          本页汇总中后台常见列表形态：分类待办、日程事项、账单通知、任务工单、操作动态、团队协作、日程待办，以及底部排行榜。复杂业务场景请参考「页面模板」。
        </a-alert>

        <a-row :gutter="[16, 16]" class="component-list-demo-row">
          <a-col :xs="24" :lg="8">
            <a-card class="pro-page-card component-showcase-card component-list-demo-card">
              <div class="component-showcase-group-title">分类待办</div>
              <ul class="component-list-tag">
                <li v-for="(item, i) in tagItems" :key="i" class="component-list-tag-item">
                  <span class="component-list-tag-badge" :class="'is-' + item.tone">{{ item.tag }}</span>
                  <span class="component-list-tag-title">{{ item.title }}</span>
                  <span class="component-list-tag-time">{{ item.time }}</span>
                </li>
              </ul>
            </a-card>
          </a-col>

          <a-col :xs="24" :lg="8">
            <a-card class="pro-page-card component-showcase-card component-list-demo-card">
              <div class="component-list-card-head">
                <a-typography-title :heading="6" class="component-list-card-title">今日日程</a-typography-title>
                <span class="component-list-card-link" @click="onTip('查看完整日程（演示）')">
                  查看完整日程 <icon-right />
                </span>
              </div>
              <div class="component-list-schedule">
                <div v-for="item in scheduleItems" :key="item.time" class="component-list-schedule-row">
                  <div class="component-list-schedule-top">
                    <div class="component-list-schedule-time-wrap">
                      <div class="component-list-schedule-bar" :class="'is-' + item.status" aria-hidden="true"></div>
                      <div>
                        <div class="component-list-schedule-time">{{ item.time }}</div>
                        <div class="component-list-schedule-date">{{ item.dateLabel }}</div>
                      </div>
                    </div>
                    <span class="component-list-schedule-status" :class="'is-' + item.status">{{ item.statusLabel }}</span>
                  </div>
                  <div class="component-list-schedule-body">
                    <div class="component-list-schedule-subject">{{ item.subject }}</div>
                    <div class="component-list-schedule-location">{{ item.location }}</div>
                  </div>
                </div>
              </div>
            </a-card>
          </a-col>

          <a-col :xs="24" :lg="8">
            <a-card class="pro-page-card component-showcase-card component-list-demo-card">
              <div class="component-list-card-head">
                <a-typography-title :heading="6" class="component-list-card-title">近期日程</a-typography-title>
                <span class="component-list-card-link" @click="onTip('查看全部日程（演示）')">
                  查看全部 <icon-right />
                </span>
              </div>
              <div class="component-list-events">
                <div v-for="event in upcomingEvents" :key="event.title" class="component-list-event">
                  <div class="component-list-event-main">
                    <div class="component-list-event-date">
                      <div class="component-list-event-month">{{ event.monthLabel }}</div>
                      <div class="component-list-event-day">{{ event.dayLabel }}</div>
                    </div>
                    <div class="component-list-event-text">
                      <div class="component-list-event-title">{{ event.title }}</div>
                      <div class="component-list-event-time">{{ event.time }}</div>
                    </div>
                  </div>
                  <span class="component-list-event-type">{{ event.type }}</span>
                </div>
              </div>
            </a-card>
          </a-col>

          <a-col :xs="24" :lg="8">
            <a-card class="pro-page-card component-showcase-card component-list-demo-card">
              <a-typography-title :heading="6" class="component-list-card-title">待付账单</a-typography-title>
              <div class="component-list-bill-list">
                <div
                  v-for="bill in upcomingBills"
                  :key="bill.id"
                  class="component-list-bill-item"
                  @click="onTip(bill.title)"
                >
                  <div class="component-list-bill-icon">
                    <i class="pro-fa-icon fa-sharp fa-light" :class="bill.icon"></i>
                  </div>
                  <div class="component-list-bill-body">
                    <p class="component-list-bill-name">{{ bill.title }}</p>
                    <p class="component-list-bill-date">{{ bill.date }}</p>
                  </div>
                  <icon-right class="component-list-bill-chevron" />
                </div>
              </div>
            </a-card>
          </a-col>

          <a-col :xs="24" :lg="8">
            <a-card class="pro-page-card component-showcase-card component-list-demo-card">
              <div class="component-showcase-group-title">通知分页</div>
              <ul class="component-list-tag component-list-page-list">
                <li v-for="(item, i) in pagedBasicItems" :key="i" class="component-list-tag-item">
                  <span class="component-list-page-tag" :class="'is-' + item.tone">{{ item.tag }}</span>
                  <span class="component-list-tag-title">{{ item.title }}</span>
                  <span class="component-list-tag-time">{{ item.time }}</span>
                </li>
              </ul>
              <div class="component-list-page-footer">
                <a-pagination
                  v-model:current="pagePagination.current"
                  :total="pagePagination.total"
                  :page-size="pagePagination.pageSize"
                  size="small"
                  @change="onPageChange"
                />
              </div>
            </a-card>
          </a-col>

          <a-col :xs="24" :lg="8">
            <a-card class="pro-page-card component-showcase-card component-list-demo-card">
              <div class="component-showcase-group-title">指派任务</div>
              <div class="component-list-task">
                <div
                  v-for="(item, i) in taskItems"
                  :key="i"
                  class="component-list-task-item"
                >
                  <span class="component-list-task-bar" :class="'is-' + item.tone" aria-hidden="true"></span>
                  <div class="component-list-task-body">
                    <div class="component-list-task-title">{{ item.title }}</div>
                    <div class="component-list-task-time">
                      <i class="pro-fa-icon fa-sharp fa-light fa-clock" aria-hidden="true"></i>
                      <span>{{ item.time }}</span>
                    </div>
                  </div>
                  <div class="component-list-task-user">
                    <a-avatar :size="32" :style="{ backgroundColor: item.color }">{{ item.avatar }}</a-avatar>
                    <span class="component-list-task-name">{{ item.user }}</span>
                  </div>
                </div>
              </div>
            </a-card>
          </a-col>

          <a-col :xs="24" :lg="8">
            <a-card class="pro-page-card component-showcase-card component-list-demo-card">
              <div class="component-showcase-group-title">社区工单</div>
              <div class="component-list-ticket">
                <div
                  v-for="(item, i) in ticketItems"
                  :key="i"
                  class="component-list-ticket-item"
                >
                  <span class="component-list-ticket-tag" :class="'is-' + item.tagTone">{{ item.tag }}</span>
                  <div class="component-list-ticket-body">
                    <div class="component-list-ticket-title">{{ item.title }}</div>
                    <div class="component-list-ticket-time">
                      <i class="pro-fa-icon fa-sharp fa-light fa-clock" aria-hidden="true"></i>
                      <span>{{ item.time }}</span>
                    </div>
                  </div>
                  <span class="component-list-ticket-status" :class="'is-' + item.statusTone">
                    <i class="component-list-ticket-dot" aria-hidden="true"></i>
                    {{ item.status }}
                  </span>
                </div>
              </div>
            </a-card>
          </a-col>

          <a-col :xs="24" :lg="8">
            <a-card class="pro-page-card component-showcase-card component-list-demo-card">
              <div class="component-showcase-group-title">操作动态</div>
              <a-list :bordered="false" class="component-list-meta">
                <a-list-item v-for="(item, i) in metaItems" :key="i">
                  <a-list-item-meta>
                    <template #avatar>
                      <a-avatar :size="36" class="pro-avatar-brand component-list-meta-avatar" :style="{ backgroundColor: item.color }">
                        <i class="pro-fa-icon fa-sharp fa-light" :class="item.icon" aria-hidden="true"></i>
                      </a-avatar>
                    </template>
                    <template #title>{{ item.title }}</template>
                    <template #description>{{ item.desc }}</template>
                  </a-list-item-meta>
                  <template #actions>
                    <a-typography-text type="secondary">{{ item.time }}</a-typography-text>
                  </template>
                </a-list-item>
              </a-list>
            </a-card>
          </a-col>

          <a-col :xs="24" :lg="8">
            <a-card class="pro-page-card component-showcase-card component-list-demo-card">
              <div class="component-showcase-group-title">组织团队</div>
              <a-list :bordered="false" class="component-list-split">
                <a-list-item v-for="(item, i) in splitItems" :key="i">
                  <a-list-item-meta :title="item.title" :description="item.desc">
                    <template #avatar>
                      <a-avatar :size="40" :style="{ backgroundColor: item.color }">
                        {{ item.title.slice(0, 1) }}
                      </a-avatar>
                    </template>
                  </a-list-item-meta>
                  <template #actions>
                    <a-typography-text type="secondary">{{ item.members }} 人</a-typography-text>
                    <a-button type="text" size="small" @click="onAction('进入', item)">进入</a-button>
                  </template>
                </a-list-item>
              </a-list>
            </a-card>
          </a-col>

          <a-col :xs="24" :lg="8">
            <a-card class="pro-page-card component-showcase-card component-list-demo-card">
              <div class="component-list-agenda">
                <div class="component-list-agenda-head">
                  <h3 class="component-list-agenda-title">日程待办</h3>
                </div>

                <div class="component-list-agenda-cal">
                  <div class="component-list-agenda-nav">
                    <div class="component-list-agenda-nav-group">
                      <button
                        type="button"
                        class="component-list-agenda-nav-btn"
                        aria-label="上一年"
                        @click="shiftAgendaYear(-1)"
                      >
                        <icon-double-left />
                      </button>
                      <button
                        type="button"
                        class="component-list-agenda-nav-btn"
                        aria-label="上一月"
                        @click="shiftAgendaMonth(-1)"
                      >
                        <icon-left />
                      </button>
                    </div>
                    <div class="component-list-agenda-label">{{ agendaTitle }}</div>
                    <div class="component-list-agenda-nav-group">
                      <button
                        type="button"
                        class="component-list-agenda-nav-btn"
                        aria-label="下一月"
                        @click="shiftAgendaMonth(1)"
                      >
                        <icon-right />
                      </button>
                      <button
                        type="button"
                        class="component-list-agenda-nav-btn"
                        aria-label="下一年"
                        @click="shiftAgendaYear(1)"
                      >
                        <icon-double-right />
                      </button>
                    </div>
                  </div>

                  <div class="component-list-agenda-weekdays">
                    <span v-for="day in agendaWeekdays" :key="day">{{ day }}</span>
                  </div>

                  <div class="component-list-agenda-grid">
                    <button
                      v-for="cell in agendaCells"
                      :key="cell.key + (cell.muted ? '-m' : '')"
                      type="button"
                      class="component-list-agenda-cell"
                      :class="{
                        'is-muted': cell.muted,
                        'is-selected': cell.selected,
                        'has-event': cell.hasEvent,
                      }"
                      @click="selectAgendaDay(cell)"
                    >
                      <span class="component-list-agenda-day">{{ cell.day }}</span>
                    </button>
                  </div>
                </div>

                <div class="component-list-agenda-list-head">
                  <h4 class="component-list-agenda-list-title">待办事项</h4>
                  <div class="component-list-agenda-list-actions">
                    <button type="button" class="component-list-agenda-link" @click="goAgendaToday">
                      <icon-refresh />
                      <span>返回今日</span>
                    </button>
                    <button
                      type="button"
                      class="component-list-agenda-link"
                      @click="onTip('新建待办（演示）')"
                    >
                      <icon-plus-circle />
                      <span>新建待办</span>
                    </button>
                  </div>
                </div>

                <div class="component-list-agenda-list">
                  <button
                    v-for="item in selectedAgendaTodos"
                    :key="item.id"
                    type="button"
                    class="component-list-agenda-item"
                    @click="onTip(item.title)"
                  >
                    <span
                      class="component-list-agenda-tag"
                      :class="agendaTagClass(item.tag)"
                    >{{ item.tag }}</span>
                    <div class="component-list-agenda-item-body">
                      <div class="component-list-agenda-item-title">{{ item.title }}</div>
                      <div class="component-list-agenda-item-time">{{ item.timeRange }}</div>
                    </div>
                    <span class="component-list-agenda-item-chevron" aria-hidden="true">
                      <icon-right />
                    </span>
                  </button>
                  <div v-if="!selectedAgendaTodos.length" class="component-list-agenda-empty">
                    当日暂无待办
                  </div>
                </div>
              </div>
            </a-card>
          </a-col>

          <a-col :xs="24" :lg="8">
            <a-card class="pro-page-card component-showcase-card component-list-demo-card">
              <div class="component-list-day-tasks">
                <div class="component-list-day-tasks-head">
                  <h3 class="component-list-day-tasks-title">任务列表</h3>
                </div>

                <div class="component-list-agenda-cal">
                  <div class="component-list-agenda-nav">
                    <div class="component-list-agenda-nav-group">
                      <button
                        type="button"
                        class="component-list-agenda-nav-btn"
                        aria-label="上一年"
                        @click="shiftTaskYear(-1)"
                      >
                        <icon-double-left />
                      </button>
                      <button
                        type="button"
                        class="component-list-agenda-nav-btn"
                        aria-label="上一月"
                        @click="shiftTaskMonth(-1)"
                      >
                        <icon-left />
                      </button>
                    </div>
                    <div class="component-list-agenda-label">{{ taskTitle }}</div>
                    <div class="component-list-agenda-nav-group">
                      <button
                        type="button"
                        class="component-list-agenda-nav-btn"
                        aria-label="下一月"
                        @click="shiftTaskMonth(1)"
                      >
                        <icon-right />
                      </button>
                      <button
                        type="button"
                        class="component-list-agenda-nav-btn"
                        aria-label="下一年"
                        @click="shiftTaskYear(1)"
                      >
                        <icon-double-right />
                      </button>
                    </div>
                  </div>

                  <div class="component-list-agenda-weekdays">
                    <span v-for="day in agendaWeekdays" :key="'task-' + day">{{ day }}</span>
                  </div>

                  <div class="component-list-agenda-grid">
                    <button
                      v-for="cell in taskCells"
                      :key="'task-' + cell.key + (cell.muted ? '-m' : '')"
                      type="button"
                      class="component-list-agenda-cell"
                      :class="{
                        'is-muted': cell.muted,
                        'is-selected': cell.selected,
                        'has-event': cell.hasEvent,
                      }"
                      @click="selectTaskDay(cell)"
                    >
                      <span class="component-list-agenda-day">{{ cell.day }}</span>
                    </button>
                  </div>
                </div>

                <div class="component-list-agenda-list-head">
                  <h4 class="component-list-agenda-list-title">任务事项</h4>
                  <div class="component-list-agenda-list-actions">
                    <button type="button" class="component-list-agenda-link" @click="goTaskToday">
                      <icon-refresh />
                      <span>返回今日</span>
                    </button>
                    <button
                      type="button"
                      class="component-list-agenda-link"
                      @click="onTip('新建任务（演示）')"
                    >
                      <icon-plus-circle />
                      <span>新建任务</span>
                    </button>
                  </div>
                </div>

                <ul class="component-list-check-tasks">
                  <li
                    v-for="task in selectedDayTasks"
                    :key="task.id"
                    class="component-list-check-task"
                    :class="{ 'is-done': isTaskDone(task.id) }"
                  >
                    <a-checkbox
                      class="component-list-check-task-box"
                      :model-value="isTaskDone(task.id)"
                      @change="(v) => onTaskCheck(task.id, v)"
                    />
                    <div class="component-list-check-task-body">
                      <div class="component-list-check-task-main">
                        <span class="component-list-check-task-title">{{ task.title }}</span>
                        <span
                          class="component-list-check-task-tag"
                          :class="taskTagClass(task.tag)"
                        >{{ task.tag }}</span>
                      </div>
                      <div class="component-list-check-task-due">
                        <icon-clock-circle />
                        <span>{{ task.time }}</span>
                      </div>
                    </div>
                  </li>
                  <li v-if="!selectedDayTasks.length" class="component-list-check-task-empty">
                    当日暂无任务
                  </li>
                </ul>
              </div>
            </a-card>
          </a-col>

          <a-col :xs="24" :lg="8">
            <a-card class="pro-page-card component-showcase-card component-list-demo-card">
              <div class="component-list-strip-agenda">
                <div class="component-list-strip-agenda-head">
                  <h3 class="component-list-strip-agenda-title">待办日程</h3>
                  <span class="component-list-card-link" @click="onTip('查看全部日程（演示）')">
                    全部 <icon-right />
                  </span>
                </div>

                <div class="component-list-strip-bar">
                  <button
                    type="button"
                    class="component-list-strip-nav"
                    aria-label="上一周"
                    @click="shiftStrip(-7)"
                  >
                    <icon-left />
                  </button>
                  <div class="component-list-strip-days">
                    <button
                      v-for="day in stripDays"
                      :key="day.key"
                      type="button"
                      class="component-list-strip-day"
                      :class="{
                        'is-selected': day.selected,
                        'is-today': day.isToday,
                        'has-event': day.hasEvent,
                      }"
                      @click="selectStripDay(day)"
                    >
                      <span v-if="day.isToday" class="component-list-strip-today-label">今日</span>
                      <span class="component-list-strip-day-num">{{ day.day }}</span>
                      <span class="component-list-strip-day-week">{{ day.weekday }}</span>
                      <span class="component-list-strip-day-dot" aria-hidden="true"></span>
                    </button>
                  </div>
                  <button
                    type="button"
                    class="component-list-strip-nav"
                    aria-label="下一周"
                    @click="shiftStrip(7)"
                  >
                    <icon-right />
                  </button>
                </div>

                <div class="component-list-strip-timeline">
                  <div
                    v-for="item in selectedStripSchedules"
                    :key="item.id"
                    class="component-list-strip-item"
                    @click="onTip(item.title)"
                  >
                    <span class="component-list-strip-item-dot" aria-hidden="true"></span>
                    <div class="component-list-strip-item-card">
                      <div class="component-list-strip-item-body">
                        <div class="component-list-strip-item-title">{{ item.title }}</div>
                        <div class="component-list-strip-item-time">
                          <icon-clock-circle />
                          <span>{{ item.timeRange }}</span>
                        </div>
                      </div>
                      <span
                        class="component-list-check-task-tag"
                        :class="taskTagClass(item.category)"
                      >{{ item.category }}</span>
                    </div>
                  </div>
                  <div v-if="!selectedStripSchedules.length" class="component-list-strip-empty">
                    当日暂无日程
                  </div>
                </div>
              </div>
            </a-card>
          </a-col>

          <a-col :xs="24" :lg="8">
            <a-card class="pro-page-card component-showcase-card component-list-demo-card">
              <div class="component-showcase-group-title">合同金额排行</div>
              <div class="component-list-rank-table">
                <div class="component-list-rank-table-head">
                  <span class="component-list-rank-col is-rank">#</span>
                  <span class="component-list-rank-col is-name">姓名</span>
                  <span class="component-list-rank-col is-compare">对比</span>
                  <span class="component-list-rank-col is-amount">合同金额</span>
                  <span class="component-list-rank-col is-share">占比</span>
                </div>
                <div
                  class="component-list-rank-table-body is-scroll"
                  @mouseenter="pauseRankScroll"
                  @mouseleave="resumeRankScroll"
                >
                  <div
                    ref="contractRankTrack"
                    class="component-list-rank-scroll-track"
                    :class="{
                      'is-animating': rankScroll.contract.animating,
                      'is-resetting': rankScroll.contract.resetting,
                    }"
                    :style="{ transform: 'translateY(-' + rankScroll.contract.offset + 'px)' }"
                  >
                    <div
                      v-for="item in rankContractItems"
                      :key="'contract-' + item.rank"
                      class="component-list-rank-table-row"
                    >
                      <span class="component-list-rank-col is-rank">
                        <span class="component-list-rank-badge is-square" :class="'is-' + item.tone">
                          {{ item.rank }}
                        </span>
                      </span>
                      <span class="component-list-rank-col is-name">{{ item.name }}</span>
                      <span class="component-list-rank-col is-compare">
                        <span class="component-list-rank-bar is-solid">
                          <span class="component-list-rank-bar-fill" :style="{ width: item.percent + '%' }"></span>
                        </span>
                      </span>
                      <span class="component-list-rank-col is-amount">{{ item.amount }}</span>
                      <span class="component-list-rank-col is-share">{{ item.share }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </a-card>
          </a-col>

          <a-col :xs="24" :lg="8">
            <a-card class="pro-page-card component-showcase-card component-list-demo-card">
              <div class="component-showcase-group-title">品类销量排行</div>
              <div
                class="component-list-rank-progress is-scroll"
                ref="categoryRankViewport"
                @mouseenter="pauseRankScroll"
                @mouseleave="resumeRankScroll"
              >
                <div
                  ref="categoryRankTrack"
                  class="component-list-rank-progress-track"
                  :class="{
                    'is-animating': rankScroll.category.animating,
                    'is-resetting': rankScroll.category.resetting,
                  }"
                  :style="{ transform: 'translateY(-' + rankScroll.category.offset + 'px)' }"
                >
                  <div
                    v-for="item in rankCategoryItems"
                    :key="'category-' + item.top"
                    class="component-list-rank-progress-item"
                  >
                    <div class="component-list-rank-progress-meta">
                      <span class="component-list-rank-progress-label-wrap">
                        <span
                          class="component-list-rank-top"
                          :class="item.top <= 3 ? 'is-hot' : 'is-primary'"
                        >TOP{{ item.top }}</span>
                        <span class="component-list-rank-progress-label">{{ item.name }}</span>
                      </span>
                      <span class="component-list-rank-progress-value">
                        <span class="component-list-rank-progress-amount">{{ item.value }}</span>
                        <span class="component-list-rank-progress-share">{{ item.share }}%</span>
                      </span>
                    </div>
                    <span class="component-list-rank-bar is-pill">
                      <span class="component-list-rank-bar-fill" :style="{ width: item.percent + '%' }"></span>
                    </span>
                  </div>
                </div>
              </div>
            </a-card>
          </a-col>

          <a-col :xs="24" :lg="8">
            <a-card class="pro-page-card component-showcase-card component-list-demo-card">
              <div class="component-showcase-group-title">门店成交排行</div>
              <div class="component-list-rank-store">
                <div class="component-list-rank-store-head">
                  <span class="component-list-rank-col is-rank">排名</span>
                  <span class="component-list-rank-col is-name">门店名称</span>
                  <span class="component-list-rank-col is-amount">成交金额</span>
                  <span class="component-list-rank-col is-share">占比</span>
                </div>
                <div
                  class="component-list-rank-store-body is-scroll"
                  @mouseenter="pauseRankScroll"
                  @mouseleave="resumeRankScroll"
                >
                  <div
                    ref="storeRankTrack"
                    class="component-list-rank-scroll-track"
                    :class="{
                      'is-animating': rankScroll.store.animating,
                      'is-resetting': rankScroll.store.resetting,
                    }"
                    :style="{ transform: 'translateY(-' + rankScroll.store.offset + 'px)' }"
                  >
                    <div
                      v-for="item in rankStoreItems"
                      :key="'store-' + item.rank"
                      class="component-list-rank-store-row"
                    >
                      <span class="component-list-rank-col is-rank">
                        <span
                          class="component-list-rank-badge is-circle"
                          :class="{
                            'is-gold': item.rank === 1,
                            'is-silver': item.rank === 2,
                            'is-bronze': item.rank === 3,
                          }"
                        >{{ item.rank }}</span>
                      </span>
                      <span class="component-list-rank-col is-name">{{ item.name }}</span>
                      <span class="component-list-rank-col is-amount">{{ item.amount }}</span>
                      <span class="component-list-rank-col is-share">{{ item.share }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </div>
    `,
  }

  mountProPage({
    pageKey: 'component/list',
    title: ArcoProLocale.menu['menu.component.list'] || '列表组件',
    pageComponent: ListComponentPage,
  })
})()
