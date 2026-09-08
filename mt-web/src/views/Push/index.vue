<template>
  <div class="page-shell">
    <div class="page-head">
      <div>
        <h2 class="page-title">数据推送管理</h2>
        <p class="page-desc">维护使用方档案与外推任务：配置源端库表、目标地址路径、频次策略与启停状态。</p>
      </div>
    </div>
    <a-card class="content-card" :bordered="false">
      <a-tabs v-model:active-key="activeTab" type="rounded">
        <a-tab-pane key="consumers" title="使用方">
          <div class="page-search">
            <a-input v-model="consumerQuery" placeholder="名称/编码" allow-clear style="width: 220px" />
            <a-button type="primary" @click="fetchConsumers(1)">查询</a-button>
            <a-button type="primary" @click="openConsumerCreate">新增使用方</a-button>
          </div>
          <a-table
            :columns="consumerColumns"
            :data="consumers"
            :loading="consumerLoading"
            row-key="id"
            :pagination="false"
            :bordered="false"
            stripe
          >
            <template #status="{ record }">
              <a-tag :color="record.status === 'enabled' ? 'green' : 'gray'" size="small">
                {{ record.status === 'enabled' ? '启用' : '已停' }}
              </a-tag>
            </template>
            <template #operations="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="openConsumerEdit(record)">编辑</a-button>
                <a-button type="text" size="small" @click="onToggleConsumer(record)">
                  {{ record.status === 'enabled' ? '停用' : '启用' }}
                </a-button>
              </a-space>
            </template>
          </a-table>
          <div class="table-footer">
            <a-pagination
              v-model:current="consumerPage.current"
              :total="consumerPage.total"
              :page-size="consumerPage.pageSize"
              show-total
              show-page-size
              @change="fetchConsumers"
              @page-size-change="onConsumerPageSize"
            />
          </div>
        </a-tab-pane>

        <a-tab-pane key="tasks" title="外推任务">
          <div class="page-search">
            <a-input v-model="taskQuery" placeholder="任务/接收方" allow-clear style="width: 220px" />
            <a-button type="primary" @click="fetchTasks(1)">查询</a-button>
            <a-button type="primary" @click="openTaskCreate">新建任务</a-button>
          </div>
          <a-table
            :columns="taskColumns"
            :data="tasks"
            :loading="taskLoading"
            row-key="id"
            :pagination="false"
            :bordered="false"
            stripe
          >
            <template #status="{ record }">
              <a-tag :color="record.status === 'running' ? 'green' : 'orangered'" size="small">
                {{ record.status === 'running' ? '已启动' : '等待启用' }}
              </a-tag>
            </template>
            <template #operations="{ record }">
              <a-button type="text" size="small" @click="onToggleTask(record)">
                {{ record.status === 'running' ? '暂停' : '启动' }}
              </a-button>
            </template>
          </a-table>
          <div class="table-footer">
            <a-pagination
              v-model:current="taskPage.current"
              :total="taskPage.total"
              :page-size="taskPage.pageSize"
              show-total
              show-page-size
              @change="fetchTasks"
              @page-size-change="onTaskPageSize"
            />
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <a-modal
      v-model:visible="consumerVisible"
      :title="consumerEditor.id ? '编辑使用方' : '新增使用方'"
      unmount-on-close
      :on-before-ok="onConsumerSubmit"
    >
      <a-form ref="consumerFormRef" :model="consumerEditor" :rules="consumerRules" layout="vertical">
        <a-form-item field="name" required>
          <template #label>
            <FormFieldLabel title="名称" desc="使用方业务名称" />
          </template>
          <a-input v-model="consumerEditor.name" placeholder="如：上级汇聚平台" />
        </a-form-item>
        <a-form-item field="code" required>
          <template #label>
            <FormFieldLabel title="编码" desc="唯一编码，创建后建议不改" />
          </template>
          <a-input v-model="consumerEditor.code" placeholder="如：CONS_UP" :disabled="!!consumerEditor.id" />
        </a-form-item>
        <a-form-item field="reviewer" required>
          <template #label>
            <FormFieldLabel title="审核人" desc="业务审核责任人" />
          </template>
          <a-input v-model="consumerEditor.reviewer" placeholder="请输入" />
        </a-form-item>
        <a-form-item field="status">
          <template #label>
            <FormFieldLabel title="状态" desc="停用后不可被新任务选用" />
          </template>
          <a-select
            v-model="consumerEditor.status"
            :options="[
              { label: '启用', value: 'enabled' },
              { label: '已停', value: 'disabled' },
            ]"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-drawer
      v-model:visible="taskVisible"
      title="新建外推任务"
      :width="480"
      unmount-on-close
      :ok-text="'保存'"
      :on-before-ok="onTaskSubmit"
    >
      <a-form ref="taskFormRef" :model="taskEditor" :rules="taskRules" layout="vertical" class="task-form">
        <a-form-item field="name" required>
          <template #label>
            <FormFieldLabel title="任务名称" desc="外推任务业务名称" />
          </template>
          <a-input v-model="taskEditor.name" placeholder="请输入" />
        </a-form-item>
        <a-form-item field="consumerId" required>
          <template #label>
            <FormFieldLabel title="使用方" desc="数据接收方（消费方）" />
          </template>
          <a-select v-model="taskEditor.consumerId" :options="consumerOpts" placeholder="请选择" allow-search />
        </a-form-item>
        <a-form-item field="supplierId" required>
          <template #label>
            <FormFieldLabel title="供数方" desc="本任务关联的供数方来源" />
          </template>
          <a-select v-model="taskEditor.supplierId" :options="supplierOpts" placeholder="请选择" allow-search />
        </a-form-item>
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item>
              <template #label>
                <FormFieldLabel title="业务" desc="可选业务域" />
              </template>
              <a-select
                v-model="taskEditor.business"
                allow-clear
                placeholder="可选"
                :options="[
                  { label: '舆情', value: '舆情' },
                  { label: '定性', value: '定性' },
                  { label: '其它', value: '其它' },
                ]"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item>
              <template #label>
                <FormFieldLabel title="区域" desc="可选区域范围" />
              </template>
              <a-select
                v-model="taskEditor.region"
                allow-clear
                placeholder="可选"
                :options="[
                  { label: '全市', value: '全市' },
                  { label: '某区', value: '某区' },
                  { label: '某县', value: '某县' },
                ]"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-divider orientation="left">源端</a-divider>
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item field="sourceDb" required>
              <template #label>
                <FormFieldLabel title="库名" desc="中台侧源库" />
              </template>
              <a-select
                v-model="taskEditor.sourceDb"
                :options="[
                  { label: 'yunshu_dw', value: 'yunshu_dw' },
                  { label: 'yunshu_ods', value: 'yunshu_ods' },
                ]"
                placeholder="请选择"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="sourceSchema" required>
              <template #label>
                <FormFieldLabel title="模式" desc="Schema / 模式名" />
              </template>
              <a-select
                v-model="taskEditor.sourceSchema"
                :options="[
                  { label: 'public', value: 'public' },
                  { label: 'district', value: 'district' },
                ]"
                placeholder="请选择"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-divider orientation="left">目标</a-divider>
        <a-form-item field="targetHost" required>
          <template #label>
            <FormFieldLabel title="Host" desc="使用方接收服务地址" />
          </template>
          <a-input v-model="taskEditor.targetHost" placeholder="https://" />
        </a-form-item>
        <a-form-item field="targetPath" required>
          <template #label>
            <FormFieldLabel title="路径" desc="接收接口路径" />
          </template>
          <a-input v-model="taskEditor.targetPath" placeholder="/api/" />
        </a-form-item>
        <a-form-item>
          <template #label>
            <FormFieldLabel title="鉴权方式说明" desc="记录 Token / 证书等约定，便于联调" />
          </template>
          <a-textarea v-model="taskEditor.authRemark" placeholder="请输入" :auto-size="{ minRows: 3, maxRows: 5 }" />
        </a-form-item>
      </a-form>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, reactive, ref, watch } from 'vue'
import { Message, Modal, type FormInstance } from '@arco-design/web-vue'
import FormFieldLabel from '@/components/FormFieldLabel.vue'
import {
  listPushConsumers,
  listPushTasks,
  pushConsumerOptions,
  pushSupplierOptions,
  savePushConsumer,
  savePushTask,
  togglePushConsumer,
  togglePushTask,
  type PushConsumer,
  type PushStatus,
  type PushTask,
  type TaskRunStatus,
} from '@/api/push'
import { clearFormValidate, validateForm } from '@/utils/formValidate'

const activeTab = ref('consumers')

const consumerQuery = ref('')
const consumers = ref<PushConsumer[]>([])
const consumerLoading = ref(false)
const consumerPage = reactive({ current: 1, pageSize: 10, total: 0 })
const consumerVisible = ref(false)
const consumerFormRef = ref<FormInstance>()
const consumerEditor = reactive({
  id: '',
  name: '',
  code: '',
  reviewer: '',
  status: 'enabled' as PushStatus,
})
const consumerRules = {
  name: [{ required: true, message: '请填写名称' }],
  code: [{ required: true, message: '请填写编码' }],
  reviewer: [{ required: true, message: '请填写审核人' }],
}
const consumerColumns = [
  { title: '名称', dataIndex: 'name', ellipsis: true, tooltip: true },
  { title: '编码', dataIndex: 'code', width: 140 },
  { title: '审核人', dataIndex: 'reviewer', width: 100 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 72 },
  { title: '操作', dataIndex: 'operations', slotName: 'operations', width: 160 },
]

const taskQuery = ref('')
const tasks = ref<PushTask[]>([])
const taskLoading = ref(false)
const taskPage = reactive({ current: 1, pageSize: 10, total: 0 })
const taskVisible = ref(false)
const taskFormRef = ref<FormInstance>()
const consumerOpts = ref<{ label: string; value: string }[]>([])
const supplierOpts = ref<{ label: string; value: string }[]>([])
const taskEditor = reactive({
  name: '',
  consumerId: '',
  supplierId: '',
  business: '',
  region: '',
  sourceDb: 'yunshu_dw',
  sourceSchema: 'public',
  targetHost: '',
  targetPath: '',
  authRemark: '',
})
const taskRules = {
  name: [{ required: true, message: '请填写任务名称' }],
  consumerId: [{ required: true, message: '请选择使用方' }],
  supplierId: [{ required: true, message: '请选择供数方' }],
  sourceDb: [{ required: true, message: '请选择源端库名' }],
  sourceSchema: [{ required: true, message: '请选择源端模式' }],
  targetHost: [{ required: true, message: '请填写目标 Host' }],
  targetPath: [{ required: true, message: '请填写目标路径' }],
}
const taskColumns = [
  { title: '任务', dataIndex: 'name', ellipsis: true, tooltip: true },
  { title: '接收方', dataIndex: 'consumerName', width: 140, ellipsis: true, tooltip: true },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 96 },
  { title: '最近处理', dataIndex: 'lastProcessedAt', width: 160 },
  { title: '操作', dataIndex: 'operations', slotName: 'operations', width: 88 },
]

async function fetchConsumers(page = consumerPage.current) {
  consumerLoading.value = true
  try {
    const res = await listPushConsumers({
      keyword: consumerQuery.value,
      page,
      pageSize: consumerPage.pageSize,
    })
    consumers.value = res.list
    consumerPage.current = page
    consumerPage.total = res.total
  } finally {
    consumerLoading.value = false
  }
}
function onConsumerPageSize(size: number) {
  consumerPage.pageSize = size
  fetchConsumers(1)
}
function openConsumerCreate() {
  Object.assign(consumerEditor, { id: '', name: '', code: '', reviewer: '', status: 'enabled' })
  consumerVisible.value = true
  nextTick(() => clearFormValidate(consumerFormRef.value))
}
function openConsumerEdit(record: PushConsumer) {
  Object.assign(consumerEditor, record)
  consumerVisible.value = true
  nextTick(() => clearFormValidate(consumerFormRef.value))
}
async function onConsumerSubmit() {
  if (!(await validateForm(consumerFormRef.value))) return false
  try {
    await savePushConsumer({ ...consumerEditor })
    Message.success('保存成功')
    fetchConsumers(consumerPage.current)
    return true
  } catch (e) {
    Message.error((e as Error).message)
    return false
  }
}
function onToggleConsumer(record: PushConsumer) {
  const next: PushStatus = record.status === 'enabled' ? 'disabled' : 'enabled'
  Modal.confirm({
    title: next === 'enabled' ? '启用使用方' : '停用使用方',
    content: `确定${next === 'enabled' ? '启用' : '停用'}「${record.name}」？`,
    async onOk() {
      await togglePushConsumer(record.id, next)
      Message.success('已更新')
      fetchConsumers(consumerPage.current)
    },
  })
}

async function fetchTasks(page = taskPage.current) {
  taskLoading.value = true
  try {
    const res = await listPushTasks({
      keyword: taskQuery.value,
      page,
      pageSize: taskPage.pageSize,
    })
    tasks.value = res.list
    taskPage.current = page
    taskPage.total = res.total
  } finally {
    taskLoading.value = false
  }
}
function onTaskPageSize(size: number) {
  taskPage.pageSize = size
  fetchTasks(1)
}
function openTaskCreate() {
  Object.assign(taskEditor, {
    name: '',
    consumerId: '',
    supplierId: '',
    business: '',
    region: '',
    sourceDb: 'yunshu_dw',
    sourceSchema: 'public',
    targetHost: '',
    targetPath: '',
    authRemark: '',
  })
  consumerOpts.value = pushConsumerOptions()
  supplierOpts.value = pushSupplierOptions()
  taskVisible.value = true
  nextTick(() => clearFormValidate(taskFormRef.value))
}
async function onTaskSubmit() {
  if (!(await validateForm(taskFormRef.value))) return false
  try {
    await savePushTask({ ...taskEditor })
    Message.success('任务已创建')
    activeTab.value = 'tasks'
    fetchTasks(1)
    return true
  } catch (e) {
    Message.error((e as Error).message)
    return false
  }
}
function onToggleTask(record: PushTask) {
  const next: TaskRunStatus = record.status === 'running' ? 'pending' : 'running'
  Modal.confirm({
    title: next === 'running' ? '启动任务' : '暂停任务',
    content: `确定${next === 'running' ? '启动' : '暂停'}「${record.name}」？`,
    async onOk() {
      await togglePushTask(record.id, next)
      Message.success('已更新')
      fetchTasks(taskPage.current)
    },
  })
}

watch(activeTab, (tab) => {
  if (tab === 'consumers') fetchConsumers(1)
  else fetchTasks(1)
})

onMounted(() => fetchConsumers(1))
</script>

<style scoped>
.task-form :deep(.arco-divider-horizontal) {
  margin: 4px 0 16px;
}
.page-search {
  margin-bottom: 16px;
}
</style>
