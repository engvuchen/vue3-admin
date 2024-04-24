import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '@/router';
import { useApp } from '@/pinia/modules/app';
import { useMenus } from '@/pinia/modules/menu';
import errmap from '@/common/errcode';
import tips from '@/utils/tips';

const cgiWhiteList = ['/user/login', '/user/register', '/user/upd', '/user/info', '/resource/self'];
// 去掉基本数据、对象、数组中，undefined、null 的值
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
    if (val === undefined || val === null) {
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
    const { authorization } = useApp();
    if (authorization) config.headers.Authorization = authorization;
    if (config.data) walkData(config.data);

    let url = config.url;
    if (!url) return config;
    if (cgiWhiteList.includes(url)) return config;

    /**
     * 路由跳转的时候，才会进行 menus、cgi 的生成；
     * 1. 登陆之后跳 - 可以
     * 2. 页面直接刷新 - 也会发生路由导航，cgis 也会生成
     */
    let { cgis } = useMenus();
    if (!cgis.includes(url)) {
      tips.error(`接口缺少权限：${url}`);
      return;
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
