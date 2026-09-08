<!-- 产品详情：摘要卡 + 产品介绍 + 方案列表 -->
<template>
  <div class="biz-detail-page product-detail-page" v-loading="loading">
    <div class="detail-nav">
      <ElButton text :icon="ArrowLeft" @click="router.push('/product/list')">产品详情</ElButton>
    </div>

    <section class="info-section">
      <div class="section-title">产品信息</div>
      <div class="info-layout">
        <div class="info-summary-card">
          <div class="summary-top">
            <ElImage
              v-if="detail?.logo"
              :src="detail.logo"
              class="summary-logo"
              fit="contain"
            />
            <div v-else class="summary-logo summary-logo--empty">暂无</div>
            <div class="summary-name-row">
              <h2 class="summary-name">{{ detail?.name || '—' }}</h2>
              <span v-if="detail" class="summary-status">
                状态：{{ detail.displayStatus === 1 ? '打开' : '关闭' }}
              </span>
            </div>
          </div>
          <div class="summary-org">
            <div class="summary-org-label">产品ID</div>
            <div class="summary-org-value">{{ detail?.id ?? '—' }}</div>
          </div>
          <div class="summary-org">
            <div class="summary-org-label">机构类型可用</div>
            <div class="summary-org-value">{{ detail?.orgTypes?.join('，') || '—' }}</div>
          </div>
          <div class="summary-org">
            <div class="summary-org-label">展示位置</div>
            <div class="summary-org-value">{{ detail?.sortOrder ?? '—' }}</div>
          </div>
        </div>

        <div class="info-intro">
          <div class="intro-title">产品介绍</div>
          <p class="intro-text">{{ detail?.intro || '暂无介绍' }}</p>
        </div>
      </div>
    </section>

    <section class="plan-section">
      <div class="plan-section-header">
        <div class="plan-section-title-wrap">
          <div class="section-title">产品方案</div>
          <span class="plan-section-tip">如需修改方案请到方案管理模块操作！</span>
        </div>
      </div>
      <ElTable :data="planList" style="width: 100%" class="plan-table">
        <ElTableColumn type="index" label="序号" width="64" align="center" />
        <ElTableColumn prop="name" label="方案名称" min-width="160" show-overflow-tooltip />
        <ElTableColumn label="使用机构数量" width="120" align="center">
          <template #default="{ row }">
            <ElButton link type="primary" @click="goOrgStats(row.id, 'use')">{{
              row.useOrgCount
            }}</ElButton>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="trialTimeLabel" label="试用期" width="100" />
        <ElTableColumn prop="extensionCount" label="可延期次数" width="110" align="center" />
        <ElTableColumn prop="intro" label="方案介绍" min-width="180" show-overflow-tooltip />
        <ElTableColumn prop="handler" label="方案处理人" width="110" />
        <ElTableColumn label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <ElButton link type="primary" @click="goPlanDetail(row.id)">详情</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { ArrowLeft } from '@element-plus/icons-vue'
  import {
    fetchPlansByProduct,
    fetchProductDetail
  } from '@/api/product'
  import type { Plan, Product } from '@/types/product'

  defineOptions({ name: 'ProductDetailPage' })

  const route = useRoute()
  const router = useRouter()
  const loading = ref(false)
  const detail = ref<Product | null>(null)
  const planList = ref<Plan[]>([])

  async function loadData() {
    const id = Number(route.params.id)
    loading.value = true
    try {
      const [detailRes, planRes] = await Promise.all([
        fetchProductDetail(id),
        fetchPlansByProduct(id)
      ])
      if (detailRes.code === 200) detail.value = detailRes.data
      if (planRes.code === 200) planList.value = planRes.data
    } finally {
      loading.value = false
    }
  }

  function goOrgStats(planId: number, statusType: string) {
    router.push({ path: `/product/stats/org/${planId}`, query: { statusType } })
  }

  function goPlanDetail(planId: number) {
    router.push(`/product/plan/detail/${planId}`)
  }

  onMounted(loadData)
</script>

<style scoped lang="scss">
  .product-detail-page {
    padding: 16px 20px 32px;
    background: var(--el-bg-color-page, #f5f7fa);
    min-height: 100%;
  }

  .detail-nav {
    margin-bottom: 12px;

    :deep(.el-button) {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      padding-left: 0;
    }
  }

  .section-title {
    position: relative;
    padding-left: 10px;
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 16px;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 14px;
      border-radius: 2px;
      background: var(--el-color-primary);
    }
  }

  .info-section {
    background: var(--el-bg-color);
    border-radius: 8px;
    padding: 20px 24px 24px;
    margin-bottom: 16px;
  }

  .info-layout {
    display: flex;
    gap: 24px;
    align-items: stretch;
  }

  .info-summary-card {
    flex: 0 0 320px;
    background: #f7f9fc;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 1px 4px rgb(0 0 0 / 4%);
  }

  .summary-top {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }

  .summary-logo {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    flex-shrink: 0;
    background: #fff;
  }

  .summary-logo--empty {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: var(--el-text-color-placeholder);
    border: 1px dashed var(--el-border-color);
  }

  .summary-name-row {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .summary-name {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    line-height: 1.3;
    color: var(--el-text-color-primary);
    min-width: 0;
  }

  .summary-status {
    flex-shrink: 0;
    margin-left: auto;
    font-size: 14px;
    color: var(--el-text-color-regular);
    white-space: nowrap;
  }

  .summary-org {
    margin-top: 20px;
  }

  .summary-org-label {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    margin-bottom: 6px;
  }

  .summary-org-value {
    font-size: 14px;
    color: var(--el-text-color-primary);
    line-height: 1.5;
  }

  .info-intro {
    flex: 1;
    min-width: 0;
    padding-top: 4px;
  }

  .intro-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 10px;
  }

  .intro-title--api {
    margin-top: 20px;
  }

  .intro-text {
    margin: 0;
    font-size: 14px;
    line-height: 1.8;
    color: var(--el-text-color-regular);
    white-space: pre-wrap;
    word-break: break-word;
  }

  .intro-text--api {
    word-break: break-all;
  }

  .plan-section {
    background: var(--el-bg-color);
    border-radius: 8px;
    padding: 20px 24px 24px;
  }

  .plan-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;

    .section-title {
      margin-bottom: 0;
    }
  }

  .plan-section-title-wrap {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
  }

  .plan-section-tip {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    line-height: 1.4;
  }

  .plan-table {
    :deep(.el-table__header th) {
      background: #eef3fb;
    }
  }
</style>
