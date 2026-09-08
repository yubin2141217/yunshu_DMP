<template>
  <div class="workplace-page">
    <div class="workplace-header">
      <div>
        <h2 class="workplace-title">供数统计</h2>
        <p class="workplace-desc">按供数方核验本机构入库条数，与数据概览同一口径。</p>
      </div>
      <div class="v8-summary-stats">
        <span>时间范围<strong>{{ rangeLabel }}</strong></span>
        <span>供数方<strong>{{ supplierLabel }}</strong></span>
        <span>入库合计<strong>{{ Number(inboundTotal).toLocaleString('zh-CN') }}</strong></span>
      </div>
    </div>

    <a-card class="content-card" :bordered="false">
      <div class="page-search">
        <a-radio-group v-model="form.range" type="button" :options="rangeOptions" @change="fetchData(1)" />
        <a-select
          v-model="form.supplierId"
          :options="supplierOpts"
          placeholder="供数方"
          style="width: 200px"
          @change="fetchData(1)"
        />
        <a-button type="primary" @click="fetchData(1)">
          <template #icon><IconSearch /></template>
          查询
        </a-button>
        <a-button @click="onReset">
          <template #icon><IconRefresh /></template>
          重置
        </a-button>
      </div>

      <a-table
        :columns="columns"
        :data="data"
        :loading="loading"
        row-key="id"
        :pagination="false"
        :bordered="false"
        stripe
      >
        <template #count="{ record }">{{ Number(record.count).toLocaleString('zh-CN') }}</template>
        <template #empty>
          <a-empty description="暂无入库数据" />
        </template>
      </a-table>

      <div class="table-footer">
        <a-pagination
          class="table-footer-right"
          v-model:current="pagination.current"
          :total="pagination.total"
          :page-size="pagination.pageSize"
          show-total
          show-page-size
          show-jumper
          @change="fetchData"
          @page-size-change="onPageSize"
        />
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { IconRefresh, IconSearch } from '@arco-design/web-vue/es/icon'
import { getStats, supplierOptions } from '@/api/v8'
import type { StatsRow, TimeRange } from '@/mock/v8'

const rangeOptions = [
  { label: '全部', value: 'all' },
  { label: '近 7 天', value: 'd7' },
  { label: '近 30 天', value: 'd30' },
]
const form = reactive({ range: 'all' as TimeRange, supplierId: 'all' })
const supplierOpts = [{ label: '全部', value: 'all' }, ...supplierOptions()]
const data = ref<StatsRow[]>([])
const loading = ref(false)
const inboundTotal = ref(0)
const pagination = reactive({ current: 1, pageSize: 10, total: 0 })
const columns = [
  { title: '供数方名称', dataIndex: 'name', ellipsis: true, tooltip: true },
  { title: '入库条数', dataIndex: 'count', slotName: 'count', width: 120 },
]
const rangeLabel = computed(() => rangeOptions.find((o) => o.value === form.range)?.label || '全部')
const supplierLabel = computed(() => supplierOpts.find((o) => o.value === form.supplierId)?.label || '全部')

async function fetchData(page = pagination.current) {
  loading.value = true
  try {
    const res = await getStats({
      range: form.range,
      supplierId: form.supplierId,
      page,
      pageSize: pagination.pageSize,
    })
    data.value = res.list
    inboundTotal.value = res.inboundTotal
    pagination.current = page
    pagination.total = res.total
  } finally {
    loading.value = false
  }
}

function onReset() {
  form.range = 'all'
  form.supplierId = 'all'
  fetchData(1)
}

function onPageSize(size: number) {
  pagination.pageSize = size
  fetchData(1)
}

onMounted(() => fetchData(1))
</script>
