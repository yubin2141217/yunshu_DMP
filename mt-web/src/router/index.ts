import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/MtLayout.vue'),
      redirect: '/suppliers',
      children: [
        { path: 'suppliers', name: 'Suppliers', component: () => import('@/views/Suppliers/index.vue'), meta: { title: '供数方管理' } },
        { path: 'org-config', name: 'OrgConfig', component: () => import('@/views/OrgConfig/index.vue'), meta: { title: '机构供数配置' } },
        { path: 'standard', name: 'Standard', component: () => import('@/views/Standard/index.vue'), meta: { title: '接入方案管理', group: 'standardGroup' } },
        { path: 'standard/edit', name: 'StandardCreate', component: () => import('@/views/Standard/Edit.vue'), meta: { title: '新增接入方案', group: 'standardGroup' } },
        { path: 'standard/edit/:id', name: 'StandardEdit', component: () => import('@/views/Standard/Edit.vue'), meta: { title: '编辑接入方案', group: 'standardGroup' } },
        { path: 'standard/:id', name: 'StandardDetail', component: () => import('@/views/Standard/detail.vue'), meta: { title: '接入方案详情', group: 'standardGroup' } },
        { path: 'metadata', name: 'Metadata', component: () => import('@/views/Metadata/index.vue'), meta: { title: '字段库管理', group: 'standardGroup' } },
        { path: 'metadata/:id', name: 'MetadataDetail', component: () => import('@/views/Metadata/detail.vue'), meta: { title: '字段详情', group: 'standardGroup' } },
        { path: 'scheme', name: 'Scheme', component: () => import('@/views/Scheme/index.vue'), meta: { title: '接入方案', group: 'standardGroup', hidden: true } },
        { path: 'scheme/:id', name: 'SchemeDetail', component: () => import('@/views/Scheme/detail.vue'), meta: { title: '接入方案详情', group: 'standardGroup', hidden: true } },
        { path: 'whitelist', name: 'Whitelist', component: () => import('@/views/Whitelist/index.vue'), meta: { title: 'IP 白名单', group: 'standardGroup' } },
        { path: 'push', name: 'Push', component: () => import('@/views/Push/index.vue'), meta: { title: '数据推送管理' } },
      ],
    },
    { path: '/login', redirect: '/suppliers' },
    { path: '/:pathMatch(.*)*', redirect: '/suppliers' },
  ],
})

router.beforeEach((to) => {
  useUserStore().ensureDemoSession()
  document.title = `${(to.meta.title as string) || '云数中台'} - ${import.meta.env.VITE_APP_TITLE}`
  return true
})

export default router
