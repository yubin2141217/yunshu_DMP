<template>
  <div class="page-shell">
    <div class="page-head">
      <div>
        <h2 class="page-title">接入方案详情</h2>
        <p class="page-desc">查看数据源类型与 JDBC 连接配置。</p>
      </div>
      <a-button @click="$router.push('/scheme')">返回列表</a-button>
    </div>
    <a-card class="content-card" :bordered="false">
      <a-descriptions v-if="record" title="对接策略" :column="2" bordered>
        <a-descriptions-item label="方案名称">{{ record.name }}</a-descriptions-item>
        <a-descriptions-item label="数据源类型">{{ record.dataSourceTypeLabel || '—' }}</a-descriptions-item>
        <template v-if="(record.dataSourceType || 'table') === 'table'">
          <a-descriptions-item label="数据库类型">{{ record.jdbcDbTypeLabel || record.jdbcDbType || '—' }}</a-descriptions-item>
          <a-descriptions-item label="主机 / 端口">{{ hostPort }}</a-descriptions-item>
          <a-descriptions-item label="数据库名">{{ record.jdbcDatabase || '—' }}</a-descriptions-item>
          <a-descriptions-item label="Schema">{{ record.jdbcSchema || '—' }}</a-descriptions-item>
          <a-descriptions-item label="用户名">{{ record.jdbcUsername || '—' }}</a-descriptions-item>
          <a-descriptions-item label="密码">{{ record.jdbcPassword ? '******' : '—' }}</a-descriptions-item>
          <a-descriptions-item label="JDBC URL" :span="2">{{ record.jdbcUrlPreview || '—' }}</a-descriptions-item>
          <a-descriptions-item label="抽取频次">{{ record.frequencyLabel }}</a-descriptions-item>
          <a-descriptions-item label="更新规则">{{ record.updateModeLabel }}</a-descriptions-item>
          <a-descriptions-item label="增量字段">{{ record.incrementField || '—' }}</a-descriptions-item>
          <a-descriptions-item label="失败重试">{{ record.retry }}</a-descriptions-item>
          <a-descriptions-item label="IP白名单管控">{{ record.requireIpWhitelist ? '是' : '否' }}</a-descriptions-item>
        </template>
        <template v-else>
          <a-descriptions-item label="配置状态" :span="2">该数据源类型配置能力预留</a-descriptions-item>
        </template>
        <a-descriptions-item label="状态">{{ record.status === 'enabled' ? '启用' : '停用' }}</a-descriptions-item>
        <a-descriptions-item label="更新时间">{{ record.updatedAt || '—' }}</a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">{{ record.remark || '—' }}</a-descriptions-item>
      </a-descriptions>
      <a-empty v-else description="未找到该接入方案">
        <a-button type="primary" style="margin-top: 12px" @click="$router.push('/scheme')">返回列表</a-button>
      </a-empty>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getScheme } from '@/api/mt'
import type { Scheme } from '@/mock/mt'

const route = useRoute()
const record = ref<Scheme | null>(null)
const hostPort = computed(() => {
  if (!record.value) return '—'
  const host = record.value.jdbcHost || record.value.frontHost || ''
  const port = record.value.jdbcPort || record.value.frontPort || ''
  if (!host) return '—'
  return port ? `${host}:${port}` : host
})

onMounted(async () => {
  record.value = await getScheme(String(route.params.id || ''))
})
</script>
