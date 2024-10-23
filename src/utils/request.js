import axios from 'axios';
import { ElMessage } from 'element-plus';
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
function stop(controller, config, errmsg) {
  if (errmsg) tips.error(errmsg);
  controller.abort();
  return { ...config, signal: controller.signal }; // 需 return config，否则会报各种属性访问错误
}
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
    const controller = new AbortController();

    const { url, cacheTime, data } = config;
    if (!url) return stop(controller, config, `缺少 url`);
    if (data) walkData(data);

    // 需要 token，进行校验
    if (!config.withoutToken) {
      const { authorization } = useApp();
      if (authorization) {
        config.headers.Authorization = authorization;
      } else {
        return stop(controller, config, '缺少 authorization');
      }
    }

    let fullUrl = config.baseURL + url;
    // 白名单接口，不验证接口权限
    if (cgiWhiteList.includes(fullUrl)) return config;

    /**
     * 验证权限。路由跳转时，才进行 menus、cgi 的生成；
     * 1. 登陆之后跳 - 可以
     * 2. 页面直接刷新 - 也会发生路由导航，cgis 也会生成
     */
    let { cgis } = useMenus();
    if (!cgis.includes(fullUrl)) {
      return stop(controller, config, `接口缺少权限：${fullUrl}`);
    }

    // 处理缓存
    if (cacheTime) {
      const requestKey = getRequestKey(config);
      // 如果有缓存数据并且未过期
      const { cache, timestamp, controller: storeController } = cacheMap.get(requestKey) || { cache: 0 };

      if (cache === 0) {
        cacheMap.set(requestKey, {
          cache: undefined,
          timestamp: Date.now() + cacheTime,
          controller,
        });
      } else if (cache === undefined) {
        // 已有请求中的数据 todo
        return stop(storeController, config, '');
      } else {
        if (Date.now() - timestamp < cacheTime) {
          console.log('有缓存', cacheTime);

          return stop(storeController, config, ''); // 缓存，存在，预期是取消吗？return config 才能走到 response
        } else {
          cacheMap.delete(requestKey); // 缓存过期，移除
        }
      }
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

    console.log('response.config.cacheTime', response.config.cacheTime, cacheMap);

    if (response.config.cacheTime) {
      cacheMap.get(getRequestKey(response.config)).cache = response.data;
    }

    return response.data;
  },
  // 网络错误 status=500/400，或请求被取消
  (error) => {
    // console.log('service', service); 这个不是接口
    console.log('network error', error);

    let response = error?.response;

    if (error.name === 'CanceledError') {
      let { cache, ignore } = cacheMap.get(getRequestKey(error.config)).cache;
      if (!ignore && cache) {
        return Promise.resolve(cache);
      }
    }

    if (!response?.config?.silent && response?.status) ElMessage.error(`${response?.config?.url}: ${response?.status}`);

    // console.dir(error) // 可在此进行错误上报
    // ElMessage.closeAll();

    return Promise.resolve({
      code: -1,
      error,
    });
  },
);

function request(options) {
  let promise = service(options); // 走完 前、后 2 个钩子，才到这里的处理

  const { cacheTime } = options;
  if (cacheTime) {
    // 如果有缓存数据并且未过期
    const { cache } = cacheMap.get(getRequestKey(options)) || { cache: 0 };
    if (cache === undefined) {
      // 已有请求中的数据
      return promise.then((data) => data);
    }
  }

  return promise;
}

export default request;
