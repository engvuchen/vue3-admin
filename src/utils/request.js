import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '@/router';
import { useApp } from '@/pinia/modules/app';
import errmap from '@/common/errcode';

const service = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true,
});

// 拦截请求。默认添加 Authorization 请求头
service.interceptors.request.use(
  (config) => {
    const { authorization } = useApp();
    if (authorization) {
      config.headers.Authorization = authorization;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
// 拦截响应
service.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    let response = error?.response;

    let code = response?.body?.code;
    if (!response.config.silent) {
      ElMessage.error(errmap[code]);
    }

    if (code === errmap.TOKEN_ERR) {
      const redirect = encodeURIComponent(window.location.href);
      router.push(`/login?redirect=${redirect}`);
      useApp().clearToken();
    }

    // console.dir(error) // 可在此进行错误上报
    // ElMessage.closeAll();

    return Promise.reject(error);
  },
);

export default service;
