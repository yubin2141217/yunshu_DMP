<!-- 处理记录详情（只读） -->
<template>
  <div class="biz-detail-page" v-loading="loading">
    <ElCard shadow="never" class="biz-breadcrumb-card">
      <div class="biz-header-row">
        <ElButton text :icon="ArrowLeft" @click="router.push({ path: '/apply/todo', query: { tab: 'records' } })">返回</ElButton>
        <span class="title">{{ detail?.orderNo || '处理详情' }}</span>
        <ElTag
          v-if="detail"
          :type="detail.status === '已拒绝' ? 'danger' : 'success'"
          effect="light"
          round
        >
          {{ detail.processResult || detail.status }}
        </ElTag>
        <span v-if="detail" class="apply-type">{{ detail.applyType }}</span>
      </div>
    </ElCard>

    <template v-if="detail">
      <ElCard shadow="never" class="biz-section-card">
        <template #header>
          <div class="biz-card-title"><span>工单信息</span></div>
        </template>
        <ElDescriptions :column="2" border>
          <ElDescriptionsItem label="工单ID">{{ detail.orderNo }}</ElDescriptionsItem>
          <ElDescriptionsItem label="机构简称">{{ detail.orgName }}</ElDescriptionsItem>
          <ElDescriptionsItem label="申请人">{{ detail.applicant }}</ElDescriptionsItem>
          <ElDescriptionsItem label="申请类型">{{ detail.applyType }}</ElDescriptionsItem>
          <ElDescriptionsItem label="申请时间">{{ detail.applyTime }}</ElDescriptionsItem>
          <ElDescriptionsItem label="处理人">{{ detail.handler }}</ElDescriptionsItem>
        </ElDescriptions>
      </ElCard>

      <ElCard shadow="never" class="biz-section-card">
        <template #header>
          <div class="biz-card-title"><span>产品方案</span></div>
        </template>
        <ElDescriptions :column="2" border>
          <ElDescriptionsItem label="产品名称">{{ detail.productName }}</ElDescriptionsItem>
          <ElDescriptionsItem label="方案名称">{{ detail.planName }}</ElDescriptionsItem>
          <ElDescriptionsItem label="产品介绍" :span="2">{{ detail.productIntro }}</ElDescriptionsItem>
          <ElDescriptionsItem label="试用时间">{{ detail.trialTimeLabel }}</ElDescriptionsItem>
          <ElDescriptionsItem label="冷冻期规则">{{ detail.freezeRule }}</ElDescriptionsItem>
          <ElDescriptionsItem label="方案介绍" :span="2">{{ detail.planIntro }}</ElDescriptionsItem>
        </ElDescriptions>
      </ElCard>

      <ElCard shadow="never" class="biz-section-card">
        <template #header>
          <div class="biz-card-title"><span>申请说明</span></div>
        </template>
        <div class="remark-text">{{ detail.applyRemark || '—' }}</div>
      </ElCard>

      <ElCard shadow="never" class="biz-section-card">
        <template #header>
          <div class="biz-card-title"><span>审核节点</span></div>
        </template>
        <ElTimeline>
          <ElTimelineItem
            v-for="(node, idx) in detail.auditNodes"
            :key="idx"
            :timestamp="node.time || ''"
            placement="top"
          >
            <div class="node-title">{{ node.operator }}（{{ node.role }}）— {{ node.action }}</div>
            <div v-if="node.remark" class="node-remark">{{ node.remark }}</div>
          </ElTimelineItem>
        </ElTimeline>
      </ElCard>

      <ElCard shadow="never" class="biz-section-card">
        <template #header>
          <div class="biz-card-title"><span>处理结果</span></div>
        </template>
        <ElDescriptions :column="2" border>
          <ElDescriptionsItem label="处理结果">{{
            detail.processResult || '—'
          }}</ElDescriptionsItem>
          <ElDescriptionsItem label="处理时间">{{ detail.processTime || '—' }}</ElDescriptionsItem>
          <ElDescriptionsItem v-if="detail.planId" label="方案ID">{{
            detail.planId
          }}</ElDescriptionsItem>
          <ElDescriptionsItem v-if="detail.expireTime" label="到期时间">{{
            detail.expireTime
          }}</ElDescriptionsItem>
          <ElDescriptionsItem
            v-for="field in detail.productFeatureFields || []"
            :key="field.key"
            :label="field.label"
          >
            {{ detail.productFeatures?.[field.key] || '—' }}
          </ElDescriptionsItem>
        </ElDescriptions>
      </ElCard>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { ArrowLeft } from '@element-plus/icons-vue'
  import { fetchApplyDetail } from '@/api/apply'
  import type { ApplyOrder } from '@/types/apply'

  defineOptions({ name: 'ApplyRecordDetailPage' })

  const route = useRoute()
  const router = useRouter()
  const loading = ref(false)
  const detail = ref<ApplyOrder | null>(null)

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

  onMounted(loadDetail)
</script>

<style scoped lang="scss">
  .apply-type {
    color: var(--el-text-color-secondary);
  }
  .remark-text {
    line-height: 1.6;
    color: var(--el-text-color-regular);
  }
  .node-title {
    font-weight: 500;
  }
  .node-remark {
    margin-top: 4px;
    color: var(--el-text-color-secondary);
    font-size: 13px;
  }
</style>
