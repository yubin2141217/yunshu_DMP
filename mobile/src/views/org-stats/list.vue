<!-- 机构列表 -->
<template>
  <div class="page">
    <van-nav-bar :title="title" left-arrow @click-left="router.back()" />
    <van-search v-model="keyword" placeholder="搜索机构名称" @search="load" @clear="load" />
    <van-pull-refresh v-model="refreshing" @refresh="load">
      <van-empty v-if="!list.length" description="暂无数据" />
      <div
        v-for="item in list"
        :key="item.id"
        class="org-row"
        @click="router.push(`/org-stats/org/${item.id}`)"
      >
        <div class="org-row__logo">{{ item.name.slice(0, 1) }}</div>
        <div class="org-row__body">
          <div class="org-row__name">{{ item.name }}</div>
          <div class="muted">所属销售：{{ item.sales }}</div>
          <div class="muted">{{ productLabel }}：{{ item.productName }}</div>
          <div class="muted">{{ planLabel }}：{{ item.planName }}</div>
        </div>
        <van-icon name="arrow" color="#c8c9cc" />
      </div>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
  import { fetchOrgList } from '@/api/h5'
  import type { OrgListFilter, OrgListItem } from '@/types/h5'

  defineOptions({ name: 'OrgStatsListPage' })

  const route = useRoute()
  const router = useRouter()
  const keyword = ref('')
  const list = ref<OrgListItem[]>([])
  const refreshing = ref(false)

  const filter = computed<OrgListFilter>(() => {
    const f = String(route.query.filter || 'all')
    if (['试用中', '即将到期', '已到期', '冷冻期', '申请中'].includes(f)) {
      return f as OrgListFilter
    }
    return 'all'
  })

  const unit = computed(() => {
    const u = String(route.query.unit || '').trim()
    return u || undefined
  })

  const title = computed(() => {
    const prefix = unit.value ? `${unit.value}·` : ''
    if (filter.value === 'all') return `${prefix}全量机构列表`
    if (filter.value === '已到期') return `${prefix}已停止试用机构`
    if (filter.value === '申请中') return `${prefix}申请中机构`
    return `${prefix}${filter.value}机构`
  })

  const productLabel = computed(() =>
    filter.value === '申请中' ? '申请产品' : '试用产品'
  )
  const planLabel = computed(() => (filter.value === '申请中' ? '申请方案' : '试用方案'))

  async function load() {
    const res = await fetchOrgList(filter.value, keyword.value, unit.value)
    list.value = res.code === 200 ? res.data : []
    refreshing.value = false
  }

  watch([filter, unit], load, { immediate: true })
</script>

<style scoped lang="scss">
  .org-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 10px 12px;
    padding: 14px;
    background: #fff;
    border-radius: 10px;
  }

  .org-row__logo {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    background: linear-gradient(135deg, #4e8cff, #1989fa);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    flex-shrink: 0;
  }

  .org-row__body {
    flex: 1;
    min-width: 0;
    font-size: 13px;
    line-height: 1.55;
  }

  .org-row__name {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 4px;
  }
</style>
