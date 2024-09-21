// import { useAccount } from '@/pinia/modules/account';
// import redirect from './redirect';

// const checkUserinfo = (fullPath) => {
//   // const { userinfo } = useAccount();

//   // 有用户信息，系统内提示
//   if (useAccount().userinfo) {
//     return `/error/${fullPath}`;
//   }

//   // 没有继续导航
//   return true;
// };

const Layout = () => import('@/layout/index.vue');
const Error = () => import('@/views/error/index.vue');

export default [
  {
    path: '/error',
    component: Layout,
    hide: true,
    children: [
      {
        path: '404',
        name: 'not-found',
        component: Error,
        meta: { title: '404' },
        props: {
          error: '404',
        },
      },
      {
        path: '403',
        name: 'error-forbidden',
        component: Error,
        meta: { title: '403' },
        props: {
          error: '403',
        },
      },
      {
        path: '500',
        name: 'error-server-error',
        component: Error,
        meta: { title: '500' },
        props: {
          error: '500',
        },
      },
      // 特殊处理：error/fullPath
      {
        path: '/:pathMatch(.*)*',
        component: Error,
        hide: false,
        meta: { title: '404' },
        props: {
          error: '404',
        },
      },
    ],
  },
  /**
   * 失败导航：
   * 1. 没有用户信息，全局路由守卫，导航到 login?redirect=999
   * 2. 有用户信息，/999 转到 /error/404
   *
   * 为了 页面显示在导航内、此页不显示在标签保存（父路由有 hide），转到 /error/fullPath
   */
  {
    path: '/:pathMatch(.*)*',
    // component: Error,
    hide: true, // 不显示在侧栏
    beforeEnter(to) {
      // return checkUserinfo(to.fullPath.replace('/', ''));
      return `/error/${to.fullPath}`;
    },
  },
];
