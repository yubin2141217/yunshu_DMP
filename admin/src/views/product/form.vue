<!-- 新建/编辑产品（全页表单，与弹窗字段保持一致） -->
<template>
  <div class="biz-detail-page">
    <ElCard shadow="never" class="biz-breadcrumb-card">
      <div class="biz-header-row">
        <ElButton text :icon="ArrowLeft" @click="router.back()">返回</ElButton>
        <span class="title">{{ isEdit ? '编辑产品' : '新建产品' }}</span>
      </div>
    </ElCard>
    <ElCard shadow="never" class="biz-section-card form-card">
      <ElScrollbar>
        <ElForm ref="formRef" :model="form" :rules="rules" label-width="120px" class="form-body">
          <ElFormItem v-if="isEdit" label="产品ID">
            <ElInput :model-value="String(form.id)" disabled style="width: 420px" />
          </ElFormItem>
          <ElFormItem label="产品名称" prop="name">
            <ElInput
              v-model="form.name"
              maxlength="100"
              show-word-limit
              placeholder="请输入产品名称"
              style="width: 420px"
            />
          </ElFormItem>
          <ElFormItem label="产品 Logo" prop="logo">
            <div class="logo-upload">
              <ElUpload
                :show-file-list="false"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                :auto-upload="false"
                :on-change="handleLogoChange"
              >
                <div v-if="form.logo" class="logo-preview">
                  <ElImage :src="form.logo" style="width: 64px; height: 64px" fit="contain" />
                </div>
                <div v-else class="logo-placeholder">上传图片</div>
              </ElUpload>
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
              style="width: 520px"
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
            <ElSelect
              v-model="form.orgTypes"
              multiple
              filterable
              placeholder="请选择机构类型"
              style="width: 480px"
            >
              <ElOption v-for="item in meta.orgTypes" :key="item" :label="item" :value="item" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="区域类型可用" prop="regions">
            <ElSelect
              v-model="form.regions"
              multiple
              filterable
              placeholder="请选择区域"
              style="width: 480px"
            >
              <ElOption v-for="item in meta.regions" :key="item" :label="item" :value="item" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem>
            <ElButton @click="router.back()">取消</ElButton>
            <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">保存</ElButton>
          </ElFormItem>
        </ElForm>
      </ElScrollbar>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ArrowLeft } from '@element-plus/icons-vue'
  import type { FormInstance, FormRules, UploadFile } from 'element-plus'
  import {
    createProduct,
    fetchProductDetail,
    fetchProductMeta,
    updateProduct
  } from '@/api/product'

  defineOptions({ name: 'ProductFormPage' })

  const route = useRoute()
  const router = useRouter()
  const isEdit = computed(() => Boolean(route.params.id))
  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)
  const meta = reactive({ orgTypes: [] as string[], regions: [] as string[] })
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
    orgTypes: [{ required: true, type: 'array', min: 1, message: '请选择机构类型', trigger: 'change' }],
    regions: [{ required: true, type: 'array', min: 1, message: '请选择区域', trigger: 'change' }]
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

  async function loadMeta() {
    const metaRes = await fetchProductMeta()
    if (metaRes.code === 200) {
      meta.orgTypes = metaRes.data.orgTypes
      meta.regions = metaRes.data.regions
      if (!isEdit.value) {
        form.orgTypes = [...meta.orgTypes]
        form.regions = [...meta.regions]
      }
    }
  }

  async function loadDetail() {
    const id = Number(route.params.id)
    const res = await fetchProductDetail(id)
    if (res.code === 200 && res.data) {
      form.id = res.data.id
      form.name = res.data.name
      form.logo = res.data.logo
      form.intro = res.data.intro
      form.sortOrder = res.data.sortOrder ?? 0
      form.displayStatus = res.data.displayStatus
      form.orgTypes = [...res.data.orgTypes]
      form.regions = [...res.data.regions]
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
        regions: form.regions
      }
      const res = isEdit.value
        ? await updateProduct(payload as { id: number })
        : await createProduct(payload)
      if (res.code === 200) {
        ElMessage.success(isEdit.value ? '产品更新成功' : '产品创建成功')
        router.push('/product/list')
      } else {
        ElMessage.error(res.message || '保存失败')
      }
    } finally {
      submitLoading.value = false
    }
  }

  onMounted(async () => {
    await loadMeta()
    if (isEdit.value) await loadDetail()
  })
</script>

<style scoped lang="scss">
  .form-card {
    flex: 1;
    :deep(.el-card__body) {
      height: 100%;
    }
  }
  .form-body {
    padding: 12px 8px 40px;
  }
  .logo-placeholder,
  .logo-preview {
    width: 64px;
    height: 64px;
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    overflow: hidden;
    cursor: pointer;
  }

  .logo-upload {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .logo-tip {
    max-width: 360px;
    font-size: 12px;
    line-height: 1.6;
    color: var(--el-text-color-secondary);
    padding-top: 4px;
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
</style>
