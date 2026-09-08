;(function () {
  const t = ArcoProLocale.listMasterDetail
  const { ticketTypes, priorities, statusLabels, assignees, customers } = ArcoProMock

  const priorityColors = ['gray', 'arcoblue', 'orangered', 'red']
  const statusBadge = ['warning', 'processing', 'success', null]
  const statusBadgeColor = [null, null, null, 'gray']

  function openConfirm(options) {
    return ArcoVue.Modal.confirm({
      simple: true,
      titleAlign: 'start',
      modalClass: 'pro-confirm-modal',
      width: 360,
      ...options,
    })
  }

  function emptyEditor() {
    return {
      id: '',
      title: '',
      ticketType: undefined,
      priority: undefined,
      status: undefined,
      assignee: undefined,
      customer: undefined,
      description: '',
    }
  }

  const ListMasterDetailPage = {
    name: 'ListMasterDetailPage',
    data() {
      return {
        t,
        ticketTypes,
        priorities,
        statusLabels,
        priorityColors,
        statusBadge,
        statusBadgeColor,
        keyword: '',
        statusFilter: '',
        loading: false,
        list: [],
        selectedId: '',
        modalVisible: false,
        saving: false,
        editor: emptyEditor(),
        isMobile: typeof window !== 'undefined' ? window.innerWidth <= 768 : false,
      }
    },
    computed: {
      filteredList() {
        let rows = this.list.slice()
        const kw = String(this.keyword || '')
          .trim()
          .toLowerCase()
        if (kw) {
          rows = rows.filter(
            (r) =>
              String(r.id || '')
                .toLowerCase()
                .includes(kw) ||
              String(r.title || '')
                .toLowerCase()
                .includes(kw) ||
              String(r.customer || '')
                .toLowerCase()
                .includes(kw)
          )
        }
        if (this.statusFilter !== '' && this.statusFilter != null) {
          rows = rows.filter((r) => r.status === this.statusFilter)
        }
        return rows
      },
      selected() {
        return this.list.find((r) => r.id === this.selectedId) || null
      },
      statusOptions() {
        return [
          { label: t.statusAll, value: '' },
          ...statusLabels.map((label, value) => ({ label, value })),
        ]
      },
      editorStatusOptions() {
        return statusLabels.map((label, value) => ({ label, value }))
      },
      ticketTypeOptions() {
        return ticketTypes.map((label, value) => ({ label, value }))
      },
      priorityOptions() {
        return priorities.map((label, value) => ({ label, value }))
      },
      assigneeOptions() {
        return assignees.map((label) => ({ label, value: label }))
      },
      customerOptions() {
        return customers.map((label) => ({ label, value: label }))
      },
      editorRules() {
        return {
          title: [{ required: true, message: t.titleRequired }],
          ticketType: [{ required: true, message: t.emptyTicketType }],
          priority: [{ required: true, message: t.emptyPriority }],
          status: [{ required: true, message: t.emptyStatus }],
          assignee: [{ required: true, message: t.emptyAssignee }],
          customer: [{ required: true, message: t.emptyCustomer }],
          description: [{ required: true, message: t.descriptionRequired }],
        }
      },
      modalWidth() {
        return this.isMobile ? 'calc(100vw - 32px)' : 520
      },
      editorColSpan() {
        return this.isMobile ? 24 : 12
      },
      detailTimeline() {
        const item = this.selected
        if (!item) return []
        const base = Number(item.createdAt) || Date.now()
        const hour = 3600 * 1000
        return [
          {
            label: '客户提交工单',
            content: item.customer + ' 通过工单门户提交问题，系统自动分配编号 ' + item.id,
            time: this.formatTime(base),
          },
          {
            label: '系统分派处理人',
            content: '按优先级与负载策略分派给 ' + item.assignee,
            time: this.formatTime(base + hour * 0.5),
          },
          {
            label: '首次响应',
            content: item.assignee + ' 确认问题现象，并向客户补充收集日志与截图',
            time: this.formatTime(base + hour * 2),
          },
          {
            label: '根因排查',
            content: '定位到「' + (this.ticketTypes[item.ticketType] || '业务') + '」链路异常，已拉起对应值班协同',
            time: this.formatTime(base + hour * 6),
          },
          {
            label: '临时方案已同步',
            content: '向客户提供绕行方案，并登记变更窗口与回滚预案',
            time: this.formatTime(base + hour * 12),
          },
          {
            label: '当前状态',
            content: this.statusLabels[item.status] || '-',
            time: this.formatTime(base + hour * 24),
          },
        ]
      },
      detailComments() {
        const item = this.selected
        if (!item) return []
        const base = Number(item.createdAt) || Date.now()
        const hour = 3600 * 1000
        return [
          {
            author: item.customer,
            role: '客户',
            time: this.formatTime(base + hour),
            body: '补充说明：问题在高峰期更容易复现，影响下单与支付回调核对。',
          },
          {
            author: item.assignee,
            role: '处理人',
            time: this.formatTime(base + hour * 3),
            body: '已收到日志。初步判断与第三方回调延迟有关，正在核对对账窗口。',
          },
          {
            author: '值班经理',
            role: '协同',
            time: this.formatTime(base + hour * 8),
            body: '建议同步财务侧关注异常订单，必要时开启灰度限流，避免扩散。',
          },
          {
            author: item.assignee,
            role: '处理人',
            time: this.formatTime(base + hour * 14),
            body: '临时补丁已上线预发环境，待客户验证通过后安排正式发布。',
          },
          {
            author: item.customer,
            role: '客户',
            time: this.formatTime(base + hour * 18),
            body: '预发验证通过，正式环境仍偶发。请继续跟进并同步预计恢复时间。',
          },
        ]
      },
      detailAttachments() {
        const item = this.selected
        if (!item) return []
        return [
          { name: item.id + '-error-log.txt', size: '248 KB', icon: 'icon-file', tone: 'txt' },
          { name: item.id + '-screenshot-01.png', size: '1.2 MB', icon: 'icon-image', tone: 'img' },
          { name: item.id + '-callback-trace.json', size: '86 KB', icon: 'icon-storage', tone: 'json' },
          { name: '复现步骤说明.docx', size: '64 KB', icon: 'icon-file', tone: 'doc' },
        ]
      },
    },
    mounted() {
      this._onResize = () => {
        this.isMobile = window.innerWidth <= 768
      }
      window.addEventListener('resize', this._onResize)
      this.fetchList()
    },
    beforeUnmount() {
      if (this._onResize) window.removeEventListener('resize', this._onResize)
    },
    methods: {
      fetchList() {
        this.loading = true
        setTimeout(() => {
          this.list = (ArcoProMock.listTableAll || []).map((row) => ({ ...row }))
          if (!this.selectedId && this.list.length) {
            this.selectedId = this.list[0].id
          } else if (this.selectedId && !this.list.find((r) => r.id === this.selectedId)) {
            this.selectedId = this.list[0] ? this.list[0].id : ''
          }
          this.loading = false
        }, 200)
      },
      onSelect(record) {
        this.selectedId = record.id
      },
      formatTime(v) {
        return ArcoProMock.formatDateTime(v)
      },
      onRefresh() {
        this.fetchList()
        ArcoVue.Message.success(t.refreshOk)
      },
      onEdit() {
        if (!this.selected) return
        this.editor = {
          id: this.selected.id,
          title: this.selected.title || '',
          ticketType: this.selected.ticketType,
          priority: this.selected.priority,
          status: this.selected.status,
          assignee: this.selected.assignee,
          customer: this.selected.customer,
          description: this.selected.description || '',
        }
        this.modalVisible = true
        this.$nextTick(() => {
          const formRef = this.$refs.editorFormRef
          if (formRef && typeof formRef.clearValidate === 'function') formRef.clearValidate()
        })
      },
      closeModal() {
        this.modalVisible = false
        this.saving = false
      },
      onSave() {
        const formRef = this.$refs.editorFormRef
        const runSave = () => {
          this.saving = true
          setTimeout(() => {
            const payload = {
              title: String(this.editor.title || '').trim(),
              ticketType: this.editor.ticketType,
              priority: this.editor.priority,
              status: this.editor.status,
              assignee: this.editor.assignee,
              customer: this.editor.customer,
              description: String(this.editor.description || '').trim(),
            }
            ArcoProMock.updateTicket(this.editor.id, payload)
            const idx = this.list.findIndex((r) => r.id === this.editor.id)
            if (idx >= 0) {
              this.list[idx] = { ...this.list[idx], ...payload }
            }
            ArcoVue.Message.success(t.saveOk)
            this.saving = false
            this.modalVisible = false
          }, 220)
        }
        if (formRef && typeof formRef.validate === 'function') {
          formRef.validate((errors) => {
            if (errors) return
            runSave()
          })
        } else {
          runSave()
        }
      },
      onDownload(name) {
        ArcoVue.Message.info(t.download + '：' + name + '（原型演示）')
      },
      onClose() {
        if (!this.selected) return
        openConfirm({
          title: t.close,
          content: t.closeConfirm,
          okText: t.close,
          cancelText: t.cancel,
          onOk: () => {
            ArcoProMock.closeTickets([this.selected.id])
            ArcoVue.Message.success(t.closeOk)
            this.fetchList()
          },
        })
      },
    },
    template: `
      <div class="list-master-detail-page">
        <div class="list-md-layout">
          <div class="list-md-master">
            <a-card class="general-card pro-page-card" :bordered="false">
              <div class="list-md-master-header">
                <div class="list-md-master-title-row">
                  <span class="list-md-master-title">{{ t.listTitle }}</span>
                  <span class="list-md-master-count">{{ filteredList.length }} {{ t.countUnit }}</span>
                </div>
                <a-input-search
                  v-model="keyword"
                  allow-clear
                  :placeholder="t.searchPh"
                />
                <a-select
                  v-model="statusFilter"
                  :options="statusOptions"
                  :placeholder="t.statusAll"
                  allow-clear
                />
              </div>
              <div class="list-md-list" :class="{ 'is-loading': loading }">
                <div v-if="loading" class="list-md-list-loading">
                  <a-spin />
                </div>
                <template v-else>
                  <div
                    v-for="item in filteredList"
                    :key="item.id"
                    class="list-md-item"
                    :class="{ 'is-active': item.id === selectedId }"
                    @click="onSelect(item)"
                  >
                    <div class="list-md-item-top">
                      <div class="list-md-item-title">{{ item.title }}</div>
                      <a-tag size="small" :color="priorityColors[item.priority]">
                        {{ priorities[item.priority] }}
                      </a-tag>
                    </div>
                    <div class="list-md-item-meta">
                      <span class="list-md-item-id">{{ item.id }}</span>
                      <span>{{ ticketTypes[item.ticketType] }}</span>
                      <span>{{ item.assignee }}</span>
                    </div>
                  </div>
                  <a-empty v-if="!filteredList.length" :description="t.emptyList" />
                </template>
              </div>
            </a-card>
          </div>

          <div class="list-md-detail">
            <a-card class="general-card" :bordered="false">
              <div v-if="!selected" class="list-md-detail-empty">
                <a-empty :description="t.emptyDetail" />
              </div>
              <div v-else class="list-md-detail-body">
                <div class="list-md-detail-header">
                  <div class="list-md-detail-header-main">
                    <div class="list-md-detail-heading">
                      <h3 class="list-md-detail-title">{{ selected.title }}</h3>
                      <div class="list-md-detail-tags">
                        <span class="list-md-detail-id">{{ selected.id }}</span>
                        <a-badge
                          v-if="statusBadge[selected.status]"
                          :status="statusBadge[selected.status]"
                          :text="statusLabels[selected.status]"
                        />
                        <a-badge
                          v-else
                          :color="statusBadgeColor[selected.status]"
                          :text="statusLabels[selected.status]"
                        />
                      </div>
                    </div>
                    <a-space wrap class="list-md-detail-actions">
                      <a-button @click="onRefresh">
                        <template #icon><icon-refresh /></template>{{ t.refresh }}
                      </a-button>
                      <a-button type="primary" @click="onEdit">{{ t.edit }}</a-button>
                      <a-button
                        status="warning"
                        :disabled="selected.status === 3"
                        @click="onClose"
                      >{{ t.close }}</a-button>
                    </a-space>
                  </div>
                  <div class="list-md-metric-grid list-md-metric-grid--header">
                    <div class="list-md-metric">
                      <div class="list-md-metric-label">{{ t.colSlaResponse }}</div>
                      <div class="list-md-metric-value">15 分钟</div>
                    </div>
                    <div class="list-md-metric">
                      <div class="list-md-metric-label">{{ t.colSlaResolve }}</div>
                      <div class="list-md-metric-value">4 小时</div>
                    </div>
                    <div class="list-md-metric list-md-metric--warn">
                      <div class="list-md-metric-label">{{ t.colSlaRemain }}</div>
                      <div class="list-md-metric-value">1 小时 20 分</div>
                    </div>
                    <div class="list-md-metric">
                      <div class="list-md-metric-label">{{ t.colImpactEnv }}</div>
                      <div class="list-md-metric-value">生产 / 华东</div>
                    </div>
                  </div>
                </div>

                <div class="list-md-detail-stack">
                  <section class="list-md-detail-section">
                    <h4 class="list-md-detail-section-title">{{ t.sectionOverview }}</h4>
                    <div class="list-md-field-grid">
                      <div class="list-md-field">
                        <div class="list-md-field-label">{{ t.colId }}</div>
                        <div class="list-md-field-value">{{ selected.id }}</div>
                      </div>
                      <div class="list-md-field">
                        <div class="list-md-field-label">{{ t.colTicketType }}</div>
                        <div class="list-md-field-value">{{ ticketTypes[selected.ticketType] }}</div>
                      </div>
                      <div class="list-md-field">
                        <div class="list-md-field-label">{{ t.colPriority }}</div>
                        <div class="list-md-field-value">{{ priorities[selected.priority] }}</div>
                      </div>
                      <div class="list-md-field">
                        <div class="list-md-field-label">{{ t.colStatus }}</div>
                        <div class="list-md-field-value">{{ statusLabels[selected.status] }}</div>
                      </div>
                      <div class="list-md-field">
                        <div class="list-md-field-label">{{ t.colAssignee }}</div>
                        <div class="list-md-field-value">{{ selected.assignee }}</div>
                      </div>
                      <div class="list-md-field">
                        <div class="list-md-field-label">{{ t.colCustomer }}</div>
                        <div class="list-md-field-value">{{ selected.customer }}</div>
                      </div>
                      <div class="list-md-field">
                        <div class="list-md-field-label">{{ t.colChannel }}</div>
                        <div class="list-md-field-value">工单门户 / API</div>
                      </div>
                      <div class="list-md-field">
                        <div class="list-md-field-label">{{ t.colCreatedTime }}</div>
                        <div class="list-md-field-value">{{ formatTime(selected.createdAt) }}</div>
                      </div>
                    </div>
                  </section>

                  <section class="list-md-detail-section">
                    <h4 class="list-md-detail-section-title">{{ t.sectionDescription }}</h4>
                    <div class="list-md-detail-desc-block">
                      <p class="list-md-detail-desc">{{ selected.description || '-' }}</p>
                      <p class="list-md-detail-desc list-md-detail-desc--secondary">复现路径：登录后台 → 进入相关业务页 → 在高峰窗口连续提交操作。偶现接口超时，前端提示失败但后端可能已落库，导致状态不一致。期望在 30 分钟内给出可执行的临时方案，并明确正式修复窗口。</p>
                    </div>
                  </section>

                  <section class="list-md-detail-section">
                    <h4 class="list-md-detail-section-title">{{ t.sectionImpact }}</h4>
                    <div class="list-md-field-grid">
                      <div class="list-md-field">
                        <div class="list-md-field-label">{{ t.colImpactUsers }}</div>
                        <div class="list-md-field-value">约 120 位活跃用户</div>
                      </div>
                      <div class="list-md-field">
                        <div class="list-md-field-label">{{ t.colImpactModules }}</div>
                        <div class="list-md-field-value">支付回调、对账核对</div>
                      </div>
                      <div class="list-md-field">
                        <div class="list-md-field-label">{{ t.colImpactEnv }}</div>
                        <div class="list-md-field-value">生产主集群；预发已验证临时补丁</div>
                      </div>
                    </div>
                  </section>

                  <section class="list-md-detail-section">
                    <h4 class="list-md-detail-section-title">{{ t.sectionTimeline }}</h4>
                    <div class="list-md-timeline-wrap">
                      <a-timeline>
                        <a-timeline-item
                          v-for="(node, idx) in detailTimeline"
                          :key="idx"
                        >
                          <div class="list-md-timeline-node">
                            <div class="list-md-timeline-top">
                              <span class="list-md-timeline-label">{{ node.label }}</span>
                              <span class="list-md-timeline-time">{{ node.time }}</span>
                            </div>
                            <p class="list-md-timeline-content">{{ node.content }}</p>
                          </div>
                        </a-timeline-item>
                      </a-timeline>
                    </div>
                  </section>

                  <section class="list-md-detail-section">
                    <h4 class="list-md-detail-section-title">{{ t.sectionComments }}</h4>
                    <div class="list-md-comment-list">
                      <div
                        v-for="(c, idx) in detailComments"
                        :key="idx"
                        class="list-md-comment"
                      >
                        <a-avatar :size="36" class="list-md-comment-avatar">{{ c.author.slice(0, 1) }}</a-avatar>
                        <div class="list-md-comment-main">
                          <div class="list-md-comment-meta">
                            <span class="list-md-comment-author">{{ c.author }}</span>
                            <a-tag size="small" color="arcoblue">{{ c.role }}</a-tag>
                            <span class="list-md-comment-time">{{ c.time }}</span>
                          </div>
                          <p class="list-md-comment-body">{{ c.body }}</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section class="list-md-detail-section">
                    <h4 class="list-md-detail-section-title">{{ t.sectionAttachments }}</h4>
                    <div class="list-md-attach-list">
                      <div
                        v-for="(file, idx) in detailAttachments"
                        :key="idx"
                        class="list-md-attach-item"
                      >
                        <div class="list-md-attach-main">
                          <span class="list-md-attach-icon" :class="'is-' + file.tone" aria-hidden="true">
                            <component :is="file.icon" />
                          </span>
                          <div class="list-md-attach-text">
                            <span class="list-md-attach-name" :title="file.name">{{ file.name }}</span>
                            <span class="list-md-attach-size">{{ file.size }}</span>
                          </div>
                        </div>
                        <a-button type="outline" size="mini" @click="onDownload(file.name)">
                          {{ t.download }}
                        </a-button>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </a-card>
          </div>
        </div>

        <a-modal
          v-if="modalVisible"
          :visible="true"
          :title="t.editTitle"
          title-align="start"
          :width="modalWidth"
          :footer="false"
          unmount-on-close
          @cancel="closeModal"
        >
          <a-form ref="editorFormRef" :model="editor" :rules="editorRules" layout="vertical">
            <a-form-item :label="t.colTitle" field="title" required asterisk-position="end">
              <a-input v-model="editor.title" :placeholder="t.phTitle" allow-clear />
            </a-form-item>
            <a-row :gutter="16">
              <a-col :span="editorColSpan">
                <a-form-item :label="t.colTicketType" field="ticketType" required asterisk-position="end">
                  <a-select v-model="editor.ticketType" :options="ticketTypeOptions" />
                </a-form-item>
              </a-col>
              <a-col :span="editorColSpan">
                <a-form-item :label="t.colPriority" field="priority" required asterisk-position="end">
                  <a-select v-model="editor.priority" :options="priorityOptions" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="editorColSpan">
                <a-form-item :label="t.colAssignee" field="assignee" required asterisk-position="end">
                  <a-select v-model="editor.assignee" :options="assigneeOptions" allow-search />
                </a-form-item>
              </a-col>
              <a-col :span="editorColSpan">
                <a-form-item :label="t.colCustomer" field="customer" required asterisk-position="end">
                  <a-select v-model="editor.customer" :options="customerOptions" allow-search />
                </a-form-item>
              </a-col>
            </a-row>
            <a-form-item :label="t.colStatus" field="status" required asterisk-position="end">
              <a-select v-model="editor.status" :options="editorStatusOptions" />
            </a-form-item>
            <a-form-item :label="t.colDescription" field="description" required asterisk-position="end">
              <a-textarea
                v-model="editor.description"
                :placeholder="t.phDescription"
                :auto-size="{ minRows: 3, maxRows: 6 }"
              />
            </a-form-item>
          </a-form>
          <div class="pro-modal-footer-actions">
            <a-space>
              <a-button @click="closeModal">{{ t.cancel }}</a-button>
              <a-button type="primary" :loading="saving" @click="onSave">{{ t.save }}</a-button>
            </a-space>
          </div>
        </a-modal>
      </div>
    `,
  }

  mountProPage({
    pageKey: 'list/master-detail',
    title: t.title,
    pageComponent: ListMasterDetailPage,
  })
})()
