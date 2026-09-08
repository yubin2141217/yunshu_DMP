;(function () {
  const mock = window.YunshuMock

  const AccessSpecPage = {
    name: 'AccessSpecPage',
    components: {
      YunshuStandardPreviewDrawer: window.YunshuStandardPreviewDrawer,
    },
    data() {
      return {
        spec: mock.getEnabledStandard ? mock.getEnabledStandard() : mock.standard,
        downloading: false,
        previewVisible: false,
      }
    },
    computed: {
      hasEnabled() {
        return !!(this.spec && (this.spec.fileName || this.spec.name || this.spec.metadata))
      },
      metadata() {
        return (this.spec && this.spec.metadata) || null
      },
      scheme() {
        return (this.spec && this.spec.scheme) || null
      },
      fileName() {
        return (this.spec && (this.spec.fileName || this.spec.name)) || ''
      },
      fileSize() {
        return (this.spec && (this.spec.fileSize || this.spec.size)) || '—'
      },
      publishedAt() {
        return (this.spec && (this.spec.publishedAt || this.spec.uploadedAt)) || '—'
      },
      categoryText() {
        if (!this.metadata) return '—'
        return (mock.categoryLabels && mock.categoryLabels[this.metadata.category]) || this.metadata.category || '—'
      },
      requiredText() {
        if (!this.metadata) return '—'
        return (mock.requiredLabels && mock.requiredLabels[this.metadata.requiredLevel]) || this.metadata.requiredLevel || '—'
      },
      frontText() {
        if (!this.scheme) return '—'
        return this.scheme.frontHost + (this.scheme.frontPort ? ':' + this.scheme.frontPort : '')
      },
      protocolPath() {
        if (!this.scheme) return '—'
        const path = this.scheme.path || ''
        return path ? this.scheme.protocol + ' ' + path : this.scheme.protocol || '—'
      },
      updateRuleText() {
        if (!this.scheme) return '—'
        const mode = this.scheme.updateModeLabel || '—'
        return this.scheme.incrementField ? mode + '（' + this.scheme.incrementField + '）' : mode
      },
    },
    methods: {
      openPreview() {
        if (!this.hasEnabled) return
        this.previewVisible = true
      },
      onDownload() {
        if (!this.hasEnabled) return
        this.downloading = true
        const link = document.createElement('a')
        link.href = (this.spec && this.spec.fileUrl) || './files/yunshu-access-standard-example.docx'
        link.download = this.fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        this.downloading = false
        ArcoVue.Message.success('已开始下载')
      },
    },
    template: `
      <div class="profile-page workplace-page">
        <div class="workplace-header">
          <div class="workplace-header-text">
            <h2 class="workplace-title">接入规范</h2>
            <p class="workplace-desc">下载当前启用的接入规范，转交供数方按其中的数据标准与接入方案对接。</p>
          </div>
          <div class="v8-summary-stats">
            <span>数据标准<strong>{{ hasEnabled ? (spec.metadataName || '—') : '—' }}</strong></span>
            <span>接入方案<strong>{{ hasEnabled ? (spec.schemeName || '—') : '—' }}</strong></span>
            <span>发布时间<strong>{{ hasEnabled ? publishedAt : '—' }}</strong></span>
          </div>
        </div>

        <a-card class="v8-content-card general-card" :bordered="true">
          <div class="v8-page-search" style="justify-content: flex-end; margin-bottom: 16px">
            <a-button :disabled="!hasEnabled" @click="openPreview">预览</a-button>
            <a-button type="primary" :disabled="!hasEnabled" :loading="downloading" @click="onDownload">下载</a-button>
          </div>
          <template v-if="hasEnabled">
            <a-alert type="info" style="margin-bottom: 16px">
              请下载接入规范后转交供数厂商，按其数据标准与接入方案推送数据。
            </a-alert>
            <a-descriptions :column="2" size="large" class="profile-descriptions profile-descriptions--wide">
              <a-descriptions-item label="规范名称">{{ spec.name }}</a-descriptions-item>
              <a-descriptions-item label="文件名">{{ fileName }}</a-descriptions-item>
              <a-descriptions-item label="数据标准">{{ metadata ? metadata.name : (spec.metadataName || '—') }}</a-descriptions-item>
              <a-descriptions-item label="标准编码">{{ metadata ? metadata.code : '—' }}</a-descriptions-item>
              <a-descriptions-item label="数据分类">{{ categoryText }}</a-descriptions-item>
              <a-descriptions-item label="是否必接">{{ requiredText }}</a-descriptions-item>
              <a-descriptions-item label="业务口径" :span="2">{{ metadata ? (metadata.bizCaliber || '—') : '—' }}</a-descriptions-item>
              <a-descriptions-item label="接入方案">{{ scheme ? scheme.name : (spec.schemeName || '—') }}</a-descriptions-item>
              <a-descriptions-item label="适用供数方">{{ scheme ? (scheme.supplierName || '—') : '—' }}</a-descriptions-item>
              <a-descriptions-item label="前置机">{{ frontText }}</a-descriptions-item>
              <a-descriptions-item label="协议 / 路径">{{ protocolPath }}</a-descriptions-item>
              <a-descriptions-item label="推送频次">{{ scheme ? (scheme.frequencyLabel || '—') : '—' }}</a-descriptions-item>
              <a-descriptions-item label="更新规则">{{ updateRuleText }}</a-descriptions-item>
              <a-descriptions-item label="类型">{{ spec.type || 'Word' }}</a-descriptions-item>
              <a-descriptions-item label="大小">{{ fileSize }}</a-descriptions-item>
              <a-descriptions-item label="发布时间">{{ publishedAt }}</a-descriptions-item>
            </a-descriptions>
          </template>
          <a-empty v-else description="暂无启用的标准，请联系运营管理人员！" />
        </a-card>

        <yunshu-standard-preview-drawer
          :visible="previewVisible"
          :file-name="hasEnabled ? fileName : ''"
          :metadata="metadata"
          :scheme="scheme"
          @cancel="previewVisible = false"
        />
      </div>
    `,
  }

  mountProPage({ pageKey: 'spec', title: '接入规范', pageComponent: AccessSpecPage })
})()
