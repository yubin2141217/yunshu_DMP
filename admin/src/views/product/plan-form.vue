<!-- 新建/编辑方案（二级页，字段与新建弹窗保持一致） -->
<template>
  <div class="biz-detail-page plan-form-page">
    <ElCard shadow="never" class="biz-breadcrumb-card">
      <div class="biz-header-row">
        <ElButton text :icon="ArrowLeft" @click="router.push('/product/plans')">返回</ElButton>
        <span class="title">{{ isEdit ? '编辑方案' : '新建方案' }}</span>
      </div>
    </ElCard>

    <ElCard shadow="never" class="biz-section-card form-card" v-loading="pageLoading">
      <ElScrollbar>
        <ElForm ref="formRef" :model="form" :rules="rules" label-width="176px" class="plan-form">
          <ElFormItem label="所属产品" prop="productId">
            <ElSelect
              v-model="form.productId"
              filterable
              placeholder="请选择产品"
              :disabled="isEdit || Boolean(presetProductId)"
              class="form-control-full"
            >
              <ElOption
                v-for="item in productOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </ElSelect>
          </ElFormItem>

          <ElFormItem label="同机构是否可重复申请" prop="allowRepeatApply">
            <ElRadioGroup v-model="form.allowRepeatApply">
              <ElRadio :value="false">否</ElRadio>
              <ElRadio :value="true">是</ElRadio>
            </ElRadioGroup>
          </ElFormItem>

          <ElFormItem label="方案名称" prop="name">
            <ElInput
              v-model="form.name"
              maxlength="20"
              show-word-limit
              placeholder="请输入方案名称，如:基础版"
            />
          </ElFormItem>

          <ElFormItem label="方案介绍" prop="intro">
            <ElInput
              v-model="form.intro"
              type="textarea"
              :rows="3"
              maxlength="200"
              show-word-limit
              placeholder="请输入方案介绍，例如:开通信息等"
            />
          </ElFormItem>

          <ElFormItem label="试用时间" prop="trialTimeType">
            <ElRadioGroup v-model="form.trialTimeType">
              <ElRadio value="1m">1个月</ElRadio>
              <ElRadio value="2m">2个月</ElRadio>
              <ElRadio value="3m">3个月</ElRadio>
              <ElRadio value="custom">自定义</ElRadio>
            </ElRadioGroup>
            <template v-if="form.trialTimeType === 'custom'">
              <ElInputNumber
                v-model="form.trialDays"
                :min="1"
                :max="90"
                :controls="false"
                class="custom-num"
              />
              <span class="unit">天</span>
            </template>
          </ElFormItem>

          <ElFormItem label="可延期次数" prop="extensionType">
            <ElRadioGroup v-model="form.extensionType" @change="() => syncFreezeDays()">
              <ElRadio value="0">0次</ElRadio>
              <ElRadio value="1">1次</ElRadio>
              <ElRadio value="2">2次</ElRadio>
              <ElRadio value="3">3次</ElRadio>
              <ElRadio value="custom">自定义</ElRadio>
            </ElRadioGroup>
            <ElSelect
              v-if="form.extensionType === 'custom'"
              v-model="form.extensionCount"
              class="custom-ext"
              @change="() => syncFreezeDays()"
            >
              <ElOption v-for="n in customExtOptions" :key="n" :label="`${n}次`" :value="n" />
            </ElSelect>
            <div class="form-field-hint">1次延期默认为30天</div>
          </ElFormItem>

          <ElFormItem v-if="showFreezeRules" required>
            <template #label>
              <span class="freeze-label">
                冷冻期规则
                <ElTooltip
                  content="试用到期后自动进入冷冻期，冷冻期内不允许申请延期"
                  placement="top"
                >
                  <ElIcon class="freeze-info"><InfoFilled /></ElIcon>
                </ElTooltip>
              </span>
            </template>
            <div class="freeze-tip">试用到期后自动进入冷冻期，冷冻期内不允许申请延期</div>
            <ElTable :data="freezeTableRows" border size="small" class="freeze-table">
              <ElTableColumn type="index" label="序号" width="64" align="center" />
              <ElTableColumn label="冷冻期规则" min-width="280">
                <template #default>试用期结束后，可再次发起延期的间隔时长为</template>
              </ElTableColumn>
              <ElTableColumn label="时间（天）" width="140" align="center">
                <template #default="{ $index }">
                  <ElInputNumber
                    v-model="form.freezeDays[$index]"
                    :min="0"
                    :max="90"
                    :controls="false"
                    style="width: 88px"
                  />
                </template>
              </ElTableColumn>
            </ElTable>
          </ElFormItem>

          <ElFormItem label="方案处理人" prop="handler">
            <ElSelect
              v-model="form.handler"
              filterable
              clearable
              placeholder="请选择方案处理人"
              style="width: 280px"
            >
              <ElOption v-for="item in handlers" :key="item" :label="item" :value="item" />
            </ElSelect>
          </ElFormItem>

          <ElFormItem label="方案接入API" prop="accessApi">
            <div class="api-field">
              <div class="api-input-row">
                <ElInput
                  v-model="form.accessApi"
                  maxlength="1000"
                  placeholder="请输入方案接入API"
                  style="width: 420px"
                />
                <ElButton @click="handleTestApi">测试</ElButton>
                <span v-if="testSuccessVisible" class="api-test-ok">测试成功！</span>
              </div>
              <div class="api-tip">
                <ElIcon><InfoFilled /></ElIcon>
                <span class="api-tip-text">
                  测试状态码返回200，即为成功。接入说明可查看
                  <ElLink
                    type="primary"
                    :underline="false"
                    :href="ACCESS_DOC_URL"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    《接入文档说明》
                  </ElLink>
                  ，登记表可查看
                  <ElLink
                    type="primary"
                    :underline="false"
                    :href="PLAN_API_REGISTER_URL"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    《方案API登记表》
                  </ElLink>
                </span>
              </div>
            </div>
          </ElFormItem>

          <ElFormItem label="附加配置">
            <div class="custom-config-block">
              <div class="custom-config-tip">
                添加附加配置后，申请方选择该方案后可配置附加信息，当前最多支持6条附加项。
              </div>
              <div
                v-for="(item, idx) in form.customConfigs"
                :key="idx"
                class="custom-config-card"
              >
                <div class="custom-config-row">
                  <ElFormItem
                    :prop="`customConfigs.${idx}.name`"
                    :rules="[{ required: true, message: '请输入选项名称', trigger: 'blur' }]"
                    label-width="0"
                    class="cfg-field"
                  >
                    <ElInput
                      v-model="item.name"
                      maxlength="20"
                      show-word-limit
                      placeholder="选项名称"
                      class="cfg-name"
                    />
                  </ElFormItem>
                  <ElSelect
                    v-model="item.control"
                    placeholder="控件"
                    class="cfg-control"
                    @change="() => handleControlChange(item)"
                  >
                    <ElOption
                      v-for="opt in controlOptions"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                    />
                  </ElSelect>
                  <ElFormItem
                    :prop="`customConfigs.${idx}.required`"
                    :rules="[{ required: true, message: '请选择是否必填', trigger: 'change' }]"
                    label-width="0"
                    class="cfg-field"
                  >
                    <ElSelect
                      v-model="item.required"
                      placeholder="请选择"
                      class="cfg-required"
                      @change="() => handleRequiredChange(item)"
                    >
                      <ElOption :value="true" label="必填" />
                      <ElOption :value="false" label="非必填" />
                    </ElSelect>
                  </ElFormItem>
                  <ElInput
                    v-model="item.tip"
                    maxlength="20"
                    show-word-limit
                    placeholder="提示信息"
                    class="cfg-tip"
                  />
                  <ElButton link type="danger" @click="removeCustomConfig(idx)">删除</ElButton>
                </div>
                <div
                  v-if="item.control === 'radio' || item.control === 'checkbox'"
                  class="options-block"
                >
                  <div class="options-label">选项内容（必填，最多 6 个）</div>
                  <div v-for="(opt, oIdx) in item.options" :key="oIdx" class="option-row">
                    <ElInput
                      v-model="item.options[oIdx]"
                      maxlength="50"
                      :placeholder="`选项 ${oIdx + 1}`"
                      style="width: 220px"
                    />
                    <template v-if="item.required">
                      <span v-if="item.defaultIndexes.includes(oIdx)" class="option-default-tag">
                        默认值
                      </span>
                      <ElButton
                        v-else
                        link
                        type="primary"
                        @click="setDefaultOption(item, oIdx)"
                      >
                        设为默认值
                      </ElButton>
                    </template>
                    <ElButton
                      link
                      type="danger"
                      :disabled="item.options.length <= 1"
                      @click="removeOption(item, oIdx)"
                      >删除</ElButton
                    >
                  </div>
                  <ElButton
                    link
                    type="primary"
                    :disabled="item.options.length >= 6"
                    @click="addOption(item)"
                    >添加选项</ElButton
                  >
                </div>
              </div>
              <ElButton
                type="primary"
                link
                :icon="Plus"
                :disabled="form.customConfigs.length >= 6"
                @click="addCustomConfig"
                >添加配置项</ElButton
              >
            </div>
          </ElFormItem>

          <ElFormItem>
            <ElButton @click="router.push('/product/plans')">取消</ElButton>
            <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">保存</ElButton>
          </ElFormItem>
        </ElForm>
      </ElScrollbar>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ArrowLeft, InfoFilled, Plus } from '@element-plus/icons-vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import {
    createPlan,
    fetchPlanDetail,
    fetchProductList,
    fetchProductMeta,
    updatePlan
  } from '@/api/product'
  import type { CustomConfigControl, CustomConfigItem, Product } from '@/types/product'

  defineOptions({ name: 'PlanFormPage' })

  const ACCESS_DOC_URL =
    'https://bvhnst56r3r.feishu.cn/wiki/HByFwBreBiS6AckIJsmcCNRsnWf?fromScene=spaceOverview'
  const PLAN_API_REGISTER_URL =
    'https://bvhnst56r3r.feishu.cn/wiki/XhCnwe1LHiEtwKkLdWoc7EYcnKd?from=from_copylink'

  const route = useRoute()
  const router = useRouter()
  const isEdit = computed(() => route.path.includes('/plan/edit/'))
  const presetProductId = computed(() =>
    route.path.includes('/plan/create/') ? Number(route.params.productId) || null : null
  )

  const formRef = ref<FormInstance>()
  const pageLoading = ref(false)
  const submitLoading = ref(false)
  const testSuccessVisible = ref(false)
  let testSuccessTimer: ReturnType<typeof setTimeout> | null = null
  const handlers = ref<string[]>([])
  const productOptions = ref<Product[]>([])
  const customExtOptions = [4, 5, 6, 7, 8, 9, 10]
  const controlOptions: { label: string; value: CustomConfigControl }[] = [
    { label: '文本框', value: 'input' },
    { label: '单选', value: 'radio' },
    { label: '多选', value: 'checkbox' }
  ]

  function emptyConfig(): CustomConfigItem {
    return { name: '', control: 'input', options: [], tip: '', required: true, defaultIndexes: [] }
  }

  function normalizeLoadedConfig(
    item: Partial<CustomConfigItem> & { control?: string }
  ): CustomConfigItem {
    const control: CustomConfigControl =
      item.control === 'radio' || item.control === 'checkbox' ? item.control : 'input'
    const options = control === 'input' ? [] : item.options?.length ? [...item.options] : ['']
    const required = Boolean(item.required)
    let defaultIndexes = Array.isArray(item.defaultIndexes)
      ? item.defaultIndexes.filter((i) => Number.isInteger(i) && i >= 0 && i < options.length)
      : []
    if (control === 'input' || !required) {
      defaultIndexes = []
    } else if (control === 'radio') {
      defaultIndexes = defaultIndexes.slice(0, 1)
      if (!defaultIndexes.length && options.length) defaultIndexes = [0]
    } else if (!defaultIndexes.length && options.length) {
      defaultIndexes = [0]
    }
    return {
      name: item.name || '',
      control,
      options,
      tip: (item.tip || '').slice(0, 20),
      required,
      defaultIndexes
    }
  }

  const form = reactive({
    id: 0,
    productId: undefined as number | undefined,
    name: '',
    intro: '',
    displayStatus: 1,
    trialTimeType: '1m' as '1m' | '2m' | '3m' | 'custom',
    trialDays: 30,
    extensionType: '0' as '0' | '1' | '2' | '3' | 'custom',
    extensionCount: 4,
    freezeDays: [] as number[],
    allowRepeatApply: false,
    handler: '',
    accessApi: '',
    extendConfig: '',
    stopConfig: '',
    customConfigs: [] as CustomConfigItem[]
  })

  const showFreezeRules = computed(() => currentExtCount() > 0)
  const freezeTableRows = computed(() => form.freezeDays.map((_, idx) => ({ idx })))

  const rules: FormRules = {
    productId: [{ required: true, message: '请选择所属产品', trigger: 'change' }],
    allowRepeatApply: [{ required: true, message: '请选择是否可重复申请', trigger: 'change' }],
    name: [{ required: true, message: '请输入方案名称', trigger: 'blur' }],
    intro: [
      { required: true, message: '请输入方案介绍', trigger: 'blur' },
      { max: 200, message: '方案介绍不超过200字', trigger: 'blur' }
    ],
    trialTimeType: [{ required: true, message: '请选择试用时间', trigger: 'change' }],
    extensionType: [{ required: true, message: '请选择可延期次数', trigger: 'change' }],
    handler: [{ required: true, message: '请选择方案处理人', trigger: 'change' }],
    accessApi: [
      { required: true, message: '请输入方案接入API', trigger: 'blur' },
      { max: 1000, message: '方案接入API不超过1000字', trigger: 'blur' }
    ]
  }

  function handleTestApi() {
    testSuccessVisible.value = true
    if (testSuccessTimer) clearTimeout(testSuccessTimer)
    testSuccessTimer = setTimeout(() => {
      testSuccessVisible.value = false
      testSuccessTimer = null
    }, 4000)
  }

  function currentExtCount() {
    return form.extensionType === 'custom' ? Number(form.extensionCount) : Number(form.extensionType)
  }

  function syncFreezeDays() {
    const count = currentExtCount()
    const next = [...form.freezeDays]
    while (next.length < count) next.push(0)
    form.freezeDays = next.slice(0, count)
  }

  function handleControlChange(item: CustomConfigItem) {
    if (item.control === 'input') {
      item.options = []
      item.defaultIndexes = []
    } else if (!item.options.length) {
      item.options = ['']
      item.defaultIndexes = item.required ? [0] : []
    } else if (item.required) {
      if (item.control === 'radio') {
        item.defaultIndexes = item.defaultIndexes.length ? [item.defaultIndexes[0]] : [0]
      } else if (!item.defaultIndexes.length) {
        item.defaultIndexes = [0]
      }
    } else {
      item.defaultIndexes = []
    }
  }

  function handleRequiredChange(item: CustomConfigItem) {
    if (!item.required || item.control === 'input') {
      item.defaultIndexes = []
      return
    }
    if (!item.options.length) {
      item.options = ['']
      item.defaultIndexes = [0]
      return
    }
    if (item.control === 'radio') {
      item.defaultIndexes = [item.defaultIndexes[0] ?? 0]
    } else if (!item.defaultIndexes.length) {
      item.defaultIndexes = [0]
    }
  }

  function addOption(item: CustomConfigItem) {
    if (item.options.length >= 6) return
    const isFirst = item.options.length === 0
    item.options.push('')
    if (item.required && isFirst) {
      item.defaultIndexes = [0]
    }
  }

  function removeOption(item: CustomConfigItem, oIdx: number) {
    if (item.options.length <= 1) return
    item.options.splice(oIdx, 1)
    item.defaultIndexes = item.defaultIndexes
      .filter((i) => i !== oIdx)
      .map((i) => (i > oIdx ? i - 1 : i))
    if (item.required && !item.defaultIndexes.length && item.options.length) {
      item.defaultIndexes = [0]
    }
  }

  function setDefaultOption(item: CustomConfigItem, oIdx: number) {
    if (item.control === 'radio') {
      item.defaultIndexes = [oIdx]
      return
    }
    if (!item.defaultIndexes.includes(oIdx)) {
      item.defaultIndexes = [...item.defaultIndexes, oIdx].sort((a, b) => a - b)
    }
  }

  function addCustomConfig() {
    if (form.customConfigs.length >= 6) return
    form.customConfigs.push(emptyConfig())
  }

  function removeCustomConfig(idx: number) {
    form.customConfigs.splice(idx, 1)
  }

  function validateExtraConfigs(): boolean {
    for (const item of form.customConfigs) {
      if (!item.name.trim()) {
        ElMessage.error('请完善附加配置的选项名称')
        return false
      }
      if (item.required === undefined || item.required === null) {
        ElMessage.error(`「${item.name || '附加配置'}」请选择是否必填`)
        return false
      }
      if (item.control === 'radio' || item.control === 'checkbox') {
        const opts = item.options.map((o) => o.trim()).filter(Boolean)
        if (!opts.length) {
          ElMessage.error(`「${item.name}」请填写选项内容`)
          return false
        }
        if (opts.length > 6) {
          ElMessage.error(`「${item.name}」选项最多 6 个`)
          return false
        }
        item.options = opts
        item.defaultIndexes = item.defaultIndexes.filter((i) => i >= 0 && i < opts.length)
        if (item.required) {
          if (item.control === 'radio') {
            item.defaultIndexes = item.defaultIndexes.length ? [item.defaultIndexes[0]] : [0]
          } else if (!item.defaultIndexes.length) {
            item.defaultIndexes = [0]
          }
        } else {
          item.defaultIndexes = []
        }
      } else {
        item.options = []
        item.defaultIndexes = []
      }
    }
    return true
  }

  async function handleSubmit() {
    await formRef.value?.validate()
    if (!form.productId) {
      ElMessage.error('请选择所属产品')
      return
    }
    if (!validateExtraConfigs()) return
    submitLoading.value = true
    try {
      syncFreezeDays()
      const payload = {
        id: form.id,
        productId: form.productId,
        name: form.name,
        intro: form.intro,
        displayStatus: form.displayStatus,
        trialTimeType: form.trialTimeType,
        trialDays: form.trialTimeType === 'custom' ? form.trialDays : null,
        extensionType: form.extensionType,
        extensionCount: currentExtCount(),
        freezeDays: [...form.freezeDays],
        allowRepeatApply: form.allowRepeatApply,
        auditLeaders: ['直属领导'],
        auditProvince: '省区域负责人',
        auditChairman: '董事长',
        handler: form.handler,
        accessApi: form.accessApi.trim(),
        validationConfig: '',
        extendConfig: form.extendConfig,
        stopConfig: form.stopConfig,
        customConfigs: form.customConfigs.filter((item) => item.name.trim())
      }
      const res = isEdit.value
        ? await updatePlan(payload as { id: number })
        : await createPlan(payload)
      if (res.code === 200) {
        ElMessage.success(isEdit.value ? '方案更新成功' : '方案创建成功')
        router.push('/product/plans')
      } else {
        ElMessage.error(res.message || '保存失败')
      }
    } finally {
      submitLoading.value = false
    }
  }

  async function loadPage() {
    pageLoading.value = true
    try {
      const [metaRes, productRes] = await Promise.all([
        fetchProductMeta(),
        fetchProductList({ page: 1, pageSize: 200 })
      ])
      if (metaRes.code === 200) handlers.value = metaRes.data.handlers || []
      if (productRes.code === 200) productOptions.value = productRes.data.list || []

      if (isEdit.value) {
        const res = await fetchPlanDetail(Number(route.params.id))
        if (res.code === 200 && res.data) {
          Object.assign(form, {
            id: res.data.id,
            productId: res.data.productId,
            name: res.data.name,
            intro: res.data.intro,
            displayStatus: res.data.displayStatus,
            trialTimeType: res.data.trialTimeType === 'none' ? '1m' : res.data.trialTimeType,
            trialDays: res.data.trialDays || 30,
            extensionType: res.data.extensionType,
            extensionCount: res.data.extensionCount,
            freezeDays: [...(res.data.freezeDays || [])],
            allowRepeatApply: res.data.allowRepeatApply ?? false,
            handler: res.data.handler,
            accessApi: res.data.accessApi || '',
            extendConfig: res.data.extendConfig || '',
            stopConfig: res.data.stopConfig || '',
            customConfigs: (res.data.customConfigs || []).map((item: CustomConfigItem) =>
              normalizeLoadedConfig(item)
            )
          })
          syncFreezeDays()
        } else {
          ElMessage.error(res.message || '加载方案失败')
        }
      } else {
        form.productId = presetProductId.value || undefined
        syncFreezeDays()
      }
    } finally {
      pageLoading.value = false
    }
  }

  onMounted(loadPage)
  watch(
    () => route.fullPath,
    () => loadPage()
  )
</script>

<style scoped lang="scss">
  .plan-form-page {
    padding-bottom: 24px;
  }

  .form-card {
    flex: 1;

    :deep(.el-card__body) {
      height: 100%;
    }
  }

  .plan-form {
    max-width: 860px;
    padding: 8px 12px 40px;

    :deep(.el-form-item) {
      align-items: flex-start;
      margin-bottom: 18px;
    }

    :deep(.el-form-item__label) {
      line-height: 32px;
      height: auto;
      padding-top: 0;
      text-align: right;
      white-space: nowrap;
    }

    :deep(.el-form-item__content) {
      flex: 1;
      min-width: 0;
      line-height: 32px;
    }
  }

  .form-control-full {
    width: 100%;
  }

  .form-field-hint {
    width: 100%;
    margin-top: 8px;
    font-size: 12px;
    line-height: 1.5;
    color: var(--el-text-color-secondary);
  }

  .row-inline {
    display: flex;
    gap: 8px;
    align-items: flex-start;

    .grow {
      flex: 1;
    }

    .switch-item {
      width: 120px;
      flex-shrink: 0;
    }
  }


  .custom-num {
    width: 100px;
    margin-left: 12px;
  }

  .unit {
    margin-left: 6px;
    color: var(--el-text-color-secondary);
  }

  .custom-ext {
    width: 120px;
    margin-left: 12px;
  }

  .freeze-label {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .freeze-info {
    color: var(--el-color-info);
    cursor: help;
  }

  .freeze-tip {
    color: var(--el-text-color-secondary);
    font-size: 13px;
    line-height: 1.5;
    margin-bottom: 8px;
  }

  .freeze-table {
    width: 100%;
  }

  .custom-config-block {
    width: 100%;
  }

  .custom-config-tip {
    color: var(--el-text-color-secondary);
    font-size: 13px;
    margin-bottom: 10px;
  }

  .custom-config-card {
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 10px;
  }

  .custom-config-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: flex-start;
  }

  .cfg-field {
    margin-bottom: 0;
  }

  .cfg-name {
    width: 160px;
  }

  .cfg-control {
    width: 110px;
  }

  .cfg-required {
    width: 110px;
  }

  .cfg-tip {
    width: 200px;
  }

  .option-default-tag {
    font-size: 13px;
    color: var(--el-color-success);
    white-space: nowrap;
  }

  .options-block {
    margin-top: 10px;
    padding-top: 8px;
    border-top: 1px dashed var(--el-border-color-lighter);
  }

  .options-label {
    font-size: 13px;
    color: var(--el-text-color-regular);
    margin-bottom: 8px;
  }

  .option-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .api-field {
    width: 100%;
  }

  .api-input-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .api-tip {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    margin-top: 8px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    line-height: 1.5;

    .el-icon {
      color: var(--el-color-primary);
      margin-top: 2px;
      flex-shrink: 0;
    }
  }

  .api-test-ok {
    flex-shrink: 0;
    font-size: 13px;
    color: var(--el-color-success);
    white-space: nowrap;
  }
</style>
