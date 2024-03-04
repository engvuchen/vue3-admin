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
    let isSilent = response.config.silent;

    console.log('🔎 ~ success response:', response);
    // 业务错误
    let code = response?.data?.code;
    if (!isSilent && code !== 0) ElMessage.error(errmap[code]);

    // token 缺失、过期、不能找到用户，返回登陆页
    if (code === errmap.TOKEN_ERR) {
      const redirect = encodeURIComponent(window.location.href);
      router.push(`/login?redirect=${redirect}`);
      useApp().clearToken();
    }

    return response.data;
  },
  async (error) => {
    let response = error?.response;
    console.log('🔎 ~ err response:', response);

    let isSilent = response.config.silent;
    // let isNetWorkErr = !code && response.status;
    // 网络错误 500 400
    if (!isSilent) ElMessage.error(`${response.config.url}: ${response.status}`);

    // console.dir(error) // 可在此进行错误上报
    // ElMessage.closeAll();

    return Promise.resolve({
      code: -1,
      error,
    });
  },
);

export default service;
