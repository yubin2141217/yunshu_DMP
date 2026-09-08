<template>
  <div class="tab-layout">
    <div class="tab-layout__body">
      <RouterView />
    </div>
    <van-tabbar route fixed placeholder safe-area-inset-bottom z-index="100">
      <van-tabbar-item replace to="/org-stats" icon="chart-trending-o">机构统计</van-tabbar-item>
      <van-tabbar-item replace to="/apply-trial" icon="add-o">申请试用</van-tabbar-item>
      <van-tabbar-item replace to="/apply" icon="orders-o">申请管理</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'TabLayout' })
</script>

<style scoped lang="scss">
  .tab-layout {
    min-height: 100vh;
    background: #f5f6f8;

    &__body {
      min-height: calc(100vh - 50px);
    }
  }
</style>
