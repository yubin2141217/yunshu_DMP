<!-- 方案统计 -->
<template>
  <div class="biz-page">
    <div class="biz-page-header">
      <h1 class="biz-page-title">方案统计</h1>
    </div>

    <ElCard shadow="never" class="biz-filter-card">
      <ElForm :model="filterForm" class="biz-filter-form" label-width="auto">
        <ElFormItem label="方案名称">
          <ElInput
            v-model="filterForm.planName"
            placeholder="请输入方案名称"
            clearable
            style="width: 180px"
          />
        </ElFormItem>
        <ElFormItem label="产品名称">
          <ElInput
            v-model="filterForm.productName"
            placeholder="请输入产品名称"
            clearable
            style="width: 180px"
          />
        </ElFormItem>
        <ElFormItem label="试用时间">
          <ElSelect
            v-model="filterForm.trialTimeType"
            clearable
            placeholder="全部"
            style="width: 140px"
          >
            <ElOption label="不限制" value="none" />
            <ElOption label="1个月" value="1m" />
            <ElOption label="2个月" value="2m" />
            <ElOption label="3个月" value="3m" />
            <ElOption label="自定义天数" value="custom" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="可延期次数">
          <ElSelect
            v-model="filterForm.extensionCount"
            clearable
            placeholder="全部"
            style="width: 120px"
          >
            <ElOption v-for="n in extensionOptions" :key="n" :label="`${n}次`" :value="n" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="状态">
          <ElSelect
            v-model="filterForm.displayStatus"
            clearable
            placeholder="全部"
            style="width: 120px"
          >
            <ElOption label="开" :value="1" />
            <ElOption label="关" :value="0" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="试用机构">
          <ElSelect
            v-model="filterForm.hasTrialOrg"
            clearable
            placeholder="全部"
            style="width: 140px"
          >
            <ElOption label="有试用机构" value="yes" />
            <ElOption label="无试用机构" value="no" />
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
          <ElTableColumn prop="name" label="方案名称" min-width="180" show-overflow-tooltip />
          <ElTableColumn prop="productName" label="产品名称" width="120" />
          <ElTableColumn label="使用机构数量" width="120" align="center">
            <template #default="{ row }">
              <ElButton link type="primary" @click="goOrg(row.id, 'use')">{{
                row.useOrgCount
              }}</ElButton>
            </template>
          </ElTableColumn>
          <ElTableColumn label="试用机构数量" width="120" align="center">
            <template #default="{ row }">
              <ElButton link type="primary" @click="goOrg(row.id, 'trial')">{{
                row.trialOrgCount
              }}</ElButton>
            </template>
          </ElTableColumn>
          <ElTableColumn label="到期机构数量" width="120" align="center">
            <template #default="{ row }">
              <ElButton link type="primary" @click="goOrg(row.id, 'expire')">{{
                row.expireOrgCount
              }}</ElButton>
            </template>
          </ElTableColumn>
          <ElTableColumn label="冻结机构数量" width="120" align="center">
            <template #default="{ row }">
              <ElButton link type="primary" @click="goOrg(row.id, 'freeze')">{{
                row.freezeOrgCount
              }}</ElButton>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="trialTimeLabel" label="试用时间" width="100" />
          <ElTableColumn prop="extensionCount" label="可延期次数" width="110" align="center" />
          <ElTableColumn label="状态" width="100" align="center">
            <template #default="{ row }">
              <ElSwitch
                v-model="row.displayStatus"
                :active-value="1"
                :inactive-value="0"
                inline-prompt
                active-text="开"
                inactive-text="关"
                @change="(val: string | number | boolean) => handleStatus(row as Plan, Number(val))"
              />
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <ElButton link type="primary" @click="router.push(`/product/plan/detail/${row.id}`)"
                >详情</ElButton
              >
              <ElButton link type="primary" @click="router.push(`/product/plan/edit/${row.id}`)"
                >编辑</ElButton
              >
              <ElButton
                link
                type="danger"
                @click="handleDelete(row as Plan)"
                >删除</ElButton
              >
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
  import { deletePlan, fetchPlanStats, updatePlanStatus } from '@/api/product'
  import type { Plan } from '@/types/product'

  defineOptions({ name: 'PlanStatsPage' })

  const router = useRouter()
  const loading = ref(false)
  const tableData = ref<Plan[]>([])
  const filterForm = reactive({
    planName: '',
    productName: '',
    trialTimeType: '' as string,
    extensionCount: undefined as number | undefined,
    displayStatus: undefined as number | undefined,
    hasTrialOrg: '' as '' | 'yes' | 'no'
  })
  const extensionOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

  async function fetchList() {
    loading.value = true
    try {
      const res = await fetchPlanStats({
        page: pagination.page,
        pageSize: pagination.pageSize,
        planName: filterForm.planName || null,
        productName: filterForm.productName || null,
        trialTimeType: filterForm.trialTimeType || null,
        extensionCount:
          filterForm.extensionCount === undefined || filterForm.extensionCount === null
            ? null
            : filterForm.extensionCount,
        displayStatus:
          filterForm.displayStatus === undefined || filterForm.displayStatus === null
            ? null
            : filterForm.displayStatus,
        hasTrialOrg: filterForm.hasTrialOrg || null
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
    filterForm.planName = ''
    filterForm.productName = ''
    filterForm.trialTimeType = ''
    filterForm.extensionCount = undefined
    filterForm.displayStatus = undefined
    filterForm.hasTrialOrg = ''
    handleSearch()
  }

  function goOrg(planId: number, statusType: string) {
    router.push({ path: `/product/stats/org/${planId}`, query: { statusType } })
  }

  async function handleStatus(row: Plan, val: number) {
    const prev = val === 1 ? 0 : 1
    const res = await updatePlanStatus(row.id, val)
    if (res.code !== 200) {
      row.displayStatus = prev
      ElMessage.error(res.message || '更新失败')
      return
    }
    ElMessage.success('状态已更新')
  }

  async function handleDelete(row: Plan) {
    if (row.hasTrial) {
      await ElMessageBox.alert(
        '当前产品存在试用中的方案，请先移除相关方案后再操作！',
        '无法删除',
        { type: 'warning', confirmButtonText: '知道了' }
      )
      return
    }
    try {
      await ElMessageBox.confirm('是否删除该方案？', '删除确认', { type: 'warning' })
      const res = await deletePlan(row.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchList()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch {
      /* 取消 */
    }
  }

  onMounted(fetchList)
</script>
