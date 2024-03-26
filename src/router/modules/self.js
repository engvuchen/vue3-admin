// self.js
const Layout = () => import('@/layout/index.vue');
const Self = () => import('@/views/self/index.vue');

export default [
  {
    path: '/home',
    component: Layout,
    meta: {
      title: 'self.title',
    },
    icon: 'icon-home',
    children: [
      {
        path: '',
        name: 'self',
        component: Self,
        meta: {
          title: 'self.title',
          affix: true,
        },
      },
    ],
  },
];
