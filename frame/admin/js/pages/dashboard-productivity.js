;(function () {
  const t = {
    pageTitle: '效率协作',
    pageDesc: '任务、项目与专注时间',
    greetingMorning: '早上好。',
    greetingAfternoon: '下午好。',
    greetingEvening: '晚上好。',
    greetingNight: '夜深了。',
    greetingSub: '祝你今天高效而充实。',
    greetingSubNight: '早点休息，照顾好自己。',
    summaryToday: '今日',
    summaryTodayDesc: '项已排程',
    summaryWeek: '本周',
    summaryWeekDesc: '进度',
    summaryFocus: '专注',
    summaryFocusValue: '深度工作',
    summaryFocusDesc: '模式',
    goals: '本周目标',
    activity: '协作动态',
    projects: '项目列表',
    quickActions: '快捷操作',
    focus: '专注',
    focusStart: '开始',
    focusDnd: '免打扰 · 全专注模式',
    focusQuote: '微小而持续的行动，会带来巨大的成果。',
    focusQuoteSub: '坚持出现，你可以的。',
    recentNotes: '最近笔记',
    weekly: '本周',
    viewAll: '查看全部',
    weeklyCopy: '进展不错，继续保持节奏。',
    weeklyGoal: '6 个目标已完成 4 个',
    create: '新建',
    filterActive: '进行中',
    filterPlanning: '规划中',
    filterCompleted: '已完成',
    actionNote: '新建笔记',
    actionNoteDesc: '快速记录灵感与会议要点',
    actionTask: '新建任务',
    actionTaskDesc: '创建待办并设置截止时间',
    actionProject: '新建项目',
    actionProjectDesc: '立项并跟踪阶段进度',
    actionGoal: '新建目标',
    actionGoalDesc: '设定本周目标与完成指标',
    actionUpload: '上传文件',
    actionUploadDesc: '上传附件到当前工作区',
    actionFocus: '开启专注',
    actionFocusDesc: '进入免打扰深度工作模式',
    duePrefix: '截止',
    noteToday: '今天',
    noteYesterday: '昨天',
    scheduleTitle: '日程待办',
    scheduleTodos: '待办事项',
    scheduleBackToday: '返回今日',
    scheduleNew: '新建待办',
    scheduleWeekdays: ['一', '二', '三', '四', '五', '六', '日'],
  }

  const TAG_CLASS = {
    工作: 'prod-tag--work',
    设计: 'prod-tag--design',
    行政: 'prod-tag--admin',
    内容: 'prod-tag--content',
    规划: 'prod-tag--plan',
  }

  const STATUS_CLASS = {
    进行中: 'prod-tag--status-active',
    规划中: 'prod-tag--status-planning',
    已完成: 'prod-tag--status-done',
  }

  function addDays(base, n) {
    const d = new Date(base)
    d.setDate(d.getDate() + n)
    return d
  }

  function formatMd(date) {
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }

  const today = new Date()

  const summaryItems = [
    { title: t.summaryToday, value: '4', description: t.summaryTodayDesc, icon: 'icon-clock-circle' },
    { title: t.summaryWeek, value: '66%', description: t.summaryWeekDesc, icon: 'icon-trending-up' },
    {
      title: t.summaryFocus,
      value: t.summaryFocusValue,
      description: t.summaryFocusDesc,
      icon: 'icon-fire',
    },
  ]

  const tasks = [
    { title: '敲定第二季度路线图', tag: '工作', due: '今天 17:00', done: false },
    { title: '审阅设计系统更新', tag: '设计', due: '今天 14:30', done: false },
    { title: '回复重要邮件', tag: '行政', due: '今天 11:00', done: true },
    { title: '规划本周内容产出', tag: '内容', due: '今天 10:00', done: false },
    { title: '准备周会纪要', tag: '规划', due: '今天 16:00', done: false },
    { title: '同步产品需求变更记录', tag: '工作', due: '明天 15:00', done: false },
    { title: '验收仪表盘交互改版', tag: '设计', due: '后天 11:30', done: false },
    { title: '归档上月报销凭证', tag: '行政', due: '周五 12:00', done: false },
    { title: '撰写功能发布公告草案', tag: '内容', due: '下周一 09:00', done: false },
  ]

  const weekGoals = [
    {
      title: '完成路线图评审与对齐',
      tag: '工作',
      progress: 72,
      meta: '剩余 2 项关键',
      icon: 'icon-apps',
    },
    {
      title: '设计系统关键组件合入',
      tag: '设计',
      progress: 45,
      meta: '进行中',
      icon: 'icon-palette',
    },
    {
      title: '发布两篇产品更新说明',
      tag: '内容',
      progress: 50,
      meta: '已完成 1 / 2',
      icon: 'icon-file',
    },
    {
      title: '深度工作累计 10 小时',
      tag: '规划',
      progress: 80,
      meta: '已完成 8 小时',
      icon: 'icon-fire',
    },
    {
      title: '完成客户访谈纪要整理',
      tag: '行政',
      progress: 35,
      meta: '已完成 3 / 8',
      icon: 'icon-file',
    },
    {
      title: '推进灰度放量至 30%',
      tag: '工作',
      progress: 60,
      meta: '观察窗口进行中',
      icon: 'icon-trending-up',
    },
  ].map((g) => ({ ...g, percent: g.progress / 100 }))

  const activityItems = [
    {
      avatar: '王',
      color: '#722ED1',
      title: '发布了项目 Arco Design System',
      desc: '企业级产品设计系统',
      time: '刚刚',
    },
    {
      avatar: '你',
      color: '#86909C',
      title: '完成了待办 回复重要邮件',
      desc: '行政事务',
      time: '10 分钟前',
    },
    {
      avatar: '赵',
      color: '#3491FA',
      title: '评论了设计稿 首页改版视觉验收',
      desc: '体验设计',
      time: '35 分钟前',
    },
    {
      avatar: '孙',
      color: '#00B42A',
      title: '提交了缺陷 导出任务超时问题',
      desc: '质量保障',
      time: '1 小时前',
    },
    {
      avatar: '李',
      color: '#165DFF',
      title: '回复了问题 如何进行主题配置？',
      desc: '需要提供一个可配置主题色的功能，主题色可...',
      time: '2 小时前',
    },
    {
      avatar: '钱',
      color: '#F7BA1E',
      title: '同步了需求 渠道投放周报数据',
      desc: '增长运营',
      time: '3 小时前',
    },
    {
      avatar: '周',
      color: '#F5319D',
      title: '更新了项目进度 第二季度路线图',
      desc: '产品规划',
      time: '昨天',
    },
    {
      avatar: '陈',
      color: '#0FC6C2',
      title: '分享了文章 Vue3 + TS 最佳实践',
      desc: '前端开发',
      time: '2 天前',
    },
    {
      avatar: '林',
      color: '#F77234',
      title: '新建了项目 Vue Components',
      desc: '组件库',
      time: '3 天前',
    },
    {
      avatar: '郑',
      color: '#D91AD9',
      title: '邀请你加入 客户成功手册',
      desc: '知识沉淀',
      time: '5 天前',
    },
  ]

  const projects = [
    {
      title: '第二季度路线图',
      status: '进行中',
      filter: 'active',
      description: '更好、更聪明地交付。',
      dueOffset: 9,
      icon: 'icon-apps',
    },
    {
      title: '网站改版',
      status: '规划中',
      filter: 'planning',
      description: '简洁、现代、快速。',
      dueOffset: 21,
      icon: 'icon-link',
    },
    {
      title: '入职流程',
      status: '规划中',
      filter: 'planning',
      description: '精简首次使用步骤。',
      dueOffset: 18,
      icon: 'icon-check-circle',
    },
    {
      title: '数据看板整合',
      status: '进行中',
      filter: 'active',
      description: '统一核心指标与筛选体验。',
      dueOffset: 24,
      icon: 'icon-chart-area',
    },
    {
      title: '移动端体验优化',
      status: '已完成',
      filter: 'completed',
      description: '提升小屏下的浏览与操作效率。',
      dueOffset: -3,
      icon: 'icon-mobile',
    },
    {
      title: '客户成功手册',
      status: '规划中',
      filter: 'planning',
      description: '沉淀常见问题与最佳实践。',
      dueOffset: 30,
      icon: 'icon-user-group',
    },
  ].map((p) => ({
    ...p,
    due: `${t.duePrefix} ${formatMd(addDays(today, p.dueOffset))}`,
  }))

  const quickActions = [
    { title: t.actionNote, desc: t.actionNoteDesc, icon: 'icon-file' },
    { title: t.actionTask, desc: t.actionTaskDesc, icon: 'icon-check-circle' },
    { title: t.actionProject, desc: t.actionProjectDesc, icon: 'icon-apps' },
    { title: t.actionGoal, desc: t.actionGoalDesc, icon: 'icon-fire' },
    { title: t.actionUpload, desc: t.actionUploadDesc, icon: 'icon-upload' },
    { title: t.actionFocus, desc: t.actionFocusDesc, icon: 'icon-clock-circle' },
  ]

  function pad2(n) {
    return String(n).padStart(2, '0')
  }

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

  function dueTimeRange(due, durationMinutes) {
    const m = String(due).match(/(\d{1,2}):(\d{2})\s*$/)
    if (!m) return '09:00-10:00'
    const startH = Number(m[1])
    const startM = Number(m[2])
    const startTotal = startH * 60 + startM
    const endTotal = startTotal + (durationMinutes || 60)
    const endH = Math.floor(endTotal / 60) % 24
    const endM = endTotal % 60
    return `${pad2(startH)}:${pad2(startM)}-${pad2(endH)}:${pad2(endM)}`
  }

  function dueDayOffset(due, base) {
    const text = String(due)
    if (text.startsWith('今天')) return 0
    if (text.startsWith('明天')) return 1
    if (text.startsWith('后天')) return 2
    if (text.startsWith('周五')) {
      const diff = 5 - base.getDay()
      return diff >= 0 ? diff : diff + 7
    }
    if (text.startsWith('下周一')) {
      const diff = 1 - base.getDay()
      return diff > 0 ? diff : diff + 7
    }
    return 0
  }

  const scheduleTodosSeed = tasks.map((task, index) => {
    const dayOffset = dueDayOffset(task.due, today)
    const date = addDays(today, dayOffset)
    return {
      id: index + 1,
      timeRange: dueTimeRange(task.due, 60),
      title: task.title,
      tag: task.tag,
      dayOffset,
      dateKey: dayKey(date),
    }
  })

  const ProductivityPage = {
    name: 'ProductivityDashboardPage',
    data() {
      const selected = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      return {
        t,
        summaryItems,
        weekGoals,
        activityItems,
        projects,
        quickActions,
        projectFilter: 'active',
        calendarMonth: new Date(today.getFullYear(), today.getMonth(), 1),
        calendarSelected: selected,
        scheduleTodos: scheduleTodosSeed,
      }
    },
    computed: {
      greeting() {
        const hour = new Date().getHours()
        if (hour < 5) return t.greetingNight
        if (hour < 12) return t.greetingMorning
        if (hour < 18) return t.greetingAfternoon
        if (hour < 22) return t.greetingEvening
        return t.greetingNight
      },
      greetingSub() {
        const hour = new Date().getHours()
        if (hour < 5 || hour >= 22) return t.greetingSubNight
        return t.greetingSub
      },
      calendarTitle() {
        const y = this.calendarMonth.getFullYear()
        const m = pad2(this.calendarMonth.getMonth() + 1)
        return `${y}年${m}月`
      },
      calendarCells() {
        const year = this.calendarMonth.getFullYear()
        const month = this.calendarMonth.getMonth()
        const first = new Date(year, month, 1)
        const startOffset = (first.getDay() + 6) % 7
        const start = new Date(year, month, 1 - startOffset)
        const marked = {}
        this.scheduleTodos.forEach((item) => {
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
            selected: sameDay(date, this.calendarSelected),
            hasEvent: !!marked[key],
          })
        }
        return cells
      },
      selectedScheduleTodos() {
        const key = dayKey(this.calendarSelected)
        return this.scheduleTodos.filter((item) => item.dateKey === key)
      },
    },
    methods: {
      tagClass(tag) {
        return TAG_CLASS[tag] || 'prod-tag--work'
      },
      statusClass(status) {
        return STATUS_CLASS[status] || 'prod-tag--status-active'
      },
      shiftCalendarMonth(delta) {
        const d = new Date(this.calendarMonth)
        d.setMonth(d.getMonth() + delta)
        this.calendarMonth = d
      },
      shiftCalendarYear(delta) {
        const d = new Date(this.calendarMonth)
        d.setFullYear(d.getFullYear() + delta)
        this.calendarMonth = d
      },
      selectCalendarDay(cell) {
        this.calendarSelected = new Date(
          cell.date.getFullYear(),
          cell.date.getMonth(),
          cell.date.getDate()
        )
        if (cell.muted) {
          this.calendarMonth = new Date(cell.date.getFullYear(), cell.date.getMonth(), 1)
        }
      },
      goCalendarToday() {
        const now = new Date()
        this.calendarSelected = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        this.calendarMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      },
      onScheduleTip(action) {
        if (window.ArcoVue && ArcoVue.Message) {
          ArcoVue.Message.info(`${action}（演示）`)
        }
      },
    },
    template: `
      <div class="prod-page">
        <div class="prod-greeting">
          <h3 class="prod-greeting-title">{{ greeting }}</h3>
          <p class="prod-greeting-sub">{{ greetingSub }}</p>
        </div>

        <div class="prod-layout">
          <div class="prod-main">
            <div class="prod-summary-grid">
              <a-card
                v-for="item in summaryItems"
                :key="item.title"
                class="prod-card general-card"
                :bordered="true"
              >
                <div class="prod-summary">
                  <div class="prod-summary-body">
                    <div class="prod-summary-head">
                      <span class="prod-summary-icon">
                        <component :is="item.icon" />
                      </span>
                      <span class="prod-summary-title">{{ item.title }}</span>
                    </div>
                    <div class="prod-summary-value">{{ item.value }}</div>
                    <p class="prod-summary-desc">{{ item.description }}</p>
                  </div>
                  <icon-right class="prod-summary-arrow" />
                </div>
              </a-card>
            </div>

            <section class="prod-section">
              <div class="prod-section-head">
                <h2 class="prod-section-title">{{ t.projects }}</h2>
                <div class="prod-section-actions">
                  <a-select v-model="projectFilter" size="small">
                    <a-option value="active">{{ t.filterActive }}</a-option>
                    <a-option value="planning">{{ t.filterPlanning }}</a-option>
                    <a-option value="completed">{{ t.filterCompleted }}</a-option>
                  </a-select>
                </div>
              </div>
              <div class="prod-project-panel">
                <div class="prod-project-grid">
                  <div
                    v-for="project in projects"
                    :key="project.title"
                    class="prod-project-card"
                  >
                    <div class="prod-project-top">
                      <div class="prod-project-title">
                        <span class="prod-project-icon">
                          <component :is="project.icon" />
                        </span>
                        <span>{{ project.title }}</span>
                      </div>
                      <a-tag
                        size="small"
                        bordered
                        class="prod-tag"
                        :class="statusClass(project.status)"
                      >
                        {{ project.status }}
                      </a-tag>
                    </div>
                    <p class="prod-project-desc">{{ project.description }}</p>
                    <div class="prod-project-foot">
                      <icon-calendar />
                      <span>{{ project.due }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section class="prod-section">
              <div class="prod-section-head">
                <h2 class="prod-section-title">{{ t.goals }}</h2>
              </div>
              <div class="prod-goal-list">
                <a-card
                  v-for="goal in weekGoals"
                  :key="goal.title"
                  class="prod-card prod-goal-card general-card"
                >
                  <div class="prod-goal-top">
                    <div class="prod-goal-title">
                      <span class="prod-goal-icon">
                        <component :is="goal.icon" />
                      </span>
                      <span>{{ goal.title }}</span>
                    </div>
                    <a-tag size="small" bordered class="prod-tag" :class="tagClass(goal.tag)">
                      {{ goal.tag }}
                    </a-tag>
                  </div>
                  <div class="prod-goal-progress">
                    <a-progress
                      :percent="goal.percent"
                      :show-text="false"
                      :stroke-width="8"
                      color="var(--chart-1)"
                    />
                    <span class="prod-goal-pct">{{ goal.progress }}%</span>
                  </div>
                  <div class="prod-goal-meta">{{ goal.meta }}</div>
                </a-card>
              </div>
            </section>

            <section class="prod-section">
              <div class="prod-section-head">
                <h2 class="prod-section-title">{{ t.activity }}</h2>
                <a-button type="text" size="mini" class="prod-activity-more">
                  {{ t.viewAll }}
                  <icon-right />
                </a-button>
              </div>
              <div class="prod-activity-list">
                <div
                  v-for="(item, idx) in activityItems"
                  :key="idx"
                  class="prod-activity-item"
                >
                  <a-avatar :size="36" class="prod-activity-avatar" :style="{ backgroundColor: item.color }">
                    {{ item.avatar }}
                  </a-avatar>
                  <div class="prod-activity-body">
                    <p class="prod-activity-title">{{ item.title }}</p>
                    <p class="prod-activity-desc">{{ item.desc }}</p>
                  </div>
                  <div class="prod-activity-time">{{ item.time }}</div>
                </div>
              </div>
            </section>
          </div>

          <aside class="prod-side">
            <a-card class="prod-card prod-schedule-card general-card">
              <div class="prod-schedule-head">
                <h3 class="prod-schedule-title">{{ t.scheduleTitle }}</h3>
              </div>

              <div class="prod-mini-cal">
                <div class="prod-mini-cal-nav">
                  <div class="prod-mini-cal-nav-group">
                    <button
                      type="button"
                      class="prod-mini-cal-btn"
                      aria-label="上一年"
                      @click="shiftCalendarYear(-1)"
                    >
                      <icon-double-left />
                    </button>
                    <button
                      type="button"
                      class="prod-mini-cal-btn"
                      aria-label="上一月"
                      @click="shiftCalendarMonth(-1)"
                    >
                      <icon-left />
                    </button>
                  </div>
                  <div class="prod-mini-cal-label">{{ calendarTitle }}</div>
                  <div class="prod-mini-cal-nav-group">
                    <button
                      type="button"
                      class="prod-mini-cal-btn"
                      aria-label="下一月"
                      @click="shiftCalendarMonth(1)"
                    >
                      <icon-right />
                    </button>
                    <button
                      type="button"
                      class="prod-mini-cal-btn"
                      aria-label="下一年"
                      @click="shiftCalendarYear(1)"
                    >
                      <icon-double-right />
                    </button>
                  </div>
                </div>

                <div class="prod-mini-cal-weekdays">
                  <span v-for="day in t.scheduleWeekdays" :key="day">{{ day }}</span>
                </div>

                <div class="prod-mini-cal-grid">
                  <button
                    v-for="cell in calendarCells"
                    :key="cell.key + (cell.muted ? '-m' : '')"
                    type="button"
                    class="prod-mini-cal-cell"
                    :class="{
                      'is-muted': cell.muted,
                      'is-selected': cell.selected,
                      'has-event': cell.hasEvent,
                    }"
                    @click="selectCalendarDay(cell)"
                  >
                    <span class="prod-mini-cal-day">{{ cell.day }}</span>
                  </button>
                </div>
              </div>

              <div class="prod-schedule-list-head">
                <h4 class="prod-schedule-list-title">{{ t.scheduleTodos }}</h4>
                <div class="prod-schedule-list-actions">
                  <button type="button" class="prod-schedule-link" @click="goCalendarToday">
                    <icon-refresh />
                    <span>{{ t.scheduleBackToday }}</span>
                  </button>
                  <button
                    type="button"
                    class="prod-schedule-link"
                    @click="onScheduleTip(t.scheduleNew)"
                  >
                    <icon-plus-circle />
                    <span>{{ t.scheduleNew }}</span>
                  </button>
                </div>
              </div>

              <div class="prod-schedule-list">
                <button
                  v-for="item in selectedScheduleTodos"
                  :key="item.id"
                  type="button"
                  class="prod-schedule-item"
                  @click="onScheduleTip(item.title)"
                >
                  <div class="prod-schedule-item-meta">
                    <a-tag size="small" bordered class="prod-tag" :class="tagClass(item.tag)">
                      {{ item.tag }}
                    </a-tag>
                  </div>
                  <div class="prod-schedule-item-body">
                    <div class="prod-schedule-item-title">{{ item.title }}</div>
                    <div class="prod-schedule-item-time">{{ item.timeRange }}</div>
                  </div>
                  <span class="prod-schedule-item-chevron" aria-hidden="true">
                    <icon-right />
                  </span>
                </button>
                <div v-if="!selectedScheduleTodos.length" class="prod-schedule-empty">
                  当日暂无待办
                </div>
              </div>
            </a-card>

            <a-card class="prod-card general-card">
              <div class="prod-card-head">
                <h3 class="prod-card-title">{{ t.focus }}</h3>
              </div>
              <div class="prod-focus-timer">
                <div class="prod-focus-time">90:00</div>
                <a-button type="primary" style="min-width: 96px">{{ t.focusStart }}</a-button>
              </div>
              <div class="prod-focus-meta">
                <icon-notification />
                <span>{{ t.focusDnd }}</span>
              </div>
              <div class="prod-focus-quote">
                <div class="prod-focus-quote-icon">“</div>
                <div class="prod-focus-quote-text">
                  <p class="prod-focus-quote-main">{{ t.focusQuote }}</p>
                  <p class="prod-focus-quote-sub">{{ t.focusQuoteSub }}</p>
                </div>
              </div>
            </a-card>

            <a-card class="prod-card prod-tools-card general-card">
              <div class="prod-card-head">
                <h3 class="prod-card-title">{{ t.quickActions }}</h3>
              </div>
              <div class="prod-tool-list">
                <button
                  v-for="action in quickActions"
                  :key="action.title"
                  type="button"
                  class="prod-tool-item"
                  @click="onScheduleTip(action.title)"
                >
                  <span class="prod-tool-icon">
                    <component :is="action.icon" />
                  </span>
                  <span class="prod-tool-body">
                    <span class="prod-tool-title">{{ action.title }}</span>
                    <span class="prod-tool-desc">{{ action.desc }}</span>
                  </span>
                </button>
              </div>
            </a-card>
          </aside>
        </div>
      </div>
    `,
  }

  mountProPage({
    pageKey: 'dashboard/productivity',
    title: t.pageTitle,
    pageComponent: ProductivityPage,
  })
})()
