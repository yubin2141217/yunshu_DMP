<!-- 机构统计首页 · 统计单元选择器 + 卡片下钻 -->
<template>
  <div class="page page-with-tab">
    <van-nav-bar title="机构统计" />

    <div
      class="unit-bar"
      :class="{ 'unit-bar--readonly': isSingleUnit }"
      @click="openUnitSheet"
    >
      <div class="unit-bar__main">
        <span class="unit-bar__label">统计单元</span>
        <span class="unit-bar__value">{{ displayUnitName }}</span>
      </div>
      <div v-if="!isSingleUnit" class="unit-bar__meta">
        <span class="unit-bar__count">{{ unitCountText }}</span>
        <van-icon name="arrow-down" />
      </div>
    </div>

    <div class="cards">
      <div class="stat-card" @click="goList('all')">
        <div class="stat-card__num">{{ cards.totalOrgs }}</div>
        <div class="stat-card__label">机构总数</div>
      </div>
      <div class="stat-card is-applying" @click="goList('申请中')">
        <div class="stat-card__num">{{ cards.applyingOrgs }}</div>
        <div class="stat-card__label">申请中机构</div>
      </div>
      <div class="stat-card is-success" @click="goList('试用中')">
        <div class="stat-card__num">{{ cards.trialingOrgs }}</div>
        <div class="stat-card__label">试用中机构</div>
      </div>
      <div class="stat-card is-warning" @click="goList('即将到期')">
        <div class="stat-card__num">{{ cards.soonExpireOrgs }}</div>
        <div class="stat-card__label">即将到期机构</div>
      </div>
      <div class="stat-card is-danger" @click="goList('已到期')">
        <div class="stat-card__num">{{ cards.expiredOrgs }}</div>
        <div class="stat-card__label">已停止试用机构</div>
      </div>
      <div class="stat-card is-freeze" @click="goList('冷冻期')">
        <div class="stat-card__num">{{ cards.freezeOrgs }}</div>
        <div class="stat-card__label">冷冻期机构</div>
      </div>
    </div>
    <div class="muted tip">{{ tipText }}</div>

    <van-popup
      v-model:show="sheetVisible"
      position="bottom"
      round
      :style="{ maxHeight: '70%' }"
    >
      <div class="unit-sheet">
        <div class="unit-sheet__title">选择统计单元</div>
        <van-search
          v-if="units.length > 5"
          v-model="unitKeyword"
          placeholder="搜索统计单元"
          shape="round"
        />
        <div class="unit-sheet__list">
          <div
            class="unit-option"
            :class="{ active: activeUnit === '全部' }"
            @click="selectUnit('全部')"
          >
            <div class="unit-option__body">
              <div class="unit-option__name">全部统计单元</div>
              <div class="unit-option__desc">汇总您负责的全部单元</div>
            </div>
            <van-icon v-if="activeUnit === '全部'" name="success" color="#1989fa" />
          </div>
          <div
            v-for="u in filteredUnits"
            :key="u.name"
            class="unit-option"
            :class="{ active: activeUnit === u.name }"
            @click="selectUnit(u.name)"
          >
            <div class="unit-option__body">
              <div class="unit-option__name">{{ u.name }}</div>
              <div class="unit-option__desc">机构 {{ u.orgCount }} 家</div>
            </div>
            <van-icon v-if="activeUnit === u.name" name="success" color="#1989fa" />
          </div>
          <van-empty v-if="!filteredUnits.length && unitKeyword" description="无匹配单元" />
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
  import { fetchOrgStatCards, fetchStatUnits } from '@/api/h5'
  import type { OrgListFilter, OrgStatCard, StatUnitItem } from '@/types/h5'

  defineOptions({ name: 'OrgStatsIndexPage' })

  const router = useRouter()
  const activeUnit = ref('全部')
  const units = ref<StatUnitItem[]>([])
  const sheetVisible = ref(false)
  const unitKeyword = ref('')
  const cards = reactive<OrgStatCard>({
    totalOrgs: 0,
    trialingOrgs: 0,
    soonExpireOrgs: 0,
    expiredOrgs: 0,
    freezeOrgs: 0,
    applyingOrgs: 0
  })

  const isSingleUnit = computed(() => units.value.length === 1)

  const displayUnitName = computed(() => {
    if (isSingleUnit.value) return units.value[0]?.name || '—'
    return activeUnit.value === '全部' ? '全部统计单元' : activeUnit.value
  })

  const unitCountText = computed(() => {
    if (activeUnit.value === '全部') {
      return `共 ${units.value.length} 个单元`
    }
    const hit = units.value.find((u) => u.name === activeUnit.value)
    return hit ? `机构 ${hit.orgCount} 家` : ''
  })

  const filteredUnits = computed(() => {
    const kw = unitKeyword.value.trim()
    if (!kw) return units.value
    return units.value.filter((u) => u.name.includes(kw))
  })

  const tipText = computed(() => {
    if (isSingleUnit.value) {
      return `当前展示[${displayUnitName.value}]已申请试用的机构汇总`
    }
    if (activeUnit.value === '全部') {
      return '当前默认展示全部统计单元已申请试用的机构汇总，点击上方可切换统计单元'
    }
    return `当前展示[${activeUnit.value}]已申请试用的机构汇总`
  })

  function openUnitSheet() {
    if (isSingleUnit.value) return
    sheetVisible.value = true
  }

  function goList(filter: OrgListFilter) {
    const query: Record<string, string> = { filter }
    if (activeUnit.value && activeUnit.value !== '全部') {
      query.unit = activeUnit.value
    }
    router.push({ name: 'OrgStatsList', query })
  }

  async function loadCards() {
    const unit = activeUnit.value === '全部' ? undefined : activeUnit.value
    const res = await fetchOrgStatCards(unit)
    if (res.code === 200) Object.assign(cards, res.data)
  }

  async function selectUnit(name: string) {
    activeUnit.value = name
    sheetVisible.value = false
    unitKeyword.value = ''
    await loadCards()
  }

  onMounted(async () => {
    const res = await fetchStatUnits()
    if (res.code === 200) {
      units.value = res.data
      if (units.value.length === 1) {
        activeUnit.value = units.value[0].name
      }
    }
    await loadCards()
  })
</script>

<style scoped lang="scss">
  .unit-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin: 12px 12px 0;
    padding: 14px 16px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

    &--readonly {
      cursor: default;
    }
  }

  .unit-bar__main {
    flex: 1;
    min-width: 0;
  }

  .unit-bar__label {
    display: block;
    font-size: 12px;
    color: #969799;
    margin-bottom: 4px;
  }

  .unit-bar__value {
    display: block;
    font-size: 16px;
    font-weight: 600;
    color: #323233;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .unit-bar__meta {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
    color: #969799;
    font-size: 12px;
  }

  .cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 16px;
  }

  .stat-card {
    background: #fff;
    border-radius: 12px;
    padding: 20px 16px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
    text-align: center;

    &__num {
      font-size: 28px;
      font-weight: 700;
      color: #323233;
      line-height: 1.2;
    }

    &__label {
      margin-top: 8px;
      font-size: 13px;
      color: #969799;
    }

    &.is-primary .stat-card__num {
      color: #1989fa;
    }

    &.is-success .stat-card__num {
      color: #07c160;
    }

    &.is-warning .stat-card__num {
      color: #ff976a;
    }

    &.is-danger .stat-card__num {
      color: #ee0a24;
    }

    &.is-freeze .stat-card__num {
      color: #7232dd;
    }

    &.is-applying .stat-card__num {
      color: #1989fa;
    }
  }

  .tip {
    padding: 0 16px 16px;
    font-size: 12px;
  }

  .unit-sheet {
    padding: 12px 0 calc(12px + env(safe-area-inset-bottom));
    max-height: 70vh;
    display: flex;
    flex-direction: column;

    &__title {
      text-align: center;
      font-size: 16px;
      font-weight: 650;
      padding: 8px 16px 12px;
    }

    &__list {
      flex: 1;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
  }

  .unit-option {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border-bottom: 1px solid #f2f3f5;

    &.active {
      background: #f0f7ff;
    }

    &__body {
      flex: 1;
      min-width: 0;
    }

    &__name {
      font-size: 15px;
      font-weight: 600;
      color: #323233;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__desc {
      margin-top: 4px;
      font-size: 12px;
      color: #969799;
    }
  }
</style>
