<template>
  <div class="workplace-page">
    <div class="workplace-header">
      <div>
        <h2 class="workplace-title">接入规范</h2>
        <p class="workplace-desc">
          查看运营侧为本机构配置的接入方案（可多份）。可预览接口文档并下载，转交供数方按方案送数。
        </p>
      </div>
      <div v-if="specs.length" class="v8-summary-stats">
        <span>方案数<strong>{{ specs.length }}</strong></span>
      </div>
    </div>

    <a-card class="content-card" :bordered="false">
      <template v-if="specs.length">
        <a-table :columns="columns" :data="specs" :pagination="false" :bordered="false" stripe row-key="id">
          <template #scope="{ record }">{{ record.scopeLabel || (record.scope === 'org' ? '机构' : '全局') }}</template>
          <template #mode="{ record }">{{ record.schemeName || (record.apiAccess ? '接口推送' : '—') }}</template>
          <template #fieldCount="{ record }">{{ record.fields?.length || 0 }}</template>
          <template #ops="{ record }">
            <a-space>
              <a-button type="text" size="small" @click="openPreview(record)">预览</a-button>
              <a-button type="text" size="small" :loading="downloadingId === record.id" @click="onDownload(record)">下载 PDF</a-button>
            </a-space>
          </template>
        </a-table>
      </template>
      <a-empty v-else description="暂无接入方案，请联系平台运营在机构供数配置中绑定" />
    </a-card>

    <SpecPreviewModal
      :visible="previewVisible"
      :standard-name="active?.name"
      :file-name="active?.fileName"
      :fields="active?.fields || []"
      :scheme="active?.scheme"
      :api-access="active?.apiAccess"
      :api-doc-markdown="active?.apiDocMarkdown"
      :scope-label="active?.scopeLabel"
      :published-at="active?.publishedAt"
      :require-ip-whitelist="active?.requireIpWhitelist"
      :remark="active?.remark"
      @cancel="previewVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { getEnabledStandards } from '@/api/v8'
import type { Standard } from '@/mock/v8'
import SpecPreviewModal from './SpecPreviewModal.vue'
import { downloadApiDocPdf, wrapMarkdownAsApiDocHtml } from '@/utils/downloadApiDocPdf'

const specs = ref<Standard[]>([])
const previewVisible = ref(false)
const active = ref<Standard | null>(null)
const downloadingId = ref('')

const columns = [
  { title: '方案名称', dataIndex: 'name', width: 180, ellipsis: true, tooltip: true },
  { title: '生效范围', dataIndex: 'scope', slotName: 'scope', width: 96 },
  { title: '接入方式', dataIndex: 'mode', slotName: 'mode', width: 96 },
  { title: '字段数', dataIndex: 'fieldCount', slotName: 'fieldCount', width: 80 },
  { title: '发布时间', dataIndex: 'publishedAt', width: 160 },
  { title: '操作', dataIndex: 'ops', slotName: 'ops', width: 148 },
]

function openPreview(record: Standard) {
  active.value = record
  previewVisible.value = true
}

async function onDownload(record: Standard) {
  downloadingId.value = record.id
  try {
    const md =
      record.apiDocMarkdown ||
      `方案：${record.name}\n生效范围：${record.scopeLabel || (record.scope === 'org' ? '机构' : '全局')}\n字段数：${record.fields?.length || 0}\n`
    const html = wrapMarkdownAsApiDocHtml(`${record.name} · 接口接入文档`, md, record.scope === 'org')
    const fileName = (record.fileName || `${record.name}-接口文档`).replace(/\.md$/i, '.pdf')
    await downloadApiDocPdf(html, fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`)
    Message.success('已开始下载 PDF')
  } catch (e) {
    Message.error((e as Error).message || 'PDF 下载失败')
  } finally {
    downloadingId.value = ''
  }
}

onMounted(async () => {
  specs.value = await getEnabledStandards()
})
</script>
