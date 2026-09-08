;(function () {
  const t = ArcoProLocale.messageList

  const typeLabels = {
    message: t.typeMessage,
    notice: t.typeNotice,
    todo: t.typeTodo,
  }
  const typeColors = {
    message: 'arcoblue',
    notice: 'green',
    todo: 'orangered',
  }
  const readLabels = {
    unread: t.statusUnread,
    read: t.statusRead,
  }

  function openConfirm(options) {
    return ArcoVue.Modal.confirm({
      simple: true,
      titleAlign: 'start',
      modalClass: 'pro-confirm-modal',
      width: 360,
      ...options,
    })
  }

  function emptyForm() {
    return {
      title: '',
      msgType: '',
      readStatus: '',
      sender: '',
      createdTime: [],
      keyword: '',
    }
  }

  function pad(n) {
    return String(n).padStart(2, '0')
  }

  function formatDateTime(d) {
    if (!(d instanceof Date)) d = new Date(d)
    return (
      d.getFullYear() +
      '-' +
      pad(d.getMonth() + 1) +
      '-' +
      pad(d.getDate()) +
      ' ' +
      pad(d.getHours()) +
      ':' +
      pad(d.getMinutes()) +
      ':' +
      pad(d.getSeconds())
    )
  }

  function createSeedMessages() {
    const now = Date.now()
    const day = 24 * 60 * 60 * 1000
    const seeds = [
      {
        title: '协作评论回复提醒',
        content: '关于本周内容排期的回复已更新，请尽快确认。',
        msgType: 'message',
        sender: '协作中心',
        readStatus: 'unread',
        createdAt: now - 2 * 60 * 60 * 1000,
      },
      {
        title: '内容动态订阅提醒',
        content: '有新的内容动态订阅已生效，可在消息中心查看。',
        msgType: 'message',
        sender: '消息中心',
        readStatus: 'unread',
        createdAt: now - 5 * 60 * 60 * 1000,
      },
      {
        title: '内容中心催更提醒',
        content: '你的内容还未更新，请及时更新。',
        msgType: 'message',
        sender: '内容中心',
        readStatus: 'unread',
        createdAt: now - day,
      },
      {
        title: '内容发布审核通过',
        content: '你提交的《每日推荐视频集》已通过审核。',
        msgType: 'notice',
        sender: '审核中心',
        readStatus: 'unread',
        createdAt: now - 3 * 60 * 60 * 1000,
      },
      {
        title: '系统维护通知',
        content: '本周六 02:00–04:00 将进行系统维护，期间部分功能不可用。',
        msgType: 'notice',
        sender: '系统通知',
        readStatus: 'read',
        createdAt: now - 2 * day,
      },
      {
        title: '版本更新说明',
        content: 'Vibe Design Pro 原型库已更新至 1.1.0，请查阅发版说明。',
        msgType: 'notice',
        sender: '产品团队',
        readStatus: 'read',
        createdAt: now - 3 * day,
      },
      {
        title: '完成「用户反馈」工单跟进',
        content: '请在今日 18:00 前完成用户反馈工单的跟进回复。',
        msgType: 'todo',
        sender: '项目管理',
        readStatus: 'unread',
        createdAt: now - 4 * 60 * 60 * 1000,
      },
      {
        title: '确认本周投放计划',
        content: '请确认本周内容投放计划并提交审核。',
        msgType: 'todo',
        sender: '运营中心',
        readStatus: 'unread',
        createdAt: now - day - 2 * 60 * 60 * 1000,
      },
      {
        title: '填写季度复盘报告',
        content: '季度复盘报告模板已下发，请于周五前提交。',
        msgType: 'todo',
        sender: '人力行政',
        readStatus: 'read',
        createdAt: now - 4 * day,
      },
      {
        title: '会议纪要提及提醒',
        content: '在《内容运营周会》纪要中提到了你，请查看。',
        msgType: 'message',
        sender: '会议助手',
        readStatus: 'read',
        createdAt: now - 5 * day,
      },
      {
        title: '权限变更通知',
        content: '你已被授予「内容审核」角色，相关菜单已开放。',
        msgType: 'notice',
        sender: '权限中心',
        readStatus: 'unread',
        createdAt: now - 6 * 60 * 60 * 1000,
      },
      {
        title: '完善个人资料',
        content: '请补充手机号与所属部门，以便接收重要通知。',
        msgType: 'todo',
        sender: '账号安全',
        readStatus: 'read',
        createdAt: now - 6 * day,
      },
    ]
    return seeds.map((item, i) => ({
      id: 'MSG' + String(2026080001 + i),
      ...item,
    }))
  }

  const messageStore = {
    list: createSeedMessages(),
    filter(params) {
      const p = params || {}
      return this.list.filter((row) => {
        if (p.title && !String(row.title).includes(String(p.title).trim())) return false
        if (p.msgType && row.msgType !== p.msgType) return false
        if (p.readStatus && row.readStatus !== p.readStatus) return false
        if (p.sender && row.sender !== p.sender) return false
        if (p.keyword) {
          const kw = String(p.keyword).trim()
          if (!row.content.includes(kw) && !row.title.includes(kw)) return false
        }
        if (p.createdTime && p.createdTime.length === 2) {
          const start = new Date(p.createdTime[0]).getTime()
          const end = new Date(p.createdTime[1]).getTime() + 24 * 60 * 60 * 1000 - 1
          if (row.createdAt < start || row.createdAt > end) return false
        }
        return true
      })
    },
    paginate(rows, page, pageSize) {
      const total = rows.length
      const start = (page - 1) * pageSize
      return { list: rows.slice(start, start + pageSize), total }
    },
    getById(id) {
      return this.list.find((r) => r.id === id) || null
    },
    remove(id) {
      const i = this.list.findIndex((r) => r.id === id)
      if (i < 0) return false
      this.list.splice(i, 1)
      return true
    },
    removeMany(ids) {
      const set = new Set(ids)
      const before = this.list.length
      this.list = this.list.filter((r) => !set.has(r.id))
      return before - this.list.length
    },
    markRead(ids) {
      const set = new Set(ids)
      let n = 0
      this.list.forEach((r) => {
        if (set.has(r.id) && r.readStatus === 'unread') {
          r.readStatus = 'read'
          n += 1
        }
      })
      return n
    },
  }

  function createDefaultColumns(locale) {
    return [
      { title: locale.colTitle, dataIndex: 'title', minWidth: 200, ellipsis: true, tooltip: true },
      { title: locale.colMsgType, dataIndex: 'msgType', width: 100, slotName: 'msgType' },
      { title: locale.colSender, dataIndex: 'sender', width: 110 },
      { title: locale.colReadStatus, dataIndex: 'readStatus', width: 100, slotName: 'readStatus' },
      { title: locale.colCreatedTime, dataIndex: 'createdAt', width: 180, slotName: 'createdAt' },
      {
        title: locale.colOperations,
        dataIndex: 'operations',
        width: 200,
        fixed: 'right',
        slotName: 'operations',
      },
    ]
  }

  const MessageListPage = {
    name: 'MessageListPage',
    data() {
      const defaultColumns = createDefaultColumns(t)
      return {
        t,
        typeLabels,
        typeColors,
        readLabels,
        form: emptyForm(),
        isMobile: typeof window !== 'undefined' ? window.innerWidth <= 768 : false,
        data: [],
        loading: false,
        selectedKeys: [],
        pagination: {
          current: 1,
          pageSize: 20,
          total: 0,
        },
        allColumns: defaultColumns.map((col) => ({ ...col })),
        showColumnKeys: defaultColumns.map((col) => col.dataIndex),
        dragColIndex: -1,
        dragOverColIndex: -1,
        tableSize: window.ArcoProTablePrefs ? ArcoProTablePrefs.getDensity() : 'medium',
        tableHostWidth: 0,
        drawerVisible: false,
        detail: null,
      }
    },
    computed: {
      msgTypeOptions() {
        return Object.keys(typeLabels).map((value) => ({ label: typeLabels[value], value }))
      },
      readStatusOptions() {
        return Object.keys(readLabels).map((value) => ({ label: readLabels[value], value }))
      },
      senderOptions() {
        const set = new Set(messageStore.list.map((r) => r.sender))
        return Array.from(set).map((label) => ({ label, value: label }))
      },
      drawerWidth() {
        return this.isMobile ? '100%' : 560
      },
      detailDrawerTitle() {
        if (!this.detail) return this.t.detailTitle
        return this.t.detailTitle + '（' + this.detail.id + '）'
      },
      tableLayout() {
        const visible = this.allColumns.filter((col) => this.showColumnKeys.includes(col.dataIndex))
        const prefs = window.ArcoProTablePrefs
        if (prefs && prefs.layoutTableColumns) {
          const preferredWidths = {}
          createDefaultColumns(this.t).forEach((col) => {
            const w = Number(col.width != null ? col.width : col.minWidth)
            preferredWidths[col.dataIndex] = Number.isFinite(w) && w > 0 ? w : 120
          })
          return prefs.layoutTableColumns(visible, {
            selectionWidth: 48,
            containerWidth: this.tableHostWidth,
            preferredWidths,
          })
        }
        return { columns: visible, scroll: { x: 880 } }
      },
      tableScroll() {
        return this.tableLayout.scroll
      },
      opsBtnSize() {
        const prefs = window.ArcoProTablePrefs
        return prefs && prefs.opsButtonSize ? prefs.opsButtonSize(this.tableSize) : 'small'
      },

      columns() {
        return this.tableLayout.columns
      },
      densityOptions() {
        return [
          { label: this.t.densityDefault, value: 'medium' },
          { label: this.t.densityMedium, value: 'small' },
          { label: this.t.densitySmall, value: 'mini' },
        ]
      },
      columnSettingOptions() {
        const dataKeys = this.showColumnKeys.filter((k) => k !== 'operations')
        const onlyOne = dataKeys.length <= 1
        return this.allColumns.map((col) => ({
          label: col.title,
          value: col.dataIndex,
          disabled: col.dataIndex === 'operations' || (onlyOne && dataKeys.includes(col.dataIndex)),
        }))
      },
    },
    mounted() {
      this._measureTableHost =
        window.ArcoProTablePrefs && ArcoProTablePrefs.createTableHostMeasurer
          ? ArcoProTablePrefs.createTableHostMeasurer(this)
          : () => {}
      this._onResize = () => {
        this.isMobile = window.innerWidth <= 768
        this._measureTableHost()
      }
      window.addEventListener('resize', this._onResize)
      this.$nextTick(() => this._measureTableHost())
      this.fetchData(1, this.pagination.pageSize, this.form)
    },
    beforeUnmount() {
      if (this._onResize) window.removeEventListener('resize', this._onResize)
      if (this._measureTableHost && this._measureTableHost.disconnect) {
        this._measureTableHost.disconnect()
      }
    },
    methods: {
      emptyForm,
      fetchData(page, pageSize, params) {
        this.loading = true
        setTimeout(() => {
          const filtered = messageStore.filter(params || this.form)
          const res = messageStore.paginate(filtered, page, pageSize)
          this.data = res.list
          this.pagination = { ...this.pagination, current: page, pageSize, total: res.total }
          this.selectedKeys = []
          this.loading = false
        }, 280)
      },
      onSearch() {
        this.fetchData(1, this.pagination.pageSize, this.form)
      },
      onReset() {
        this.form = emptyForm()
        this.fetchData(1, this.pagination.pageSize, {})
      },
      onPageChange(page) {
        this.fetchData(page, this.pagination.pageSize, this.form)
      },
      onPageSizeChange(pageSize) {
        this.fetchData(1, pageSize, this.form)
      },
      onSelectionChange(keys) {
        this.selectedKeys = keys
      },
      formatTime(v) {
        return formatDateTime(v)
      },
      openDetail(record) {
        if (record.readStatus === 'unread') {
          messageStore.markRead([record.id])
          record.readStatus = 'read'
        }
        this.detail = { ...messageStore.getById(record.id) }
        this.drawerVisible = true
        this.fetchData(this.pagination.current, this.pagination.pageSize, this.form)
      },
      closeDrawer() {
        this.drawerVisible = false
      },
      onDelete(record) {
        openConfirm({
          title: this.t.remove,
          content: this.t.deleteConfirm,
          okText: this.t.remove,
          cancelText: this.t.cancel,
          okButtonProps: { status: 'danger' },
          onOk: () => {
            messageStore.remove(record.id)
            ArcoVue.Message.success(this.t.deleteOk)
            if (this.detail && this.detail.id === record.id) this.drawerVisible = false
            const page =
              this.data.length <= 1 && this.pagination.current > 1
                ? this.pagination.current - 1
                : this.pagination.current
            this.fetchData(page, this.pagination.pageSize, this.form)
          },
        })
      },
      onMarkRead(record) {
        if (record.readStatus === 'read') {
          ArcoVue.Message.info(this.t.alreadyRead)
          return
        }
        messageStore.markRead([record.id])
        ArcoVue.Message.success(this.t.markReadOk)
        if (this.detail && this.detail.id === record.id) {
          this.detail = { ...messageStore.getById(record.id) }
        }
        this.fetchData(this.pagination.current, this.pagination.pageSize, this.form)
      },
      onRefreshTable() {
        this.fetchData(this.pagination.current, this.pagination.pageSize, this.form)
        ArcoVue.Message.success(this.t.refreshOk)
      },
      onDensityChange(size) {
        this.tableSize = size
        if (window.ArcoProTablePrefs) ArcoProTablePrefs.setDensity(size)
      },
      onColumnCheckChange(key, checked) {
        if (key === 'operations') return
        if (checked) {
          if (!this.showColumnKeys.includes(key)) {
            this.showColumnKeys = [...this.showColumnKeys, key]
          }
        } else {
          const remaining = this.showColumnKeys.filter((k) => k !== key && k !== 'operations')
          if (!remaining.length) {
            if (window.ArcoVue && ArcoVue.Message) {
              ArcoVue.Message.warning(
                (window.ArcoProTablePrefs && ArcoProTablePrefs.keepOneDataColumnTip) ||
                  '\u81f3\u5c11\u4fdd\u7559\u4e00\u5217'
              )
            }
            return
          }
          this.showColumnKeys = this.showColumnKeys.filter((k) => k !== key)
        }
      },
      onColDragStart(index, e) {
        this.dragColIndex = index
        e.dataTransfer.effectAllowed = 'move'
        try {
          e.dataTransfer.setData('text/plain', String(index))
        } catch (_) {}
      },
      onColDragOver(index, e) {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        if (this.dragOverColIndex !== index) this.dragOverColIndex = index
      },
      onColDragLeave(index) {
        if (this.dragOverColIndex === index) this.dragOverColIndex = -1
      },
      onColDrop(index) {
        const from = this.dragColIndex
        this.dragColIndex = -1
        this.dragOverColIndex = -1
        if (from < 0 || from === index) return
        const next = this.allColumns.slice()
        const [item] = next.splice(from, 1)
        next.splice(index, 0, item)
        this.allColumns = next
      },
      onColDragEnd() {
        this.dragColIndex = -1
        this.dragOverColIndex = -1
      },
      resetColumnSetting() {
        const defaults = createDefaultColumns(this.t)
        this.allColumns = defaults.map((col) => ({ ...col }))
        this.showColumnKeys = defaults.map((col) => col.dataIndex)
      },
      ensureSelection() {
        if (!this.selectedKeys.length) {
          ArcoVue.Message.warning(this.t.selectRequired)
          return false
        }
        return true
      },
      onBatchDelete() {
        if (!this.ensureSelection()) return
        openConfirm({
          title: this.t.batchDelete,
          content: this.t.batchDeleteConfirm,
          okText: this.t.remove,
          cancelText: this.t.cancel,
          okButtonProps: { status: 'danger' },
          onOk: () => {
            const n = messageStore.removeMany(this.selectedKeys)
            ArcoVue.Message.success(this.t.deleteOk + '（' + n + ' 条）')
            if (this.detail && this.selectedKeys.includes(this.detail.id)) {
              this.drawerVisible = false
            }
            const page =
              this.data.length <= this.selectedKeys.length && this.pagination.current > 1
                ? this.pagination.current - 1
                : this.pagination.current
            this.fetchData(page, this.pagination.pageSize, this.form)
          },
        })
      },
      onBatchMarkRead() {
        if (!this.ensureSelection()) return
        const n = messageStore.markRead(this.selectedKeys)
        ArcoVue.Message.success(this.t.batchMarkReadOk + '（' + n + ' 条）')
        this.fetchData(this.pagination.current, this.pagination.pageSize, this.form)
      },
    },
    template: `
      <div class="message-list-page list-search-table-page">
        <a-card class="general-card pro-page-card">
          <a-row class="pro-search-panel">
            <a-col :flex="isMobile ? '100%' : 1">
              <a-form
                class="pro-search-form"
                :model="form"
                :layout="isMobile ? 'vertical' : 'horizontal'"
                :label-col-props="isMobile ? undefined : { flex: '6em' }"
                :wrapper-col-props="isMobile ? undefined : { flex: 1 }"
                label-align="left"
              >
                <a-row :gutter="16">
                  <a-col :xs="24" :sm="isMobile ? 24 : 12" :md="8">
                    <a-form-item field="title" :label="t.colTitle">
                      <a-input v-model="form.title" :placeholder="t.phTitle" allow-clear @press-enter="onSearch" />
                    </a-form-item>
                  </a-col>
                  <a-col :xs="24" :sm="isMobile ? 24 : 12" :md="8">
                    <a-form-item field="msgType" :label="t.colMsgType">
                      <a-select
                        v-model="form.msgType"
                        :options="msgTypeOptions"
                        :placeholder="t.selectDefault"
                        allow-clear
                      />
                    </a-form-item>
                  </a-col>
                  <a-col :xs="24" :sm="isMobile ? 24 : 12" :md="8">
                    <a-form-item field="readStatus" :label="t.colReadStatus">
                      <a-select
                        v-model="form.readStatus"
                        :options="readStatusOptions"
                        :placeholder="t.selectDefault"
                        allow-clear
                      />
                    </a-form-item>
                  </a-col>
                  <a-col :xs="24" :sm="isMobile ? 24 : 12" :md="8">
                    <a-form-item field="sender" :label="t.colSender">
                      <a-select
                        v-model="form.sender"
                        :options="senderOptions"
                        :placeholder="t.selectDefault"
                        allow-clear
                        allow-search
                      />
                    </a-form-item>
                  </a-col>
                  <a-col :xs="24" :sm="isMobile ? 24 : 12" :md="8">
                    <a-form-item field="createdTime" :label="t.colCreatedTime">
                      <a-range-picker v-model="form.createdTime" class="pro-field-block" />
                    </a-form-item>
                  </a-col>
                  <a-col :xs="24" :sm="isMobile ? 24 : 12" :md="8">
                    <a-form-item field="keyword" :label="t.colKeyword">
                      <a-input
                        v-model="form.keyword"
                        :placeholder="t.phKeyword"
                        allow-clear
                        @press-enter="onSearch"
                      />
                    </a-form-item>
                  </a-col>
                </a-row>
              </a-form>
            </a-col>
            <a-divider v-if="!isMobile" class="pro-search-divider" direction="vertical" />
            <a-col
              :flex="isMobile ? '100%' : '86px'"
              class="pro-search-actions"
              :class="{ 'is-mobile': isMobile }"
            >
              <a-button type="primary" @click="onSearch">
                <template #icon><icon-search /></template>{{ t.search }}
              </a-button>
              <a-button @click="onReset">
                <template #icon><icon-refresh /></template>{{ t.reset }}
              </a-button>
            </a-col>
          </a-row>
        </a-card>

        <a-card class="general-card">
          <div class="pro-toolbar">
            <a-space>
              <a-button type="primary" :disabled="!selectedKeys.length" @click="onBatchMarkRead">{{ t.batchMarkRead }}</a-button>
            </a-space>
            <div class="pro-toolbar-right">
              <div class="pro-toolbar-icons">
                <a-tooltip :content="t.refresh">
                  <a-button class="pro-toolbar-icon-btn" @click="onRefreshTable">
                    <template #icon><icon-refresh /></template>
                  </a-button>
                </a-tooltip>
                <a-dropdown trigger="click" @select="onDensityChange">
                  <a-tooltip :content="t.density">
                    <a-button class="pro-toolbar-icon-btn">
                      <template #icon><icon-line-height /></template>
                    </a-button>
                  </a-tooltip>
                  <template #content>
                    <a-doption
                      v-for="opt in densityOptions"
                      :key="opt.value"
                      :value="opt.value"
                      :class="{ 'arco-dropdown-option-active': tableSize === opt.value }"
                    >{{ opt.label }}</a-doption>
                  </template>
                </a-dropdown>
                <a-popover trigger="click" position="br" content-class="pro-column-popover">
                  <a-tooltip :content="t.columnSetting">
                    <a-button class="pro-toolbar-icon-btn">
                      <template #icon><icon-settings /></template>
                    </a-button>
                  </a-tooltip>
                  <template #content>
                    <div class="pro-column-setting">
                      <div class="pro-column-setting-list">
                        <div
                          v-for="(opt, index) in columnSettingOptions"
                          :key="opt.value"
                          class="pro-column-setting-item"
                          :class="{
                            'is-dragging': dragColIndex === index,
                            'is-drag-over': dragOverColIndex === index && dragColIndex !== index,
                          }"
                          @dragover="onColDragOver(index, $event)"
                          @dragleave="onColDragLeave(index)"
                          @drop.prevent="onColDrop(index)"
                        >
                          <span
                            class="pro-column-drag"
                            draggable="true"
                            @dragstart="onColDragStart(index, $event)"
                            @dragend="onColDragEnd"
                          >
                            <icon-drag-dot-vertical />
                          </span>
                          <a-checkbox
                            :model-value="showColumnKeys.includes(opt.value)"
                            :disabled="opt.disabled"
                            @change="(checked) => onColumnCheckChange(opt.value, checked)"
                          >{{ opt.label }}</a-checkbox>
                        </div>
                      </div>
                      <div class="pro-column-setting-footer">
                        <a-button type="text" size="small" @click="resetColumnSetting">{{ t.columnReset }}</a-button>
                      </div>
                    </div>
                  </template>
                </a-popover>
              </div>
            </div>
          </div>
          <a-table
            :columns="columns"
            :data="data"
            :loading="loading"
            :size="tableSize"
            row-key="id"
            :pagination="false"
            :bordered="false"
            :scroll="tableScroll"
            :row-selection="{ type: 'checkbox', showCheckedAll: true, width: 48 }"
            :selected-keys="selectedKeys"
            @selection-change="onSelectionChange"
          >
            <template #msgType="{ record }">
              <a-tag :color="typeColors[record.msgType]" size="small">
                {{ typeLabels[record.msgType] }}
              </a-tag>
            </template>
            <template #readStatus="{ record }">
              <a-badge
                :status="record.readStatus === 'unread' ? undefined : 'success'"
                :color="record.readStatus === 'unread' ? 'red' : undefined"
                :text="readLabels[record.readStatus]"
              />
            </template>
            <template #createdAt="{ record }">{{ formatTime(record.createdAt) }}</template>
            <template #operations="{ record }">
              <a-space class="pro-table-ops" :size="4">
                <a-button type="text" :size="opsBtnSize" @click="openDetail(record)">{{ t.view }}</a-button>
                <a-button
                  type="text"
                  :size="opsBtnSize"
                  :disabled="record.readStatus === 'read'"
                  @click="onMarkRead(record)"
                >{{ t.markRead }}</a-button>
                <a-button type="text" status="danger" :size="opsBtnSize" @click="onDelete(record)">{{ t.remove }}</a-button>
              </a-space>
            </template>
          </a-table>
          <div class="pro-table-footer">
            <a-space>
              <a-button :disabled="!selectedKeys.length" @click="onBatchDelete">{{ t.batchDelete }}</a-button>
            </a-space>
            <a-pagination
              v-model:current="pagination.current"
              :total="pagination.total"
              :page-size="pagination.pageSize"
              show-total
              show-page-size
              @change="onPageChange"
              @page-size-change="onPageSizeChange"
            />
          </div>
        </a-card>

        <a-drawer
          v-if="drawerVisible"
          :visible="true"
          :title="detailDrawerTitle"
          :width="drawerWidth"
          unmount-on-close
          @cancel="closeDrawer"
        >
          <div v-if="detail" class="pro-detail">
            <section class="pro-detail-section">
              <h3 class="pro-detail-section-title">{{ t.detailOverview }}</h3>
              <div class="pro-detail-grid">
                <div class="pro-detail-field pro-detail-field--full">
                  <div class="pro-detail-label">{{ t.colTitle }}</div>
                  <div class="pro-detail-value">{{ detail.title }}</div>
                </div>
                <div class="pro-detail-field">
                  <div class="pro-detail-label">{{ t.colMsgType }}</div>
                  <div class="pro-detail-value">
                    <a-tag :color="typeColors[detail.msgType]" size="small">
                      {{ typeLabels[detail.msgType] }}
                    </a-tag>
                  </div>
                </div>
                <div class="pro-detail-field">
                  <div class="pro-detail-label">{{ t.colSender }}</div>
                  <div class="pro-detail-value">{{ detail.sender }}</div>
                </div>
                <div class="pro-detail-field">
                  <div class="pro-detail-label">{{ t.colReadStatus }}</div>
                  <div class="pro-detail-value">
                    <a-badge
                      :status="detail.readStatus === 'unread' ? undefined : 'success'"
                      :color="detail.readStatus === 'unread' ? 'red' : undefined"
                      :text="readLabels[detail.readStatus]"
                    />
                  </div>
                </div>
                <div class="pro-detail-field">
                  <div class="pro-detail-label">{{ t.colCreatedTime }}</div>
                  <div class="pro-detail-value">{{ formatTime(detail.createdAt) }}</div>
                </div>
              </div>
            </section>

            <section class="pro-detail-section">
              <h3 class="pro-detail-section-title">{{ t.detailContent }}</h3>
              <div class="pro-detail-grid">
                <div class="pro-detail-field pro-detail-field--full">
                  <div class="pro-detail-label">{{ t.colContent }}</div>
                  <div class="pro-detail-value pro-detail-value--multiline">{{ detail.content || '—' }}</div>
                </div>
              </div>
            </section>
          </div>
          <template #footer>
            <a-button type="primary" @click="closeDrawer">{{ t.cancel }}</a-button>
          </template>
        </a-drawer>

      </div>
    `,
  }

  mountProPage({ pageKey: 'user/message', title: '消息管理', pageComponent: MessageListPage })
})()
