<template>
  <div class="mt-layout">
    <header class="mt-topbar">
      <div class="mt-topbar-left">
        <span class="pro-logo-mark" aria-hidden="true"><IconThunderbolt /></span>
        <span class="mt-topbar-brand">云数中台</span>
        <span class="mt-topbar-system">运营管理系统</span>
      </div>
      <div class="mt-topbar-right">
        <span class="mt-topbar-action" title="消息">
          <a-badge :count="3" :dot="false" :max-count="99">
            <IconNotification :size="18" />
          </a-badge>
        </span>
        <a-dropdown trigger="click">
          <div class="mt-user">
            <a-avatar :size="30" style="background: var(--mt-menu-selected, #1e3765)">{{ userInitial }}</a-avatar>
            <div class="mt-user-meta">
              <span class="mt-user-name">{{ userStore.userInfo?.name || '运营' }}</span>
              <span class="mt-user-role">{{ userStore.userInfo?.role || '平台运营' }}</span>
            </div>
            <IconDown style="color: #5a7394; font-size: 12px" />
          </div>
          <template #content>
            <a-doption @click="onLogout">退出登录</a-doption>
          </template>
        </a-dropdown>
        <button type="button" class="mt-logout-btn" @click="onLogout">退出</button>
      </div>
    </header>

    <div class="mt-body">
      <aside class="mt-sider">
        <a-menu
          :selected-keys="selectedKeys"
          v-model:open-keys="openKeys"
          @menu-item-click="onMenu"
        >
          <a-menu-item key="/suppliers">
            <template #icon><IconUserGroup /></template>
            供数方管理
          </a-menu-item>
          <a-menu-item key="/org-config">
            <template #icon><IconSettings /></template>
            机构供数配置
          </a-menu-item>
          <a-sub-menu key="standardGroup">
            <template #icon><IconFile /></template>
            <template #title>数据接入管理</template>
            <a-menu-item key="/standard">接入方案管理</a-menu-item>
            <a-menu-item key="/metadata">字段库管理</a-menu-item>
            <a-menu-item key="/whitelist">IP 白名单</a-menu-item>
          </a-sub-menu>
          <a-menu-item key="/push">
            <template #icon><IconSend /></template>
            数据推送管理
          </a-menu-item>
        </a-menu>
      </aside>

      <div class="mt-main">
        <main class="mt-content">
          <div class="crumb">
            运营工作台<span class="crumb-sep">/</span><span class="crumb-current">{{ currentTitle }}</span>
          </div>
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Modal } from '@arco-design/web-vue'
import {
  IconDown,
  IconFile,
  IconNotification,
  IconSend,
  IconSettings,
  IconThunderbolt,
  IconUserGroup,
} from '@arco-design/web-vue/es/icon'
import { useUserStore } from '@/store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const currentTitle = computed(() => (route.meta.title as string) || '')
const userInitial = computed(() => (userStore.userInfo?.name || '运').slice(0, 1))
const selectedKeys = computed(() => {
  if (route.path.startsWith('/metadata')) return ['/metadata']
  if (route.path.startsWith('/scheme')) return ['/scheme']
  if (route.path.startsWith('/whitelist')) return ['/whitelist']
  if (route.path.startsWith('/push')) return ['/push']
  return [route.path]
})
const openKeys = ref<string[]>(route.meta.group ? [String(route.meta.group)] : ['standardGroup'])

watch(
  () => route.meta.group,
  (g) => {
    if (g) openKeys.value = [String(g)]
  },
)

function onMenu(key: string) {
  router.push(key)
}

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
