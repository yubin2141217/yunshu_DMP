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
    return {
      id: '',
      name: '',
      supplierId: '',
      frontHost: '',
      frontPort: '',
      protocol: 'HTTPS',
      path: '',
      frequency: 'realtime',
      updateMode: 'incremental',
      incrementField: '',
      retry: 3,
      remark: '',
      status: 'enabled',
    }
  }

  function createDefaultColumns() {
    return [
      { title: '方案名称', dataIndex: 'name', minWidth: 160, ellipsis: true, tooltip: true },
      { title: '供数方', dataIndex: 'supplierName', width: 140 },
      { title: '前置机', dataIndex: 'frontHost', minWidth: 160, slotName: 'front' },
      { title: '协议', dataIndex: 'protocol', width: 90 },
      { title: '推送频次', dataIndex: 'frequencyLabel', width: 110 },
      { title: '更新规则', dataIndex: 'updateModeLabel', width: 100 },
      { title: '状态', dataIndex: 'status', width: 100, slotName: 'status' },
      { title: '更新时间', dataIndex: 'updatedAt', width: 180 },
      { title: '操作', dataIndex: 'operations', width: 240, fixed: 'right', slotName: 'operations' },
    ]
  }

  const SchemeListPage = {
    name: 'SchemeListPage',
    data() {
      const defaultColumns = createDefaultColumns()
      return {
        form: emptyForm(),
        data: [],
        loading: false,
        pagination: { current: 1, pageSize: 10, total: 0 },
        allColumns: defaultColumns.map((col) => ({ ...col })),
        showColumnKeys: defaultColumns.map((col) => col.dataIndex),
        tableSize: window.ArcoProTablePrefs ? ArcoProTablePrefs.getDensity() : 'medium',
        tableHostWidth: 0,
        isMobile: typeof window !== 'undefined' ? window.innerWidth <= 768 : false,
        modalVisible: false,
        modalMode: 'create',
        editor: emptyEditor(),
        saving: false,
        editorRules: {
          name: [{ required: true, message: '请填写方案名称' }],
          frontHost: [{ required: true, message: '请填写前置机地址' }],
          protocol: [{ required: true, message: '请选择协议' }],
          frequency: [{ required: true, message: '请选择推送频次' }],
          updateMode: [{ required: true, message: '请选择更新规则' }],
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
      protocolOptions() {
        return [
          { label: 'HTTPS', value: 'HTTPS' },
          { label: 'HTTP', value: 'HTTP' },
          { label: 'SFTP', value: 'SFTP' },
        ]
      },
      frequencyOptions() {
        return [
          { label: '实时', value: 'realtime' },
          { label: '每小时', value: 'hourly' },
          { label: '每日', value: 'daily' },
        ]
      },
      updateModeOptions() {
        return [
          { label: '增量', value: 'incremental' },
          { label: '全量', value: 'full' },
        ]
      },
      supplierOptions() {
        return [{ label: '不指定', value: '' }].concat(
          mock.getSuppliers().map((s) => ({ label: s.name, value: s.id }))
        )
      },
      modalTitle() {
        return this.modalMode === 'create' ? '新增接入方案' : '编辑接入方案'
      },
      modalWidth() {
        return this.isMobile ? 'calc(100vw - 32px)' : 640
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
        return { columns: visible, scroll: { x: 1240 } }
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
          let list = mock.getSchemes()
          if (name) list = list.filter((s) => s.name.indexOf(name) >= 0)
          if (this.form.status) list = list.filter((s) => s.status === this.form.status)
          const res = mock.paginate(list, page, pageSize)
          this.data = res.list
          this.pagination = { ...this.pagination, current: page, pageSize, total: res.total }
          this.loading = false
        }, 180)
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
        this.editor = { ...emptyEditor(), ...record, supplierId: record.supplierId || '' }
        this.modalVisible = true
      },
      openDetail(record) {
        window.location.href = 'scheme-detail.html?id=' + encodeURIComponent(record.id)
      },
      closeModal() {
        this.modalVisible = false
        this.saving = false
      },
      submitEditor() {
        this.$refs.editorForm.validate((err) => {
          if (err) return
          if (mock.schemeNameExists(this.editor.name, this.editor.id || '')) {
            ArcoVue.Message.warning('该名称已存在')
            return
          }
          if (this.editor.updateMode === 'incremental' && !String(this.editor.incrementField || '').trim()) {
            ArcoVue.Message.warning('增量更新请填写增量字段')
            return
          }
          this.saving = true
          setTimeout(() => {
            mock.saveScheme({ ...this.editor })
            this.saving = false
            this.modalVisible = false
            ArcoVue.Message.success(this.modalMode === 'create' ? '新增成功' : '保存成功')
            this.fetchData(1, this.pagination.pageSize)
          }, 240)
        })
      },
      onToggleStatus(record) {
        const next = record.status === 'enabled' ? 'disabled' : 'enabled'
        if (next === 'disabled') {
          openConfirm({
            title: '停用接入方案',
            content: '停用后新建接入标准时不可再选用该方案。已被标准引用的记录仍保留。确定停用？',
            okText: '停用',
            cancelText: '取消',
            okButtonProps: { status: 'danger' },
            onOk: () => {
              mock.setSchemeStatus(record.id, 'disabled')
              ArcoVue.Message.success('已停用')
              this.fetchData(this.pagination.current, this.pagination.pageSize)
            },
          })
          return
        }
        mock.setSchemeStatus(record.id, 'enabled')
        ArcoVue.Message.success('已启用')
        this.fetchData(this.pagination.current, this.pagination.pageSize)
      },
      onDelete(record) {
        openConfirm({
          title: '删除接入方案',
          content: '确定删除该接入方案？',
          okText: '删除',
          cancelText: '取消',
          okButtonProps: { status: 'danger' },
          onOk: () => {
            const res = mock.removeScheme(record.id)
            if (!res.ok && res.reason === 'referenced') {
              ArcoVue.Message.warning('已被接入标准引用，无法删除')
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
    },
    template: `
      <div class="list-search-table-page">
        <a-card class="general-card pro-page-card">
          <a-row class="pro-search-panel">
            <a-col :flex="isMobile ? '100%' : 1">
              <a-form class="pro-search-form" :model="form" :layout="isMobile ? 'vertical' : 'horizontal'" :label-col-props="isMobile ? undefined : { flex: '7em' }" :wrapper-col-props="isMobile ? undefined : { flex: 1 }" label-align="left">
                <a-row :gutter="16">
                  <a-col :xs="24" :sm="12" :md="8">
                    <a-form-item field="name" label="方案名称">
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
              <a-button type="primary" @click="onSearch"><template #icon><icon-search /></template>查询</a-button>
              <a-button @click="onReset"><template #icon><icon-refresh /></template>重置</a-button>
            </a-col>
          </a-row>
        </a-card>
        <a-card class="general-card">
          <div class="pro-toolbar">
            <a-space>
              <a-button type="primary" @click="openCreate"><template #icon><icon-plus /></template>新增</a-button>
            </a-space>
            <div class="pro-toolbar-right">
              <div class="pro-toolbar-icons">
                <a-tooltip content="刷新"><a-button class="pro-toolbar-icon-btn" @click="onRefreshTable"><template #icon><icon-refresh /></template></a-button></a-tooltip>
              </div>
            </div>
          </div>
          <a-table :columns="columns" :data="data" :loading="loading" :size="tableSize" row-key="id" :pagination="false" :bordered="false" :scroll="tableScroll">
            <template #front="{ record }">{{ record.frontHost }}{{ record.frontPort ? ':' + record.frontPort : '' }}</template>
            <template #status="{ record }">
              <a-tag :color="record.status === 'enabled' ? 'green' : 'gray'" size="small">{{ record.status === 'enabled' ? '启用' : '停用' }}</a-tag>
            </template>
            <template #operations="{ record }">
              <a-space class="pro-table-ops" :size="4">
                <a-button type="text" :size="opsBtnSize" @click="openDetail(record)">详情</a-button>
                <a-button type="text" :size="opsBtnSize" @click="openEdit(record)">编辑</a-button>
                <a-button type="text" :size="opsBtnSize" @click="onToggleStatus(record)">{{ record.status === 'enabled' ? '停用' : '启用' }}</a-button>
                <a-button type="text" status="danger" :size="opsBtnSize" @click="onDelete(record)">删除</a-button>
              </a-space>
            </template>
            <template #empty><a-empty description="暂无接入方案" /></template>
          </a-table>
          <div class="pro-table-footer">
            <span></span>
            <a-pagination v-model:current="pagination.current" :total="pagination.total" :page-size="pagination.pageSize" show-total show-page-size @change="onPageChange" @page-size-change="onPageSizeChange" />
          </div>
        </a-card>
        <a-modal :visible="modalVisible" :title="modalTitle" :width="modalWidth" title-align="start" unmount-on-close @cancel="closeModal">
          <a-form ref="editorForm" :model="editor" :rules="editorRules" layout="vertical">
            <a-form-item field="name" label="方案名称"><a-input v-model="editor.name" :max-length="50" /></a-form-item>
            <a-form-item field="supplierId" label="适用供数方"><a-select v-model="editor.supplierId" :options="supplierOptions" allow-clear placeholder="可不指定" /></a-form-item>
            <a-row :gutter="16">
              <a-col :span="14"><a-form-item field="frontHost" label="前置机地址"><a-input v-model="editor.frontHost" placeholder="IP 或主机名" /></a-form-item></a-col>
              <a-col :span="10"><a-form-item field="frontPort" label="端口"><a-input v-model="editor.frontPort" placeholder="如 8443" /></a-form-item></a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12"><a-form-item field="protocol" label="协议"><a-select v-model="editor.protocol" :options="protocolOptions" /></a-form-item></a-col>
              <a-col :span="12"><a-form-item field="path" label="推送路径"><a-input v-model="editor.path" placeholder="/api/v1/articles" /></a-form-item></a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12"><a-form-item field="frequency" label="推送频次"><a-select v-model="editor.frequency" :options="frequencyOptions" /></a-form-item></a-col>
              <a-col :span="12"><a-form-item field="updateMode" label="更新规则"><a-select v-model="editor.updateMode" :options="updateModeOptions" /></a-form-item></a-col>
            </a-row>
            <a-form-item field="incrementField" label="增量字段">
              <a-input v-model="editor.incrementField" placeholder="增量更新时必填，如 content_time" />
            </a-form-item>
            <a-form-item field="retry" label="失败重试次数"><a-input-number v-model="editor.retry" :min="0" :max="10" style="width: 100%" /></a-form-item>
            <a-form-item field="status" label="状态"><a-select v-model="editor.status" :options="statusOptions" /></a-form-item>
            <a-form-item field="remark" label="备注"><a-textarea v-model="editor.remark" :auto-size="{ minRows: 2, maxRows: 4 }" /></a-form-item>
          </a-form>
          <template #footer>
            <a-button @click="closeModal">取消</a-button>
            <a-button type="primary" :loading="saving" @click="submitEditor">确定</a-button>
          </template>
        </a-modal>
      </div>
    `,
  }

  mountProPage({ pageKey: 'scheme', title: '接入方案', pageComponent: SchemeListPage })
})()
