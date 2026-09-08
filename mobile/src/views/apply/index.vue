<!-- H5 申请管理（SRS 3.5.3） -->
<template>
  <div class="page page-with-tab">
    <van-nav-bar title="申请管理">
      <template #right>
        <van-icon name="bell" size="20" class="nav-bell" @click="router.push('/notifications')" />
      </template>
    </van-nav-bar>
    <van-tabs v-model:active="tab" sticky @change="onTabChange">
      <van-tab title="我的申请">
        <van-pull-refresh v-model="refreshing" @refresh="loadMy">
          <van-empty v-if="!myList.length" description="暂无数据" />
          <van-cell
            v-for="item in myList"
            :key="item.id"
            is-link
            :title="item.orgName"
            :label="`申请人：${item.applicant} · ${item.productName} · ${item.applyType}\n${item.applyTime} · 当前审核人：${item.currentAuditor || '—'}`"
            @click="goDetail(item.id)"
          >
            <template #value>
              <van-tag :type="statusType(item.status)">{{ item.status }}</van-tag>
            </template>
          </van-cell>
        </van-pull-refresh>
      </van-tab>
      <van-tab title="待我审核">
        <van-pull-refresh v-model="pendingRefreshing" @refresh="loadPending">
          <van-empty v-if="!pendingList.length" description="暂无数据" />
          <van-cell
            v-for="item in pendingList"
            :key="item.id"
            is-link
            :title="item.orgName"
            :label="`申请人：${item.applicant} · ${item.productName} · ${item.applyType}\n${item.applyTime} · 当前审核人：${item.currentAuditor || '—'}`"
            @click="goDetail(item.id)"
          >
            <template #value>
              <van-tag type="primary">待审核</van-tag>
            </template>
          </van-cell>
        </van-pull-refresh>
      </van-tab>
      <van-tab title="审核记录">
        <van-pull-refresh v-model="recordRefreshing" @refresh="loadRecords">
          <van-empty v-if="!recordList.length" description="暂无数据" />
          <van-cell
            v-for="item in recordList"
            :key="item.id"
            is-link
            :title="item.orgName"
            :label="`${item.productName} · ${item.applyType} · ${item.applyTime}`"
            @click="goDetail(item.id)"
          >
            <template #value>
              <van-tag :type="statusType(item.status)">{{ item.status }}</van-tag>
            </template>
          </van-cell>
        </van-pull-refresh>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup lang="ts">
  import { fetchAuditRecords, fetchMyApplies, fetchPendingAudit } from '@/api/h5'
  import type { ApplyOrderRow, H5ApplyStatus } from '@/types/h5'

  defineOptions({ name: 'ApplyIndexPage' })

  const router = useRouter()
  const route = useRoute()
  const tab = ref(0)
  const myList = ref<ApplyOrderRow[]>([])
  const pendingList = ref<ApplyOrderRow[]>([])
  const recordList = ref<ApplyOrderRow[]>([])
  const refreshing = ref(false)
  const pendingRefreshing = ref(false)
  const recordRefreshing = ref(false)

  function syncTabFromQuery() {
    const q = String(route.query.tab || '')
    if (q === 'my' || q === '0') tab.value = 0
    else if (q === 'pending' || q === '1') tab.value = 1
    else if (q === 'record' || q === '2') tab.value = 2
  }

  function statusType(status: H5ApplyStatus): 'primary' | 'success' | 'warning' | 'danger' | 'default' {
    if (status === '审核中') return 'primary'
    if (status === '处理中') return 'warning'
    if (status === '未通过') return 'danger'
    if (status === '已归档') return 'success'
    return 'default'
  }

  function goDetail(id: number) {
    router.push({
      path: `/apply/detail/${id}`,
      query: tab.value === 1 ? { fromAudit: '1' } : {}
    })
  }

  async function loadMy() {
    const res = await fetchMyApplies()
    myList.value = res.code === 200 ? res.data : []
    refreshing.value = false
  }

  async function loadPending() {
    const res = await fetchPendingAudit()
    pendingList.value = res.code === 200 ? res.data : []
    pendingRefreshing.value = false
  }

  async function loadRecords() {
    const res = await fetchAuditRecords()
    recordList.value = res.code === 200 ? res.data : []
    recordRefreshing.value = false
  }

  function onTabChange(name: string | number) {
    const idx = Number(name)
    if (idx === 0) loadMy()
    if (idx === 1) loadPending()
    if (idx === 2) loadRecords()
  }

  watch(
    () => route.query.tab,
    () => {
      syncTabFromQuery()
      onTabChange(tab.value)
    }
  )

  onMounted(() => {
    syncTabFromQuery()
    loadMy()
    loadPending()
    loadRecords()
  })
</script>

<style scoped lang="scss">
  .nav-bell {
    padding: 4px;
    color: #323233;
    cursor: pointer;
  }
</style>
