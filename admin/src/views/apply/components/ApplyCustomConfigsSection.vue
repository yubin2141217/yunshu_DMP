<!-- 工单详情 · 附加配置只读展示（仅配置项名称 + 填写值） -->
<template>
  <section class="detail-section apply-custom-configs">
    <div class="section-title">附加配置</div>
    <div v-if="!list.length" class="empty-tip">暂无附加配置</div>
    <div v-else class="info-grid">
      <div v-for="(item, idx) in list" :key="`${item.name}-${idx}`" class="info-item">
        <span class="k">{{ item.name || '—' }}</span>
        <span class="v">{{ displayValue(item) }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import type { ApplyCustomConfigItem } from '@/types/apply'

  defineOptions({ name: 'ApplyCustomConfigsSection' })

  const props = defineProps<{
    items?: ApplyCustomConfigItem[] | null
  }>()

  const list = computed(() => props.items || [])

  function displayValue(item: ApplyCustomConfigItem) {
    const val = String(item.value ?? '').trim()
    return val || '—'
  }
</script>

<style scoped lang="scss">
  .apply-custom-configs {
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

  .empty-tip {
    font-size: 13px;
    color: #909399;
    line-height: 1.6;
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

    .k {
      flex-shrink: 0;
      max-width: 40%;
      color: #909399;
    }

    .v {
      color: #303133;
      font-weight: 500;
      word-break: break-all;
    }
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
