;(function () {
  const t = ArcoProLocale.listImport

  function buildValidateRows() {
    return [
      { row: 2, field: t.colId, value: 'WO2026080001', level: 'ok', message: t.msgOk },
      { row: 3, field: t.colTitle, value: '', level: 'error', message: t.msgEmptyTitle },
      { row: 4, field: t.colAssignee, value: '未知人员', level: 'warn', message: t.msgUnknownAssignee },
      { row: 5, field: t.colPriority, value: '特急', level: 'error', message: t.msgInvalidPriority },
      { row: 6, field: t.colCustomer, value: '星河科技', level: 'ok', message: t.msgOk },
      { row: 7, field: t.colStatus, value: '处理中', level: 'ok', message: t.msgOk },
      { row: 8, field: t.colTitle, value: '物流延迟投诉', level: 'ok', message: t.msgOk },
      { row: 9, field: t.colId, value: 'WO2026080001', level: 'error', message: t.msgDuplicateId },
      { row: 10, field: t.colCustomer, value: '', level: 'warn', message: t.msgEmptyCustomer },
      { row: 11, field: t.colAssignee, value: '', level: 'warn', message: t.msgEmptyAssignee },
      { row: 12, field: t.colStatus, value: '挂起中', level: 'error', message: t.msgInvalidStatus },
      {
        row: 13,
        field: t.colTitle,
        value: '关于跨境物流清关延误导致客户投诉的紧急跟进事项说明',
        level: 'warn',
        message: t.msgTitleTooLong,
      },
      {
        row: 14,
        field: t.colCustomer,
        value: '新桥供应链（未建档）',
        level: 'warn',
        message: t.msgCustomerNotFound,
      },
      { row: 15, field: t.colId, value: '', level: 'error', message: t.msgEmptyId },
      { row: 16, field: t.colPriority, value: '', level: 'warn', message: t.msgLowPriority },
      {
        row: 17,
        field: t.colAssignee,
        value: '外包-李明辉',
        level: 'warn',
        message: t.msgUnknownAssignee,
      },
      {
        row: 18,
        field: t.colTitle,
        value: '发票抬头与合同主体不一致',
        level: 'ok',
        message: t.msgOk,
      },
    ]
  }

  const initialStep = (() => {
    try {
      const q = new URLSearchParams(window.location.search)
      const hash = (window.location.hash || '').replace(/^#/, '')
      const hashParams = new URLSearchParams(hash.includes('=') ? hash : '')
      const step = (
        q.get('step') ||
        q.get('preview') ||
        hashParams.get('step') ||
        hashParams.get('preview') ||
        (hash === '2' || hash === 'validate' || hash === '3' || hash === 'result' || hash === 'success'
          ? hash
          : '')
      ).toLowerCase()
      if (step === '2' || step === 'validate') return 2
      if (step === '3' || step === 'result' || step === 'success') return 3
    } catch (e) {
      /* ignore */
    }
    return 1
  })()

  const ListImportPage = {
    name: 'ListImportPage',
    data() {
      const rows = initialStep >= 2 ? buildValidateRows() : []
      return {
        t,
        step: initialStep,
        fileList:
          initialStep >= 2
            ? [{ uid: '-1', name: 'import-demo.xlsx', status: 'done' }]
            : [],
        validating: false,
        importing: false,
        validateRows: rows,
        onlyIssues: true,
      }
    },
    computed: {
      hasFile() {
        return this.fileList.length > 0
      },
      summary() {
        const rows = this.validateRows
        return {
          total: rows.length,
          ok: rows.filter((r) => r.level === 'ok').length,
          warn: rows.filter((r) => r.level === 'warn').length,
          error: rows.filter((r) => r.level === 'error').length,
        }
      },
      displayRows() {
        if (!this.onlyIssues) return this.validateRows
        return this.validateRows.filter((r) => r.level !== 'ok')
      },
      canImport() {
        return this.validateRows.length > 0
      },
      columns() {
        return [
          { title: t.colRow, dataIndex: 'row', width: 64 },
          { title: t.colField, dataIndex: 'field', width: 96 },
          { title: t.colValue, dataIndex: 'value', ellipsis: true, tooltip: true, slotName: 'value' },
          { title: t.colLevel, dataIndex: 'level', width: 80, slotName: 'level' },
          { title: t.colMessage, dataIndex: 'message', ellipsis: true, tooltip: true },
        ]
      },
      resultDesc() {
        return t.resultDesc
          .replace('{ok}', this.summary.ok)
          .replace('{warn}', this.summary.warn)
          .replace('{error}', this.summary.error)
      },
    },
    methods: {
      levelMeta(level) {
        if (level === 'error') return { color: 'red', text: t.levelError }
        if (level === 'warn') return { color: 'orangered', text: t.levelWarn }
        return { color: 'green', text: t.levelOk }
      },
      beforeUpload(file) {
        const raw = file && (file.file || file)
        const name = (raw && raw.name) || (file && file.name) || ''
        if (!/\.(xlsx|xls|csv)$/i.test(name)) {
          ArcoVue.Message.warning(t.formatInvalid)
          return false
        }
        return true
      },
      onFileChange(fileList) {
        const list = Array.isArray(fileList) ? fileList : fileList && fileList.fileList
        this.fileList = (list || []).slice(-1)
      },
      onDownloadTemplate() {
        ArcoVue.Message.success(t.templateOk)
      },
      goValidate() {
        if (!this.hasFile) {
          ArcoVue.Message.warning(t.fileRequired)
          return
        }
        this.validating = true
        setTimeout(() => {
          this.validateRows = buildValidateRows()
          this.validating = false
          this.step = 2
          ArcoVue.Message.success(t.validateOk)
        }, 600)
      },
      goImport() {
        if (!this.canImport) {
          ArcoVue.Message.warning(t.fileRequired)
          return
        }
        this.importing = true
        setTimeout(() => {
          this.importing = false
          this.step = 3
        }, 700)
      },
      backToUpload() {
        this.step = 1
      },
      backToValidate() {
        this.step = 2
      },
      resetAll() {
        this.step = 1
        this.fileList = []
        this.validateRows = []
        this.onlyIssues = true
      },
      goList() {
        window.location.href = 'list-search-table.html'
      },
    },
    template: `
      <div class="list-import-page">
        <a-card class="general-card pro-page-card" :bordered="false">
          <a-steps
            v-if="step < 3"
            class="list-import-steps"
            :current="step"
            small
            label-placement="vertical"
          >
            <a-step :title="t.stepUpload" />
            <a-step :title="t.stepValidate" />
            <a-step :title="t.stepResult" />
          </a-steps>

          <div class="list-import-panel">
            <div v-if="step === 1" class="list-import-upload">
              <div class="pro-io-tip">
                <icon-info-circle class="pro-io-tip-icon" :size="14" />
                <span class="pro-io-tip-text">{{ t.uploadTip }}</span>
              </div>
              <a-upload
                class="pro-io-upload"
                draggable
                accept=".xlsx,.xls,.csv"
                :file-list="fileList"
                :auto-upload="false"
                :limit="1"
                :before-upload="beforeUpload"
                @change="onFileChange"
              >
                <template #upload-button>
                  <div class="pro-upload-drag">
                    <div class="pro-upload-drag-icon"><icon-upload /></div>
                    <div class="pro-upload-drag-text">{{ t.importDrag }}</div>
                    <div class="pro-upload-drag-hint">{{ t.importDragHint }}</div>
                  </div>
                </template>
              </a-upload>
              <div class="list-import-upload-actions">
                <a-link class="pro-io-template" @click="onDownloadTemplate">
                  <icon-download /> {{ t.downloadTemplate }}
                </a-link>
              </div>
            </div>

            <div v-else-if="step === 2" class="list-import-validate">
              <div class="list-import-summary">
                <div class="list-import-summary-item">
                  <span class="list-import-summary-label">{{ t.summaryTotal }}</span>
                  <span class="list-import-summary-value">{{ summary.total }}</span>
                </div>
                <div class="list-import-summary-item is-ok">
                  <span class="list-import-summary-label">{{ t.summaryOk }}</span>
                  <span class="list-import-summary-value">{{ summary.ok }}</span>
                </div>
                <div class="list-import-summary-item is-warn">
                  <span class="list-import-summary-label">{{ t.summaryWarn }}</span>
                  <span class="list-import-summary-value">{{ summary.warn }}</span>
                </div>
                <div class="list-import-summary-item is-err">
                  <span class="list-import-summary-label">{{ t.summaryError }}</span>
                  <span class="list-import-summary-value">{{ summary.error }}</span>
                </div>
              </div>

              <div class="list-import-toolbar">
                <a-checkbox v-model="onlyIssues">{{ t.onlyIssues }}</a-checkbox>
                <span class="list-import-toolbar-meta">
                  {{ t.issueCount.replace('{n}', displayRows.length) }}
                </span>
              </div>

              <div class="list-import-table-wrap">
                <a-table
                  row-key="row"
                  class="list-import-table"
                  :columns="columns"
                  :data="displayRows"
                  :pagination="false"
                >
                  <template #value="{ record }">
                    <span :class="{ 'is-empty': !record.value }">
                      {{ record.value || t.emptyValue }}
                    </span>
                  </template>
                  <template #level="{ record }">
                    <a-tag size="small" :color="levelMeta(record.level).color">
                      {{ levelMeta(record.level).text }}
                    </a-tag>
                  </template>
                </a-table>
              </div>
            </div>

            <div v-else class="list-import-result form-step-success">
              <a-result :title="t.resultTitle" :subtitle="resultDesc">
                <template #icon>
                  <div class="form-step-success-icon" aria-hidden="true">
                    <svg class="form-step-success-check" viewBox="0 0 24 24" width="28" height="28" fill="none">
                      <path
                        d="M5 12.5l5 5L19 7"
                        stroke="currentColor"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </div>
                </template>
                <template #extra>
                  <a-space :size="12">
                    <a-button type="primary" @click="goList">{{ t.goList }}</a-button>
                    <a-button @click="resetAll">{{ t.importAgain }}</a-button>
                    <a-button type="outline" @click="backToValidate">{{ t.viewValidate }}</a-button>
                  </a-space>
                </template>
              </a-result>
            </div>
          </div>

          <div
            v-if="step < 3"
            class="list-import-footer"
            :class="{ 'is-upload': step === 1, 'is-validate': step === 2 }"
          >
            <template v-if="step === 1">
              <a-button type="primary" :loading="validating" @click="goValidate">
                {{ t.nextValidate }}
              </a-button>
            </template>
            <template v-else>
              <a-button @click="backToUpload">{{ t.prev }}</a-button>
              <a-button type="primary" :loading="importing" @click="goImport">
                {{ t.nextImport }}
              </a-button>
            </template>
          </div>
        </a-card>
      </div>
    `,
  }

  mountProPage({
    pageKey: 'list/import',
    title: t.title,
    pageComponent: ListImportPage,
  })
})()
