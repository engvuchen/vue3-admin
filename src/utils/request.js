import axios from 'axios';
import router from '@/router';
import { useApp } from '@/pinia/modules/app';
import { useMenus } from '@/pinia/modules/menu';
import errmap from '@/common/errcode';
import tips from '@/utils/tips';
// import { HexMD5 } from '@/utils/hash';

const base = {
  baseURL: '/api',
  timeout: 5000,
  headers: {},
  // withCredentials: true, // 跨域请求发送 cookie；纯后端验证不需要，通过 authorization 头发送 token
};
// 请求缓存
const cacheMap = {};
// CGI 白名单，不校验 cgi 权限
const cgiWhiteList = ['/api/user/login', '/api/user/register', '/api/user/info', '/api/user/upd', '/api/resource/self'];

// 路由守卫 跳转时放弃未完成的缓存请求
router.beforeEach((to, from) => {
  Object.keys(cacheMap).forEach((key) => {
    let curr = cacheMap[key];
    if (!curr) return; // 响应拦截也有删除的，防一手

    // 取消未完成的请求
    if (!curr.fulfilled && curr.controller) {
      curr.controller.abort(); // 放弃进入"拦截响应"钩子，会删缓存
    }

    // 清理过期的缓存，防止内存泄漏
    if (curr.expired && curr.expired <= Date.now()) {
      delete cacheMap[key];
    }
  });

  return true;
});

/**
 * 判断是否为 GET 请求
 * @param {string} method - HTTP 方法
 * @returns {boolean} 是否为 GET 请求
 */
function isGet(method) {
  return (method || 'get').toLowerCase() === 'get';
}

// 生成请求的唯一标识符（仅用于 GET 请求的缓存）
const getRequestKey = (config) => {
  let { method, url, params, data } = config;
  // 在 normalizeParams 之后，GET 请求的 data 已转换为 params
  // 优先使用 params，如果没有则使用 data（兼容 normalizeParams 之前的状态）
  const keyParams = params || data;

  return [method, url, JSON.stringify(keyParams)].join('&');
};
/** 去掉数据的 undefined、null, '' */
function walkData(data) {
  if (Array.isArray(data)) {
    data = data.filter((curr) => ![undefined, null, ''].includes(curr));
  }

  Object.keys(data).forEach((key, index) => {
    let val = data[key];
    if ([undefined, null, ''].includes(val)) delete data[key];

    if (typeof val === 'object') walkData(val);
  });

  return data;
}

/**
 * 将 params 对象拼接到 URL
 * @param {string} url - 原始 URL
 * @param {object} params - 参数对象
 * @returns {string} 拼接后的 URL
 */
function appendParamsToUrl(url, params) {
  if (!params || Object.keys(params).length === 0) return url;

  const searchParams = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    const value = params[key];
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach((item) => searchParams.append(key, item));
      } else {
        searchParams.append(key, value);
      }
    }
  });

  const queryString = searchParams.toString();
  if (!queryString) return url;

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${queryString}`;
}

/**
 * 规范化参数处理
 * 1. GET 请求：将 data 转换为 params
 * 2. 非 GET 请求：将 params 拼接到 URL
 */
function normalizeParams(config) {
  const { method, data, params, url } = config;

  if (isGet(method)) {
    // GET 请求：将 data 转换为 params（params 优先级更高）
    if (data) {
      config.params = { ...data, ...params };
      delete config.data;
    }
    return;
  }

  // 非 GET 请求（POST、PUT、DELETE、PATCH等）：将 params 拼接到 URL
  if (!params) return;
  config.url = appendParamsToUrl(url, params);
  delete config.params;
}

const service = axios.create();

// 拦截请求-暂时没用到；主要 封装逻辑，区分了请求前
// service.interceptors.request.use(
//   (config) => config,
//   (error) => {
//     return Promise.reject(error);
//   },
// );

// 拦截响应
service.interceptors.response.use(
  // 正常响应，包括业务"错误"。status=200
  (response) => {
    // 只有 GET 请求才需要处理缓存
    if (isGet(response.config?.method)) {
      const requestKey = getRequestKey(response.config);
      const cache = cacheMap[requestKey];
      if (cache) cache.fulfilled = true;
    }

    let isSilent = response?.config?.silent;
    let code = response?.data?.code;
    if (!isSilent && code !== 0) tips.error(errmap[code] || response?.data?.msg || '未知错误');

    // token 缺失、过期、不能找到用户，返回登陆页
    if (code === errmap.TOKEN_ERR) {
      const redirect = encodeURIComponent(window.location.href);
      router.push(`/login?redirect=${redirect}`);
      useApp().clearToken();
    }

    return response.data;
  },
  // 网络错误 status=500/400，或请求被取消
  (error) => {
    console.log('network error', error);

    // 网路错误 或 请求被取消，删除缓存（只有 GET 请求才有缓存）
    if (isGet(error?.config?.method)) {
      let requestKey = getRequestKey(error.config);
      let cache = cacheMap[requestKey];
      if (cache) delete cacheMap[requestKey];
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

    return Promise.resolve({
      code: -1,
    });
  },
);

/** 显示报错信息、返回 -1 的 Promise.resolve */
function stop(config, errmsg) {
  if (errmsg) tips.error(errmsg);
  if (config.url) console.log('req url error', config.url);

  return Promise.resolve({
    code: -1,
    errmsg,
  });
}
/**
 *
 */
function validity(config) {
  const { url, params, data } = config;
  if (!url) return '缺少 url';

  if (params) walkData(params);
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

  // 规范化参数处理（在 validity 之前处理，因为需要先转换参数）
  normalizeParams(config);

  let errmsg = validity(config);
  if (errmsg) return stop(config, errmsg);

  // 处理缓存（仅 GET 请求）
  if (isGet(config.method)) {
    const requestKey = getRequestKey(config);

    const { data, expired } = cacheMap[requestKey] || {};
    if (data) {
      /**
       * 缓存未过期，直接返回
       * data 总是 Promise，直接返回即可
       */
      if (expired > Date.now()) return data;

      // 缓存过期，移除
      delete cacheMap[requestKey];
    }
  }

  // 发起请求
  const controller = new AbortController();
  config.signal = controller.signal;
  // 先触发前、后 2 个钩子。这里的传参会覆盖掉 axios create 传入的 config
  let promise = service({
    ...base,
    ...config,
  });

  /**
   * 请求分析：
   * A、B 串行
   * 1. A 完成后，B 才发起；- A已创建缓存。缓存有数据。- B 不发起请求
   * 2. A 未完成，B 就发起；- A已创建缓存。缓存无数据，B 等待 A 完成 - B 不发起请求
   *
   * A、B 并行：
   * 但JS是单线程的，还是有个先后处理，测试 Promise.all 请求不会发 2 遍；
   */

  // 创建缓存（仅存在 cacheTime、get 请求 ）
  if (config.cacheTime && isGet(config.method)) {
    const requestKey = getRequestKey(config);
    cacheMap[requestKey] = {
      controller, // 切换页面，用来取消的
      ...(config.cacheTime
        ? {
            data: promise,
            fulfilled: false,
            expired: Date.now() + config.cacheTime,
          }
        : {}),
    };
  }

  return promise;
}

export default request;
