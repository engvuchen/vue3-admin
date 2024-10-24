import axios from 'axios';
import router from '@/router';
import { useApp } from '@/pinia/modules/app';
import { useMenus } from '@/pinia/modules/menu';
import errmap from '@/common/errcode';
import tips from '@/utils/tips';
import { HexMD5 } from '@/utils/hash';

const base = {
  baseURL: '/api',
  timeout: 5000,
  headers: {},
  // withCredentials: true, // 跨域请求发送 cookie；纯后端验证不需要，通过 authorization 头发送 token
};
// 请求缓存
const cacheMap = {};
// CGI 白名单，不校验权限
const cgiWhiteList = ['/api/user/login', '/api/user/register', '/api/user/info', '/api/user/upd', '/api/resource/self'];

// 路由守卫 跳转时放弃未完成的请求
router.beforeEach((to, from) => {
  Object.values(cacheMap).forEach((curr) => {
    if (!curr.fullfilled) curr.controller.abort();
  });
  return true;
});

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
// 基本数据、对象、数组，去掉其中的 undefined、null, ''
function walkData(data) {
  if (Array.isArray(data)) {
    data = data.filter((curr) => ![undefined, null, ''].includes(curr));
  }

  Object.keys(data).forEach((key, index) => {
    let val = data[key];

    if ([undefined, null, ''].includes(val)) {
      delete data[key];
    }

    if (typeof val === 'object') walkData(val);
  });

  return data;
}

const service = axios.create();
// 拦截请求
service.interceptors.request.use(
  (config) => config,
  (error) => {
    return Promise.reject(error);
  },
);
// 拦截响应
service.interceptors.response.use(
  // 正常响应，包括业务“错误”。status=200
  (response) => {
    let isSilent = response?.config?.silent;
    let code = response?.data?.code;
    if (!isSilent && code !== 0) tips.error(errmap[code] || response?.data?.msg || '未知错误');

    // token 缺失、过期、不能找到用户，返回登陆页
    if (code === errmap.TOKEN_ERR) {
      const redirect = encodeURIComponent(window.location.href);
      router.push(`/login?redirect=${redirect}`);
      useApp().clearToken();
    }

    let requestKey = getRequestKey(response.config);
    let cache = cacheMap[requestKey];
    if (cache) {
      cache.fullfilled = true;
      if (!cache.data) delete cacheMap[requestKey]; // 请求完成，删除非缓存请求
    }

    return response.data;
  },
  // 网络错误 status=500/400，或请求被取消
  (error) => {
    console.log('network error', error);

    let requestKey = getRequestKey(error.config);
    let cache = cacheMap[requestKey];
    if (cache) {
      cache.fullfilled = true;
      if (!cache.data) delete cacheMap[requestKey]; // 请求完成，删除非缓存请求
    }

    if (error?.config?.silent) {
      return Promise.resolve({
        code: -1,
      });
    }

    if (error.code === 'ECONNABORTED') {
      tips.error(`${error.config?.url}: ${error.message}`);
    } else if (error.name !== 'CanceledError' && error?.response?.status) {
      // 非中止的请求，提示错误码
      tips.error(`${error.config?.url}: ${error.response.status}`);
    }

    // console.dir(error) // 可在此进行错误上报
    // tips.closeAll();

    return Promise.resolve({
      code: -1,
    });
  },
);

function stop(config, errmsg) {
  if (errmsg) tips.error(errmsg);
  if (config.url) console.log('req url error', config.url);

  return Promise.resolve({
    code: -1,
    errmsg,
  }); // 需 return config，否则会报各种属性访问错误
}

function validity(config) {
  const { url, data } = config;
  if (!url) return '缺少 url';
  if (data) walkData(data);

  // 需要 token，进行校验
  if (!config.withoutToken) {
    const { authorization } = useApp();
    if (!authorization) return '缺少 authorization';
    config.headers.Authorization = authorization;
  }
  // 非白名单接口，验证接口权限
  let fullUrl = config.baseURL + url;

  if (!cgiWhiteList.includes(fullUrl)) {
    /**
     * 验证权限。路由跳转时，才进行 menus、cgi 的生成；
     * 1. 登陆之后跳 - 可以
     * 2. 页面直接刷新 - 也会发生路由导航，menus、cgi 也会生成
     */
    let { cgis } = useMenus();
    if (!cgis.includes(fullUrl)) return `接口缺少权限：${fullUrl}`;
  }

  return false;
}

function request(config) {
  Object.assign(config, base);

  let errmsg = validity(config);
  if (errmsg) return stop(config, errmsg);

  // 处理缓存
  const requestKey = getRequestKey(config);
  const { data, expired, controller: storeController } = cacheMap[requestKey] || {};
  if (data) {
    // 缓存未过期，直接返回
    if (expired > Date.now()) {
      console.log('命中缓存', data, cacheMap[requestKey]);

      return Promise.resolve(data);
    }
    // 缓存过期，移除
    delete cacheMap[requestKey];
  }

  const controller = new AbortController();
  config.signal = controller.signal;

  let promise = service({
    ...base,
    ...config,
  }); // 先触发前、后 2 个钩子。这里的传参会覆盖掉 axios create 传入的 config

  /**
   * A、B 串行
   * 1. A 完成后，B 才发起；- A已创建缓存。缓存有数据。- B 不发起请求
   * 2. A 未完成，B 就发起；- A已创建缓存。缓存无数据，B 等待 A 完成 - B 不发起请求
   *
   * A、B 并行：都会有请求，都会设置缓存 - 无解
   */

  // 创建缓存
  if (!storeController) {
    cacheMap[requestKey] = {
      controller, // 切换页面，用来取消的
      ...(config.cacheTime
        ? {
            data: promise,
            expired: Date.now() + config.cacheTime,
            fullfilled: false,
          }
        : {}),
    };
  }

  return promise;
}

export default request;
