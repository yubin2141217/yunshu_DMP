<template>
  <div class="workplace-page">
    <div class="workplace-header">
      <div>
        <h2 class="workplace-title">数据概览</h2>
        <p class="workplace-desc">查看本机构已配置供数方、入库总量与最近入库时间。不展示正文，不按区域切片。</p>
      </div>
      <div class="v8-summary-stats">
        <span>供数方<strong>{{ summary.supplierCount }}</strong></span>
        <span>入库总量<strong>{{ inboundText }}</strong></span>
        <span>最近入库<strong>{{ lastInbound }}</strong></span>
      </div>
    </div>

    <a-row :gutter="[16, 16]">
      <a-col v-for="item in kpis" :key="item.key" :xs="24" :sm="12" :lg="8">
        <a-card class="kpi-card" :bordered="false">
          <div class="kpi-body">
            <span class="kpi-icon" :style="{ background: item.accent }">
              <component :is="item.icon" />
            </span>
            <div>
              <div class="kpi-title">{{ item.title }}</div>
              <div class="kpi-value">{{ item.value }}</div>
              <div class="kpi-sub">{{ item.sub }}</div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-card class="content-card" :bordered="false">
      <div class="section-title">快捷进入</div>
      <a-space>
        <a-button type="primary" @click="$router.push('/stats')">
          <template #icon><IconBarChart /></template>
          供数统计
        </a-button>
        <a-button @click="$router.push('/spec')">
          <template #icon><IconFile /></template>
          接入规范
        </a-button>
      </a-space>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { IconBarChart, IconClockCircle, IconFile, IconUserGroup } from '@arco-design/web-vue/es/icon'
import { getOverview } from '@/api/v8'
import type { Overview } from '@/mock/v8'

const summary = ref<Overview>({ supplierCount: 0, inboundTotal: 0, lastInboundAt: '' })
const inboundText = computed(() => Number(summary.value.inboundTotal).toLocaleString('zh-CN'))
const lastInbound = computed(() => summary.value.lastInboundAt || '暂无入库')
const kpis = computed(() => [
  {
    key: 'suppliers',
    title: '已配置供数方数量',
    value: String(summary.value.supplierCount),
    sub: '含停用供数方',
    accent: 'linear-gradient(135deg, #4096ff 0%, #1677ff 100%)',
    icon: IconUserGroup,
  },
  {
    key: 'total',
    title: '入库总条数',
    value: inboundText.value,
    sub: '与供数统计「全部」同一口径',
    accent: 'linear-gradient(135deg, #73d13d 0%, #52c41a 100%)',
    icon: IconBarChart,
  },
  {
    key: 'latest',
    title: '最近一次入库时间',
    value: lastInbound.value,
    sub: '按到达中台时间',
    accent: 'linear-gradient(135deg, #ffc53d 0%, #fa8c16 100%)',
    icon: IconClockCircle,
  },
])

onMounted(async () => {
  summary.value = await getOverview()
})
</script>
