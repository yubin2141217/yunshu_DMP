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
    return { name: '', category: '', status: '' }
  }

  function emptyEditor() {
    return {
      id: '',
      name: '',
      code: '',
      category: 'table',
      topic: '舆情',
      bizCaliber: '',
      requiredLevel: 'required',
      provider: '',
      charset: 'UTF-8',
      primaryKey: '',
      dataType: '',
      updateCycle: '实时',
      maxSize: '',
      owner: '平台运营',
      monitor: '',
      sla: '',
      remark: '',
      status: 'enabled',
    }
  }

  function createDefaultColumns() {
    return [
      { title: '名称', dataIndex: 'name', minWidth: 180, ellipsis: true, tooltip: true },
      { title: '编码', dataIndex: 'code', width: 160 },
      { title: '数据分类', dataIndex: 'category', width: 140, slotName: 'category' },
      { title: '是否必接', dataIndex: 'requiredLevel', width: 100, slotName: 'requiredLevel' },
      { title: '状态', dataIndex: 'status', width: 100, slotName: 'status' },
      { title: '更新时间', dataIndex: 'updatedAt', width: 180 },
      { title: '操作', dataIndex: 'operations', width: 240, fixed: 'right', slotName: 'operations' },
    ]
  }

  const MetadataListPage = {
    name: 'MetadataListPage',
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
          name: [{ required: true, message: '请填写名称' }],
          code: [{ required: true, message: '请填写编码' }],
          category: [{ required: true, message: '请选择分类' }],
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
      categoryOptions() {
        return [
          { label: '库表数据集', value: 'table' },
          { label: '非结构化数据', value: 'unstructured' },
          { label: '接口数据', value: 'api' },
        ]
      },
      requiredOptions() {
        return [
          { label: '必接', value: 'required' },
          { label: '建议', value: 'suggested' },
          { label: '可选', value: 'optional' },
        ]
      },
      modalTitle() {
        return this.modalMode === 'create' ? '新增元数据' : '编辑元数据'
      },
      modalWidth() {
        return this.isMobile ? 'calc(100vw - 32px)' : 720
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
        return { columns: visible, scroll: { x: 1100 } }
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
      categoryLabel(v) {
        return mock.categoryLabels[v] || v
      },
      requiredLabel(v) {
        return mock.requiredLabels[v] || v
      },
      fetchData(page, pageSize) {
        this.loading = true
        setTimeout(() => {
          const name = String(this.form.name || '').trim()
          let list = mock.getMetadata()
          if (name) list = list.filter((s) => s.name.indexOf(name) >= 0 || s.code.indexOf(name) >= 0)
          if (this.form.category) list = list.filter((s) => s.category === this.form.category)
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
        this.editor = { ...emptyEditor(), ...record }
        this.modalVisible = true
      },
      openDetail(record) {
        window.location.href = 'metadata-detail.html?id=' + encodeURIComponent(record.id)
      },
      closeModal() {
        this.modalVisible = false
        this.saving = false
      },
      submitEditor() {
        this.$refs.editorForm.validate((err) => {
          if (err) return
          if (mock.metadataNameExists(this.editor.name, this.editor.id || '')) {
            ArcoVue.Message.warning('该名称已存在')
            return
          }
          if (mock.metadataCodeExists(this.editor.code, this.editor.id || '')) {
            ArcoVue.Message.warning('该编码已存在')
            return
          }
          this.saving = true
          setTimeout(() => {
            mock.saveMetadata({ ...this.editor })
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
            title: '停用元数据',
            content: '停用后新建接入标准时不可再选用该项。已被标准引用的记录仍保留。确定停用？',
            okText: '停用',
            cancelText: '取消',
            okButtonProps: { status: 'danger' },
            onOk: () => {
              mock.setMetadataStatus(record.id, 'disabled')
              ArcoVue.Message.success('已停用')
              this.fetchData(this.pagination.current, this.pagination.pageSize)
            },
          })
          return
        }
        mock.setMetadataStatus(record.id, 'enabled')
        ArcoVue.Message.success('已启用')
        this.fetchData(this.pagination.current, this.pagination.pageSize)
      },
      onDelete(record) {
        openConfirm({
          title: '删除元数据',
          content: '确定删除该元数据？',
          okText: '删除',
          cancelText: '取消',
          okButtonProps: { status: 'danger' },
          onOk: () => {
            const res = mock.removeMetadata(record.id)
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
                    <a-form-item field="name" label="名称/编码">
                      <a-input v-model="form.name" placeholder="请输入" allow-clear @press-enter="onSearch" />
                    </a-form-item>
                  </a-col>
                  <a-col :xs="24" :sm="12" :md="8">
                    <a-form-item field="category" label="数据分类">
                      <a-select v-model="form.category" :options="categoryOptions" placeholder="全部" allow-clear />
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
            <template #category="{ record }">{{ categoryLabel(record.category) }}</template>
            <template #requiredLevel="{ record }">{{ requiredLabel(record.requiredLevel) }}</template>
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
            <template #empty><a-empty description="暂无元数据" /></template>
          </a-table>
          <div class="pro-table-footer">
            <span></span>
            <a-pagination v-model:current="pagination.current" :total="pagination.total" :page-size="pagination.pageSize" show-total show-page-size @change="onPageChange" @page-size-change="onPageSizeChange" />
          </div>
        </a-card>
        <a-modal :visible="modalVisible" :title="modalTitle" :width="modalWidth" title-align="start" unmount-on-close @cancel="closeModal">
          <a-form ref="editorForm" :model="editor" :rules="editorRules" layout="vertical">
            <div class="profile-section-title">业务属性</div>
            <a-row :gutter="16">
              <a-col :span="12"><a-form-item field="name" label="中文名称"><a-input v-model="editor.name" :max-length="50" /></a-form-item></a-col>
              <a-col :span="12"><a-form-item field="code" label="编码"><a-input v-model="editor.code" :max-length="32" /></a-form-item></a-col>
              <a-col :span="12"><a-form-item field="category" label="数据分类"><a-select v-model="editor.category" :options="categoryOptions" /></a-form-item></a-col>
              <a-col :span="12"><a-form-item field="topic" label="主题"><a-input v-model="editor.topic" /></a-form-item></a-col>
              <a-col :span="12"><a-form-item field="requiredLevel" label="是否必接"><a-select v-model="editor.requiredLevel" :options="requiredOptions" /></a-form-item></a-col>
              <a-col :span="12"><a-form-item field="provider" label="提供方说明"><a-input v-model="editor.provider" /></a-form-item></a-col>
              <a-col :span="24"><a-form-item field="bizCaliber" label="业务口径"><a-textarea v-model="editor.bizCaliber" :auto-size="{ minRows: 2, maxRows: 4 }" /></a-form-item></a-col>
            </a-row>
            <div class="profile-section-title">技术属性</div>
            <a-row :gutter="16">
              <a-col :span="12"><a-form-item field="charset" label="字符集"><a-input v-model="editor.charset" /></a-form-item></a-col>
              <a-col :span="12"><a-form-item field="primaryKey" label="主键"><a-input v-model="editor.primaryKey" /></a-form-item></a-col>
              <a-col :span="12"><a-form-item field="dataType" label="数据类型/格式"><a-input v-model="editor.dataType" /></a-form-item></a-col>
              <a-col :span="12"><a-form-item field="updateCycle" label="更新周期"><a-input v-model="editor.updateCycle" /></a-form-item></a-col>
              <a-col :span="24"><a-form-item field="maxSize" label="大小/长度上限"><a-input v-model="editor.maxSize" /></a-form-item></a-col>
            </a-row>
            <div class="profile-section-title">运维操作属性</div>
            <a-row :gutter="16">
              <a-col :span="12"><a-form-item field="owner" label="负责人"><a-input v-model="editor.owner" /></a-form-item></a-col>
              <a-col :span="12"><a-form-item field="status" label="状态"><a-select v-model="editor.status" :options="statusOptions" /></a-form-item></a-col>
              <a-col :span="24"><a-form-item field="monitor" label="监控方式"><a-input v-model="editor.monitor" /></a-form-item></a-col>
              <a-col :span="24"><a-form-item field="sla" label="时效/SLA"><a-input v-model="editor.sla" /></a-form-item></a-col>
              <a-col :span="24"><a-form-item field="remark" label="备注"><a-textarea v-model="editor.remark" :auto-size="{ minRows: 2, maxRows: 4 }" /></a-form-item></a-col>
            </a-row>
          </a-form>
          <template #footer>
            <a-button @click="closeModal">取消</a-button>
            <a-button type="primary" :loading="saving" @click="submitEditor">确定</a-button>
          </template>
        </a-modal>
      </div>
    `,
  }

  mountProPage({ pageKey: 'metadata', title: '字段库管理', pageComponent: MetadataListPage })
})()
