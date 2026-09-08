;(function () {
  const t = ArcoProLocale.listTagFilter
  const {
    customerLevels,
    customerIndustries,
    customerStatuses,
    customerSources,
    customerRegions,
    customerDealScales,
    customerFollowWindows,
    customerOwners,
  } = ArcoProMock

  const statusBadge = ['processing', 'success', null, 'warning', null, null]
  const statusBadgeColor = [null, null, 'gray', null, 'orangered', 'gray']
  function openConfirm(options) {
    return ArcoVue.Modal.confirm({
      simple: true,
      titleAlign: 'start',
      modalClass: 'pro-confirm-modal',
      width: 360,
      ...options,
    })
  }

  function emptyFilters() {
    return {
      level: '',
      industry: '',
      status: '',
      source: '',
      region: '',
      owner: '',
      dealScale: '',
      followWindow: '',
      keyword: '',
    }
  }

  function emptyEditor() {
    return {
      id: '',
      name: '',
      level: undefined,
      industry: undefined,
      status: undefined,
      source: undefined,
      region: undefined,
      contact: '',
      phone: '',
      owner: undefined,
      dealAmount: undefined,
      remark: '',
    }
  }

  function createDefaultColumns(locale) {
    return [
      { title: locale.colId, dataIndex: 'id', width: 130 },
      { title: locale.colName, dataIndex: 'name', minWidth: 160, ellipsis: true, tooltip: true },
      { title: locale.colLevel, dataIndex: 'level', width: 100, slotName: 'level' },
      { title: locale.colIndustry, dataIndex: 'industry', width: 100, slotName: 'industry' },
      { title: locale.colStatus, dataIndex: 'status', width: 110, slotName: 'status' },
      { title: locale.colSource, dataIndex: 'source', width: 110, slotName: 'source' },
      { title: locale.colRegion, dataIndex: 'region', width: 90, slotName: 'region' },
      { title: locale.colContact, dataIndex: 'contact', width: 90 },
      { title: locale.colOwner, dataIndex: 'owner', width: 120 },
      { title: locale.colDealAmount, dataIndex: 'dealAmount', width: 120, slotName: 'dealAmount' },
      {
        title: locale.colLastFollow,
        dataIndex: 'lastFollowAt',
        width: 190,
        slotName: 'lastFollowAt',
        ellipsis: true,
        tooltip: true,
      },
      {
        title: locale.colOperations,
        dataIndex: 'operations',
        width: 160,
        fixed: 'right',
        slotName: 'operations',
      },
    ]
  }

  function formatAmount(n) {
    const num = Number(n) || 0
    return '¥' + num.toLocaleString('zh-CN')
  }

  const ListTagFilterPage = {
    name: 'ListTagFilterPage',
    data() {
      const defaultColumns = createDefaultColumns(t)
      return {
        t,
        customerLevels,
        customerIndustries,
        customerStatuses,
        customerSources,
        customerRegions,
        customerDealScales,
        customerFollowWindows,
        customerOwners,
        statusBadge,
        statusBadgeColor,
        filters: emptyFilters(),
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
        exportVisible: false,
        exporting: false,
        exportForm: {
          scope: 'all',
          format: 'xlsx',
        },
        editorRules: {
          name: [{ required: true, message: t.emptyName }],
          level: [{ required: true, message: t.emptyLevel }],
          industry: [{ required: true, message: t.emptyIndustry }],
          status: [{ required: true, message: t.emptyStatus }],
          source: [{ required: true, message: t.emptySource }],
          region: [{ required: true, message: t.emptyRegion }],
          contact: [{ required: true, message: t.emptyContact }],
          phone: [{ required: true, message: t.emptyPhone }],
          owner: [{ required: true, message: t.emptyOwner }],
        },
      }
    },
    computed: {
      filterGroupsPrimary() {
        const withAll = (options) => [{ label: this.t.tagAll, value: '' }].concat(options)
        return [
          {
            key: 'level',
            label: this.t.filterLevel,
            options: withAll(this.customerLevels.map((label, value) => ({ label, value }))),
          },
          {
            key: 'industry',
            label: this.t.filterIndustry,
            options: withAll(this.customerIndustries.map((label, value) => ({ label, value }))),
          },
          {
            key: 'status',
            label: this.t.filterStatus,
            options: withAll(this.customerStatuses.map((label, value) => ({ label, value }))),
          },
          {
            key: 'source',
            label: this.t.filterSource,
            options: withAll(this.customerSources.map((label, value) => ({ label, value }))),
          },
          {
            key: 'region',
            label: this.t.filterRegion,
            options: withAll(this.customerRegions.map((label, value) => ({ label, value }))),
          },
        ]
      },
      ownerSelectOptions() {
        return [{ label: this.t.tagAll, value: '' }].concat(
          this.customerOwners.map((label) => ({ label, value: label }))
        )
      },
      dealScaleSelectOptions() {
        return [{ label: this.t.tagAll, value: '' }].concat(
          this.customerDealScales.map((item) => ({ ...item }))
        )
      },
      followWindowSelectOptions() {
        return [{ label: this.t.tagAll, value: '' }].concat(
          this.customerFollowWindows.map((item) => ({ ...item }))
        )
      },
      ownerOptions() {
        return this.customerOwners.map((label) => ({ label, value: label }))
      },
      levelOptions() {
        return this.customerLevels.map((label, value) => ({ label, value }))
      },
      industryOptions() {
        return this.customerIndustries.map((label, value) => ({ label, value }))
      },
      statusOptions() {
        return this.customerStatuses.map((label, value) => ({ label, value }))
      },
      sourceOptions() {
        return this.customerSources.map((label, value) => ({ label, value }))
      },
      regionOptions() {
        return this.customerRegions.map((label, value) => ({ label, value }))
      },
      modalTitle() {
        return this.modalMode === 'create' ? this.t.createTitle : this.t.editTitle
      },
      modalWidth() {
        return this.isMobile ? 'calc(100vw - 32px)' : 560
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
        return { columns: visible, scroll: { x: 1520 } }
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
      hasActiveFilters() {
        const f = this.filters
        return (
          f.level !== '' ||
          f.industry !== '' ||
          f.status !== '' ||
          f.source !== '' ||
          f.region !== '' ||
          f.owner !== '' ||
          f.dealScale !== '' ||
          f.followWindow !== '' ||
          !!String(f.keyword || '').trim()
        )
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
      this.fetchData(1, this.pagination.pageSize, this.filters)
    },
    beforeUnmount() {
      if (this._onResize) window.removeEventListener('resize', this._onResize)
      if (this._measureTableHost && this._measureTableHost.disconnect) {
        this._measureTableHost.disconnect()
      }
    },
    methods: {
      isTagActive(key, value) {
        const current = this.filters[key]
        if (value === '') return current === '' || current == null
        return current === value
      },
      onSelectTag(key, value) {
        this.filters = { ...this.filters, [key]: value }
        this.fetchData(1, this.pagination.pageSize, this.filters)
      },
      fetchData(page, pageSize, params) {
        this.loading = true
        setTimeout(() => {
          const filtered = ArcoProMock.filterCustomerCrmList(params || this.filters)
          const res = ArcoProMock.paginate(filtered, page, pageSize)
          this.data = res.list
          this.pagination = { ...this.pagination, current: page, pageSize, total: res.total }
          this.selectedKeys = []
          this.loading = false
        }, 240)
      },
      onSearch() {
        this.fetchData(1, this.pagination.pageSize, this.filters)
      },
      onReset() {
        this.filters = emptyFilters()
        this.fetchData(1, this.pagination.pageSize, {})
      },
      onPageChange(page) {
        this.fetchData(page, this.pagination.pageSize, this.filters)
      },
      onPageSizeChange(pageSize) {
        this.fetchData(1, pageSize, this.filters)
      },
      onSelectionChange(keys) {
        this.selectedKeys = keys
      },
      formatTime(v) {
        return ArcoProMock.formatDateTime(v)
      },
      formatAmount,
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
          name: record.name,
          level: record.level,
          industry: record.industry,
          status: record.status,
          source: record.source,
          region: record.region,
          contact: record.contact,
          phone: record.phone,
          owner: record.owner,
          dealAmount: record.dealAmount,
          remark: record.remark || '',
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
              ArcoProMock.addCustomerCrm({ ...this.editor })
              ArcoVue.Message.success(this.t.createOk)
            } else {
              ArcoProMock.updateCustomerCrm(this.editor.id, { ...this.editor })
              ArcoVue.Message.success(this.t.updateOk)
              if (this.detail && this.detail.id === this.editor.id) {
                this.detail = { ...ArcoProMock.getCustomerCrmById(this.editor.id) }
              }
            }
            this.saving = false
            this.modalVisible = false
            this.fetchData(1, this.pagination.pageSize, this.filters)
          }, 220)
        }
        if (!formRef || typeof formRef.validate !== 'function') {
          const e = this.editor
          if (!String(e.name || '').trim()) {
            ArcoVue.Message.warning(this.t.emptyName)
            return
          }
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
            ArcoProMock.removeCustomerCrm(record.id)
            ArcoVue.Message.success(this.t.deleteOk)
            if (this.detail && this.detail.id === record.id) this.drawerVisible = false
            const page =
              this.data.length <= 1 && this.pagination.current > 1
                ? this.pagination.current - 1
                : this.pagination.current
            this.fetchData(page, this.pagination.pageSize, this.filters)
          },
        })
      },
      onRefreshTable() {
        this.fetchData(this.pagination.current, this.pagination.pageSize, this.filters)
        ArcoVue.Message.success(this.t.refreshOk)
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
            this.t.exportOk + '（' + this.exportCount + ' 条 · ' + this.exportForm.format.toUpperCase() + '）'
          )
        }, 500)
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
            const n = ArcoProMock.removeCustomerCrms(this.selectedKeys)
            ArcoVue.Message.success(this.t.deleteOk + '（' + n + ' 条）')
            if (this.detail && this.selectedKeys.includes(this.detail.id)) {
              this.drawerVisible = false
            }
            const page =
              this.data.length <= this.selectedKeys.length && this.pagination.current > 1
                ? this.pagination.current - 1
                : this.pagination.current
            this.fetchData(page, this.pagination.pageSize, this.filters)
          },
        })
      },
    },
    template: `
      <div class="list-tag-filter-page">
        <a-card class="general-card pro-page-card">
          <div class="pro-tag-filter">
            <div
              v-for="group in filterGroupsPrimary"
              :key="group.key"
              class="pro-tag-filter-row"
            >
              <div class="pro-tag-filter-label">{{ group.label }}</div>
              <div class="pro-tag-filter-tags">
                <span
                  v-for="opt in group.options"
                  :key="group.key + '-' + String(opt.value)"
                  class="pro-tag-filter-item"
                  :class="{ 'is-active': isTagActive(group.key, opt.value) }"
                  @click="onSelectTag(group.key, opt.value)"
                >{{ opt.label }}</span>
              </div>
            </div>
            <div class="pro-tag-filter-search">
              <a-row class="pro-search-panel">
                <a-col :flex="isMobile ? '100%' : 'none'" class="pro-tag-filter-search-main">
                  <a-form
                    class="pro-search-form is-collapsed"
                    :model="filters"
                    :layout="isMobile ? 'vertical' : 'horizontal'"
                    label-align="left"
                  >
                    <a-row :gutter="16" class="pro-tag-filter-search-fields">
                      <a-col flex="168px">
                        <a-form-item field="owner" hide-label>
                          <a-select
                            v-model="filters.owner"
                            :options="ownerSelectOptions"
                            :placeholder="t.filterOwner"
                            allow-clear
                            @change="onSearch"
                          />
                        </a-form-item>
                      </a-col>
                      <a-col flex="168px">
                        <a-form-item field="dealScale" hide-label>
                          <a-select
                            v-model="filters.dealScale"
                            :options="dealScaleSelectOptions"
                            :placeholder="t.filterDealScale"
                            allow-clear
                            @change="onSearch"
                          />
                        </a-form-item>
                      </a-col>
                      <a-col flex="168px">
                        <a-form-item field="followWindow" hide-label>
                          <a-select
                            v-model="filters.followWindow"
                            :options="followWindowSelectOptions"
                            :placeholder="t.filterFollow"
                            allow-clear
                            @change="onSearch"
                          />
                        </a-form-item>
                      </a-col>
                      <a-col :flex="1" class="pro-tag-filter-search-keyword">
                        <a-form-item field="keyword" hide-label>
                          <a-input
                            v-model="filters.keyword"
                            :placeholder="t.phKeyword"
                            allow-clear
                            @press-enter="onSearch"
                          >
                            <template #prefix><icon-search /></template>
                          </a-input>
                        </a-form-item>
                      </a-col>
                    </a-row>
                  </a-form>
                </a-col>
                <a-col
                  :flex="isMobile ? '100%' : 'none'"
                  class="pro-search-actions is-collapsed"
                  :class="{ 'is-mobile': isMobile }"
                >
                  <a-button type="primary" @click="onSearch">
                    <template #icon><icon-search /></template>{{ t.search }}
                  </a-button>
                  <a-button :disabled="!hasActiveFilters" @click="onReset">
                    <template #icon><icon-refresh /></template>{{ t.reset }}
                  </a-button>
                </a-col>
              </a-row>
            </div>
          </div>
        </a-card>

        <a-card class="general-card">
          <div class="pro-toolbar">
            <a-space>
              <a-button type="primary" @click="openCreate">
                <template #icon><icon-plus /></template>{{ t.add }}
              </a-button>
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
            <template #level="{ record }">
              <a-tag
                class="customer-level-tag"
                :class="'customer-level-tag--' + record.level"
                size="small"
                bordered
              >
                {{ customerLevels[record.level] }}
              </a-tag>
            </template>
            <template #industry="{ record }">{{ customerIndustries[record.industry] }}</template>
            <template #source="{ record }">{{ customerSources[record.source] }}</template>
            <template #region="{ record }">{{ customerRegions[record.region] }}</template>
            <template #status="{ record }">
              <a-badge
                :status="statusBadge[record.status] || undefined"
                :color="statusBadgeColor[record.status] || undefined"
                :text="customerStatuses[record.status]"
              />
            </template>
            <template #dealAmount="{ record }">{{ formatAmount(record.dealAmount) }}</template>
            <template #lastFollowAt="{ record }">
              <span class="customer-follow-time">{{ formatTime(record.lastFollowAt) }}</span>
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
          :visible="drawerVisible"
          :width="drawerWidth"
          :title="detailDrawerTitle"
          unmount-on-close
          @cancel="closeDrawer"
        >
          <template v-if="detail">
            <div class="pro-detail">
              <div class="pro-detail-section">
                <div class="pro-detail-section-title">{{ t.detailOverview }}</div>
                <a-descriptions :column="1" size="medium">
                  <a-descriptions-item :label="t.colId">{{ detail.id }}</a-descriptions-item>
                  <a-descriptions-item :label="t.colName">{{ detail.name }}</a-descriptions-item>
                  <a-descriptions-item :label="t.colLevel">{{ customerLevels[detail.level] }}</a-descriptions-item>
                  <a-descriptions-item :label="t.colIndustry">{{ customerIndustries[detail.industry] }}</a-descriptions-item>
                  <a-descriptions-item :label="t.colStatus">{{ customerStatuses[detail.status] }}</a-descriptions-item>
                  <a-descriptions-item :label="t.colSource">{{ customerSources[detail.source] }}</a-descriptions-item>
                  <a-descriptions-item :label="t.colRegion">{{ customerRegions[detail.region] }}</a-descriptions-item>
                </a-descriptions>
              </div>
              <div class="pro-detail-section">
                <div class="pro-detail-section-title">{{ t.detailBiz }}</div>
                <a-descriptions :column="1" size="medium">
                  <a-descriptions-item :label="t.colContact">{{ detail.contact }}</a-descriptions-item>
                  <a-descriptions-item :label="t.colPhone">{{ detail.phone }}</a-descriptions-item>
                  <a-descriptions-item :label="t.colOwner">{{ detail.owner }}</a-descriptions-item>
                  <a-descriptions-item :label="t.colDealAmount">{{ formatAmount(detail.dealAmount) }}</a-descriptions-item>
                  <a-descriptions-item :label="t.colLastFollow">{{ formatTime(detail.lastFollowAt) }}</a-descriptions-item>
                  <a-descriptions-item :label="t.colCreatedTime">{{ formatTime(detail.createdAt) }}</a-descriptions-item>
                  <a-descriptions-item :label="t.colRemark">{{ detail.remark || '-' }}</a-descriptions-item>
                </a-descriptions>
              </div>
            </div>
          </template>
        </a-drawer>

        <a-modal
          :visible="modalVisible"
          :title="modalTitle"
          :width="modalWidth"
          :ok-loading="saving"
          unmount-on-close
          @ok="onSave"
          @cancel="closeModal"
        >
          <a-form
            ref="editorFormRef"
            :model="editor"
            :rules="editorRules"
            layout="vertical"
          >
            <a-row :gutter="16">
              <a-col :span="24">
                <a-form-item field="name" :label="t.colName">
                  <a-input v-model="editor.name" :placeholder="t.phName" allow-clear />
                </a-form-item>
              </a-col>
              <a-col :span="editorColSpan">
                <a-form-item field="level" :label="t.colLevel">
                  <a-select
                    v-model="editor.level"
                    :options="levelOptions"
                    :placeholder="t.selectDefault"
                    allow-clear
                  />
                </a-form-item>
              </a-col>
              <a-col :span="editorColSpan">
                <a-form-item field="industry" :label="t.colIndustry">
                  <a-select
                    v-model="editor.industry"
                    :options="industryOptions"
                    :placeholder="t.selectDefault"
                    allow-clear
                  />
                </a-form-item>
              </a-col>
              <a-col :span="editorColSpan">
                <a-form-item field="status" :label="t.colStatus">
                  <a-select
                    v-model="editor.status"
                    :options="statusOptions"
                    :placeholder="t.selectDefault"
                    allow-clear
                  />
                </a-form-item>
              </a-col>
              <a-col :span="editorColSpan">
                <a-form-item field="source" :label="t.colSource">
                  <a-select
                    v-model="editor.source"
                    :options="sourceOptions"
                    :placeholder="t.selectDefault"
                    allow-clear
                  />
                </a-form-item>
              </a-col>
              <a-col :span="editorColSpan">
                <a-form-item field="region" :label="t.colRegion">
                  <a-select
                    v-model="editor.region"
                    :options="regionOptions"
                    :placeholder="t.selectDefault"
                    allow-clear
                  />
                </a-form-item>
              </a-col>
              <a-col :span="editorColSpan">
                <a-form-item field="contact" :label="t.colContact">
                  <a-input v-model="editor.contact" :placeholder="t.phContact" allow-clear />
                </a-form-item>
              </a-col>
              <a-col :span="editorColSpan">
                <a-form-item field="phone" :label="t.colPhone">
                  <a-input v-model="editor.phone" :placeholder="t.phPhone" allow-clear />
                </a-form-item>
              </a-col>
              <a-col :span="editorColSpan">
                <a-form-item field="owner" :label="t.colOwner">
                  <a-select
                    v-model="editor.owner"
                    :options="ownerOptions"
                    :placeholder="t.selectDefault"
                    allow-clear
                    allow-search
                  />
                </a-form-item>
              </a-col>
              <a-col :span="editorColSpan">
                <a-form-item field="dealAmount" :label="t.colDealAmount">
                  <a-input-number
                    v-model="editor.dealAmount"
                    :min="0"
                    :step="10000"
                    class="pro-field-block"
                    :placeholder="t.phDealAmount"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item field="remark" :label="t.colRemark">
                  <a-textarea v-model="editor.remark" :placeholder="t.phRemark" :auto-size="{ minRows: 3, maxRows: 6 }" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
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

  mountProPage({ pageKey: 'list/tag-filter', title: '标签筛选', pageComponent: ListTagFilterPage })
})()
