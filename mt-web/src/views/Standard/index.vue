<template>
  <div class="page-shell">
    <div class="page-head">
      <div>
        <h2 class="page-title">接入方案管理</h2>
        <p class="page-desc">
          配置方案名称、字段库与接口接入方式；提交后生成接口文档，供机构端预览/下载。可选用内置字段模板快速勾选。
        </p>
      </div>
      <a-button type="primary" @click="$router.push('/standard/edit')">新增方案</a-button>
    </div>
    <a-card class="content-card" :bordered="false">
      <div class="page-search">
        <a-input v-model="form.name" placeholder="方案名称" allow-clear style="width: 200px" />
        <a-select v-model="form.status" :options="statusOptions" allow-clear placeholder="状态" style="width: 140px" />
        <a-button type="primary" @click="fetchData(1)">查询</a-button>
      </div>
      <a-table :columns="columns" :data="data" :loading="loading" row-key="id" :pagination="false" :bordered="false" stripe>
        <template #scope="{ record }">
          {{ record.scope === 'org' ? '机构' : '全局' }}
        </template>
        <template #whitelist="{ record }">
          <a-tag :color="record.requireIpWhitelist ? 'arcoblue' : 'gray'" size="small">
            {{ record.requireIpWhitelist ? '是' : '否' }}
          </a-tag>
        </template>
        <template #status="{ record }">
          <a-tag :color="record.status === 'enabled' ? 'green' : 'orangered'" size="small">
            {{ record.status === 'enabled' ? '开启' : '停用' }}
          </a-tag>
        </template>
        <template #operations="{ record }">
          <a-space class="arco-table-ops" :size="2">
            <a-button type="text" size="small" @click="$router.push('/standard/' + record.id)">详情</a-button>
            <a-button type="text" size="small" @click="openPreview(record)">预览文档</a-button>
            <a-button type="text" size="small" @click="$router.push('/standard/edit/' + record.id)">编辑</a-button>
            <a-button type="text" size="small" @click="onToggle(record)">{{ record.status === 'enabled' ? '停用' : '开启' }}</a-button>
            <a-button type="text" status="danger" size="small" @click="onDelete(record)">删除</a-button>
          </a-space>
        </template>
      </a-table>
      <div class="table-footer">
        <a-pagination
          v-model:current="pagination.current"
          :total="pagination.total"
          :page-size="pagination.pageSize"
          show-total
          show-page-size
          show-jumper
          @change="fetchData"
          @page-size-change="onPageSize"
        />
      </div>
    </a-card>

    <a-modal
      v-model:visible="previewVisible"
      :title="previewTitle"
      :width="900"
      :footer="false"
      unmount-on-close
      modal-class="api-doc-modal"
    >
      <div class="doc-stage">
        <article class="doc-sheet">
          <pre class="doc-md">{{ previewMarkdown }}</pre>
        </article>
      </div>
      <div class="doc-actions">
        <a-space>
          <a-button :loading="downloading" @click="downloadDoc">下载 PDF</a-button>
          <a-button type="primary" @click="previewVisible = false">关闭</a-button>
        </a-space>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import { deleteStandard, getStandard, listStandards, toggleStandard } from '@/api/mt'
import { resolveStandardApiDoc, resolveStandardApiDocHtml, type Standard, type Status } from '@/mock/mt'
import { downloadApiDocPdf } from '@/utils/downloadApiDocPdf'

const route = useRoute()
const router = useRouter()
const statusOptions = [
  { label: '开启', value: 'enabled' },
  { label: '停用', value: 'disabled' },
]
const form = reactive({ name: '', status: '' })
const data = ref<Standard[]>([])
const loading = ref(false)
const pagination = reactive({ current: 1, pageSize: 10, total: 0 })
const previewVisible = ref(false)
const previewRecord = ref<Standard | null>(null)
const downloading = ref(false)

const columns = [
  { title: '方案名称', dataIndex: 'name', width: 160, ellipsis: true, tooltip: true },
  { title: '范围', dataIndex: 'scope', slotName: 'scope', width: 72 },
  { title: '机构', dataIndex: 'orgName', width: 110, ellipsis: true, tooltip: true },
  { title: '字段摘要', dataIndex: 'fieldNames', ellipsis: true, tooltip: true },
  { title: '接入方式', dataIndex: 'schemeName', width: 96 },
  { title: '白名单', dataIndex: 'whitelist', slotName: 'whitelist', width: 80 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 72 },
  { title: '发布时间', dataIndex: 'uploadedAt', width: 160 },
  { title: '操作', dataIndex: 'operations', slotName: 'operations', width: 292 },
]

const previewTitle = computed(() =>
  previewRecord.value ? `接口文档 · ${previewRecord.value.name}` : '接口文档预览',
)
const previewMarkdown = computed(() =>
  previewRecord.value ? resolveStandardApiDoc(previewRecord.value) : '暂无文档',
)

async function fetchData(page = pagination.current) {
  loading.value = true
  try {
    const res = await listStandards({ ...form, page, pageSize: pagination.pageSize })
    data.value = res.list
    pagination.current = page
    pagination.total = res.total
  } finally {
    loading.value = false
  }
}

function onPageSize(size: number) {
  pagination.pageSize = size
  fetchData(1)
}

function openPreview(record: Standard) {
  previewRecord.value = record
  previewVisible.value = true
}

async function downloadDoc() {
  if (!previewRecord.value) return
  downloading.value = true
  try {
    const html = resolveStandardApiDocHtml(previewRecord.value)
    const fileName = (previewRecord.value.fileName || `${previewRecord.value.name}-接口文档`).replace(/\.md$/i, '.pdf')
    await downloadApiDocPdf(html, fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`)
    Message.success('已开始下载 PDF')
  } catch (e) {
    Message.error((e as Error).message || 'PDF 下载失败')
  } finally {
    downloading.value = false
  }
}

function onToggle(record: Standard) {
  const next: Status = record.status === 'enabled' ? 'disabled' : 'enabled'
  const scopeTip =
    record.scope === 'org'
      ? '启用后将停用该机构下其他启用方案'
      : '启用后将停用其他启用中的全局方案'
  Modal.confirm({
    title: next === 'enabled' ? '开启方案' : '停用方案',
    content: next === 'enabled' ? `${scopeTip}，确定？` : `确定停用「${record.name}」？`,
    async onOk() {
      try {
        await toggleStandard(record.id, next)
        Message.success('已更新')
        fetchData(pagination.current)
      } catch (e) {
        Message.error((e as Error).message)
      }
    },
  })
}

function onDelete(record: Standard) {
  Modal.confirm({
    title: '删除接入方案',
    content: `确定删除「${record.name}」？`,
    async onOk() {
      await deleteStandard(record.id)
      Message.success('已删除')
      fetchData(1)
    },
  })
}

onMounted(async () => {
  await fetchData(1)
  const previewId = String(route.query.preview || '')
  if (previewId) {
    const item = await getStandard(previewId)
    if (item) openPreview(item)
    router.replace({ path: '/standard' })
  }
})
</script>

<style scoped>
.doc-stage {
  max-height: min(64vh, 680px);
  overflow: auto;
  padding: 16px 20px;
  background: #f2f3f5;
}
.doc-sheet {
  max-width: 820px;
  margin: 0 auto;
  padding: 28px 32px;
  background: #fff;
  border: 1px solid #e5e6eb;
  box-shadow: 0 8px 24px rgba(29, 33, 41, 0.06);
}
.doc-md {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 13px;
  line-height: 1.65;
  color: #1d2129;
}
.doc-actions {
  display: flex;
  justify-content: flex-end;
  padding: 12px 16px;
  border-top: 1px solid #e5e6eb;
  background: #fff;
}
</style>

<style>
.api-doc-modal .arco-modal-body {
  padding: 0 !important;
}
</style>
