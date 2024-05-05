const Login = () => import('@/views/login/index.vue');

export default [
  {
    path: '/login',
    name: 'login',
    hide: true,
    component: Login,
  },
];
