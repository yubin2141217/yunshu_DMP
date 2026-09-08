<!-- 新建/编辑产品弹窗：本地录入产品信息 -->
<template>
  <ElDialog
    :model-value="visible"
    :title="productId ? '编辑产品' : '新建产品'"
    width="640px"
    align-center
    destroy-on-close
    class="product-form-dialog"
    @close="emit('update:visible', false)"
  >
    <ElForm
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      class="product-form"
    >
      <ElFormItem v-if="productId" label="产品ID">
        <ElInput :model-value="String(form.id)" disabled />
      </ElFormItem>
      <ElFormItem label="产品名称" prop="name">
        <ElInput
          v-model="form.name"
          maxlength="100"
          show-word-limit
          placeholder="请输入产品名称"
        />
      </ElFormItem>

      <ElFormItem label="产品 Logo" prop="logo" required>
        <div class="logo-upload">
          <div class="logo-row">
            <ElUpload
              :show-file-list="false"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              :auto-upload="false"
              :on-change="handleLogoChange"
            >
              <div v-if="form.logo" class="logo-preview">
                <ElImage :src="form.logo" fit="contain" style="width: 72px; height: 72px" />
              </div>
              <div v-else class="logo-placeholder">
                <ElIcon :size="20"><Plus /></ElIcon>
                <span>上传图片</span>
              </div>
            </ElUpload>
            <ElButton
              v-if="form.logo"
              class="logo-remove"
              link
              type="danger"
              @click="clearLogo"
            >
              移除
            </ElButton>
          </div>
          <div class="logo-tip">
            支持格式：JPG、JPEG、PNG，图片比例固定 1:1，推荐尺寸 200px*200px，文件不大于 1MB
          </div>
        </div>
      </ElFormItem>

      <ElFormItem label="产品介绍" prop="intro">
        <ElInput
          v-model="form.intro"
          type="textarea"
          :rows="4"
          maxlength="1000"
          show-word-limit
          placeholder="请输入产品介绍"
        />
      </ElFormItem>

      <ElFormItem label="展示位置" prop="sortOrder">
        <ElInputNumber
          v-model="form.sortOrder"
          :min="0"
          :precision="0"
          :step="1"
          controls-position="right"
          placeholder="请输入展示位置"
        />
        <div class="field-tip">数值越小，展示越靠前</div>
      </ElFormItem>

      <ElFormItem label="机构类型可用" prop="orgTypes">
        <div class="org-type-wrap">
          <ElCheckbox
            :model-value="isAllOrgTypes"
            :indeterminate="isOrgIndeterminate"
            @change="(v: string | number | boolean) => toggleAllOrgTypes(Boolean(v))"
          >
            全部
          </ElCheckbox>
          <ElCheckboxGroup v-model="form.orgTypes" class="org-type-group">
            <ElCheckbox v-for="item in orgTypeOptions" :key="item" :value="item" :label="item">
              {{ item }}
            </ElCheckbox>
          </ElCheckboxGroup>
        </div>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="emit('update:visible', false)">取消</ElButton>
      <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">确定</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { Plus } from '@element-plus/icons-vue'
  import type { FormInstance, FormRules, UploadFile } from 'element-plus'
  import { createProduct, fetchProductDetail, fetchProductMeta, updateProduct } from '@/api/product'

  defineOptions({ name: 'ProductFormDialog' })

  const props = defineProps<{
    visible: boolean
    productId?: number | null
  }>()

  const emit = defineEmits<{
    'update:visible': [boolean]
    success: []
  }>()

  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)
  const orgTypeOptions = ref<string[]>(['一类', '二类', '三类'])
  const form = reactive({
    id: 0,
    name: '',
    logo: '',
    intro: '',
    sortOrder: 0,
    displayStatus: 1,
    orgTypes: [] as string[],
    regions: [] as string[]
  })

  const rules: FormRules = {
    name: [
      { required: true, message: '请输入产品名称', trigger: 'blur' },
      { max: 100, message: '产品名称不超过100字', trigger: 'blur' }
    ],
    logo: [{ required: true, message: '请上传产品 Logo', trigger: 'change' }],
    intro: [
      { required: true, message: '请输入产品介绍', trigger: 'blur' },
      { max: 1000, message: '产品介绍不超过1000字', trigger: 'blur' }
    ],
    sortOrder: [
      { required: true, message: '请输入展示位置', trigger: 'change' },
      {
        validator: (_rule, value, callback) => {
          const n = Number(value)
          if (!Number.isInteger(n) || n < 0) {
            callback(new Error('展示位置须为大于等于 0 的整数'))
            return
          }
          callback()
        },
        trigger: 'change'
      }
    ],
    orgTypes: [
      { required: true, type: 'array', min: 1, message: '请选择机构类型', trigger: 'change' }
    ]
  }

  const isAllOrgTypes = computed(
    () =>
      orgTypeOptions.value.length > 0 &&
      orgTypeOptions.value.every((t) => form.orgTypes.includes(t))
  )
  const isOrgIndeterminate = computed(() => form.orgTypes.length > 0 && !isAllOrgTypes.value)

  function toggleAllOrgTypes(checked: boolean) {
    form.orgTypes = checked ? [...orgTypeOptions.value] : []
  }

  function handleLogoChange(file: UploadFile) {
    const raw = file.raw
    if (!raw) return
    const okType =
      ['image/jpeg', 'image/png'].includes(raw.type) || /\.(jpe?g|png)$/i.test(raw.name || '')
    if (!okType) {
      ElMessage.error('仅支持 JPG、JPEG、PNG 格式')
      return
    }
    if (raw.size > 1 * 1024 * 1024) {
      ElMessage.error('图片大小不能超过 1MB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const src = String(reader.result || '')
      const img = new Image()
      img.onload = () => {
        if (img.width !== img.height) {
          ElMessage.error('图片比例须为 1:1')
          return
        }
        form.logo = src
        formRef.value?.clearValidate('logo')
      }
      img.onerror = () => ElMessage.error('图片读取失败')
      img.src = src
    }
    reader.readAsDataURL(raw)
  }

  function clearLogo() {
    form.logo = ''
    formRef.value?.validateField('logo')
  }

  function resetForm() {
    form.id = 0
    form.name = ''
    form.logo = ''
    form.intro = ''
    form.sortOrder = 0
    form.displayStatus = 1
    form.orgTypes = [...orgTypeOptions.value]
    form.regions = []
    formRef.value?.clearValidate()
  }

  async function loadOptions() {
    const metaRes = await fetchProductMeta()
    if (metaRes.code === 200) {
      orgTypeOptions.value = metaRes.data.orgTypes?.length
        ? metaRes.data.orgTypes
        : ['一类', '二类', '三类']
      form.regions = metaRes.data.regions ? [...metaRes.data.regions] : []
    }
  }

  async function loadDetail(id: number) {
    const res = await fetchProductDetail(id)
    if (res.code === 200 && res.data) {
      form.id = res.data.id
      form.name = res.data.name
      form.logo = res.data.logo
      form.intro = res.data.intro
      form.sortOrder = res.data.sortOrder ?? 0
      form.displayStatus = res.data.displayStatus
      form.orgTypes = [...res.data.orgTypes]
      form.regions = [...(res.data.regions || [])]
    }
  }

  async function handleSubmit() {
    await formRef.value?.validate()
    submitLoading.value = true
    try {
      const payload = {
        id: form.id,
        name: form.name.trim(),
        logo: form.logo,
        intro: form.intro.trim(),
        sortOrder: form.sortOrder,
        displayStatus: form.displayStatus,
        orgTypes: form.orgTypes,
        regions: form.regions.length ? form.regions : ['华北']
      }
      const res = props.productId
        ? await updateProduct(payload as { id: number })
        : await createProduct(payload)
      if (res.code === 200) {
        ElMessage.success(props.productId ? '产品更新成功' : '产品创建成功')
        emit('update:visible', false)
        emit('success')
      } else {
        ElMessage.error(res.message || '保存失败')
      }
    } finally {
      submitLoading.value = false
    }
  }

  watch(
    () => props.visible,
    async (val) => {
      if (!val) return
      await loadOptions()
      if (props.productId) await loadDetail(props.productId)
      else resetForm()
    }
  )
</script>

<style scoped lang="scss">
  .product-form {
    max-width: 520px;
    margin: 0 auto;
    padding: 0 8px;
  }

  .logo-upload {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .logo-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  .logo-remove {
    padding: 0;
    height: auto;
    margin-top: 2px;
  }

  .logo-tip {
    max-width: 360px;
    font-size: 12px;
    line-height: 1.6;
    color: var(--el-text-color-secondary);
  }

  .logo-preview,
  .logo-placeholder {
    width: 72px;
    height: 72px;
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    overflow: hidden;
    cursor: pointer;
  }

  .org-type-wrap {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: 16px;
  }

  .field-tip {
    margin-top: 6px;
    font-size: 12px;
    line-height: 1.5;
    color: var(--el-text-color-secondary);
  }

  .api-field {
    width: 100%;
  }

  .api-tip {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    gap: 6px;
    margin-top: 8px;
    font-size: 13px;
    line-height: 1.5;
    color: var(--el-text-color-secondary);
    white-space: nowrap;

    .el-icon {
      color: var(--el-color-primary);
      flex-shrink: 0;
    }

    .api-tip-text {
      display: inline-flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0 2px;
    }

    .el-link {
      vertical-align: baseline;
      font-size: 13px;
    }
  }

  .api-input-row {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;

    .el-input {
      flex: 1;
      min-width: 0;
    }

    .el-button:not(:first-child) {
      margin-left: 0;
    }
  }

  .api-test-ok {
    flex-shrink: 0;
    font-size: 13px;
    color: var(--el-color-success);
    line-height: 1;
    white-space: nowrap;
  }

  .org-type-group {
    display: inline-flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: 4px;
  }
</style>
