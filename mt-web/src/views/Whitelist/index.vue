<template>
  <div class="page-shell">
    <div class="page-head">
      <div>
        <h2 class="page-title">IP 白名单</h2>
        <p class="page-desc">按供数方（厂商）维护允许推送的来源 IP。仅当生效标准所绑接入方案开启「IP白名单管控」时参与校验。</p>
      </div>
      <a-button type="primary" @click="openCreate">按厂商批量添加</a-button>
    </div>
    <a-card class="content-card" :bordered="false">
      <div class="page-search">
        <a-select
          v-model="form.supplierId"
          :options="supplierOpts"
          allow-clear
          placeholder="供数方"
          style="width: 200px"
        />
        <a-input v-model="form.ip" placeholder="IP" allow-clear style="width: 200px" />
        <a-button type="primary" @click="fetchData(1)">查询</a-button>
      </div>
      <a-table :columns="columns" :data="data" :loading="loading" row-key="id" :pagination="false" :bordered="false" stripe>
        <template #operations="{ record }">
          <a-button type="text" status="danger" size="small" @click="onDelete(record)">删除</a-button>
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
      <a-modal v-model:visible="visible" title="按厂商批量添加 IP" :width="560" unmount-on-close :on-before-ok="onSubmit">
        <a-form ref="formRef" :model="editor" :rules="rules" layout="vertical">
          <a-form-item field="supplierId" required>
            <template #label>
              <FormFieldLabel title="供数方（厂商）" desc="本次批量添加的 IP 归属该厂商" />
            </template>
            <a-select
              v-model="editor.supplierId"
              :options="supplierOpts"
              placeholder="请选择供数方"
              allow-search
            />
          </a-form-item>
          <a-form-item field="ipsText" required>
            <template #label>
              <FormFieldLabel title="IP 地址" desc="仅支持 IPv4 单地址；多个请换行或用逗号分隔" />
            </template>
            <a-textarea
              v-model="editor.ipsText"
              placeholder="示例：&#10;10.0.1.12&#10;203.0.113.8&#10;或：10.0.1.12, 203.0.113.8"
              :auto-size="{ minRows: 5, maxRows: 12 }"
            />
          </a-form-item>
          <a-form-item>
            <template #label>
              <FormFieldLabel title="备注" desc="可选，将应用于本批全部 IP" />
            </template>
            <a-input v-model="editor.remark" placeholder="请输入" />
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
import { addIpWhitelistBatch, deleteWhitelist, listWhitelist, supplierSelect } from '@/api/mt'
import type { IpWhitelistItem } from '@/mock/mt'
import { clearFormValidate, validateForm } from '@/utils/formValidate'

const form = reactive({ ip: '', supplierId: undefined as string | undefined })
const data = ref<IpWhitelistItem[]>([])
const loading = ref(false)
const pagination = reactive({ current: 1, pageSize: 10, total: 0 })
const visible = ref(false)
const formRef = ref<FormInstance>()
const supplierOpts = ref<{ label: string; value: string }[]>([])
const editor = reactive({ supplierId: '', ipsText: '', remark: '' })
const rules = {
  supplierId: [{ required: true, message: '请选择供数方（厂商）' }],
  ipsText: [{ required: true, message: '请填写至少一个 IP' }],
}
const columns = [
  { title: '供数方', dataIndex: 'supplierName', width: 140, ellipsis: true, tooltip: true },
  { title: 'IP', dataIndex: 'ip', width: 140 },
  { title: '备注', dataIndex: 'remark', ellipsis: true, tooltip: true },
  { title: '创建时间', dataIndex: 'createdAt', width: 160 },
  { title: '操作', dataIndex: 'operations', slotName: 'operations', width: 88 },
]

async function fetchData(page = pagination.current) {
  loading.value = true
  try {
    supplierOpts.value = supplierSelect()
    const res = await listWhitelist({
      ip: form.ip,
      supplierId: form.supplierId,
      page,
      pageSize: pagination.pageSize,
    })
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
function openCreate() {
  editor.supplierId = ''
  editor.ipsText = ''
  editor.remark = ''
  supplierOpts.value = supplierSelect()
  visible.value = true
  nextTick(() => clearFormValidate(formRef.value))
}
async function onSubmit() {
  if (!(await validateForm(formRef.value))) return false
  try {
    const res = await addIpWhitelistBatch({
      supplierId: editor.supplierId,
      ipsText: editor.ipsText,
      remark: editor.remark,
    })
    const ok = res.added.length
    const skip = res.skipped.length
    if (!ok && skip) {
      Message.warning(`未添加成功：${res.skipped.map((s) => `${s.ip}（${s.reason}）`).join('；')}`)
      return false
    }
    if (ok && skip) {
      Message.success(`已为「${res.supplierName}」添加 ${ok} 条；跳过 ${skip} 条（重复或格式无效）`)
    } else {
      Message.success(`已为「${res.supplierName}」添加 ${ok} 条 IP`)
    }
    fetchData(1)
    return true
  } catch (e) {
    Message.error((e as Error).message)
    return false
  }
}
function onDelete(record: IpWhitelistItem) {
  Modal.confirm({
    title: '删除白名单',
    content: `确定删除「${record.supplierName || '未归属'}」下的 IP「${record.ip}」？`,
    async onOk() {
      await deleteWhitelist(record.id)
      Message.success('已删除')
      fetchData(pagination.current)
    },
  })
}

onMounted(() => fetchData(1))
</script>
