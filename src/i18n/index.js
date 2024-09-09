import { createI18n } from 'vue-i18n';

const getMessage = (modules) => {
  return Object.entries(modules).reduce((module, [path, mod]) => {
    // './locales/zh-cn/error.js' -> 'error'
    const moduleName = path.replace(/^\.\/locales\/[\w-]+\/(.*)\.\w+$/, '$1');
    module[moduleName] = mod.default;
    return module;
  }, {});
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
