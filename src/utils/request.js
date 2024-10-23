import axios from 'axios';
import router from '@/router';
import { useApp } from '@/pinia/modules/app';
import { useMenus } from '@/pinia/modules/menu';
import errmap from '@/common/errcode';
import tips from '@/utils/tips';
import { HexMD5 } from '@/utils/hash';

// CGI 白名单，不校验权限
const cgiWhiteList = ['/api/user/login', '/api/user/register', '/api/user/info', '/api/user/upd', '/api/resource/self'];

const cacheMap = {}; // 存储正在进行的请求
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
// 中断请求
// function stop(controller, config, errmsg) {
//   if (errmsg) tips.error(errmsg);
//   if (config.url) console.log('req url error', url);
//   controller.abort();
//   return { ...config, signal: controller.signal }; // 需 return config，否则会报各种属性访问错误
// }
// 基本数据、对象、数组，去掉其中的 undefined、null, ''
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
  timeout: 5000,
  // withCredentials: true, // 跨域请求发送 cookie；纯后端验证不需要，通过 authorization 头发送 token
});
// 拦截请求
service.interceptors.request.use(
  (config) => {
    // const controller = new AbortController();

    // const { url, cacheTime, data } = config;
    // if (!url) return stop(controller, config, `缺少 url`);
    // if (data) walkData(data);

    // // 需要 token，进行校验
    // if (!config.withoutToken) {
    //   const { authorization } = useApp();
    //   if (!authorization) return stop(controller, config, '缺少 authorization');
    //   config.headers.Authorization = authorization;
    // }
    // // 非白名单接口，验证接口权限
    // let fullUrl = config.baseURL + url;
    // if (!cgiWhiteList.includes(fullUrl)) {
    //   /**
    //    * 验证权限。路由跳转时，才进行 menus、cgi 的生成；
    //    * 1. 登陆之后跳 - 可以
    //    * 2. 页面直接刷新 - 也会发生路由导航，menus、cgi 也会生成
    //    */
    //   let { cgis } = useMenus();
    //   if (!cgis.includes(fullUrl)) return stop(controller, config, `接口缺少权限：${fullUrl}`);
    // }

    // // 处理缓存
    // if (cacheTime) {
    //   const requestKey = getRequestKey(config);
    //   // 如果有缓存数据并且未过期
    //   const { cache, expired, controller: storeController } = cacheMap.get(requestKey) || { cache: 0 };

    //   if (cache === 0) {
    //     cacheMap.set(requestKey, {
    //       cache: undefined,
    //       expired: Date.now() + cacheTime,
    //       controller,
    //     });
    //   } else if (cache === undefined) {
    //     // 已有请求中的数据 todo
    //     return stop(storeController, config, '');
    //   } else {
    //     if (Date.now() - expired < cacheTime) {
    //       console.log('有缓存', cacheTime);

    //       return stop(storeController, config, ''); // 缓存，存在，预期是取消吗？return config 才能走到 response
    //     } else {
    //       delete cacheMap[requestKey]; // 缓存过期，移除
    //     }
    //   }
    // }

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
    if (!isSilent && code !== 0) tips.error(errmap[code] || response?.data?.msg || '未知错误');

    // token 缺失、过期、不能找到用户，返回登陆页
    if (code === errmap.TOKEN_ERR) {
      const redirect = encodeURIComponent(window.location.href);
      router.push(`/login?redirect=${redirect}`);
      useApp().clearToken(); // ⬜ 守卫移除请求
    }

    cacheMap.get(getRequestKey(response.config)).fullfilled = true;

    return response.data;
  },
  // 网络错误 status=500/400，或请求被取消
  (error) => {
    console.log('network error', error);

    let response = error?.response;

    let requestKey = getRequestKey(response.config);
    let cache = cacheMap.get();
    cache.fullfilled = true;
    // 请求完成，删除非缓存请求
    if (!cache.data) {
      delete cacheMap[requestKey];
    }

    // 非中止、沉默的请求，提示错误信息
    if (error.name !== 'CanceledError' && !response?.config?.silent && response?.status) {
      tips.error(`${response?.config?.url}: ${response?.status}`);
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
    if (!cgis.includes(fullUrl)) return stop(config, `接口缺少权限：${fullUrl}`);
  }

  return false;
}

function request(config) {
  /**
   * 这里做请求拦截
   * 1. 看不到被取消的请求
   */

  let errmsg = validity(config);
  if (errmsg) return stop(config, errmsg);

  // 处理缓存
  const requestKey = getRequestKey(config);
  const { data, expired, controller: storeController } = cacheMap.get(requestKey) || {};
  if (data) {
    // 有缓存数据且未过期，直接返回
    if (expired > Date.now()) return Promise.resolve(data); // todo 网络看不到
    // 缓存过期，移除
    delete cacheMap[requestKey];
  }

  const controller = new AbortController();
  config.signal = controller.signal;

  let promise = service(config); // 先触发前、后 2 个钩子

  /**
   * A、B 串行
   * 1. A 完成后，B 才发起；- A已创建缓存。缓存有数据。- B 不发起请求
   * 2. A 未完成，B 就发起；- A已创建缓存。缓存无数据，B 等待 A 完成 - B 不发起请求
   *
   * A、B 并行：都会有请求，都会设置缓存 - 无解
   */

  if (!storeController) {
    cacheMap.set(requestKey, {
      controller, // 切换页面，用来取消的
      // ---
      ...(config.cacheTime
        ? {
            data: promise, // ⬜ 这里可以是 promise
            expired: Date.now() + config.cacheTime,
            fullfilled: false,
          }
        : {}),
    });
  }

  return promise;
}

export default request;

export { cacheMap };
