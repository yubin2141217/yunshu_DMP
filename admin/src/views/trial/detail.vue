<!-- 试用管理 · 方案详情（对齐设计稿模块布局） -->
<template>
  <div class="biz-detail-page trial-detail" v-loading="loading">
    <ElCard shadow="never" class="biz-breadcrumb-card">
      <div class="biz-header-row">
        <ElButton text :icon="ArrowLeft" @click="router.push('/trial')">返回</ElButton>
        <span class="title">方案详情</span>
      </div>
    </ElCard>

    <div v-if="detail" class="detail-layout">
      <aside class="anchor-nav">
        <button
          v-for="item in anchorItems"
          :key="item.id"
          type="button"
          class="anchor-item"
          :class="{ active: activeAnchor === item.id }"
          @click="scrollToSection(item.id)"
        >
          {{ item.label }}
        </button>
      </aside>

      <div class="detail-main" ref="mainRef" @scroll="onMainScroll">
        <!-- 基础信息 -->
        <section id="sec-basic" class="detail-section">
          <div class="section-title">基础信息</div>
          <div class="basic-card">
            <div class="basic-left">
              <div class="org-row">
                <span class="org-name">{{ detail.orgName }}</span>
                <ElTag :type="statusTagType(detail.status)" effect="light" round>
                  {{ statusLabel(detail.status) }}
                </ElTag>
              </div>
              <div class="meta-line">统计单元：{{ detail.unit }}</div>
              <div class="meta-line">所属销售：{{ detail.sales }}</div>
            </div>
            <div class="basic-right">
              <div class="metric-line">
                已延期/总延期次数：
                <strong>{{ detail.extendedCount }} / {{ detail.totalExtension }}</strong>
                次
              </div>
              <div class="metric-line">
                试用时间 {{ trialRangeText }}
              </div>
              <div class="progress-wrap">
                <ElProgress
                  :percentage="remainPercent"
                  :stroke-width="10"
                  :color="progressColor"
                  :format="() => remainProgressText"
                />
              </div>
            </div>
          </div>
        </section>

        <!-- 方案信息 -->
        <section id="sec-plan" class="detail-section">
          <div class="section-title">方案信息</div>
          <div class="plan-info-card">
            <div class="plan-summary">
              <div class="kv"><span class="k">方案名称</span><span class="v">{{ detail.planName }}</span></div>
              <div class="kv"><span class="k">方案ID</span><span class="v">{{ detail.planId }}</span></div>
              <div class="kv"><span class="k">产品名称</span><span class="v">{{ detail.productName }}</span></div>
              <div class="kv"><span class="k">试用时间</span><span class="v">{{ detail.trialTimeLabel }}</span></div>
              <div class="kv">
                <span class="k">总延期次数</span>
                <span class="v">{{ detail.totalExtension }}次</span>
              </div>
            </div>
            <div class="plan-tabs">
              <ElTabs v-model="planTab">
                <ElTabPane label="方案介绍" name="intro">
                  <div class="tab-body">{{ detail.intro || '—' }}</div>
                </ElTabPane>
                <ElTabPane label="冷冻期规则" name="freeze">
                  <div class="tab-body">{{ detail.freezeRule || '—' }}</div>
                </ElTabPane>
              </ElTabs>
            </div>
          </div>
        </section>

        <!-- 历史方案记录 -->
        <section id="sec-history" class="detail-section">
          <div class="section-title">历史方案记录</div>
          <ElTable :data="detail.historyRecords || []" style="width: 100%" empty-text="暂无历史方案记录">
            <ElTableColumn prop="productName" label="产品名称" min-width="120" />
            <ElTableColumn prop="planName" label="方案名称" min-width="180" show-overflow-tooltip />
            <ElTableColumn prop="startTime" label="开始时间" width="120" />
            <ElTableColumn prop="totalTrialDays" label="试用时长(天)" width="120" align="center" />
            <ElTableColumn prop="endTime" label="结束时间" width="120" />
            <ElTableColumn prop="extensionCount" label="延期次数" width="100" align="center" />
            <ElTableColumn prop="planId" label="方案ID" min-width="140" />
            <ElTableColumn label="方案状态" width="110" align="center">
              <template #default="{ row }">
                <ElTag
                  :type="row.status === 'expired' ? 'info' : 'danger'"
                  effect="plain"
                  round
                >
                  {{ historyLabel(row.status) }}
                </ElTag>
              </template>
            </ElTableColumn>
          </ElTable>
        </section>

        <!-- 操作记录 -->
        <section id="sec-ops" class="detail-section">
          <div class="section-title">操作记录</div>
          <ElTable :data="detail.applyRecords || []" style="width: 100%" empty-text="暂无操作记录">
            <ElTableColumn prop="ticketId" label="工单ID" min-width="160" />
            <ElTableColumn prop="applicant" label="申请人" width="100" />
            <ElTableColumn prop="applyType" label="申请类型" width="120" />
            <ElTableColumn prop="applyTime" label="申请时间" width="180" />
            <ElTableColumn label="工单状态" width="110" align="center">
              <template #default="{ row }">
                <ElTag :type="applyTagType(row.status)" effect="light" round>
                  {{ applyLabel(row.status) }}
                </ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <ElButton link type="primary" @click="openRecordDialog(row as TrialApplyRecord)"
                  >查看详情</ElButton
                >
              </template>
            </ElTableColumn>
          </ElTable>
        </section>
      </div>
    </div>

    <!-- 操作记录详情弹窗 -->
    <ElDialog
      v-model="dialogVisible"
      title="操作记录"
      width="640px"
      destroy-on-close
      class="ops-dialog"
    >
      <template v-if="activeRecord">
        <div class="ops-top">
          <div class="ops-top-item">
            <span class="label">申请人</span>
            <span class="value">{{ activeRecord.applicant }}</span>
          </div>
          <div class="ops-top-item">
            <span class="label">申请类型</span>
            <span class="value">{{ activeRecord.applyType }}</span>
          </div>
          <div class="ops-top-item">
            <span class="label">申请时间</span>
            <span class="value">{{ activeRecord.applyTime }}</span>
          </div>
        </div>

        <div class="ops-summary">
          <div class="ops-summary-row">
            <span class="k">机构名称</span>
            <span class="v">{{ activeRecord.orgName || detail?.orgName }}</span>
          </div>
          <div class="ops-summary-row">
            <span class="k">产品名称</span>
            <span class="v">{{ activeRecord.productName || detail?.productName }}</span>
          </div>
          <div class="ops-summary-row">
            <span class="k">方案名称</span>
            <span class="v">{{ activeRecord.planName || detail?.planName }}</span>
          </div>
        </div>

        <div class="ops-audit-title">审核信息</div>
        <ElTimeline class="ops-timeline">
          <ElTimelineItem
            v-for="(node, idx) in activeRecord.auditNodes || []"
            :key="idx"
            :type="nodeStatusType(node.status)"
            :hollow="node.status === '审核中' || node.status === '处理中'"
            :timestamp="node.time || undefined"
            placement="top"
          >
            <div class="timeline-head">
              <span class="who">{{ node.operator }}（{{ node.role }}）</span>
              <ElTag
                size="small"
                :type="nodeStatusType(node.status) === 'primary' ? 'info' : nodeStatusType(node.status)"
                effect="light"
                round
              >
                {{ node.status }}
              </ElTag>
            </div>
            <div v-if="node.remark" class="timeline-remark">{{ node.remark }}</div>
          </ElTimelineItem>
        </ElTimeline>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ArrowLeft } from '@element-plus/icons-vue'
  import { fetchTrialPlanDetail } from '@/api/trial'
  import {
    applyStatusLabel,
    historyStatusLabel,
    trialStatusLabel,
    trialStatusTagType
  } from '@/mock/trial'
  import type {
    TrialApplyRecord,
    TrialApplyStatus,
    TrialHistoryRecord,
    TrialPlanDetail,
    TrialPlanStatus
  } from '@/types/trial'

  defineOptions({ name: 'TrialDetailPage' })

  const route = useRoute()
  const router = useRouter()
  const loading = ref(false)
  const detail = ref<TrialPlanDetail | null>(null)
  const planTab = ref('intro')
  const activeAnchor = ref('sec-basic')
  const mainRef = ref<HTMLElement | null>(null)
  const dialogVisible = ref(false)
  const activeRecord = ref<TrialApplyRecord | null>(null)

  const anchorItems = [
    { id: 'sec-basic', label: '基础信息' },
    { id: 'sec-plan', label: '方案信息' },
    { id: 'sec-history', label: '历史方案记录' },
    { id: 'sec-ops', label: '操作记录' }
  ]

  const trialRangeText = computed(() => {
    if (!detail.value) return '—'
    const start = `${detail.value.startDate} 00:00:00`
    const end = `${detail.value.endDate} 23:59:59`
    return `${start} 至 ${end}`
  })

  const remainDays = computed(() => {
    if (!detail.value) return 0
    const match = detail.value.statusRemainTime.match(/(-?\d+)/)
    return match ? Number(match[1]) : 0
  })

  const remainPercent = computed(() => {
    if (!detail.value) return 0
    const start = new Date(`${detail.value.startDate}T00:00:00`).getTime()
    const end = new Date(`${detail.value.endDate}T23:59:59`).getTime()
    const now = Date.now()
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0
    const total = end - start
    const used = Math.min(Math.max(now - start, 0), total)
    return Math.min(100, Math.max(0, Math.round((used / total) * 100)))
  })

  const remainProgressText = computed(() => {
    if (!detail.value) return ''
    if (detail.value.status === 'trialing') {
      return `${remainPercent.value}%（剩余${remainDays.value}天）`
    }
    return detail.value.statusRemainTime || `${remainPercent.value}%`
  })

  const progressColor = computed(() => {
    const status = detail.value?.status
    if (status === 'stopped') return '#f56c6c'
    if (status === 'expired') return '#909399'
    if (status === 'frozen') return '#e6a23c'
    return '#4c7dff'
  })

  function statusLabel(status: TrialPlanStatus) {
    return trialStatusLabel(status)
  }

  function statusTagType(status: TrialPlanStatus) {
    return trialStatusTagType(status)
  }

  function applyLabel(status: TrialApplyStatus) {
    return applyStatusLabel(status)
  }

  function applyTagType(status: TrialApplyStatus): 'success' | 'warning' | 'danger' | 'info' {
    const map: Record<TrialApplyStatus, 'success' | 'warning' | 'danger' | 'info'> = {
      reviewing: 'warning',
      processing: 'info',
      rejected: 'danger',
      archived: 'success'
    }
    return map[status]
  }

  function historyLabel(status: TrialHistoryRecord['status']) {
    return historyStatusLabel(status)
  }

  function nodeStatusType(status: string): 'success' | 'warning' | 'danger' | 'primary' | 'info' {
    if (status.includes('驳回') || status.includes('未通过')) return 'danger'
    if (status.includes('自动跳过')) return 'info'
    if (status.includes('审核中') || status.includes('处理中')) return 'warning'
    if (status.includes('通过') || status.includes('提交')) return 'success'
    return 'primary'
  }

  function scrollToSection(id: string) {
    activeAnchor.value = id
    const el = document.getElementById(id)
    const container = mainRef.value
    if (!el || !container) return
    const top = el.offsetTop - 8
    container.scrollTo({ top, behavior: 'smooth' })
  }

  function onMainScroll() {
    const container = mainRef.value
    if (!container) return
    const scrollTop = container.scrollTop + 24
    let current = anchorItems[0].id
    for (const item of anchorItems) {
      const el = document.getElementById(item.id)
      if (el && el.offsetTop <= scrollTop) current = item.id
    }
    activeAnchor.value = current
  }

  function openRecordDialog(row: TrialApplyRecord) {
    activeRecord.value = row
    dialogVisible.value = true
  }

  async function loadData() {
    const id = Number(route.params.id)
    loading.value = true
    try {
      const res = await fetchTrialPlanDetail(id)
      if (res.code === 200) detail.value = res.data
      else ElMessage.error(res.message || '加载失败')
    } finally {
      loading.value = false
    }
  }

  onMounted(loadData)
</script>

<style scoped lang="scss">
  .trial-detail {
    min-height: 0;
    height: 100%;
    overflow: hidden;
  }

  .detail-layout {
    flex: 1;
    min-height: 0;
    display: flex;
    gap: 16px;
    overflow: hidden;
  }

  .anchor-nav {
    width: 128px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px 0;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 1px 2px rgba(31, 42, 68, 0.04);
    height: fit-content;
    position: sticky;
    top: 0;
  }

  .anchor-item {
    border: none;
    background: transparent;
    text-align: left;
    padding: 10px 16px;
    font-size: 14px;
    color: #606266;
    cursor: pointer;
    border-left: 3px solid transparent;
    transition: all 0.15s ease;

    &:hover {
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }

    &.active {
      color: var(--el-color-primary);
      font-weight: 600;
      background: var(--el-color-primary-light-9);
      border-left-color: var(--el-color-primary);
    }
  }

  .detail-main {
    flex: 1;
    min-width: 0;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-right: 4px;
  }

  .detail-section {
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

  .basic-card {
    display: flex;
    justify-content: space-between;
    gap: 24px;
    padding: 16px 18px;
    border-radius: 10px;
    background: linear-gradient(135deg, #f5f8ff 0%, #fafbff 100%);
  }

  .org-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }

  .org-name {
    font-size: 18px;
    font-weight: 700;
    color: #1f2a44;
  }

  .meta-line {
    font-size: 13px;
    color: #909399;
    line-height: 1.8;
  }

  .basic-right {
    min-width: 320px;
    max-width: 420px;
    flex: 1;
  }

  .metric-line {
    font-size: 13px;
    color: #606266;
    line-height: 1.8;

    strong {
      color: #1f2a44;
      font-size: 15px;
    }
  }

  .progress-wrap {
    margin-top: 10px;
  }

  .plan-info-card {
    display: grid;
    grid-template-columns: minmax(240px, 320px) 1fr;
    gap: 16px;
    min-height: 200px;
  }

  .plan-summary {
    background: #f3f7ff;
    border-radius: 10px;
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .kv {
    display: flex;
    gap: 12px;
    font-size: 13px;
    line-height: 1.5;

    .k {
      width: 72px;
      flex-shrink: 0;
      color: #909399;
    }

    .v {
      color: #303133;
      font-weight: 500;
      word-break: break-all;
    }
  }

  .plan-tabs {
    border: 1px solid #eef0f5;
    border-radius: 10px;
    padding: 4px 16px 12px;
    background: #fff;

    :deep(.el-tabs__header) {
      margin-bottom: 8px;
    }
  }

  .tab-body {
    font-size: 13px;
    line-height: 1.7;
    color: #606266;
    white-space: pre-wrap;
    min-height: 120px;
  }

  .ops-top {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 16px;
  }

  .ops-top-item {
    display: flex;
    flex-direction: column;
    gap: 6px;

    .label {
      font-size: 12px;
      color: #909399;
    }

    .value {
      font-size: 14px;
      color: #303133;
      font-weight: 500;
    }
  }

  .ops-summary {
    position: relative;
    background: #f0f7ff;
    border-radius: 10px;
    padding: 16px 18px;
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .ops-summary-row {
    display: flex;
    gap: 12px;
    font-size: 13px;

    .k {
      width: 64px;
      color: #909399;
      flex-shrink: 0;
    }

    .v {
      color: #303133;
      font-weight: 500;
    }
  }

  .ops-audit-title {
    position: relative;
    padding-left: 12px;
    margin-bottom: 14px;
    font-size: 15px;
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

  .timeline-head {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 6px;

    .who {
      font-size: 14px;
      color: #303133;
      font-weight: 500;
    }
  }

  .timeline-remark {
    margin-top: 4px;
    padding: 8px 12px;
    border-radius: 6px;
    background: #f4f4f5;
    color: #606266;
    font-size: 13px;
    line-height: 1.5;
  }

  @media (max-width: 1100px) {
    .basic-card {
      flex-direction: column;
    }

    .basic-right {
      max-width: none;
    }

    .plan-info-card {
      grid-template-columns: 1fr;
    }
  }
</style>
