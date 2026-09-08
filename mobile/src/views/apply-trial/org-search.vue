<!-- 机构机构（SRS 3.5.1） -->
<template>
  <div class="page">
    <van-nav-bar title="搜索机构" left-arrow @click-left="router.back()" />
    <van-search
      v-model="keyword"
      show-action
      placeholder="请输入机构简称"
      @search="handleSearch"
      @update:model-value="handleSearch"
    >
      <template #action>
        <div @click="handleSearch">搜索</div>
      </template>
    </van-search>
    <van-empty v-if="searched && !list.length" description="未找到机构" />
    <van-cell
      v-for="item in list"
      :key="item.id"
      :title="item.name"
      :label="`${item.sales} · ${item.orgType} · ${item.region}`"
      is-link
      @click="selectOrg(item)"
    />
  </div>
</template>

<script setup lang="ts">
  import { searchOrgs } from '@/api/h5'
  import type { OrgItem } from '@/types/h5'

  defineOptions({ name: 'OrgSearchPage' })

  const router = useRouter()
  const keyword = ref('')
  const list = ref<OrgItem[]>([])
  const searched = ref(false)

  async function handleSearch() {
    const res = await searchOrgs(keyword.value)
    searched.value = true
    list.value = res.code === 200 ? res.data : []
  }

  function selectOrg(item: OrgItem) {
    router.replace({
      path: '/apply-trial',
      query: {
        orgId: String(item.id),
        orgName: item.name,
        sales: item.sales,
        region: item.region,
        orgType: item.orgType,
        unit: item.unit
      }
    })
  }

  onMounted(handleSearch)
</script>
