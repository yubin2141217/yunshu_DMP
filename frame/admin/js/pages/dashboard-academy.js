;(function () {
  const t = {
    pageTitle: '教育培训',
    pageDesc: '课程安排、作业状态与成绩概览',
    announce: '发布公告',
    gradebook: '成绩册',
    addAssignment: '添加作业',
    kpiStudents: '授课学生',
    kpiStudentsHint: '覆盖 5 个高三班级',
    kpiAttendance: '平均出勤率',
    kpiAttendanceHint: '较上周 +8%',
    kpiAssignments: '作业',
    kpiAssignmentsHint: '63 待批改 · 18 逾期',
    kpiToday: '今日课程',
    kpiTodayHint: '1 进行中 · 3 即将开始 · 1 已取消',
    scheduleTitle: '课程表',
    scheduleLink: '查看完整课表',
    assignmentTitle: '作业状态',
    assignmentLink: '查看报告',
    submitted: '已提交',
    pending: '待批改',
    overdue: '逾期',
    performanceTitle: '成绩亮点',
    performanceLink: '查看洞察',
    eventsTitle: '近期活动',
    eventsLink: '查看日历',
    tipAnnounce: '发布公告（演示）',
    tipGradebook: '成绩册（演示）',
    tipAddAssignment: '添加作业（演示）',
    tipSchedule: '查看完整课表（演示）',
    tipReport: '查看报告（演示）',
    tipInsight: '查看洞察（演示）',
    tipCalendar: '查看日历（演示）',
  }

  const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const WEEK_AXIS = ['周一', '周二', '周三', '周四', '周五']
  const AVATAR_INITIALS = ['陈', '李', '王', '赵', '刘', '周', '吴', '郑', '孙']

  function formatTodayLabel(date) {
    return `${date.getMonth() + 1}月${date.getDate()}日 ${WEEKDAYS[date.getDay()]}`
  }

  function addDays(base, n) {
    const d = new Date(base)
    d.setDate(d.getDate() + n)
    return d
  }

  const today = new Date()
  const todayLabel = formatTodayLabel(today)

  const scheduleItems = [
    {
      time: '08:00 - 08:45',
      subject: '数学',
      location: '高三A班 · 2.14 教室',
      status: 'active',
      statusLabel: '进行中',
    },
    {
      time: '09:00 - 09:45',
      subject: '语文',
      location: '高三B班 · 研讨室 3',
      status: 'upcoming',
      statusLabel: '即将开始',
    },
    {
      time: '10:00 - 10:45',
      subject: '物理',
      location: '高三C班 · 物理实验室',
      status: 'upcoming',
      statusLabel: '即将开始',
    },
    {
      time: '11:00 - 11:45',
      subject: '世界史',
      location: '高三A班 · 1.08 教室',
      status: 'cancelled',
      statusLabel: '已取消',
    },
    {
      time: '12:00 - 12:45',
      subject: '计算机科学',
      location: '高三B班 · 机房',
      status: 'upcoming',
      statusLabel: '即将开始',
    },
  ].map((item) => ({ ...item, dateLabel: todayLabel }))

  const assignmentData = [
    { label: '高三A班', submitted: 14, pending: 18, overdue: 2 },
    { label: '高三B班', submitted: 22, pending: 7, overdue: 3 },
    { label: '高三C班', submitted: 10, pending: 19, overdue: 5 },
    { label: '高三D班', submitted: 17, pending: 15, overdue: 6 },
    { label: '高三E班', submitted: 24, pending: 4, overdue: 2 },
  ]

  const assignmentLegend = [
    { key: 'submitted', label: t.submitted, color: 'var(--chart-1)' },
    { key: 'pending', label: t.pending, color: 'var(--chart-2)' },
    { key: 'overdue', label: t.overdue, color: 'rgb(var(--danger-6))' },
  ]

  const performanceHighlights = [
    {
      className: '高三A班',
      start: 1.25,
      duration: 1.45,
      subject: '数学',
      score: 84,
      avatarIndexes: [0, 1, 2],
    },
    {
      className: '高三B班',
      start: 0.72,
      duration: 1.75,
      subject: '语文',
      score: 78,
      avatarIndexes: [3],
    },
    {
      className: '高三C班',
      start: 1.35,
      duration: 1.9,
      subject: '物理',
      score: 80,
      avatarIndexes: [4, 5, 6],
    },
    {
      className: '高三D班',
      start: 2.22,
      duration: 1.66,
      subject: '历史',
      score: 73,
      avatarIndexes: [7, 8],
    },
    {
      className: '高三E班',
      start: 0.55,
      duration: 1.7,
      subject: '英语',
      score: 88,
      avatarIndexes: [1, 4, 6],
    },
  ].map((row) => ({
    ...row,
    left: `${(row.start / 4) * 100}%`,
    width: `${(row.duration / 4) * 100}%`,
    fillWidth: `${row.score}%`,
    avatars: row.avatarIndexes.map((i) => AVATAR_INITIALS[i] || String(i)),
  }))

  const upcomingEvents = [
    { dayOffset: 6, title: '科学展览', time: '08:30 - 12:30', type: '校内' },
    { dayOffset: 9, title: '家长会', time: '14:00 - 17:00', type: '会议' },
    { dayOffset: 12, title: '院际运动会', time: '09:00 - 16:00', type: '体育' },
    { dayOffset: 15, title: '高三模拟考', time: '09:00 - 12:00', type: '考试' },
    { dayOffset: 18, title: '教研组规划会', time: '15:30 - 16:30', type: '会议' },
  ].map((event) => {
    const d = addDays(today, event.dayOffset)
    return {
      ...event,
      monthLabel: `${d.getMonth() + 1}月`,
      dayLabel: String(d.getDate()),
    }
  })

  const AcademyPage = {
    name: 'AcademyDashboardPage',
    data() {
      return {
        t,
        weekAxis: WEEK_AXIS,
        scheduleItems,
        assignmentLegend,
        performanceHighlights,
        upcomingEvents,
        kpis: [
          {
            title: t.kpiStudents,
            value: '128',
            hint: t.kpiStudentsHint,
          },
          {
            title: t.kpiAttendance,
            value: '94.2%',
            hint: t.kpiAttendanceHint,
          },
          {
            title: t.kpiAssignments,
            value: '81',
            hint: t.kpiAssignmentsHint,
          },
          {
            title: t.kpiToday,
            value: '5',
            hint: t.kpiTodayHint,
          },
        ],
      }
    },
    methods: {
      onTip(msg) {
        ArcoVue.Message.info(msg)
      },
      initCharts() {
        if (!window.ProShadcnCharts || !this.$refs.assignChart) return
        this._assignChart = ProShadcnCharts.mountBarChart(this.$refs.assignChart, {
          data: assignmentData,
          height: 280,
          x: (d) => d.label,
          xLabel: (d) => d.label,
          crosshair: false,
          groupPadding: 0.28,
          barPadding: 0.18,
          series: [
            { key: 'submitted', label: t.submitted, color: 'var(--chart-1)' },
            { key: 'pending', label: t.pending, color: 'var(--chart-2)' },
            { key: 'overdue', label: t.overdue, color: 'rgb(var(--danger-6))' },
          ],
          // 与财务收支概览 / 全局图例规范对齐；关闭 autoMargin，避免轴标签下再叠空白
          // 轴→图例间距见 css/shadcn-chart.css（margin-top: 20px），详见 charts.md
          margin: { top: 6, bottom: 22, right: 8 },
          autoMargin: false,
          yTickValues: [0, 7, 14, 21, 28],
          yDomain: [0, 28],
        })
      },
      destroyCharts() {
        if (!window.ProShadcnCharts) return
        ProShadcnCharts.destroy(this._assignChart)
        this._assignChart = null
      },
    },
    mounted() {
      this.$nextTick(() => this.initCharts())
    },
    beforeUnmount() {
      this.destroyCharts()
    },
    template: `
      <div class="acad-page">
        <div class="acad-header">
          <div class="acad-header-text">
            <h2 class="acad-title">{{ t.pageTitle }}</h2>
            <p class="acad-desc">{{ t.pageDesc }}</p>
          </div>
          <div class="acad-header-actions">
            <a-button type="primary" size="small" @click="onTip(t.tipAnnounce)">
              <template #icon><icon-notification /></template>
              {{ t.announce }}
            </a-button>
            <a-button size="small" @click="onTip(t.tipGradebook)">
              <template #icon><icon-file /></template>
              {{ t.gradebook }}
            </a-button>
            <a-button size="small" @click="onTip(t.tipAddAssignment)">
              <template #icon><icon-plus /></template>
              {{ t.addAssignment }}
            </a-button>
          </div>
        </div>

        <a-row :gutter="[16, 16]">
          <a-col v-for="(item, idx) in kpis" :key="idx" :xs="24" :sm="12" :xl="6">
            <a-card class="acad-card general-card">
              <div class="acad-kpi-head">
                <span class="acad-kpi-title">{{ item.title }}</span>
                <a-tooltip :content="item.hint">
                  <span class="acad-kpi-icon-wrap">
                    <icon-info-circle class="acad-kpi-icon" />
                  </span>
                </a-tooltip>
              </div>
              <div class="acad-kpi-value-row">
                <span class="acad-kpi-value">{{ item.value }}</span>
              </div>
              <div class="acad-kpi-hint">{{ item.hint }}</div>
            </a-card>
          </a-col>
        </a-row>

        <a-row class="acad-equal-row" :gutter="[16, 16]">
          <a-col :xs="24" :xl="12">
            <a-card class="acad-card general-card">
              <div class="acad-section-head">
                <a-typography-title :heading="6" class="acad-section-title">{{ t.scheduleTitle }}</a-typography-title>
                <span class="acad-section-link" @click="onTip(t.tipSchedule)">
                  {{ t.scheduleLink }} <icon-right />
                </span>
              </div>
              <div class="acad-schedule-list">
                <div v-for="item in scheduleItems" :key="item.time" class="acad-schedule-row">
                  <div class="acad-schedule-top">
                    <div class="acad-schedule-time-wrap">
                      <div class="acad-schedule-bar" :class="'acad-schedule-bar--' + item.status" aria-hidden="true"></div>
                      <div>
                        <div class="acad-schedule-time">{{ item.time }}</div>
                        <div class="acad-schedule-date">{{ item.dateLabel }}</div>
                      </div>
                    </div>
                    <span class="acad-status" :class="'acad-status--' + item.status">{{ item.statusLabel }}</span>
                  </div>
                  <div class="acad-schedule-body">
                    <div class="acad-schedule-subject">{{ item.subject }}</div>
                    <div class="acad-schedule-location">{{ item.location }}</div>
                  </div>
                </div>
              </div>
            </a-card>
          </a-col>

          <a-col :xs="24" :xl="12">
            <a-card class="acad-card general-card">
              <div class="acad-section-head">
                <a-typography-title :heading="6" class="acad-section-title">{{ t.assignmentTitle }}</a-typography-title>
                <span class="acad-section-link" @click="onTip(t.tipReport)">
                  {{ t.assignmentLink }} <icon-right />
                </span>
              </div>
              <div ref="assignChart" class="shadcn-chart-host acad-assign-chart"></div>
              <div class="shadcn-chart-legend">
                <span v-for="item in assignmentLegend" :key="item.key" class="shadcn-chart-legend-item">
                  <span class="shadcn-chart-legend-dot" :style="{ '--legend-color': item.color }"></span>{{ item.label }}
                </span>
              </div>
            </a-card>
          </a-col>
        </a-row>

        <a-row class="acad-equal-row" :gutter="[16, 16]">
          <a-col :xs="24" :xl="12">
            <a-card class="acad-card general-card">
              <div class="acad-section-head">
                <a-typography-title :heading="6" class="acad-section-title">{{ t.performanceTitle }}</a-typography-title>
                <span class="acad-section-link" @click="onTip(t.tipInsight)">
                  {{ t.performanceLink }} <icon-right />
                </span>
              </div>
              <div class="acad-perf">
                <div class="acad-perf-body">
                  <div class="acad-perf-grid" aria-hidden="true">
                    <span
                      v-for="d in weekAxis"
                      :key="'g-' + d"
                      class="acad-perf-grid-slot"
                    >
                      <i class="acad-perf-grid-line"></i>
                    </span>
                  </div>
                  <div
                    v-for="row in performanceHighlights"
                    :key="row.className"
                    class="acad-perf-row"
                  >
                    <div class="acad-perf-class">{{ row.className }}</div>
                    <div class="acad-perf-track">
                      <div
                        class="acad-perf-bar"
                        :style="{ left: row.left, width: row.width }"
                      >
                        <div class="acad-perf-fill" :style="{ width: row.fillWidth }">
                          <div class="acad-perf-avatars">
                            <span
                              v-for="(ch, i) in row.avatars"
                              :key="row.className + '-' + i"
                              class="acad-perf-avatar"
                            >{{ ch }}</span>
                          </div>
                          <span class="acad-perf-subject">{{ row.subject }}</span>
                        </div>
                        <span class="acad-perf-score">{{ row.score }}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="acad-perf-days">
                  <div class="acad-perf-days-spacer"></div>
                  <div class="acad-perf-days-row">
                    <span v-for="d in weekAxis" :key="d">{{ d }}</span>
                  </div>
                </div>
              </div>
            </a-card>
          </a-col>

          <a-col :xs="24" :xl="12">
            <a-card class="acad-card general-card">
              <div class="acad-section-head">
                <a-typography-title :heading="6" class="acad-section-title">{{ t.eventsTitle }}</a-typography-title>
                <span class="acad-section-link" @click="onTip(t.tipCalendar)">
                  {{ t.eventsLink }} <icon-right />
                </span>
              </div>
              <div class="acad-events">
                <div v-for="event in upcomingEvents" :key="event.title" class="acad-event">
                  <div class="acad-event-main">
                    <div class="acad-event-date">
                      <div class="acad-event-month">{{ event.monthLabel }}</div>
                      <div class="acad-event-day">{{ event.dayLabel }}</div>
                    </div>
                    <div class="acad-event-text">
                      <div class="acad-event-title">{{ event.title }}</div>
                      <div class="acad-event-time">{{ event.time }}</div>
                    </div>
                  </div>
                  <span class="acad-event-type">{{ event.type }}</span>
                </div>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </div>
    `,
  }

  mountProPage({
    pageKey: 'dashboard/academy',
    title: t.pageTitle,
    pageComponent: AcademyPage,
  })
})()
