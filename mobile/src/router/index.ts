import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  // Hash 路由不依赖 BASE_URL，避免 base=./ 时 file:// 双击打开异常
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/org-stats'
    },
    {
      path: '/',
      component: () => import('@/layouts/TabLayout.vue'),
      children: [
        {
          path: 'org-stats',
          name: 'OrgStats',
          component: () => import('@/views/org-stats/index.vue'),
          meta: { title: '机构统计', tab: true }
        },
        {
          path: 'apply',
          name: 'Apply',
          component: () => import('@/views/apply/index.vue'),
          meta: { title: '申请管理', tab: true }
        },
        {
          path: 'apply-trial',
          name: 'ApplyTrial',
          component: () => import('@/views/apply-trial/index.vue'),
          meta: { title: '申请试用', tab: true }
        },
        // 兼容旧路径
        {
          path: 'trial',
          redirect: '/org-stats'
        }
      ]
    },
    {
      path: '/apply-trial/org-search',
      name: 'OrgSearch',
      component: () => import('@/views/apply-trial/org-search.vue'),
      meta: { title: '搜索机构' }
    },
    {
      path: '/apply-trial/plan-detail/:id',
      name: 'ApplyPlanDetail',
      component: () => import('@/views/apply-trial/plan-detail.vue'),
      meta: { title: '方案详情' }
    },
    {
      path: '/org-stats/list',
      name: 'OrgStatsList',
      component: () => import('@/views/org-stats/list.vue'),
      meta: { title: '机构列表' }
    },
    {
      path: '/org-stats/org/:id',
      name: 'OrgStatsDetail',
      component: () => import('@/views/org-stats/org-detail.vue'),
      meta: { title: '机构详情' }
    },
    {
      path: '/org-stats/plan/:id',
      name: 'OrgStatsPlanDetail',
      component: () => import('@/views/org-stats/plan-detail.vue'),
      meta: { title: '详情' }
    },
    {
      path: '/apply/detail/:id',
      name: 'ApplyDetail',
      component: () => import('@/views/apply/detail.vue'),
      meta: { title: '工单详情' }
    },
    {
      path: '/notifications',
      name: 'Notifications',
      component: () => import('@/views/notifications/index.vue'),
      meta: { title: '消息通知' }
    },
    {
      path: '/notifications/audit-guide/:orderId',
      name: 'AuditGuide',
      component: () => import('@/views/notifications/audit-guide.vue'),
      meta: { title: '工单审核' }
    },
    // 旧路径兼容
    {
      path: '/trial/plan/:id',
      redirect: (to) => `/org-stats/plan/${to.params.id}`
    },
    {
      path: '/trial/org/:id',
      redirect: (to) => `/org-stats/org/${to.params.id}`
    }
  ]
})

router.afterEach((to) => {
  document.title = `${String(to.meta.title || '试用管理平台')} - 试用管理平台`
})

export default router
