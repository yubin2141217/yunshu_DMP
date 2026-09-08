import { AppRouteRecord } from '@/types/router'

/**
 * 试用管理路由
 */
export const trialRoutes: AppRouteRecord = {
  path: '/trial',
  name: 'Trial',
  component: () => import('@/views/index/index.vue'),
  meta: {
    title: 'menus.trial.title',
    icon: '&#xe6b2;',
    isFirstLevel: true
  },
  children: [
    {
      path: '',
      name: 'TrialList',
      component: () => import('@/views/trial/index.vue'),
      meta: {
        title: 'menus.trial.list',
        keepAlive: true,
        isHide: true
      }
    },
    {
      path: 'detail/:id',
      name: 'TrialDetail',
      component: () => import('@/views/trial/detail.vue'),
      meta: {
        title: 'menus.trial.detail',
        keepAlive: false,
        isHide: true,
        activePath: '/trial'
      }
    },
    {
      path: 'org/detail/:id',
      name: 'TrialOrgDetail',
      component: () => import('@/views/trial/org-detail.vue'),
      meta: {
        title: 'menus.trial.orgDetail',
        keepAlive: false,
        isHide: true,
        activePath: '/trial'
      }
    }
  ]
}
