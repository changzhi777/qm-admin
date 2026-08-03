// max 包内部就是 umi，但 paths 把 @umijs/max 映射到了运行时 exports.ts；
// 配置时的 defineConfig 走 umi 包本体即可
import { defineConfig } from 'umi';

/**
 * umi max 配置 — 青沐 admin
 *
 * Max preset 自带：antd / access / initialState / request / layout 等插件
 * 文档：https://umijs.org/docs/max/introduce
 */
export default defineConfig({
  title: '青沐 admin',
  // antd 5
  antd: {},
  // 全局 layout（max 接管 layout 渲染）
  layout: {
    title: '青沐 admin',
    locale: false,
  },
  // 全局鉴权
  access: {},
  // useModel 钩子（initialState 依赖）
  model: {},
  // 全局 initial state（登录态）
  initialState: {},
  // 全局 request（axios）
  request: {},
  // dev proxy：/api/* → Fastify server
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:3000',
      changeOrigin: true,
    },
  },
  // 路由
  routes: [
    {
      path: '/login',
      layout: false,
      component: '@/pages/Login',
    },
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: 'DashboardOutlined',
      component: '@/pages/Dashboard',
    },
    {
      path: '/mall',
      name: '商城',
      icon: 'ShopOutlined',
      routes: [
        {
          path: '/mall/categories',
          name: '商品分类',
          icon: 'AppstoreOutlined',
          component: '@/pages/mall/Categories',
        },
        {
          path: '/mall/products',
          name: '商品管理',
          icon: 'ShoppingOutlined',
          component: '@/pages/mall/Products',
        },
        {
          path: '/mall/orders',
          name: '订单管理',
          icon: 'FileTextOutlined',
          component: '@/pages/mall/Orders',
        },
        {
          path: '/mall/group-buys',
          name: '团购管理',
          icon: 'ShopOutlined',
          component: '@/pages/mall/GroupBuys',
        },
      ],
    },
    {
      path: '/audit-logs',
      name: '审计日志',
      icon: 'FileSearchOutlined',
      component: '@/pages/AuditLogs',
    },
    {
      path: '/training-plans',
      name: '训练计划',
      icon: 'TrophyOutlined',
      component: '@/pages/TrainingPlans',
    },
    {
      path: '/contents',
      name: '内容管理',
      icon: 'ProfileOutlined',
      component: '@/pages/Contents',
    },
    {
      path: '/reviews',
      name: '评价管理',
      icon: 'CommentOutlined',
      component: '@/pages/Reviews',
    },
    {
      path: '/withdrawals',
      name: '提现管理',
      icon: 'WalletOutlined',
      component: '@/pages/Withdrawals',
    },
    {
      path: '/users',
      name: '用户管理',
      icon: 'TeamOutlined',
      component: '@/pages/Users',
    },
    {
      path: '/pickup',
      name: '自提核销',
      icon: 'CheckCircleOutlined',
      component: '@/pages/Pickup',
    },
    {
      path: '/invite',
      name: '邀请裂变',
      icon: 'UserAddOutlined',
      component: '@/pages/Invite',
    },
    {
      path: '/uploads',
      name: '上传管理',
      icon: 'CloudUploadOutlined',
      component: '@/pages/Uploads',
    },
    {
      path: '/interpret',
      name: '解读管理',
      icon: 'FileSearchOutlined',
      component: '@/pages/Interpret',
    },
    {
      path: '/config',
      name: '配置管理',
      icon: 'SettingOutlined',
      component: '@/pages/Config',
    },
    {
      path: '/race',
      name: '赛事成绩',
      icon: 'TrophyOutlined',
      component: '@/pages/Race',
    },
    {
      path: '/admins',
      name: '管理员账号',
      icon: 'SafetyOutlined',
      component: '@/pages/Admins',
    },
    {
      path: '/boohee',
      name: '薄荷验证中心',
      icon: 'CloudServerOutlined',
      component: '@/pages/Boohee',
    },
    {
      path: '/nutrition-balance',
      name: '营养×运动平衡',
      icon: 'ExperimentOutlined',
      component: '@/pages/NutritionBalance',
    },
    {
      path: '/checkins',
      name: '打卡记录',
      icon: 'EnvironmentOutlined',
      component: '@/pages/Checkins',
    },
    {
      path: '/device-sources',
      name: '设备数据源',
      icon: 'ApiOutlined',
      component: '@/pages/DeviceSources',
    },
  ],
  npmClient: 'npm',
});
