import { createRouter, createWebHashHistory } from 'vue-router';

import redirect from './modules/redirect';
import error from './modules/error';
import login from './modules/login';
import home from './modules/home';
import self from './modules/self';

import test from './modules/test';
import user from './modules/user';

/* 菜单栏路由 */
export const fixedRoutes = [...home, ...login, ...self, ...redirect, ...error]; // 固定菜单
export const asyncRoutes = [...user, ...test]; // 动态菜单 - 由权限管理控制

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    ...fixedRoutes,
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
