<!-- 审核管理：全部 / 待我审核 -->
<template>
  <div class="biz-page">
    <div class="biz-page-header">
      <h1 class="biz-page-title">审核管理</h1>
      <ElTabs v-model="activeTab" class="biz-tabs" @tab-change="handleTabChange">
        <ElTabPane label="全部" name="all" />
        <ElTabPane label="待我审核" name="pending" />
      </ElTabs>
    </div>

    <ElCard shadow="never" class="biz-filter-card">
      <ElForm :model="filterForm" class="audit-filter-form" label-width="80px">
        <div class="filter-grid">
          <ElFormItem label="工单ID">
            <ElInput v-model="filterForm.orderNo" placeholder="请输入工单ID" clearable />
          </ElFormItem>
          <ElFormItem label="机构名称">
            <ElInput v-model="filterForm.orgName" placeholder="请输入机构名称" clearable />
          </ElFormItem>
          <ElFormItem label="申请类型">
            <ElSelect v-model="filterForm.applyType" clearable placeholder="请选择申请类型">
              <ElOption label="申请试用" value="申请试用" />
              <ElOption label="申请关停" value="申请关停" />
              <ElOption label="申请重置" value="申请重置" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="所属销售">
            <ElInput v-model="filterForm.sales" placeholder="请输入所属销售" clearable />
          </ElFormItem>
          <ElFormItem label="产品名称">
            <ElInput v-model="filterForm.productName" placeholder="请输入产品名称" clearable />
          </ElFormItem>
          <ElFormItem label="方案名称">
            <ElInput v-model="filterForm.planName" placeholder="请输入方案名称" clearable />
          </ElFormItem>
          <ElFormItem label="申请时间">
            <ElDatePicker
              v-model="dateRange"
              type="daterange"
              value-format="YYYY-MM-DD"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              class="filter-date"
            />
          </ElFormItem>
          <ElFormItem v-if="activeTab === 'all'" label="当前审核人">
            <ElInput
              v-model="filterForm.currentAuditor"
              placeholder="请输入当前审核人"
              clearable
            />
          </ElFormItem>
          <ElFormItem v-if="activeTab === 'all'" label="审核状态">
            <ElSelect v-model="filterForm.status" clearable placeholder="请选择审核状态">
              <ElOption label="审核中" value="审核中" />
              <ElOption label="已驳回" value="已驳回" />
              <ElOption label="已完结" value="已完结" />
              <ElOption label="已撤回" value="已撤回" />
            </ElSelect>
          </ElFormItem>
        </div>
        <div class="filter-actions">
          <ElButton type="primary" :icon="Search" @click="handleSearch">查询</ElButton>
          <ElButton :icon="RefreshRight" @click="handleReset">重置</ElButton>
        </div>
      </ElForm>
    </ElCard>

    <ElCard shadow="never" class="biz-table-card">
      <div class="biz-table-container">
        <ElTable v-loading="loading" :data="tableData" height="100%" style="width: 100%">
          <ElTableColumn type="index" label="序号" width="64" align="center" />
          <ElTableColumn prop="orderNo" label="工单ID" width="160" />
          <ElTableColumn prop="applicant" label="申请人" width="100" />
          <ElTableColumn prop="applyTime" label="申请时间" width="170" />
          <ElTableColumn prop="applyType" label="申请类型" width="110" />
          <ElTableColumn prop="orgName" label="机构名称" min-width="140" show-overflow-tooltip />
          <ElTableColumn prop="productName" label="产品名称" min-width="120" show-overflow-tooltip />
          <ElTableColumn prop="planName" label="方案名称" min-width="160" show-overflow-tooltip />
          <ElTableColumn prop="sales" label="所属销售" width="100" />
          <ElTableColumn prop="currentAuditor" label="当前审核人" width="110" />
          <ElTableColumn label="审核状态" width="120" align="center">
            <template #default="{ row }">
              <ElTag
                :type="auditStatusTagType(row.status)"
                :effect="row.status === '审核中' ? 'plain' : 'light'"
                round
              >
                {{ auditStatusLabel(row.status) }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <ElButton link type="primary" @click="goView(row as ApplyOrder)">详情</ElButton>
              <ElButton
                v-if="canAudit(row as ApplyOrder)"
                link
                type="primary"
                @click="goAudit(row as ApplyOrder)"
              >
                审核
              </ElButton>
            </template>
          </ElTableColumn>
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
  import type { TabPaneName } from 'element-plus'
  import { fetchApplyAuditList } from '@/api/apply'
  import { useUserStore } from '@/store/modules/user'
  import { auditStatusLabel, auditStatusTagType } from '@/utils/apply-status'
  import type { ApplyOrder, ApplyStatus } from '@/types/apply'

  defineOptions({ name: 'ApplyAuditListPage' })

  type AuditTab = 'all' | 'pending'

  const router = useRouter()
  const route = useRoute()
  const userStore = useUserStore()
  const loading = ref(false)
  const tableData = ref<ApplyOrder[]>([])
  const dateRange = ref<string[]>([])
  const filterForm = reactive({
    orderNo: '',
    orgName: '',
    applyType: '',
    sales: '',
    productName: '',
    planName: '',
    currentAuditor: '',
    status: '' as '' | ApplyStatus | '已完结'
  })
  const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

  function parseTab(raw: unknown): AuditTab {
    return String(raw || '') === 'pending' ? 'pending' : 'all'
  }

  const activeTab = ref<AuditTab>(parseTab(route.query.tab))

  function currentUserName() {
    const info = userStore.getUserInfo
    return info.nickname || info.username || ''
  }

  function canAudit(row: ApplyOrder) {
    return row.status === '审核中' && row.currentAuditor === currentUserName()
  }

  async function fetchList() {
    loading.value = true
    try {
      const pendingMine = activeTab.value === 'pending'
      const res = await fetchApplyAuditList({
        page: pagination.page,
        pageSize: pagination.pageSize,
        orderNo: filterForm.orderNo || null,
        orgName: filterForm.orgName || null,
        startDate: dateRange.value?.[0] || null,
        endDate: dateRange.value?.[1] || null,
        applyType: filterForm.applyType || null,
        sales: filterForm.sales || null,
        productName: filterForm.productName || null,
        planName: filterForm.planName || null,
        currentAuditor:
          !pendingMine && filterForm.currentAuditor ? filterForm.currentAuditor : null,
        status: !pendingMine && filterForm.status ? filterForm.status : null,
        pendingMine: pendingMine || null,
        currentUser: pendingMine ? currentUserName() : null
      })
      if (res.code === 200) {
        tableData.value = res.data.list
        pagination.total = res.data.total
      }
    } finally {
      loading.value = false
    }
  }

  function syncRouteTab(tab: AuditTab) {
    router.replace({
      path: '/apply/audit',
      query: tab === 'all' ? {} : { tab }
    })
  }

  function handleTabChange(name: TabPaneName) {
    activeTab.value = parseTab(name)
    filterForm.currentAuditor = ''
    filterForm.status = ''
    pagination.page = 1
    syncRouteTab(activeTab.value)
    fetchList()
  }

  function handleSearch() {
    pagination.page = 1
    fetchList()
  }

  function handleReset() {
    filterForm.orderNo = ''
    filterForm.orgName = ''
    filterForm.applyType = ''
    filterForm.sales = ''
    filterForm.productName = ''
    filterForm.planName = ''
    filterForm.currentAuditor = ''
    filterForm.status = ''
    dateRange.value = []
    handleSearch()
  }

  function fromQuery() {
    return activeTab.value === 'pending' ? 'pending' : 'all'
  }

  function goView(row: ApplyOrder) {
    router.push({
      path: `/apply/audit/detail/${row.id}`,
      query: { from: fromQuery() }
    })
  }

  function goAudit(row: ApplyOrder) {
    router.push({
      path: `/apply/audit/detail/${row.id}`,
      query: { mode: 'audit', from: fromQuery() }
    })
  }

  watch(
    () => route.query.tab,
    (tab) => {
      const next = parseTab(tab)
      if (next !== activeTab.value) {
        activeTab.value = next
        pagination.page = 1
        fetchList()
      }
    }
  )

  onMounted(fetchList)
</script>

<style scoped lang="scss">
  .audit-filter-form {
    width: 100%;
  }

  .filter-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 4px 16px;

    :deep(.el-form-item) {
      margin-right: 0;
      margin-bottom: 12px;
      width: 100%;
    }

    :deep(.el-form-item__content) {
      flex: 1;
      min-width: 0;
    }

    :deep(.el-input),
    :deep(.el-select) {
      width: 100%;
    }

    .filter-date {
      width: 100%;
    }
  }

  .filter-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 4px 0 8px;
  }

  @media (max-width: 1400px) {
    .filter-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (max-width: 1100px) {
    .filter-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
