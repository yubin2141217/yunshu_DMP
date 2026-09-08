import { AppRouteRecord } from '@/types/router'

/**
 * 申请管理路由
 * 菜单：审核管理、人工处理（处理记录为人工处理页内 Tab，路由保留兼容）
 */
export const applyRoutes: AppRouteRecord = {
  path: '/apply',
  name: 'Apply',
  component: () => import('@/views/index/index.vue'),
  meta: {
    title: 'menus.apply.title',
    icon: '&#xe6b2;',
    isFirstLevel: true
  },
  children: [
    {
      path: 'audit',
      name: 'ApplyAudit',
      component: () => import('@/views/apply/audit/index.vue'),
      meta: {
        title: 'menus.apply.audit',
        keepAlive: true
      }
    },
    {
      path: 'todo',
      name: 'ApplyTodo',
      component: () => import('@/views/apply/todo/index.vue'),
      meta: {
        title: 'menus.apply.todo',
        keepAlive: true
      }
    },
    {
      path: 'records',
      name: 'ApplyRecords',
      redirect: { path: '/apply/todo', query: { tab: 'records' } },
      meta: {
        title: 'menus.apply.records',
        keepAlive: false,
        isHide: true
      }
    },
    {
      path: 'audit/detail/:id',
      name: 'ApplyAuditDetail',
      component: () => import('@/views/apply/audit/detail.vue'),
      meta: {
        title: 'menus.apply.auditDetail',
        keepAlive: false,
        isHide: true,
        activePath: '/apply/audit'
      }
    },
    {
      path: 'todo/detail/:id',
      name: 'ApplyTodoDetail',
      component: () => import('@/views/apply/todo/detail.vue'),
      meta: {
        title: 'menus.apply.todoDetail',
        keepAlive: false,
        isHide: true,
        activePath: '/apply/todo'
      }
    },
    {
      path: 'records/detail/:id',
      name: 'ApplyRecordDetail',
      component: () => import('@/views/apply/records/detail.vue'),
      meta: {
        title: 'menus.apply.recordDetail',
        keepAlive: false,
        isHide: true,
        activePath: '/apply/todo'
      }
    }
  ]
}
