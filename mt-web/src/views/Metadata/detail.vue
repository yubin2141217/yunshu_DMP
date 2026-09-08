<template>
  <div class="page-shell">
    <div class="page-head">
      <div>
        <h2 class="page-title">字段详情</h2>
        <p class="page-desc">查看数据标准字段的描述、类型与业务分类。</p>
      </div>
      <a-button @click="$router.push('/metadata')">返回列表</a-button>
    </div>
    <a-card class="content-card" :bordered="false">
      <template v-if="record">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="字段名">{{ record.name }}</a-descriptions-item>
          <a-descriptions-item label="数据类型">{{ record.dataType || '—' }}</a-descriptions-item>
          <a-descriptions-item label="描述" :span="2">{{ record.description || record.bizCaliber || '—' }}</a-descriptions-item>
          <a-descriptions-item label="长度">{{ record.length || '—' }}</a-descriptions-item>
          <a-descriptions-item label="缺省值">{{ record.defaultValue || '—' }}</a-descriptions-item>
          <a-descriptions-item label="业务分类">{{ record.bizCategory || '—' }}</a-descriptions-item>
          <a-descriptions-item label="状态">{{ record.status === 'enabled' ? '启用' : '停用' }}</a-descriptions-item>
          <a-descriptions-item label="更新时间">{{ record.updatedAt || '—' }}</a-descriptions-item>
          <a-descriptions-item label="备注" :span="2">{{ record.remark || '—' }}</a-descriptions-item>
        </a-descriptions>
      </template>
      <a-empty v-else description="未找到该数据标准字段">
        <a-button type="primary" style="margin-top: 12px" @click="$router.push('/metadata')">返回列表</a-button>
      </a-empty>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getMetadata } from '@/api/mt'
import type { Metadata } from '@/mock/mt'

const route = useRoute()
const record = ref<Metadata | null>(null)

onMounted(async () => {
  record.value = await getMetadata(String(route.params.id || ''))
})
</script>
