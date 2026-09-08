;(function () {
  const t = ArcoProLocale.listCalendar

  const TYPE_MAP = {
    schedule: { label: t.typeSchedule, className: 'is-schedule', color: 'arcoblue' },
    meeting: { label: t.typeMeeting, className: 'is-meeting', color: 'orangered' },
    activity: { label: t.typeActivity, className: 'is-activity', color: 'green' },
  }

  const SEED_EVENTS = [
    { id: 'e1', date: '2026-08-03', type: 'schedule', title: 'Q3 内容排期评审', time: '10:00-11:30', owner: '陈思远', place: '线上会议', desc: '确认 8 月短视频与直播排期，对齐渠道资源。' },
    { id: 'e2', date: '2026-08-05', type: 'activity', title: '新品预热活动上线', time: '全天', owner: '林芳', place: 'App / 小程序', desc: '首页 Banner 与话题页同步上线，跟踪首日转化。' },
    { id: 'e3', date: '2026-08-06', type: 'meeting', title: '周会：产品同步', time: '10:00-11:00', owner: '产品组', place: '会议室 B', desc: '同步本周进度、风险与下周重点。' },
    { id: 'e4', date: '2026-08-06', type: 'schedule', title: '客服班次排班确认', time: '15:00-16:00', owner: '王立群', place: '客服中心', desc: '确认周末与促销日班次覆盖。' },
    { id: 'e5', date: '2026-08-08', type: 'activity', title: '会员日直播彩排', time: '19:00-21:00', owner: '赵雪', place: '直播间 A', desc: '脚本走查、商品挂链与互动节奏彩排。' },
    { id: 'e6', date: '2026-08-12', type: 'meeting', title: '渠道合作洽谈', time: '14:00-15:30', owner: '商务部', place: '会议室 A', desc: '对齐合作档期、资源位与结算方式。' },
    { id: 'e7', date: '2026-08-14', type: 'schedule', title: '审核人力排期', time: '14:00-15:00', owner: '周凯', place: '内容安全组', desc: '大促前审核人力扩容与分流策略。' },
    { id: 'e8', date: '2026-08-18', type: 'activity', title: '开学季专题发布', time: '09:00', owner: '孙婷', place: '内容中心', desc: '专题页与物料包同步发布。' },
    { id: 'e9', date: '2026-08-20', type: 'meeting', title: '设计评审会', time: '16:00-17:00', owner: '设计组', place: '线上会议', desc: '评审品牌日视觉与落地页交互。' },
    { id: 'e10', date: '2026-08-22', type: 'schedule', title: '渠道投放排期同步', time: '11:00-12:00', owner: '李晓雯', place: '市场部', desc: '对齐信息流与搜索广告档期。' },
    { id: 'e11', date: '2026-08-26', type: 'activity', title: '品牌日活动配置', time: '全天', owner: '韩梅', place: '运营后台', desc: '优惠券、会场楼层与弹窗配置验收。' },
    { id: 'e12', date: '2026-08-28', type: 'meeting', title: '发布前评审会', time: '15:00-16:30', owner: '发布经理', place: '会议室 C', desc: '确认灰度方案、回滚预案与值班安排。' },
  ]

  const WEEKDAYS = [t.sun, t.mon, t.tue, t.wed, t.thu, t.fri, t.sat]

  function pad(n) {
    return String(n).padStart(2, '0')
  }

  function toKey(y, m, d) {
    return y + '-' + pad(m) + '-' + pad(d)
  }

  function emptyForm(date) {
    return {
      title: '',
      type: 'schedule',
      date: date || '2026-08-06',
      timeRange: [],
      owner: '',
      place: '',
      desc: '',
    }
  }

  function formatTimeValue(value) {
    if (!value) return ''
    if (typeof value === 'string') return value.slice(0, 5)
    if (value instanceof Date && !isNaN(value.getTime())) {
      return pad(value.getHours()) + ':' + pad(value.getMinutes())
    }
    if (typeof value.format === 'function') return value.format('HH:mm')
    return String(value)
  }

  function formatTimeRange(range) {
    if (!Array.isArray(range) || !range[0] || !range[1]) return ''
    return formatTimeValue(range[0]) + '-' + formatTimeValue(range[1])
  }

  function buildMonthCells(year, month) {
    const first = new Date(year, month - 1, 1)
    const startWeekday = first.getDay()
    const daysInMonth = new Date(year, month, 0).getDate()
    const prevDays = new Date(year, month - 1, 0).getDate()
    const cells = []
    for (let i = 0; i < startWeekday; i += 1) {
      const day = prevDays - startWeekday + i + 1
      const y = month === 1 ? year - 1 : year
      const m = month === 1 ? 12 : month - 1
      cells.push({ key: toKey(y, m, day), day, muted: true, date: toKey(y, m, day) })
    }
    for (let d = 1; d <= daysInMonth; d += 1) {
      cells.push({ key: toKey(year, month, d), day: d, muted: false, date: toKey(year, month, d) })
    }
    while (cells.length % 7 !== 0) {
      const d = cells.length - (startWeekday + daysInMonth) + 1
      const y = month === 12 ? year + 1 : year
      const m = month === 12 ? 1 : month + 1
      cells.push({ key: toKey(y, m, d), day: d, muted: true, date: toKey(y, m, d) })
    }
    return cells
  }

  function todayParts() {
    const now = new Date()
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      key: toKey(now.getFullYear(), now.getMonth() + 1, now.getDate()),
    }
  }

  const TODAY = todayParts()

  const ListCalendarPage = {
    name: 'ListCalendarPage',
    data() {
      return {
        t,
        view: 'calendar',
        typeFilter: '',
        year: TODAY.year,
        month: TODAY.month,
        selectedDate: TODAY.key,
        events: SEED_EVENTS.map((e) => Object.assign({}, e)),
        dayDrawerVisible: false,
        detailVisible: false,
        createVisible: false,
        saving: false,
        current: null,
        form: emptyForm(TODAY.key),
      }
    },
    computed: {
      typeOptions() {
        return [
          { label: t.typeAll, value: '' },
          { label: t.typeSchedule, value: 'schedule' },
          { label: t.typeMeeting, value: 'meeting' },
          { label: t.typeActivity, value: 'activity' },
        ]
      },
      typeCreateOptions() {
        return [
          { label: t.typeSchedule, value: 'schedule' },
          { label: t.typeMeeting, value: 'meeting' },
          { label: t.typeActivity, value: 'activity' },
        ]
      },
      formRules() {
        return {
          title: [{ required: true, message: t.phTitle }],
          type: [{ required: true, message: t.phType }],
          date: [{ required: true, message: t.phDate }],
          timeRange: [
            {
              required: true,
              validator: (value, callback) => {
                if (!Array.isArray(value) || !value[0] || !value[1]) {
                  callback(t.phTime)
                  return
                }
                callback()
              },
            },
          ],
          owner: [{ required: true, message: t.phOwner }],
        }
      },
      filteredEvents() {
        return this.events.filter((e) => !this.typeFilter || e.type === this.typeFilter)
      },
      monthLabel() {
        return this.year + t.year + this.month + t.month
      },
      todayKey() {
        return todayParts().key
      },
      todayLabel() {
        const parts = todayParts()
        return parts.month + '月' + parts.day + '日'
      },
      cells() {
        return buildMonthCells(this.year, this.month)
      },
      weekdays() {
        return WEEKDAYS
      },
      eventsByDate() {
        const map = {}
        this.filteredEvents.forEach((e) => {
          if (!map[e.date]) map[e.date] = []
          map[e.date].push(e)
        })
        return map
      },
      selectedEvents() {
        return this.eventsByDate[this.selectedDate] || []
      },
      dayDrawerTitle() {
        return this.selectedDate + ' · ' + t.dayEvents
      },
      timelineEvents() {
        return this.filteredEvents
          .slice()
          .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
      },
    },
    methods: {
      typeMeta(type) {
        return TYPE_MAP[type] || TYPE_MAP.schedule
      },
      dateParts(date) {
        const parts = String(date || '').split('-')
        const month = Number(parts[1]) || 1
        const day = Number(parts[2]) || 1
        return { day: String(day), month: month + t.month }
      },
      displayTime(time) {
        return String(time || '') || '全天'
      },
      eventsOf(date) {
        return this.eventsByDate[date] || []
      },
      prevMonth() {
        if (this.month === 1) {
          this.year -= 1
          this.month = 12
        } else {
          this.month -= 1
        }
      },
      nextMonth() {
        if (this.month === 12) {
          this.year += 1
          this.month = 1
        } else {
          this.month += 1
        }
      },
      goToday() {
        const parts = todayParts()
        this.year = parts.year
        this.month = parts.month
        this.selectedDate = parts.key
      },
      selectDate(cell) {
        this.selectedDate = cell.date
        if (this.eventsOf(cell.date).length) {
          this.dayDrawerVisible = true
        } else {
          this.openCreate()
        }
      },
      closeDayDrawer() {
        this.dayDrawerVisible = false
      },
      openEvent(event, e) {
        if (e) e.stopPropagation()
        this.current = event
        this.detailVisible = true
      },
      closeDetail() {
        this.detailVisible = false
      },
      openCreate() {
        this.form = emptyForm(this.selectedDate || this.todayKey)
        this.createVisible = true
        this.$nextTick(() => {
          if (this.$refs.createFormRef) this.$refs.createFormRef.clearValidate()
        })
      },
      closeCreate() {
        this.createVisible = false
      },
      onCreateFromDay() {
        this.closeDayDrawer()
        this.openCreate()
      },
      onSaveCreate() {
        const formRef = this.$refs.createFormRef
        if (!formRef) return
        formRef.validate((errors) => {
          if (errors) return
          this.saving = true
          const item = {
            id: 'e' + Date.now(),
            title: this.form.title.trim(),
            type: this.form.type,
            date: this.form.date,
            time: formatTimeRange(this.form.timeRange) || '全天',
            owner: this.form.owner.trim(),
            place: (this.form.place || '').trim() || '—',
            desc: (this.form.desc || '').trim() || '—',
          }
          this.events.unshift(item)
          this.selectedDate = item.date
          const parts = item.date.split('-')
          this.year = Number(parts[0]) || this.year
          this.month = Number(parts[1]) || this.month
          this.saving = false
          this.createVisible = false
          ArcoVue.Message.success(t.createOk)
        })
      },
    },
    template: `
      <div class="list-calendar-page" :class="{ 'is-calendar-view': view === 'calendar', 'is-list-view': view !== 'calendar' }">
        <a-card class="general-card" :bordered="false">
          <div class="list-cal-toolbar">
            <div class="list-cal-toolbar-left">
              <a-radio-group v-model="view" type="button" size="medium">
                <a-radio value="calendar">{{ t.viewCalendar }}</a-radio>
                <a-radio value="timeline">{{ t.viewTimeline }}</a-radio>
              </a-radio-group>
              <div v-if="view === 'calendar'" class="list-cal-legend">
                <span class="list-cal-legend-item"><i class="list-cal-dot is-schedule"></i>{{ t.typeSchedule }}</span>
                <span class="list-cal-legend-item"><i class="list-cal-dot is-meeting"></i>{{ t.typeMeeting }}</span>
                <span class="list-cal-legend-item"><i class="list-cal-dot is-activity"></i>{{ t.typeActivity }}</span>
              </div>
            </div>
            <div class="list-cal-nav">
              <template v-if="view === 'calendar'">
                <a-button class="pro-toolbar-icon-btn" @click="prevMonth">
                  <template #icon><icon-left /></template>
                </a-button>
                <div class="list-cal-month">{{ monthLabel }}</div>
                <a-button class="pro-toolbar-icon-btn" @click="nextMonth">
                  <template #icon><icon-right /></template>
                </a-button>
                <a-button class="list-cal-today-btn" @click="goToday">{{ t.today }}</a-button>
              </template>
            </div>
            <a-space class="list-cal-toolbar-right" wrap>
              <a-select
                v-model="typeFilter"
                :options="typeOptions"
                style="width: 140px"
              />
              <a-button type="primary" @click="openCreate">
                <template #icon><icon-plus /></template>{{ t.create }}
              </a-button>
            </a-space>
          </div>

          <template v-if="view === 'calendar'">
            <div class="list-cal-grid">
              <div v-for="w in weekdays" :key="w" class="list-cal-weekday">{{ w }}</div>
              <div
                v-for="cell in cells"
                :key="cell.key"
                class="list-cal-cell"
                :class="{
                  'is-muted': cell.muted,
                  'is-today': cell.date === todayKey,
                  'is-selected': cell.date === selectedDate,
                }"
                @click="selectDate(cell)"
              >
                <div class="list-cal-day">{{ cell.day }}</div>
                <div class="list-cal-events">
                  <button
                    v-for="ev in eventsOf(cell.date).slice(0, 2)"
                    :key="ev.id"
                    type="button"
                    class="list-cal-event"
                    :class="typeMeta(ev.type).className"
                    @click="openEvent(ev, $event)"
                  >{{ ev.title }}</button>
                  <div v-if="eventsOf(cell.date).length > 2" class="list-cal-more">
                    +{{ eventsOf(cell.date).length - 2 }} {{ t.more }}
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template v-else>
            <a-empty v-if="!timelineEvents.length" :description="t.emptyDay" />
            <div v-else class="list-cal-event-list">
              <button
                v-for="ev in timelineEvents"
                :key="ev.id"
                type="button"
                class="list-cal-event-card"
                @click="openEvent(ev)"
              >
                <div class="list-cal-event-date">
                  <span class="list-cal-event-day">{{ dateParts(ev.date).day }}</span>
                  <span class="list-cal-event-month">{{ dateParts(ev.date).month }}</span>
                </div>
                <div class="list-cal-event-body">
                  <div class="list-cal-event-title">{{ ev.title }}</div>
                  <div class="list-cal-event-time">
                    <icon-clock-circle />
                    <span>{{ displayTime(ev.time) }}</span>
                  </div>
                </div>
                <a-tag size="small" bordered :color="typeMeta(ev.type).color">
                  {{ typeMeta(ev.type).label }}
                </a-tag>
              </button>
            </div>
          </template>
        </a-card>

        <a-drawer
          :visible="dayDrawerVisible"
          :width="440"
          unmount-on-close
          :title="dayDrawerTitle"
          @cancel="closeDayDrawer"
        >
          <a-empty v-if="!selectedEvents.length" :description="t.emptyDay" />
          <div v-else class="list-cal-day-list">
            <button
              v-for="ev in selectedEvents"
              :key="ev.id"
              type="button"
              class="list-cal-day-item"
              @click="openEvent(ev)"
            >
              <div class="list-cal-day-item-main">
                <div class="list-cal-day-item-title">{{ ev.title }}</div>
                <div class="list-cal-day-item-meta">
                  <icon-clock-circle />
                  <span>{{ displayTime(ev.time) }}</span>
                  <span class="list-cal-day-item-dot">·</span>
                  <span>{{ ev.owner }}</span>
                </div>
              </div>
              <a-tag size="small" bordered :color="typeMeta(ev.type).color">
                {{ typeMeta(ev.type).label }}
              </a-tag>
            </button>
          </div>
          <template #footer>
            <a-button @click="closeDayDrawer">{{ t.cancel }}</a-button>
            <a-button type="primary" @click="onCreateFromDay">
              <template #icon><icon-plus /></template>{{ t.create }}
            </a-button>
          </template>
        </a-drawer>

        <a-modal
          :visible="detailVisible"
          :title="current ? current.title : t.detailTitle"
          title-align="start"
          :width="520"
          :footer="false"
          unmount-on-close
          @cancel="closeDetail"
        >
          <template v-if="current">
            <div class="list-cal-detail">
              <div class="list-cal-detail-row">
                <div class="list-cal-detail-label">{{ t.colType }}</div>
                <div class="list-cal-detail-value">
                  <a-tag size="small" bordered :color="typeMeta(current.type).color">
                    {{ typeMeta(current.type).label }}
                  </a-tag>
                </div>
              </div>
              <div class="list-cal-detail-row">
                <div class="list-cal-detail-label">{{ t.colDate }}</div>
                <div class="list-cal-detail-value">{{ current.date }}</div>
              </div>
              <div class="list-cal-detail-row">
                <div class="list-cal-detail-label">{{ t.colTime }}</div>
                <div class="list-cal-detail-value">{{ current.time }}</div>
              </div>
              <div class="list-cal-detail-row">
                <div class="list-cal-detail-label">{{ t.colOwner }}</div>
                <div class="list-cal-detail-value">{{ current.owner }}</div>
              </div>
              <div class="list-cal-detail-row">
                <div class="list-cal-detail-label">{{ t.colPlace }}</div>
                <div class="list-cal-detail-value">{{ current.place }}</div>
              </div>
              <div class="list-cal-detail-row">
                <div class="list-cal-detail-label">{{ t.colDesc }}</div>
                <div class="list-cal-detail-value list-cal-detail-value--desc">{{ current.desc }}</div>
              </div>
            </div>
          </template>
        </a-modal>

        <a-modal
          :visible="createVisible"
          :title="t.create"
          title-align="start"
          :width="480"
          :footer="false"
          unmount-on-close
          @cancel="closeCreate"
        >
          <a-form
            ref="createFormRef"
            :model="form"
            :rules="formRules"
            layout="vertical"
          >
            <a-form-item :label="t.colTitle" field="title" required asterisk-position="end">
              <a-input v-model="form.title" :placeholder="t.phTitle" allow-clear />
            </a-form-item>
            <a-form-item :label="t.colType" field="type" required asterisk-position="end">
              <a-select v-model="form.type" :options="typeCreateOptions" :placeholder="t.phType" />
            </a-form-item>
            <a-form-item :label="t.colDate" field="date" required asterisk-position="end">
              <a-date-picker
                v-model="form.date"
                value-format="YYYY-MM-DD"
                style="width: 100%"
                :placeholder="t.phDate"
              />
            </a-form-item>
            <a-form-item :label="t.colTime" field="timeRange" required asterisk-position="end">
              <a-time-picker
                v-model="form.timeRange"
                type="time-range"
                format="HH:mm"
                class="pro-field-block"
                style="width: 100%"
                :placeholder="[t.phTimeStart, t.phTimeEnd]"
                allow-clear
              />
            </a-form-item>
            <a-form-item :label="t.colOwner" field="owner" required asterisk-position="end">
              <a-input v-model="form.owner" :placeholder="t.phOwner" allow-clear />
            </a-form-item>
            <a-form-item :label="t.colPlace" field="place">
              <a-input v-model="form.place" :placeholder="t.phPlace" allow-clear />
            </a-form-item>
            <a-form-item :label="t.colDesc" field="desc">
              <a-textarea
                v-model="form.desc"
                :placeholder="t.phDesc"
                :auto-size="{ minRows: 3, maxRows: 6 }"
              />
            </a-form-item>
          </a-form>
          <div class="pro-modal-footer-actions">
            <a-space>
              <a-button @click="closeCreate">{{ t.cancel }}</a-button>
              <a-button type="primary" :loading="saving" @click="onSaveCreate">{{ t.save }}</a-button>
            </a-space>
          </div>
        </a-modal>
      </div>
    `,
  }

  mountProPage({
    pageKey: 'list/calendar',
    title: t.title,
    pageComponent: ListCalendarPage,
  })
})()
