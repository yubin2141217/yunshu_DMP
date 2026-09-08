<template>
  <div class="page-shell">
    <div class="page-head">
      <div>
        <h2 class="page-title">供数方管理</h2>
        <p class="page-desc">维护平台侧供数方档案；凭证用于接口推送鉴权（库表直推前置机场景见接入方案与 IP 白名单）。</p>
      </div>
      <a-button type="primary" @click="openCreate">新增供数方</a-button>
    </div>
    <a-card class="content-card" :bordered="false">
      <div class="page-search">
        <a-input v-model="form.name" placeholder="供数方名称" allow-clear style="width: 200px" />
        <a-select v-model="form.status" :options="statusOptions" placeholder="状态" allow-clear style="width: 140px" />
        <a-button type="primary" @click="fetchData(1)">查询</a-button>
        <a-button @click="onReset">重置</a-button>
      </div>
      <a-table :columns="columns" :data="data" :loading="loading" row-key="id" :pagination="false" :bordered="false" stripe>
        <template #code="{ record }">
          <a-space>
            <span class="mono">{{ record.code }}</span>
            <a-button type="text" size="mini" @click="copyCode(record.code)">复制</a-button>
          </a-space>
        </template>
        <template #appkey="{ record }">
          <a-space>
            <span class="mono">{{ maskAppkey(record.appkey) }}</span>
            <a-button type="text" size="mini" @click="showAppkey(record)">查看</a-button>
            <a-button type="text" size="mini" @click="copyAppkey(record.appkey)">复制</a-button>
          </a-space>
        </template>
        <template #status="{ record }">
          <a-tag :color="record.status === 'enabled' ? 'green' : 'orangered'" size="small">
            {{ record.status === 'enabled' ? '启用' : '停用' }}
          </a-tag>
        </template>
        <template #operations="{ record }">
          <a-space class="arco-table-ops" :size="2">
            <a-button type="text" size="small" @click="openEdit(record)">编辑</a-button>
            <a-button type="text" size="small" @click="onRotate(record)">轮换凭证</a-button>
            <a-button type="text" size="small" @click="onToggle(record)">{{ record.status === 'enabled' ? '停用' : '启用' }}</a-button>
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
      <a-modal v-model:visible="visible" :title="mode === 'create' ? '新增供数方' : '编辑供数方'" :on-before-ok="onSubmit" @cancel="visible = false">
        <a-form ref="formRef" :model="editor" :rules="rules" layout="vertical">
          <a-form-item field="name" label="供数方名称" required>
            <a-input v-model="editor.name" :max-length="50" placeholder="请输入" />
          </a-form-item>
          <a-form-item field="code" required>
            <template #label>
              <FormFieldLabel title="供数方编码" desc="唯一编码；库表送数时 supplier_code 须填此值" />
            </template>
            <a-input v-model="editor.code" :max-length="32" placeholder="请输入" />
          </a-form-item>
          <a-form-item field="status" label="状态" required>
            <a-select v-model="editor.status" :options="statusOptions.filter((o) => o.value)" />
          </a-form-item>
        </a-form>
      </a-modal>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, reactive, ref } from 'vue'
import { Message, Modal, type FormInstance } from '@arco-design/web-vue'
import FormFieldLabel from '@/components/FormFieldLabel.vue'
import { deleteSupplier, listSuppliers, rotateSupplierAppkey, saveSupplier, toggleSupplier } from '@/api/mt'
import type { Status, Supplier } from '@/mock/mt'
import { clearFormValidate, validateForm } from '@/utils/formValidate'

const statusOptions = [
  { label: '启用', value: 'enabled' },
  { label: '停用', value: 'disabled' },
]
const form = reactive({ name: '', status: '' })
const data = ref<Supplier[]>([])
const loading = ref(false)
const pagination = reactive({ current: 1, pageSize: 10, total: 0 })
const visible = ref(false)
const mode = ref<'create' | 'edit'>('create')
const formRef = ref<FormInstance>()
const editor = reactive({ id: '', name: '', code: '', status: 'enabled' as Status })
const rules = {
  name: [{ required: true, message: '请填写供数方名称' }],
  code: [{ required: true, message: '请填写供数方编码' }],
  status: [{ required: true, message: '请选择状态' }],
}
const columns = [
  { title: '供数方名称', dataIndex: 'name', width: 150, ellipsis: true, tooltip: true },
  { title: '供数方编码', dataIndex: 'code', slotName: 'code', width: 150 },
  { title: 'appkey', dataIndex: 'appkey', slotName: 'appkey', ellipsis: true, tooltip: true },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 72 },
  { title: '更新时间', dataIndex: 'updatedAt', width: 160 },
  { title: '操作', dataIndex: 'operations', slotName: 'operations', width: 260 },
]

function maskAppkey(key?: string) {
  if (!key) return '—'
  if (key.length <= 8) return '****'
  return `${key.slice(0, 4)}****${key.slice(-4)}`
}

function showAppkey(record: Supplier) {
  Modal.info({
    title: `供数方凭证 · ${record.name}`,
    content: `完整 appkey：\n${record.appkey}\n\n请仅通过安全渠道下发给对应厂商；列表默认脱敏。`,
    hideCancel: false,
    okText: '复制并关闭',
    cancelText: '关闭',
    async onOk() {
      await copyAppkey(record.appkey)
    },
  })
}

async function copyCode(code?: string) {
  if (!code) {
    Message.warning('暂无供数方编码')
    return
  }
  try {
    await navigator.clipboard.writeText(code)
    Message.success('已复制供数方编码，可下发给厂商填入 supplier_code')
  } catch {
    Message.error('复制失败，请手动选择复制')
  }
}

async function copyAppkey(key?: string) {
  if (!key) {
    Message.warning('暂无凭证')
    return
  }
  try {
    await navigator.clipboard.writeText(key)
    Message.success('已复制完整 appkey')
  } catch {
    Message.error('复制失败，请手动查看后抄录')
  }
}

async function fetchData(page = pagination.current) {
  loading.value = true
  try {
    const res = await listSuppliers({ ...form, page, pageSize: pagination.pageSize })
    data.value = res.list
    pagination.current = page
    pagination.total = res.total
  } finally {
    loading.value = false
  }
}

function onReset() {
  form.name = ''
  form.status = ''
  fetchData(1)
}
function onPageSize(size: number) {
  pagination.pageSize = size
  fetchData(1)
}
function openCreate() {
  mode.value = 'create'
  Object.assign(editor, { id: '', name: '', code: '', status: 'enabled' })
  visible.value = true
  nextTick(() => clearFormValidate(formRef.value))
}
function openEdit(record: Supplier) {
  mode.value = 'edit'
  Object.assign(editor, { id: record.id, name: record.name, code: record.code, status: record.status })
  visible.value = true
  nextTick(() => clearFormValidate(formRef.value))
}
async function onSubmit() {
  if (!(await validateForm(formRef.value))) return false
  try {
    const item = await saveSupplier({
      id: editor.id || undefined,
      name: editor.name,
      code: editor.code,
      status: editor.status,
    })
    Message.success('保存成功')
    fetchData(pagination.current)
    if (mode.value === 'create' && item?.appkey) {
      Modal.info({
        title: '供数方已创建',
        content: `已生成 appkey，请立即复制并安全保管：\n${item.appkey}`,
        okText: '复制并关闭',
        async onOk() {
          await copyAppkey(item.appkey)
        },
      })
    }
    return true
  } catch (e) {
    Message.error((e as Error).message)
    return false
  }
}
function onRotate(record: Supplier) {
  Modal.confirm({
    title: '轮换凭证',
    content: `确定轮换「${record.name}」的 appkey？旧凭证将立即失效。`,
    async onOk() {
      const item = await rotateSupplierAppkey(record.id)
      fetchData(pagination.current)
      Modal.info({
        title: '新凭证已生成',
        content: `请立即复制并安全下发：\n${item.appkey}`,
        okText: '复制并关闭',
        async onOk() {
          await copyAppkey(item.appkey)
        },
      })
    },
  })
}
function onToggle(record: Supplier) {
  const next: Status = record.status === 'enabled' ? 'disabled' : 'enabled'
  Modal.confirm({
    title: next === 'disabled' ? '停用供数方' : '启用供数方',
    content: `确定${next === 'disabled' ? '停用' : '启用'}「${record.name}」？`,
    async onOk() {
      await toggleSupplier(record.id, next)
      Message.success('已更新')
      fetchData(pagination.current)
    },
  })
}
function onDelete(record: Supplier) {
  Modal.confirm({
    title: '删除供数方',
    content: `确定删除「${record.name}」？被机构引用时不可删除。`,
    async onOk() {
      const res = await deleteSupplier(record.id)
      if (!res.ok) {
        Message.warning('该供数方已被机构引用，不能删除')
        return
      }
      Message.success('已删除')
      fetchData(1)
    },
  })
}

onMounted(() => fetchData(1))
</script>

<style scoped>
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  letter-spacing: 0.02em;
}
</style>
