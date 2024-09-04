import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '@/router';
import { useApp } from '@/pinia/modules/app';
import { useMenus } from '@/pinia/modules/menu';
import errmap from '@/common/errcode';
import tips from '@/utils/tips';
import { HexMD5 } from '@/utils/hash';

const cgiWhiteList = ['/api/user/login', '/api/user/register', '/api/user/info', '/api/user/upd', '/api/resource/self'];
// 2类，一类需要 token；一类不需要，但查自己的话，应该可以的

const pendingRequests = new Map(); // 用于存储正在进行的请求
// 生成请求的唯一标识符
const getRequestKey = (config) => {
  let { method, url, params, data } = config;

  // 响应后拦截，data 根据 contentType 发生变化：
  // json -> json字符串
  // formdata -> 保持不变

  if (Object.prototype.toString.call(data).slice(8, -1) === 'Object') {
    data = JSON.stringify(data);
  }

  return HexMD5.MD5([method, url, JSON.stringify(params), data].join('&')).toString(HexMD5.enc.Hex);
};

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
function stop(controller, config, errmsg) {
  if (errmsg) tips.error(errmsg);
  controller.abort();
  return config; // 直接 return 会报各种属性访问错误
}

const service = axios.create({
  baseURL: '/api',
  timeout: 10000,
  // withCredentials: true, // 跨域请求发送 cookie；纯后端验证不需要，通过 authorization 头发送 token
});
// 拦截请求
service.interceptors.request.use(
  (config) => {
    const controller = new AbortController();
    config.signal = controller.signal;

    if (!config.lessToken) {
      const { authorization } = useApp();
      if (authorization) {
        config.headers.Authorization = authorization;
      } else {
        return stop(controller, stop, '缺少 authorization');
      }
    }

    const requestKey = getRequestKey(config); // 可以考虑给这个路径、参数做一个 MD5
    // 如果这个请求已经存在，取消它
    if (pendingRequests.has(requestKey)) {
      const storeController = pendingRequests.get(requestKey);
      return stop(storeController, config);
    }
    // 添加新的请求
    pendingRequests.set(requestKey, controller);

    if (config.data) walkData(config.data);

    let url = config.url;
    if (!url) return stop(controller, config, `缺少 url`);

    let fullUrl = config.baseURL + url;
    // 白名单接口，不验证 token、接口权限、不添加 authorization
    if (cgiWhiteList.includes(fullUrl)) return config; // todo

    /**
     * 验证权限。路由跳转时，才进行 menus、cgi 的生成；
     * 1. 登陆之后跳 - 可以
     * 2. 页面直接刷新 - 也会发生路由导航，cgis 也会生成
     */
    let { cgis } = useMenus();
    if (!cgis.includes(fullUrl)) {
      return stop(controller, config, `接口缺少权限：${fullUrl}`);
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
    const requestKey = getRequestKey(response.config); // 再
    pendingRequests.delete(requestKey); // 请求完成，移除记录

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
    const requestKey = getRequestKey(error.config || {});
    pendingRequests.delete(requestKey); // 请求失败，也移除记录

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
