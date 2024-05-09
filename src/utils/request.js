import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '@/router';
import { useApp } from '@/pinia/modules/app';
import { useMenus } from '@/pinia/modules/menu';
import errmap from '@/common/errcode';
import tips from '@/utils/tips';

const cgiWhiteList = ['/api/user/login', '/api/user/register', '/api/user/upd', '/api/user/info', '/api/resource/self'];
// 去掉基本数据、对象、数组中，undefined、null, '' 的值
function walkData(data) {
  let isArray = Array.isArray(data);

  // 先删掉数组中不需要的项
  if (isArray) {
    let delIndex = data.findIndex((curr) => curr === undefined || curr === null);
    while (delIndex !== -1) {
      data.splice(delIndex, 1);
      delIndex = data.findIndex((curr) => curr === undefined || curr === null);
    }
  }

  Object.keys(data).forEach((key, index) => {
    let val = data[key];

    if ([undefined, null, ''].includes(val)) {
      delete data[key];
    }

    if (val !== null && typeof val === 'object') {
      walkData(val);
    }
  });

  return data;
}

const service = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true, // 跨域请求发送 cookie
});
// 拦截请求
service.interceptors.request.use(
  (config) => {
    const controller = new AbortController();
    config.signal = controller.signal;

    const { authorization } = useApp();
    if (authorization) config.headers.Authorization = authorization;
    if (config.data) walkData(config.data);

    let url = config.url;
    let fullUrl = config.baseURL + url;

    if (!url) return config;
    if (cgiWhiteList.includes(fullUrl)) return config;

    /**
     * 路由跳转时，才进行 menus、cgi 的生成；
     * 1. 登陆之后跳 - 可以
     * 2. 页面直接刷新 - 也会发生路由导航，cgis 也会生成
     */
    let { cgis } = useMenus();
    if (!cgis.includes(fullUrl)) {
      tips.error(`接口缺少权限：${fullUrl}`);
      controller.abort();
      return config; // 不返回 config，也不会发起请求，但会报各种属性访问错误
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
// 拦截响应
service.interceptors.response.use(
  // 业务错误。status=200
  (response) => {
    let isSilent = response?.config?.silent;
    let code = response?.data?.code;
    if (!isSilent && code !== 0) ElMessage.error(errmap[code] || response?.data?.msg || '未知错误');

    // token 缺失、过期、不能找到用户，返回登陆页
    if (code === errmap.TOKEN_ERR) {
      const redirect = encodeURIComponent(window.location.href);
      router.push(`/login?redirect=${redirect}`);
      useApp().clearToken();
    }

    return response.data;
  },
  // 网络错误 status=500/400，或请求被取消
  async (error) => {
    console.log('network error', error);

    let response = error?.response;
    let isSilent = response?.config?.silent;
    if (!isSilent && response?.status) ElMessage.error(`${response?.config?.url}: ${response?.status}`);

    // console.dir(error) // 可在此进行错误上报
    // ElMessage.closeAll();

    return Promise.resolve({
      code: -1,
      error,
    });
  },
);

export default service;
