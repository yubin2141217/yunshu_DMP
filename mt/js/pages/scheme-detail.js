;(function () {
  const mock = window.YunshuMock
  const id = new URLSearchParams(window.location.search).get('id') || ''

  const SchemeDetailPage = {
    name: 'SchemeDetailPage',
    data() {
      return {
        record: mock.findScheme(id),
      }
    },
    computed: {
      hasRecord() {
        return !!this.record
      },
      frontText() {
        if (!this.record) return '—'
        return this.record.frontHost + (this.record.frontPort ? ':' + this.record.frontPort : '')
      },
    },
    methods: {
      back() {
        window.location.href = 'scheme-list.html'
      },
    },
    template: `
      <div class="profile-page">
        <a-card class="pro-page-card profile-header-card" :bordered="false">
          <div class="profile-header">
            <div class="profile-header-top">
              <div class="profile-header-main">
                <a-typography-title :heading="5" class="profile-header-title">接入方案详情</a-typography-title>
              </div>
              <a-space class="profile-toolbar">
                <a-button @click="back">返回列表</a-button>
              </a-space>
            </div>
          </div>
        </a-card>
        <a-card v-if="hasRecord" class="pro-page-card" title="对接策略" :bordered="false">
          <a-descriptions :column="2" size="large" class="profile-descriptions profile-descriptions--wide">
            <a-descriptions-item label="方案名称">{{ record.name }}</a-descriptions-item>
            <a-descriptions-item label="适用供数方">{{ record.supplierName || '—' }}</a-descriptions-item>
            <a-descriptions-item label="前置机">{{ frontText }}</a-descriptions-item>
            <a-descriptions-item label="协议">{{ record.protocol }}</a-descriptions-item>
            <a-descriptions-item label="推送路径">{{ record.path || '—' }}</a-descriptions-item>
            <a-descriptions-item label="推送频次">{{ record.frequencyLabel }}</a-descriptions-item>
            <a-descriptions-item label="更新规则">{{ record.updateModeLabel }}</a-descriptions-item>
            <a-descriptions-item label="增量字段">{{ record.incrementField || '—' }}</a-descriptions-item>
            <a-descriptions-item label="失败重试">{{ record.retry }}</a-descriptions-item>
            <a-descriptions-item label="状态">{{ record.status === 'enabled' ? '启用' : '停用' }}</a-descriptions-item>
            <a-descriptions-item label="备注" :span="2">{{ record.remark || '—' }}</a-descriptions-item>
            <a-descriptions-item label="更新时间">{{ record.updatedAt || '—' }}</a-descriptions-item>
          </a-descriptions>
        </a-card>
        <a-card v-else class="pro-page-card" :bordered="false">
          <a-empty description="未找到该接入方案">
            <a-button type="primary" style="margin-top: 12px" @click="back">返回列表</a-button>
          </a-empty>
        </a-card>
      </div>
    `,
  }

  mountProPage({ pageKey: 'scheme', title: '接入方案详情', pageComponent: SchemeDetailPage })
})()
