<!-- 机构详情 -->
<template>
  <div class="page">
    <van-nav-bar title="机构详情" left-arrow @click-left="router.back()" />
    <van-loading v-if="loading" vertical style="padding: 40px">加载中...</van-loading>
    <template v-else-if="data">
      <div class="org-head section-card">
        <div class="org-head__logo">{{ data.org.name.slice(0, 1) }}</div>
        <div>
          <div class="org-head__name">{{ data.org.name }}</div>
          <div class="muted">所属销售：{{ data.org.sales }}</div>
        </div>
      </div>
      <div class="section-title" style="margin: 8px 16px">产品方案</div>
      <div
        v-for="item in data.plans"
        :key="item.id"
        class="plan-card"
        @click="openPlan(item)"
      >
        <div class="plan-card__badge" :class="badgeClass(item)">
          {{ badgeText(item) }}
        </div>
        <div
          v-if="item.status === '冷冻期' && countdownMap[item.id]"
          class="plan-card__countdown is-freeze"
        >
          冷冻期倒计时 {{ countdownMap[item.id] }}
        </div>
        <div
          v-else-if="item.status === '即将到期' && countdownMap[item.id]"
          class="plan-card__countdown is-warning"
        >
          试用倒计时 {{ countdownMap[item.id] }}
        </div>
        <div class="plan-card__name">{{ item.productName }}</div>
        <div class="muted">方案：{{ item.planName }}</div>
        <div v-if="item.status === '申请中'" class="muted">
          工单状态：{{ badgeText(item) }}
        </div>
        <div v-else-if="item.status === '停用'" class="muted">停用时间：{{ item.endDate }}</div>
        <div v-else class="muted">到期时间：{{ item.expireTime }}</div>
      </div>
    </template>
    <van-empty v-else description="暂无数据" />
  </div>
</template>

<script setup lang="ts">
  import { fetchTrialOrgDetail } from '@/api/h5'
  import type { OrgItem, PlanUseStatus, TrialPlanRow } from '@/types/h5'
  import { formatFreezeCountdown, getFreezeRemainMs } from '@/utils/freeze-countdown'

  defineOptions({ name: 'OrgStatsOrgDetailPage' })

  const route = useRoute()
  const router = useRouter()
  const loading = ref(false)
  const data = ref<{ org: OrgItem; plans: TrialPlanRow[] } | null>(null)
  const countdownMap = reactive<Record<number, string>>({})
  let timer: ReturnType<typeof setInterval> | null = null

  /** 方案状态角标文案（方案侧仅有申请中，不展示工单细分状态） */
  function badgeText(item: TrialPlanRow) {
    return item.status
  }

  function badgeClass(item: TrialPlanRow) {
    return statusClass(item.status)
  }

  function statusClass(status: PlanUseStatus) {
    if (status === '试用中') return 'is-success'
    if (status === '即将到期') return 'is-warning'
    if (status === '已到期' || status === '停用') return 'is-danger'
    if (status === '冷冻期') return 'is-freeze'
    if (status === '申请中') return 'is-primary'
    return ''
  }

  function openPlan(item: TrialPlanRow) {
    router.push(`/org-stats/plan/${item.id}`)
  }

  function tickCountdowns() {
    if (!data.value) return
    data.value.plans.forEach((item) => {
      if (item.status === '冷冻期') {
        const endTime =
          item.freezeEndTime || (item.freezeEndDate ? `${item.freezeEndDate} 23:59:59` : '')
        let remain = getFreezeRemainMs(endTime)
        if (!endTime && item.freezeDaysLeft && item.freezeDaysLeft > 0) {
          remain = item.freezeDaysLeft * 86400000
        }
        countdownMap[item.id] = formatFreezeCountdown(Math.max(remain, 0))
        return
      }
      if (item.status === '即将到期') {
        const remain = getFreezeRemainMs(item.expireTime)
        countdownMap[item.id] = formatFreezeCountdown(Math.max(remain, 0))
        return
      }
      delete countdownMap[item.id]
    })
  }

  onMounted(async () => {
    loading.value = true
    try {
      const res = await fetchTrialOrgDetail(Number(route.params.id))
      data.value = res.code === 200 ? res.data : null
      tickCountdowns()
      timer = setInterval(tickCountdowns, 1000)
    } finally {
      loading.value = false
    }
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })
</script>

<style scoped lang="scss">
  .org-head {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .org-head__logo {
    width: 52px;
    height: 52px;
    border-radius: 12px;
    background: linear-gradient(135deg, #4e8cff, #1989fa);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 700;
  }

  .org-head__name {
    font-size: 17px;
    font-weight: 650;
  }

  .plan-card {
    position: relative;
    margin: 10px 12px;
    padding: 28px 14px 14px;
    background: #fff;
    border-radius: 10px;
    overflow: hidden;
  }

  .plan-card__badge {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    font-size: 11px;
    color: #fff;
    padding: 2px 8px;
    border-radius: 10px 0 8px 0;
    background: #969799;

    &.is-primary {
      background: #1989fa;
    }

    &.is-warning {
      background: #ff976a;
    }

    &.is-danger {
      background: #ee0a24;
    }

    &.is-freeze {
      background: #7232dd;
    }

    &.is-success {
      background: #07c160;
    }
  }

  .plan-card__countdown {
    position: absolute;
    top: 4px;
    right: 10px;
    z-index: 1;
    margin: 0;
    text-align: right;
    font-size: 11px;
    line-height: 1.4;
    max-width: 68%;

    &.is-freeze {
      color: #ee0a24;
    }

    &.is-warning {
      color: #ff976a;
    }
  }

  .plan-card__name {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 6px;
  }
</style>
