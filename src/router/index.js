import { createRouter, createWebHashHistory } from 'vue-router';

import redirect from './modules/redirect';
import error from './modules/error';
import login from './modules/login';
import home from './modules/home';

import user from './modules/user';
import test from './modules/test';

/* 菜单栏路由 */
export const fixedRoutes = [...home, ...login]; // 固定菜单
export const asyncRoutes = [...user, ...test]; // 动态菜单

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    ...redirect, // 统一的重定向配置
    ...fixedRoutes,
    ...error,
    ...asyncRoutes,
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { left: 0, top: 0 };
    }
  },
});

export default router;
