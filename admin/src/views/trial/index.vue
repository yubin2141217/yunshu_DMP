<!-- 试用管理：全部方案 / 机构方案 -->
<template>
  <div class="biz-page">
    <div class="biz-page-header">
      <h1 class="biz-page-title">试用管理</h1>
      <ElTabs v-model="activeTab" class="biz-tabs" @tab-change="handleTabChange">
        <ElTabPane label="全部方案" name="plan" />
        <ElTabPane label="机构方案" name="org" />
      </ElTabs>
    </div>

    <ElCard shadow="never" class="biz-filter-card">
      <ElForm :model="activeTab === 'plan' ? planFilter : orgFilter" class="biz-filter-form" label-width="auto">
        <template v-if="activeTab === 'plan'">
          <ElFormItem label="机构名称">
            <ElInput v-model="planFilter.orgName" placeholder="请输入" clearable style="width: 160px" />
          </ElFormItem>
          <ElFormItem label="统计单元">
            <ElSelect v-model="planFilter.unit" placeholder="请选择" clearable style="width: 140px">
              <ElOption v-for="u in unitOptions" :key="u" :label="u" :value="u" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="所属销售">
            <ElSelect v-model="planFilter.sales" placeholder="请选择" clearable filterable allow-create style="width: 140px">
              <ElOption v-for="s in salesOptions" :key="s" :label="s" :value="s" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="产品名称">
            <ElInput v-model="planFilter.productName" placeholder="请输入" clearable style="width: 140px" />
          </ElFormItem>
          <ElFormItem label="方案名称">
            <ElInput v-model="planFilter.planName" placeholder="请输入" clearable style="width: 160px" />
          </ElFormItem>
          <ElFormItem label="方案状态">
            <ElSelect v-model="planFilter.status" placeholder="请选择" clearable style="width: 120px">
              <ElOption label="试用中" value="trialing" />
              <ElOption label="已到期" value="expired" />
              <ElOption label="冻结中" value="frozen" />
              <ElOption label="手动关停" value="stopped" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="开始日期区间">
            <ElDatePicker
              v-model="startDateRange"
              type="daterange"
              value-format="YYYY-MM-DD"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 240px"
            />
          </ElFormItem>
          <ElFormItem label="所有到期日">
            <ElDatePicker
              v-model="endDateRange"
              type="daterange"
              value-format="YYYY-MM-DD"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 240px"
            />
          </ElFormItem>
        </template>
        <template v-else>
          <ElFormItem label="机构名称">
            <ElInput v-model="orgFilter.orgName" placeholder="请输入" clearable style="width: 180px" />
          </ElFormItem>
          <ElFormItem label="统计单元">
            <ElSelect v-model="orgFilter.unit" placeholder="请选择" clearable style="width: 140px">
              <ElOption v-for="u in unitOptions" :key="u" :label="u" :value="u" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="所属销售">
            <ElInput v-model="orgFilter.sales" placeholder="请输入" clearable style="width: 140px" />
          </ElFormItem>
        </template>
        <ElFormItem class="biz-filter-actions">
          <ElButton type="primary" :icon="Search" @click="handleSearch">查询</ElButton>
          <ElButton :icon="RefreshRight" @click="handleReset">重置</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <BizStatCards v-if="activeTab === 'plan'" :items="statItems" />

    <ElCard shadow="never" class="biz-table-card">
      <div class="biz-table-container">
        <ElTable v-loading="loading" :data="tableData" height="100%" style="width: 100%">
          <template v-if="activeTab === 'plan'">
            <ElTableColumn type="index" label="序号" width="64" align="center" />
            <ElTableColumn label="机构信息" min-width="200">
              <template #default="{ row }">
                <div class="biz-cell-stack">
                  <span class="biz-cell-main">{{ row.orgName }}</span>
                  <span class="biz-cell-sub">{{ row.unit }} / {{ row.sales }}</span>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn label="产品方案信息" min-width="200">
              <template #default="{ row }">
                <div class="biz-cell-stack">
                  <span class="biz-cell-main">{{ row.productName }}</span>
                  <span class="biz-cell-sub">{{ row.planName }}</span>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="startDate" label="开始日期" width="118" />
            <ElTableColumn prop="trialDays" label="试用天数" width="96" align="center" />
            <ElTableColumn prop="endDate" label="到期日期" width="118" />
            <ElTableColumn label="到期天数" width="100" align="center">
              <template #default="{ row }">{{ row.expireDesc }}</template>
            </ElTableColumn>
            <ElTableColumn label="方案状态" width="110" align="center">
              <template #default="{ row }">
                <ElTag :type="statusTagType(row.status)" effect="light" round>
                  {{ statusLabel(row.status) }}
                </ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn label="延期次数" width="120" align="center">
              <template #default="{ row }">
                <div class="biz-ext-progress">
                  <span class="biz-ext-progress__text">延期{{ (row as TrialPlanItem).extendedCount }}次</span>
                  <div class="biz-ext-progress__bar">
                    <i :style="{ width: extPercent(row as TrialPlanItem) }" />
                  </div>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn label="操作" width="80" fixed="right">
              <template #default="{ row }">
                <ElButton link type="primary" @click="router.push(`/trial/detail/${row.id}`)">详情</ElButton>
              </template>
            </ElTableColumn>
          </template>
          <template v-else>
            <ElTableColumn type="index" label="序号" width="64" align="center" />
            <ElTableColumn prop="orgName" label="机构名称" min-width="180" />
            <ElTableColumn prop="unit" label="统计单元" width="140" />
            <ElTableColumn prop="sales" label="所属销售" width="120" />
            <ElTableColumn label="正常试用产品/全部试用产品" width="220" align="center">
              <template #default="{ row }">{{ row.normalTrialCount }}/{{ row.totalTrialCount }}</template>
            </ElTableColumn>
            <ElTableColumn label="操作" width="80" fixed="right">
              <template #default="{ row }">
                <ElButton link type="primary" @click="router.push(`/trial/org/detail/${row.id}`)">详情</ElButton>
              </template>
            </ElTableColumn>
          </template>
        </ElTable>
      </div>
      <div class="biz-pagination">
        <ElPagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchList"
          @current-change="fetchList"
        />
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { RefreshRight, Search } from '@element-plus/icons-vue'
  import BizStatCards from '@/components/business/biz-stat-cards/index.vue'
  import type { BizStatItem } from '@/components/business/biz-stat-cards/types'
  import { fetchTrialOrgList, fetchTrialPlanList, fetchTrialUnits } from '@/api/trial'
  import { trialStatusLabel, trialStatusTagType } from '@/mock/trial'
  import type { TrialOrgItem, TrialPlanItem, TrialPlanStats, TrialPlanStatus } from '@/types/trial'

  defineOptions({ name: 'TrialListPage' })

  const router = useRouter()
  const activeTab = ref<'plan' | 'org'>('plan')
  const loading = ref(false)
  const unitOptions = ref<string[]>([])
  const salesOptions = ref<string[]>(['张伟', '李娜', '王强', '赵敏'])
  const tableData = ref<(TrialPlanItem | TrialOrgItem)[]>([])
  const startDateRange = ref<string[]>([])
  const endDateRange = ref<string[]>([])
  const planFilter = reactive({
    orgName: '',
    unit: '',
    sales: '',
    productName: '',
    planName: '',
    status: '' as TrialPlanStatus | ''
  })
  const orgFilter = reactive({ orgName: '', unit: '', sales: '' })
  const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
  const stats = reactive<TrialPlanStats>({
    total: 0,
    trialing: 0,
    expired: 0,
    frozen: 0,
    stopped: 0
  })

  const statItems = computed<BizStatItem[]>(() => [
    { key: 'total', label: '总数量', value: stats.total, tone: 'primary', icon: 'User' },
    { key: 'trialing', label: '试用中', value: stats.trialing, tone: 'amber', icon: 'Document' },
    { key: 'expired', label: '已到期', value: stats.expired, tone: 'warning', icon: 'Clock' },
    { key: 'stopped', label: '手动关停', value: stats.stopped, tone: 'danger', icon: 'Lock' }
  ])

  function statusLabel(status: TrialPlanStatus) {
    return trialStatusLabel(status)
  }

  function statusTagType(status: TrialPlanStatus) {
    return trialStatusTagType(status)
  }

  function extPercent(row: TrialPlanItem) {
    const total = Number(row.totalExtension) || 0
    if (!total) return '0%'
    const pct = Math.min(100, Math.round((Number(row.extendedCount) / total) * 100))
    return `${pct}%`
  }

  async function loadUnits() {
    const res = await fetchTrialUnits()
    if (res.code === 200) unitOptions.value = res.data
  }

  async function fetchList() {
    loading.value = true
    try {
      if (activeTab.value === 'plan') {
        const res = await fetchTrialPlanList({
          page: pagination.page,
          pageSize: pagination.pageSize,
          orgName: planFilter.orgName || null,
          unit: planFilter.unit || null,
          sales: planFilter.sales || null,
          productName: planFilter.productName || null,
          planName: planFilter.planName || null,
          status: planFilter.status || null,
          startDateBegin: startDateRange.value?.[0] || null,
          startDateEnd: startDateRange.value?.[1] || null,
          endDateBegin: endDateRange.value?.[0] || null,
          endDateEnd: endDateRange.value?.[1] || null
        })
        if (res.code === 200) {
          tableData.value = res.data.list
          pagination.total = res.data.total
          Object.assign(stats, res.data.stats)
        }
      } else {
        const res = await fetchTrialOrgList({
          page: pagination.page,
          pageSize: pagination.pageSize,
          orgName: orgFilter.orgName || null,
          unit: orgFilter.unit || null,
          sales: orgFilter.sales || null
        })
        if (res.code === 200) {
          tableData.value = res.data.list
          pagination.total = res.data.total
        }
      }
    } finally {
      loading.value = false
    }
  }

  function handleSearch() {
    pagination.page = 1
    fetchList()
  }

  function handleReset() {
    if (activeTab.value === 'plan') {
      planFilter.orgName = ''
      planFilter.unit = ''
      planFilter.sales = ''
      planFilter.productName = ''
      planFilter.planName = ''
      planFilter.status = ''
      startDateRange.value = []
      endDateRange.value = []
    } else {
      orgFilter.orgName = ''
      orgFilter.unit = ''
      orgFilter.sales = ''
    }
    handleSearch()
  }

  function handleTabChange() {
    pagination.page = 1
    tableData.value = []
    fetchList()
  }

  onMounted(() => {
    loadUnits()
    fetchList()
  })
</script>
