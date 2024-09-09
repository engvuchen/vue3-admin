import { createI18n } from 'vue-i18n';

const getMessage = (modules) => {
  let obj = {};
  modules.keys().forEach((key) => {
    // vite './locales/zh-cn/error.js' -> 'error'
    // webpack5
    // 1. './error.js' -> 'error'
    // 2. '/user/resource.js' -> '/user/resource'
    // https://juejin.cn/post/7194649442979577893

    let [, moduleName] = /[/]?([a-zA-Z/]+)[.]js/.exec(key);
    obj[moduleName] = modules(key).default;
  });

  return obj;
};

const messagesZhCn = require.context('./locales/zh-cn', true, /\.js$/);
const messagesEn = require.context('./locales/en', true, /\.js$/);

export default createI18n({
  legacy: false,
  globalInjection: true,
  locale: localStorage.getItem('__VEA__lang') || 'zh-cn',
  fallbackLocale: 'zh-cn',
  messages: {
    'zh-cn': getMessage(messagesZhCn),
    en: getMessage(messagesEn),
  },
});
