;(function () {
  window.YunshuSchemePreviewDrawer = {
    name: 'YunshuSchemePreviewDrawer',
    props: {
      visible: { type: Boolean, default: false },
      scheme: { type: Object, default: null },
    },
    emits: ['cancel'],
    computed: {
      drawerTitle() {
        return this.scheme && this.scheme.name ? '预览接入方案 · ' + this.scheme.name : '预览接入方案'
      },
      frontText() {
        if (!this.scheme) return '—'
        return this.scheme.frontHost + (this.scheme.frontPort ? ':' + this.scheme.frontPort : '')
      },
    },
    methods: {
      onCancel() {
        this.$emit('cancel')
      },
    },
    template: `
      <a-drawer
        :visible="visible"
        :title="drawerTitle"
        :width="720"
        unmount-on-close
        @cancel="onCancel"
      >
        <div v-if="scheme" class="profile-page" style="margin: 0">
          <p class="profile-desc-text" style="margin-top: 0">
            当前启用接入方案的对接策略如下，含前置机、推送频次与增量/全量规则，便于转交供数方按方案送数。
          </p>
          <div class="profile-section-title">对接策略</div>
          <a-descriptions :column="2" size="large" class="profile-descriptions profile-descriptions--wide">
            <a-descriptions-item label="方案名称">{{ scheme.name }}</a-descriptions-item>
            <a-descriptions-item label="适用供数方">{{ scheme.supplierName || '—' }}</a-descriptions-item>
            <a-descriptions-item label="前置机">{{ frontText }}</a-descriptions-item>
            <a-descriptions-item label="协议">{{ scheme.protocol }}</a-descriptions-item>
            <a-descriptions-item label="推送路径">{{ scheme.path || '—' }}</a-descriptions-item>
            <a-descriptions-item label="推送频次">{{ scheme.frequencyLabel || '—' }}</a-descriptions-item>
            <a-descriptions-item label="更新规则">{{ scheme.updateModeLabel || '—' }}</a-descriptions-item>
            <a-descriptions-item label="增量字段">{{ scheme.incrementField || '—' }}</a-descriptions-item>
            <a-descriptions-item label="失败重试">{{ scheme.retry }}</a-descriptions-item>
            <a-descriptions-item label="状态">{{ scheme.status === 'enabled' ? '启用' : '停用' }}</a-descriptions-item>
            <a-descriptions-item label="备注" :span="2">{{ scheme.remark || '—' }}</a-descriptions-item>
            <a-descriptions-item label="更新时间">{{ scheme.updatedAt || '—' }}</a-descriptions-item>
          </a-descriptions>
          <a-alert type="info" style="margin-top: 16px">
            请按本方案约定的通道与频次推送；报文与文件内容须同时满足关联数据标准中的必填口径。
          </a-alert>
        </div>
        <a-empty v-else description="暂无接入方案可预览" />
        <template #footer>
          <a-button @click="onCancel">关闭</a-button>
        </template>
      </a-drawer>
    `,
  }
})()
