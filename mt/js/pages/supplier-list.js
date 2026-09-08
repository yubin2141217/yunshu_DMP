;(function () {
  const mock = window.YunshuMock

  function openConfirm(options) {
    return ArcoVue.Modal.confirm({
      simple: true,
      titleAlign: 'start',
      modalClass: 'pro-confirm-modal',
      width: 420,
      ...options,
    })
  }

  function emptyForm() {
    return { name: '', status: '' }
  }

  function emptyEditor() {
    return { id: '', name: '', code: '', status: 'enabled' }
  }

  function createDefaultColumns() {
    return [
      { title: '供数方名称', dataIndex: 'name', minWidth: 180, ellipsis: true, tooltip: true },
      { title: '编码', dataIndex: 'code', width: 140 },
      { title: '状态', dataIndex: 'status', width: 110, slotName: 'status' },
      { title: '更新时间', dataIndex: 'updatedAt', width: 180 },
      {
        title: '操作',
        dataIndex: 'operations',
        width: 200,
        fixed: 'right',
        slotName: 'operations',
      },
    ]
  }

  const SupplierListPage = {
    name: 'SupplierListPage',
    data() {
      const defaultColumns = createDefaultColumns()
      return {
        form: emptyForm(),
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
        modalMode: 'create',
        editor: emptyEditor(),
        saving: false,
        editorRules: {
          name: [
            { required: true, message: '请填写供数方名称' },
            { max: 50, message: '名称不超过 50 字' },
          ],
          code: [
            { required: true, message: '请填写编码' },
            { min: 2, message: '编码为 2–32 位' },
            { max: 32, message: '编码为 2–32 位' },
          ],
          status: [{ required: true, message: '请选择状态' }],
        },
      }
    },
    computed: {
      statusOptions() {
        return [
          { label: '启用', value: 'enabled' },
          { label: '停用', value: 'disabled' },
        ]
      },
      modalTitle() {
        return this.modalMode === 'create' ? '新增供数方' : '编辑供数方'
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
        return { columns: visible, scroll: { x: 980 } }
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
      statusLabel(status) {
        return status === 'enabled' ? '启用' : '停用'
      },
      statusColor(status) {
        return status === 'enabled' ? 'green' : 'gray'
      },
      fetchData(page, pageSize) {
        this.loading = true
        setTimeout(() => {
          const name = String(this.form.name || '').trim()
          const status = this.form.status
          let list = mock.getSuppliers()
          if (name) list = list.filter((s) => s.name.indexOf(name) >= 0)
          if (status) list = list.filter((s) => s.status === status)
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
        this.form = emptyForm()
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
      openCreate() {
        this.modalMode = 'create'
        this.editor = emptyEditor()
        this.modalVisible = true
      },
      openEdit(record) {
        this.modalMode = 'edit'
        this.editor = {
          id: record.id,
          name: record.name,
          code: record.code,
          status: record.status,
        }
        this.modalVisible = true
      },
      closeModal() {
        this.modalVisible = false
        this.saving = false
      },
      submitEditor() {
        this.$refs.editorForm.validate((err) => {
          if (err) return
          const name = String(this.editor.name || '').trim()
          const code = String(this.editor.code || '').trim()
          if (name.length < 1 || name.length > 50) {
            ArcoVue.Message.warning('名称为 1–50 字')
            return
          }
          if (code.length < 2 || code.length > 32) {
            ArcoVue.Message.warning('编码为 2–32 位')
            return
          }
          const exceptId = this.modalMode === 'edit' ? this.editor.id : ''
          if (mock.nameExists(name, exceptId)) {
            ArcoVue.Message.warning('该名称已存在')
            return
          }
          if (mock.codeExists(code, exceptId)) {
            ArcoVue.Message.warning('该编码已存在')
            return
          }
          this.saving = true
          setTimeout(() => {
            if (this.modalMode === 'create') {
              mock.createSupplier({ name, code, status: this.editor.status })
              ArcoVue.Message.success('新增成功')
            } else {
              mock.updateSupplier(this.editor.id, { name, code, status: this.editor.status })
              ArcoVue.Message.success('保存成功')
            }
            this.saving = false
            this.modalVisible = false
            this.fetchData(1, this.pagination.pageSize)
          }, 280)
        })
      },
      onToggleStatus(record) {
        if (record.status === 'enabled') {
          openConfirm({
            title: '停用供数方',
            content:
              '停用后将停止为已配置机构计入该供数方新数据，已入库条数仍计入机构历史总量。确定停用？',
            okText: '停用',
            cancelText: '取消',
            okButtonProps: { status: 'danger' },
            onOk: () => {
              mock.setSupplierStatus(record.id, 'disabled')
              ArcoVue.Message.success('已停用')
              this.fetchData(this.pagination.current, this.pagination.pageSize)
            },
          })
          return
        }
        mock.setSupplierStatus(record.id, 'enabled')
        ArcoVue.Message.success('已启用')
        this.fetchData(this.pagination.current, this.pagination.pageSize)
      },
      onDelete(record) {
        openConfirm({
          title: '删除供数方',
          content: '确定删除该供数方？',
          okText: '删除',
          cancelText: '取消',
          okButtonProps: { status: 'danger' },
          onOk: () => {
            const res = mock.removeSupplier(record.id)
            if (!res.ok && res.reason === 'referenced') {
              ArcoVue.Message.warning('已被机构引用，请停用')
              return
            }
            ArcoVue.Message.success('已删除')
            const page =
              this.data.length <= 1 && this.pagination.current > 1
                ? this.pagination.current - 1
                : this.pagination.current
            this.fetchData(page, this.pagination.pageSize)
          },
        })
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
                :label-col-props="isMobile ? undefined : { flex: '7em' }"
                :wrapper-col-props="isMobile ? undefined : { flex: 1 }"
                label-align="left"
              >
                <a-row :gutter="16">
                  <a-col :xs="24" :sm="12" :md="8">
                    <a-form-item field="name" label="供数方名称">
                      <a-input v-model="form.name" placeholder="请输入名称" allow-clear @press-enter="onSearch" />
                    </a-form-item>
                  </a-col>
                  <a-col :xs="24" :sm="12" :md="8">
                    <a-form-item field="status" label="状态">
                      <a-select v-model="form.status" :options="statusOptions" placeholder="全部" allow-clear />
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
            <a-space>
              <a-button type="primary" @click="openCreate">
                <template #icon><icon-plus /></template>新增
              </a-button>
            </a-space>
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
            <template #status="{ record }">
              <a-tag :color="statusColor(record.status)" size="small">{{ statusLabel(record.status) }}</a-tag>
            </template>
            <template #operations="{ record }">
              <a-space class="pro-table-ops" :size="4">
                <a-button type="text" :size="opsBtnSize" @click="openEdit(record)">编辑</a-button>
                <a-button type="text" :size="opsBtnSize" @click="onToggleStatus(record)">
                  {{ record.status === 'enabled' ? '停用' : '启用' }}
                </a-button>
                <a-button type="text" status="danger" :size="opsBtnSize" @click="onDelete(record)">删除</a-button>
              </a-space>
            </template>
            <template #empty>
              <a-empty description="暂无供数方数据" />
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
          :title="modalTitle"
          :width="modalWidth"
          title-align="start"
          unmount-on-close
          @cancel="closeModal"
          @ok="submitEditor"
        >
          <a-form ref="editorForm" :model="editor" :rules="editorRules" layout="vertical">
            <a-form-item field="name" label="供数方名称">
              <a-input v-model="editor.name" placeholder="1–50 字，全局唯一" :max-length="50" allow-clear />
            </a-form-item>
            <a-form-item field="code" label="编码">
              <a-input v-model="editor.code" placeholder="2–32 位，全局唯一" :max-length="32" allow-clear />
            </a-form-item>
            <a-form-item field="status" label="状态">
              <a-select v-model="editor.status" :options="statusOptions" />
            </a-form-item>
          </a-form>
          <template #footer>
            <a-button @click="closeModal">取消</a-button>
            <a-button type="primary" :loading="saving" @click="submitEditor">确定</a-button>
          </template>
        </a-modal>
      </div>
    `,
  }

  mountProPage({ pageKey: 'suppliers', title: '供数方管理', pageComponent: SupplierListPage })
})()
