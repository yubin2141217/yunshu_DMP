;(function () {
  const mock = window.YunshuMock

  function createDefaultColumns() {
    return [
      { title: '供数方名称', dataIndex: 'name', minWidth: 220, ellipsis: true, tooltip: true },
      { title: '状态', dataIndex: 'status', width: 140, slotName: 'status' },
    ]
  }

  const SupplierViewPage = {
    name: 'SupplierViewPage',
    data() {
      const defaultColumns = createDefaultColumns()
      return {
        data: [],
        keyword: '',
        enabledCount: 0,
        disabledCount: 0,
        loading: false,
        pagination: { current: 1, pageSize: 10, total: 0 },
        allColumns: defaultColumns.map((col) => ({ ...col })),
        showColumnKeys: defaultColumns.map((col) => col.dataIndex),
        dragColIndex: -1,
        dragOverColIndex: -1,
        tableSize: window.ArcoProTablePrefs ? ArcoProTablePrefs.getDensity() : 'medium',
        tableHostWidth: 0,
        isMobile: typeof window !== 'undefined' ? window.innerWidth <= 768 : false,
        emptyText: '尚未配置供数方，请联系平台运营',
      }
    },
    computed: {
      tableLayout() {
        const visible = this.allColumns.filter((col) => this.showColumnKeys.includes(col.dataIndex))
        const prefs = window.ArcoProTablePrefs
        if (prefs && prefs.layoutTableColumns) {
          const preferredWidths = {}
          createDefaultColumns().forEach((col) => {
            const w = Number(col.width != null ? col.width : col.minWidth)
            preferredWidths[col.dataIndex] = Number.isFinite(w) && w > 0 ? w : 120
          })
          return prefs.layoutTableColumns(visible, {
            selectionWidth: 0,
            containerWidth: this.tableHostWidth,
            preferredWidths,
          })
        }
        return { columns: visible, scroll: { x: 560 } }
      },
      columns() {
        return this.tableLayout.columns
      },
      tableScroll() {
        return this.tableLayout.scroll
      },
      densityOptions() {
        return [
          { label: '默认', value: 'medium' },
          { label: '中等', value: 'small' },
          { label: '紧凑', value: 'mini' },
        ]
      },
      columnSettingOptions() {
        const dataKeys = this.showColumnKeys
        const onlyOne = dataKeys.length <= 1
        return this.allColumns.map((col) => ({
          label: col.title,
          value: col.dataIndex,
          disabled: onlyOne && dataKeys.includes(col.dataIndex),
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
      if (this._measureTableHost && this._measureTableHost.disconnect) this._measureTableHost.disconnect()
    },
    methods: {
      fetchData(page, pageSize) {
        this.loading = true
        setTimeout(() => {
          const kw = (this.keyword || '').trim().toLowerCase()
          let filtered = mock.configuredSuppliers()
          this.enabledCount = filtered.filter((row) => row.status === 'enabled').length
          this.disabledCount = filtered.filter((row) => row.status !== 'enabled').length
          if (kw) {
            filtered = filtered.filter((row) => String(row.name || '').toLowerCase().indexOf(kw) >= 0)
          }
          const res = mock.paginate(filtered, page, pageSize)
          this.data = res.list
          this.pagination = { ...this.pagination, current: page, pageSize, total: res.total }
          this.loading = false
        }, 220)
      },
      onPageChange(page) {
        this.fetchData(page, this.pagination.pageSize)
      },
      onPageSizeChange(size) {
        this.fetchData(1, size)
      },
      onRefreshTable() {
        this.fetchData(this.pagination.current, this.pagination.pageSize)
        ArcoVue.Message.success('已刷新')
      },
      onKeywordSearch() {
        this.fetchData(1, this.pagination.pageSize)
      },
      onDensityChange(size) {
        this.tableSize = size
        if (window.ArcoProTablePrefs) ArcoProTablePrefs.setDensity(size)
      },
      onColumnCheckChange(key, checked) {
        if (checked) {
          if (!this.showColumnKeys.includes(key)) this.showColumnKeys = [...this.showColumnKeys, key]
        } else {
          if (this.showColumnKeys.length <= 1) {
            ArcoVue.Message.warning('至少保留一列')
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
        const defaults = createDefaultColumns()
        this.allColumns = defaults.map((col) => ({ ...col }))
        this.showColumnKeys = defaults.map((col) => col.dataIndex)
      },
      statusLabel(status) {
        return status === 'enabled' ? '启用' : '停用'
      },
      statusColor(status) {
        return status === 'enabled' ? 'green' : 'gray'
      },
    },
    template: `
      <div class="list-search-table-page workplace-page">
        <div class="workplace-header">
          <div class="workplace-header-text">
            <h2 class="workplace-title">供数方查看</h2>
            <p class="workplace-desc">只读查看本机构已配置供数方，状态由平台运营维护。</p>
          </div>
          <div class="v8-summary-stats">
            <span>已配置<strong>{{ enabledCount + disabledCount }}</strong></span>
            <span>启用<strong>{{ enabledCount }}</strong></span>
            <span>停用<strong>{{ disabledCount }}</strong></span>
          </div>
        </div>

        <a-card class="general-card v8-content-card" :bordered="true">
          <div class="v8-page-search">
            <a-input
              v-model="keyword"
              placeholder="搜索供数方名称..."
              allow-clear
              @press-enter="onKeywordSearch"
              @clear="onKeywordSearch"
            >
              <template #prefix><icon-search /></template>
            </a-input>
            <a-button type="primary" @click="onKeywordSearch">查询</a-button>
            <div class="v8-toolbar-mini">
              <a-tooltip content="刷新">
                <a-button class="pro-toolbar-icon-btn" @click="onRefreshTable">
                  <template #icon><icon-refresh /></template>
                </a-button>
              </a-tooltip>
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
          >
            <template #status="{ record }">
              <a-tag :color="statusColor(record.status)" size="small">{{ statusLabel(record.status) }}</a-tag>
            </template>
            <template #empty>
              <a-empty :description="emptyText" />
            </template>
          </a-table>
          <div class="pro-table-footer v8-table-footer">
            <a-pagination
              v-model:current="pagination.current"
              :total="pagination.total"
              :page-size="pagination.pageSize"
              show-total
              show-page-size
              show-jumper
              @change="onPageChange"
              @page-size-change="onPageSizeChange"
            />
          </div>
        </a-card>
      </div>
    `,
  }

  mountProPage({ pageKey: 'suppliers', title: '供数方查看', pageComponent: SupplierViewPage })
})()
