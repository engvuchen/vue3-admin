/**
 * 1. 用户管理
 * 查询: username id
 * 用户、角色 | 修改 删除
 * 查询、修改、删除
 *
 * 2. 角色管理
 * 角色，资源 | 修改
 *
 * 3 资源管理
 * 名称 页面路径 接口路径 | 修改
 *
 * user > role_id list > role_id list > resource_id
 */

const Layout = () => import('@/layout/index.vue');
const List = () => import('@/views/user/list.vue');
const Role = () => import('@/views/user/role.vue');
const Resource = () => import('@/views/user/resource.vue');

export default [
  {
    path: '/user',
    component: Layout, // 字路由都在这个排版下（顶栏、侧栏）
    icon: 'Location',
    name: 'user',
    meta: {
      title: '权限管理',
    },
    children: [
      {
        path: '/user/list',
        name: 'userList',
        component: List,
        meta: {
          title: '用户管理',
        },
      },
      {
        path: '/user/role',
        name: 'userRole',
        component: Role,
        meta: {
          title: '角色管理',
        },
      },
      {
        path: '/user/resource',
        name: 'userResource',
        component: Resource,
        meta: {
          title: '资源管理',
        },
      },
    ],
  },
];
