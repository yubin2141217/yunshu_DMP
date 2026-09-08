<!-- 待审核消息跳转引导页：校验工单状态并处理撤销场景 -->
<template>
  <div class="audit-guide-page">
    <van-nav-bar title="工单审核" left-arrow @click-left="goBack" />

    <div class="guide-body">
      <van-loading v-if="loading" vertical size="24px">正在打开工单...</van-loading>
      <template v-else-if="order">
        <div class="guide-card">
          <div class="guide-card__icon">
            <van-icon name="orders-o" />
          </div>
          <div class="guide-card__title">待审核工单</div>
          <div class="guide-card__meta">
            <p>机构：{{ order.orgName }}</p>
            <p>方案：{{ order.planName }}</p>
            <p>工单编号：{{ order.orderNo }}</p>
          </div>
          <div v-if="order.status === '草稿'" class="guide-card__hint">
            该工单已撤销为草稿，请确认是否查看草稿详情。
          </div>
          <div v-else-if="order.status === '审核中'" class="guide-card__hint">
            正在进入审核详情...
          </div>
        </div>
      </template>
      <van-empty v-else description="工单不存在或已删除" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { showDialog, showToast } from 'vant'
  import { fetchApplyDetail } from '@/api/h5'
  import type { ApplyOrderRow } from '@/types/h5'

  defineOptions({ name: 'AuditGuidePage' })

  const route = useRoute()
  const router = useRouter()
  const loading = ref(true)
  const order = ref<ApplyOrderRow | null>(null)
  let dialogShown = false

  const orderId = computed(() => Number(route.params.orderId))

  function goBack() {
    router.back()
  }

  async function showRevokedDialog() {
    if (dialogShown) return
    dialogShown = true
    await showDialog({
      title: '提示',
      message: '该工单已被撤销，是否前往草稿查看工单详情',
      confirmButtonText: '确定'
    })
    router.replace({
      path: `/apply/detail/${orderId.value}`,
      query: { fromDraftGuide: '1' }
    })
  }

  async function resolveRoute() {
    if (!order.value) return
    if (order.value.status === '审核中') {
      router.replace({
        path: `/apply/detail/${orderId.value}`,
        query: { fromAudit: '1' }
      })
      return
    }
    if (order.value.status === '草稿') {
      await showRevokedDialog()
      return
    }
    showToast(`当前工单状态为「${order.value.status}」，无法审核`)
    setTimeout(() => router.back(), 1200)
  }

  async function load() {
    loading.value = true
    try {
      const res = await fetchApplyDetail(orderId.value)
      order.value = res.code === 200 ? res.data : null
      if (!order.value) {
        showToast('工单不存在')
        return
      }
      await resolveRoute()
    } finally {
      loading.value = false
    }
  }

  onMounted(load)
</script>

<style scoped lang="scss">
  .audit-guide-page {
    min-height: 100vh;
    background: #f5f6f8;
  }

  .guide-body {
    padding: 24px 16px;
  }

  .guide-card {
    padding: 28px 20px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgb(0 0 0 / 6%);
    text-align: center;
  }

  .guide-card__icon {
    width: 56px;
    height: 56px;
    margin: 0 auto 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: #ecf5ff;
    color: #1989fa;
    font-size: 28px;
  }

  .guide-card__title {
    margin-bottom: 16px;
    font-size: 17px;
    font-weight: 600;
    color: #323233;
  }

  .guide-card__meta {
    text-align: left;
    padding: 12px 14px;
    background: #f7f8fa;
    border-radius: 8px;

    p {
      margin: 0 0 8px;
      font-size: 14px;
      line-height: 1.5;
      color: #646566;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .guide-card__hint {
    margin-top: 16px;
    font-size: 13px;
    line-height: 1.6;
    color: #969799;
  }
</style>
