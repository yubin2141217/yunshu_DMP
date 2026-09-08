<template>
  <div class="workplace-page">
    <div class="workplace-header">
      <div>
        <h2 class="workplace-title">供数方查看</h2>
        <p class="workplace-desc">只读查看本机构已配置供数方，状态由平台运营维护。</p>
      </div>
      <div class="v8-summary-stats">
        <span>已配置<strong>{{ enabledCount + disabledCount }}</strong></span>
        <span>启用<strong>{{ enabledCount }}</strong></span>
        <span>停用<strong>{{ disabledCount }}</strong></span>
      </div>
    </div>

    <a-card class="content-card" :bordered="false">
      <div class="page-search">
        <a-input
          v-model="keyword"
          placeholder="搜索供数方名称..."
          allow-clear
          style="max-width: 320px"
          @press-enter="fetchData(1)"
        >
          <template #prefix><IconSearch /></template>
        </a-input>
        <a-button type="primary" @click="fetchData(1)">
          <template #icon><IconSearch /></template>
          查询
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
        <template #status="{ record }">
          <a-tag
            :color="record.status === 'enabled' ? 'green' : 'orangered'"
            size="small"
            class="status-dot"
          >
            {{ record.status === 'enabled' ? '启用' : '停用' }}
          </a-tag>
        </template>
        <template #empty>
          <a-empty description="尚未配置供数方，请联系平台运营" />
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
import { onMounted, reactive, ref } from 'vue'
import { IconSearch } from '@arco-design/web-vue/es/icon'
import { getConfiguredSuppliers } from '@/api/v8'
import type { Supplier } from '@/mock/v8'

const keyword = ref('')
const data = ref<Supplier[]>([])
const loading = ref(false)
const enabledCount = ref(0)
const disabledCount = ref(0)
const pagination = reactive({ current: 1, pageSize: 10, total: 0 })
const columns = [
  { title: '供数方名称', dataIndex: 'name', ellipsis: true, tooltip: true },
  { title: '编码', dataIndex: 'code', width: 140 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 80 },
  { title: '更新时间', dataIndex: 'updatedAt', width: 160 },
]

async function fetchData(page = pagination.current) {
  loading.value = true
  try {
    const res = await getConfiguredSuppliers({
      keyword: keyword.value,
      page,
      pageSize: pagination.pageSize,
    })
    data.value = res.list
    enabledCount.value = res.enabledCount
    disabledCount.value = res.disabledCount
    pagination.current = page
    pagination.total = res.total
  } finally {
    loading.value = false
  }
}

function onPageSize(size: number) {
  pagination.pageSize = size
  fetchData(1)
}

onMounted(() => fetchData(1))
</script>
