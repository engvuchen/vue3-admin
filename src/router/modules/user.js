const Layout = () => /* webpackChunkName: "user" */ import('@/layout/index.vue');
const List = () => /* webpackChunkName: "user" */ import('@/views/user/list.vue');
const Role = () => /* webpackChunkName: "user" */ import('@/views/user/role.vue');
const Resource = () => /* webpackChunkName: "user" */ import('@/views/user/resource.vue');

export default [
  {
    path: '/user',
    component: Layout, // 路由都在这个 Layout 组件下
    icon: 'user',
    name: 'user',
    meta: {
      title: 'route.access_manage',
    },
    redirect: '/user/list',
    children: [
      {
        path: '/user/list',
        name: 'userList',
        component: List,
        meta: {
          title: 'route.user_manage',
        },
      },
      {
        path: '/user/role',
        name: 'userRole',
        component: Role,
        meta: {
          title: 'route.role_manage',
        },
      },
      {
        path: '/user/resource',
        name: 'userResource',
        component: Resource,
        meta: {
          title: 'route.resource_manage',
        },
      },
      {
        path: '/user/resource/list',
        // name: 'userResource',
        component: Resource,
        meta: {
          title: 'route.resource_manage',
        },
      },
    ],
  },
];
