;(function () {
  const t = ArcoProLocale.listEditable
  const { ticketTypes, priorities, statusLabels, assignees, customers } = ArcoProMock

  const priorityColors = ['gray', 'arcoblue', 'orangered', 'red']
  const statusBadge = ['warning', 'processing', 'success', null]
  const statusBadgeColor = [null, null, null, 'gray']

  function cloneRows(list) {
    return (list || []).map((row) => ({
      ...row,
      _dirty: false,
      _editing: false,
      _backup: null,
    }))
  }

  function snapshot(row) {
    return {
      title: row.title,
      ticketType: row.ticketType,
      priority: row.priority,
      assignee: row.assignee,
      customer: row.customer,
      status: row.status,
    }
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

  function createDefaultColumns(locale) {
    return [
      { title: locale.colId, dataIndex: 'id', width: 150 },
      { title: locale.colTitle, dataIndex: 'title', minWidth: 160, slotName: 'ticketTitle' },
      { title: locale.colTicketType, dataIndex: 'ticketType', width: 100, slotName: 'ticketType' },
      { title: locale.colPriority, dataIndex: 'priority', width: 100, slotName: 'priority' },
      { title: locale.colAssignee, dataIndex: 'assignee', width: 100, slotName: 'assignee' },
      { title: locale.colCustomer, dataIndex: 'customer', width: 110, slotName: 'customer' },
      { title: locale.colStatus, dataIndex: 'status', width: 110, slotName: 'status' },
      {
        title: locale.colOperations,
        dataIndex: 'operations',
        width: 160,
        fixed: 'right',
        slotName: 'operations',
      },
    ]
  }

  const ListEditablePage = {
    name: 'ListEditablePage',
    data() {
      const defaultColumns = createDefaultColumns(t)
      return {
        t,
        ticketTypes,
        priorities,
        statusLabels,
        assignees,
        customers,
        priorityColors,
        statusBadge,
        statusBadgeColor,
        loading: false,
        saving: false,
        keyword: '',
        data: [],
        selectedKeys: [],
        isMobile: typeof window !== 'undefined' ? window.innerWidth <= 768 : false,
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
        exportVisible: false,
        exporting: false,
        exportForm: {
          scope: 'all',
          format: 'xlsx',
        },
      }
    },
    computed: {
      ticketTypeOptions() {
        return ticketTypes.map((label, value) => ({ label, value }))
      },
      priorityOptions() {
        return priorities.map((label, value) => ({ label, value }))
      },
      statusOptions() {
        return statusLabels.map((label, value) => ({ label, value }))
      },
      assigneeOptions() {
        return assignees.map((label) => ({ label, value: label }))
      },
      customerOptions() {
        return customers.map((label) => ({ label, value: label }))
      },
      dirtyCount() {
        return this.data.filter((r) => r._dirty || r._editing).length
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
        return { columns: visible, scroll: { x: 1080 } }
      },
      tableScroll() {
        return this.tableLayout.scroll
      },
      opsBtnSize() {
        const prefs = window.ArcoProTablePrefs
        return prefs && prefs.opsButtonSize ? prefs.opsButtonSize(this.tableSize) : 'small'
      },

      ioModalWidth() {
        return this.isMobile ? 'calc(100vw - 32px)' : 520
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
      exportScopeOptions() {
        return [
          {
            label: this.t.exportScopeSelected + '（' + this.selectedKeys.length + '）',
            value: 'selected',
            disabled: !this.selectedKeys.length,
          },
          {
            label: this.t.exportScopePage + '（' + this.data.length + '）',
            value: 'page',
          },
          {
            label: this.t.exportScopeAll + '（' + this.pagination.total + '）',
            value: 'all',
          },
        ]
      },
      exportFormatOptions() {
        return [
          { label: this.t.exportFormatXlsx, value: 'xlsx' },
          { label: this.t.exportFormatCsv, value: 'csv' },
        ]
      },
      exportCount() {
        if (this.exportForm.scope === 'selected') return this.selectedKeys.length
        if (this.exportForm.scope === 'page') return this.data.length
        return this.pagination.total
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
      this.fetchData(1, this.pagination.pageSize)
    },
    beforeUnmount() {
      if (this._onResize) window.removeEventListener('resize', this._onResize)
      if (this._measureTableHost && this._measureTableHost.disconnect) {
        this._measureTableHost.disconnect()
      }
    },
    methods: {
      fetchData(page, pageSize) {
        this.loading = true
        setTimeout(() => {
          const filtered = ArcoProMock.filterListTable({ keyword: this.keyword })
          const res = ArcoProMock.paginate(filtered, page, pageSize)
          this.data = cloneRows(res.list)
          this.pagination = { ...this.pagination, current: page, pageSize, total: res.total }
          this.selectedKeys = []
          this.loading = false
        }, 220)
      },
      onSelectionChange(keys) {
        this.selectedKeys = keys
      },
      ensureSelection() {
        if (!this.selectedKeys.length) {
          ArcoVue.Message.warning(t.selectRequired)
          return false
        }
        return true
      },
      onBatchDelete() {
        if (!this.ensureSelection()) return
        openConfirm({
          title: t.batchDelete,
          content: t.batchDeleteConfirm,
          okText: t.remove,
          cancelText: t.cancel,
          okButtonProps: { status: 'danger' },
          onOk: () => {
            const n = ArcoProMock.removeTickets(this.selectedKeys)
            ArcoVue.Message.success(t.deleteOk + '（' + n + ' 条）')
            const page =
              this.data.length <= this.selectedKeys.length && this.pagination.current > 1
                ? this.pagination.current - 1
                : this.pagination.current
            this.fetchData(page, this.pagination.pageSize)
          },
        })
      },
      onExport() {
        this.exportForm = {
          scope: this.selectedKeys.length ? 'selected' : 'all',
          format: 'xlsx',
        }
        this.exportVisible = true
      },
      closeExport() {
        this.exportVisible = false
        this.exporting = false
      },
      submitExport() {
        this.exporting = true
        setTimeout(() => {
          this.exporting = false
          this.exportVisible = false
          ArcoVue.Message.success(
            t.exportOk + '（' + this.exportCount + ' 条 · ' + this.exportForm.format.toUpperCase() + '）'
          )
        }, 500)
      },
      onSearch() {
        this.fetchData(1, this.pagination.pageSize)
      },
      onRefreshTable() {
        if (this.dirtyCount) {
          ArcoVue.Message.warning(t.unsavedWarn)
          return
        }
        this.fetchData(this.pagination.current, this.pagination.pageSize)
        ArcoVue.Message.success(t.refreshOk)
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
      onPageChange(page) {
        if (this.dirtyCount) {
          ArcoVue.Message.warning(t.unsavedWarn)
          return
        }
        this.fetchData(page, this.pagination.pageSize)
      },
      onPageSizeChange(pageSize) {
        if (this.dirtyCount) {
          ArcoVue.Message.warning(t.unsavedWarn)
          return
        }
        this.fetchData(1, pageSize)
      },
      markDirty(record) {
        record._dirty = true
      },
      startEdit(record) {
        if (record._editing) return
        record._backup = snapshot(record)
        record._editing = true
      },
      cancelEdit(record) {
        if (record._backup) {
          Object.assign(record, record._backup)
        }
        record._backup = null
        record._editing = false
        record._dirty = false
      },
      saveRow(record) {
        if (!String(record.title || '').trim()) {
          ArcoVue.Message.warning(t.emptyTitle)
          return
        }
        ArcoProMock.updateTicket(record.id, snapshot(record))
        record._backup = null
        record._editing = false
        record._dirty = false
        ArcoVue.Message.success(t.saveOk)
      },
      saveAll() {
        const targets = this.data.filter((r) => r._editing || r._dirty)
        if (!targets.length) {
          ArcoVue.Message.info(t.noDirty)
          return
        }
        for (const row of targets) {
          if (!String(row.title || '').trim()) {
            ArcoVue.Message.warning(t.emptyTitle)
            return
          }
        }
        this.saving = true
        setTimeout(() => {
          targets.forEach((row) => {
            ArcoProMock.updateTicket(row.id, snapshot(row))
            row._backup = null
            row._editing = false
            row._dirty = false
          })
          this.saving = false
          ArcoVue.Message.success(t.saveAllOk + '（' + targets.length + '）')
        }, 280)
      },
      addRow() {
        const row = ArcoProMock.addTicket({
          title: t.newTitle,
          ticketType: 0,
          priority: 1,
          assignee: assignees[0],
          customer: customers[0],
          status: 0,
          description: t.newDesc,
        })
        this.keyword = ''
        this.fetchData(1, this.pagination.pageSize)
        this.$nextTick(() => {
          const created = this.data.find((r) => r.id === row.id)
          if (created) this.startEdit(created)
        })
        ArcoVue.Message.success(t.createOk)
      },
      removeRow(record) {
        openConfirm({
          title: t.remove,
          content: t.deleteConfirm,
          okText: t.remove,
          cancelText: t.cancel,
          okButtonProps: { status: 'danger' },
          onOk: () => {
            ArcoProMock.removeTicket(record.id)
            ArcoVue.Message.success(t.deleteOk)
            const page =
              this.data.length <= 1 && this.pagination.current > 1
                ? this.pagination.current - 1
                : this.pagination.current
            this.fetchData(page, this.pagination.pageSize)
          },
        })
      },
    },
    template: `
      <div class="list-editable-page">
        <a-card class="general-card pro-page-card form-group-intro-card list-editable-intro-card">
          <div class="form-basic-header form-basic-header--flush">
            <div class="form-basic-title">{{ t.tipTitle }}</div>
            <p class="form-basic-desc">{{ t.tipDesc }}</p>
          </div>
        </a-card>

        <a-card class="general-card">
          <div class="pro-toolbar">
            <a-space wrap :size="12">
              <a-button type="primary" @click="addRow">
                <template #icon><icon-plus /></template>{{ t.add }}
              </a-button>
              <a-button type="outline" :loading="saving" @click="saveAll">
                {{ t.saveAll }}
              </a-button>
              <a-tag v-if="dirtyCount" color="orangered" class="list-editable-dirty-tag">
                {{ dirtyCount }} {{ t.dirtyUnit }}
              </a-tag>
            </a-space>
            <div class="pro-toolbar-right">
              <a-input-search
                v-model="keyword"
                allow-clear
                :placeholder="t.searchPh"
                style="width: 240px"
                @search="onSearch"
                @press-enter="onSearch"
                @clear="onSearch"
              />
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
              <a-button @click="onExport">
                <template #icon><icon-download /></template>{{ t.download }}
              </a-button>
            </div>
          </div>

          <a-table
            row-key="id"
            :loading="loading"
            :columns="columns"
            :data="data"
            :size="tableSize"
            :pagination="false"
            :bordered="false"
            :scroll="tableScroll"
            :row-selection="{ type: 'checkbox', showCheckedAll: true, width: 48 }"
            :selected-keys="selectedKeys"
            @selection-change="onSelectionChange"
          >
            <template #ticketTitle="{ record }">
              <div class="list-editable-cell">
                <a-input
                  v-if="record._editing"
                  v-model="record.title"
                  :placeholder="t.phTitle"
                  @change="markDirty(record)"
                />
                <span v-else>{{ record.title }}</span>
              </div>
            </template>
            <template #ticketType="{ record }">
              <div class="list-editable-cell">
                <a-select
                  v-if="record._editing"
                  v-model="record.ticketType"
                  :options="ticketTypeOptions"
                  @change="markDirty(record)"
                />
                <span v-else class="ticket-type-cell">
                  <span :class="'ticket-type-dot ticket-type-dot--' + record.ticketType"></span>
                  {{ ticketTypes[record.ticketType] }}
                </span>
              </div>
            </template>
            <template #priority="{ record }">
              <div class="list-editable-cell">
                <a-select
                  v-if="record._editing"
                  v-model="record.priority"
                  :options="priorityOptions"
                  @change="markDirty(record)"
                />
                <a-tag v-else :color="priorityColors[record.priority]" size="small">
                  {{ priorities[record.priority] }}
                </a-tag>
              </div>
            </template>
            <template #assignee="{ record }">
              <div class="list-editable-cell">
                <a-select
                  v-if="record._editing"
                  v-model="record.assignee"
                  :options="assigneeOptions"
                  allow-search
                  @change="markDirty(record)"
                />
                <span v-else>{{ record.assignee }}</span>
              </div>
            </template>
            <template #customer="{ record }">
              <div class="list-editable-cell">
                <a-select
                  v-if="record._editing"
                  v-model="record.customer"
                  :options="customerOptions"
                  allow-search
                  @change="markDirty(record)"
                />
                <span v-else>{{ record.customer }}</span>
              </div>
            </template>
            <template #status="{ record }">
              <div class="list-editable-cell">
                <a-select
                  v-if="record._editing"
                  v-model="record.status"
                  :options="statusOptions"
                  @change="markDirty(record)"
                />
                <a-badge
                  v-else
                  :status="statusBadge[record.status] || undefined"
                  :color="statusBadgeColor[record.status] || undefined"
                  :text="statusLabels[record.status]"
                />
              </div>
            </template>
            <template #operations="{ record }">
              <a-space class="pro-table-ops list-editable-actions" :size="4">
                <template v-if="record._editing">
                  <a-button type="text" :size="opsBtnSize" @click="saveRow(record)">{{ t.save }}</a-button>
                  <a-button type="text" :size="opsBtnSize" @click="cancelEdit(record)">{{ t.cancel }}</a-button>
                </template>
                <template v-else>
                  <a-button type="text" :size="opsBtnSize" @click="startEdit(record)">{{ t.edit }}</a-button>
                  <a-button type="text" :size="opsBtnSize" status="danger" @click="removeRow(record)">
                    {{ t.remove }}
                  </a-button>
                </template>
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

        <a-modal
          v-if="exportVisible"
          :visible="true"
          :title="t.exportTitle"
          title-align="start"
          :width="ioModalWidth"
          modal-class="pro-io-modal"
          :footer="false"
          unmount-on-close
          @cancel="closeExport"
        >
          <div class="pro-io-modal-body">
            <a-form :model="exportForm" layout="vertical" class="pro-export-form">
              <a-form-item :label="t.exportScope">
                <a-radio-group v-model="exportForm.scope" direction="vertical">
                  <a-radio
                    v-for="opt in exportScopeOptions"
                    :key="opt.value"
                    :value="opt.value"
                    :disabled="opt.disabled"
                  >{{ opt.label }}</a-radio>
                </a-radio-group>
              </a-form-item>
              <a-form-item :label="t.exportFormat">
                <a-radio-group v-model="exportForm.format" direction="vertical" :options="exportFormatOptions" />
              </a-form-item>
            </a-form>
            <div class="pro-io-footer">
              <div class="pro-export-hint">{{ t.exportCountHint }} {{ exportCount }} 条</div>
              <a-space>
                <a-button @click="closeExport">{{ t.cancel }}</a-button>
                <a-button type="primary" :loading="exporting" @click="submitExport">{{ t.exportSubmit }}</a-button>
              </a-space>
            </div>
          </div>
        </a-modal>
      </div>
    `,
  }

  mountProPage({
    pageKey: 'list/editable',
    title: t.title,
    pageComponent: ListEditablePage,
  })
})()
