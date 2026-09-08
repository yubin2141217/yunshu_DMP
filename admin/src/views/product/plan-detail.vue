<!-- 方案详情：配置信息只读展示 -->
<template>
  <div class="biz-detail-page plan-detail-page" v-loading="loading">
    <div class="detail-nav">
      <ElButton text :icon="ArrowLeft" @click="handleBack">方案详情</ElButton>
    </div>

    <template v-if="detail">
      <section class="info-section">
        <div class="section-title">基本信息</div>
        <div class="summary-row">
          <div class="summary-main">
            <h2 class="summary-name">{{ detail.name }}</h2>
            <div class="summary-product">
              所属产品：{{ detail.productName || '—' }}
            </div>
            <div class="summary-status">
              状态：{{ detail.displayStatus === 1 ? '打开' : '关闭' }}
            </div>
          </div>
        </div>
        <div class="field-block">
          <div class="field-label">方案介绍</div>
          <p class="field-text">{{ detail.intro || '—' }}</p>
        </div>
      </section>

      <section class="info-section">
        <div class="section-title">试用与延期</div>
        <div class="kv-grid">
          <div class="kv-item">
            <div class="field-label">试用时间</div>
            <div class="field-value">{{ detail.trialTimeLabel || '—' }}</div>
          </div>
          <div class="kv-item">
            <div class="field-label">可延期次数</div>
            <div class="field-value">
              {{ detail.extensionCount }} 次
              <span class="field-tip-below">1次延期默认为30天</span>
            </div>
          </div>
          <div class="kv-item">
            <div class="field-label">同机构是否可重复申请</div>
            <div class="field-value">{{ detail.allowRepeatApply ? '是' : '否' }}</div>
          </div>
        </div>
      </section>

      <section v-if="detail.extensionCount > 0" class="info-section">
        <div class="section-title">冷冻期规则</div>
        <div class="freeze-tip">试用到期后自动进入冷冻期，冷冻期内不允许申请延期</div>
        <ElTable :data="freezeRows" border size="small" class="freeze-table">
          <ElTableColumn type="index" label="序号" width="64" align="center" />
          <ElTableColumn label="冷冻期规则" min-width="280">
            <template #default>试用期结束后，可再次发起延期的间隔时长为</template>
          </ElTableColumn>
          <ElTableColumn label="时间（天）" width="120" align="center">
            <template #default="{ row }">{{ row.days }}</template>
          </ElTableColumn>
        </ElTable>
      </section>

      <section class="info-section">
        <div class="section-title">方案处理人</div>
        <div class="api-block">
          <p class="api-text">{{ detail.handler || '—' }}</p>
        </div>
      </section>

      <section class="info-section">
        <div class="section-title">方案接入API</div>
        <div class="api-block">
          <p class="api-text">{{ detail.accessApi || '—' }}</p>
        </div>
      </section>

      <section class="info-section">
        <div class="section-title">附加配置</div>
        <div v-if="!(detail.customConfigs?.length)" class="empty-tip">暂无附加配置</div>
        <div
          v-for="(item, idx) in detail.customConfigs || []"
          :key="idx"
          class="config-card"
        >
          <div class="config-row">
            <span class="config-name">{{ item.name || '—' }}</span>
            <ElTag size="small" type="info">{{ controlLabel(item.control) }}</ElTag>
            <ElTag size="small" :type="item.required ? 'danger' : 'info'">
              {{ item.required ? '必填' : '非必填' }}
            </ElTag>
          </div>
          <div v-if="item.control === 'radio' || item.control === 'checkbox'" class="config-options">
            选项：
            <template v-for="(opt, oIdx) in item.options || []" :key="oIdx">
              <span v-if="opt">
                {{ opt
                }}<span
                  v-if="item.required && item.defaultIndexes?.includes(oIdx)"
                  class="default-mark"
                  >（默认）</span
                >{{ oIdx < (item.options?.length || 0) - 1 ? '、' : '' }}
              </span>
            </template>
            <span v-if="!(item.options?.filter(Boolean).length)">—</span>
          </div>
          <div class="config-tip">提示：{{ item.tip || '—' }}</div>
        </div>
      </section>
    </template>

    <ElEmpty v-else-if="!loading" description="方案不存在或已删除" />
  </div>
</template>

<script setup lang="ts">
  import { ArrowLeft } from '@element-plus/icons-vue'
  import { fetchPlanDetail } from '@/api/product'
  import type { CustomConfigControl, Plan } from '@/types/product'

  defineOptions({ name: 'PlanDetailPage' })

  const route = useRoute()
  const router = useRouter()
  const loading = ref(false)
  const detail = ref<Plan | null>(null)

  const freezeRows = computed(() =>
    (detail.value?.freezeDays || []).map((days, idx) => ({ idx, days }))
  )

  function controlLabel(control: CustomConfigControl) {
    const map: Record<CustomConfigControl, string> = {
      input: '文本框',
      radio: '单选',
      checkbox: '多选'
    }
    return map[control] || control
  }

  /** 从机构详情等入口进入时按 from 回退，否则回方案列表 */
  function handleBack() {
    const from = route.query.from
    if (typeof from === 'string' && from.startsWith('/') && !from.startsWith('//')) {
      router.push(from)
      return
    }
    router.push('/product/plans')
  }

  async function loadData() {
    const id = Number(route.params.id)
    if (!id) {
      detail.value = null
      return
    }
    loading.value = true
    try {
      const res = await fetchPlanDetail(id)
      if (res.code === 200 && res.data) {
        detail.value = res.data
      } else {
        detail.value = null
        ElMessage.error(res.message || '加载方案详情失败')
      }
    } finally {
      loading.value = false
    }
  }

  onMounted(loadData)
  watch(
    () => route.params.id,
    () => loadData()
  )
</script>

<style scoped lang="scss">
  .plan-detail-page {
    box-sizing: border-box;
    height: 100%;
    padding: 16px 20px 72px;
    background: var(--el-bg-color-page, #f5f7fa);
    /* 覆盖 .biz-detail-page 的 flex，避免末尾 margin 被滚动区域裁切 */
    display: block;
    overflow: auto;
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

    &:last-of-type {
      margin-bottom: 0;
    }
  }

  .summary-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
  }

  .summary-name {
    margin: 0 0 8px;
    font-size: 20px;
    font-weight: 700;
    line-height: 1.3;
    color: var(--el-text-color-primary);
  }

  .summary-product {
    font-size: 14px;
    color: var(--el-text-color-regular);
  }

  .summary-status {
    margin-top: 10px;
    font-size: 14px;
    color: var(--el-text-color-regular);
  }

  .field-block {
    margin-top: 4px;
  }

  .field-label {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    margin-bottom: 6px;
  }

  .field-tip-below {
    display: block;
    margin-top: 4px;
    font-size: 12px;
    font-weight: normal;
    color: var(--el-text-color-placeholder);
  }

  .field-text {
    margin: 0;
    font-size: 14px;
    line-height: 1.8;
    color: var(--el-text-color-regular);
    white-space: pre-wrap;
    word-break: break-word;
  }

  .field-value {
    font-size: 14px;
    color: var(--el-text-color-primary);
  }

  .kv-grid {
    display: flex;
    gap: 48px;
    flex-wrap: wrap;
  }

  .freeze-tip {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    margin-bottom: 12px;
  }

  .freeze-table {
    width: 100%;
  }

  .api-block {
    padding: 4px 0;
  }

  .api-text {
    margin: 0;
    font-size: 14px;
    line-height: 1.6;
    color: var(--el-text-color-primary);
    word-break: break-all;
  }

  .empty-tip {
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }

  .config-card {
    padding: 12px 14px;
    background: #f7f9fc;
    border-radius: 8px;
    margin-bottom: 10px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .config-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 6px;
  }

  .config-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .config-options,
  .config-tip {
    font-size: 13px;
    color: var(--el-text-color-regular);
    line-height: 1.6;
  }

  .default-mark {
    color: var(--el-color-success);
    font-size: 12px;
  }

  @media (max-width: 900px) {
    .audit-line {
      width: 24px;
    }
  }
</style>
