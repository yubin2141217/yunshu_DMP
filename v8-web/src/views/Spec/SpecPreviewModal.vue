<template>
  <a-modal
    :visible="visible"
    :width="920"
    :footer="false"
    :body-style="bodyStyle"
    unmount-on-close
    title-align="start"
    modal-class="spec-doc-modal"
    @cancel="emit('cancel')"
  >
    <template #title>
      <span class="spec-doc-modal__title">阅读接入规范</span>
    </template>

    <div class="doc-stage">
      <article class="doc-sheet">
        <header class="doc-sheet__header">
          <p class="doc-sheet__eyebrow">云数中台 · 机构接入规范</p>
          <h1 class="doc-sheet__title">{{ standardName || '接入规范' }}</h1>
          <p class="doc-sheet__meta">
            <span>文件：{{ fileName || '—' }}</span>
            <span>生效范围：{{ scopeLabel || '—' }}</span>
            <span>发布时间：{{ publishedAt || '—' }}</span>
          </p>
        </header>

        <section v-if="apiDocMarkdown" class="doc-sheet__section">
          <h2 class="doc-sheet__h2">接口文档</h2>
          <pre class="doc-md">{{ apiDocMarkdown }}</pre>
        </section>

        <template v-else>
        <section class="doc-sheet__section">
          <h2 class="doc-sheet__h2">一、说明</h2>
          <p class="doc-sheet__p">
            数据标准约定「接哪些字段」，接入方案约定「怎么接」。请将本规范转交供数方按约定送数。
          </p>
          <p class="doc-sheet__p">
            <strong>来源厂商识别：</strong>接口路径凭 appkey；库表路径凭行内
            <code>supplier_code</code>（对应供数方编码）映射供数方主数据。方案不绑定厂商；IP 白名单仅作安保。
            归属机构凭行内 <code>org_id</code>（对应机构编码）。
          </p>
        </section>

        <section class="doc-sheet__section">
          <h2 class="doc-sheet__h2">二、规范概要</h2>
          <table class="doc-kv">
            <tbody>
              <tr>
                <th>方案名称</th>
                <td>{{ standardName || '—' }}</td>
                <th>生效范围</th>
                <td>{{ scopeLabel || '—' }}</td>
              </tr>
              <tr>
                <th>发布时间</th>
                <td>{{ publishedAt || '—' }}</td>
                <th>字段数</th>
                <td>{{ fields.length }}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="doc-sheet__section">
          <h2 class="doc-sheet__h2">三、数据标准 · 字段列表</h2>
          <template v-if="groupedFields.length">
            <div v-for="group in groupedFields" :key="group.name" class="doc-field-group">
              <h3 class="doc-sheet__h3">{{ group.name }}（{{ group.items.length }}）</h3>
              <table class="doc-table">
                <thead>
                  <tr>
                    <th>字段名</th>
                    <th>描述</th>
                    <th>数据类型</th>
                    <th>必填</th>
                    <th>长度</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in group.items" :key="item.id">
                    <td class="mono">{{ item.name }}</td>
                    <td>{{ item.description || '—' }}</td>
                    <td>{{ item.dataType || '—' }}</td>
                    <td>{{ requiredText(item.required) }}</td>
                    <td>{{ item.length || '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
          <p v-else class="doc-sheet__empty">暂无字段</p>
        </section>

        <section v-if="scheme" class="doc-sheet__section">
          <h2 class="doc-sheet__h2">四、接入方案 · 对接策略</h2>
          <table class="doc-kv">
            <tbody>
              <tr>
                <th>方案名称</th>
                <td>{{ scheme.name }}</td>
                <th>数据源类型</th>
                <td>{{ scheme.dataSourceTypeLabel || '—' }}</td>
              </tr>
              <template v-if="isTableScheme">
                <tr>
                  <th>数据库类型</th>
                  <td>{{ scheme.jdbcDbTypeLabel || scheme.jdbcDbType || '—' }}</td>
                  <th>主机 / 端口</th>
                  <td>{{ hostPortText }}</td>
                </tr>
                <tr>
                  <th>数据库名</th>
                  <td>{{ scheme.jdbcDatabase || scheme.path || '—' }}</td>
                  <th>Schema</th>
                  <td>{{ scheme.jdbcSchema || '—' }}</td>
                </tr>
                <tr>
                  <th>用户名</th>
                  <td>{{ scheme.jdbcUsername || '—' }}</td>
                  <th>密码</th>
                  <td>{{ scheme.jdbcPassword ? '******' : '—' }}</td>
                </tr>
                <tr>
                  <th>JDBC URL</th>
                  <td colspan="3" class="mono wrap">{{ scheme.jdbcUrlPreview || '—' }}</td>
                </tr>
                <tr>
                  <th>抽取频次</th>
                  <td>{{ scheme.frequencyLabel || '—' }}</td>
                  <th>更新规则</th>
                  <td>{{ scheme.updateModeLabel || '—' }}</td>
                </tr>
                <tr>
                  <th>增量字段</th>
                  <td>{{ scheme.incrementField || '—' }}</td>
                  <th>失败重试</th>
                  <td>{{ scheme.retry ?? '—' }}</td>
                </tr>
                <tr>
                  <th>IP 白名单管控</th>
                  <td colspan="3">{{ whitelistText }}</td>
                </tr>
              </template>
              <tr v-else>
                <th>配置说明</th>
                <td colspan="3">该数据源类型配置能力预留</td>
              </tr>
              <tr>
                <th>备注</th>
                <td colspan="3">{{ scheme.remark || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <footer class="doc-sheet__footer">
          — 文档结束 —
        </footer>
        </template>
      </article>
    </div>

    <div class="spec-doc-modal__actions">
      <a-button type="primary" @click="emit('cancel')">关闭</a-button>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { schemeRequiresWhitelist, type ApiAccessConfig, type Scheme, type StandardField } from '@/mock/v8'

const props = defineProps<{
  visible: boolean
  standardName?: string
  fileName?: string
  fields: StandardField[]
  scheme: Scheme | null | undefined
  apiAccess?: ApiAccessConfig | null
  apiDocMarkdown?: string
  scopeLabel?: string
  publishedAt?: string
  requireIpWhitelist?: boolean
  remark?: string
}>()

const emit = defineEmits<{ cancel: [] }>()

const bodyStyle = {
  padding: '0',
  background: '#f2f3f5',
}

const categoryOrder = ['运维管理', '平台', '作者', '文章', '标注', '其它']

const isTableScheme = computed(() => (props.scheme?.dataSourceType || 'table') === 'table')
const hostPortText = computed(() => {
  if (!props.scheme) return '—'
  const host = props.scheme.jdbcHost || props.scheme.frontHost || ''
  const port = props.scheme.jdbcPort || props.scheme.frontPort || ''
  if (!host) return '—'
  return port ? `${host}:${port}` : host
})
const whitelistText = computed(() => (schemeRequiresWhitelist(props.scheme) ? '是' : '否'))

const groupedFields = computed(() => {
  const map = new Map<string, StandardField[]>()
  props.fields.forEach((item) => {
    const key = item.bizCategory || '未分类'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(item)
  })
  const ordered = categoryOrder
    .filter((name) => map.has(name))
    .map((name) => ({ name, items: map.get(name)! }))
  const rest = [...map.keys()]
    .filter((name) => !categoryOrder.includes(name))
    .map((name) => ({ name, items: map.get(name)! }))
  return ordered.concat(rest)
})

function requiredText(value: boolean | null | undefined) {
  if (value === true) return '必填'
  if (value === false) return '非必填'
  return '—'
}
</script>

<style scoped>
.doc-stage {
  max-height: min(68vh, 720px);
  overflow: auto;
  padding: 20px 24px 8px;
  background: linear-gradient(180deg, #eceef1 0%, #f2f3f5 40%);
}

.doc-sheet {
  max-width: 780px;
  margin: 0 auto 16px;
  padding: 40px 48px 32px;
  background: #fff;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 8px 24px rgba(29, 33, 41, 0.08);
  border: 1px solid #e5e6eb;
}

.doc-sheet__header {
  text-align: center;
  padding-bottom: 24px;
  margin-bottom: 28px;
  border-bottom: 1px solid #e5e6eb;
}

.doc-sheet__eyebrow {
  margin: 0 0 10px;
  font-size: 12px;
  letter-spacing: 0.12em;
  color: #86909c;
  text-transform: none;
}

.doc-sheet__title {
  margin: 0 0 14px;
  font-size: 26px;
  font-weight: 650;
  line-height: 1.35;
  color: #1d2129;
  letter-spacing: 0.02em;
}

.doc-sheet__meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px 20px;
  margin: 0;
  font-size: 13px;
  color: #4e5969;
}

.doc-sheet__section {
  margin-bottom: 28px;
}

.doc-sheet__h2 {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 650;
  color: #1d2129;
  padding-left: 10px;
  border-left: 3px solid #165dff;
}

.doc-sheet__h3 {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: #4e5969;
}

.doc-sheet__p {
  margin: 0 0 10px;
  font-size: 14px;
  line-height: 1.75;
  color: #4e5969;
}

.doc-sheet__p code {
  padding: 1px 6px;
  font-size: 12px;
  background: #f7f8fa;
  border: 1px solid #e5e6eb;
  border-radius: 3px;
  color: #1d2129;
}

.doc-sheet__empty {
  margin: 0;
  color: #86909c;
  font-size: 13px;
}

.doc-md {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12.5px;
  line-height: 1.65;
  color: #1d2129;
}

.doc-field-group + .doc-field-group {
  margin-top: 18px;
}

.doc-kv,
.doc-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  line-height: 1.5;
}

.doc-kv th,
.doc-kv td,
.doc-table th,
.doc-table td {
  border: 1px solid #e5e6eb;
  padding: 8px 10px;
  vertical-align: top;
}

.doc-kv th {
  width: 18%;
  background: #fafafa;
  color: #86909c;
  font-weight: 500;
  white-space: nowrap;
}

.doc-kv td {
  width: 32%;
  color: #1d2129;
}

.doc-table thead th {
  background: #fafafa;
  color: #4e5969;
  font-weight: 600;
  text-align: left;
}

.doc-table td {
  color: #1d2129;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
}

.wrap {
  word-break: break-all;
}

.spec-doc-modal__actions {
  display: flex;
  justify-content: flex-end;
  padding: 12px 20px 16px;
  background: #fff;
  border-top: 1px solid #e5e6eb;
}

.spec-doc-modal__title {
  font-weight: 600;
}
</style>

<style>
/* 弹窗外壳：贴近阅读器观感 */
.spec-doc-modal .arco-modal-body {
  padding: 0 !important;
}
.spec-doc-modal .arco-modal-header {
  border-bottom: 1px solid #e5e6eb;
}
</style>
