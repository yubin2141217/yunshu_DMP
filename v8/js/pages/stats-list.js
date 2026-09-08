;(function () {
  const mock = window.YunshuMock

  function createDefaultColumns() {
    return [
      { title: '供数方名称', dataIndex: 'name', minWidth: 220, ellipsis: true, tooltip: true },
      { title: '入库条数', dataIndex: 'count', width: 160, slotName: 'count' },
    ]
  }

  const StatsListPage = {
    name: 'StatsListPage',
    data() {
      const defaultColumns = createDefaultColumns()
      return {
        form: { range: 'all', supplierId: 'all' },
        data: [],
        inboundTotal: 0,
        loading: false,
        pagination: { current: 1, pageSize: 10, total: 0 },
        allColumns: defaultColumns.map((col) => ({ ...col })),
        showColumnKeys: defaultColumns.map((col) => col.dataIndex),
        dragColIndex: -1,
        dragOverColIndex: -1,
        tableSize: window.ArcoProTablePrefs ? ArcoProTablePrefs.getDensity() : 'medium',
        tableHostWidth: 0,
        isMobile: typeof window !== 'undefined' ? window.innerWidth <= 768 : false,
        emptyText: '暂无入库数据',
      }
    },
    computed: {
      rangeOptions() {
        return [
          { label: '全部', value: 'all' },
          { label: '近 7 天', value: 'd7' },
          { label: '近 30 天', value: 'd30' },
        ]
      },
      supplierOptions() {
        const rows = mock.configuredSuppliers().map((s) => ({ label: s.name, value: s.id }))
        return [{ label: '全部', value: 'all' }, ...rows]
      },
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
        return { columns: visible, scroll: { x: 640 } }
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
      rangeLabel() {
        const hit = this.rangeOptions.find((opt) => opt.value === this.form.range)
        return (hit && hit.label) || '全部'
      },
      supplierLabel() {
        const hit = this.supplierOptions.find((opt) => opt.value === this.form.supplierId)
        return (hit && hit.label) || '全部'
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
          let filtered = mock.statsRows(this.form.range)
          if (this.form.supplierId && this.form.supplierId !== 'all') {
            filtered = filtered.filter((row) => row.id === this.form.supplierId)
          }
          const res = mock.paginate(filtered, page, pageSize)
          this.data = res.list
          this.inboundTotal = filtered.reduce((sum, row) => sum + Number(row.count || 0), 0)
          this.pagination = { ...this.pagination, current: page, pageSize, total: res.total }
          this.loading = false
        }, 220)
      },
      onSearch() {
        this.fetchData(1, this.pagination.pageSize)
      },
      onReset() {
        this.form = { range: 'all', supplierId: 'all' }
        this.fetchData(1, this.pagination.pageSize)
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
      onDensityChange(size) {
        this.tableSize = size
        if (window.ArcoProTablePrefs) ArcoProTablePrefs.setDensity(size)
      },
      onColumnCheckChange(key, checked) {
        if (checked) {
          if (!this.showColumnKeys.includes(key)) this.showColumnKeys = [...this.showColumnKeys, key]
        } else {
          if (this.showColumnKeys.length <= 1) {
            if (window.ArcoVue && ArcoVue.Message) {
              ArcoVue.Message.warning(
                (window.ArcoProTablePrefs && ArcoProTablePrefs.keepOneDataColumnTip) || '至少保留一列'
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
        const defaults = createDefaultColumns()
        this.allColumns = defaults.map((col) => ({ ...col }))
        this.showColumnKeys = defaults.map((col) => col.dataIndex)
      },
    },
    template: `
      <div class="list-search-table-page workplace-page">
        <div class="workplace-header">
          <div class="workplace-header-text">
            <h2 class="workplace-title">供数统计</h2>
            <p class="workplace-desc">按供数方核验本机构入库条数，与数据概览同一口径。</p>
          </div>
          <div class="v8-summary-stats">
            <span>时间范围<strong>{{ rangeLabel }}</strong></span>
            <span>供数方<strong>{{ supplierLabel }}</strong></span>
            <span>入库合计<strong>{{ Number(inboundTotal).toLocaleString('zh-CN') }}</strong></span>
          </div>
        </div>

        <a-card class="general-card v8-content-card" :bordered="true">
          <div class="v8-page-search">
            <a-radio-group v-model="form.range" type="button" :options="rangeOptions" @change="onSearch" />
            <a-select
              v-model="form.supplierId"
              :options="supplierOptions"
              placeholder="供数方"
              allow-search
              @change="onSearch"
            />
            <a-button type="primary" @click="onSearch">
              <template #icon><icon-search /></template>查询
            </a-button>
            <a-button @click="onReset">重置</a-button>
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
            <template #count="{ record }">{{ Number(record.count).toLocaleString('zh-CN') }}</template>
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

  mountProPage({ pageKey: 'stats', title: '供数统计', pageComponent: StatsListPage })
})()
