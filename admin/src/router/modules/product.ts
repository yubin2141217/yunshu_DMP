import { AppRouteRecord } from '@/types/router'

/**
 * 产品方案管理路由
 * 二级菜单：产品管理、方案管理
 */
export const productRoutes: AppRouteRecord = {
  path: '/product',
  name: 'Product',
  component: () => import('@/views/index/index.vue'),
  redirect: '/product/list',
  meta: {
    title: 'menus.product.title',
    icon: '&#xe7b9;',
    isFirstLevel: true
  },
  children: [
    {
      path: 'list',
      name: 'ProductList',
      component: () => import('@/views/product/index.vue'),
      meta: {
        title: 'menus.product.list',
        keepAlive: true
      }
    },
    {
      path: 'plans',
      name: 'PlanManage',
      component: () => import('@/views/product/plans/index.vue'),
      meta: {
        title: 'menus.product.plans',
        keepAlive: true
      }
    },
    {
      path: 'stats',
      redirect: '/product/plans',
      meta: { title: 'menus.product.plans', isHide: true }
    },
    {
      path: 'detail/:id',
      name: 'ProductDetail',
      component: () => import('@/views/product/detail.vue'),
      meta: {
        title: 'menus.product.detail',
        keepAlive: false,
        isHide: true,
        activePath: '/product/list'
      }
    },
    {
      path: 'stats/org/:planId',
      name: 'ProductOrgStats',
      component: () => import('@/views/product/stats/org.vue'),
      meta: {
        title: 'menus.product.orgStats',
        keepAlive: false,
        isHide: true,
        activePath: '/product/plans'
      }
    },
    {
      path: 'stats/trial-orgs/:productId',
      name: 'ProductTrialOrgStats',
      component: () => import('@/views/product/stats/product-orgs.vue'),
      meta: {
        title: 'menus.product.productTrialOrgs',
        keepAlive: false,
        isHide: true,
        activePath: '/product/list'
      }
    },
    {
      path: 'create/new',
      name: 'ProductCreate',
      component: () => import('@/views/product/form.vue'),
      meta: {
        title: 'menus.product.create',
        keepAlive: false,
        isHide: true,
        activePath: '/product/list'
      }
    },
    {
      path: 'edit/:id',
      name: 'ProductEdit',
      component: () => import('@/views/product/form.vue'),
      meta: {
        title: 'menus.product.edit',
        keepAlive: false,
        isHide: true,
        activePath: '/product/list'
      }
    },
    {
      path: 'plan/detail/:id',
      name: 'PlanDetail',
      component: () => import('@/views/product/plan-detail.vue'),
      meta: {
        title: 'menus.product.planDetail',
        keepAlive: false,
        isHide: true,
        activePath: '/product/plans'
      }
    },
    {
      path: 'plan/create/:productId',
      name: 'PlanCreate',
      component: () => import('@/views/product/plan-form.vue'),
      meta: {
        title: 'menus.product.planCreate',
        keepAlive: false,
        isHide: true,
        activePath: '/product/plans'
      }
    },
    {
      path: 'plan/edit/:id',
      name: 'PlanEdit',
      component: () => import('@/views/product/plan-form.vue'),
      meta: {
        title: 'menus.product.planEdit',
        keepAlive: false,
        isHide: true,
        activePath: '/product/plans'
      }
    }
  ]
}
