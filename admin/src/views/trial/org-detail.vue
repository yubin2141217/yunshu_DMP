<!-- 试用管理 · 机构详情（对齐设计稿：基础信息 / 产品方案信息 / 操作记录） -->
<template>
  <div class="biz-detail-page trial-org-detail" v-loading="loading">
    <ElCard shadow="never" class="biz-breadcrumb-card">
      <div class="biz-header-row">
        <ElButton text :icon="ArrowLeft" @click="router.push('/trial')">返回</ElButton>
        <span class="title">机构详情</span>
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
              </div>
              <div class="meta-line">统计单元：{{ detail.unit || '—' }}</div>
              <div class="meta-line">所属销售：{{ detail.sales || '—' }}</div>
            </div>
            <div class="basic-right">
              <div class="stat-chip">
                <span class="stat-label">正常/全部试用产品</span>
                <span class="stat-value">
                  <em>{{ detail.activePlanCount }}</em>/{{ detail.totalPlanCount }}个
                </span>
              </div>
            </div>
          </div>
        </section>

        <!-- 产品方案信息 -->
        <section id="sec-plans" class="detail-section">
          <div class="section-title-row">
            <div class="section-title">产品方案信息</div>
            <ElButton
              type="danger"
              plain
              size="small"
              :disabled="!canStopAll"
              :loading="stoppingAll"
              @click="handleStopAll"
            >
              关停全部产品方案
            </ElButton>
          </div>
          <ElTable :data="detail.plans || []" style="width: 100%" empty-text="暂无产品方案">
            <ElTableColumn type="index" label="序号" width="64" align="center" />
            <ElTableColumn prop="productName" label="产品名称" min-width="120" show-overflow-tooltip />
            <ElTableColumn prop="planName" label="方案名称" min-width="180" show-overflow-tooltip />
            <ElTableColumn label="开始时间" width="170">
              <template #default="{ row }">{{ formatDateTime(row.startDate, '00:00:00') }}</template>
            </ElTableColumn>
            <ElTableColumn label="到期时间" width="170">
              <template #default="{ row }">{{ formatDateTime(row.endDate, '23:59:59') }}</template>
            </ElTableColumn>
            <ElTableColumn label="方案状态" width="110" align="center">
              <template #default="{ row }">
                <ElTag :type="statusTagType(row.status)" effect="light" round>
                  {{ statusLabel(row.status) }}
                </ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn label="延期次数" width="180" align="center">
              <template #default="{ row }">
                <div class="ext-cell">
                  <span class="ext-text">
                    延期 {{ row.extendedCount }}次 / 共 {{ row.totalExtension }}次
                  </span>
                  <ElProgress
                    :percentage="extensionPercent(row as TrialOrgPlanItem)"
                    :stroke-width="6"
                    :show-text="false"
                    :color="row.status === 'stopped' ? '#f56c6c' : '#67c23a'"
                  />
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <ElButton link type="primary" @click="goPlanDetail(row as TrialOrgPlanItem)">查看详情</ElButton>
                <ElButton
                  link
                  type="danger"
                  :disabled="row.status === 'stopped'"
                  @click="handleStopOne(row as TrialOrgPlanItem)"
                >
                  关停
                </ElButton>
              </template>
            </ElTableColumn>
          </ElTable>
        </section>

        <!-- 操作记录 -->
        <section id="sec-ops" class="detail-section">
          <div class="section-title">操作记录</div>
          <ElTable
            :data="pagedRecords"
            style="width: 100%"
            empty-text="暂无操作记录"
          >
            <ElTableColumn prop="ticketId" label="工单ID" min-width="150" />
            <ElTableColumn prop="applicant" label="操作人" width="100" />
            <ElTableColumn prop="applyType" label="操作类型" width="120" />
            <ElTableColumn prop="applyTime" label="操作时间" width="180" />
            <ElTableColumn label="工单状态" width="110" align="center">
              <template #default="{ row }">
                <ElTag :type="applyTagType(row.status)" effect="light" round>
                  {{ applyLabel(row.status) }}
                </ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <ElButton link type="primary" @click="openRecordDialog(row as TrialApplyRecord)">
                  查看详情
                </ElButton>
              </template>
            </ElTableColumn>
          </ElTable>
          <div class="pager-wrap">
            <ElPagination
              v-model:current-page="opsPage"
              v-model:page-size="opsPageSize"
              :total="detail.applyRecords?.length || 0"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next"
              background
            />
          </div>
        </section>
      </div>
    </div>

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
            <span class="label">操作人</span>
            <span class="value">{{ activeRecord.applicant }}</span>
          </div>
          <div class="ops-top-item">
            <span class="label">操作类型</span>
            <span class="value">{{ activeRecord.applyType }}</span>
          </div>
          <div class="ops-top-item">
            <span class="label">操作时间</span>
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
            <span class="v">{{ activeRecord.productName || '—' }}</span>
          </div>
          <div class="ops-summary-row">
            <span class="k">方案名称</span>
            <span class="v">{{ activeRecord.planName || '—' }}</span>
          </div>
        </div>

        <div class="ops-audit-title">审核信息</div>
        <ElTimeline v-if="(activeRecord.auditNodes || []).length" class="ops-timeline">
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
        <ElEmpty v-else description="暂无审核信息" :image-size="64" />
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ArrowLeft } from '@element-plus/icons-vue'
  import {
    fetchTrialOrgDetail,
    stopAllTrialPlansByOrg,
    stopTrialPlan
  } from '@/api/trial'
  import { applyStatusLabel, trialStatusLabel, trialStatusTagType } from '@/mock/trial'
  import type {
    TrialApplyRecord,
    TrialApplyStatus,
    TrialOrgDetail,
    TrialOrgPlanItem,
    TrialPlanStatus
  } from '@/types/trial'

  defineOptions({ name: 'TrialOrgDetailPage' })

  const route = useRoute()
  const router = useRouter()
  const loading = ref(false)
  const stoppingAll = ref(false)
  const detail = ref<TrialOrgDetail | null>(null)
  const activeAnchor = ref('sec-basic')
  const mainRef = ref<HTMLElement | null>(null)
  const dialogVisible = ref(false)
  const activeRecord = ref<TrialApplyRecord | null>(null)
  const opsPage = ref(1)
  const opsPageSize = ref(10)

  const anchorItems = [
    { id: 'sec-basic', label: '基础信息' },
    { id: 'sec-plans', label: '产品方案信息' },
    { id: 'sec-ops', label: '操作记录' }
  ]

  const canStopAll = computed(
    () => (detail.value?.plans || []).some((p) => p.status !== 'stopped')
  )

  const pagedRecords = computed(() => {
    const list = detail.value?.applyRecords || []
    const start = (opsPage.value - 1) * opsPageSize.value
    return list.slice(start, start + opsPageSize.value)
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

  function nodeStatusType(status: string): 'success' | 'warning' | 'danger' | 'primary' | 'info' {
    if (status.includes('驳回') || status.includes('未通过')) return 'danger'
    if (status.includes('自动跳过')) return 'info'
    if (status.includes('审核中') || status.includes('处理中')) return 'warning'
    if (status.includes('通过') || status.includes('提交')) return 'success'
    return 'primary'
  }

  function formatDateTime(date: string, time: string) {
    if (!date) return '—'
    if (date.includes(' ')) return date
    return `${date} ${time}`
  }

  function extensionPercent(row: TrialOrgPlanItem) {
    if (!row.totalExtension) return 0
    return Math.min(100, Math.round((row.extendedCount / row.totalExtension) * 100))
  }

  function goPlanDetail(row: TrialOrgPlanItem) {
    router.push({
      path: `/product/plan/detail/${row.productPlanId}`,
      query: { from: route.fullPath }
    })
  }

  function scrollToSection(id: string) {
    activeAnchor.value = id
    const el = document.getElementById(id)
    const container = mainRef.value
    if (!el || !container) return
    container.scrollTo({ top: el.offsetTop - 8, behavior: 'smooth' })
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
      const res = await fetchTrialOrgDetail(id)
      if (res.code === 200) {
        detail.value = res.data
        opsPage.value = 1
      } else {
        ElMessage.error(res.message || '加载失败')
      }
    } finally {
      loading.value = false
    }
  }

  async function handleStopOne(row: TrialOrgPlanItem) {
    if (row.status === 'stopped') return
    try {
      await ElMessageBox.confirm(
        `确认关停「${row.productName} / ${row.planName}」？关停后不可恢复为试用中。`,
        '关停确认',
        { type: 'warning', confirmButtonText: '确认关停', cancelButtonText: '取消' }
      )
      const res = await stopTrialPlan(row.id)
      if (res.code === 200) {
        ElMessage.success('关停成功')
        await loadData()
      } else {
        ElMessage.error(res.message || '关停失败')
      }
    } catch {
      /* 取消 */
    }
  }

  async function handleStopAll() {
    if (!canStopAll.value || !detail.value) return
    try {
      await ElMessageBox.confirm(
        '确认关停该机构下全部产品方案？关停后不可恢复为试用中。',
        '关停确认',
        { type: 'warning', confirmButtonText: '确认关停', cancelButtonText: '取消' }
      )
      stoppingAll.value = true
      const res = await stopAllTrialPlansByOrg(detail.value.id)
      if (res.code === 200) {
        ElMessage.success('关停成功')
        await loadData()
      } else {
        ElMessage.error(res.message || '关停失败')
      }
    } catch {
      /* 取消 */
    } finally {
      stoppingAll.value = false
    }
  }

  onMounted(loadData)
</script>

<style scoped lang="scss">
  .trial-org-detail {
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

  .section-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;

    .section-title {
      margin-bottom: 0;
    }
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
    align-items: center;
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

  .stat-chip {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
    min-width: 160px;
    padding: 12px 16px;
    border-radius: 10px;
    background: #fff;
    box-shadow: 0 1px 4px rgba(31, 42, 68, 0.06);
  }

  .stat-label {
    font-size: 12px;
    color: #909399;
  }

  .stat-value {
    font-size: 14px;
    color: #606266;

    em {
      font-style: normal;
      font-size: 22px;
      font-weight: 700;
      color: var(--el-color-primary);
      margin-right: 2px;
    }
  }

  .ext-cell {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 0 8px;
  }

  .ext-text {
    font-size: 12px;
    color: #606266;
    white-space: nowrap;
  }

  .pager-wrap {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
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
      align-items: stretch;
    }

    .stat-chip {
      align-items: flex-start;
    }
  }
</style>
