import { useAccount } from '@/pinia/modules/account';

const checkUserinfo = (code, fullPath) => {
  const { userinfo } = useAccount();
  if (userinfo) {
    return `/error/${code === '404' ? fullPath : code}`;
  }
  return true;
};

const Layout = () => import('@/layout/index.vue');
const Error = () => import('@/views/error/index.vue');

export default [
  {
    path: '/error',
    component: Layout,
    hide: true,
    children: [
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
    ],
  },
  {
    path: '/:pathMatch(.*)',
    name: 'not-found',
    component: Error,
    hide: true,
    props: {
      error: '404',
    },
    beforeEnter(to) {
      return checkUserinfo('404', to.fullPath.replace('/', ''));
    },
  },
];
