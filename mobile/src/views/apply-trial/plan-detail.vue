<!-- 申请试用 · 方案详情（只读） -->
<template>
  <div class="page">
    <van-nav-bar title="方案详情" left-arrow @click-left="router.back()" />
    <van-loading v-if="loading" vertical style="padding: 40px">加载中...</van-loading>
    <template v-else-if="detail">
      <div class="section-card">
        <van-cell title="方案名称" :value="detail.name" />
        <van-cell title="试用时间" :value="detail.trialTimeLabel" />
        <van-cell title="总延期次数" :value="String(detail.totalExtend)" />
        <div class="intro-block">
          <div class="intro-label">方案介绍</div>
          <div class="scrollable-text">{{ detail.intro || '—' }}</div>
        </div>
      </div>
    </template>
    <van-empty v-else description="暂无数据" />
  </div>
</template>

<script setup lang="ts">
  import { fetchPlanOptionDetail } from '@/api/h5'
  import type { PlanOption } from '@/types/h5'

  defineOptions({ name: 'ApplyPlanDetailPage' })

  const route = useRoute()
  const router = useRouter()
  const loading = ref(false)
  const detail = ref<PlanOption | null>(null)

  onMounted(async () => {
    loading.value = true
    try {
      const res = await fetchPlanOptionDetail(Number(route.params.id))
      detail.value = res.code === 200 ? res.data : null
    } finally {
      loading.value = false
    }
  })
</script>

<style scoped lang="scss">
  .intro-block {
    padding: 12px 16px 4px;
  }

  .intro-label {
    font-size: 14px;
    color: #646566;
    margin-bottom: 8px;
  }

  .scrollable-text {
    max-height: 220px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding: 10px 12px;
    background: #f7f8fa;
    border-radius: 8px;
    font-size: 14px;
    line-height: 1.6;
    color: #646566;
    word-break: break-word;
    white-space: pre-wrap;
  }
</style>
