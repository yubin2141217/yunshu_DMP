import { AppRouteRecord } from '@/types/router'
import { trialRoutes } from './trial'
import { applyRoutes } from './apply'
import { productRoutes } from './product'

/**
 * 侧边栏菜单顺序：试用管理 → 申请管理 → 产品方案管理
 * 已移除：系统首页、企业管理、权限管理、系统配置
 */
export const routeModules: AppRouteRecord[] = [
  trialRoutes,
  applyRoutes,
  productRoutes
]
