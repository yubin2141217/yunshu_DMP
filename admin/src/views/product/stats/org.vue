<!-- 机构统计 -->
<template>
  <div class="biz-page">
    <ElCard shadow="never" class="biz-breadcrumb-card">
      <div class="biz-header-row">
        <ElButton text :icon="ArrowLeft" @click="router.push('/product/plans')">返回</ElButton>
        <span class="title">机构统计</span>
      </div>
    </ElCard>

    <ElCard shadow="never" class="biz-filter-card">
      <ElForm :model="filterForm" class="biz-filter-form" label-width="auto">
        <ElFormItem label="机构名称">
          <ElInput v-model="filterForm.orgName" clearable style="width: 200px" />
        </ElFormItem>
        <ElFormItem class="biz-filter-actions">
          <ElButton type="primary" :icon="Search" @click="handleSearch">查询</ElButton>
          <ElButton :icon="RefreshRight" @click="handleReset">重置</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <ElCard shadow="never" class="biz-table-card">
      <div class="biz-table-container">
        <ElTable v-loading="loading" :data="tableData" height="100%" style="width: 100%">
          <ElTableColumn label="产品方案信息" min-width="200">
            <template #default="{ row }">
              <div class="biz-cell-stack">
                <span class="biz-cell-main">{{ row.productName }}</span>
                <span class="biz-cell-sub">{{ row.planName }}</span>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="机构名称" min-width="220">
            <template #default="{ row }">
              <div class="biz-cell-stack">
                <span class="biz-cell-main">{{ row.orgName }}</span>
                <span class="biz-cell-sub">{{ row.unit }} / {{ row.sales }}</span>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="方案状态" width="110" align="center">
            <template #default="{ row }">
              <ElTag effect="light" round>{{ statusLabel(row.status) }}</ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="startDate" label="开始日期" width="120" />
          <ElTableColumn prop="trialTimeLabel" label="试用时间" width="100" />
          <ElTableColumn prop="endDate" label="结束日期" width="120" />
          <ElTableColumn prop="expireDesc" label="到期时间" width="120" />
          <ElTableColumn label="已延期/总延期" width="120" align="center">
            <template #default="{ row }"
              >{{ row.extendedCount }}/{{ row.totalExtension }}</template
            >
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
  import { ArrowLeft, RefreshRight, Search } from '@element-plus/icons-vue'
  import { fetchOrgStats } from '@/api/product'
  import type { OrgStatItem } from '@/types/product'

  defineOptions({ name: 'OrgStatsPage' })

  const route = useRoute()
  const router = useRouter()
  const loading = ref(false)
  const tableData = ref<OrgStatItem[]>([])
  const filterForm = reactive({ orgName: '' })
  const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

  function statusLabel(status: OrgStatItem['status']) {
    const map = {
      trialing: '试用中',
      expired: '已到期',
      frozen: '冻结中',
      stopped: '手动关停'
    }
    return map[status]
  }

  async function fetchList() {
    loading.value = true
    try {
      const res = await fetchOrgStats({
        page: pagination.page,
        pageSize: pagination.pageSize,
        planId: Number(route.params.planId),
        statusType: (route.query.statusType as string) || 'use',
        orgName: filterForm.orgName || null
      })
      if (res.code === 200) {
        tableData.value = res.data.list
        pagination.total = res.data.total
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
    filterForm.orgName = ''
    handleSearch()
  }

  watch(
    () => [route.params.planId, route.query.statusType] as const,
    () => {
      pagination.page = 1
      fetchList()
    }
  )

  onMounted(fetchList)
</script>
