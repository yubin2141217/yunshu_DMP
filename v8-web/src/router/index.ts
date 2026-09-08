import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'

function safeRedirect(raw: unknown, fallback: string) {
  if (typeof raw !== 'string') return fallback
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/login')) return fallback
  return raw
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/auth/login.vue'),
      meta: { public: true, title: '登录' },
    },
    {
      path: '/',
      component: () => import('@/layouts/V8Layout.vue'),
      redirect: '/overview',
      children: [
        {
          path: 'overview',
          name: 'Overview',
          component: () => import('@/views/Overview/index.vue'),
          meta: { title: '数据概览' },
        },
        {
          path: 'stats',
          name: 'Stats',
          component: () => import('@/views/Stats/index.vue'),
          meta: { title: '供数统计' },
        },
        {
          path: 'suppliers',
          name: 'Suppliers',
          component: () => import('@/views/Suppliers/index.vue'),
          meta: { title: '供数方查看' },
        },
        {
          path: 'spec',
          name: 'Spec',
          component: () => import('@/views/Spec/index.vue'),
          meta: { title: '接入规范' },
        },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to) => {
  const user = useUserStore()
  if (!to.meta.public && !user.isLoggedIn) {
    return { path: '/login', query: { redirect: safeRedirect(to.fullPath, '/overview') } }
  }
  if (to.path === '/login' && user.isLoggedIn) return { path: '/overview' }
  const title = (to.meta.title as string) || '云数中台'
  document.title = `${title} - ${import.meta.env.VITE_APP_TITLE}`
  return true
})

export default router
