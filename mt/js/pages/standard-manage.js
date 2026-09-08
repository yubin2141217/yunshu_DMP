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
      metadataId: '',
      schemeId: '',
      fileName: '',
      fileSize: '',
      fileUrl: './files/yunshu-access-standard-example.docx',
      status: 'disabled',
    }
  }

  function formatSize(bytes) {
    if (!bytes) return '—'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  function createDefaultColumns() {
    return [
      { title: '方案名称', dataIndex: 'name', minWidth: 200, ellipsis: true, tooltip: true },
      { title: '数据标准', dataIndex: 'metadataName', minWidth: 160, ellipsis: true, tooltip: true },
      { title: '接入方案', dataIndex: 'schemeName', minWidth: 140, ellipsis: true, tooltip: true },
      { title: '文件', dataIndex: 'fileName', minWidth: 180, ellipsis: true, tooltip: true },
      { title: '状态', dataIndex: 'status', width: 100, slotName: 'status' },
      { title: '上传人', dataIndex: 'uploader', width: 110 },
      { title: '上传时间', dataIndex: 'uploadedAt', width: 180 },
      { title: '操作', dataIndex: 'operations', width: 240, fixed: 'right', slotName: 'operations' },
    ]
  }

  const StandardListPage = {
    name: 'StandardListPage',
    components: {
      YunshuStandardPreviewDrawer: window.YunshuStandardPreviewDrawer,
    },
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
        fileList: [],
        previewVisible: false,
        previewName: '',
        editorRules: {
          name: [{ required: true, message: '请填写方案名称' }],
          metadataId: [{ required: true, message: '请选择数据标准' }],
          schemeId: [{ required: true, message: '请选择接入方案' }],
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
      metadataOptions() {
        return mock.enabledMetadata().map((m) => ({ label: m.name + '（' + m.code + '）', value: m.id }))
      },
      schemeOptions() {
        return mock.enabledSchemes().map((s) => ({ label: s.name, value: s.id }))
      },
      modalTitle() {
        return this.modalMode === 'create' ? '新增接入标准' : '编辑接入标准'
      },
      modalWidth() {
        return this.isMobile ? 'calc(100vw - 32px)' : 560
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
        return { columns: visible, scroll: { x: 1180 } }
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
          let list = mock.getStandards()
          if (name) list = list.filter((s) => s.name.indexOf(name) >= 0)
          if (status) list = list.filter((s) => s.status === status)
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
        if (!this.metadataOptions.length) {
          ArcoVue.Message.warning('暂无启用中的数据标准，请先在数据标准中新增或启用')
          return
        }
        if (!this.schemeOptions.length) {
          ArcoVue.Message.warning('暂无启用中的接入方案，请先在接入方案中新增或启用')
          return
        }
        this.modalMode = 'create'
        this.editor = emptyEditor()
        this.fileList = []
        this.modalVisible = true
      },
      openEdit(record) {
        this.modalMode = 'edit'
        this.editor = {
          id: record.id,
          name: record.name,
          metadataId: record.metadataId,
          schemeId: record.schemeId,
          fileName: record.fileName,
          fileSize: record.fileSize,
          fileUrl: record.fileUrl,
          status: record.status,
        }
        this.fileList = []
        this.modalVisible = true
      },
      closeModal() {
        this.modalVisible = false
        this.saving = false
      },
      beforeUpload(file) {
        const name = file && (file.name || (file.originFile && file.originFile.name))
        if (!/\.(docx?|pdf)$/i.test(name || '')) {
          ArcoVue.Message.warning('请上传 Word 或 PDF 文件')
          return false
        }
        const raw = file.file || file.originFile || file
        this.editor.fileName = name
        this.editor.fileSize = formatSize(raw.size || 0)
        this.editor.fileUrl = './files/yunshu-access-standard-example.docx'
        this.fileList = [{ name, uid: Date.now() }]
        return false
      },
      openPreview(record) {
        this.previewName = record.fileName || record.name
        this.previewVisible = true
      },
      submitEditor() {
        this.$refs.editorForm.validate((err) => {
          if (err) return
          if (mock.standardNameExists(this.editor.name, this.editor.id || '')) {
            ArcoVue.Message.warning('该名称已存在')
            return
          }
          if (!this.editor.fileName) {
            ArcoVue.Message.warning('请上传标准文件')
            return
          }
          const run = () => {
            this.saving = true
            setTimeout(() => {
              const res = mock.saveStandard({ ...this.editor })
              this.saving = false
              if (!res.ok) {
                if (res.reason === 'meta') ArcoVue.Message.warning('请选择启用中的数据标准')
                else if (res.reason === 'scheme') ArcoVue.Message.warning('请选择启用中的接入方案')
                else ArcoVue.Message.error('保存失败')
                return
              }
              ArcoVue.Message.success(this.modalMode === 'create' ? '新增成功' : '保存成功')
              this.modalVisible = false
              this.fetchData(1, this.pagination.pageSize)
            }, 240)
          }
          const othersEnabled = mock.getStandards().some((s) => s.status === 'enabled' && s.id !== this.editor.id)
          if (this.editor.status === 'enabled' && othersEnabled) {
            openConfirm({
              title: '启用接入标准',
              content: '全平台最多启用 1 条标准，启用后将停用当前已启用的标准。确定启用？',
              okText: '启用',
              cancelText: '取消',
              onOk: () => run(),
            })
            return
          }
          run()
        })
      },
      onToggleStatus(record) {
        if (record.status === 'enabled') {
          openConfirm({
            title: '停用接入标准',
            content: '停用后机构端接入规范将不展示该标准；若全部停用，机构端显示空态提示。确定停用？',
            okText: '停用',
            cancelText: '取消',
            okButtonProps: { status: 'danger' },
            onOk: () => {
              mock.setStandardStatus(record.id, 'disabled')
              ArcoVue.Message.success('已停用')
              this.fetchData(this.pagination.current, this.pagination.pageSize)
            },
          })
          return
        }
        const othersEnabled = mock.getStandards().some((s) => s.status === 'enabled' && s.id !== record.id)
        const go = () => {
          const res = mock.setStandardStatus(record.id, 'enabled')
          if (!res || !res.ok) {
            if (res && res.reason === 'meta') ArcoVue.Message.warning('关联的数据标准已停用，无法启用')
            else if (res && res.reason === 'scheme') ArcoVue.Message.warning('关联的接入方案已停用，无法启用')
            else ArcoVue.Message.error('启用失败')
            return
          }
          ArcoVue.Message.success(othersEnabled ? '已启用，原启用标准已停用' : '已启用')
          this.fetchData(this.pagination.current, this.pagination.pageSize)
        }
        if (othersEnabled) {
          openConfirm({
            title: '启用接入标准',
            content: '全平台最多启用 1 条标准，启用后将停用当前已启用的标准。确定启用？',
            okText: '启用',
            cancelText: '取消',
            onOk: () => go(),
          })
          return
        }
        go()
      },
      onDelete(record) {
        openConfirm({
          title: '删除接入标准',
          content: '确定删除该接入标准？',
          okText: '删除',
          cancelText: '取消',
          okButtonProps: { status: 'danger' },
          onOk: () => {
            mock.removeStandard(record.id)
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
                <a-tooltip content="刷新">
                  <a-button class="pro-toolbar-icon-btn" @click="onRefreshTable"><template #icon><icon-refresh /></template></a-button>
                </a-tooltip>
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
                <a-button type="text" :size="opsBtnSize" @click="openPreview(record)">预览</a-button>
                <a-button type="text" :size="opsBtnSize" @click="openEdit(record)">编辑</a-button>
                <a-button type="text" :size="opsBtnSize" @click="onToggleStatus(record)">
                  {{ record.status === 'enabled' ? '停用' : '启用' }}
                </a-button>
                <a-button type="text" status="danger" :size="opsBtnSize" @click="onDelete(record)">删除</a-button>
              </a-space>
            </template>
            <template #empty>
              <a-empty description="暂无接入标准" />
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
        >
          <a-form ref="editorForm" :model="editor" :rules="editorRules" layout="vertical">
            <a-form-item field="name" label="方案名称">
              <a-input v-model="editor.name" placeholder="请输入方案名称" :max-length="50" allow-clear />
            </a-form-item>
            <a-form-item field="metadataId" label="数据标准">
              <a-select v-model="editor.metadataId" :options="metadataOptions" placeholder="请选择启用中的元数据" allow-search />
            </a-form-item>
            <a-form-item field="schemeId" label="接入方案">
              <a-select v-model="editor.schemeId" :options="schemeOptions" placeholder="请选择启用中的接入方案" allow-search />
            </a-form-item>
            <a-form-item label="标准文件">
              <a-space direction="vertical" fill>
                <div v-if="editor.fileName">{{ editor.fileName }}（{{ editor.fileSize || '—' }}）</div>
                <a-upload
                  :file-list="fileList"
                  :auto-upload="false"
                  accept=".doc,.docx,.pdf"
                  :show-file-list="false"
                  @before-upload="beforeUpload"
                >
                  <a-button>上传 Word / PDF</a-button>
                </a-upload>
              </a-space>
            </a-form-item>
            <a-form-item field="status" label="状态">
              <a-select v-model="editor.status" :options="statusOptions" />
              <div style="margin-top: 6px; color: var(--color-text-3); font-size: 12px">全平台最多 1 条为启用；全部停用后机构端展示空态。</div>
            </a-form-item>
          </a-form>
          <template #footer>
            <a-button @click="closeModal">取消</a-button>
            <a-button type="primary" :loading="saving" @click="submitEditor">确定</a-button>
          </template>
        </a-modal>

        <yunshu-standard-preview-drawer
          :visible="previewVisible"
          :file-name="previewName"
          @cancel="previewVisible = false"
        />
      </div>
    `,
  }

  mountProPage({ pageKey: 'standard', title: '接入方案管理', pageComponent: StandardListPage })
})()
