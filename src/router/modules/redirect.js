const Layout = () => import('@/layout/index.vue');
const Redirect = () => import('@/views/redirect/index.vue');

export default [
  {
    path: '/redirect/:path(.*)',
    component: Layout,
    hide: true,
    children: [
      {
        path: '',
        component: Redirect, // 匹配到这里，Redirect 组件里面又会执行 router.replace 一次
      },
    ],
  },
];
