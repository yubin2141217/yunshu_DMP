<!-- 处理记录：已归档 + 已拒绝 -->
<template>
  <div class="biz-page">
    <div class="biz-page-header">
      <h1 class="biz-page-title">处理记录</h1>
    </div>

    <ElCard shadow="never" class="biz-filter-card">
      <ElForm :model="filterForm" class="biz-filter-form" label-width="80px">
        <ElFormItem label="工单ID">
          <ElInput
            v-model="filterForm.orderNo"
            placeholder="请输入工单ID"
            clearable
            class="filter-control"
          />
        </ElFormItem>
        <ElFormItem label="机构名称">
          <ElInput
            v-model="filterForm.orgName"
            placeholder="请输入机构名称"
            clearable
            class="filter-control"
          />
        </ElFormItem>
        <ElFormItem label="所属销售">
          <ElInput
            v-model="filterForm.sales"
            clearable
            placeholder="请输入所属销售"
            class="filter-control"
          />
        </ElFormItem>
        <ElFormItem label="产品名称">
          <ElInput
            v-model="filterForm.productName"
            clearable
            placeholder="请输入产品名称"
            class="filter-control"
          />
        </ElFormItem>
        <ElFormItem label="方案名称">
          <ElInput
            v-model="filterForm.planName"
            clearable
            placeholder="请输入方案名称"
            class="filter-control"
          />
        </ElFormItem>
        <ElFormItem label="申请时间">
          <ElDatePicker
            v-model="dateRange"
            type="daterange"
            value-format="YYYY-MM-DD"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            class="filter-control-date"
          />
        </ElFormItem>
        <ElFormItem label="处理状态">
          <ElSelect
            v-model="filterForm.status"
            clearable
            placeholder="请选择处理状态"
            class="filter-control"
          >
            <ElOption label="已归档" value="已归档" />
            <ElOption label="已拒绝" value="已拒绝" />
          </ElSelect>
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
          <ElTableColumn prop="orderNo" label="工单ID" width="160" />
          <ElTableColumn prop="applicant" label="申请人" width="100" />
          <ElTableColumn prop="applyTime" label="申请时间" width="170" />
          <ElTableColumn prop="applyType" label="申请类型" width="110" />
          <ElTableColumn prop="orgName" label="机构名称" min-width="140" show-overflow-tooltip />
          <ElTableColumn prop="productName" label="产品名称" min-width="120" show-overflow-tooltip />
          <ElTableColumn prop="planName" label="方案名称" min-width="160" show-overflow-tooltip />
          <ElTableColumn prop="sales" label="所属销售" width="100" />
          <ElTableColumn prop="handler" label="处理人" width="100" />
          <ElTableColumn label="处理状态" width="100" align="center">
            <template #default="{ row }">
              <ElTag :type="applyStatusTagType(row.status)" effect="light" round>
                {{ recordStatusLabel(row.status) }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="processTime" label="处理时间" width="170" />
          <ElTableColumn label="操作" width="80" fixed="right">
            <template #default="{ row }">
              <ElButton link type="primary" @click="goDetail(row.id)">详情</ElButton>
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
  import { fetchApplyRecordsList } from '@/api/apply'
  import { applyStatusTagType, recordStatusLabel } from '@/utils/apply-status'
  import type { ApplyOrder, ApplyStatus } from '@/types/apply'

  defineOptions({ name: 'ApplyRecordsListPage' })

  const router = useRouter()
  const loading = ref(false)
  const tableData = ref<ApplyOrder[]>([])
  const dateRange = ref<string[]>([])
  const filterForm = reactive({
    orderNo: '',
    orgName: '',
    sales: '',
    productName: '',
    planName: '',
    status: '' as '' | ApplyStatus
  })
  const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

  async function fetchList() {
    loading.value = true
    try {
      const res = await fetchApplyRecordsList({
        page: pagination.page,
        pageSize: pagination.pageSize,
        orderNo: filterForm.orderNo || null,
        orgName: filterForm.orgName || null,
        startDate: dateRange.value?.[0] || null,
        endDate: dateRange.value?.[1] || null,
        sales: filterForm.sales || null,
        productName: filterForm.productName || null,
        planName: filterForm.planName || null,
        status: filterForm.status || null
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
    filterForm.orderNo = ''
    filterForm.orgName = ''
    filterForm.sales = ''
    filterForm.productName = ''
    filterForm.planName = ''
    filterForm.status = ''
    dateRange.value = []
    handleSearch()
  }

  function goDetail(id: number) {
    router.push(`/apply/records/detail/${id}`)
  }

  onMounted(fetchList)
</script>

<style scoped lang="scss">
  .filter-control {
    width: 200px;
  }

  .filter-control-date {
    width: 260px;
  }
</style>
