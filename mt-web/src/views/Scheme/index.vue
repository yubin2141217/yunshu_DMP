<template>
  <div class="page-shell">
    <div class="page-head">
      <div>
        <h2 class="page-title">接入方案</h2>
        <p class="page-desc">
          维护可复用对接策略（数据源类型、JDBC、频次、白名单开关）。方案不绑定供数方，可被多份接入标准引用。本期完整支持「库表数据集」JDBC，其它类型预留。
        </p>
      </div>
      <a-button type="primary" @click="openCreate">新增接入方案</a-button>
    </div>
    <a-card class="content-card" :bordered="false">
      <div class="page-search">
        <a-input v-model="form.name" placeholder="方案名称" allow-clear style="width: 200px" />
        <a-select
          v-model="form.dataSourceType"
          :options="dataSourceTypeOptions"
          allow-clear
          placeholder="数据源类型"
          style="width: 160px"
        />
        <a-select v-model="form.status" :options="statusOptions" allow-clear placeholder="状态" style="width: 140px" />
        <a-button type="primary" @click="fetchData(1)">查询</a-button>
      </div>
      <a-table :columns="columns" :data="data" :loading="loading" row-key="id" :pagination="false" :bordered="false" stripe>
        <template #whitelist="{ record }">
          <a-tag :color="record.requireIpWhitelist ? 'arcoblue' : 'gray'" size="small">
            {{ record.requireIpWhitelist ? '是' : '否' }}
          </a-tag>
        </template>
        <template #status="{ record }">
          <a-tag :color="record.status === 'enabled' ? 'green' : 'orangered'" size="small">
            {{ record.status === 'enabled' ? '启用' : '停用' }}
          </a-tag>
        </template>
        <template #operations="{ record }">
          <a-space class="arco-table-ops" :size="2">
            <a-button type="text" size="small" @click="$router.push('/scheme/' + record.id)">详情</a-button>
            <a-button type="text" size="small" @click="openEdit(record)">编辑</a-button>
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
      <a-modal
        v-model:visible="visible"
        :title="editor.id ? '编辑接入方案' : '新增接入方案'"
        :width="720"
        unmount-on-close
        :on-before-ok="onSubmit"
      >
        <a-form ref="formRef" :model="editor" :rules="rules" layout="vertical" class="scheme-form">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item field="name" required>
                <template #label>
                  <FormFieldLabel title="方案名称" desc="接入方案业务名称，供标准绑定选用" />
                </template>
                <a-input v-model="editor.name" placeholder="如：舆情库表增量落盘" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item field="dataSourceType" required>
                <template #label>
                  <FormFieldLabel title="数据源类型" desc="决定后续可配置项；非库表类型本期仅预留" />
                </template>
                <a-select v-model="editor.dataSourceType" :options="dataSourceTypeOptions" placeholder="请选择" />
              </a-form-item>
            </a-col>
          </a-row>

          <template v-if="editor.dataSourceType === 'table'">
            <a-divider orientation="left">库表数据集 · JDBC 连接</a-divider>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item field="jdbcDbType" required>
                  <template #label>
                    <FormFieldLabel title="数据库类型" desc="决定默认端口与 JDBC URL 拼装规则" />
                  </template>
                  <a-select
                    v-model="editor.jdbcDbType"
                    :options="jdbcDbTypeOptions"
                    placeholder="请选择"
                    @change="onJdbcTypeChange"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item field="jdbcHost" required>
                  <template #label>
                    <FormFieldLabel title="主机地址" desc="数据库服务器 IP 或域名" />
                  </template>
                  <a-input v-model="editor.jdbcHost" placeholder="如 10.0.1.12" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item field="jdbcPort" required>
                  <template #label>
                    <FormFieldLabel title="端口" desc="按库类型填写，如 MySQL 3306" />
                  </template>
                  <a-input v-model="editor.jdbcPort" placeholder="3306" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item field="jdbcDatabase" required>
                  <template #label>
                    <FormFieldLabel title="数据库名" desc="JDBC 连接的目标库 / SID" />
                  </template>
                  <a-input v-model="editor.jdbcDatabase" placeholder="如 yunshu_ods" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item>
                  <template #label>
                    <FormFieldLabel title="Schema / 模式" desc="可选；PostgreSQL 等需要时填写" />
                  </template>
                  <a-input v-model="editor.jdbcSchema" placeholder="如 public" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item field="jdbcUsername" required>
                  <template #label>
                    <FormFieldLabel title="用户名" desc="具备读库权限的账号" />
                  </template>
                  <a-input v-model="editor.jdbcUsername" placeholder="请输入" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item field="jdbcPassword" required>
                  <template #label>
                    <FormFieldLabel title="密码" desc="连接密码；列表与详情默认脱敏" />
                  </template>
                  <a-input-password v-model="editor.jdbcPassword" placeholder="请输入" allow-clear />
                </a-form-item>
              </a-col>
            </a-row>
            <a-form-item>
              <template #label>
                <FormFieldLabel title="JDBC URL 预览" desc="根据上方参数自动生成，仅供核对" />
              </template>
              <a-input :model-value="jdbcUrlPreview" readonly />
            </a-form-item>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item required>
                  <template #label>
                    <FormFieldLabel title="抽取频次" desc="按 JDBC 拉取库表数据的周期" />
                  </template>
                  <a-select v-model="editor.frequency" :options="freqOpts" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item required>
                  <template #label>
                    <FormFieldLabel title="更新规则" desc="增量仅抽变更数据；全量覆盖当日快照" />
                  </template>
                  <a-select v-model="editor.updateMode" :options="modeOpts" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item v-if="editor.updateMode === 'incremental'" field="incrementField" required>
                  <template #label>
                    <FormFieldLabel title="增量字段" desc="增量抽取依据字段，如 content_time" />
                  </template>
                  <a-input v-model="editor.incrementField" placeholder="如 content_time" />
                </a-form-item>
                <a-form-item v-else>
                  <template #label>
                    <FormFieldLabel title="增量字段" desc="全量模式无需填写" />
                  </template>
                  <a-input disabled placeholder="全量模式不适用" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item>
                  <template #label>
                    <FormFieldLabel title="失败重试次数" desc="连接或抽取失败时的自动重试上限" />
                  </template>
                  <a-input-number v-model="editor.retry" :min="0" :max="10" style="width: 100%" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item>
                  <template #label>
                    <FormFieldLabel title="IP 白名单管控" desc="开启后须在「IP 白名单」维护数据提供厂商的来源IP，非名单内IP推送请求将被拒绝" />
                  </template>
                  <a-switch v-model="editor.requireIpWhitelist" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item field="status" required>
                  <template #label>
                    <FormFieldLabel title="状态" desc="停用后不可被新接入标准绑定" />
                  </template>
                  <a-select v-model="editor.status" :options="statusOptions.filter((o) => o.value)" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-form-item>
              <template #label>
                <FormFieldLabel title="备注" desc="可选补充说明" />
              </template>
              <a-textarea v-model="editor.remark" placeholder="请输入" :auto-size="{ minRows: 2, maxRows: 4 }" />
            </a-form-item>
          </template>

          <template v-else>
            <a-alert type="warning" style="margin-bottom: 16px">
              「{{ dataSourceTypeLabels[editor.dataSourceType] || '该类型' }}」接入配置本期预留，暂不可编辑详细参数。请改选「库表数据集」完成可用方案配置。
            </a-alert>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item field="status" required>
                  <template #label>
                    <FormFieldLabel title="状态" desc="预留类型建议保持停用" />
                  </template>
                  <a-select v-model="editor.status" :options="statusOptions.filter((o) => o.value)" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-form-item>
              <template #label>
                <FormFieldLabel title="备注" desc="可选，记录预留意图" />
              </template>
              <a-textarea v-model="editor.remark" placeholder="请输入" :auto-size="{ minRows: 2, maxRows: 4 }" />
            </a-form-item>
          </template>
        </a-form>
      </a-modal>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { Message, Modal, type FormInstance } from '@arco-design/web-vue'
import FormFieldLabel from '@/components/FormFieldLabel.vue'
import { deleteScheme, listSchemes, saveScheme, toggleScheme } from '@/api/mt'
import {
  buildJdbcUrlPreview,
  dataSourceTypeLabels,
  dataSourceTypeOptions,
  frequencyLabels,
  jdbcDbTypeOptions,
  jdbcDefaultPorts,
  updateModeLabels,
  type DataSourceType,
  type Scheme,
  type Status,
} from '@/mock/mt'
import { clearFormValidate, validateForm } from '@/utils/formValidate'

const statusOptions = [
  { label: '启用', value: 'enabled' },
  { label: '停用', value: 'disabled' },
]
const freqOpts = Object.entries(frequencyLabels).map(([value, label]) => ({ value, label }))
const modeOpts = Object.entries(updateModeLabels).map(([value, label]) => ({ value, label }))
const form = reactive({ name: '', status: '', dataSourceType: undefined as string | undefined })
const data = ref<Scheme[]>([])
const loading = ref(false)
const pagination = reactive({ current: 1, pageSize: 10, total: 0 })
const visible = ref(false)
const formRef = ref<FormInstance>()
const emptyEditor = (): Scheme => ({
  id: '',
  name: '',
  dataSourceType: 'table',
  jdbcDbType: 'mysql',
  jdbcHost: '',
  jdbcPort: '3306',
  jdbcDatabase: '',
  jdbcSchema: '',
  jdbcUsername: '',
  jdbcPassword: '',
  frequency: 'daily',
  updateMode: 'incremental',
  incrementField: '',
  retry: 0,
  requireIpWhitelist: false,
  remark: '',
  status: 'enabled',
  updatedAt: '',
})
const editor = reactive<Scheme>(emptyEditor())
const jdbcUrlPreview = computed(() => buildJdbcUrlPreview(editor))
const requireWhenTable = (message: string) => ({
  validator: (value: string, callback: (error?: string) => void) => {
    if (editor.dataSourceType !== 'table') {
      callback()
      return
    }
    if (!String(value || '').trim()) callback(message)
    else callback()
  },
})
const rules = {
  name: [{ required: true, message: '请填写方案名称' }],
  dataSourceType: [{ required: true, message: '请选择数据源类型' }],
  jdbcDbType: [requireWhenTable('请选择数据库类型')],
  jdbcHost: [requireWhenTable('请填写主机地址')],
  jdbcPort: [requireWhenTable('请填写端口')],
  jdbcDatabase: [requireWhenTable('请填写数据库名')],
  jdbcUsername: [requireWhenTable('请填写用户名')],
  jdbcPassword: [requireWhenTable('请填写密码')],
  incrementField: [
    {
      validator: (value: string, callback: (error?: string) => void) => {
        if (editor.dataSourceType === 'table' && editor.updateMode === 'incremental' && !String(value || '').trim()) {
          callback('增量模式请填写增量字段')
        } else callback()
      },
    },
  ],
  status: [{ required: true, message: '请选择状态' }],
}
const columns = [
  { title: '方案名称', dataIndex: 'name', width: 150, ellipsis: true, tooltip: true },
  { title: '数据源类型', dataIndex: 'dataSourceTypeLabel', width: 110 },
  { title: '数据库类型', dataIndex: 'jdbcDbTypeLabel', width: 110 },
  { title: '主机', dataIndex: 'jdbcHost', ellipsis: true, tooltip: true },
  { title: '频次', dataIndex: 'frequencyLabel', width: 72 },
  { title: 'IP白名单管控', dataIndex: 'requireIpWhitelist', slotName: 'whitelist', width: 120 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 72 },
  { title: '更新时间', dataIndex: 'updatedAt', width: 160 },
  { title: '操作', dataIndex: 'operations', slotName: 'operations', width: 232 },
]

function onJdbcTypeChange(value: string | number | boolean | Record<string, unknown> | (string | number | boolean | Record<string, unknown>)[]) {
  const type = String(value || 'mysql')
  editor.jdbcDbType = type
  if (!editor.jdbcPort || Object.values(jdbcDefaultPorts).includes(editor.jdbcPort)) {
    editor.jdbcPort = jdbcDefaultPorts[type] || '3306'
  }
}

async function fetchData(page = pagination.current) {
  loading.value = true
  try {
    const res = await listSchemes({
      name: form.name,
      status: form.status,
      dataSourceType: form.dataSourceType || '',
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
  Object.assign(editor, emptyEditor())
  visible.value = true
  nextTick(() => clearFormValidate(formRef.value))
}
function openEdit(record: Scheme) {
  Object.assign(editor, emptyEditor(), {
    ...record,
    dataSourceType: (record.dataSourceType || 'table') as DataSourceType,
    jdbcDbType: record.jdbcDbType || 'mysql',
    jdbcHost: record.jdbcHost || record.frontHost || '',
    jdbcPort: record.jdbcPort || record.frontPort || jdbcDefaultPorts[record.jdbcDbType || 'mysql'] || '3306',
    jdbcDatabase: record.jdbcDatabase || '',
    jdbcSchema: record.jdbcSchema || '',
    jdbcUsername: record.jdbcUsername || '',
    jdbcPassword: record.jdbcPassword || '',
    requireIpWhitelist: !!record.requireIpWhitelist,
  })
  visible.value = true
  nextTick(() => clearFormValidate(formRef.value))
}
async function onSubmit() {
  if (!(await validateForm(formRef.value))) return false
  if (editor.dataSourceType !== 'table' && editor.status === 'enabled') {
    Message.warning('预留数据源类型请先设为停用，或改选库表数据集')
    return false
  }
  try {
    const payload = { ...editor }
    if (payload.updateMode === 'full') payload.incrementField = ''
    await saveScheme(payload)
    Message.success('保存成功')
    fetchData(pagination.current)
    return true
  } catch (e) {
    Message.error((e as Error).message)
    return false
  }
}
function onToggle(record: Scheme) {
  const next: Status = record.status === 'enabled' ? 'disabled' : 'enabled'
  if (next === 'enabled' && record.dataSourceType && record.dataSourceType !== 'table') {
    Message.warning('预留数据源类型暂不可启用')
    return
  }
  Modal.confirm({
    title: '变更状态',
    content: `确定${next === 'enabled' ? '启用' : '停用'}「${record.name}」？`,
    async onOk() {
      await toggleScheme(record.id, next)
      Message.success('已更新')
      fetchData(pagination.current)
    },
  })
}
function onDelete(record: Scheme) {
  Modal.confirm({
    title: '删除接入方案',
    content: `确定删除「${record.name}」？已被接入标准引用时不可删除。`,
    async onOk() {
      const res = await deleteScheme(record.id)
      if (!res.ok) {
        Message.warning('已被接入标准引用，不能删除')
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
.scheme-form :deep(.arco-divider-horizontal) {
  margin: 8px 0 20px;
}
.scheme-form :deep(.arco-form-item) {
  margin-bottom: 18px;
}
</style>
