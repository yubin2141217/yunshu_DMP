;(function () {
  const COLUMN_TITLES = {
    backlog: '待办',
    inProgress: '进行中',
    review: '评审',
    done: '已完成',
  }

  const INITIAL_COLUMNS = {
    backlog: [
      { id: '1', title: '迁移至 Stripe 计费 API', priority: 'high', assignee: '陈雨', dueDate: '2026-04-08' },
      { id: '2', title: '报表增加 CSV 导出', priority: 'medium', assignee: '李航', dueDate: '2026-04-12' },
      { id: '3', title: '更新 onboarding 文案', priority: 'low', assignee: '王静', dueDate: '2026-04-15' },
      { id: '9', title: '审计 RBAC 权限', priority: 'medium', assignee: '赵明', dueDate: '2026-04-10' },
      { id: '13', title: '多租户数据隔离方案', priority: 'high', assignee: '周婷', dueDate: '2026-04-11' },
      { id: '14', title: '邮件模板国际化', priority: 'low', assignee: '刘洋', dueDate: '2026-04-16' },
      { id: '15', title: 'API 限流策略配置', priority: 'medium', assignee: '陈雨', dueDate: '2026-04-13' },
      { id: '16', title: '操作日志留存周期调整', priority: 'low', assignee: '李航', dueDate: '2026-04-18' },
    ],
    inProgress: [
      { id: '4', title: '重构通知服务', priority: 'high', assignee: '刘洋', dueDate: '2026-04-03' },
      { id: '5', title: '构建团队邀请流程', priority: 'medium', assignee: '周婷', dueDate: '2026-04-06' },
      { id: '10', title: '修复调度器时区处理', priority: 'high', assignee: '陈雨', dueDate: '2026-04-04' },
      { id: '17', title: '用户画像标签体系', priority: 'medium', assignee: '王静', dueDate: '2026-04-05' },
      { id: '18', title: '支付回调幂等改造', priority: 'high', assignee: '赵明', dueDate: '2026-04-07' },
      { id: '19', title: '看板拖拽性能优化', priority: 'medium', assignee: '李航', dueDate: '2026-04-08' },
      { id: '20', title: '消息中心未读数同步', priority: 'low', assignee: '周婷', dueDate: '2026-04-09' },
    ],
    review: [
      { id: '11', title: '移动端导航改版方案', priority: 'medium', assignee: '王静', dueDate: '2026-04-09' },
      { id: '12', title: '权限模型 v2 设计评审', priority: 'high', assignee: '赵明', dueDate: '2026-04-07' },
      { id: '21', title: '首页 KPI 卡片布局评审', priority: 'medium', assignee: '刘洋', dueDate: '2026-04-08' },
      { id: '22', title: '导出任务队列方案', priority: 'high', assignee: '陈雨', dueDate: '2026-04-10' },
      { id: '23', title: '暗色主题对比度检查', priority: 'low', assignee: '王静', dueDate: '2026-04-11' },
      { id: '24', title: '成员邀请邮件文案', priority: 'medium', assignee: '周婷', dueDate: '2026-04-12' },
    ],
    done: [
      { id: '6', title: 'Okta SSO 集成', priority: 'high', assignee: '赵明', dueDate: '2026-03-22' },
      { id: '7', title: '仪表盘分析图表', priority: 'medium', assignee: '李航', dueDate: '2026-03-20' },
      { id: '8', title: 'Webhook 重试机制', priority: 'low', assignee: '刘洋', dueDate: '2026-03-18' },
      { id: '25', title: '登录页验证码接入', priority: 'medium', assignee: '王静', dueDate: '2026-03-15' },
      { id: '26', title: '侧边栏菜单权限过滤', priority: 'high', assignee: '赵明', dueDate: '2026-03-17' },
      { id: '27', title: '表格列宽拖拽记忆', priority: 'low', assignee: '李航', dueDate: '2026-03-19' },
      { id: '28', title: '批量导入用户模板', priority: 'medium', assignee: '周婷', dueDate: '2026-03-21' },
    ],
  }

  const DRAG_THRESHOLD = 4

  function cloneColumns(source) {
    const next = {}
    Object.keys(source).forEach((key) => {
      next[key] = source[key].map((task) => ({ ...task }))
    })
    return next
  }

  function priorityLabel(priority) {
    if (priority === 'high') return '高'
    if (priority === 'medium') return '中'
    return '低'
  }

  function priorityColor(priority) {
    if (priority === 'high') return undefined
    if (priority === 'medium') return undefined
    return 'gray'
  }

  function priorityTagClass(priority) {
    if (priority === 'high') return 'kanban-priority-high'
    if (priority === 'medium') return 'kanban-priority-medium'
    return ''
  }

  const ListKanbanPage = {
    name: 'ListKanbanPage',
    data() {
      return {
        columnOrder: Object.keys(INITIAL_COLUMNS),
        columns: cloneColumns(INITIAL_COLUMNS),
        createVisible: false,
        createForm: { title: '', description: '', assignee: '', dueDate: '' },
        createRules: {
          title: [{ required: true, message: '请输入任务标题' }],
          assignee: [{ required: true, message: '请输入负责人姓名' }],
          dueDate: [{ required: true, message: '请选择截止日期' }],
        },
        detailVisible: false,
        detailTask: null,
        detailColumnKey: null,
        drag: null,
        dropHint: null,
        overlay: {
          visible: false,
          kind: null,
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          offsetX: 0,
          offsetY: 0,
          task: null,
          columnKey: null,
        },
      }
    },
    computed: {
      isDragging() {
        return !!(this.drag && this.drag.active)
      },
      overlayStyle() {
        const o = this.overlay
        return {
          left: o.x + 'px',
          top: o.y + 'px',
          width: o.width + 'px',
          minHeight: o.height + 'px',
        }
      },
      columnIndicatorStyle() {
        const hint = this.dropHint
        if (!hint || hint.type !== 'column' || !hint.rect) return null
        return {
          left: hint.rect.left + 'px',
          top: hint.rect.top + 'px',
          height: hint.rect.height + 'px',
        }
      },
    },
    mounted() {
      this._onPointerMove = this.onPointerMove.bind(this)
      this._onPointerUp = this.onPointerUp.bind(this)
      window.addEventListener('pointermove', this._onPointerMove)
      window.addEventListener('pointerup', this._onPointerUp)
      window.addEventListener('pointercancel', this._onPointerUp)
    },
    beforeUnmount() {
      window.removeEventListener('pointermove', this._onPointerMove)
      window.removeEventListener('pointerup', this._onPointerUp)
      window.removeEventListener('pointercancel', this._onPointerUp)
      document.body.classList.remove('kanban-dragging')
    },
    methods: {
      columnTitle(key) {
        return COLUMN_TITLES[key] || key
      },
      priorityLabel,
      priorityColor,
      priorityTagClass,
      openCreate() {
        const due = new Date()
        due.setDate(due.getDate() + 7)
        this.createForm = {
          title: '',
          description: '',
          assignee: '',
          dueDate: due.toISOString().slice(0, 10),
        }
        this.createVisible = true
        this.$nextTick(() => {
          const formRef = this.$refs.createFormRef
          if (formRef && typeof formRef.clearValidate === 'function') formRef.clearValidate()
        })
      },
      submitCreate() {
        const formRef = this.$refs.createFormRef
        return new Promise((resolve) => {
          const finishCreate = () => {
            const title = (this.createForm.title || '').trim()
            const assignee = (this.createForm.assignee || '').trim()
            const dueDate = this.formatDueDate(this.createForm.dueDate)
            const task = {
              id: 't-' + Date.now(),
              title,
              description: (this.createForm.description || '').trim() || undefined,
              priority: 'medium',
              assignee,
              dueDate,
            }
            this.columns = {
              ...this.columns,
              backlog: [task, ...(this.columns.backlog || [])],
            }
            ArcoVue.Message.success('已添加到待办')
            resolve(true)
          }

          if (!formRef || typeof formRef.validate !== 'function') {
            const title = (this.createForm.title || '').trim()
            const assignee = (this.createForm.assignee || '').trim()
            const dueDate = this.formatDueDate(this.createForm.dueDate)
            if (!title || !assignee || !dueDate) {
              resolve(false)
              return
            }
            finishCreate()
            return
          }

          formRef.validate((errors) => {
            if (errors) {
              resolve(false)
              return
            }
            finishCreate()
          })
        })
      },
      formatDueDate(value) {
        if (!value) return ''
        if (typeof value === 'string') return value.slice(0, 10)
        if (value instanceof Date && !isNaN(value.getTime())) {
          const y = value.getFullYear()
          const m = String(value.getMonth() + 1).padStart(2, '0')
          const d = String(value.getDate()).padStart(2, '0')
          return y + '-' + m + '-' + d
        }
        if (typeof value === 'object' && typeof value.format === 'function') {
          return value.format('YYYY-MM-DD')
        }
        return String(value).slice(0, 10)
      },
      openDetail(task, columnKey) {
        this.detailTask = { ...task }
        this.detailColumnKey = columnKey
        this.detailVisible = true
      },
      closeDetail() {
        this.detailVisible = false
        this.detailTask = null
        this.detailColumnKey = null
      },
      findTask(taskId) {
        for (const key of this.columnOrder) {
          const task = (this.columns[key] || []).find((item) => item.id === taskId)
          if (task) return { task, columnKey: key }
        }
        return null
      },
      startTaskPointer(task, columnKey, event) {
        if (event.button !== 0) return
        const el = event.currentTarget
        const rect = el.getBoundingClientRect()
        this.drag = {
          kind: 'task',
          active: false,
          taskId: task.id,
          fromColumn: columnKey,
          startX: event.clientX,
          startY: event.clientY,
        }
        this.overlay = {
          visible: false,
          kind: 'task',
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
          offsetX: event.clientX - rect.left,
          offsetY: event.clientY - rect.top,
          task: { ...task },
          columnKey: null,
        }
        event.preventDefault()
      },
      startColumnPointer(columnKey, event) {
        if (event.button !== 0) return
        event.stopPropagation()
        const el = this.$el.querySelector('[data-kanban-column="' + columnKey + '"]')
        if (!el) return
        const rect = el.getBoundingClientRect()
        this.drag = {
          kind: 'column',
          active: false,
          columnKey,
          startX: event.clientX,
          startY: event.clientY,
        }
        this.overlay = {
          visible: false,
          kind: 'column',
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: Math.min(rect.height, 220),
          offsetX: event.clientX - rect.left,
          offsetY: event.clientY - rect.top,
          task: null,
          columnKey,
        }
        event.preventDefault()
      },
      onPointerMove(event) {
        if (!this.drag) return
        const dx = event.clientX - this.drag.startX
        const dy = event.clientY - this.drag.startY
        if (!this.drag.active) {
          if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return
          this.drag.active = true
          this.overlay.visible = true
          document.body.classList.add('kanban-dragging')
        }

        this.overlay.x = event.clientX - this.overlay.offsetX
        this.overlay.y = event.clientY - this.overlay.offsetY
        this.updateDropHint(event.clientX, event.clientY)
      },
      updateDropHint(clientX, clientY) {
        if (!this.drag || !this.drag.active) {
          this.dropHint = null
          return
        }

        if (this.drag.kind === 'column') {
          let best = null
          let bestDist = Infinity
          this.columnOrder.forEach((key) => {
            if (key === this.drag.columnKey) return
            const el = this.$el.querySelector('[data-kanban-column="' + key + '"]')
            if (!el) return
            const rect = el.getBoundingClientRect()
            const mid = rect.left + rect.width / 2
            const dist = Math.abs(clientX - mid)
            if (dist < bestDist) {
              bestDist = dist
              const before = clientX < mid
              best = {
                type: 'column',
                targetKey: key,
                before,
                rect: {
                  left: before ? rect.left - 2 : rect.right - 2,
                  top: rect.top,
                  height: rect.height,
                },
              }
            }
          })
          this.dropHint = best
          return
        }

        let overColumn = null
        let overDist = Infinity
        this.columnOrder.forEach((key) => {
          const el = this.$el.querySelector('[data-kanban-column="' + key + '"]')
          if (!el) return
          const rect = el.getBoundingClientRect()
          if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
            overColumn = key
            overDist = 0
          } else {
            const cx = Math.min(Math.max(clientX, rect.left), rect.right)
            const cy = Math.min(Math.max(clientY, rect.top), rect.bottom)
            const dist = Math.hypot(clientX - cx, clientY - cy)
            if (dist < overDist) {
              overDist = dist
              overColumn = key
            }
          }
        })

        if (!overColumn || overDist > 80) {
          this.dropHint = null
          return
        }

        const tasks = this.columns[overColumn] || []
        let insertIndex = tasks.length
        for (let i = 0; i < tasks.length; i++) {
          if (tasks[i].id === this.drag.taskId) continue
          const cardEl = this.$el.querySelector('[data-kanban-task="' + tasks[i].id + '"]')
          if (!cardEl) continue
          const rect = cardEl.getBoundingClientRect()
          const midY = rect.top + rect.height / 2
          if (clientY < midY) {
            insertIndex = i
            break
          }
        }

        if (overColumn === this.drag.fromColumn) {
          const fromIndex = tasks.findIndex((t) => t.id === this.drag.taskId)
          if (fromIndex >= 0 && insertIndex > fromIndex) insertIndex -= 1
        }

        this.dropHint = {
          type: 'task',
          columnKey: overColumn,
          insertIndex,
        }
      },
      onPointerUp() {
        if (!this.drag) return
        const drag = this.drag
        const hint = this.dropHint
        const wasActive = drag.active

        if (wasActive && hint) {
          if (drag.kind === 'task') {
            this.commitTaskMove(drag.taskId, drag.fromColumn, hint.columnKey, hint.insertIndex)
          } else if (drag.kind === 'column') {
            this.commitColumnMove(drag.columnKey, hint.targetKey, hint.before)
          }
        } else if (!wasActive && drag.kind === 'task') {
          const found = this.findTask(drag.taskId)
          if (found) this.openDetail(found.task, found.columnKey)
        }

        this.drag = null
        this.dropHint = null
        this.overlay = {
          visible: false,
          kind: null,
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          offsetX: 0,
          offsetY: 0,
          task: null,
          columnKey: null,
        }
        document.body.classList.remove('kanban-dragging')
      },
      commitTaskMove(taskId, fromColumn, toColumn, insertIndex) {
        const next = cloneColumns(this.columns)
        const fromList = next[fromColumn] || []
        const taskIndex = fromList.findIndex((t) => t.id === taskId)
        if (taskIndex < 0) return
        const [task] = fromList.splice(taskIndex, 1)
        if (!next[toColumn]) next[toColumn] = []
        let index = insertIndex
        if (index == null || index < 0) index = next[toColumn].length
        if (index > next[toColumn].length) index = next[toColumn].length
        next[toColumn].splice(index, 0, task)
        this.columns = next
      },
      commitColumnMove(fromKey, targetKey, before) {
        if (fromKey === targetKey) return
        const order = this.columnOrder.slice()
        const fromIndex = order.indexOf(fromKey)
        if (fromIndex < 0) return
        order.splice(fromIndex, 1)
        let toIndex = order.indexOf(targetKey)
        if (toIndex < 0) return
        if (!before) toIndex += 1
        order.splice(toIndex, 0, fromKey)
        this.columnOrder = order
      },
      isTaskPlaceholder(taskId) {
        return this.isDragging && this.drag.kind === 'task' && this.drag.taskId === taskId
      },
      isColumnPlaceholder(columnKey) {
        return this.isDragging && this.drag.kind === 'column' && this.drag.columnKey === columnKey
      },
      showTaskInsert(columnKey, index) {
        return (
          this.isDragging &&
          this.drag.kind === 'task' &&
          this.dropHint &&
          this.dropHint.type === 'task' &&
          this.dropHint.columnKey === columnKey &&
          this.dropHint.insertIndex === index
        )
      },
      overlayColumnTasks() {
        if (!this.overlay.columnKey) return []
        return (this.columns[this.overlay.columnKey] || []).slice(0, 3)
      },
    },
    template: `
      <div class="list-kanban-page" :class="{ 'is-dragging': isDragging }">
        <div class="kanban-header">
          <div>
            <h2>看板</h2>
            <p>拖拽管理任务，支持列排序、优先级与截止日期展示。</p>
          </div>
          <a-button type="primary" @click="openCreate">
            <template #icon><icon-plus /></template>
            新建任务
          </a-button>
        </div>

        <div class="kanban-board-scroll">
          <div class="kanban-board">
            <div
              v-for="columnKey in columnOrder"
              :key="columnKey"
              class="kanban-column"
              :data-kanban-column="columnKey"
              :class="{
                'is-drag-over': dropHint && dropHint.type === 'task' && dropHint.columnKey === columnKey,
                'is-placeholder': isColumnPlaceholder(columnKey),
              }"
            >
              <div class="kanban-column-header">
                <div class="kanban-column-title">
                  <span class="title-text">{{ columnTitle(columnKey) }}</span>
                  <a-tag size="small" class="kanban-count-tag">{{ (columns[columnKey] || []).length }}</a-tag>
                </div>
                <a-button
                  class="kanban-column-handle"
                  type="text"
                  size="mini"
                  @pointerdown="startColumnPointer(columnKey, $event)"
                >
                  <icon-drag-dot-vertical />
                </a-button>
              </div>

              <div class="kanban-task-list">
                <div
                  v-if="showTaskInsert(columnKey, 0)"
                  class="kanban-insert-line"
                ></div>
                <template v-for="(task, index) in (columns[columnKey] || [])" :key="task.id">
                  <div
                    class="kanban-task-card"
                    :data-kanban-task="task.id"
                    :class="{ 'is-placeholder': isTaskPlaceholder(task.id) }"
                    @pointerdown="startTaskPointer(task, columnKey, $event)"
                  >
                    <div class="kanban-task-top">
                      <span class="kanban-task-title" :title="task.title">{{ task.title }}</span>
                    <a-tag size="small" :color="priorityColor(task.priority)" :class="priorityTagClass(task.priority)">
                      {{ priorityLabel(task.priority) }}
                    </a-tag>
                    </div>
                    <div class="kanban-task-meta">
                      <div class="kanban-task-assignee" v-if="task.assignee">
                        <span class="dot"></span>
                        <span>{{ task.assignee }}</span>
                      </div>
                      <span v-else></span>
                      <time v-if="task.dueDate" class="kanban-task-due">{{ task.dueDate }}</time>
                    </div>
                  </div>
                  <div
                    v-if="showTaskInsert(columnKey, index + 1)"
                    class="kanban-insert-line"
                  ></div>
                </template>
              </div>
            </div>
          </div>
        </div>

        <teleport to="body">
          <div
            v-if="overlay.visible && overlay.kind === 'task' && overlay.task"
            class="kanban-drag-overlay kanban-drag-overlay--task"
            :style="overlayStyle"
          >
            <div class="kanban-task-card kanban-task-card--floating">
              <div class="kanban-task-top">
                <span class="kanban-task-title">{{ overlay.task.title }}</span>
                <a-tag size="small" :color="priorityColor(overlay.task.priority)" :class="priorityTagClass(overlay.task.priority)">
                  {{ priorityLabel(overlay.task.priority) }}
                </a-tag>
              </div>
              <div class="kanban-task-meta">
                <div class="kanban-task-assignee" v-if="overlay.task.assignee">
                  <span class="dot"></span>
                  <span>{{ overlay.task.assignee }}</span>
                </div>
                <span v-else></span>
                <time v-if="overlay.task.dueDate" class="kanban-task-due">{{ overlay.task.dueDate }}</time>
              </div>
            </div>
          </div>

          <div
            v-if="overlay.visible && overlay.kind === 'column'"
            class="kanban-drag-overlay kanban-drag-overlay--column"
            :style="overlayStyle"
          >
            <div class="kanban-column kanban-column--floating">
              <div class="kanban-column-header">
                <div class="kanban-column-title">
                  <span class="title-text">{{ columnTitle(overlay.columnKey) }}</span>
                  <a-tag size="small" class="kanban-count-tag">{{ (columns[overlay.columnKey] || []).length }}</a-tag>
                </div>
              </div>
              <div class="kanban-task-list">
                <div
                  v-for="task in overlayColumnTasks()"
                  :key="'ov-' + task.id"
                  class="kanban-task-card"
                >
                  <div class="kanban-task-top">
                    <span class="kanban-task-title">{{ task.title }}</span>
                    <a-tag size="small" :color="priorityColor(task.priority)" :class="priorityTagClass(task.priority)">
                      {{ priorityLabel(task.priority) }}
                    </a-tag>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="columnIndicatorStyle"
            class="kanban-column-indicator"
            :style="columnIndicatorStyle"
          ></div>
        </teleport>

        <a-modal
          v-model:visible="createVisible"
          title="新建任务"
          :width="440"
          unmount-on-close
          :on-before-ok="submitCreate"
          @cancel="createVisible = false"
        >
          <a-form
            ref="createFormRef"
            :model="createForm"
            :rules="createRules"
            layout="vertical"
          >
            <a-form-item label="任务标题" field="title" required>
              <a-input v-model="createForm.title" placeholder="任务标题…" allow-clear />
            </a-form-item>
            <a-form-item label="负责人" field="assignee" required>
              <a-input v-model="createForm.assignee" placeholder="请输入负责人姓名" allow-clear />
            </a-form-item>
            <a-form-item label="截止日期" field="dueDate" required>
              <a-date-picker
                v-model="createForm.dueDate"
                value-format="YYYY-MM-DD"
                style="width: 100%"
                placeholder="请选择截止日期"
              />
            </a-form-item>
            <a-form-item label="描述" field="description">
              <a-textarea
                v-model="createForm.description"
                placeholder="描述（可选）…"
                :auto-size="{ minRows: 3, maxRows: 6 }"
              />
            </a-form-item>
          </a-form>
          <p style="margin: 8px 0 0; color: var(--color-text-3); font-size: 13px;">
            添加一条新任务到待办列
          </p>
        </a-modal>

        <a-modal
          v-model:visible="detailVisible"
          title="任务详情"
          :width="480"
          :footer="false"
          unmount-on-close
          @cancel="closeDetail"
        >
          <template v-if="detailTask">
            <div class="kanban-detail">
              <div class="kanban-detail-title">{{ detailTask.title }}</div>
              <div class="kanban-detail-grid">
                <div class="kanban-detail-item">
                  <div class="kanban-detail-label">所在列</div>
                  <div class="kanban-detail-value">{{ columnTitle(detailColumnKey) }}</div>
                </div>
                <div class="kanban-detail-item">
                  <div class="kanban-detail-label">优先级</div>
                  <div class="kanban-detail-value">
                    <a-tag size="small" :color="priorityColor(detailTask.priority)" :class="priorityTagClass(detailTask.priority)">
                      {{ priorityLabel(detailTask.priority) }}
                    </a-tag>
                  </div>
                </div>
                <div class="kanban-detail-item">
                  <div class="kanban-detail-label">负责人</div>
                  <div class="kanban-detail-value">{{ detailTask.assignee || '—' }}</div>
                </div>
                <div class="kanban-detail-item">
                  <div class="kanban-detail-label">截止日期</div>
                  <div class="kanban-detail-value">{{ detailTask.dueDate || '—' }}</div>
                </div>
              </div>
              <div class="kanban-detail-desc">
                <div class="kanban-detail-label">描述</div>
                <div class="kanban-detail-value kanban-detail-value--block">
                  {{ detailTask.description || '暂无描述' }}
                </div>
              </div>
              <div class="kanban-detail-actions">
                <a-button type="primary" @click="closeDetail">关闭</a-button>
              </div>
            </div>
          </template>
        </a-modal>
      </div>
    `,
  }

  mountProPage({ pageKey: 'list/kanban', title: '任务看板', pageComponent: ListKanbanPage })
})()
