<template>
  <div class="biz-stat-cards">
    <div
      v-for="item in items"
      :key="item.key"
      class="biz-stat-card"
      :class="`is-${item.tone || 'primary'}`"
    >
      <div class="biz-stat-card__icon">
        <ElIcon :size="22">
          <component :is="resolveIcon(item)" />
        </ElIcon>
      </div>
      <div class="biz-stat-card__body">
        <div class="biz-stat-card__label">{{ item.label }}</div>
        <div class="biz-stat-card__value">{{ item.value }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    Clock,
    Document,
    Lock,
    User,
    WarningFilled
  } from '@element-plus/icons-vue'
  import type { BizStatItem } from './types'

  defineOptions({ name: 'BizStatCards' })

  defineProps<{
    items: BizStatItem[]
  }>()

  const iconMap: Record<string, object> = {
    User,
    Document,
    Clock,
    Lock,
    WarningFilled
  }

  function resolveIcon(item: BizStatItem) {
    if (item.icon && iconMap[item.icon]) return iconMap[item.icon]
    const byTone: Record<string, object> = {
      primary: User,
      success: Document,
      amber: Document,
      warning: Clock,
      danger: Lock,
      info: Clock
    }
    return byTone[item.tone || 'primary'] || User
  }
</script>
