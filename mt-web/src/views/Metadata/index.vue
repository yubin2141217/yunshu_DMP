<template>
  <div class="page-shell">
    <div class="page-head">
      <div>
        <h2 class="page-title">字段库管理</h2>
        <p class="page-desc">维护可复用数据标准字段（字段名、描述、数据类型、业务分类）。库表识别厂商依赖预置字段 supplier_code（对应供数方编码）；归属机构依赖 org_id（对应机构供数配置中的机构编码）。</p>
      </div>
      <a-button v-if="activeTab === 'fields'" type="primary" @click="openCreate">新增字段</a-button>
      <a-button v-else-if="activeTab === 'templates'" type="primary" @click="openTplCreate">新增模板</a-button>
    </div>
    <a-card class="content-card" :bordered="false">
      <a-tabs v-model:active-key="activeTab" type="rounded" @change="onTabChange">
        <a-tab-pane key="fields" title="全部字段">
          <div class="page-search">
            <a-input v-model="form.name" placeholder="字段名/描述" allow-clear style="width: 220px" />
            <a-select
              v-model="form.bizCategory"
              :options="bizCategoryOptions"
              allow-clear
              placeholder="业务分类"
              style="width: 140px"
            />
            <a-select v-model="form.status" :options="statusOptions" allow-clear placeholder="状态" style="width: 140px" />
            <a-button type="primary" @click="fetchData(1)">查询</a-button>
          </div>
          <a-table :columns="columns" :data="data" :loading="loading" row-key="id" :pagination="false" :bordered="false" stripe>
            <template #refCount="{ record }">
              <a-button
                v-if="(record.refSchemeCount || 0) > 0"
                type="text"
                size="small"
                class="ref-count-link"
                @click="openRefSchemes(record)"
              >
                {{ record.refSchemeCount }}
              </a-button>
              <span v-else class="ref-count-link">0</span>
            </template>
            <template #status="{ record }">
              <a-tag :color="record.status === 'enabled' ? 'green' : 'orangered'" size="small">
                {{ record.status === 'enabled' ? '启用' : '停用' }}
              </a-tag>
            </template>
            <template #operations="{ record }">
              <a-space class="arco-table-ops" :size="2">
                <a-button type="text" size="small" @click="$router.push('/metadata/' + record.id)">详情</a-button>
                <a-button type="text" size="small" @click="openEdit(record)">编辑</a-button>
                <a-button type="text" size="small" @click="onToggle(record)">{{ record.status === 'enabled' ? '停用' : '启用' }}</a-button>
                <a-tooltip v-if="(record.refSchemeCount || 0) > 0" content="该字段已有方案引用，不可删除">
                  <span class="del-disabled-wrap">
                    <a-button type="text" status="danger" size="small" disabled>删除</a-button>
                  </span>
                </a-tooltip>
                <a-button v-else type="text" status="danger" size="small" @click="onDelete(record)">删除</a-button>
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
        </a-tab-pane>

        <a-tab-pane key="templates" title="快速模板">
          <div class="page-search">
            <a-input v-model="tplQuery.name" placeholder="模板名称/说明" allow-clear style="width: 220px" />
            <a-select
              v-model="tplQuery.type"
              :options="tplTypeOptions"
              allow-clear
              placeholder="模板类型"
              style="width: 140px"
            />
            <a-button type="primary" @click="fetchTemplates">查询</a-button>
          </div>
          <a-alert type="info" style="margin-bottom: 12px">
            系统内置模板不可删除；用户自定义模板可在此新增/编辑，也可在接入方案「字段库配置」中点选或「保存为模板」。
          </a-alert>
          <a-table
            :columns="tplColumns"
            :data="tplList"
            :loading="tplLoading"
            row-key="id"
            :pagination="false"
            :bordered="false"
            stripe
          >
            <template #type="{ record }">
              <a-tag :color="record.type === 'system' ? 'arcoblue' : 'orangered'" size="small">
                {{ record.typeLabel || (record.type === 'system' ? '系统内置' : '用户自定义') }}
              </a-tag>
            </template>
            <template #ops="{ record }">
              <a-space class="arco-table-ops" :size="2">
                <a-button type="text" size="small" @click="openTplDetail(record)">详情</a-button>
                <a-button v-if="record.type === 'custom'" type="text" size="small" @click="openTplEdit(record)">编辑</a-button>
                <a-tooltip v-if="record.type === 'system'" content="系统内置模板不可删除">
                  <span class="del-disabled-wrap">
                    <a-button type="text" status="danger" size="small" disabled>删除</a-button>
                  </span>
                </a-tooltip>
                <a-button v-else type="text" status="danger" size="small" @click="onDeleteTpl(record)">删除</a-button>
              </a-space>
            </template>
          </a-table>
        </a-tab-pane>
      </a-tabs>

      <a-modal v-model:visible="visible" :title="editor.id ? '编辑字段' : '新增字段'" :width="560" unmount-on-close :on-before-ok="onSubmit">
        <a-form ref="formRef" :model="editor" :rules="rules" layout="vertical">
          <a-form-item field="name" required>
            <template #label>
              <FormFieldLabel title="字段名" desc="英文字段标识，创建后不可修改" />
            </template>
            <a-input v-model="editor.name" placeholder="如 platform" :disabled="!!editor.id" />
          </a-form-item>
          <a-form-item field="description" required>
            <template #label>
              <FormFieldLabel title="描述" desc="字段业务含义说明" />
            </template>
            <a-textarea v-model="editor.description" placeholder="请输入" :auto-size="{ minRows: 2, maxRows: 4 }" />
          </a-form-item>
          <a-form-item field="dataType" label="数据类型" required>
            <a-select v-model="editor.dataType" :options="dataTypeOptions" placeholder="请选择" allow-create allow-clear />
          </a-form-item>
          <a-form-item>
            <template #label>
              <FormFieldLabel title="长度" desc="非必填，如 64" />
            </template>
            <a-input v-model="editor.length" placeholder="请输入" />
          </a-form-item>
          <a-form-item>
            <template #label>
              <FormFieldLabel title="缺省值" desc="非必填" />
            </template>
            <a-input v-model="editor.defaultValue" placeholder="请输入" />
          </a-form-item>
          <a-form-item>
            <template #label>
              <FormFieldLabel title="业务分类" desc="非必填：运维管理 / 文章 / 作者 / 平台 / 标注 / 其它" />
            </template>
            <a-select
              v-model="editor.bizCategory"
              :options="bizCategoryOptions"
              allow-clear
              placeholder="请选择"
            />
          </a-form-item>
          <a-form-item>
            <template #label>
              <FormFieldLabel title="备注" desc="可选" />
            </template>
            <a-textarea v-model="editor.remark" placeholder="请输入" :auto-size="{ minRows: 2, maxRows: 4 }" />
          </a-form-item>
        </a-form>
      </a-modal>

      <a-modal
        v-model:visible="refVisible"
        :title="refTitle"
        :width="720"
        :footer="false"
        unmount-on-close
      >
        <a-table
          :columns="refColumns"
          :data="refSchemes"
          :loading="refLoading"
          row-key="id"
          :pagination="false"
          :bordered="false"
          stripe
        >
          <template #scope="{ record }">
            {{ record.scope === 'org' ? '机构' : '全局' }}
          </template>
          <template #status="{ record }">
            <a-tag :color="record.status === 'enabled' ? 'green' : 'orangered'" size="small">
              {{ record.status === 'enabled' ? '启用' : '停用' }}
            </a-tag>
          </template>
          <template #ops="{ record }">
            <a-button type="text" size="small" @click="goScheme(record.id)">查看方案</a-button>
          </template>
        </a-table>
        <a-empty v-if="!refLoading && !refSchemes.length" description="暂无引用该字段的接入方案" />
      </a-modal>

      <a-modal
        v-model:visible="tplDetailVisible"
        :title="tplDetail?.name || '模板详情'"
        :width="720"
        :footer="false"
        unmount-on-close
      >
        <a-descriptions v-if="tplDetail" :column="2" bordered size="large" style="margin-bottom: 16px">
          <a-descriptions-item label="模板名称">{{ tplDetail.name }}</a-descriptions-item>
          <a-descriptions-item label="模板类型">
            {{ tplDetail.type === 'system' ? '系统内置' : '用户自定义' }}
          </a-descriptions-item>
          <a-descriptions-item label="字段数">{{ tplDetail.fieldIds?.length || 0 }}</a-descriptions-item>
          <a-descriptions-item label="更新时间">{{ tplDetail.updatedAt || '—' }}</a-descriptions-item>
          <a-descriptions-item label="模板说明" :span="2">{{ tplDetail.desc || '—' }}</a-descriptions-item>
        </a-descriptions>
        <a-table
          :columns="tplFieldColumns"
          :data="tplDetailFields"
          row-key="id"
          :pagination="false"
          :bordered="false"
          stripe
          size="small"
        />
      </a-modal>

      <a-modal
        v-model:visible="tplEditVisible"
        :title="tplEditor.id ? '编辑快速模板' : '新增快速模板'"
        :width="860"
        unmount-on-close
        :on-before-ok="onSubmitTpl"
      >
        <a-form ref="tplFormRef" :model="tplEditor" :rules="tplRules" layout="vertical">
          <a-form-item field="name" label="模板名称" required>
            <a-input v-model="tplEditor.name" placeholder="请输入模板名称" :max-length="50" allow-clear />
          </a-form-item>
          <a-form-item field="desc" label="模板说明">
            <a-textarea
              v-model="tplEditor.desc"
              placeholder="可选，说明适用场景"
              :auto-size="{ minRows: 2, maxRows: 4 }"
              :max-length="200"
              allow-clear
            />
          </a-form-item>
          <a-form-item label="字段配置" required>
            <FieldPicker
              v-model="tplEditor.fieldIds"
              :fields="tplPickerFields"
              hide-template-panel
              hide-save-as-template
            />
          </a-form-item>
          <a-alert type="info">保存后类型为「用户自定义」，可在接入方案第 2 步字段库配置中选用。</a-alert>
        </a-form>
      </a-modal>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Message, Modal, type FormInstance } from '@arco-design/web-vue'
import FormFieldLabel from '@/components/FormFieldLabel.vue'
import FieldPicker, { type PickerField } from '@/components/FieldPicker.vue'
import {
  deleteFieldTemplate,
  deleteMetadata,
  listFieldTemplates,
  listMetadata,
  listStandardsByField,
  saveFieldTemplate,
  saveMetadata,
  toggleMetadata,
} from '@/api/mt'
import {
  bizCategoryOptions,
  dataTypeOptions,
  type FieldTemplate,
  type Metadata,
  type Standard,
  type Status,
} from '@/mock/mt'
import { clearFormValidate, validateForm } from '@/utils/formValidate'

const router = useRouter()
const activeTab = ref('fields')
const statusOptions = [
  { label: '启用', value: 'enabled' },
  { label: '停用', value: 'disabled' },
]
const tplTypeOptions = [
  { label: '系统内置', value: 'system' },
  { label: '用户自定义', value: 'custom' },
]
const form = reactive({ name: '', bizCategory: '', status: '' })
const data = ref<Metadata[]>([])
const loading = ref(false)
const pagination = reactive({ current: 1, pageSize: 10, total: 0 })
const visible = ref(false)
const formRef = ref<FormInstance>()
const emptyEditor = (): Metadata => ({
  id: '',
  name: '',
  code: '',
  description: '',
  bizCaliber: '',
  dataType: 'String',
  required: null,
  length: '',
  defaultValue: '',
  bizCategory: '',
  remark: '',
  status: 'enabled',
  updatedAt: '',
})
const editor = reactive<Metadata>(emptyEditor())
const refVisible = ref(false)
const refLoading = ref(false)
const refField = ref<Metadata | null>(null)
const refSchemes = ref<Standard[]>([])

const tplQuery = reactive({ name: '', type: '' as '' | 'system' | 'custom' })
const tplList = ref<FieldTemplate[]>([])
const tplLoading = ref(false)
const tplDetailVisible = ref(false)
const tplDetail = ref<FieldTemplate | null>(null)
const tplDetailFields = ref<Metadata[]>([])
const tplEditVisible = ref(false)
const tplFormRef = ref<FormInstance>()
const tplEditor = reactive({ id: '', name: '', desc: '', fieldIds: [] as string[] })
const tplPickerFields = ref<PickerField[]>([])
const tplRules = {
  name: [{ required: true, message: '请填写模板名称' }],
}

const rules = {
  name: [{ required: true, message: '请填写字段名' }],
  description: [{ required: true, message: '请填写描述' }],
  dataType: [{ required: true, message: '请选择数据类型' }],
}
const columns = [
  { title: '字段名', dataIndex: 'name', width: 150, ellipsis: true, tooltip: true },
  { title: '描述', dataIndex: 'description', ellipsis: true, tooltip: true },
  { title: '引用方案数量', dataIndex: 'refSchemeCount', slotName: 'refCount', width: 120 },
  { title: '数据类型', dataIndex: 'dataType', width: 96 },
  { title: '业务分类', dataIndex: 'bizCategory', width: 96 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 72 },
  { title: '更新时间', dataIndex: 'updatedAt', width: 160 },
  { title: '操作', dataIndex: 'operations', slotName: 'operations', width: 232 },
]
const tplColumns = [
  { title: '模板名称', dataIndex: 'name', width: 220, ellipsis: true, tooltip: true },
  { title: '模板说明', dataIndex: 'desc', ellipsis: true, tooltip: true },
  { title: '字段数', dataIndex: 'fieldCount', width: 88 },
  { title: '模板类型', dataIndex: 'type', slotName: 'type', width: 120 },
  { title: '更新时间', dataIndex: 'updatedAt', width: 160 },
  { title: '操作', dataIndex: 'ops', slotName: 'ops', width: 180 },
]
const tplFieldColumns = [
  { title: '字段名', dataIndex: 'name', width: 160 },
  { title: '描述', dataIndex: 'description', ellipsis: true, tooltip: true },
  { title: '数据类型', dataIndex: 'dataType', width: 96 },
  { title: '业务分类', dataIndex: 'bizCategory', width: 100 },
]
const refColumns = [
  { title: '方案名称', dataIndex: 'name', ellipsis: true, tooltip: true },
  { title: '范围', dataIndex: 'scope', slotName: 'scope', width: 72 },
  { title: '机构', dataIndex: 'orgName', width: 120, ellipsis: true, tooltip: true },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 72 },
  { title: '发布时间', dataIndex: 'uploadedAt', width: 160 },
  { title: '操作', dataIndex: 'ops', slotName: 'ops', width: 100 },
]
const refTitle = computed(() =>
  refField.value ? `引用方案 · ${refField.value.name}` : '引用方案列表',
)

async function fetchData(page = pagination.current) {
  loading.value = true
  try {
    const res = await listMetadata({ ...form, page, pageSize: pagination.pageSize })
    data.value = res.list
    pagination.current = page
    pagination.total = res.total
  } finally {
    loading.value = false
  }
}
async function fetchTemplates() {
  tplLoading.value = true
  try {
    const list = await listFieldTemplates({
      name: tplQuery.name || undefined,
      type: tplQuery.type || undefined,
    })
    tplList.value = list
  } finally {
    tplLoading.value = false
  }
}
function onTabChange(key: string | number) {
  if (key === 'templates') fetchTemplates()
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
function openEdit(record: Metadata) {
  Object.assign(editor, emptyEditor(), record, {
    description: record.description || record.bizCaliber || '',
  })
  visible.value = true
  nextTick(() => clearFormValidate(formRef.value))
}
async function openRefSchemes(record: Metadata) {
  refField.value = record
  refVisible.value = true
  refLoading.value = true
  refSchemes.value = []
  try {
    refSchemes.value = await listStandardsByField(record.id)
  } finally {
    refLoading.value = false
  }
}
function goScheme(id: string) {
  refVisible.value = false
  router.push('/standard/' + id)
}
async function ensureTplPickerFields() {
  if (tplPickerFields.value.length) return
  const all = await listMetadata({ name: '', status: 'enabled', page: 1, pageSize: 500 })
  tplPickerFields.value = all.list.map((f) => ({
    id: f.id,
    name: f.name,
    description: f.description || f.bizCaliber || '',
    dataType: f.dataType,
    bizCategory: f.bizCategory || '',
  }))
}
async function openTplCreate() {
  await ensureTplPickerFields()
  Object.assign(tplEditor, { id: '', name: '', desc: '', fieldIds: [] as string[] })
  tplEditVisible.value = true
  nextTick(() => clearFormValidate(tplFormRef.value))
}
async function openTplDetail(record: FieldTemplate) {
  tplDetail.value = record
  tplDetailVisible.value = true
  const all = await listMetadata({ name: '', status: '', page: 1, pageSize: 500 })
  const idSet = new Set(record.fieldIds || [])
  tplDetailFields.value = all.list.filter((f) => idSet.has(f.id))
}
async function openTplEdit(record: FieldTemplate) {
  await ensureTplPickerFields()
  Object.assign(tplEditor, {
    id: record.id,
    name: record.name,
    desc: record.desc || '',
    fieldIds: [...(record.fieldIds || [])],
  })
  tplEditVisible.value = true
  nextTick(() => clearFormValidate(tplFormRef.value))
}
async function onSubmitTpl() {
  if (!(await validateForm(tplFormRef.value))) return false
  if (!tplEditor.fieldIds.length) {
    Message.warning('请至少选择一个字段')
    return false
  }
  try {
    await saveFieldTemplate({
      id: tplEditor.id || undefined,
      name: tplEditor.name.trim(),
      desc: tplEditor.desc.trim(),
      fieldIds: tplEditor.fieldIds,
    })
    Message.success('保存成功')
    fetchTemplates()
    return true
  } catch (e) {
    Message.error((e as Error).message)
    return false
  }
}
function onDeleteTpl(record: FieldTemplate) {
  Modal.confirm({
    title: '删除模板',
    content: `确定删除快速模板「${record.name}」？`,
    async onOk() {
      try {
        await deleteFieldTemplate(record.id)
        Message.success('已删除')
        fetchTemplates()
      } catch (e) {
        Message.warning((e as Error).message || '删除失败')
      }
    },
  })
}
async function onSubmit() {
  if (!(await validateForm(formRef.value))) return false
  try {
    await saveMetadata({
      ...editor,
      required: null,
      code: editor.name.trim(),
      bizCaliber: editor.description.trim(),
    })
    Message.success('保存成功')
    fetchData(pagination.current)
    return true
  } catch (e) {
    Message.error((e as Error).message)
    return false
  }
}
function onToggle(record: Metadata) {
  const next: Status = record.status === 'enabled' ? 'disabled' : 'enabled'
  Modal.confirm({
    title: '变更状态',
    content: `确定${next === 'enabled' ? '启用' : '停用'}「${record.name}」？停用后不可被新接入标准勾选。`,
    async onOk() {
      await toggleMetadata(record.id, next)
      Message.success('已更新')
      fetchData(pagination.current)
    },
  })
}
function onDelete(record: Metadata) {
  Modal.confirm({
    title: '删除字段',
    content: `确定删除「${record.name}」？已被接入标准引用时不可删除。`,
    async onOk() {
      const res = await deleteMetadata(record.id)
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
.ref-count-link {
  padding: 0 4px;
  font-weight: 400;
  color: rgb(var(--primary-6, 22, 93, 255));
}
.ref-count-link:deep(.arco-btn-text),
.ref-count-link.arco-btn-text {
  font-weight: 400;
  color: rgb(var(--primary-6, 22, 93, 255));
}
.del-disabled-wrap {
  display: inline-block;
  cursor: not-allowed;
}
</style>
