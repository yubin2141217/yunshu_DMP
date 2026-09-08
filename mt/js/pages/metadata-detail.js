;(function () {
  const mock = window.YunshuMock
  const id = new URLSearchParams(window.location.search).get('id') || ''

  const MetadataDetailPage = {
    name: 'MetadataDetailPage',
    data() {
      return {
        record: mock.findMetadata(id),
      }
    },
    computed: {
      hasRecord() {
        return !!this.record
      },
    },
    methods: {
      categoryLabel(v) {
        return mock.categoryLabels[v] || v || '—'
      },
      requiredLabel(v) {
        return mock.requiredLabels[v] || v || '—'
      },
      back() {
        window.location.href = 'metadata-list.html'
      },
    },
    template: `
      <div class="profile-page">
        <a-card class="pro-page-card profile-header-card" :bordered="false">
          <div class="profile-header">
            <div class="profile-header-top">
              <div class="profile-header-main">
                <a-typography-title :heading="5" class="profile-header-title">数据标准详情</a-typography-title>
              </div>
              <a-space class="profile-toolbar">
                <a-button @click="back">返回列表</a-button>
              </a-space>
            </div>
          </div>
        </a-card>
        <template v-if="hasRecord">
          <a-card class="pro-page-card" title="业务属性" :bordered="false">
            <a-descriptions :column="2" size="large" class="profile-descriptions profile-descriptions--wide">
              <a-descriptions-item label="中文名称">{{ record.name }}</a-descriptions-item>
              <a-descriptions-item label="编码">{{ record.code }}</a-descriptions-item>
              <a-descriptions-item label="数据分类">{{ categoryLabel(record.category) }}</a-descriptions-item>
              <a-descriptions-item label="主题">{{ record.topic || '—' }}</a-descriptions-item>
              <a-descriptions-item label="是否必接">{{ requiredLabel(record.requiredLevel) }}</a-descriptions-item>
              <a-descriptions-item label="提供方">{{ record.provider || '—' }}</a-descriptions-item>
              <a-descriptions-item label="业务口径" :span="2">{{ record.bizCaliber || '—' }}</a-descriptions-item>
            </a-descriptions>
          </a-card>
          <a-card class="pro-page-card" title="技术属性" :bordered="false">
            <a-descriptions :column="2" size="large" class="profile-descriptions profile-descriptions--wide">
              <a-descriptions-item label="字符集">{{ record.charset || '—' }}</a-descriptions-item>
              <a-descriptions-item label="主键">{{ record.primaryKey || '—' }}</a-descriptions-item>
              <a-descriptions-item label="数据类型">{{ record.dataType || '—' }}</a-descriptions-item>
              <a-descriptions-item label="更新周期">{{ record.updateCycle || '—' }}</a-descriptions-item>
              <a-descriptions-item label="大小上限" :span="2">{{ record.maxSize || '—' }}</a-descriptions-item>
            </a-descriptions>
          </a-card>
          <a-card class="pro-page-card" title="运维操作属性" :bordered="false">
            <a-descriptions :column="2" size="large" class="profile-descriptions profile-descriptions--wide">
              <a-descriptions-item label="负责人">{{ record.owner || '—' }}</a-descriptions-item>
              <a-descriptions-item label="状态">{{ record.status === 'enabled' ? '启用' : '停用' }}</a-descriptions-item>
              <a-descriptions-item label="监控方式" :span="2">{{ record.monitor || '—' }}</a-descriptions-item>
              <a-descriptions-item label="时效/SLA" :span="2">{{ record.sla || '—' }}</a-descriptions-item>
              <a-descriptions-item label="备注" :span="2">{{ record.remark || '—' }}</a-descriptions-item>
              <a-descriptions-item label="更新时间">{{ record.updatedAt || '—' }}</a-descriptions-item>
            </a-descriptions>
          </a-card>
        </template>
        <a-card v-else class="pro-page-card" :bordered="false">
          <a-empty description="未找到该元数据">
            <a-button type="primary" style="margin-top: 12px" @click="back">返回列表</a-button>
          </a-empty>
        </a-card>
      </div>
    `,
  }

  mountProPage({ pageKey: 'metadata', title: '数据标准详情', pageComponent: MetadataDetailPage })
})()
