// home.js
const Layout = () => import('@/layout/index.vue');
const Home = () => import('@/views/home/index.vue');
const TDesignDemo = () => import('@/views/home/td.vue');

export default [
  {
    path: '/home',
    component: Layout,
    name: 'Dashboard',
    meta: {
      title: 'route.dashboard',
    },
    icon: 'icon-home',
    children: [
      {
        path: '',
        name: 'home',
        component: Home,
        meta: {
          title: 'route.homepage',
          affix: true,
        },
      },
      {
        path: '/td',
        name: 'TDesignDemo',
        component: TDesignDemo,
        meta: {
          title: 'TDesign 组件测试',
          affix: false,
        },
      },
    ],
  },
];
