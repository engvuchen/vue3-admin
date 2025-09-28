// self.js
const Layout = () => import('@/layout/index.vue');
const Self = () => import('@/views/self/index.vue');

export default [
  {
    path: '/self',
    component: Layout,
    hide: true,
    meta: {
      title: 'self.title',
    },
    icon: 'Setting', // 自定义 icon 或是 element 支持的 icon。按实现，甚至可以是 el-select,
    children: [
      {
        path: '',
        name: 'self',
        component: Self,
        meta: {
          title: 'self.title',
        },
      },
    ],
  },
];
