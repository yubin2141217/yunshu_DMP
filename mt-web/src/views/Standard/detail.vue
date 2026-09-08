<template>
  <div class="page-shell">
    <div class="page-head">
      <div>
        <h2 class="page-title">接入方案详情</h2>
        <p class="page-desc">分模块查看基础信息、字段库配置与接口接入方式。</p>
      </div>
      <a-space>
        <a-button v-if="record" type="outline" @click="$router.push('/standard/edit/' + record.id)">编辑</a-button>
        <a-button @click="$router.push('/standard')">返回列表</a-button>
      </a-space>
    </div>

    <template v-if="record">
      <a-card class="content-card detail-block" :bordered="false" title="基础信息">
        <a-descriptions :column="2" bordered size="large">
          <a-descriptions-item label="方案名称">{{ record.name }}</a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="record.status === 'enabled' ? 'green' : 'orangered'" size="small">
              {{ record.status === 'enabled' ? '开启' : '停用' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="范围">{{ record.scope === 'org' ? '机构' : '全局' }}</a-descriptions-item>
          <a-descriptions-item label="机构">{{ record.scope === 'org' ? record.orgName || '—' : '—' }}</a-descriptions-item>
          <a-descriptions-item label="IP 白名单管控">{{ record.requireIpWhitelist ? '是' : '否' }}</a-descriptions-item>
          <a-descriptions-item label="发布时间">{{ record.uploadedAt || '—' }}</a-descriptions-item>
          <a-descriptions-item label="备注" :span="2">{{ record.remark || '—' }}</a-descriptions-item>
        </a-descriptions>
      </a-card>

      <a-card class="content-card detail-block" :bordered="false" title="字段库配置">
        <div class="field-summary">共 {{ fieldList.length }} 个字段</div>
        <a-table
          v-if="fieldList.length"
          :columns="fieldColumns"
          :data="fieldList"
          row-key="id"
          :pagination="false"
          :bordered="false"
          stripe
          size="small"
        />
        <a-empty v-else description="未配置字段" />
      </a-card>

      <a-card class="content-card detail-block" :bordered="false" title="接入方式">
        <a-alert type="info" style="margin-bottom: 16px">本期接入方式为「接口推送」。</a-alert>
        <a-descriptions :column="2" bordered size="large">
          <a-descriptions-item label="协议">{{ api.protocol || '—' }}</a-descriptions-item>
          <a-descriptions-item label="HTTP 方法">{{ api.method || '—' }}</a-descriptions-item>
          <a-descriptions-item label="Content-Type">{{ api.contentType || '—' }}</a-descriptions-item>
          <a-descriptions-item label="字符集">{{ api.charset || '—' }}</a-descriptions-item>
          <a-descriptions-item label="Base URL" :span="2">{{ api.baseUrl || '—' }}</a-descriptions-item>
          <a-descriptions-item label="接口 Path" :span="2">{{ api.path || '—' }}</a-descriptions-item>
          <a-descriptions-item label="完整地址" :span="2">{{ endpoint || '—' }}</a-descriptions-item>
          <a-descriptions-item label="鉴权方式">{{ authLabel }}</a-descriptions-item>
          <a-descriptions-item label="鉴权 Header 名">{{ api.authHeaderName || '—' }}</a-descriptions-item>
          <a-descriptions-item label="超时（秒）">{{ api.timeoutSec ?? '—' }}</a-descriptions-item>
          <a-descriptions-item label="失败重试次数">{{ api.retry ?? '—' }}</a-descriptions-item>
          <a-descriptions-item label="限流 QPS">{{ api.rateLimitQps ?? '—' }}</a-descriptions-item>
          <a-descriptions-item label="单批最大条数">{{ api.batchMaxSize ?? '—' }}</a-descriptions-item>
          <a-descriptions-item label="幂等 Header">{{ api.idempotencyHeader || '—' }}</a-descriptions-item>
          <a-descriptions-item label="成功码">
            {{ api.successCodePath || '—' }} = {{ api.successCodeValue || '—' }}
          </a-descriptions-item>
        </a-descriptions>
      </a-card>
    </template>

    <a-card v-else class="content-card" :bordered="false">
      <a-empty description="未找到该接入方案">
        <a-button type="primary" style="margin-top: 12px" @click="$router.push('/standard')">返回列表</a-button>
      </a-empty>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getStandard } from '@/api/mt'
import {
  apiAuthTypeOptions,
  buildApiEndpoint,
  defaultApiAccess,
  type ApiAccessConfig,
  type Standard,
} from '@/mock/mt'

const route = useRoute()
const record = ref<Standard | null>(null)

const api = computed<ApiAccessConfig>(() => ({
  ...defaultApiAccess(),
  ...(record.value?.apiAccess || {}),
}))

const endpoint = computed(() => (record.value ? buildApiEndpoint(api.value) : ''))

const authLabel = computed(() => {
  const hit = apiAuthTypeOptions.find((o) => o.value === api.value.authType)
  return hit?.label || api.value.authType || '—'
})

const fieldList = computed(() =>
  (record.value?.fields || []).map((f) => ({
    id: f.id,
    name: f.name,
    description: f.description || f.bizCaliber || '',
    dataType: f.dataType || '—',
    bizCategory: f.bizCategory || '—',
  })),
)

const fieldColumns = [
  { title: '字段名', dataIndex: 'name', width: 160, ellipsis: true, tooltip: true },
  { title: '描述', dataIndex: 'description', ellipsis: true, tooltip: true },
  { title: '数据类型', dataIndex: 'dataType', width: 96 },
  { title: '业务分类', dataIndex: 'bizCategory', width: 96 },
]

onMounted(async () => {
  record.value = await getStandard(String(route.params.id || ''))
})
</script>

<style scoped>
.detail-block + .detail-block {
  margin-top: 14px;
}
.field-summary {
  margin-bottom: 12px;
  font-size: 13px;
  color: #86909c;
}
</style>
