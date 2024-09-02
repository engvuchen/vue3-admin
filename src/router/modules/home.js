// home.js
const Layout = () => import('@/layout/index.vue');
const Home = () => import('@/views/home/index.vue');

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
        path: 'test',
        name: 'home',
        component: Home,
        meta: {
          title: 'route.homepage',
          affix: true,
        },
      },
    ],
  },
];
