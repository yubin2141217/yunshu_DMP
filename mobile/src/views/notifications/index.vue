<!-- 消息通知列表 -->
<template>
  <div class="notice-page">
    <van-nav-bar title="产品试用申请" left-arrow fixed placeholder @click-left="router.back()" />

    <van-pull-refresh v-model="refreshing" @refresh="load">
      <van-loading v-if="loading && !list.length" vertical class="page-loading">
        加载中...
      </van-loading>
      <van-empty v-else-if="!list.length" description="暂无消息通知" />
      <div v-else class="notice-feed">
        <template v-for="(item, idx) in list" :key="item.id">
          <div v-if="showTimeDivider(idx)" class="notice-time">{{ formatPushTime(item.pushTime) }}</div>
          <article class="notice-card">
            <div class="notice-card__icon">
              <van-icon name="setting-o" />
            </div>
            <div class="notice-card__body">
              <h3 class="notice-card__title">{{ item.title }}</h3>
              <div class="notice-card__fields">
                <template v-if="item.kind === 'expire_soon'">
                  <p><span class="label">机构</span>{{ item.orgName || '—' }}</p>
                  <p><span class="label">方案</span>{{ item.planName || '—' }}</p>
                  <p><span class="label">剩余可用时长</span>{{ item.remainTime || '—' }}</p>
                  <p><span class="label">到期时间</span>{{ item.expireTime || '—' }}</p>
                </template>
                <template v-else-if="item.kind === 'todo_audit'">
                  <p><span class="label">类型</span>{{ item.applyType || '—' }}</p>
                  <p><span class="label">机构</span>{{ item.orgName || '—' }}</p>
                  <p><span class="label">方案</span>{{ item.planName || '—' }}</p>
                  <p><span class="label">申请人</span>{{ item.applicant || '—' }}</p>
                  <p><span class="label">申请时间</span>{{ item.applyTime || '—' }}</p>
                  <p><span class="label">工单编号</span>{{ item.orderNo || '—' }}</p>
                </template>
                <template v-else>
                  <p><span class="label">机构</span>{{ item.orgName || '—' }}</p>
                  <p><span class="label">方案</span>{{ item.planName || '—' }}</p>
                </template>
              </div>
              <button type="button" class="notice-card__link" @click="handleDetail(item)">
                点击查看详情
              </button>
            </div>
          </article>
        </template>
      </div>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
  import { showToast } from 'vant'
  import { fetchMessageNotifications } from '@/api/h5'
  import type { MessageNotification } from '@/types/h5'

  defineOptions({ name: 'MessageNotificationsPage' })

  const router = useRouter()
  const loading = ref(false)
  const refreshing = ref(false)
  const list = ref<MessageNotification[]>([])

  function formatPushTime(time: string) {
    const m = time.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/)
    if (!m) return time
    return `${Number(m[2])}月${Number(m[3])}日 ${m[4]}:${m[5]}`
  }

  function showTimeDivider(idx: number) {
    if (idx === 0) return true
    const cur = formatPushTime(list.value[idx].pushTime)
    const prev = formatPushTime(list.value[idx - 1].pushTime)
    return cur !== prev
  }

  function handleDetail(item: MessageNotification) {
    if (item.kind === 'todo_audit' && item.orderId) {
      router.push(`/notifications/audit-guide/${item.orderId}`)
      return
    }
    if (item.kind === 'todo_process' && item.orderId) {
      router.push(`/apply/detail/${item.orderId}`)
      return
    }
    if (item.kind === 'expire_soon' && item.trialPlanId) {
      router.push(`/org-stats/plan/${item.trialPlanId}`)
      return
    }
    showToast('暂无法打开详情')
  }

  async function load() {
    if (!refreshing.value) loading.value = true
    try {
      const res = await fetchMessageNotifications()
      list.value = res.code === 200 ? res.data : []
    } finally {
      loading.value = false
      refreshing.value = false
    }
  }

  onMounted(load)
</script>

<style scoped lang="scss">
  .notice-page {
    min-height: 100vh;
    background: #ededed;
  }

  .page-loading {
    padding: 48px 0;
  }

  .notice-feed {
    padding: 12px 12px 24px;
  }

  .notice-time {
    margin: 16px 0 10px;
    text-align: center;
    font-size: 12px;
    color: #969799;
    line-height: 1.4;

    &:first-child {
      margin-top: 4px;
    }
  }

  .notice-card {
    display: flex;
    gap: 12px;
    padding: 14px 14px 12px;
    margin-bottom: 12px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgb(0 0 0 / 6%);
  }

  .notice-card__icon {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: #fff3e6;
    color: #ff976a;
    font-size: 22px;
  }

  .notice-card__body {
    flex: 1;
    min-width: 0;
  }

  .notice-card__title {
    margin: 0 0 10px;
    font-size: 15px;
    font-weight: 600;
    color: #323233;
    line-height: 1.4;
  }

  .notice-card__fields {
    p {
      margin: 0 0 6px;
      font-size: 13px;
      line-height: 1.5;
      color: #646566;
      word-break: break-all;
    }

    .label {
      display: inline-block;
      min-width: 4.5em;
      margin-right: 6px;
      color: #969799;
    }
  }

  .notice-card__link {
    margin-top: 8px;
    padding: 0;
    border: none;
    background: transparent;
    font-size: 14px;
    color: #1989fa;
    cursor: pointer;
  }
</style>
