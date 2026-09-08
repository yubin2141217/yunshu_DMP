<!-- 工单详情 · 产品方案平铺展示 -->
<template>
  <section class="detail-section apply-plan-section">
    <div class="section-title">产品方案</div>
    <div class="info-grid">
      <div class="info-item">
        <span class="k">产品名称</span>
        <span class="v">{{ productName || '—' }}</span>
      </div>
      <div class="info-item">
        <span class="k">方案名称</span>
        <span class="v">{{ planName || '—' }}</span>
      </div>
      <div v-if="showPlanId" class="info-item">
        <span class="k">方案ID</span>
        <span class="v">{{ planId || '—' }}</span>
      </div>
      <div class="info-item">
        <span class="k">试用时间</span>
        <span class="v">{{ trialTimeLabel || '—' }}</span>
      </div>
      <div class="info-item full">
        <span class="k">产品介绍</span>
        <span class="v">{{ productIntro || '—' }}</span>
      </div>
      <div class="info-item full">
        <span class="k">方案介绍</span>
        <span class="v">{{ planIntro || '—' }}</span>
      </div>
      <div class="info-item full stacked">
        <div class="freeze-label-row">
          <span class="k">冷冻期规则</span>
          <span class="freeze-tip">
            <ElIcon class="freeze-tip__icon"><WarningFilled /></ElIcon>
            试用到期后自动进入冷冻期，冷冻期内不允许申请延期
          </span>
        </div>
        <div class="freeze-block">
          <ElTable
            v-if="freezeRows.length"
            :data="freezeRows"
            border
            size="small"
            class="freeze-table"
          >
            <ElTableColumn type="index" label="序号" width="64" align="center" />
            <ElTableColumn label="冷冻期规则" min-width="280">
              <template #default="{ row }">{{ row.text }}</template>
            </ElTableColumn>
          </ElTable>
          <div v-else class="v">—</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { WarningFilled } from '@element-plus/icons-vue'

  defineOptions({ name: 'ApplyPlanSection' })

  const props = withDefaults(
    defineProps<{
      productName?: string
      planName?: string
      planId?: string
      /** 是否展示方案ID（审核详情有，人工处理可按需） */
      showPlanId?: boolean
      trialTimeLabel?: string
      productIntro?: string
      planIntro?: string
      freezeRule?: string
      freezeDays?: number[] | null
    }>(),
    {
      showPlanId: true
    }
  )

  function resolveFreezeDays(): number[] {
    if (Array.isArray(props.freezeDays) && props.freezeDays.length) {
      return props.freezeDays.map((d) => Number(d) || 0)
    }
    const rule = String(props.freezeRule || '').trim()
    if (!rule || rule === '无' || rule === '—' || rule === '无冷冻期') return []
    const nums = rule.match(/\d+/g)
    return nums ? nums.map((n) => Number(n)) : []
  }

  const freezeRows = computed(() =>
    resolveFreezeDays().map((days) => ({
      text: `试用期结束后，可再次发起延期的间隔时长为${days}天`
    }))
  )
</script>

<style scoped lang="scss">
  .apply-plan-section {
    background: #fff;
    border-radius: 10px;
    padding: 16px 20px 20px;
    box-shadow: 0 1px 2px rgba(31, 42, 68, 0.04);
  }

  .section-title {
    position: relative;
    padding-left: 12px;
    margin-bottom: 16px;
    font-size: 16px;
    font-weight: 650;
    color: #1f2a44;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 3px;
      bottom: 3px;
      width: 4px;
      border-radius: 2px;
      background: var(--el-color-primary);
    }
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px 24px;
  }

  .info-item {
    display: flex;
    gap: 10px;
    font-size: 13px;
    line-height: 1.6;
    min-width: 0;

    &.full {
      grid-column: 1 / -1;
    }

    &.stacked {
      flex-direction: column;
      gap: 8px;
    }

    .k {
      flex-shrink: 0;
      width: 72px;
      color: #909399;
    }

    &.stacked .k {
      width: auto;
    }

    .v {
      color: #303133;
      font-weight: 500;
      word-break: break-all;
      white-space: pre-wrap;
    }
  }

  .freeze-label-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    min-width: 0;

    .k {
      width: auto;
      flex-shrink: 0;
    }
  }

  .freeze-tip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
    font-size: 12px;
    line-height: 1.4;
    color: #909399;
    font-weight: 400;

    &__icon {
      flex-shrink: 0;
      font-size: 14px;
      color: var(--el-color-warning);
    }
  }

  .freeze-block {
    width: 100%;
  }

  .freeze-table {
    width: 100%;
  }

  @media (max-width: 1100px) {
    .info-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 640px) {
    .info-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
