;(function () {
  const t = ArcoProLocale.listFilterTable
  const {
    contractTypes,
    contractStatuses,
    contractDepartments,
    contractOwners,
    contractPartners,
  } = ArcoProMock

  const statusTagColors = ['gray', 'arcoblue', 'green', 'orangered']

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
      id: '',
      title: '',
      contractType: '',
      signedTime: [],
      status: '',
      partner: '',
      department: '',
      owner: '',
      keyword: '',
    }
  }

  function emptyEditor() {
    return {
      id: '',
      title: '',
      contractType: undefined,
      amount: undefined,
      partner: undefined,
      department: undefined,
      owner: undefined,
      status: undefined,
      description: '',
    }
  }

  function createDefaultColumns(locale) {
    return [
      { title: locale.colId, dataIndex: 'id', width: 130 },
      {
        title: locale.colTitle,
        dataIndex: 'title',
        minWidth: 140,
        ellipsis: true,
        tooltip: true,
      },
      { title: locale.colContractType, dataIndex: 'contractType', width: 110, slotName: 'contractType' },
      { title: locale.colAmount, dataIndex: 'amount', width: 120, slotName: 'amount' },
      { title: locale.colPartner, dataIndex: 'partner', width: 120, ellipsis: true, tooltip: true },
      { title: locale.colDepartment, dataIndex: 'department', width: 100 },
      { title: locale.colOwner, dataIndex: 'owner', width: 90 },
      { title: locale.colSignedTime, dataIndex: 'signedAt', width: 186, slotName: 'signedAt' },
      { title: locale.colStatus, dataIndex: 'status', width: 100, slotName: 'status' },
      {
        title: locale.colOperations,
        dataIndex: 'operations',
        width: 160,
        fixed: 'right',
        slotName: 'operations',
      },
    ]
  }

  const ListFilterTablePage = {
    name: 'ListFilterTablePage',
    data() {
      const defaultColumns = createDefaultColumns(t)
      return {
        t,
        contractTypes,
        contractStatuses,
        contractDepartments,
        contractOwners,
        contractPartners,
        statusTagColors,
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
        modalVisible: false,
        modalMode: 'create',
        editor: emptyEditor(),
        saving: false,
        editorRules: {
          title: [{ required: true, message: t.emptyTitle }],
          contractType: [{ required: true, message: t.emptyContractType }],
          amount: [{ required: true, message: t.emptyAmount }],
          partner: [{ required: true, message: t.emptyPartner }],
          department: [{ required: true, message: t.emptyDepartment }],
          owner: [{ required: true, message: t.emptyOwner }],
          status: [{ required: true, message: t.emptyStatus }],
          description: [{ required: true, message: t.emptyDescription }],
        },
        importVisible: false,
        importFileList: [],
        importing: false,
        exportVisible: false,
        exporting: false,
        exportForm: {
          scope: 'all',
          format: 'xlsx',
        },
      }
    },
    computed: {
      contractTypeOptions() {
        return this.contractTypes.map((label, value) => ({ label, value }))
      },
      statusOptions() {
        return this.contractStatuses.map((label, value) => ({ label, value }))
      },
      departmentOptions() {
        return this.contractDepartments.map((label) => ({ label, value: label }))
      },
      partnerOptions() {
        return this.contractPartners.map((label) => ({ label, value: label }))
      },
      ownerOptions() {
        return this.contractOwners.map((label) => ({ label, value: label }))
      },
      modalTitle() {
        return this.modalMode === 'create' ? this.t.createTitle : this.t.editTitle
      },
      modalWidth() {
        return this.isMobile ? 'calc(100vw - 32px)' : 560
      },
      ioModalWidth() {
        return this.isMobile ? 'calc(100vw - 32px)' : 520
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
        return { columns: visible, scroll: { x: 1300 } }
      },
      tableScroll() {
        return this.tableLayout.scroll
      },
      opsBtnSize() {
        const prefs = window.ArcoProTablePrefs
        return prefs && prefs.opsButtonSize ? prefs.opsButtonSize(this.tableSize) : 'small'
      },

      editorColSpan() {
        return this.isMobile ? 24 : 12
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
      this.fetchData(1, this.pagination.pageSize)
    },
    beforeUnmount() {
      if (this._onResize) window.removeEventListener('resize', this._onResize)
      if (this._measureTableHost && this._measureTableHost.disconnect) {
        this._measureTableHost.disconnect()
      }
    },
    methods: {
      emptyForm,
      formatAmount(v) {
        const n = Number(v)
        if (Number.isNaN(n)) return '—'
        return '¥' + n.toLocaleString('zh-CN')
      },
      buildParams() {
        return { ...this.form }
      },
      fetchData(page, pageSize) {
        this.loading = true
        setTimeout(() => {
          const filtered = ArcoProMock.filterContractList(this.buildParams())
          const res = ArcoProMock.paginate(filtered, page, pageSize)
          this.data = res.list
          this.pagination = { ...this.pagination, current: page, pageSize, total: res.total }
          this.selectedKeys = []
          this.loading = false
        }, 280)
      },
      onSearch() {
        this.fetchData(1, this.pagination.pageSize)
      },
      onReset() {
        this.form = emptyForm()
        this.fetchData(1, this.pagination.pageSize)
      },
      onPageChange(page) {
        this.fetchData(page, this.pagination.pageSize)
      },
      onPageSizeChange(pageSize) {
        this.fetchData(1, pageSize)
      },
      onSelectionChange(keys) {
        this.selectedKeys = keys
      },
      formatTime(v) {
        return ArcoProMock.formatDateTime(v)
      },
      openCreate() {
        this.modalMode = 'create'
        this.editor = emptyEditor()
        this.modalVisible = true
        this.$nextTick(() => {
          const formRef = this.$refs.editorFormRef
          if (formRef && typeof formRef.clearValidate === 'function') formRef.clearValidate()
        })
      },
      openEdit(record) {
        this.modalMode = 'edit'
        this.editor = {
          id: record.id,
          title: record.title,
          contractType: record.contractType,
          amount: record.amount,
          partner: record.partner,
          department: record.department,
          owner: record.owner,
          status: record.status,
          description: record.description || '',
        }
        this.modalVisible = true
        this.$nextTick(() => {
          const formRef = this.$refs.editorFormRef
          if (formRef && typeof formRef.clearValidate === 'function') formRef.clearValidate()
        })
      },
      openDetail(record) {
        this.detail = { ...record }
        this.drawerVisible = true
      },
      closeDrawer() {
        this.drawerVisible = false
      },
      onSave() {
        const formRef = this.$refs.editorFormRef
        const runSave = () => {
          this.saving = true
          setTimeout(() => {
            if (this.modalMode === 'create') {
              ArcoProMock.addContract({ ...this.editor })
              ArcoVue.Message.success(this.t.createOk)
            } else {
              ArcoProMock.updateContract(this.editor.id, { ...this.editor })
              ArcoVue.Message.success(this.t.updateOk)
              if (this.detail && this.detail.id === this.editor.id) {
                this.detail = { ...ArcoProMock.getContractById(this.editor.id) }
              }
            }
            this.saving = false
            this.modalVisible = false
            this.fetchData(1, this.pagination.pageSize)
          }, 220)
        }
        if (!formRef || typeof formRef.validate !== 'function') {
          runSave()
          return
        }
        formRef.validate((errors) => {
          if (errors) {
            ArcoVue.Message.error(this.t.validateFail)
            return
          }
          runSave()
        })
      },
      closeModal() {
        this.modalVisible = false
      },
      onDelete(record) {
        openConfirm({
          title: this.t.remove,
          content: this.t.deleteConfirm,
          okText: this.t.remove,
          cancelText: this.t.cancel,
          okButtonProps: { status: 'danger' },
          onOk: () => {
            ArcoProMock.removeContract(record.id)
            ArcoVue.Message.success(this.t.deleteOk)
            if (this.detail && this.detail.id === record.id) this.drawerVisible = false
            const page =
              this.data.length <= 1 && this.pagination.current > 1
                ? this.pagination.current - 1
                : this.pagination.current
            this.fetchData(page, this.pagination.pageSize)
          },
        })
      },
      onImport() {
        this.importFileList = []
        this.importVisible = true
      },
      closeImport() {
        this.importVisible = false
        this.importFileList = []
        this.importing = false
      },
      onImportFileChange(fileList) {
        const list = Array.isArray(fileList) ? fileList : fileList && fileList.fileList
        this.importFileList = (list || []).slice(-1)
      },
      beforeImportUpload(file) {
        const raw = file && (file.file || file)
        const name = (raw && raw.name) || (file && file.name) || ''
        const size = (raw && raw.size) || (file && file.size) || 0
        if (!/\.(xlsx|xls|csv)$/i.test(name)) {
          ArcoVue.Message.warning(this.t.importFormatInvalid)
          return false
        }
        if (size > 10 * 1024 * 1024) {
          ArcoVue.Message.warning(this.t.importSizeInvalid)
          return false
        }
        return true
      },
      onDownloadTemplate() {
        ArcoVue.Message.success(this.t.importTemplateOk)
      },
      submitImport() {
        if (!this.importFileList.length) {
          ArcoVue.Message.warning(this.t.importFileRequired)
          return
        }
        this.importing = true
        setTimeout(() => {
          this.importing = false
          this.importVisible = false
          this.importFileList = []
          ArcoVue.Message.success(this.t.importOk)
          this.fetchData(1, this.pagination.pageSize)
        }, 600)
      },
      onExport() {
        this.exportForm = {
          scope: this.selectedKeys.length ? 'selected' : 'all',
          format: 'xlsx',
        }
        this.exportVisible = true
      },
      onRefreshTable() {
        this.fetchData(this.pagination.current, this.pagination.pageSize)
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
            this.t.exportOk + '（' + this.exportCount + ' 条 · ' + this.exportForm.format.toUpperCase() + '）'
          )
        }, 500)
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
            const n = ArcoProMock.removeContracts(this.selectedKeys)
            ArcoVue.Message.success(this.t.deleteOk + '（' + n + ' 条）')
            if (this.detail && this.selectedKeys.includes(this.detail.id)) {
              this.drawerVisible = false
            }
            const page =
              this.data.length <= this.selectedKeys.length && this.pagination.current > 1
                ? this.pagination.current - 1
                : this.pagination.current
            this.fetchData(page, this.pagination.pageSize)
          },
        })
      },
      onBatchExpire() {
        if (!this.ensureSelection()) return
        openConfirm({
          title: this.t.batchExpire,
          content: this.t.batchExpireConfirm,
          okText: this.t.batchExpire,
          cancelText: this.t.cancel,
          onOk: () => {
            const n = ArcoProMock.expireContracts(this.selectedKeys)
            ArcoVue.Message.success(this.t.batchExpireOk + '（' + n + ' 条）')
            this.fetchData(this.pagination.current, this.pagination.pageSize)
          },
        })
      },
    },
    template: `
      <div class="list-filter-table-page">
        <div class="list-split-layout">
          <div class="list-split-side">
            <a-card class="general-card pro-page-card" :bordered="false">
              <div class="list-filter-panel">
                <div class="list-filter-panel-header">
                  <span class="list-filter-panel-title">{{ t.filterTitle }}</span>
                </div>
                <div class="list-filter-body">
                  <a-form :model="form" layout="vertical" class="list-filter-form">
                    <a-form-item field="id" :label="t.colId">
                      <a-input v-model="form.id" :placeholder="t.phId" allow-clear @press-enter="onSearch" />
                    </a-form-item>
                    <a-form-item field="title" :label="t.colTitle">
                      <a-input v-model="form.title" :placeholder="t.phTitle" allow-clear @press-enter="onSearch" />
                    </a-form-item>
                    <a-form-item field="contractType" :label="t.colContractType">
                      <a-select
                        v-model="form.contractType"
                        :options="contractTypeOptions"
                        :placeholder="t.selectDefault"
                        allow-clear
                      />
                    </a-form-item>
                    <a-form-item field="signedTime" :label="t.colSignedTime">
                      <a-range-picker v-model="form.signedTime" class="pro-field-block" />
                    </a-form-item>
                    <a-form-item field="status" :label="t.colStatus">
                      <a-select
                        v-model="form.status"
                        :options="statusOptions"
                        :placeholder="t.selectDefault"
                        allow-clear
                      />
                    </a-form-item>
                    <a-form-item field="partner" :label="t.colPartner">
                      <a-select
                        v-model="form.partner"
                        :options="partnerOptions"
                        :placeholder="t.selectDefault"
                        allow-clear
                        allow-search
                      />
                    </a-form-item>
                    <a-form-item field="department" :label="t.colDepartment">
                      <a-select
                        v-model="form.department"
                        :options="departmentOptions"
                        :placeholder="t.selectDefault"
                        allow-clear
                      />
                    </a-form-item>
                    <a-form-item field="owner" :label="t.colOwner">
                      <a-select
                        v-model="form.owner"
                        :options="ownerOptions"
                        :placeholder="t.selectDefault"
                        allow-clear
                      />
                    </a-form-item>
                    <a-form-item field="keyword" :label="t.colKeyword">
                      <a-input
                        v-model="form.keyword"
                        :placeholder="t.phKeyword"
                        allow-clear
                        @press-enter="onSearch"
                      />
                    </a-form-item>
                  </a-form>
                </div>
                <div class="list-filter-actions">
                  <a-button type="primary" long @click="onSearch">
                    <template #icon><icon-search /></template>{{ t.search }}
                  </a-button>
                  <a-button long @click="onReset">
                    <template #icon><icon-refresh /></template>{{ t.reset }}
                  </a-button>
                </div>
              </div>
            </a-card>
          </div>

          <div class="list-split-main">
            <a-card class="general-card">
              <div class="pro-toolbar">
                <a-space wrap>
                  <a-button type="primary" @click="openCreate">
                    <template #icon><icon-plus /></template>{{ t.add }}
                  </a-button>
                  <a-button @click="onImport">{{ t.upload }}</a-button>
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
                  <a-button @click="onExport">
                    <template #icon><icon-download /></template>{{ t.download }}
                  </a-button>
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
                <template #contractType="{ record }">
                  <span class="contract-type-cell">
                    <span :class="'contract-type-dot contract-type-dot--' + record.contractType"></span>
                    {{ contractTypes[record.contractType] }}
                  </span>
                </template>
                <template #amount="{ record }">
                  <span class="contract-amount">{{ formatAmount(record.amount) }}</span>
                </template>
                <template #signedAt="{ record }">
                  <span class="contract-signed-at">{{ formatTime(record.signedAt) }}</span>
                </template>
                <template #status="{ record }">
                  <a-tag :color="statusTagColors[record.status]" bordered size="small">
                    {{ contractStatuses[record.status] }}
                  </a-tag>
                </template>
                <template #operations="{ record }">
                  <a-space class="pro-table-ops" :size="4">
                    <a-button type="text" :size="opsBtnSize" @click="openDetail(record)">{{ t.view }}</a-button>
                    <a-button type="text" :size="opsBtnSize" @click="openEdit(record)">{{ t.edit }}</a-button>
                    <a-button type="text" status="danger" :size="opsBtnSize" @click="onDelete(record)">{{ t.remove }}</a-button>
                  </a-space>
                </template>
              </a-table>
              <div class="pro-table-footer">
                <a-space>
                  <a-button :disabled="!selectedKeys.length" @click="onBatchDelete">{{ t.batchDelete }}</a-button>
                  <a-button :disabled="!selectedKeys.length" @click="onBatchExpire">{{ t.batchExpire }}</a-button>
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
          </div>
        </div>

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
                  <div class="pro-detail-label">{{ t.colContractType }}</div>
                  <div class="pro-detail-value">
                    <span class="contract-type-cell">
                      <span :class="'contract-type-dot contract-type-dot--' + detail.contractType"></span>
                      {{ contractTypes[detail.contractType] }}
                    </span>
                  </div>
                </div>
                <div class="pro-detail-field">
                  <div class="pro-detail-label">{{ t.colAmount }}</div>
                  <div class="pro-detail-value">{{ formatAmount(detail.amount) }}</div>
                </div>
                <div class="pro-detail-field">
                  <div class="pro-detail-label">{{ t.colPartner }}</div>
                  <div class="pro-detail-value">{{ detail.partner }}</div>
                </div>
                <div class="pro-detail-field">
                  <div class="pro-detail-label">{{ t.colDepartment }}</div>
                  <div class="pro-detail-value">{{ detail.department }}</div>
                </div>
                <div class="pro-detail-field">
                  <div class="pro-detail-label">{{ t.colOwner }}</div>
                  <div class="pro-detail-value">{{ detail.owner }}</div>
                </div>
                <div class="pro-detail-field">
                  <div class="pro-detail-label">{{ t.colSignedTime }}</div>
                  <div class="pro-detail-value">{{ formatTime(detail.signedAt) }}</div>
                </div>
                <div class="pro-detail-field">
                  <div class="pro-detail-label">{{ t.colExpiryTime }}</div>
                  <div class="pro-detail-value">{{ formatTime(detail.expiryAt) }}</div>
                </div>
              </div>
            </section>
            <section class="pro-detail-section">
              <h3 class="pro-detail-section-title">{{ t.detailTerms }}</h3>
              <div class="pro-detail-grid">
                <div class="pro-detail-field pro-detail-field--full">
                  <div class="pro-detail-label">{{ t.colStatus }}</div>
                  <div class="pro-detail-value pro-detail-value--strong">
                    <a-tag :color="statusTagColors[detail.status]" bordered size="small">
                      {{ contractStatuses[detail.status] }}
                    </a-tag>
                  </div>
                </div>
                <div class="pro-detail-field pro-detail-field--full">
                  <div class="pro-detail-label">{{ t.colDescription }}</div>
                  <div class="pro-detail-value pro-detail-value--multiline">{{ detail.description || '—' }}</div>
                </div>
              </div>
            </section>
          </div>
          <template #footer>
            <a-button @click="closeDrawer">{{ t.cancel }}</a-button>
            <a-button type="primary" :disabled="!detail" @click="openEdit(detail)">{{ t.edit }}</a-button>
          </template>
        </a-drawer>

        <a-modal
          v-if="modalVisible"
          :visible="true"
          :title="modalTitle"
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
                <a-form-item :label="t.colContractType" field="contractType" required asterisk-position="end">
                  <a-select
                    v-model="editor.contractType"
                    :options="contractTypeOptions"
                    :placeholder="t.emptyContractType"
                    allow-clear
                  />
                </a-form-item>
              </a-col>
              <a-col :span="editorColSpan">
                <a-form-item :label="t.colAmount" field="amount" required asterisk-position="end">
                  <a-input-number v-model="editor.amount" :min="0" :precision="0" class="pro-field-block" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="editorColSpan">
                <a-form-item :label="t.colPartner" field="partner" required asterisk-position="end">
                  <a-select
                    v-model="editor.partner"
                    :options="partnerOptions"
                    :placeholder="t.emptyPartner"
                    allow-search
                    allow-clear
                  />
                </a-form-item>
              </a-col>
              <a-col :span="editorColSpan">
                <a-form-item :label="t.colDepartment" field="department" required asterisk-position="end">
                  <a-select
                    v-model="editor.department"
                    :options="departmentOptions"
                    :placeholder="t.emptyDepartment"
                    allow-clear
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <a-form-item :label="t.colOwner" field="owner" required asterisk-position="end">
              <a-select
                v-model="editor.owner"
                :options="ownerOptions"
                :placeholder="t.emptyOwner"
                allow-clear
              />
            </a-form-item>
            <a-form-item :label="t.colStatus" field="status" required asterisk-position="end">
              <a-select
                v-model="editor.status"
                :options="statusOptions"
                :placeholder="t.emptyStatus"
                allow-clear
              />
            </a-form-item>
            <a-form-item :label="t.colDescription" field="description" required asterisk-position="end">
              <a-textarea v-model="editor.description" :auto-size="{ minRows: 3, maxRows: 6 }" />
            </a-form-item>
          </a-form>
          <div class="pro-modal-footer-actions">
            <a-space>
              <a-button @click="closeModal">{{ t.cancel }}</a-button>
              <a-button type="primary" :loading="saving" @click="onSave">{{ t.save }}</a-button>
            </a-space>
          </div>
        </a-modal>

        <a-modal
          v-if="importVisible"
          :visible="true"
          :title="t.importTitle"
          title-align="start"
          :width="ioModalWidth"
          modal-class="pro-io-modal"
          :footer="false"
          unmount-on-close
          @cancel="closeImport"
        >
          <div class="pro-io-modal-body">
            <div class="pro-io-tip">
              <icon-info-circle class="pro-io-tip-icon" :size="14" />
              <span class="pro-io-tip-text">{{ t.importTip }}</span>
            </div>
            <a-upload
              class="pro-io-upload"
              draggable
              accept=".xlsx,.xls,.csv"
              :auto-upload="false"
              :limit="1"
              :file-list="importFileList"
              @change="onImportFileChange"
              @before-upload="beforeImportUpload"
            >
              <template #upload-button>
                <div class="pro-upload-drag">
                  <div class="pro-upload-drag-icon"><icon-upload /></div>
                  <div class="pro-upload-drag-text">{{ t.importDrag }}</div>
                  <div class="pro-upload-drag-hint">{{ t.importDragHint }}</div>
                </div>
              </template>
            </a-upload>
            <div class="pro-io-footer">
              <a-link class="pro-io-template" @click="onDownloadTemplate">
                <icon-download /> {{ t.importTemplate }}
              </a-link>
              <a-space>
                <a-button @click="closeImport">{{ t.cancel }}</a-button>
                <a-button type="primary" :loading="importing" @click="submitImport">{{ t.importSubmit }}</a-button>
              </a-space>
            </div>
          </div>
        </a-modal>

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

  mountProPage({ pageKey: 'list/filter-table', title: t.title, pageComponent: ListFilterTablePage })
})()
