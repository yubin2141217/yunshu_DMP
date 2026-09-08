<template>
  <div class="v8-layout">
    <header class="chrome-top">
      <div class="chrome-inner">
        <div class="chrome-brand">
          <span class="pro-logo-mark" aria-hidden="true"><IconThunderbolt /></span>
          <span class="chrome-logo">云数中台</span>
          <div class="chrome-tags">
            <a-tag color="arcoblue" size="small">{{ orgName }}</a-tag>
            <a-tag color="arcoblue" size="small">机构端</a-tag>
          </div>
        </div>
        <a-dropdown trigger="click">
          <div class="chrome-user">
            <a-avatar :size="32" style="background: rgb(var(--primary-6))">{{ userInitial }}</a-avatar>
            <span class="chrome-user-name">{{ userStore.userInfo?.name }}</span>
            <IconDown class="chrome-user-caret" />
          </div>
          <template #content>
            <a-doption @click="onLogout">退出登录</a-doption>
          </template>
        </a-dropdown>
      </div>
    </header>
    <nav class="chrome-nav">
      <div class="chrome-inner chrome-nav-inner">
        <router-link v-for="item in menus" :key="item.path" :to="item.path">{{ item.title }}</router-link>
      </div>
    </nav>
    <main class="chrome-main">
      <div class="crumb">
        我的工作台<span class="crumb-sep">/</span><span class="crumb-current">{{ currentTitle }}</span>
      </div>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Modal } from '@arco-design/web-vue'
import { IconDown, IconThunderbolt } from '@arco-design/web-vue/es/icon'
import { useUserStore } from '@/store/user'
import { v8Mock } from '@/mock/v8'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const orgName = v8Mock.orgName

const menus = [
  { path: '/overview', title: '数据概览' },
  { path: '/stats', title: '供数统计' },
  { path: '/suppliers', title: '供数方查看' },
  { path: '/spec', title: '接入规范' },
]

const currentTitle = computed(() => (route.meta.title as string) || '数据概览')
const userInitial = computed(() => (userStore.userInfo?.name || '机').slice(0, 1))

function onLogout() {
  Modal.confirm({
    title: '退出登录',
    content: '确定要退出当前账号吗？',
    onOk() {
      userStore.logout()
      router.push('/login')
    },
  })
}
</script>
