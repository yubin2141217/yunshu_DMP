<!-- 方案管理列表页 -->
<template>
  <div class="biz-page">
    <div class="biz-page-header product-page-header">
      <div class="product-page-header__row">
        <h1 class="biz-page-title">方案管理</h1>
        <ElButton type="primary" :icon="Plus" @click="openCreatePlan">新建方案</ElButton>
      </div>
    </div>

    <ElCard shadow="never" class="biz-filter-card">
      <ElForm :model="statsFilter" class="biz-filter-form" label-width="auto">
        <ElFormItem label="方案名称">
          <ElInput
            v-model="statsFilter.planName"
            placeholder="请输入方案名称"
            clearable
            style="width: 200px"
          />
        </ElFormItem>
        <ElFormItem label="产品名称">
          <ElInput
            v-model="statsFilter.productName"
            placeholder="请输入产品名称"
            clearable
            style="width: 200px"
          />
        </ElFormItem>
        <ElFormItem class="biz-filter-actions">
          <ElButton type="primary" :icon="Search" @click="handleStatsSearch">查询</ElButton>
          <ElButton :icon="RefreshRight" @click="handleStatsReset">重置</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <ElCard shadow="never" class="biz-table-card">
      <div class="biz-table-container">
        <ElTable v-loading="statsLoading" :data="statsList" height="100%" style="width: 100%">
          <ElTableColumn type="index" label="序号" width="64" align="center" />
          <ElTableColumn prop="name" label="方案名称" min-width="160" show-overflow-tooltip />
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
          <ElTableColumn label="手动关停机构数量" width="140" align="center">
            <template #default="{ row }">
              <ElButton link type="primary" @click="goOrg(row.id, 'stop')">{{
                row.stopOrgCount
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
                @change="
                  (val: string | number | boolean) => handlePlanStatus(row as Plan, Number(val))
                "
              />
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <ElButton link type="primary" @click="goPlanDetail(row.id)">详情</ElButton>
              <ElButton link type="primary" @click="openEditPlan(row.id)">编辑</ElButton>
              <ElButton
                link
                type="danger"
                @click="handleDeletePlan(row as Plan)"
                >删除</ElButton
              >
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
      <div class="biz-pagination">
        <ElPagination
          v-model:current-page="statsPagination.page"
          v-model:page-size="statsPagination.pageSize"
          :total="statsPagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchStats"
          @current-change="fetchStats"
        />
      </div>
    </ElCard>

    <PlanFormDialog
      v-model:visible="planDialogVisible"
      :product-id="planProductId"
      :plan-id="editingPlanId"
      @success="fetchStats"
    />
  </div>
</template>

<script setup lang="ts">
  import { Plus, RefreshRight, Search } from '@element-plus/icons-vue'
  import { deletePlan, fetchPlanStats, updatePlanStatus } from '@/api/product'
  import type { Plan } from '@/types/product'
  import PlanFormDialog from '../PlanFormDialog.vue'

  defineOptions({ name: 'PlanManagePage' })

  const router = useRouter()
  const statsLoading = ref(false)
  const statsList = ref<Plan[]>([])
  const statsFilter = reactive({ planName: '', productName: '' })
  const statsPagination = reactive({ page: 1, pageSize: 100, total: 0 })
  const planDialogVisible = ref(false)
  const planProductId = ref<number | null>(null)
  const editingPlanId = ref<number | null>(null)

  async function fetchStats() {
    statsLoading.value = true
    try {
      const res = await fetchPlanStats({
        page: statsPagination.page,
        pageSize: statsPagination.pageSize,
        planName: statsFilter.planName || null,
        productName: statsFilter.productName || null
      })
      if (res.code === 200) {
        statsList.value = res.data.list
        statsPagination.total = res.data.total
      }
    } finally {
      statsLoading.value = false
    }
  }

  function handleStatsSearch() {
    statsPagination.page = 1
    fetchStats()
  }

  function handleStatsReset() {
    statsFilter.planName = ''
    statsFilter.productName = ''
    handleStatsSearch()
  }

  function openCreatePlan() {
    planProductId.value = null
    editingPlanId.value = null
    planDialogVisible.value = true
  }

  function openEditPlan(planId: number) {
    router.push(`/product/plan/edit/${planId}`)
  }

  function goOrg(planId: number, statusType: string) {
    router.push({
      path: `/product/stats/org/${planId}`,
      query: { statusType }
    })
  }

  function goPlanDetail(planId: number) {
    router.push(`/product/plan/detail/${planId}`)
  }

  async function handlePlanStatus(row: Plan, val: number) {
    const prev = val === 1 ? 0 : 1
    try {
      const res = await updatePlanStatus(row.id, val)
      if (res.code !== 200) {
        row.displayStatus = prev
        ElMessage.error(res.message || '更新失败')
        return
      }
      ElMessage.success('状态已更新')
    } catch {
      row.displayStatus = prev
      ElMessage.error('更新失败')
    }
  }

  async function handleDeletePlan(row: Plan) {
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
        fetchStats()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch {
      /* 取消 */
    }
  }

  onMounted(fetchStats)
</script>

<style scoped lang="scss">
  .product-page-header__row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    width: 100%;
  }
</style>
