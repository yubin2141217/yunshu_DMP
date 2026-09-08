<!-- 工单详情（参考审核详情视觉） -->
<template>
  <div class="page detail-page">
    <van-nav-bar title="工单详情" left-arrow @click-left="router.back()" />
    <van-loading v-if="loading" vertical style="padding: 40px">加载中...</van-loading>
    <template v-else-if="detail">
      <div class="hero">
        <div class="hero-card">
          <div class="hero-card__head">工单ID: {{ detail.orderNo }}</div>
          <div class="hero-card__body">
            <div class="hero-kv">
              <span class="hero-kv__label">申请人</span>
              <span class="hero-kv__value">{{ detail.applicant }}</span>
            </div>
            <div class="hero-kv">
              <span class="hero-kv__label">申请类型</span>
              <span class="hero-kv__value">{{ detail.applyType }}</span>
            </div>
            <div class="hero-kv">
              <span class="hero-kv__label">申请时间</span>
              <span class="hero-kv__value">{{ detail.applyTime }}</span>
            </div>
            <div class="status-stamp" :class="`status-stamp--${stampTone}`">
              {{ statusDisplay(detail.status) }}
            </div>
          </div>
        </div>
      </div>

      <div class="tabs-wrap">
        <van-tabs v-model:active="innerTab" shrink color="#1989fa" title-active-color="#1989fa">
          <van-tab title="申请信息">
            <div class="panel-card">
              <div class="panel-title">工单信息</div>
              <div class="field-list">
                <div class="field-item">
                  <div class="field-label">机构简称</div>
                  <div class="field-value">{{ detail.orgName || '—' }}</div>
                </div>
                <div class="field-item">
                  <div class="field-label">产品名称</div>
                  <div class="field-value">{{ detail.productName || '—' }}</div>
                </div>
                <div class="field-item">
                  <div class="field-label">方案名称</div>
                  <div class="field-value">{{ detail.planName || '—' }}</div>
                </div>
                <div class="field-item">
                  <div class="field-label">试用时间</div>
                  <div class="field-value">{{ detail.trialTimeLabel || '—' }}</div>
                </div>
              </div>

              <div class="dash-sep" />
              <div class="block-field">
                <div class="field-label">方案介绍</div>
                <div class="block-text">{{ detail.planIntro || '—' }}</div>
              </div>

              <div class="dash-sep" />
              <div class="block-field">
                <div class="field-label">附加配置</div>
                <div v-if="!customConfigRows.length" class="block-text">—</div>
                <div v-else class="extra-cfg-list">
                  <div
                    v-for="(row, idx) in customConfigRows"
                    :key="`${row.name}-${idx}`"
                    class="extra-cfg-item"
                  >
                    <div class="extra-cfg-item__name">{{ row.name }}</div>
                    <div class="extra-cfg-item__value">{{ row.value || '—' }}</div>
                  </div>
                </div>
              </div>

              <div class="dash-sep" />
              <div class="block-field">
                <div class="field-label">申请说明</div>
                <div class="block-text">{{ detail.applyRemark || '—' }}</div>
              </div>

              <template v-if="detail.planUsage">
                <div class="dash-sep" />
                <div class="panel-title panel-title--sub">方案使用信息</div>
                <div class="field-list">
                  <div class="field-item">
                    <div class="field-label">方案名称</div>
                    <div class="field-value">{{ detail.planUsage.planName }}</div>
                  </div>
                  <div class="field-item">
                    <div class="field-label">开始日期</div>
                    <div class="field-value">{{ detail.planUsage.startDate }}</div>
                  </div>
                  <div class="field-item">
                    <div class="field-label">结束日期</div>
                    <div class="field-value">{{ detail.planUsage.endDate }}</div>
                  </div>
                  <div class="field-item">
                    <div class="field-label">方案状态</div>
                    <div class="field-value">{{ detail.planUsage.planStatus }}</div>
                  </div>
                  <div class="field-item">
                    <div class="field-label">剩余时间</div>
                    <div class="field-value">{{ detail.planUsage.remainTime }}</div>
                  </div>
                  <div class="field-item">
                    <div class="field-label">已延期次数</div>
                    <div class="field-value">{{ detail.planUsage.extendedCount }}</div>
                  </div>
                  <div class="field-item">
                    <div class="field-label">待生效延期</div>
                    <div class="field-value">{{ detail.planUsage.pendingExtendCount }}</div>
                  </div>
                </div>
              </template>

              <template v-if="detail.extendRecords?.length">
                <div class="dash-sep" />
                <div class="panel-title panel-title--sub">延期记录</div>
                <div
                  v-for="(row, i) in detail.extendRecords"
                  :key="i"
                  class="extend-row"
                >
                  <div class="field-value">{{ row.applyTime }}</div>
                  <div class="muted">延期 {{ row.extendDays }} 天 · {{ row.status }}</div>
                </div>
              </template>
            </div>
          </van-tab>

          <van-tab title="审核信息">
            <div class="panel-card">
              <div class="panel-title">审核节点</div>
              <van-steps direction="vertical" :active="detail.auditNodes.length - 1">
                <van-step v-for="(node, i) in detail.auditNodes" :key="i">
                  <h4 class="step-title">
                    {{ node.operator }}（{{ node.role }}）— {{ node.action }}
                  </h4>
                  <p v-if="node.time" class="muted">{{ node.time }}</p>
                  <p v-if="node.remark" class="muted">{{ node.remark }}</p>
                </van-step>
              </van-steps>
            </div>
          </van-tab>
        </van-tabs>
      </div>

      <div class="page-bottom-space" />
      <div v-if="actionBarVisible" class="bottom-bar">
        <van-button
          v-if="detail.status === '草稿' && isOwner"
          block
          type="danger"
          plain
          @click="handleDelete"
        >
          删除
        </van-button>
        <van-button
          v-if="detail.status === '未通过' && isOwner"
          block
          type="default"
          plain
          @click="handleCancel"
        >
          取消
        </van-button>
        <van-button
          v-if="canEditDraft || (detail.status === '未通过' && isOwner)"
          block
          type="primary"
          @click="handleEdit"
        >
          编辑
        </van-button>
      </div>
    </template>
    <van-empty v-else description="暂无数据" />
  </div>
</template>

<script setup lang="ts">
  import { showConfirmDialog, showSuccessToast, showToast } from 'vant'
  import { deleteApply, fetchApplyDetail } from '@/api/h5'
  import type { ApplyOrderRow, H5ApplyStatus } from '@/types/h5'

  defineOptions({ name: 'ApplyDetailPage' })

  const CURRENT_USER = '王兴'

  const route = useRoute()
  const router = useRouter()
  const loading = ref(false)
  const detail = ref<ApplyOrderRow | null>(null)
  const innerTab = ref(0)

  const isOwner = computed(() => detail.value?.applicant === CURRENT_USER)
  const fromDraftGuide = computed(() => String(route.query.fromDraftGuide || '') === '1')
  const actionBarVisible = computed(() => {
    const d = detail.value
    if (!d) return false
    if (d.status === '草稿') return true
    return isOwner.value && d.status === '未通过'
  })
  const canEditDraft = computed(
    () => detail.value?.status === '草稿' && (isOwner.value || fromDraftGuide.value)
  )

  const customConfigRows = computed(() => {
    const order = detail.value
    if (!order) return [] as Array<{ name: string; value: string }>
    const configs = order.customConfigs || []
    if (configs.length) {
      return configs.map((cfg) => ({
        name: cfg.name,
        value: String(order.customAnswers?.[cfg.name] ?? '').trim()
      }))
    }
    const answers = order.customAnswers || {}
    return Object.keys(answers).map((name) => ({
      name,
      value: String(answers[name] ?? '').trim()
    }))
  })

  const stampTone = computed(() => {
    const s = detail.value?.status
    if (s === '已归档') return 'pass'
    if (s === '未通过') return 'reject'
    if (s === '处理中') return 'process'
    if (s === '草稿') return 'draft'
    return 'pending'
  })

  function statusDisplay(status: H5ApplyStatus) {
    if (status === '处理中') return '处理中'
    if (status === '未通过') return '驳回'
    if (status === '已归档') return '通过'
    if (status === '审核中') return '审核中'
    if (status === '草稿') return '草稿'
    return status
  }

  async function maybeShowRevokedGuide() {
    if (String(route.query.fromAudit || '') !== '1') return
    if (detail.value?.status !== '草稿') return
    try {
      await showConfirmDialog({
        title: '提示',
        message: '该工单已被撤销，是否前往草稿查看工单详情',
        confirmButtonText: '前往草稿',
        cancelButtonText: '返回'
      })
    } catch {
      router.back()
    }
  }

  async function load() {
    loading.value = true
    try {
      const res = await fetchApplyDetail(Number(route.params.id))
      detail.value = res.code === 200 ? res.data : null
      await maybeShowRevokedGuide()
    } finally {
      loading.value = false
    }
  }

  async function handleDelete() {
    await showConfirmDialog({ title: '确认删除', message: '删除后不可恢复。' })
    const res = await deleteApply(Number(route.params.id))
    if (res.code === 200) {
      showSuccessToast('已删除')
      router.replace('/apply')
    } else {
      showToast(res.message || '删除失败')
    }
  }

  async function handleCancel() {
    await showConfirmDialog({ title: '确认取消', message: '取消后该已驳回申请将不再保留。' })
    const res = await deleteApply(Number(route.params.id))
    if (res.code === 200) {
      showSuccessToast('已取消')
      router.back()
    } else {
      showToast(res.message || '取消失败')
    }
  }

  function handleEdit() {
    if (!detail.value) return
    router.push({
      path: '/apply-trial',
      query: { editId: String(detail.value.id) }
    })
  }

  onMounted(load)
</script>

<style scoped lang="scss">
  .detail-page {
    background: #f5f6f8;
  }

  .hero {
    background: linear-gradient(180deg, #1989fa 0%, #1989fa 72px, transparent 72px);
    padding: 12px 16px 0;
  }

  .hero-card {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgb(25 137 250 / 18%);
  }

  .hero-card__head {
    padding: 10px 14px;
    background: #3a4a63;
    color: #fff;
    font-size: 13px;
    font-weight: 500;
  }

  .hero-card__body {
    position: relative;
    padding: 14px 110px 14px 14px;
    background: #e8f3ff;
    min-height: 96px;
  }

  .hero-kv {
    display: flex;
    gap: 10px;
    margin-bottom: 8px;
    font-size: 13px;
    line-height: 1.4;

    &:last-of-type {
      margin-bottom: 0;
    }
  }

  .hero-kv__label {
    width: 56px;
    flex-shrink: 0;
    color: #646566;
  }

  .hero-kv__value {
    color: #323233;
    word-break: break-all;
  }

  .status-stamp {
    position: absolute;
    top: 18px;
    right: 16px;
    width: 72px;
    height: 72px;
    border-radius: 50%;
    border: 2px solid currentColor;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 700;
    transform: rotate(-18deg);
    opacity: 0.85;
    pointer-events: none;
  }

  .status-stamp--pass {
    color: #07c160;
  }

  .status-stamp--reject {
    color: #ee0a24;
  }

  .status-stamp--process {
    color: #ff976a;
  }

  .status-stamp--pending {
    color: #1989fa;
  }

  .status-stamp--draft {
    color: #969799;
  }

  .tabs-wrap {
    margin-top: 8px;
  }

  .tabs-wrap :deep(.van-tabs__wrap) {
    background: transparent;
  }

  .tabs-wrap :deep(.van-tabs__nav) {
    background: transparent;
  }

  .panel-card {
    margin: 0 12px 12px;
    padding: 16px 14px;
    background: #fff;
    border-radius: 12px;
  }

  .panel-title {
    position: relative;
    padding-left: 10px;
    margin-bottom: 14px;
    font-size: 15px;
    font-weight: 600;
    color: #1f2a44;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 14px;
      border-radius: 2px;
      background: #1989fa;
    }

    &--sub {
      margin-top: 4px;
    }
  }

  .field-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .field-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .field-label {
    font-size: 12px;
    color: #969799;
  }

  .field-value {
    font-size: 15px;
    color: #323233;
    line-height: 1.45;
    word-break: break-word;
  }

  .dash-sep {
    margin: 14px 0;
    border-top: 1px dashed #ebedf0;
  }

  .block-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .block-text {
    font-size: 14px;
    line-height: 1.6;
    color: #323233;
    word-break: break-word;
  }

  .extra-cfg-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .extra-cfg-item {
    display: flex;
    flex-direction: column;
    gap: 4px;

    &__name {
      font-size: 13px;
      color: #969799;
    }

    &__value {
      font-size: 14px;
      line-height: 1.5;
      color: #323233;
      word-break: break-word;
    }
  }

  .extend-row {
    padding: 8px 0;
    border-bottom: 1px solid #f2f3f5;

    &:last-child {
      border-bottom: none;
    }
  }

  .step-title {
    margin: 0 0 4px;
    font-size: 14px;
    font-weight: 600;
    color: #323233;
  }

  .muted {
    margin: 0;
    color: #969799;
    font-size: 12px;
    line-height: 1.5;
  }
</style>
