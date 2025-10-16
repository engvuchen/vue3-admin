import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);

// 国际化
import i18n from '@/i18n';

// Element Plus 图标按需导入（通过 unplugin-vue-components 自动处理）
// 不再需要手动注册图标

// 引入路由
import router from './router';

// 引入pinia
import pinia from './pinia';

// 权限控制
import './permission';

// 自定义图标：引入svg图标注册脚本
import 'virtual:svg-icons-register'; // vite
// import './icon.js'; // webpack5

// 注册全局组件
import * as Components from './global-components';
Object.entries(Components).forEach(([key, component]) => {
  app.component(key, component);
});

// 全局注册 ele 图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// 注册自定义指令
import * as Directives from '@/directive';
Object.values(Directives).forEach((fn) => fn(app));

// 错误日志
import useErrorHandler from './error-log';
useErrorHandler(app);

// 按需导入，不再需要全量引入 ElementPlus 和 TDesign
app.use(i18n).use(pinia).use(router).mount('#app');
