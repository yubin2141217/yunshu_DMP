<!-- 人工处理 · 工单详情（支持 intervention 处理模式） -->
<template>
  <div
    class="biz-detail-page apply-ticket-detail"
    :class="{ 'has-footer-bar': showActionBar }"
    v-loading="loading"
  >
    <div class="detail-nav">
      <ElButton text :icon="ArrowLeft" @click="goBack">返回</ElButton>
      <span class="detail-nav__title">工单详情</span>
    </div>

    <template v-if="detail">
      <!-- 产品方案设置 -->
      <section
        v-if="showSetupSection"
        class="detail-section"
      >
        <div class="section-title-row">
          <div class="section-title">产品方案设置</div>
          <ElButton
            v-if="canEditSetup && !isIntervention && !setupEditing"
            link
            type="primary"
            @click="setupEditing = true"
            >修改</ElButton
          >
        </div>
        <ElForm
          v-if="showSetupForm"
          ref="formRef"
          :model="form"
          :rules="formRules"
          label-width="80px"
          class="setup-form"
          @submit.prevent
        >
          <div class="setup-row">
            <ElFormItem prop="setupIdValue" class="setup-id-item" label-width="0">
              <div class="id-combo">
                <ElSelect v-model="form.setupIdType" class="id-type-select">
                  <ElOption label="方案ID" value="planId" />
                  <ElOption label="机构ID" value="orgId" />
                </ElSelect>
                <ElInput
                  v-model="form.setupIdValue"
                  maxlength="50"
                  show-word-limit
                  :placeholder="setupIdPlaceholder"
                />
              </div>
            </ElFormItem>
            <ElFormItem label="到期时间" prop="expireTime" class="setup-expire-item">
              <ElDatePicker
                v-model="form.expireTime"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm:ss"
                placeholder="请选择到期时间"
                style="width: 220px"
                @change="(v: string | null) => handleExpireChange(v)"
              />
            </ElFormItem>
          </div>
          <ElFormItem v-if="!isIntervention" label-width="0">
            <ElButton @click="cancelSetupEdit">取消</ElButton>
            <ElButton type="primary" :loading="submitting" @click="handleSubmit">确定</ElButton>
          </ElFormItem>
        </ElForm>
        <div v-else class="info-grid">
          <div class="info-item">
            <span class="k">{{ setupIdLabel }}</span>
            <span class="v">{{ setupIdDisplay || '—' }}</span>
          </div>
          <div class="info-item">
            <span class="k">到期时间</span>
            <span class="v">{{ detail.expireTime || form.expireTime || '—' }}</span>
          </div>
        </div>
      </section>

      <!-- 工单信息 -->
      <section class="detail-section">
        <div class="section-title">工单信息</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="k">工单ID</span>
            <span class="v">{{ detail.orderNo }}</span>
          </div>
          <div class="info-item">
            <span class="k">机构简称</span>
            <span class="v">{{ detail.orgName }}</span>
          </div>
          <div class="info-item">
            <span class="k">申请人</span>
            <span class="v">{{ detail.applicant }}</span>
          </div>
          <div class="info-item">
            <span class="k">申请类型</span>
            <span class="v">{{ detail.applyType }}</span>
          </div>
          <div class="info-item">
            <span class="k">申请时间</span>
            <span class="v">{{ detail.applyTime }}</span>
          </div>
          <div class="info-item">
            <span class="k">审核状态</span>
            <span class="v">
              <ElTag :type="applyStatusTagType(detail.status)" effect="light" round>
                {{ todoStatusLabel(detail.status) }}
              </ElTag>
            </span>
          </div>
          <div class="info-item full">
            <span class="k">申请说明</span>
            <span class="v">{{ detail.applyRemark || '—' }}</span>
          </div>
        </div>
      </section>

      <!-- 产品方案 -->
      <ApplyPlanSection
        :product-name="detail.productName"
        :plan-name="detail.planName"
        :plan-id="detail.planId"
        :trial-time-label="detail.trialTimeLabel"
        :product-intro="detail.productIntro"
        :plan-intro="detail.planIntro"
        :freeze-rule="detail.freezeRule"
        :freeze-days="detail.freezeDays"
      />

      <!-- 附加配置 -->
      <ApplyCustomConfigsSection :items="detail.customConfigs" />

      <!-- 审核节点 -->
      <section class="detail-section">
        <div class="section-title">审核节点</div>
        <ElTimeline class="audit-timeline">
          <ElTimelineItem
            v-for="(node, idx) in detail.auditNodes"
            :key="idx"
            :type="auditNodeStatusType(node.action)"
            :timestamp="node.time || undefined"
            placement="top"
          >
            <div class="timeline-head">
              <span class="who">{{ node.operator }}（{{ node.role }}）</span>
              <span class="status-text" :class="`is-${auditNodeStatusType(node.action)}`">
                {{ node.action }}
              </span>
            </div>
            <div v-if="node.remark" class="timeline-remark">{{ node.remark }}</div>
          </ElTimelineItem>
        </ElTimeline>
      </section>

      <ElAlert
        v-if="detail.status === '待人工处理' && !canEditSetup"
        type="info"
        :closable="false"
        title="仅指定处理人可执行人工处理"
        class="audit-tip"
      />
    </template>

    <!-- 人工处理底部操作栏（对齐截图） -->
    <div v-if="showActionBar" class="intervene-footer">
      <ElButton type="danger" plain @click="rejectVisible = true">驳回</ElButton>
      <ElButton @click="goBack">取消</ElButton>
      <ElButton type="primary" :loading="submitting" @click="handleSubmit">提交</ElButton>
    </div>

    <ElDialog v-model="rejectVisible" title="驳回处理" width="520px" destroy-on-close>
      <ElForm ref="rejectFormRef" :model="rejectForm" :rules="rejectRules" label-width="80px">
        <ElFormItem label="驳回意见" prop="remark">
          <ElInput
            v-model="rejectForm.remark"
            type="textarea"
            :rows="5"
            maxlength="500"
            show-word-limit
            placeholder="请填写驳回意见（必填，500字以内）"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="rejectVisible = false">取消</ElButton>
        <ElButton type="danger" :loading="submitting" @click="handleReject">确认驳回</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ArrowLeft } from '@element-plus/icons-vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import { fetchApplyDetail, manualInterveneApply, manualRejectApply } from '@/api/apply'
  import {
    applyStatusTagType,
    auditNodeStatusType,
    todoStatusLabel
  } from '@/utils/apply-status'
  import type { ApplyOrder, ApplySetupIdType } from '@/types/apply'
  import { useUserStore } from '@/store/modules/user'
  import ApplyCustomConfigsSection from '../components/ApplyCustomConfigsSection.vue'
  import ApplyPlanSection from '../components/ApplyPlanSection.vue'

  defineOptions({ name: 'ApplyTodoDetailPage' })

  const route = useRoute()
  const router = useRouter()
  const userStore = useUserStore()
  const loading = ref(false)
  const submitting = ref(false)
  const setupEditing = ref(false)
  const rejectVisible = ref(false)
  const formRef = ref<FormInstance>()
  const rejectFormRef = ref<FormInstance>()
  const detail = ref<ApplyOrder | null>(null)
  const form = reactive({
    setupIdType: 'planId' as ApplySetupIdType,
    setupIdValue: '',
    expireTime: ''
  })
  const rejectForm = reactive({ remark: '' })
  const rejectRules: FormRules = {
    remark: [
      { required: true, message: '请填写驳回意见', trigger: 'blur' },
      { max: 500, message: '驳回意见不超过500字', trigger: 'blur' }
    ]
  }

  const formRules = computed<FormRules>(() => ({
    setupIdValue: [
      {
        required: true,
        message: form.setupIdType === 'orgId' ? '请填写机构ID' : '请填写方案ID',
        trigger: 'blur'
      }
    ],
    expireTime: [{ required: true, message: '请选择到期时间', trigger: 'change' }]
  }))

  const currentUserName = computed(
    () => userStore.getUserInfo?.nickname || userStore.getUserInfo?.username || ''
  )

  /** 处理模式：待我处理列表点「人工处理」进入 */
  const isIntervention = computed(() => String(route.query.mode || '') === 'intervention')

  /** 方案处理人在「待人工处理 / 已归档」可见编辑能力 */
  const canEditSetup = computed(() => {
    if (!detail.value) return false
    if (detail.value.status !== '待人工处理' && detail.value.status !== '已归档') return false
    return detail.value.handler === currentUserName.value
  })

  const showSetupSection = computed(
    () =>
      Boolean(detail.value) &&
      (canEditSetup.value ||
        hasSetupValue.value ||
        detail.value?.status === '待人工处理' ||
        detail.value?.status === '已归档')
  )

  const showSetupForm = computed(
    () => canEditSetup.value && (isIntervention.value || setupEditing.value)
  )

  const showActionBar = computed(
    () =>
      isIntervention.value &&
      canEditSetup.value &&
      detail.value?.status === '待人工处理'
  )

  const setupIdPlaceholder = computed(() =>
    form.setupIdType === 'orgId' ? '请输入机构ID' : '请输入方案ID'
  )

  const resolvedSetupIdType = computed<ApplySetupIdType>(() => {
    if (detail.value?.setupIdType) return detail.value.setupIdType
    if (detail.value?.orgId) return 'orgId'
    return 'planId'
  })

  const setupIdLabel = computed(() =>
    resolvedSetupIdType.value === 'orgId' ? '机构ID' : '方案ID'
  )

  const setupIdDisplay = computed(() => {
    if (resolvedSetupIdType.value === 'orgId') {
      return detail.value?.orgId || form.setupIdValue || ''
    }
    return detail.value?.planId || form.setupIdValue || ''
  })

  const hasSetupValue = computed(() =>
    Boolean(detail.value?.planId || detail.value?.orgId || detail.value?.expireTime)
  )

  function goBack() {
    if (isIntervention.value) {
      const from = String(route.query.from || '')
      router.push({
        path: '/apply/todo',
        query: from === 'pending' ? { tab: 'pending' } : {}
      })
      return
    }
    router.push('/apply/todo')
  }

  function applyDefaultExpireTime(val: string) {
    if (!val) return val
    return `${val.slice(0, 10)} 23:59:59`
  }

  function handleExpireChange(val: string | null) {
    if (val) form.expireTime = applyDefaultExpireTime(val)
  }

  /** 按试用时长估算默认到期时间 */
  function buildDefaultExpire(trialTimeLabel?: string): string {
    const d = new Date()
    const label = trialTimeLabel || ''
    const monthMatch = label.match(/(\d+)\s*个?月/)
    const dayMatch = label.match(/(\d+)\s*天/)
    if (monthMatch) {
      d.setMonth(d.getMonth() + Number(monthMatch[1]))
    } else if (dayMatch) {
      d.setDate(d.getDate() + Number(dayMatch[1]))
    } else {
      d.setMonth(d.getMonth() + 1)
    }
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day} 23:59:59`
  }

  function syncFormFromDetail(data: ApplyOrder) {
    const idType: ApplySetupIdType =
      data.setupIdType || (data.orgId && !data.planId ? 'orgId' : 'planId')
    form.setupIdType = idType
    form.setupIdValue = idType === 'orgId' ? data.orgId || '' : data.planId || ''
    form.expireTime = data.expireTime || ''
    if (isIntervention.value && !form.expireTime) {
      form.expireTime = buildDefaultExpire(data.trialTimeLabel)
    }
  }

  function cancelSetupEdit() {
    if (!detail.value) return
    syncFormFromDetail(detail.value)
    setupEditing.value = false
    formRef.value?.clearValidate()
  }

  async function loadDetail() {
    const id = Number(route.params.id)
    loading.value = true
    try {
      const res = await fetchApplyDetail(id)
      if (res.code === 200) {
        detail.value = res.data
        syncFormFromDetail(res.data)
        setupEditing.value = false
      } else {
        ElMessage.error(res.message || '加载失败')
      }
    } finally {
      loading.value = false
    }
  }

  async function handleSubmit() {
    if (!detail.value || !formRef.value || !canEditSetup.value) {
      ElMessage.warning('仅指定处理人可操作')
      return
    }
    const wasArchived = detail.value.status === '已归档'
    try {
      await formRef.value.validate()
    } catch {
      return
    }
    submitting.value = true
    try {
      const res = await manualInterveneApply({
        id: detail.value.id,
        setupIdType: form.setupIdType,
        setupIdValue: form.setupIdValue.trim(),
        expireTime: form.expireTime,
        operator: currentUserName.value
      })
      if (res.code === 200) {
        const tip = wasArchived ? '修改成功' : '提交成功，已完成人工处理'
        if (wasArchived) {
          ElMessage.success(tip)
          await loadDetail()
        } else {
          await ElMessageBox.alert(tip, '提示', {
            type: 'success',
            confirmButtonText: '确定'
          })
          goBack()
        }
      } else {
        ElMessage.error(
          res.message ||
            (form.setupIdType === 'orgId'
              ? '返回错误，请检查机构ID是否匹配'
              : '返回错误，请检查方案ID是否匹配')
        )
      }
    } finally {
      submitting.value = false
    }
  }

  async function handleReject() {
    if (!detail.value || !rejectFormRef.value || !canEditSetup.value) {
      ElMessage.warning('仅指定处理人可操作')
      return
    }
    try {
      await rejectFormRef.value.validate()
    } catch {
      return
    }
    submitting.value = true
    try {
      const res = await manualRejectApply({
        id: detail.value.id,
        remark: rejectForm.remark.trim(),
        operator: currentUserName.value
      })
      if (res.code === 200) {
        await ElMessageBox.alert('已拒绝该工单', '提示', {
          type: 'success',
          confirmButtonText: '确定'
        })
        rejectVisible.value = false
        router.push({ path: '/apply/todo', query: { tab: 'records' } })
      } else {
        ElMessage.error(res.message || '拒绝失败')
      }
    } finally {
      submitting.value = false
    }
  }

  watch(
    () => form.setupIdType,
    () => {
      formRef.value?.clearValidate('setupIdValue')
    }
  )

  onMounted(loadDetail)
  watch(
    () => [route.params.id, route.query.mode],
    () => loadDetail()
  )
</script>

<style scoped lang="scss">
  @use '../ticket-detail.scss';

  .apply-ticket-detail.has-footer-bar {
    padding-bottom: 88px;
  }

  .section-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    .section-title {
      margin-bottom: 0;
    }
  }

  .setup-form {
    max-width: none;
  }

  .setup-row {
    display: flex;
    flex-wrap: nowrap;
    align-items: flex-start;
    gap: 16px;

    :deep(.el-form-item) {
      display: inline-flex;
      width: auto;
      vertical-align: top;
    }
  }

  .setup-id-item {
    margin-bottom: 18px;
    flex: 0 0 420px;
    width: 420px;

    :deep(.el-form-item__content) {
      width: 100%;
      flex: 1;
    }
  }

  .id-combo {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 0;

    .id-type-select {
      width: 110px;
      flex-shrink: 0;

      :deep(.el-select__wrapper) {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
    }

    :deep(.el-input) {
      flex: 1;
      min-width: 0;

      .el-input__wrapper {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }
    }
  }

  .setup-expire-item {
    margin-bottom: 18px;
    flex: 0 0 auto;
    white-space: nowrap;
  }

  .intervene-footer {
    position: sticky;
    bottom: 0;
    z-index: 20;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 12px;
    margin-top: 8px;
    padding: 14px 20px;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 -2px 10px rgba(31, 42, 68, 0.06);

    .el-button:not(:first-child) {
      margin-left: 0;
    }
  }
</style>
