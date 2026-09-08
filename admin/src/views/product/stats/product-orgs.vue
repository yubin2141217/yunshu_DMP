<!-- 产品维度 · 机构统计（从产品列表「试用机构数量」下钻） -->
<template>
  <div class="biz-page">
    <ElCard shadow="never" class="biz-breadcrumb-card">
      <div class="biz-header-row">
        <ElButton text :icon="ArrowLeft" @click="router.push('/product/list')">返回</ElButton>
        <span class="title">机构统计</span>
      </div>
    </ElCard>

    <ElCard shadow="never" class="biz-filter-card">
      <ElForm :model="filterForm" class="biz-filter-form" label-width="auto">
        <ElFormItem label="机构名称">
          <ElInput
            v-model="filterForm.orgName"
            clearable
            placeholder="请输入机构名称"
            style="width: 200px"
          />
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
          <ElTableColumn type="index" label="序号" width="64" align="center" />
          <ElTableColumn prop="orgName" label="机构名称" min-width="220" show-overflow-tooltip />
          <ElTableColumn label="试用状态" width="120" align="center">
            <template #default="{ row }">
              <ElTag :type="statusTagType(row.status)" effect="light" round>{{
                row.status
              }}</ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="startTime" label="开始时间" width="180" />
          <ElTableColumn prop="endTime" label="结束时间" width="180" />
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
  import { fetchProductTrialOrgs } from '@/api/product'
  import type { ProductTrialOrgItem, ProductTrialOrgStatus } from '@/types/product'

  defineOptions({ name: 'ProductTrialOrgStatsPage' })

  const route = useRoute()
  const router = useRouter()
  const loading = ref(false)
  const tableData = ref<ProductTrialOrgItem[]>([])
  const filterForm = reactive({ orgName: '' })
  const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

  function statusTagType(status: ProductTrialOrgStatus) {
    if (status === '试用中') return 'success'
    if (status === '申请中') return 'warning'
    return 'info'
  }

  async function fetchList() {
    loading.value = true
    try {
      const res = await fetchProductTrialOrgs({
        page: pagination.page,
        pageSize: pagination.pageSize,
        productId: Number(route.params.productId),
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
    () => route.params.productId,
    () => {
      pagination.page = 1
      fetchList()
    }
  )

  onMounted(fetchList)
</script>
