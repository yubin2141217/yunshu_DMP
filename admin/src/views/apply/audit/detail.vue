<!-- 审核管理 · 工单详情 -->
<template>
  <div class="biz-detail-page apply-ticket-detail" v-loading="loading">
    <div class="detail-nav">
      <ElButton text :icon="ArrowLeft" @click="goBack">返回</ElButton>
      <span class="detail-nav__title">工单详情</span>
    </div>

    <template v-if="detail">
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
              <ElTag :type="auditStatusTagType(detail.status)" effect="light" round>
                {{ auditStatusLabel(detail.status) }}
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

      <section v-if="canAudit" class="detail-section action-section">
        <ElButton type="primary" :loading="submitting" @click="handlePass">通过</ElButton>
        <ElButton type="danger" @click="rejectVisible = true">驳回</ElButton>
      </section>
      <ElAlert
        v-else-if="detail.status === '审核中'"
        type="info"
        :closable="false"
        title="仅当前审核人可执行通过/驳回操作"
        class="audit-tip"
      />
    </template>

    <ElDialog v-model="rejectVisible" title="驳回审核" width="520px" destroy-on-close>
      <ElForm ref="rejectFormRef" :model="rejectForm" :rules="rejectRules" label-width="80px">
        <ElFormItem label="审核意见" prop="remark">
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
  import { auditApply, fetchApplyDetail } from '@/api/apply'
  import {
    auditNodeStatusType,
    auditStatusLabel,
    auditStatusTagType
  } from '@/utils/apply-status'
  import type { ApplyOrder } from '@/types/apply'
  import { useUserStore } from '@/store/modules/user'
  import ApplyCustomConfigsSection from '../components/ApplyCustomConfigsSection.vue'
  import ApplyPlanSection from '../components/ApplyPlanSection.vue'

  defineOptions({ name: 'ApplyAuditDetailPage' })

  const route = useRoute()
  const router = useRouter()
  const userStore = useUserStore()
  const loading = ref(false)
  const submitting = ref(false)
  const rejectVisible = ref(false)
  const rejectFormRef = ref<FormInstance>()
  const detail = ref<ApplyOrder | null>(null)
  const rejectForm = reactive({ remark: '' })
  const rejectRules: FormRules = {
    remark: [{ required: true, message: '请填写审核意见', trigger: 'blur' }]
  }

  const currentUserName = computed(
    () => userStore.getUserInfo?.nickname || userStore.getUserInfo?.username || ''
  )
  const canAudit = computed(() => {
    if (!detail.value || detail.value.status !== '审核中') return false
    return detail.value.currentAuditor === currentUserName.value
  })

  function goBack() {
    const from = String(route.query.from || '')
    router.push({
      path: '/apply/audit',
      query: from === 'pending' ? { tab: 'pending' } : {}
    })
  }

  async function loadDetail() {
    const id = Number(route.params.id)
    loading.value = true
    try {
      const res = await fetchApplyDetail(id)
      if (res.code === 200) detail.value = res.data
      else ElMessage.error(res.message || '加载失败')
    } finally {
      loading.value = false
    }
  }

  async function handlePass() {
    if (!detail.value || !canAudit.value) {
      ElMessage.warning('仅当前审核人可操作')
      return
    }
    submitting.value = true
    try {
      const res = await auditApply({
        id: detail.value.id,
        action: 'pass',
        operator: currentUserName.value
      })
      if (res.code === 200) {
        ElMessage.success('审核通过')
        goBack()
      } else {
        ElMessage.error(res.message || '操作失败')
      }
    } finally {
      submitting.value = false
    }
  }

  async function handleReject() {
    if (!detail.value || !rejectFormRef.value || !canAudit.value) {
      ElMessage.warning('仅当前审核人可操作')
      return
    }
    await rejectFormRef.value.validate()
    submitting.value = true
    try {
      const res = await auditApply({
        id: detail.value.id,
        action: 'reject',
        remark: rejectForm.remark,
        operator: currentUserName.value
      })
      if (res.code === 200) {
        ElMessage.success('已驳回')
        rejectVisible.value = false
        goBack()
      } else {
        ElMessage.error(res.message || '操作失败')
      }
    } finally {
      submitting.value = false
    }
  }

  onMounted(loadDetail)
</script>

<style scoped lang="scss">
  @use '../ticket-detail.scss';
</style>
