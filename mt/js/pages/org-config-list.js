;(function () {
  const mock = window.YunshuMock

  function createDefaultColumns() {
    return [
      { title: '机构名称', dataIndex: 'name', minWidth: 180, ellipsis: true, tooltip: true },
      { title: '已配置供数方', dataIndex: 'supplierNames', minWidth: 280, slotName: 'supplierNames' },
      {
        title: '操作',
        dataIndex: 'operations',
        width: 100,
        fixed: 'right',
        slotName: 'operations',
      },
    ]
  }

  const OrgConfigPage = {
    name: 'OrgConfigPage',
    data() {
      const defaultColumns = createDefaultColumns()
      return {
        form: { name: '' },
        data: [],
        loading: false,
        pagination: { current: 1, pageSize: 10, total: 0 },
        allColumns: defaultColumns.map((col) => ({ ...col })),
        showColumnKeys: defaultColumns.map((col) => col.dataIndex),
        dragColIndex: -1,
        dragOverColIndex: -1,
        tableSize: window.ArcoProTablePrefs ? ArcoProTablePrefs.getDensity() : 'medium',
        tableHostWidth: 0,
        isMobile: typeof window !== 'undefined' ? window.innerWidth <= 768 : false,
        modalVisible: false,
        saving: false,
        editingOrg: null,
        selectedIds: [],
      }
    },
    computed: {
      enabledOptions() {
        return mock.enabledSuppliers().map((s) => ({ label: s.name, value: s.id }))
      },
      editOptions() {
        const map = {}
        mock.enabledSuppliers().forEach((s) => {
          map[s.id] = { label: s.name, value: s.id }
        })
        if (this.editingOrg && this.editingOrg.supplierIds) {
          this.editingOrg.supplierIds.forEach((id) => {
            const item = mock.findSupplier(id)
            if (item && !map[item.id]) {
              map[item.id] = { label: item.name + '（停用）', value: item.id }
            }
          })
        }
        return Object.keys(map).map((k) => map[k])
      },
      modalWidth() {
        return this.isMobile ? 'calc(100vw - 32px)' : 520
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
        return { columns: visible, scroll: { x: 780 } }
      },
      columns() {
        return this.tableLayout.columns
      },
      tableScroll() {
        return this.tableLayout.scroll
      },
      opsBtnSize() {
        const prefs = window.ArcoProTablePrefs
        return prefs && prefs.opsButtonSize ? prefs.opsButtonSize(this.tableSize) : 'small'
      },
      densityOptions() {
        return [
          { label: '默认', value: 'medium' },
          { label: '中等', value: 'small' },
          { label: '紧凑', value: 'mini' },
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
      if (this._measureTableHost && this._measureTableHost.disconnect) this._measureTableHost.disconnect()
    },
    methods: {
      fetchData(page, pageSize) {
        this.loading = true
        setTimeout(() => {
          const name = String(this.form.name || '').trim()
          let list = mock.getOrgs()
          if (name) list = list.filter((o) => o.name.indexOf(name) >= 0)
          const res = mock.paginate(list, page, pageSize)
          this.data = res.list
          this.pagination = { ...this.pagination, current: page, pageSize, total: res.total }
          this.loading = false
        }, 220)
      },
      onSearch() {
        this.fetchData(1, this.pagination.pageSize)
      },
      onReset() {
        this.form = { name: '' }
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
      openEdit(record) {
        this.editingOrg = record
        this.selectedIds = (record.supplierIds || []).slice()
        this.modalVisible = true
        this.$nextTick(() => {
          if (!this.editOptions.length) {
            ArcoVue.Message.warning('暂无启用中的供数方，请先在供数方管理中新增或启用')
          }
        })
      },
      closeModal() {
        this.modalVisible = false
        this.editingOrg = null
        this.selectedIds = []
      },
      submitEdit() {
        if (!this.editOptions.length) {
          ArcoVue.Message.warning('暂无启用中的供数方，请先在供数方管理中新增或启用')
          return
        }
        this.saving = true
        setTimeout(() => {
          mock.saveOrgSuppliers(this.editingOrg.id, this.selectedIds)
          this.saving = false
          this.modalVisible = false
          ArcoVue.Message.success('保存成功')
          this.fetchData(this.pagination.current, this.pagination.pageSize)
        }, 280)
      },
      onDensityChange(size) {
        this.tableSize = size
        if (window.ArcoProTablePrefs) ArcoProTablePrefs.setDensity(size)
      },
      onColumnCheckChange(key, checked) {
        if (key === 'operations') return
        if (checked) {
          if (!this.showColumnKeys.includes(key)) this.showColumnKeys = [...this.showColumnKeys, key]
        } else {
          const remaining = this.showColumnKeys.filter((k) => k !== key && k !== 'operations')
          if (!remaining.length) {
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
    },
    template: `
      <div class="list-search-table-page">
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
                  <a-col :xs="24" :sm="12" :md="8">
                    <a-form-item field="name" label="机构">
                      <a-input v-model="form.name" placeholder="按机构名称查找" allow-clear @press-enter="onSearch" />
                    </a-form-item>
                  </a-col>
                </a-row>
              </a-form>
            </a-col>
            <a-divider v-if="!isMobile" class="pro-search-divider" direction="vertical" />
            <a-col :flex="isMobile ? '100%' : 'none'" class="pro-search-actions" :class="{ 'is-mobile': isMobile }">
              <a-button type="primary" @click="onSearch">
                <template #icon><icon-search /></template>查询
              </a-button>
              <a-button @click="onReset">
                <template #icon><icon-refresh /></template>重置
              </a-button>
            </a-col>
          </a-row>
        </a-card>

        <a-card class="general-card">
          <div class="pro-toolbar">
            <a-space></a-space>
            <div class="pro-toolbar-right">
              <div class="pro-toolbar-icons">
                <a-tooltip content="刷新">
                  <a-button class="pro-toolbar-icon-btn" @click="onRefreshTable">
                    <template #icon><icon-refresh /></template>
                  </a-button>
                </a-tooltip>
                <a-dropdown trigger="click" @select="onDensityChange">
                  <a-tooltip content="密度">
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
                  <a-tooltip content="列设置">
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
                        <a-button type="text" size="small" @click="resetColumnSetting">重置</a-button>
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
          >
            <template #supplierNames="{ record }">
              <a-space v-if="record.supplierNames && record.supplierNames.length" wrap>
                <a-tag v-for="name in record.supplierNames" :key="name" size="small">{{ name }}</a-tag>
              </a-space>
              <span v-else>-</span>
            </template>
            <template #operations="{ record }">
              <a-space class="pro-table-ops" :size="4">
                <a-button type="text" :size="opsBtnSize" @click="openEdit(record)">编辑</a-button>
              </a-space>
            </template>
            <template #empty>
              <a-empty description="暂无机构数据" />
            </template>
          </a-table>
          <div class="pro-table-footer">
            <span></span>
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
          :visible="modalVisible"
          title="编辑供数配置"
          :width="modalWidth"
          title-align="start"
          unmount-on-close
          @cancel="closeModal"
          @ok="submitEdit"
        >
          <p v-if="editingOrg" style="margin: 0 0 12px">机构：{{ editingOrg.name }}</p>
          <a-empty v-if="!editOptions.length" description="暂无启用中的供数方，请先在供数方管理中新增或启用" />
          <a-checkbox-group v-else v-model="selectedIds" direction="vertical" :options="editOptions" />
          <template #footer>
            <a-button @click="closeModal">取消</a-button>
            <a-button type="primary" :loading="saving" @click="submitEdit">确定</a-button>
          </template>
        </a-modal>
      </div>
    `,
  }

  mountProPage({ pageKey: 'orgConfig', title: '机构供数配置', pageComponent: OrgConfigPage })
})()
