<template>
  <div class="page-shell">
    <div class="page-head">
      <div>
        <h2 class="page-title">机构供数配置</h2>
        <p class="page-desc">
          维护机构编码（供数方送数时 org_id 填此值），并配置可接收的供数方与接入方案（可多选）；未配置的供数方入库不计入该机构统计。
        </p>
      </div>
      <a-button type="primary" @click="openCreate">新增</a-button>
    </div>
    <a-card class="content-card" :bordered="false">
      <div class="page-search">
        <a-input v-model="name" placeholder="机构名称 / 机构编码" allow-clear style="width: 220px" />
        <a-button type="primary" @click="fetchData(1)">查询</a-button>
        <a-button @click="name = ''; fetchData(1)">重置</a-button>
      </div>
      <a-table :columns="columns" :data="data" :loading="loading" row-key="id" :pagination="false" :bordered="false" stripe>
        <template #code="{ record }">
          <a-space>
            <span class="mono">{{ record.code }}</span>
            <a-button type="text" size="mini" @click="copyCode(record.code)">复制</a-button>
          </a-space>
        </template>
        <template #status="{ record }">
          <a-tag :color="record.status === 'enabled' ? 'green' : 'orangered'" size="small">
            {{ record.status === 'enabled' ? '启用' : '停用' }}
          </a-tag>
        </template>
        <template #standard="{ record }">{{ record.standardName || '未配置' }}</template>
        <template #suppliers="{ record }">{{ (record.supplierNames || []).join('、') || '未配置' }}</template>
        <template #operations="{ record }">
          <a-space class="arco-table-ops" :size="2">
            <a-button type="text" size="small" @click="openEdit(record)">编辑</a-button>
            <a-button type="text" size="small" @click="onToggle(record)">
              {{ record.status === 'enabled' ? '停用' : '启用' }}
            </a-button>
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
      <a-modal
        v-model:visible="visible"
        :title="mode === 'create' ? '新增机构供数配置' : '编辑机构供数配置'"
        :width="560"
        unmount-on-close
        :on-before-ok="onSubmit"
      >
        <a-form ref="formRef" :model="editor" :rules="rules" layout="vertical">
          <a-form-item field="name" label="机构名称" required>
            <a-input
              v-if="mode === 'create'"
              v-model="editor.name"
              placeholder="请输入机构名称"
              :max-length="50"
              allow-clear
            />
            <a-input v-else :model-value="editor.name" disabled />
          </a-form-item>
          <a-form-item field="code" required>
            <template #label>
              <FormFieldLabel
                title="机构编码"
                desc="唯一编码；请安全下发给厂商，送数时 org_id 字段须填此值"
              />
            </template>
            <a-input v-model="editor.code" :max-length="64" placeholder="如 ORG_WXB_001" allow-clear />
          </a-form-item>
          <a-form-item field="standardIds" required>
            <template #label>
              <FormFieldLabel title="接入方案" desc="可多选已启用方案；机构端将展示并允许预览/下载这些方案" />
            </template>
            <a-select
              v-model="editor.standardIds"
              :options="standardOptions"
              multiple
              allow-clear
              placeholder="请选择接入方案（可多选）"
            />
          </a-form-item>
          <a-form-item>
            <template #label>
              <FormFieldLabel title="可接收供数方" desc="勾选后，该供数方入库数据可计入本机构统计" />
            </template>
            <a-checkbox-group
              v-if="supplierOptions.length"
              v-model="editor.supplierIds"
              :options="supplierOptions"
              direction="vertical"
            />
            <a-empty v-else description="暂无启用中的供数方，请先在供数方管理中新增或启用" />
          </a-form-item>
        </a-form>
      </a-modal>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { Message, Modal, type FormInstance } from '@arco-design/web-vue'
import FormFieldLabel from '@/components/FormFieldLabel.vue'
import { createOrg, listOrgs, saveOrg, toggleOrg } from '@/api/mt'
import type { Org, Status, Supplier } from '@/mock/mt'
import { clearFormValidate, validateForm } from '@/utils/formValidate'

const name = ref('')
const data = ref<Org[]>([])
const loading = ref(false)
const pagination = reactive({ current: 1, pageSize: 10, total: 0 })
const visible = ref(false)
const mode = ref<'create' | 'edit'>('edit')
const formRef = ref<FormInstance>()
const supplierOptions = ref<{ label: string; value: string }[]>([])
const standardOptions = ref<{ label: string; value: string }[]>([])
const editor = reactive({
  id: '',
  name: '',
  code: '',
  standardIds: [] as string[],
  supplierIds: [] as string[],
})
const rules = computed(() => ({
  name:
    mode.value === 'create'
      ? [{ required: true, message: '请填写机构名称' }]
      : [],
  code: [{ required: true, message: '请填写机构编码' }],
  standardIds: [{ required: true, message: '请至少选择一个接入方案' }],
}))
const columns = [
  { title: '机构', dataIndex: 'name', width: 120, ellipsis: true, tooltip: true },
  { title: '机构编码', dataIndex: 'code', slotName: 'code', width: 160 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 72 },
  { title: '接入方案', dataIndex: 'standard', slotName: 'standard', ellipsis: true, tooltip: true },
  { title: '已配置供数方', dataIndex: 'suppliers', slotName: 'suppliers', ellipsis: true, tooltip: true },
  { title: '操作', dataIndex: 'operations', slotName: 'operations', width: 120 },
]

async function copyCode(code: string) {
  try {
    await navigator.clipboard.writeText(code)
    Message.success('已复制机构编码，可下发给厂商填入 org_id')
  } catch {
    Message.error('复制失败，请手动选择复制')
  }
}

async function fetchData(page = pagination.current) {
  loading.value = true
  try {
    const res = await listOrgs({ name: name.value, page, pageSize: pagination.pageSize })
    data.value = res.list
    supplierOptions.value = res.enabledSuppliers.map((s: Supplier) => ({
      label: `${s.name}（${s.code}）`,
      value: s.id,
    }))
    standardOptions.value = res.enabledStandards || []
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

function openCreate() {
  mode.value = 'create'
  Object.assign(editor, { id: '', name: '', code: '', standardIds: [], supplierIds: [] })
  visible.value = true
  nextTick(() => clearFormValidate(formRef.value))
  if (!supplierOptions.value.length) {
    Message.warning('暂无启用中的供数方，请先在供数方管理中新增或启用')
  }
  if (!standardOptions.value.length) {
    Message.warning('暂无启用中的接入方案，请先在接入方案管理中新增或启用')
  }
}

function openEdit(record: Org) {
  mode.value = 'edit'
  Object.assign(editor, {
    id: record.id,
    name: record.name,
    code: record.code || '',
    standardIds: (record.standardIds?.length ? record.standardIds : record.standardId ? [record.standardId] : []).slice(),
    supplierIds: (record.supplierIds || []).slice(),
  })
  visible.value = true
  nextTick(() => clearFormValidate(formRef.value))
  if (!supplierOptions.value.length) {
    Message.warning('暂无启用中的供数方，请先在供数方管理中新增或启用')
  }
}

async function onSubmit() {
  if (!(await validateForm(formRef.value))) return false
  if (mode.value === 'create') {
    try {
      await createOrg({
        name: editor.name.trim(),
        code: editor.code.trim(),
        supplierIds: editor.supplierIds,
        standardIds: editor.standardIds,
      })
      Message.success('新增成功')
      fetchData(1)
      return true
    } catch (e) {
      Message.error((e as Error).message || '新增失败')
      return false
    }
  }
  if (!editor.id) return false
  try {
    await saveOrg(editor.id, {
      code: editor.code.trim(),
      supplierIds: editor.supplierIds,
      standardIds: editor.standardIds,
    })
    Message.success('保存成功')
    fetchData(pagination.current)
    return true
  } catch (e) {
    Message.error((e as Error).message || '保存失败')
    return false
  }
}

function onToggle(record: Org) {
  const next: Status = record.status === 'enabled' ? 'disabled' : 'enabled'
  Modal.confirm({
    title: next === 'enabled' ? '启用机构' : '停用机构',
    content:
      next === 'enabled'
        ? `确定启用「${record.name}」？启用后可按配置计入供数统计。`
        : `确定停用「${record.name}」？停用后该机构不再计入新入库统计。`,
    async onOk() {
      try {
        await toggleOrg(record.id, next)
        Message.success('已更新')
        fetchData(pagination.current)
      } catch (e) {
        Message.error((e as Error).message)
      }
    },
  })
}

onMounted(() => fetchData(1))
</script>

<style scoped>
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 13px;
}
</style>
