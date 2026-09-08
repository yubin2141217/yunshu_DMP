<!-- 产品管理列表页 -->
<template>
  <div class="biz-page">
    <div class="biz-page-header product-page-header">
      <div class="product-page-header__row">
        <h1 class="biz-page-title">产品管理</h1>
        <ElButton type="primary" :icon="Plus" @click="openCreateProduct">新建产品</ElButton>
      </div>
    </div>

    <ElCard shadow="never" class="biz-filter-card">
      <ElForm :model="productFilter" class="biz-filter-form" label-width="auto">
        <ElFormItem label="产品名称">
          <ElInput
            v-model="productFilter.name"
            placeholder="请输入产品名称"
            clearable
            style="width: 200px"
          />
        </ElFormItem>
        <ElFormItem label="机构类型可用">
          <ElSelect
            v-model="productFilter.orgTypes"
            multiple
            collapse-tags
            collapse-tags-tooltip
            clearable
            placeholder="请选择机构类型"
            style="width: 220px"
          >
            <ElOption v-for="item in orgTypeOptions" :key="item" :label="item" :value="item" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="创建时间">
          <ElDatePicker
            v-model="dateRange"
            type="daterange"
            value-format="YYYY-MM-DD"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 280px"
          />
        </ElFormItem>
        <ElFormItem class="biz-filter-actions">
          <ElButton type="primary" :icon="Search" @click="handleProductSearch">查询</ElButton>
          <ElButton :icon="RefreshRight" @click="handleProductReset">重置</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <ElCard shadow="never" class="biz-table-card">
      <div class="biz-table-container">
        <ElTable v-loading="productLoading" :data="productList" height="100%" style="width: 100%">
          <ElTableColumn type="index" label="序号" width="64" align="center" />
          <ElTableColumn prop="id" label="产品ID" width="90" align="center" />
          <ElTableColumn prop="name" label="产品名称" min-width="140" show-overflow-tooltip />
          <ElTableColumn
            label="产品介绍"
            min-width="200"
            :show-overflow-tooltip="{
              popperClass: 'product-intro-tooltip',
              placement: 'top'
            }"
          >
            <template #default="{ row }">
              <span class="intro-cell">{{ (row as Product).intro }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="createTime" label="创建时间" width="170" />
          <ElTableColumn label="机构类型可用" min-width="140" show-overflow-tooltip>
            <template #default="{ row }">
              {{ (row as Product).orgTypes?.join('、') || '—' }}
            </template>
          </ElTableColumn>
          <ElTableColumn prop="planCount" label="方案数量" width="100" align="center" />
          <ElTableColumn label="试用机构数量" width="120" align="center">
            <template #default="{ row }">
              <ElButton
                link
                type="primary"
                @click="goProductTrialOrgs((row as Product).id)"
              >
                {{ (row as Product).trialOrgCount ?? 0 }}
              </ElButton>
            </template>
          </ElTableColumn>
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
                  (val: string | number | boolean) =>
                    handleProductStatus(row as Product, Number(val))
                "
              />
            </template>
          </ElTableColumn>
          <ElTableColumn prop="sortOrder" label="展示位置" width="100" align="center" />
          <ElTableColumn label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <ElButton link type="primary" @click="goProductDetail(row.id)">详情</ElButton>
              <ElButton link type="primary" @click="openEditProduct(row.id)">编辑</ElButton>
              <ElButton
                link
                type="danger"
                @click="handleDeleteProduct(row as Product)"
                >删除</ElButton
              >
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
      <div class="biz-pagination">
        <ElPagination
          v-model:current-page="productPagination.page"
          v-model:page-size="productPagination.pageSize"
          :total="productPagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchProducts"
          @current-change="fetchProducts"
        />
      </div>
    </ElCard>

    <ProductFormDialog
      v-model:visible="productDialogVisible"
      :product-id="editingProductId"
      @success="fetchProducts"
    />
  </div>
</template>

<script setup lang="ts">
  import { Plus, RefreshRight, Search } from '@element-plus/icons-vue'
  import { deleteProduct, fetchProductList, fetchProductMeta, updateProductStatus } from '@/api/product'
  import type { Product } from '@/types/product'
  import ProductFormDialog from './ProductFormDialog.vue'

  defineOptions({ name: 'ProductListPage' })

  const router = useRouter()
  const productLoading = ref(false)
  const productList = ref<Product[]>([])
  const dateRange = ref<string[]>([])
  const productFilter = reactive({ name: '', orgTypes: [] as string[] })
  const orgTypeOptions = ref<string[]>(['一类', '二类', '三类'])
  const productPagination = reactive({ page: 1, pageSize: 100, total: 0 })
  const productDialogVisible = ref(false)
  const editingProductId = ref<number | null>(null)

  async function loadOrgTypeOptions() {
    const res = await fetchProductMeta()
    if (res.code === 200 && res.data?.orgTypes?.length) {
      orgTypeOptions.value = res.data.orgTypes
    }
  }

  async function fetchProducts() {
    productLoading.value = true
    try {
      const res = await fetchProductList({
        page: productPagination.page,
        pageSize: productPagination.pageSize,
        name: productFilter.name || null,
        orgTypes: productFilter.orgTypes.length ? productFilter.orgTypes : null,
        startDate: dateRange.value?.[0] || null,
        endDate: dateRange.value?.[1] || null
      })
      if (res.code === 200) {
        productList.value = res.data.list
        productPagination.total = res.data.total
      }
    } finally {
      productLoading.value = false
    }
  }

  function handleProductSearch() {
    productPagination.page = 1
    fetchProducts()
  }

  function handleProductReset() {
    productFilter.name = ''
    productFilter.orgTypes = []
    dateRange.value = []
    handleProductSearch()
  }

  function openCreateProduct() {
    editingProductId.value = null
    productDialogVisible.value = true
  }

  function openEditProduct(id: number) {
    editingProductId.value = id
    productDialogVisible.value = true
  }

  function goProductDetail(id: number) {
    router.push(`/product/detail/${id}`)
  }

  function goProductTrialOrgs(productId: number) {
    router.push(`/product/stats/trial-orgs/${productId}`)
  }

  async function handleProductStatus(row: Product, val: number) {
    const prev = val === 1 ? 0 : 1
    try {
      const res = await updateProductStatus(row.id, val)
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

  async function handleDeleteProduct(row: Product) {
    if (row.hasTrial) {
      await ElMessageBox.alert(
        '当前产品存在试用中的方案，请先移除相关方案后再操作！',
        '无法删除',
        { type: 'warning', confirmButtonText: '知道了' }
      )
      return
    }
    try {
      await ElMessageBox.confirm('是否删除该产品？', '删除确认', { type: 'warning' })
      const res = await deleteProduct(row.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchProducts()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch {
      /* 取消 */
    }
  }

  onMounted(() => {
    loadOrgTypeOptions()
    fetchProducts()
  })
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

  .intro-cell {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: bottom;
  }
</style>

<style lang="scss">
  .product-intro-tooltip {
    max-width: 420px !important;
    line-height: 1.5;
    word-break: break-all;
  }
</style>
