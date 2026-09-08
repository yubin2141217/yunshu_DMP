<template>
  <div class="page-shell edit-page">
    <div class="page-head">
      <div>
        <h2 class="page-title">{{ isEdit ? '编辑接入方案' : '新增接入方案' }}</h2>
        <p class="page-desc">按步骤配置基础信息、字段库与接口接入方式；提交后自动生成接口文档。</p>
      </div>
      <a-space>
        <a-button @click="goBack">返回列表</a-button>
      </a-space>
    </div>

    <a-card class="content-card edit-card" :bordered="false">
      <div class="edit-card-inner">
        <div class="edit-main">
          <div class="edit-center">
            <a-steps :current="step" class="edit-steps">
              <a-step title="基础信息" description="名称 / 范围 / 状态等" />
              <a-step title="字段库配置" description="勾选送数字段" />
              <a-step title="接入方式" description="接口推送参数" />
            </a-steps>

            <a-form ref="formRef" :model="editor" :rules="rules" layout="vertical" class="edit-form">
              <div v-show="step === 1">
                <a-row :gutter="16">
                  <a-col :span="12">
                    <a-form-item field="name" label="方案名称" required>
                      <a-input v-model="editor.name" placeholder="如：云数中台全局接入方案 V1" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item field="status" label="状态" required>
                      <a-select v-model="editor.status" :options="statusOpts" />
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-form-item field="scope" label="范围" required>
                  <a-radio-group v-model="editor.scope">
                    <a-radio value="global">全局</a-radio>
                    <a-radio value="org">机构</a-radio>
                  </a-radio-group>
                </a-form-item>
                <a-form-item v-if="editor.scope === 'org'" field="orgId" label="机构" required>
                  <a-select v-model="editor.orgId" :options="orgOpts" placeholder="选择机构" />
                </a-form-item>
                <a-form-item>
                  <template #label>
                    <FormFieldLabel
                      title="IP 白名单管控"
                      desc="开启后须在「IP 白名单」维护数据提供厂商的来源IP，非名单内IP推送请求将被拒绝"
                    />
                  </template>
                  <a-switch v-model="editor.requireIpWhitelist" />
                </a-form-item>
                <a-form-item label="备注">
                  <a-textarea v-model="editor.remark" placeholder="可选补充说明" :auto-size="{ minRows: 2, maxRows: 4 }" />
                </a-form-item>
              </div>

              <div v-show="step === 2">
                <a-form-item field="fieldIds" label="字段库配置" required>
                  <FieldPicker v-model="editor.fieldIds" :fields="metaFields" />
                </a-form-item>
              </div>

              <div v-show="step === 3">
                <a-alert type="info" style="margin-bottom: 16px">
                  本期仅支持「接口推送」一种接入方式。供数方凭 appkey 鉴权并推送 JSON 报文。
                </a-alert>
                <a-row :gutter="16">
                  <a-col :span="8">
                    <a-form-item field="apiAccess.protocol" label="协议" required>
                      <a-select
                        v-model="editor.apiAccess.protocol"
                        :options="[
                          { label: 'HTTPS', value: 'HTTPS' },
                          { label: 'HTTP', value: 'HTTP' },
                        ]"
                      />
                    </a-form-item>
                  </a-col>
                  <a-col :span="8">
                    <a-form-item field="apiAccess.method" label="HTTP 方法" required>
                      <a-select
                        v-model="editor.apiAccess.method"
                        :options="[
                          { label: 'POST', value: 'POST' },
                          { label: 'PUT', value: 'PUT' },
                          { label: 'PATCH', value: 'PATCH' },
                        ]"
                      />
                    </a-form-item>
                  </a-col>
                  <a-col :span="8">
                    <a-form-item field="apiAccess.contentType" label="Content-Type" required>
                      <a-input v-model="editor.apiAccess.contentType" placeholder="application/json" />
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-form-item field="apiAccess.baseUrl" label="Base URL" required>
                  <a-input v-model="editor.apiAccess.baseUrl" placeholder="https://api.yunshu.example.com" />
                </a-form-item>
                <a-form-item field="apiAccess.path" label="接口 Path" required>
                  <a-input v-model="editor.apiAccess.path" placeholder="/api/v1/articles/push" />
                </a-form-item>
                <a-form-item label="完整地址预览">
                  <a-input :model-value="endpointPreview" readonly />
                </a-form-item>
                <a-row :gutter="16">
                  <a-col :span="12">
                    <a-form-item field="apiAccess.authType" label="鉴权方式" required>
                      <a-select v-model="editor.apiAccess.authType" :options="apiAuthTypeOptions" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item field="apiAccess.authHeaderName" label="鉴权 Header 名" required>
                      <a-input v-model="editor.apiAccess.authHeaderName" placeholder="X-App-Key" />
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-row :gutter="16">
                  <a-col :span="8">
                    <a-form-item field="apiAccess.charset" label="字符集">
                      <a-input v-model="editor.apiAccess.charset" placeholder="UTF-8" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="8">
                    <a-form-item field="apiAccess.timeoutSec" label="超时（秒）">
                      <a-input-number v-model="editor.apiAccess.timeoutSec" :min="1" :max="300" style="width: 100%" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="8">
                    <a-form-item field="apiAccess.retry" label="失败重试次数">
                      <a-input-number v-model="editor.apiAccess.retry" :min="0" :max="10" style="width: 100%" />
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-row :gutter="16">
                  <a-col :span="8">
                    <a-form-item field="apiAccess.rateLimitQps" label="限流 QPS">
                      <a-input-number v-model="editor.apiAccess.rateLimitQps" :min="1" :max="10000" style="width: 100%" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="8">
                    <a-form-item field="apiAccess.batchMaxSize" label="单批最大条数">
                      <a-input-number v-model="editor.apiAccess.batchMaxSize" :min="1" :max="5000" style="width: 100%" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="8">
                    <a-form-item field="apiAccess.idempotencyHeader" label="幂等 Header">
                      <a-input v-model="editor.apiAccess.idempotencyHeader" placeholder="X-Idempotency-Key" />
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-row :gutter="16">
                  <a-col :span="12">
                    <a-form-item field="apiAccess.successCodePath" label="成功码字段路径">
                      <a-input v-model="editor.apiAccess.successCodePath" placeholder="code" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item field="apiAccess.successCodeValue" label="成功码取值">
                      <a-input v-model="editor.apiAccess.successCodeValue" placeholder="0" />
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-form-item class="request-example-item" hide-label>
                  <div class="request-example">
                    <div class="request-example__head">
                      <div class="request-example__title-wrap">
                        <span class="request-example__title">请求示例</span>
                        <span class="request-example__tip">按当前接入参数与已选字段生成请求报文格式</span>
                      </div>
                      <a-button type="outline" size="small" @click="onGenerateExample">生成示例</a-button>
                    </div>
                    <a-textarea
                      v-model="requestExample"
                      placeholder="点击右上角「生成示例」生成请求报文内容格式"
                      :auto-size="{ minRows: 12, maxRows: 20 }"
                      class="request-example__input"
                    />
                  </div>
                </a-form-item>
              </div>
            </a-form>
          </div>
        </div>

        <div class="edit-actions">
          <a-space>
            <a-button v-if="step > 1" @click="step -= 1">上一步</a-button>
            <a-button v-if="step === 3" @click="onPreviewScheme">方案预览</a-button>
            <a-button v-if="step < 3" type="primary" @click="onNext">下一步</a-button>
            <a-button v-else type="primary" :loading="saving" @click="onSubmit">提交</a-button>
          </a-space>
        </div>
      </div>
    </a-card>

    <a-modal
      v-model:visible="previewVisible"
      title="方案预览"
      :width="900"
      :footer="false"
      unmount-on-close
      modal-class="scheme-preview-modal"
    >
      <div class="doc-stage">
        <article class="doc-sheet">
          <pre class="doc-md">{{ previewMarkdown }}</pre>
        </article>
      </div>
      <div class="doc-actions">
        <a-button type="primary" @click="previewVisible = false">关闭</a-button>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message, type FormInstance } from '@arco-design/web-vue'
import FormFieldLabel from '@/components/FormFieldLabel.vue'
import FieldPicker, { type PickerField } from '@/components/FieldPicker.vue'
import { getStandard, listStandards, saveStandard } from '@/api/mt'
import {
  apiAuthTypeOptions,
  buildApiDocMarkdown,
  buildApiEndpoint,
  buildRequestExample,
  defaultApiAccess,
  type ApiAccessConfig,
  type StandardScope,
  type Status,
} from '@/mock/mt'
import { validateForm } from '@/utils/formValidate'

const route = useRoute()
const router = useRouter()
const step = ref(1)
const saving = ref(false)
const formRef = ref<FormInstance>()
const metaFields = ref<PickerField[]>([])
const orgOpts = ref<{ label: string; value: string }[]>([])
const requestExample = ref('')
const previewVisible = ref(false)
const previewMarkdown = ref('')
const statusOpts = [
  { label: '开启', value: 'enabled' },
  { label: '停用', value: 'disabled' },
]

const editor = reactive({
  id: '',
  name: '',
  scope: 'global' as StandardScope,
  orgId: '',
  status: 'enabled' as Status,
  requireIpWhitelist: false,
  remark: '',
  fieldIds: [] as string[],
  apiAccess: defaultApiAccess() as ApiAccessConfig,
})

function resetEditor() {
  Object.assign(editor, {
    id: '',
    name: '',
    scope: 'global' as StandardScope,
    orgId: '',
    status: 'enabled' as Status,
    requireIpWhitelist: false,
    remark: '',
    fieldIds: [] as string[],
    apiAccess: defaultApiAccess() as ApiAccessConfig,
  })
  requestExample.value = ''
  step.value = 1
}

const isEdit = computed(() => !!editor.id)
const endpointPreview = computed(() => buildApiEndpoint(editor.apiAccess))

const selectedFields = computed(() =>
  editor.fieldIds
    .map((id) => metaFields.value.find((f) => f.id === id))
    .filter(Boolean)
    .map((f) => ({
      name: f!.name,
      description: f!.description,
      dataType: f!.dataType,
      bizCategory: f!.bizCategory,
    })),
)

const rules = {
  name: [{ required: true, message: '请填写方案名称' }],
  status: [{ required: true, message: '请选择状态' }],
  scope: [{ required: true, message: '请选择范围' }],
  orgId: [
    {
      validator: (value: string, callback: (error?: string) => void) => {
        if (editor.scope === 'org' && !value) callback('请选择机构')
        else callback()
      },
    },
  ],
  fieldIds: [
    {
      validator: (value: string[], callback: (error?: string) => void) => {
        if (!value?.length) callback('请至少勾选一个字段')
        else callback()
      },
    },
  ],
  'apiAccess.baseUrl': [{ required: true, message: '请填写 Base URL' }],
  'apiAccess.path': [{ required: true, message: '请填写接口 Path' }],
  'apiAccess.protocol': [{ required: true, message: '请选择协议' }],
  'apiAccess.method': [{ required: true, message: '请选择方法' }],
  'apiAccess.authType': [{ required: true, message: '请选择鉴权方式' }],
  'apiAccess.authHeaderName': [{ required: true, message: '请填写鉴权 Header' }],
  'apiAccess.contentType': [{ required: true, message: '请填写 Content-Type' }],
}

function goBack() {
  router.push('/standard')
}

function onGenerateExample() {
  if (!editor.fieldIds.length) {
    Message.warning('请先在字段库配置中勾选字段')
    return
  }
  requestExample.value = buildRequestExample(editor.apiAccess, selectedFields.value)
  Message.success('已生成请求示例')
}

function onPreviewScheme() {
  const orgName = orgOpts.value.find((o) => o.value === editor.orgId)?.label || ''
  previewMarkdown.value = buildApiDocMarkdown({
    name: editor.name.trim() || '未命名接入方案',
    scope: editor.scope,
    orgName: editor.scope === 'org' ? orgName : '',
    requireIpWhitelist: editor.requireIpWhitelist,
    remark: editor.remark,
    fields: selectedFields.value,
    api: editor.apiAccess,
  })
  previewVisible.value = true
}

async function loadOptions() {
  const res = await listStandards({ name: '', status: '', page: 1, pageSize: 1 })
  metaFields.value = res.metadata.map((m) => ({
    id: m.id,
    name: m.name,
    description: m.description || m.bizCaliber || '',
    dataType: m.dataType,
    bizCategory: m.bizCategory || '',
  }))
  orgOpts.value = res.orgs
}

async function loadDetail() {
  const id = String(route.params.id || '')
  if (!id) {
    resetEditor()
    return
  }
  const item = await getStandard(id)
  if (!item) {
    Message.error('未找到接入方案')
    goBack()
    return
  }
  Object.assign(editor, {
    id: item.id,
    name: item.name,
    scope: item.scope || 'global',
    orgId: item.orgId || '',
    status: item.status === 'disabled' ? 'disabled' : 'enabled',
    requireIpWhitelist: !!item.requireIpWhitelist,
    remark: item.remark || '',
    fieldIds: [...(item.fieldIds || [])],
    apiAccess: { ...defaultApiAccess(), ...(item.apiAccess || {}) },
  })
  requestExample.value = buildRequestExample(editor.apiAccess, selectedFields.value)
}

watch(
  () => String(route.params.id || ''),
  async () => {
    await loadDetail()
  },
)

async function onNext() {
  const fieldsByStep: Record<number, string[]> = {
    1: editor.scope === 'org' ? ['name', 'status', 'scope', 'orgId'] : ['name', 'status', 'scope'],
    2: ['fieldIds'],
  }
  const ok = await validateForm(formRef.value, fieldsByStep[step.value])
  if (!ok) return
  step.value += 1
  if (step.value === 3 && !requestExample.value) {
    requestExample.value = buildRequestExample(editor.apiAccess, selectedFields.value)
  }
}

async function onSubmit() {
  if (!(await validateForm(formRef.value))) return
  saving.value = true
  try {
    const item = await saveStandard({
      id: editor.id || undefined,
      name: editor.name,
      scope: editor.scope,
      orgId: editor.scope === 'org' ? editor.orgId : undefined,
      status: editor.status,
      requireIpWhitelist: editor.requireIpWhitelist,
      remark: editor.remark,
      fieldIds: editor.fieldIds,
      apiAccess: editor.apiAccess,
    })
    Message.success('已保存并生成接口文档')
    router.replace({ path: '/standard', query: { preview: item.id } })
  } catch (e) {
    Message.error((e as Error).message)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await loadOptions()
  await loadDetail()
})
</script>

<style scoped>
.edit-page {
  min-height: calc(100vh - 120px);
}

.edit-card-inner {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 220px);
}

.edit-main {
  flex: 1;
  display: flex;
  justify-content: center;
  padding-bottom: 8px;
}

.edit-center {
  width: 100%;
  max-width: 880px;
}

.edit-steps {
  margin-bottom: 28px;
}

.edit-form {
  width: 100%;
}

.request-example-item :deep(.arco-form-item-label-col) {
  display: none;
}

.request-example-item :deep(.arco-form-item-wrapper-col) {
  flex: 1 1 100%;
  width: 100%;
  max-width: 100%;
}

.request-example {
  width: 100%;
  border: 1px solid var(--color-border-2, #e5e6eb);
  border-radius: 6px;
  background: #fff;
  overflow: hidden;
}

.request-example__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--color-border-2, #e5e6eb);
  background: #fafbfc;
}

.request-example__title-wrap {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.request-example__title {
  font-size: 13px;
  font-weight: 600;
  color: #1d2129;
  line-height: 1.4;
}

.request-example__tip {
  font-size: 12px;
  color: #86909c;
  line-height: 1.4;
}

.request-example__input {
  display: block;
  width: 100%;
}

.request-example__input :deep(.arco-textarea-wrapper),
.request-example__input :deep(textarea) {
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  background: #f7f8fa;
}

.request-example__input :deep(textarea) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 13px;
  line-height: 1.55;
  padding: 12px 14px;
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
  padding: 16px 0 4px;
  border-top: 1px solid var(--color-border-2, #e5e6eb);
  background: #fff;
  position: sticky;
  bottom: 0;
  z-index: 2;
}

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
.scheme-preview-modal .arco-modal-body {
  padding: 0 !important;
}
</style>
